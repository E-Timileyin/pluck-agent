import { createMiddleware } from "hono/factory";
import type { AgentEnv } from "../types";
import {
  createAttempt,
  getAttempt,
  getDb,
  listAttemptsForPromoter,
  upsertPromoter,
  type Db,
} from "../db/queries";
import { getAttemptId, setAttemptCookie } from "../lib/session";

const DEMO_PHONE = "+2348012345678";
const DEMO_AGENT_ID = "DEMO0001";

async function demoAttempt(db: Db) {
  const promoter = await upsertPromoter(db, {
    agentId: DEMO_AGENT_ID,
    name: "Emeka Okafor",
    phone: DEMO_PHONE,
    tier: "SP3",
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

  const attempt =
    (attemptId ? await getAttempt(db, attemptId) : undefined) ??
    (await demoAttempt(db));

  // Re-stamp the cookie so the rest of the visit stays on this same attempt.
  if (attempt.id !== attemptId) await setAttemptCookie(c, attempt.id);

  c.set("attempt", attempt);
  await next();
});
