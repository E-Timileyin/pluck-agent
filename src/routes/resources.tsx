import { Hono } from 'hono';
import type { AgentEnv } from '../types';
import { getDb, listQuestions } from '../db/queries';
import { attemptGuard } from '../middleware/attempt';
import { modulesFor } from '../lib/progress';
import { shellFor } from '../lib/shell';
import { ResourcesPage } from '../pages/resources/ResourcesPage';

/**
 * The library: the material, the conduct rules and the numbers the quiz runs
 * by. It changes nothing — the one action on it is "open this module", which is
 * the same POST /learn/mode the training screen offers.
 */
const app = new Hono<AgentEnv>();

app.use('*', attemptGuard);

app.get('/', async (c) => {
  const attempt = c.get('attempt');
  const db = getDb(c.env.DB);

  const shell = await shellFor(db, attempt);
  if (!shell) return c.redirect('/');

  const active = await listQuestions(db, { activeOnly: true });

  return c.html(
    <ResourcesPage
      shell={shell}
      modules={modulesFor(attempt, shell.settings, shell.progress)}
      questionCount={active.length}
      criticalCount={active.filter((q) => q.isCritical).length}
    />,
  );
});

export default app;
