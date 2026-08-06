import { Hono, type Context, type Env } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AdminEnv, Bindings } from '../types';
import type { Admin } from '../db/schema';
import {
  countAdmins,
  createAdmin,
  createQuestion,
  createQuestions,
  dashboardStats,
  deactivateAllQuestions,
  getAdmin,
  getAdminByEmail,
  getDb,
  getPromoter,
  getPromoterPhoto,
  getQuestion,
  getSettings,
  listAdmins,
  listAnswersForAttempts,
  listAttempts,
  listAttemptsForPromoter,
  listPromoters,
  listQuestions,
  nextOrderIndex,
  photoUpdatedAt,
  toggleQuestion,
  touchAdminLogin,
  updateQuestion,
  updateSettings,
  type AttemptFilter,
} from '../db/queries';
import {
  adminInviteSchema,
  adminLoginSchema,
  adminSetupSchema,
  fieldErrors,
  importErrors,
  questionImportSchema,
  questionSchema,
  rawQuestionValues,
  settingsSchema,
} from '../lib/validators';
import { clearAdminCookie, getAdminId, secretMatches, setAdminCookie } from '../lib/session';
import { hashPassword, verifyPassword } from '../lib/password';
import { toSlidesEmbed, toVideoEmbed } from '../lib/drive';
import { normalizePhone } from '../lib/phone';
import { LoginPage } from '../pages/admin/LoginPage';
import { SetupPage } from '../pages/admin/SetupPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { AttemptsPage } from '../pages/admin/AttemptsPage';
import { PromotersPage } from '../pages/admin/PromotersPage';
import { PromoterPage } from '../pages/admin/PromoterPage';
import { QuestionsPage } from '../pages/admin/QuestionsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';

const app = new Hono<AdminEnv>();

// zValidator hooks lose the Env generic, so bindings are reached through here.
const dbOf = (c: { env: unknown }) => getDb((c.env as Bindings).DB);

/**
 * The signed-in account, for the zValidator hooks — they cannot see
 * `c.get('admin')` for the same reason they cannot see `c.env`. One extra read,
 * on the validation-failure path only, and the guard has already run so the row
 * is certain to be there.
 */
async function adminOf<E extends Env>(c: Context<E>): Promise<Admin> {
  const adminId = await getAdminId(c);
  return (await getAdmin(dbOf(c), adminId!))!;
}

const ATTEMPT_WINDOW = 200;

/* ------------------------------------------------------------------- guard */

const PUBLIC = new Set(['/admin/login', '/admin/setup']);

/**
 * Named accounts, checked on every request. The cookie holds an admin id and is
 * signed, but a signature only proves the id was issued here — the row is
 * loaded so a deleted account cannot keep browsing on an old cookie, and so
 * every screen can say who is signed in.
 */
app.use('*', async (c, next) => {
  if (PUBLIC.has(c.req.path)) return next();

  const adminId = await getAdminId(c);
  const admin = adminId ? await getAdmin(dbOf(c), adminId) : undefined;
  if (!admin) {
    clearAdminCookie(c);
    return c.redirect('/admin/login');
  }

  c.set('admin', admin);
  await next();
});

/* ---------------------------------------------------------------- sign in */

/** No accounts yet means first run: offer to create one instead of a dead form. */
app.get('/login', async (c) => {
  const db = dbOf(c);
  if ((await countAdmins(db)) === 0) return c.redirect('/admin/setup');

  // Already signed in: this screen has nothing to offer.
  const adminId = await getAdminId(c);
  if (adminId && (await getAdmin(db, adminId))) return c.redirect('/admin');

  return c.html(<LoginPage />);
});

app.post(
  '/login',
  zValidator('form', adminLoginSchema, (result, c) => {
    if (!result.success) {
      const raw = result.data as unknown as Record<string, string>;
      return c.html(
        <LoginPage values={{ email: raw?.email ?? '' }} errors={fieldErrors(result.error)} />,
        400,
      );
    }
  }),
  async (c) => {
    const { email, password } = c.req.valid('form');
    const db = dbOf(c);
    const admin = await getAdminByEmail(db, email);

    // One message for both failures — "no such email" is how accounts get
    // enumerated. The hash is still verified against a dummy when the account
    // is missing so the two paths take comparable time.
    const ok = admin
      ? await verifyPassword(password, admin.passwordHash)
      : await verifyPassword(password, await hashPassword(crypto.randomUUID()));

    if (!admin || !ok) {
      return c.html(
        <LoginPage values={{ email }} error="That email and password do not match an account." />,
        401,
      );
    }

    await touchAdminLogin(db, admin.id);
    await setAdminCookie(c, admin.id);
    return c.redirect('/admin');
  },
);

