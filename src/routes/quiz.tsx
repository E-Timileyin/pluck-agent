import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AgentEnv } from "../types";
import {
  attestAndFinalize,
  getAttempt,
  getAttemptWithPromoter,
  getDb,
  getQuestion,
  getSettings,
  listAnswers,
  listAttemptsForPromoter,
  nextUnansweredQuestion,
  recordAnswer,
} from "../db/queries";
import { answerSchema, attestSchema } from "../lib/validators";
import { getAttemptId } from "../lib/session";
import { attemptGuard } from "../middleware/attempt";
import { gatePassed, stepFor } from "../lib/flow";
import { shellFor } from "../lib/shell";
import { computeResult } from "../lib/scoring";
import { QuizPage, QuizEmptyPage } from "../pages/quiz/QuizPage";
import { AttestPage } from "../pages/quiz/AttestPage";
import { ResultsPage } from "../pages/quiz/ResultsPage";
import { ResultsListPage } from "../pages/results/ResultsListPage";
import { CertificatePage } from "../pages/results/CertificatePage";

// Mounted at '/', so the attempt guard is attached per route rather than with a
// wildcard `use` — a wildcard here also runs for /admin and /results.
const app = new Hono<AgentEnv>();

/* --------------------------------------------------------------------- quiz */

app.get("/quiz", attemptGuard, async (c) => {
  const attempt = c.get("attempt");
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);
  if (!attempt.tutorialMode) return c.redirect('/learn');

  const db = getDb(c.env.DB);
  const { question, answered, total } = await nextUnansweredQuestion(
    db,
    attempt.id,
  );

  // The gate covers direct navigation here too, not just the Continue button.
  if (answered === 0 && !(await gatePassed(db, attempt))) return c.redirect('/learn?early=1');

  const shell = await shellFor(db, attempt);
  if (!shell) return c.redirect("/");

  if (total === 0) return c.html(<QuizEmptyPage shell={shell} />);
  if (!question) return c.redirect("/attest");

  return c.html(
    <QuizPage
      shell={shell}
      question={question}
      position={answered + 1}
      total={total}
    />,
  );
});

app.post(
  "/quiz/answer",
  attemptGuard,
  zValidator("form", answerSchema, (result, c) => {
    if (!result.success) return c.redirect("/quiz");
  }),
  async (c) => {
    const attempt = c.get("attempt");
    if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

    const db = getDb(c.env.DB);
    const { questionId, selectedIndex } = c.req.valid("form");
    const question = await getQuestion(db, questionId);

    // Scoring uses the live question at answer time; the snapshot preserves what
    // was asked, so a later edit cannot rewrite this row.
    if (
      question &&
      question.isActive &&
      selectedIndex < question.options.length
    ) {
      await recordAnswer(db, {
        attemptId: attempt.id,
        question,
        selectedIndex,
      });
    }

    const { question: next } = await nextUnansweredQuestion(db, attempt.id);
    return c.redirect(next ? "/quiz" : "/attest");
  },
);

/* ------------------------------------------------------------------- attest */

app.get("/attest", attemptGuard, async (c) => {
  const attempt = c.get("attempt");
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

  const db = getDb(c.env.DB);
  const { question, total } = await nextUnansweredQuestion(db, attempt.id);
  const shell = await shellFor(db, attempt);
  if (!shell) return c.redirect("/");

  if (total === 0) return c.html(<QuizEmptyPage shell={shell} />);
  if (question) return c.redirect("/quiz");

  return c.html(
    <AttestPage
      shell={shell}
      error={
        c.req.query("unchecked")
          ? "Tick the box to confirm you have read the rules."
          : undefined
      }
    />,
  );
});

