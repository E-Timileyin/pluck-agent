import { createMiddleware } from 'hono/factory';
import type { AgentEnv } from '../types';
import {
  createAttempt,
  getAttempt,
  getDb,
  listAttemptsForPromoter,
  upsertPromoter,
  type Db,
} from '../db/queries';
import { getAttemptId, setAttemptCookie } from '../lib/session';

/**
 * DEMO BUILD — the guard no longer turns anyone away.
 *
 * It used to redirect to `/` whenever the signed attempt cookie was missing.
 * That check is gone so every promoter screen can be opened cold; the pages
 * behind it all read `c.get('attempt')`, so instead of blocking we fall back to
 * a single shared demo attempt.
 *
 * To restore: drop `demoAttempt`, and redirect on a missing or unknown id.
 */

/** The number the comp shows. Fixed, so the demo reuses one row not thousands. */
const DEMO_PHONE = '+2348012345678';

async function demoAttempt(db: Db) {
  const promoter = await upsertPromoter(db, {
    name: 'Emeka Okafor',
    phone: DEMO_PHONE,
    tier: 'SP3',
    email: null,
  });

  // Reuse the demo's attempt while it is still in progress; once it has been
  // submitted, start a fresh one so the next visitor sees the flow from the
  // top rather than someone else's finished result.
  const [latest] = await listAttemptsForPromoter(db, promoter.id);
  if (latest && !latest.submittedAt) return latest;

  return createAttempt(db, promoter.id);
}

export const attemptGuard = createMiddleware<AgentEnv>(async (c, next) => {
  const db = getDb(c.env.DB);
  const attemptId = await getAttemptId(c);

  const attempt = (attemptId ? await getAttempt(db, attemptId) : undefined) ?? (await demoAttempt(db));

  // Re-stamp the cookie so the rest of the visit stays on this same attempt.
  if (attempt.id !== attemptId) await setAttemptCookie(c, attempt.id);

  c.set('attempt', attempt);
  await next();
});
