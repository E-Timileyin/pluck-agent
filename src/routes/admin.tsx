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
  getAttempt,
  getAttemptWithPromoter,
  getDb,
  getPromoter,
  getPromoterPhoto,
  getQuestion,
  getSettings,
  importAgents,
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
  agentImportErrors,
  agentImportSchema,
  agentSchema,
  fieldErrors,
  importErrors,
  questionImportSchema,
  questionSchema,
  rawQuestionValues,
  settingsSchema,
} from '../lib/validators';
import { parseAgentRoster, parseAgentRosterWorkbook } from '../lib/agentFormat';
import { clearAdminCookie, getAdminId, secretMatches, setAdminCookie } from '../lib/session';
import { hashPassword, verifyPassword } from '../lib/password';
import { normalizePhone } from '../lib/phone';
import { checkVideo, serveVideoRange, videoKeyFor } from '../lib/video';
import { LoginPage } from '../pages/admin/LoginPage';
import { SetupPage } from '../pages/admin/SetupPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { AttemptsPage } from '../pages/admin/AttemptsPage';
import { PromotersPage } from '../pages/admin/PromotersPage';
import { AgentImportPage } from '../pages/admin/AgentImportPage';
import { PromoterPage } from '../pages/admin/PromoterPage';
import { QuestionsPage } from '../pages/admin/QuestionsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { CertificatePage } from '../pages/results/CertificatePage';

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
      // The account /admin/setup creates is the only one with no invitee — it
      // is the super admin, the one who can create every account after it.
      isSuperAdmin: true,
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

async function promotersPage(
  c: Context<AdminEnv>,
  extra: Partial<Parameters<typeof PromotersPage>[0]> = {},
) {
  const search = (c.req.query('q') ?? '').trim();
  const rows = await listPromoters(dbOf(c), { search: search || undefined });
  const imported = c.req.query('imported');

  return (
    <PromotersPage
      admin={c.get('admin')}
      rows={rows}
      search={search || undefined}
      notice={
        imported
          ? `Imported ${imported} ${imported === '1' ? 'sales agent' : 'sales agents'}.`
          : undefined
      }
      {...extra}
    />
  );
}

app.get('/promoters', async (c) => c.html(await promotersPage(c)));

/**
 * Add sales agents: one by hand, or the whole roster from a file.
 *
 * Registered above `/promoters/:id` on purpose, same reason as the questions
 * import: Hono matches in registration order, and the other way round these
 * routes would land in the single-promoter lookup with id="import".
 */
async function agentImportPage(
  c: Context<AdminEnv>,
  extra: Partial<Parameters<typeof AgentImportPage>[0]> = {},
) {
  return (
    <AgentImportPage
      admin={c.get('admin')}
      notice={c.req.query('saved') ? 'Added.' : undefined}
      {...extra}
    />
  );
}

app.get('/promoters/import', async (c) => c.html(await agentImportPage(c)));

/** One agent, added by hand — for a single new hire or a quick correction. */
app.post(
  '/promoters',
  zValidator('form', agentSchema, async (result, c) => {
    if (!result.success) {
      const raw = result.data as unknown as Record<string, string>;
      return c.html(
        <AgentImportPage
          admin={await adminOf(c)}
          singleValues={{
            agentId: raw?.agentId,
            name: raw?.name,
            email: raw?.email,
            phone: raw?.phone,
          }}
          singleErrors={fieldErrors(result.error)}
        />,
        400,
      );
    }
  }),
  async (c) => {
    await importAgents(dbOf(c), [c.req.valid('form')]);
    return c.redirect('/admin/promoters/import?saved=1');
  },
);

/**
 * Bulk upload — the whole sheet at once, exported from the main app.
 * Parsed and validated whole before anything is written — a half-imported
 * roster leaves an admin unable to tell who is missing.
 */
