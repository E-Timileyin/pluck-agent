import { Hono } from 'hono';
import type { AgentEnv } from '../types';
import { getDb, listAttemptsForPromoter } from '../db/queries';
import { attemptGuard } from '../middleware/attempt';
import { stepFor } from '../lib/flow';
import { modulesFor, resumeFor } from '../lib/progress';
import { shellFor } from '../lib/shell';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

/**
 * The promoter's home screen. It reports on the attempt but never advances it —
 * every step it links to re-checks its own preconditions, so the tutorial gate
 * is still enforced by /learn and /quiz, not by what this page chooses to show.
 */
const app = new Hono<AgentEnv>();

app.use('*', attemptGuard);

app.get('/', async (c) => {
  const attempt = c.get('attempt');
  const db = getDb(c.env.DB);

  const shell = await shellFor(db, attempt);
  if (!shell) return c.redirect('/');

  return c.html(
    <DashboardPage
      shell={shell}
      modules={modulesFor(attempt, shell.settings, shell.progress)}
      resume={resumeFor(shell.progress.current)}
      resumeHref={await stepFor(db, attempt)}
      attempts={await listAttemptsForPromoter(db, shell.promoter.id)}
    />,
  );
});

export default app;
