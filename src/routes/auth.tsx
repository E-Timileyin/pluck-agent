import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "../types";
import {
  createAttempt,
  getAttempt,
  getDb,
  getPromoterByAgentId,
  listAttemptsForPromoter,
} from "../db/queries";
import { fieldErrors, startSchema } from "../lib/validators";
import {
  clearAttemptCookie,
  getAttemptId,
  setAttemptCookie,
} from "../lib/session";
import { cooldownRemaining } from "../lib/flow";
import { StartPage } from "../pages/auth/StartPage";

const app = new Hono<AppEnv>();

app.get("/", async (c) => {
  const attemptId = await getAttemptId(c);
  if (attemptId) {
    const db = getDb(c.env.DB);
    const attempt = await getAttempt(db, attemptId);
    // A live cookie means skip this screen. The dashboard, not the step itself:
    // it offers the same resume link and shows what is left around it.
    if (attempt) return c.redirect("/dashboard");
    clearAttemptCookie(c);
  }
  return c.html(<StartPage />);
});

app.post("/logout", (c) => {
  clearAttemptCookie(c);
  return c.redirect("/");
});

app.post(
  "/start",
  zValidator("form", startSchema, (result, c) => {
    if (!result.success) {
      const raw = result.data as unknown as Record<string, string>;
      return c.html(
        <StartPage
          values={{
            agentId: raw?.agentId,
            phone: raw?.phone,
            email: raw?.email,
          }}
          errors={fieldErrors(result.error)}
        />,
        400,
      );
    }
  }),

  async (c) => {
    const { agentId, phone, email } = c.req.valid("form");
    const db = getDb(c.env.DB);

    // One message for every mismatch — which of the three didn't match is
    // how you enumerate valid Sales Agent IDs. Same treatment as admin login.
    const promoter = await getPromoterByAgentId(db, agentId);
    const matches =
      promoter && promoter.phone === phone && promoter.email?.toLowerCase() === email;

    if (!matches) {
      return c.html(
        <StartPage
          values={{ agentId, phone, email }}
          error="We could not find a sales agent with that ID, phone and email. Check the details you were given and try again."
        />,
        401,
      );
    }

    const attempt = await createAttempt(db, promoter.id);
    await setAttemptCookie(c, attempt.id);

    return c.redirect("/dashboard");
  },
);

/**
 * "Take it again" on a submitted attempt. A pass restarts freely; a second
 * fail in a row is held for RETRY_COOLDOWN_SECONDS — see cooldownRemaining().
 * Either way this is what actually starts the next attempt: the old cookie
 * pointed at a submitted attempt forever, so without a fresh one here
 * "retake" only ever re-showed the same failed result.
 */
app.post("/restart", async (c) => {
  const attemptId = await getAttemptId(c);
  const db = getDb(c.env.DB);
  const current = attemptId ? await getAttempt(db, attemptId) : undefined;

  if (!current) {
    clearAttemptCookie(c);
    return c.redirect("/");
  }

  const history = await listAttemptsForPromoter(db, current.promoterId);
  const remaining = cooldownRemaining(history);
  if (remaining > 0) {
    return c.redirect(`/results/${current.id}?cooldown=${remaining}`);
  }

  const attempt = await createAttempt(db, current.promoterId);
  await setAttemptCookie(c, attempt.id);
  return c.redirect("/learn");
});

export default app;
