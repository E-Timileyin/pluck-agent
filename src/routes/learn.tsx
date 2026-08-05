import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AgentEnv } from '../types';
import { getDb, getSettings, setTutorialMode } from '../db/queries';
import { modeSchema } from '../lib/validators';
import { attemptGuard } from '../middleware/attempt';
import { elapsedSeconds, gatePassed } from '../lib/flow';
import { shellFor } from '../lib/shell';
import { LearnPage } from '../pages/learn/LearnPage';

/** The training itself: choose a format, watch or read it, pass the time gate. */
const app = new Hono<AgentEnv>();

app.use('*', attemptGuard);

app.get('/', async (c) => {
  const attempt = c.get('attempt');
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

  const db = getDb(c.env.DB);
  const settings = await getSettings(db);
  const remaining = attempt.tutorialStartedAt
    ? Math.max(0, settings.minTutorialSeconds - elapsedSeconds(attempt.tutorialStartedAt))
    : settings.minTutorialSeconds;

  const shell = await shellFor(db, attempt);
  if (!shell) return c.redirect('/');

  return c.html(
    <LearnPage
      shell={shell}
      mode={attempt.tutorialMode}
      remainingSeconds={remaining}
      error={c.req.query('early') ? 'Take a little longer with the material first.' : undefined}
    />,
  );
});

app.post(
  '/mode',
  zValidator('form', modeSchema, (result, c) => {
    if (!result.success) return c.redirect('/learn');
  }),
  async (c) => {
    const attempt = c.get('attempt');
    if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

    // Switching format is free; the timer is stamped once and does not reset.
    await setTutorialMode(getDb(c.env.DB), attempt.id, c.req.valid('form').mode);
    return c.redirect('/learn');
  },
);

app.post('/continue', async (c) => {
  const attempt = c.get('attempt');
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);
  if (!attempt.tutorialMode) return c.redirect('/learn');

  if (!(await gatePassed(getDb(c.env.DB), attempt))) return c.redirect('/learn?early=1');

  return c.redirect('/quiz');
});

export default app;
