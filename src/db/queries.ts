/**
 * ALL database access lives here. Nothing else in the app imports drizzle.
 *
 * That rule keeps SQL out of route handlers and makes a future D1 → Postgres
 * swap a single-file job.
 */
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import * as schema from './schema';
import { answers, attempts, promoters, questions, settings } from './schema';
import type {
  Answer,
  Attempt,
  Promoter,
  Question,
  QuestionSnapshot,
  Settings,
  Tier,
  TutorialMode,
} from './schema';
import { computeResult } from '../lib/scoring';

export type Db = DrizzleD1Database<typeof schema>;

export function getDb(binding: D1Database): Db {
  return drizzle(binding, { schema });
}

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

/* ------------------------------------------------------------------ settings */

const SETTINGS_DEFAULTS: Settings = {
  id: 1,
  videoUrl: null,
  slidesUrl: null,
  minTutorialSeconds: 45,
  passMark: 80,
  updatedAt: '',
};

export async function getSettings(db: Db): Promise<Settings> {
  const row = await db.select().from(settings).where(eq(settings.id, 1)).get();
  return row ?? { ...SETTINGS_DEFAULTS, updatedAt: now() };
}

export async function updateSettings(
  db: Db,
  values: Partial<Omit<Settings, 'id' | 'updatedAt'>>,
): Promise<void> {
  const current = await getSettings(db);
  const next = { ...current, ...values, id: 1, updatedAt: now() };
  await db
    .insert(settings)
    .values(next)
    .onConflictDoUpdate({ target: settings.id, set: { ...next } });
}

/* ----------------------------------------------------------------- questions */

export function listQuestions(db: Db, opts: { activeOnly?: boolean } = {}): Promise<Question[]> {
  const base = db.select().from(questions);
  const filtered = opts.activeOnly ? base.where(eq(questions.isActive, true)) : base;
  return filtered.orderBy(asc(questions.orderIndex), asc(questions.id)).all();
}

export function getQuestion(db: Db, questionId: string): Promise<Question | undefined> {
  return db.select().from(questions).where(eq(questions.id, questionId)).get();
}

export async function createQuestion(
  db: Db,
  input: {
    prompt: string;
    options: string[];
    correctIndex: number;
    orderIndex: number;
    isCritical: boolean;
    isActive: boolean;
  },
): Promise<string> {
  const newId = id();
  await db.insert(questions).values({ id: newId, createdAt: now(), ...input });
  return newId;
}

export async function updateQuestion(
  db: Db,
  questionId: string,
  input: {
    prompt: string;
    options: string[];
    correctIndex: number;
    orderIndex: number;
    isCritical: boolean;
    isActive: boolean;
  },
): Promise<void> {
  await db.update(questions).set(input).where(eq(questions.id, questionId));
}

/** Deactivate, never delete — deleting orphans historical answers. */
export async function toggleQuestion(db: Db, questionId: string): Promise<void> {
  await db
    .update(questions)
    .set({ isActive: sql`NOT ${questions.isActive}` })
    .where(eq(questions.id, questionId));
}

export async function nextOrderIndex(db: Db): Promise<number> {
  const row = await db
    .select({ max: sql<number | null>`MAX(${questions.orderIndex})` })
    .from(questions)
    .get();
  return (row?.max ?? 0) + 1;
}

/* ----------------------------------------------------------------- promoters */

/** Same phone twice = same promoter, new attempt. Not an error. */
export async function upsertPromoter(
  db: Db,
  input: { name: string; phone: string; tier: Tier; email: string | null },
): Promise<Promoter> {
  const rows = await db
    .insert(promoters)
    .values({ id: id(), createdAt: now(), ...input })
    .onConflictDoUpdate({
      target: promoters.phone,
      set: { name: input.name, tier: input.tier, email: input.email },
    })
    .returning();
  return rows[0]!;
}

export function getPromoter(db: Db, promoterId: string): Promise<Promoter | undefined> {
  return db.select().from(promoters).where(eq(promoters.id, promoterId)).get();
}

/* ------------------------------------------------------------------ attempts */

export async function createAttempt(db: Db, promoterId: string): Promise<Attempt> {
  const rows = await db
    .insert(attempts)
    .values({ id: id(), promoterId, startedAt: now() })
    .returning();
  return rows[0]!;
}

