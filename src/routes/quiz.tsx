import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AgentEnv } from '../types';
import {
  attestAndFinalize,
  getAttempt,
  getAttemptWithPromoter,
  getDb,
  getQuestion,
  getSettings,
  listAnswers,
  nextUnansweredQuestion,
  recordAnswer,
} from '../db/queries';
import { answerSchema, attestSchema } from '../lib/validators';
import { getAttemptId } from '../lib/session';
import { attemptGuard } from '../middleware/attempt';
import { gatePassed, stepFor } from '../lib/flow';
import { computeResult } from '../lib/scoring';
import { QuizPage, QuizEmptyPage } from '../pages/quiz/QuizPage';
import { AttestPage } from '../pages/quiz/AttestPage';
import { ResultsPage } from '../pages/quiz/ResultsPage';

// Mounted at '/', so the attempt guard is attached per route rather than with a
// wildcard `use` — a wildcard here also runs for /admin and /results.
const app = new Hono<AgentEnv>();

/* --------------------------------------------------------------------- quiz */

app.get('/quiz', attemptGuard, async (c) => {
  const attempt = c.get('attempt');
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);
  if (!attempt.tutorialMode) return c.redirect('/learn');

  const db = getDb(c.env.DB);
  const { question, answered, total } = await nextUnansweredQuestion(db, attempt.id);

  // The gate covers direct navigation here too, not just the Continue button.
  if (answered === 0 && !(await gatePassed(db, attempt))) return c.redirect('/learn?early=1');

  if (total === 0) return c.html(<QuizEmptyPage />);
  if (!question) return c.redirect('/attest');

  return c.html(<QuizPage question={question} position={answered + 1} total={total} />);
});

app.post(
  '/quiz/answer',
  attemptGuard,
  zValidator('form', answerSchema, (result, c) => {
    if (!result.success) return c.redirect('/quiz');
  }),
  async (c) => {
    const attempt = c.get('attempt');
    if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

    const db = getDb(c.env.DB);
    const { questionId, selectedIndex } = c.req.valid('form');
    const question = await getQuestion(db, questionId);

    // Scoring uses the live question at answer time; the snapshot preserves what
    // was asked, so a later edit cannot rewrite this row.
    if (question && question.isActive && selectedIndex < question.options.length) {
      await recordAnswer(db, { attemptId: attempt.id, question, selectedIndex });
    }

    const { question: next } = await nextUnansweredQuestion(db, attempt.id);
    return c.redirect(next ? '/quiz' : '/attest');
  },
);

/* ------------------------------------------------------------------- attest */

app.get('/attest', attemptGuard, async (c) => {
  const attempt = c.get('attempt');
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

  const db = getDb(c.env.DB);
  const { question, total } = await nextUnansweredQuestion(db, attempt.id);
  if (total === 0) return c.html(<QuizEmptyPage />);
  if (question) return c.redirect('/quiz');

  return c.html(
    <AttestPage
      error={
        c.req.query('unchecked') ? 'Tick the box to confirm you have read the rules.' : undefined
      }
    />,
  );
});

// Not optional, and not skippable — no checkbox, no result.
app.post(
  '/attest',
  attemptGuard,
  zValidator('form', attestSchema, (result, c) => {
    if (!result.success) return c.redirect('/attest?unchecked=1');
  }),
  async (c) => {
    const attempt = c.get('attempt');
    if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

    const db = getDb(c.env.DB);
    const { question, total } = await nextUnansweredQuestion(db, attempt.id);
    if (total === 0 || question) return c.redirect('/quiz');

    const finalized = await attestAndFinalize(db, attempt.id);
    if (!finalized) return c.redirect('/quiz');

    return c.redirect(`/results/${attempt.id}`);
  },
);

/* ------------------------------------------------------------------ results */

// Outside the guard on purpose: a missing or mismatched cookie must 404 rather
// than redirect, otherwise result URLs are enumerable.
app.get('/results/:id', async (c) => {
  const attemptId = await getAttemptId(c);
  if (!attemptId || attemptId !== c.req.param('id')) return c.notFound();

  const db = getDb(c.env.DB);
  const attempt = await getAttempt(db, attemptId);
  if (!attempt) return c.notFound();
  if (!attempt.submittedAt) return c.redirect(await stepFor(db, attempt));

  const [row, answers, settings] = await Promise.all([
    getAttemptWithPromoter(db, attempt.id),
    listAnswers(db, attempt.id),
    getSettings(db),
  ]);
  if (!row) return c.notFound();

  return c.html(
    <ResultsPage
      attempt={row.attempt}
      promoter={row.promoter}
      answers={answers}
      result={computeResult(answers, settings.passMark)}
      passMark={settings.passMark}
    />,
  );
});

export default app;