// Not optional, and not skippable — no checkbox, no result.
app.post(
  "/attest",
  attemptGuard,
  zValidator("form", attestSchema, (result, c) => {
    if (!result.success) return c.redirect("/attest?unchecked=1");
  }),
  async (c) => {
    const attempt = c.get("attempt");
    if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

    const db = getDb(c.env.DB);
    const { question, total } = await nextUnansweredQuestion(db, attempt.id);
    if (total === 0 || question) return c.redirect("/quiz");

    const finalized = await attestAndFinalize(db, attempt.id);
    if (!finalized) return c.redirect("/quiz");

    return c.redirect(`/results/${attempt.id}`);
  },
);

/* ------------------------------------------------------------------ results */

/** Every attempt this promoter has made — the nav's "My Results" lands here. */
app.get("/results", attemptGuard, async (c) => {
  const attempt = c.get("attempt");
  const db = getDb(c.env.DB);

  const shell = await shellFor(db, attempt);
  if (!shell) return c.redirect("/");

  return c.html(
    <ResultsListPage
      shell={shell}
      attempts={await listAttemptsForPromoter(db, shell.promoter.id)}
      resumeHref={await stepFor(db, attempt)}
    />,
  );
});

// Outside the guard on purpose: an unknown cookie must 404 rather than
// redirect, otherwise result URLs are enumerable.
app.get("/results/:id", async (c) => {
  const attemptId = await getAttemptId(c);
  if (!attemptId) return c.notFound();

  const db = getDb(c.env.DB);
  const attempt = await getAttempt(db, c.req.param("id"));
  if (!attempt) return c.notFound();

  // Your own history is yours to read, so the check is on the promoter behind
  // the cookie rather than on the exact attempt — a stranger's id still 404s.
  const current = await getAttempt(db, attemptId);
  if (!current || current.promoterId !== attempt.promoterId)
    return c.notFound();

  // Nothing to show yet: the attempt in hand goes to wherever it belongs, an
  // older unfinished one to the list it came from.
  if (!attempt.submittedAt) {
    return c.redirect(
      attempt.id === current.id ? await stepFor(db, attempt) : "/results",
    );
  }

  const [row, answers, settings] = await Promise.all([
    getAttemptWithPromoter(db, attempt.id),
    listAnswers(db, attempt.id),
    getSettings(db),
  ]);
  if (!row) return c.notFound();

  const shell = await shellFor(db, attempt);
  if (!shell) return c.notFound();

  const cooldown = Number(c.req.query("cooldown"));

  return c.html(
    <ResultsPage
      shell={shell}
      attempt={row.attempt}
      answers={answers}
      result={computeResult(answers, settings.passMark)}
      passMark={settings.passMark}
      cooldownSeconds={Number.isFinite(cooldown) && cooldown > 0 ? cooldown : undefined}
    />,
  );
});

// Same ownership check as /results/:id, plus: no certificate for an attempt
// that didn't pass — that fact is stored at submission, not recomputed here.
app.get("/results/:id/certificate", async (c) => {
  const attemptId = await getAttemptId(c);
  if (!attemptId) return c.notFound();

  const db = getDb(c.env.DB);
  const attempt = await getAttempt(db, c.req.param("id"));
  if (!attempt || !attempt.submittedAt) return c.notFound();

  const current = await getAttempt(db, attemptId);
  if (!current || current.promoterId !== attempt.promoterId) return c.notFound();

  if (!attempt.passed) return c.redirect(`/results/${attempt.id}`);

  const row = await getAttemptWithPromoter(db, attempt.id);
  if (!row) return c.notFound();

  return c.html(
    <CertificatePage
      certificateId={attempt.id}
      promoterName={row.promoter.name}
      tier={row.promoter.tier}
      score={attempt.score ?? 0}
      total={attempt.total ?? 0}
      percent={attempt.total ? Math.round(((attempt.score ?? 0) / attempt.total) * 100) : 0}
      issuedAt={attempt.submittedAt}
      backHref={`/results/${attempt.id}`}
      backLabel="Back to result"
    />,
  );
});

export default app;