export function getAttempt(db: Db, attemptId: string): Promise<Attempt | undefined> {
  return db.select().from(attempts).where(eq(attempts.id, attemptId)).get();
}

export async function getAttemptWithPromoter(
  db: Db,
  attemptId: string,
): Promise<{ attempt: Attempt; promoter: Promoter } | undefined> {
  const row = await db
    .select({ attempt: attempts, promoter: promoters })
    .from(attempts)
    .innerJoin(promoters, eq(promoters.id, attempts.promoterId))
    .where(eq(attempts.id, attemptId))
    .get();
  return row ?? undefined;
}

/**
 * Agents can switch between slides and video freely; the timer doesn't reset,
 * so tutorial_started_at is stamped once and only once.
 */
export async function setTutorialMode(
  db: Db,
  attemptId: string,
  mode: TutorialMode,
): Promise<void> {
  const attempt = await getAttempt(db, attemptId);
  if (!attempt) return;
  await db
    .update(attempts)
    .set({
      tutorialMode: mode,
      tutorialStartedAt: attempt.tutorialStartedAt ?? now(),
    })
    .where(eq(attempts.id, attemptId));
}

/* ------------------------------------------------------------------- answers */

export function listAnswers(db: Db, attemptId: string): Promise<Answer[]> {
  return db
    .select()
    .from(answers)
    .where(eq(answers.attemptId, attemptId))
    .orderBy(asc(answers.answeredAt))
    .all();
}

/**
 * Scored server-side on write, with the question denormalized onto the row.
 * When the deck's contradictory figures get fixed and the questions are edited,
 * historical results must not change underneath.
 */
export async function recordAnswer(
  db: Db,
  input: { attemptId: string; question: Question; selectedIndex: number },
): Promise<void> {
  const existing = await db
    .select({ id: answers.id })
    .from(answers)
    .where(and(eq(answers.attemptId, input.attemptId), eq(answers.questionId, input.question.id)))
    .get();
  if (existing) return; // no back navigation, and no double-scoring on a refresh

  const snapshot: QuestionSnapshot = {
    prompt: input.question.prompt,
    options: input.question.options,
    correctIndex: input.question.correctIndex,
    isCritical: input.question.isCritical,
  };

  await db.insert(answers).values({
    id: id(),
    attemptId: input.attemptId,
    questionId: input.question.id,
    questionSnapshot: snapshot,
    selectedIndex: input.selectedIndex,
    isCorrect: input.selectedIndex === input.question.correctIndex,
    answeredAt: now(),
  });
}

/** The next active question this attempt has not answered yet. */
export async function nextUnansweredQuestion(
  db: Db,
  attemptId: string,
): Promise<{ question: Question | null; answered: number; total: number }> {
  const active = await listQuestions(db, { activeOnly: true });
  const answered = await listAnswers(db, attemptId);
  const done = new Set(answered.map((a) => a.questionId).filter(Boolean) as string[]);
  const question = active.find((q) => !done.has(q.id)) ?? null;
  return { question, answered: active.filter((q) => done.has(q.id)).length, total: active.length };
}

/* -------------------------------------------------------------- finalization */

/**
 * Scoring happens at answer time; finalization happens here, at attestation.
 * An abandoned attempt keeps its real partial data — useful for spotting where
 * people drop out.
 */
export async function attestAndFinalize(
  db: Db,
  attemptId: string,
): Promise<{ score: number; total: number; passed: boolean } | null> {
  const { passMark } = await getSettings(db);
  const rows = await listAnswers(db, attemptId);
  if (rows.length === 0) return null; // never submit a 0/0 attempt

  const result = computeResult(rows, passMark);
  const stamp = now();
  await db
    .update(attempts)
    .set({
      attestedAt: stamp,
      submittedAt: stamp,
      score: result.score,
      total: result.total,
      passed: result.passed,
    })
    .where(eq(attempts.id, attemptId));

  return { score: result.score, total: result.total, passed: result.passed };
}

/* --------------------------------------------------------------------- admin */

export type AttemptRow = { attempt: Attempt; promoter: Promoter };