/* ------------------------------------------------------------- first admin */

app.get('/setup', async (c) => {
  if ((await countAdmins(dbOf(c))) > 0) return c.redirect('/admin/login');
  return c.html(<SetupPage />);
});

app.post(
  '/setup',
  zValidator('form', adminSetupSchema, (result, c) => {
    if (!result.success) {
      const raw = result.data as unknown as Record<string, string>;
      return c.html(
        <SetupPage
          values={{ name: raw.name, email: raw.email }}
          errors={fieldErrors(result.error)}
        />,
        400,
      );
    }
  }),
  async (c) => {
    const db = dbOf(c);
    const { name, email, password, setupKey } = c.req.valid('form');

    // Both conditions matter: the key proves this deployment is yours, and the
    // count stops the form working twice.
    if ((await countAdmins(db)) > 0) return c.redirect('/admin/login');

    if (!(await secretMatches(setupKey, c.env.ADMIN_PASSCODE))) {
      return c.html(
        <SetupPage
          values={{ name, email }}
          errors={{ setupKey: 'That is not this deployment’s setup key.' }}
        />,
        401,
      );
    }

    const admin = await createAdmin(db, {
      name,
      email,
      passwordHash: await hashPassword(password),
    });

    await touchAdminLogin(db, admin.id);
    await setAdminCookie(c, admin.id);
    return c.redirect('/admin');
  },
);

app.post('/logout', (c) => {
  clearAdminCookie(c);
  return c.redirect('/admin/login');
});

/* ---------------------------------------------------------------- overview */

const FILTERS: AttemptFilter[] = ['all', 'passed', 'failed', 'in-progress'];

const filterOf = (c: Context<AdminEnv>): AttemptFilter => {
  const raw = c.req.query('filter') as AttemptFilter | undefined;
  return raw && FILTERS.includes(raw) ? raw : 'all';
};

/** The overview is sized to one screen: the latest few attempts, nothing more. */
const OVERVIEW_ROWS = 6;

app.get('/', async (c) => {
  const db = dbOf(c);
  const [stats, rows] = await Promise.all([
    dashboardStats(db),
    listAttempts(db, OVERVIEW_ROWS, 0, 'all'),
  ]);

  return c.html(<DashboardPage admin={c.get('admin')} stats={stats} rows={rows} />);
});

/* ---------------------------------------------------------------- attempts */

app.get('/attempts', async (c) => {
  const filter = filterOf(c);
  const rows = await listAttempts(dbOf(c), ATTEMPT_WINDOW, 0, filter);

  return c.html(
    <AttemptsPage admin={c.get('admin')} rows={rows} filter={filter} limit={ATTEMPT_WINDOW} />,
  );
});

/* --------------------------------------------------------------- promoters */

app.get('/promoters', async (c) => {
  const search = (c.req.query('q') ?? '').trim();
  const rows = await listPromoters(dbOf(c), { search: search || undefined });

  return c.html(<PromotersPage admin={c.get('admin')} rows={rows} search={search || undefined} />);
});

/** The same bytes the agent uploaded, behind the admin guard. */
app.get('/promoters/:id/photo', async (c) => {
  const photo = await getPromoterPhoto(dbOf(c), c.req.param('id'));
  if (!photo) return c.notFound();

  return c.body(photo.data, 200, {
    'Content-Type': photo.mime,
    'Cache-Control': 'private, max-age=604800',
  });
});

app.get('/promoters/:id', async (c) => {
  const db = dbOf(c);
  const promoter = await getPromoter(db, c.req.param('id'));
  if (!promoter) return c.notFound();

  const attempts = await listAttemptsForPromoter(db, promoter.id);
  const [answersByAttempt, photoAt] = await Promise.all([
    listAnswersForAttempts(
      db,
      attempts.map((a) => a.id),
    ),
    photoUpdatedAt(db, promoter.id),
  ]);

  return c.html(
    <PromoterPage
      admin={c.get('admin')}
      promoter={promoter}
      attempts={attempts}
      answersByAttempt={answersByAttempt}
      photoAt={photoAt}
    />,
  );
});

