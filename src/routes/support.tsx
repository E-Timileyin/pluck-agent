import { Hono } from 'hono';
import type { AgentEnv } from '../types';
import { getDb, listQuestions } from '../db/queries';
import { attemptGuard } from '../middleware/attempt';
import { shellFor } from '../lib/shell';
import { SupportPage } from '../pages/support/SupportPage';

/**
 * Help, answered from this deployment's own settings rather than from generic
 * copy — the pass mark and the gate a promoter is told about here are the ones
 * the server will actually apply.
 */
const app = new Hono<AgentEnv>();

app.use('*', attemptGuard);

app.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const shell = await shellFor(db, c.get('attempt'));
  if (!shell) return c.redirect('/');

  const active = await listQuestions(db, { activeOnly: true });

  return c.html(<SupportPage shell={shell} questionCount={active.length} />);
});

export default app;
