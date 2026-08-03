import { createMiddleware } from 'hono/factory';
import type { AgentEnv } from '../types';
import { getAttempt, getDb } from '../db/queries';
import { clearAttemptCookie, getAttemptId } from '../lib/session';

/**
 * Loads the attempt behind the signed cookie. Shared by the learn and quiz
 * routers; the entry router deliberately runs without it.
 */
export const attemptGuard = createMiddleware<AgentEnv>(async (c, next) => {
  const attemptId = await getAttemptId(c);
  if (!attemptId) return c.redirect('/');

  const attempt = await getAttempt(getDb(c.env.DB), attemptId);
  if (!attempt) {
    clearAttemptCookie(c);
    return c.redirect('/');
  }

  c.set('attempt', attempt);
  await next();
});