/* ----------------------------------------------------------------- questions */

async function questionsPage(
  c: Context<AdminEnv>,
  extra: Partial<Parameters<typeof QuestionsPage>[0]> = {},
) {
  const db = dbOf(c);
  const questions = await listQuestions(db);
  const editId = c.req.query('edit');
  const imported = c.req.query('imported');

  return (
    <QuestionsPage
      admin={c.get('admin')}
      questions={questions}
      editing={editId ? questions.find((q) => q.id === editId) : undefined}
      notice={
        imported
          ? `Imported ${imported} ${imported === '1' ? 'question' : 'questions'}.`
          : c.req.query('saved')
            ? 'Saved.'
            : undefined
      }
      {...extra}
    />
  );
}

app.get('/questions', async (c) => c.html(await questionsPage(c)));

app.post(
  '/questions',
  zValidator('form', questionSchema, async (result, c) => {
    if (!result.success) {
      const questions = await listQuestions(dbOf(c));
      return c.html(
        <QuestionsPage
          admin={await adminOf(c)}
          questions={questions}
          values={rawQuestionValues(result.data as unknown as Record<string, string>)}
          errors={fieldErrors(result.error)}
        />,
        400,
      );
    }
  }),
  async (c) => {
    await createQuestion(dbOf(c), c.req.valid('form'));
    return c.redirect('/admin/questions?saved=1');
  },
);

/**
 * Bulk import.
 *
 * Registered above `/questions/:id` on purpose: Hono matches in registration
 * order, and the other way round this POST lands in the single-question editor
 * with id="import" and fails validation instead of importing anything.
 *
 * The file is parsed, validated whole, and only then written — a partial import
 * leaves an admin unable to tell what landed.
 */
app.post('/questions/import', async (c) => {
  const db = dbOf(c);
  const body = await c.req.parseBody();

  const file = body['file'];
  const pasted = typeof body['json'] === 'string' ? body['json'] : '';
  // The upload wins when both are given: somebody who attached a file meant it.
  const raw = file instanceof File && file.size > 0 ? await file.text() : pasted;

  const page = (errors: string[]) =>
    questionsPage(c, { importJson: pasted, importErrors: errors });

  if (!raw.trim()) return c.html(await page(['Paste the JSON or choose a file first.']), 400);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    // Overwhelmingly a markdown fence the model added, so name that first.
    return c.html(
      await page([
        `That is not valid JSON: ${(error as Error).message}.`,
        'If your assistant wrapped it in ```json … ```, delete those lines and try again.',
      ]),
      400,
    );
  }

  const result = questionImportSchema.safeParse(parsed);
  if (!result.success) return c.html(await page(importErrors(result.error)), 400);

  if (body['deactivateExisting'] === 'on') await deactivateAllQuestions(db);

  const start = await nextOrderIndex(db);
  const count = await createQuestions(
    db,
    result.data.questions.map((q, i) => ({
      prompt: q.question,
      options: q.options,
      // Matched case-insensitively by the schema, so find it the same way.
      correctIndex: q.options.findIndex((o) => o.toLowerCase() === q.answer.toLowerCase()),
      orderIndex: start + i,
      isCritical: q.critical,
      isActive: true,
    })),
  );

  return c.redirect(`/admin/questions?imported=${count}`);
});

app.post(
  '/questions/:id',
  zValidator('form', questionSchema, async (result, c) => {
    if (!result.success) {
      const db = dbOf(c);
      const [questions, editing] = await Promise.all([
        listQuestions(db),
        getQuestion(db, c.req.param('id') ?? ''),
      ]);
      return c.html(
        <QuestionsPage
          admin={await adminOf(c)}
          questions={questions}
          editing={editing}
          values={rawQuestionValues(result.data as unknown as Record<string, string>)}
          errors={fieldErrors(result.error)}
        />,
        400,
      );
    }
  }),
  async (c) => {
    await updateQuestion(dbOf(c), c.req.param('id'), c.req.valid('form'));
    return c.redirect('/admin/questions?saved=1');
  },
);

app.post('/questions/:id/toggle', async (c) => {
  await toggleQuestion(dbOf(c), c.req.param('id'));
  return c.redirect('/admin/questions');
});