app.post('/promoters/import', async (c) => {
  const db = dbOf(c);
  const body = await c.req.parseBody();

  const file = body['file'];
  const isSpreadsheet =
    file instanceof File &&
    (/\.xlsx?$/i.test(file.name) ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel');

  const page = (errors: string[]) => agentImportPage(c, { importErrors: errors });

  if (!(file instanceof File) || file.size === 0) {
    return c.html(await page(['Choose a file first.']), 400);
  }

  const { rows, error } = isSpreadsheet
    ? parseAgentRosterWorkbook(await file.arrayBuffer())
    : parseAgentRoster(await file.text());
  if (error) return c.html(await page([error]), 400);

  const result = agentImportSchema.safeParse({ agents: rows });
  if (!result.success) return c.html(await page(agentImportErrors(result.error)), 400);

  const seen = new Set<string>();
  for (const row of result.data.agents) {
    if (seen.has(row.agentId)) {
      return c.html(
        await page([`Sales Agent ID ${row.agentId} appears more than once in this import.`]),
        400,
      );
    }
    seen.add(row.agentId);
  }

  const count = await importAgents(db, result.data.agents);
  return c.redirect(`/admin/promoters?imported=${count}`);
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

/* --------------------------------------------------------------- certificate */

/**
 * Sample data, not a real record — lets an admin check the certificate design
 * without needing an actual passed attempt sitting around.
 */
app.get('/certificate/preview', (c) =>
  c.html(
    <CertificatePage
      certificateId="00000000-0000-0000-0000-000000000000"
      promoterName="Jane Doe"
      tier="SP3"
      score={18}
      total={20}
      percent={90}
      issuedAt={new Date().toISOString()}
      backHref="/admin/settings"
      backLabel="Back to settings"
      isSample
    />,
  ),
);

/** The same certificate a promoter sees for their own passed attempt. */
app.get('/certificate/:attemptId', async (c) => {
  const db = dbOf(c);
  const attempt = await getAttempt(db, c.req.param('attemptId'));
  if (!attempt || !attempt.passed) return c.notFound();

  const row = await getAttemptWithPromoter(db, attempt.id);
  if (!row || !attempt.submittedAt) return c.notFound();

  return c.html(
    <CertificatePage
      certificateId={attempt.id}
      promoterName={row.promoter.name}
      tier={row.promoter.tier}
      score={attempt.score ?? 0}
      total={attempt.total ?? 0}
      percent={attempt.total ? Math.round(((attempt.score ?? 0) / attempt.total) * 100) : 0}
      issuedAt={attempt.submittedAt}
      backHref={`/admin/promoters/${row.promoter.id}`}
      backLabel="Back to sales agent"
    />,
  );
});

/* ----------------------------------------------------------------- questions */

async function questionsPage(
  c: Context<AdminEnv>,
  extra: Partial<Parameters<typeof QuestionsPage>[0]> = {},
) {
  const db = dbOf(c);
  const [questions, settings] = await Promise.all([listQuestions(db), getSettings(db)]);
  const editId = c.req.query('edit');
  const imported = c.req.query('imported');
  const videoError = c.req.query('videoError');

  return (
    <QuestionsPage
      admin={c.get('admin')}
      questions={questions}
      settings={settings}
      editing={editId ? questions.find((q) => q.id === editId) : undefined}
      notice={
        imported
          ? `Imported ${imported} ${imported === '1' ? 'question' : 'questions'}.`
          : c.req.query('saved')
            ? 'Saved.'
            : undefined
      }
      videoError={videoError}
      {...extra}
    />
  );
}

app.get('/questions', async (c) => c.html(await questionsPage(c)));

app.post(
  '/questions',
  zValidator('form', questionSchema, async (result, c) => {
    if (!result.success) {
      const db = dbOf(c);
      const [questions, settings] = await Promise.all([listQuestions(db), getSettings(db)]);
      return c.html(
        <QuestionsPage
          admin={await adminOf(c)}
          questions={questions}
          settings={settings}
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

/**
 * Video upload — training content, so it lives here rather than Settings.
 *
 * Registered above `/questions/:id` for the same reason as bulk import: the
 * other way round, these POSTs land in the single-question editor with
 * id="video" instead.
 */
app.get('/questions/video', async (c) => {
  const settings = await getSettings(dbOf(c));
  if (!settings.videoKey) return c.notFound();
  return serveVideoRange(c, c.env.TRAINING_MEDIA, settings.videoKey);
});

app.post('/questions/video', async (c) => {
  const db = dbOf(c);
  const body = await c.req.parseBody();
  const file = body['video'];

  const fail = (message: string) =>
    c.redirect(`/admin/questions?videoError=${encodeURIComponent(message)}`);

  if (!(file instanceof File)) return fail('Choose a video file first.');

  const check = checkVideo(file);
  if (!check.ok) return fail(check.error);

  const settings = await getSettings(db);
  const key = videoKeyFor(check.mime);

  await c.env.TRAINING_MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: check.mime },
  });

  // Old object first: an upload that fails validation never reaches here, so
  // by the time we overwrite the pointer the new object is already durable.
  if (settings.videoKey) await c.env.TRAINING_MEDIA.delete(settings.videoKey);

  await updateSettings(db, { videoKey: key });
  return c.redirect('/admin/questions?saved=1');
});

app.post('/questions/video/remove', async (c) => {
  const db = dbOf(c);
  const settings = await getSettings(db);
  if (settings.videoKey) {
    await c.env.TRAINING_MEDIA.delete(settings.videoKey);
    await updateSettings(db, { videoKey: null });
  }
  return c.redirect('/admin/questions?saved=1');
});

app.post(
  '/questions/:id',
  zValidator('form', questionSchema, async (result, c) => {
    if (!result.success) {
      const db = dbOf(c);
      const [questions, editing, settings] = await Promise.all([
        listQuestions(db),
        getQuestion(db, c.req.param('id') ?? ''),
        getSettings(db),
      ]);
      return c.html(
        <QuestionsPage
          admin={await adminOf(c)}
          questions={questions}
          settings={settings}
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

/**
 * A regular admin's own account is the only one they get sent — not just
 * hidden in the UI, since the point is that other admins' emails never reach
 * a screen that isn't the super admin's.
 */
function scopedAdmins(admin: Admin, all: Admin[]): Admin[] {
  return admin.isSuperAdmin ? all : all.filter((a) => a.id === admin.id);
}

/** Settings is two forms on one page, so every render of it needs both. */
async function settingsPage(
  c: Context<AdminEnv>,
  extra: Partial<Parameters<typeof SettingsPage>[0]> = {},
) {
  const db = dbOf(c);
  const admin = c.get('admin');
  const [settings, allAdmins] = await Promise.all([getSettings(db), listAdmins(db)]);

  return (
    <SettingsPage
      admin={admin}
      settings={settings}
      admins={scopedAdmins(admin, allAdmins)}
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
      const admin = await adminOf(c);
      const [settings, allAdmins] = await Promise.all([getSettings(db), listAdmins(db)]);
      return c.html(
        <SettingsPage
          admin={admin}
          settings={settings}
          admins={scopedAdmins(admin, allAdmins)}
          errors={fieldErrors(result.error)}
        />,
        400,
      );
    }
  }),
  async (c) => {
    const db = dbOf(c);
    const input = c.req.valid('form');

    const errors: Record<string, string> = {};

    // The support number is stored in the same +234 form as a promoter's, so
    // the Support screen can format it with the same helper.
    const supportPhone = input.supportPhone ? normalizePhone(input.supportPhone) : null;

    if (input.supportPhone && !supportPhone) {
      errors.supportPhone = 'That does not look like a Nigerian number. Try 08012345678.';
    }

    if (Object.keys(errors).length > 0) {
      const admin = c.get('admin');
      const [settings, allAdmins] = await Promise.all([getSettings(db), listAdmins(db)]);
      return c.html(
        <SettingsPage
          admin={admin}
          settings={{
            ...settings,
            passMark: input.passMark,
            minTutorialSeconds: input.minTutorialSeconds,
          }}
          admins={scopedAdmins(admin, allAdmins)}
          values={{
            supportPhone: input.supportPhone,
            supportEmail: input.supportEmail,
          }}
          errors={errors}
        />,
        400,
      );
    }

    // Neither slidesUrl nor videoUrl is touched here — this form no longer
    // offers either. videoUrl only ever changes via /questions/video(/remove)
    // now; slidesUrl has no admin UI left to change it at all.
    await updateSettings(db, {
      passMark: input.passMark,
      minTutorialSeconds: input.minTutorialSeconds,
      supportPhone,
      supportEmail: input.supportEmail || null,
    });

    return c.redirect('/admin/settings?saved=1');
  },
);

/* ---------------------------------------------------------------------- team */

/**
 * Only the super admin can grow the team — "the admin that can create another
 * admin is the super admin" is the whole rule. Everyone else gets redirected
 * back with nothing changed rather than a 403 page, same treatment as any
 * other console guard here.
 */
app.post(
  '/team',
  async (c, next) => {
    if (!c.get('admin').isSuperAdmin) return c.redirect('/admin/settings');
    await next();
  },
  zValidator('form', adminInviteSchema, async (result, c) => {
    if (!result.success) {
      const db = dbOf(c);
      const admin = await adminOf(c);
      const raw = result.data as unknown as Record<string, string>;
      const [settings, allAdmins] = await Promise.all([getSettings(db), listAdmins(db)]);
      return c.html(
        <SettingsPage
          admin={admin}
          settings={settings}
          admins={scopedAdmins(admin, allAdmins)}
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
