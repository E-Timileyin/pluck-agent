import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppEnv, Bindings } from '../types';
import {
  createQuestion,
  dashboardStats,
  getDb,
  getPromoter,
  getQuestion,
  getSettings,
  listAnswersForAttempts,
  listAttempts,
  listAttemptsForPromoter,
  listQuestions,
  toggleQuestion,
  updateQuestion,
  updateSettings,
} from '../db/queries';
import {
  fieldErrors,
  loginSchema,
  questionSchema,
  rawQuestionValues,
  settingsSchema,
} from '../lib/validators';
// isAdmin() stays exported in lib/session for whoever restores the guard.
import { clearAdminCookie, passcodeMatches, setAdminCookie } from '../lib/session';
import { toSlidesEmbed, toVideoEmbed } from '../lib/drive';
import { LoginPage } from '../pages/admin/LoginPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { PromoterPage } from '../pages/admin/PromoterPage';
import { QuestionsPage } from '../pages/admin/QuestionsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';

const app = new Hono<AppEnv>();

// zValidator hooks lose the Env generic, so bindings are reached through here.
const dbOf = (c: { env: unknown }) => getDb((c.env as Bindings).DB);

/* -------------------------------------------------------------------- guard */

/**
 * DEMO BUILD — the passcode gate is off.
 *
 * This was the app's only real authentication. With it removed, /admin and
 * every promoter's name and phone number are reachable by anyone who knows the
 * URL, so this build must not be deployed anywhere public.
 *
 * To restore, put back:
 *   app.use('*', async (c, next) => {
 *     if (c.req.path === '/admin/login') return next();
 *     if (!(await isAdmin(c))) return c.redirect('/admin/login');
 *     await next();
 *   });
 */

app.get('/login', (c) => c.html(<LoginPage />));

app.post(
  '/login',
  zValidator('form', loginSchema, (result, c) => {
    if (!result.success) return c.html(<LoginPage error="Enter the passcode." />, 400);
  }),
  async (c) => {
    const { passcode } = c.req.valid('form');
    if (!(await passcodeMatches(passcode, c.env.ADMIN_PASSCODE))) {
      return c.html(<LoginPage error="That passcode is not right." />, 401);
    }
    await setAdminCookie(c);
    return c.redirect('/admin');
  },
);

app.post('/logout', (c) => {
  clearAdminCookie(c);
  return c.redirect('/admin/login');
});

/* ---------------------------------------------------------------- dashboard */

app.get('/', async (c) => {
  const db = dbOf(c);
  const [stats, rows] = await Promise.all([dashboardStats(db), listAttempts(db, 200)]);
  return c.html(<DashboardPage stats={stats} rows={rows} />);
});

app.get('/promoters/:id', async (c) => {
  const db = dbOf(c);
  const promoter = await getPromoter(db, c.req.param('id'));
  if (!promoter) return c.notFound();

  const attempts = await listAttemptsForPromoter(db, promoter.id);
  const answersByAttempt = await listAnswersForAttempts(
    db,
    attempts.map((a) => a.id),
  );

  return c.html(
    <PromoterPage promoter={promoter} attempts={attempts} answersByAttempt={answersByAttempt} />,
  );
});

/* ----------------------------------------------------------------- questions */

app.get('/questions', async (c) => {
  const db = dbOf(c);
  const questions = await listQuestions(db);
  const editId = c.req.query('edit');
  const editing = editId ? questions.find((q) => q.id === editId) : undefined;

  return c.html(
    <QuestionsPage questions={questions} editing={editing} notice={c.req.query('saved') ? 'Saved.' : undefined} />,
  );
});

app.post(
  '/questions',
  zValidator('form', questionSchema, async (result, c) => {
    if (!result.success) {
      const questions = await listQuestions(dbOf(c));
      return c.html(
        <QuestionsPage
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

app.get('/settings', async (c) => {
  const settings = await getSettings(dbOf(c));
  return c.html(<SettingsPage settings={settings} saved={!!c.req.query('saved')} />);
});

app.post(
  '/settings',
  zValidator('form', settingsSchema, async (result, c) => {
    if (!result.success) {
      const settings = await getSettings(dbOf(c));
      return c.html(<SettingsPage settings={settings} errors={fieldErrors(result.error)} />, 400);
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

    if (input.slidesUrl && !slidesUrl) {
      errors.slidesUrl = 'Expected a link like https://docs.google.com/presentation/d/<ID>/edit';
    }
    if (input.videoUrl && !videoUrl) {
      errors.videoUrl = 'Expected a link like https://drive.google.com/file/d/<ID>/view';
    }

    if (Object.keys(errors).length > 0) {
      const settings = await getSettings(db);
      return c.html(
        <SettingsPage
          settings={{ ...settings, passMark: input.passMark, minTutorialSeconds: input.minTutorialSeconds }}
          values={{ slidesUrl: input.slidesUrl, videoUrl: input.videoUrl }}
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
    });

    return c.redirect('/admin/settings?saved=1');
  },
);

export default app;