/* ------------------------------------------------------------------ settings */

/** Settings is two forms on one page, so every render of it needs both. */
async function settingsPage(
  c: Context<AdminEnv>,
  extra: Partial<Parameters<typeof SettingsPage>[0]> = {},
) {
  const db = dbOf(c);
  const [settings, admins] = await Promise.all([getSettings(db), listAdmins(db)]);
  return (
    <SettingsPage
      admin={c.get('admin')}
      settings={settings}
      admins={admins}
      notice={c.req.query('saved') ? 'Saved.' : undefined}
      {...extra}
    />
  );
}

app.get('/settings', async (c) => c.html(await settingsPage(c)));

app.post(
  '/settings',
  zValidator('form', settingsSchema, async (result, c) => {
    if (!result.success) {
      const db = dbOf(c);
      const [settings, admins] = await Promise.all([getSettings(db), listAdmins(db)]);
      return c.html(
        <SettingsPage
          admin={await adminOf(c)}
          settings={settings}
          admins={admins}
          errors={fieldErrors(result.error)}
        />,
        400,
      );
    }
  }),
  async (c) => {
    const db = dbOf(c);
    const input = c.req.valid('form');

    // Admins paste normal share links; we store the embed URL so /learn does no
    // parsing at render. Reject anything else by name, not with a generic error.
    const errors: Record<string, string> = {};
    const slidesUrl = input.slidesUrl ? toSlidesEmbed(input.slidesUrl) : null;
    const videoUrl = input.videoUrl ? toVideoEmbed(input.videoUrl) : null;

    // The support number is stored in the same +234 form as a promoter's, so
    // the Support screen can format it with the same helper.
    const supportPhone = input.supportPhone ? normalizePhone(input.supportPhone) : null;

    if (input.slidesUrl && !slidesUrl) {
      errors.slidesUrl = 'Expected a link like https://docs.google.com/presentation/d/<ID>/edit';
    }
    if (input.videoUrl && !videoUrl) {
      errors.videoUrl = 'Expected a link like https://drive.google.com/file/d/<ID>/view';
    }
    if (input.supportPhone && !supportPhone) {
      errors.supportPhone = 'That does not look like a Nigerian number. Try 08012345678.';
    }

    if (Object.keys(errors).length > 0) {
      const [settings, admins] = await Promise.all([getSettings(db), listAdmins(db)]);
      return c.html(
        <SettingsPage
          admin={c.get('admin')}
          settings={{
            ...settings,
            passMark: input.passMark,
            minTutorialSeconds: input.minTutorialSeconds,
          }}
          admins={admins}
          values={{
            slidesUrl: input.slidesUrl,
            videoUrl: input.videoUrl,
            supportPhone: input.supportPhone,
            supportEmail: input.supportEmail,
          }}
          errors={errors}
        />,
        400,
      );
    }

    await updateSettings(db, {
      slidesUrl,
      videoUrl,
      passMark: input.passMark,
      minTutorialSeconds: input.minTutorialSeconds,
      supportPhone,
      supportEmail: input.supportEmail || null,
    });

    return c.redirect('/admin/settings?saved=1');
  },
);

/* ---------------------------------------------------------------------- team */

app.post(
  '/team',
  zValidator('form', adminInviteSchema, async (result, c) => {
    if (!result.success) {
      const db = dbOf(c);
      const raw = result.data as unknown as Record<string, string>;
      const [settings, admins] = await Promise.all([getSettings(db), listAdmins(db)]);
      return c.html(
        <SettingsPage
          admin={await adminOf(c)}
          settings={settings}
          admins={admins}
          teamValues={{ name: raw?.name, email: raw?.email }}
          teamErrors={fieldErrors(result.error)}
        />,
        400,
      );
    }
  }),
  async (c) => {
    const db = dbOf(c);
    const { name, email, password } = c.req.valid('form');

    if (await getAdminByEmail(db, email)) {
      return c.html(
        await settingsPage(c, {
          teamValues: { name, email },
          teamErrors: { email: 'Somebody already signs in with that email.' },
        }),
        400,
      );
    }

    await createAdmin(db, { name, email, passwordHash: await hashPassword(password) });
    return c.redirect('/admin/settings?saved=1');
  },
);

export default app;