/** Unpaginated by design would degrade past ~500 rows, so it takes a window. */
export function listAttempts(db: Db, limit = 100, offset = 0): Promise<AttemptRow[]> {
  return db
    .select({ attempt: attempts, promoter: promoters })
    .from(attempts)
    .innerJoin(promoters, eq(promoters.id, attempts.promoterId))
    .orderBy(desc(attempts.startedAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export async function countAttempts(db: Db): Promise<number> {
  const row = await db.select({ n: sql<number>`COUNT(*)` }).from(attempts).get();
  return row?.n ?? 0;
}

export function listAttemptsForPromoter(db: Db, promoterId: string): Promise<Attempt[]> {
  return db
    .select()
    .from(attempts)
    .where(eq(attempts.promoterId, promoterId))
    .orderBy(desc(attempts.startedAt))
    .all();
}

export async function listAnswersForAttempts(
  db: Db,
  attemptIds: string[],
): Promise<Map<string, Answer[]>> {
  const grouped = new Map<string, Answer[]>();
  if (attemptIds.length === 0) return grouped;
  const rows = await db
    .select()
    .from(answers)
    .where(inArray(answers.attemptId, attemptIds))
    .orderBy(asc(answers.answeredAt))
    .all();
  for (const row of rows) {
    const list = grouped.get(row.attemptId) ?? [];
    list.push(row);
    grouped.set(row.attemptId, list);
  }
  return grouped;
}

export type DashboardStats = {
  attempts: number;
  completed: number;
  uniquePromoters: number;
  passRate: number | null;
  mostMissed: { prompt: string; missed: number; asked: number } | null;
  formatSplit: { slides: number; video: number; unset: number };
};

export async function dashboardStats(db: Db): Promise<DashboardStats> {
  const [totals, unique, passes, formats] = await Promise.all([
    db
      .select({
        attempts: sql<number>`COUNT(*)`,
        completed: sql<number>`SUM(CASE WHEN ${attempts.submittedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
      })
      .from(attempts)
      .get(),
    db.select({ n: sql<number>`COUNT(DISTINCT ${attempts.promoterId})` }).from(attempts).get(),
    db
      .select({ n: sql<number>`SUM(CASE WHEN ${attempts.passed} = 1 THEN 1 ELSE 0 END)` })
      .from(attempts)
      .where(sql`${attempts.submittedAt} IS NOT NULL`)
      .get(),
    db
      .select({ mode: attempts.tutorialMode, n: sql<number>`COUNT(*)` })
      .from(attempts)
      .groupBy(attempts.tutorialMode)
      .all(),
  ]);

  const completed = Number(totals?.completed ?? 0);

  // Aggregated in JS over the answer rows. Becomes a GROUP BY past a few
  // thousand rows; not worth the SQL until then.
  const answerRows = await db
    .select({ snapshot: answers.questionSnapshot, isCorrect: answers.isCorrect })
    .from(answers)
    .all();

  const tally = new Map<string, { missed: number; asked: number }>();
  for (const row of answerRows) {
    const prompt = row.snapshot.prompt;
    const entry = tally.get(prompt) ?? { missed: 0, asked: 0 };
    entry.asked += 1;
    if (!row.isCorrect) entry.missed += 1;
    tally.set(prompt, entry);
  }
  let mostMissed: DashboardStats['mostMissed'] = null;
  for (const [prompt, entry] of tally) {
    if (entry.missed === 0) continue;
    if (!mostMissed || entry.missed > mostMissed.missed) mostMissed = { prompt, ...entry };
  }

  const split = { slides: 0, video: 0, unset: 0 };
  for (const row of formats) {
    if (row.mode === 'slides') split.slides = Number(row.n);
    else if (row.mode === 'video') split.video = Number(row.n);
    else split.unset = Number(row.n);
  }

  return {
    attempts: Number(totals?.attempts ?? 0),
    completed,
    uniquePromoters: Number(unique?.n ?? 0),
    passRate: completed === 0 ? null : Math.round((Number(passes?.n ?? 0) / completed) * 100),
    mostMissed,
    formatSplit: split,
  };
}

/** Attempts left unfinished — the drop-out picture the partial data buys us. */
export function listUnfinished(db: Db): Promise<AttemptRow[]> {
  return db
    .select({ attempt: attempts, promoter: promoters })
    .from(attempts)
    .innerJoin(promoters, eq(promoters.id, attempts.promoterId))
    .where(isNull(attempts.submittedAt))
    .orderBy(desc(attempts.startedAt))
    .all();
}
