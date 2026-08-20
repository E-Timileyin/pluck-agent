/**
 * ALL database access lives here. Nothing else in the app imports drizzle.
 *
 * That rule keeps SQL out of route handlers and makes a future D1 → Postgres
 * swap a single-file job.
 */
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  like,
  sql,
} from "drizzle-orm";
import * as schema from "./schema";
import {
  admins,
  answers,
  attempts,
  promoterPhotos,
  promoters,
  questions,
  settings,
} from "./schema";
import type {
  Admin,
  Answer,
  PromoterPhoto,
  Attempt,
  Promoter,
  Question,
  QuestionSnapshot,
  Settings,
  Tier,
  TutorialMode,
} from "./schema";
import { computeResult } from "../lib/scoring";

export type Db = DrizzleD1Database<typeof schema>;

export function getDb(binding: D1Database): Db {
  return drizzle(binding, { schema });
}

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

/* -------------------------------------------------------------------- admins */

/** Email is the admin's identity column, stored lower-cased so it matches. */
export function getAdminByEmail(
  db: Db,
  email: string,
): Promise<Admin | undefined> {
  return db
    .select()
    .from(admins)
    .where(eq(admins.email, email.trim().toLowerCase()))
    .get();
}

export function getAdmin(db: Db, adminId: string): Promise<Admin | undefined> {
  return db.select().from(admins).where(eq(admins.id, adminId)).get();
}

export function listAdmins(db: Db): Promise<Admin[]> {
  return db.select().from(admins).orderBy(asc(admins.createdAt)).all();
}

export async function countAdmins(db: Db): Promise<number> {
  const row = await db
    .select({ n: sql<number>`COUNT(*)` })
    .from(admins)
    .get();
  return Number(row?.n ?? 0);
}

/** Takes an already-hashed password — this layer never sees a plain one. */
export async function createAdmin(
  db: Db,
  input: { name: string; email: string; passwordHash: string; isSuperAdmin?: boolean },
): Promise<Admin> {
  const rows = await db
    .insert(admins)
    .values({
      id: id(),
      name: input.name,
      email: input.email.trim().toLowerCase(),
      passwordHash: input.passwordHash,
      isSuperAdmin: input.isSuperAdmin ?? false,
      createdAt: now(),
    })
    .returning();
  return rows[0]!;
}

/** The audit trail, such as it is: who was here and when. */
export async function touchAdminLogin(db: Db, adminId: string): Promise<void> {
  await db
    .update(admins)
    .set({ lastLoginAt: now() })
    .where(eq(admins.id, adminId));
}

/* ------------------------------------------------------------------ settings */

const SETTINGS_DEFAULTS: Settings = {
  id: 1,
  videoUrl: null,
  videoKey: null,
  slidesUrl: null,
  minTutorialSeconds: 45,
  passMark: 80,
  supportPhone: null,
  supportEmail: null,
  updatedAt: "",
};

export async function getSettings(db: Db): Promise<Settings> {
  const row = await db.select().from(settings).where(eq(settings.id, 1)).get();
  return row ?? { ...SETTINGS_DEFAULTS, updatedAt: now() };
}

export async function updateSettings(
  db: Db,
  values: Partial<Omit<Settings, "id" | "updatedAt">>,
): Promise<void> {
  const current = await getSettings(db);
  const next = { ...current, ...values, id: 1, updatedAt: now() };
  await db
    .insert(settings)
    .values(next)
    .onConflictDoUpdate({ target: settings.id, set: { ...next } });
}

/* ----------------------------------------------------------------- questions */

export function listQuestions(
  db: Db,
  opts: { activeOnly?: boolean } = {},
): Promise<Question[]> {
  const base = db.select().from(questions);
  const filtered = opts.activeOnly
    ? base.where(eq(questions.isActive, true))
    : base;
  return filtered.orderBy(asc(questions.orderIndex), asc(questions.id)).all();
}

export function getQuestion(
  db: Db,
  questionId: string,
): Promise<Question | undefined> {
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

/**
 * One insert for a whole imported file. Thirty separate round trips to D1 is
 * thirty chances for the import to half-succeed.
 */
export async function createQuestions(
  db: Db,
  inputs: {
    prompt: string;
    options: string[];
    correctIndex: number;
    orderIndex: number;
    isCritical: boolean;
    isActive: boolean;
  }[],
): Promise<number> {
  if (inputs.length === 0) return 0;
  const stamp = now();
  await db
    .insert(questions)
    .values(inputs.map((input) => ({ id: id(), createdAt: stamp, ...input })));
  return inputs.length;
}

/**
 * Retire the current set before importing a new one. Deactivates, never
 * deletes — a deleted question orphans every historical answer that referenced
 * it, and the whole point of the snapshot is that past results stay readable.
 */
export async function deactivateAllQuestions(db: Db): Promise<void> {
  await db
    .update(questions)
    .set({ isActive: false })
    .where(eq(questions.isActive, true));
}

/** Deactivate, never delete — deleting orphans historical answers. */
export async function toggleQuestion(
  db: Db,
  questionId: string,
): Promise<void> {
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
  input: { agentId: string; name: string; phone: string; tier: Tier; email: string | null },
): Promise<Promoter> {
  const rows = await db
    .insert(promoters)
    .values({ id: id(), createdAt: now(), ...input })
    .onConflictDoUpdate({
      target: promoters.phone,
      set: { agentId: input.agentId, name: input.name, tier: input.tier, email: input.email },
    })
    .returning();
  return rows[0]!;
}

export function getPromoter(
  db: Db,
  promoterId: string,
): Promise<Promoter | undefined> {
  return db.select().from(promoters).where(eq(promoters.id, promoterId)).get();
}

/** Sign-in looks a promoter up by their Sales Agent ID, then checks phone and email match. */
export function getPromoterByAgentId(
  db: Db,
  agentId: string,
): Promise<Promoter | undefined> {
  return db.select().from(promoters).where(eq(promoters.agentId, agentId)).get();
}

/**
 * The roster import, one row at a time: each row can update different fields
 * on conflict, so a single batched INSERT can't express it the way
 * `createQuestions` does for all-new rows. A sales agent's ID is the key —
 * re-importing the same roster with a corrected phone or email updates the
 * existing row rather than creating a second one.
 */
export async function importAgents(
  db: Db,
  rows: { agentId: string; name: string; phone: string; email: string }[],
): Promise<number> {
  const stamp = now();
  for (const row of rows) {
    await db
      .insert(promoters)
      .values({ id: id(), createdAt: stamp, tier: 'SP3', ...row })
      .onConflictDoUpdate({
        target: promoters.agentId,
        set: { name: row.name, phone: row.phone, email: row.email },
      });
  }
  return rows.length;
}

/**
 * Self-service profile edits. Neither the phone (identity) nor the tier (what
 * the training certifies) can be reached from here — only an admin moves
 * somebody up a tier.
 */
export async function updatePromoter(
  db: Db,
  promoterId: string,
  input: { name: string; email: string | null },
): Promise<void> {
  await db.update(promoters).set(input).where(eq(promoters.id, promoterId));
}

/* ------------------------------------------------------------------- photos */

/**
 * The bytes are never selected next to a promoter row — only this function and
 * the route that streams the image ever touch them.
 */
export async function setPromoterPhoto(
  db: Db,
  promoterId: string,
  input: { mime: string; data: ArrayBuffer },
): Promise<void> {
  await db
    .insert(promoterPhotos)
    .values({
      promoterId,
      mime: input.mime,
      data: input.data,
      updatedAt: now(),
    })
    .onConflictDoUpdate({
      target: promoterPhotos.promoterId,
      set: { mime: input.mime, data: input.data, updatedAt: now() },
    });
}

export function getPromoterPhoto(
  db: Db,
  promoterId: string,
): Promise<PromoterPhoto | undefined> {
  return db
    .select()
    .from(promoterPhotos)
    .where(eq(promoterPhotos.promoterId, promoterId))
    .get();
}

export async function deletePromoterPhoto(
  db: Db,
  promoterId: string,
): Promise<void> {
  await db
    .delete(promoterPhotos)
    .where(eq(promoterPhotos.promoterId, promoterId));
}

/**
 * Whether to render an `<img>` or initials — asked on every page load, so it
 * reads the timestamp and leaves the blob where it is.
 */
export async function photoUpdatedAt(
  db: Db,
  promoterId: string,
): Promise<string | null> {
  const row = await db
    .select({ updatedAt: promoterPhotos.updatedAt })
    .from(promoterPhotos)
    .where(eq(promoterPhotos.promoterId, promoterId))
    .get();
  return row?.updatedAt ?? null;
}

/** Same question, asked for a page full of people at once. */
export async function photoOwners(
  db: Db,
  promoterIds: string[],
): Promise<Set<string>> {
  if (promoterIds.length === 0) return new Set();
  const rows = await db
    .select({ promoterId: promoterPhotos.promoterId })
    .from(promoterPhotos)
    .where(inArray(promoterPhotos.promoterId, promoterIds))
    .all();
  return new Set(rows.map((r) => r.promoterId));
}

export type PromoterRow = {
  promoter: Promoter;
  attempts: number;
  lastAttemptAt: string | null;
  /** Best percentage across submitted attempts; null until one is submitted. */
  bestPercent: number | null;
  everPassed: boolean;
  /** When their photo was last uploaded — the cache key, not the image. */
  photoAt: string | null;
};

/**
 * The admin's promoter directory: one row per person, not per attempt.
 *
 * `search` matches the name only — a phone number must never appear in a URL,
 * and this runs from a GET form.
 */
export async function listPromoters(
  db: Db,
  opts: { search?: string; limit?: number } = {},
): Promise<PromoterRow[]> {
  const rows = await db
    .select({
      promoter: promoters,
      attempts: sql<number>`COUNT(${attempts.id})`,
      lastAttemptAt: sql<string | null>`MAX(${attempts.startedAt})`,
      bestPercent: sql<
        number | null
      >`MAX(CASE WHEN ${attempts.submittedAt} IS NOT NULL AND ${attempts.total} > 0 THEN ROUND(CAST(${attempts.score} AS REAL) * 100 / ${attempts.total}) END)`,
      everPassed: sql<number>`MAX(CASE WHEN ${attempts.passed} = 1 THEN 1 ELSE 0 END)`,
      photoAt: promoterPhotos.updatedAt,
    })
    .from(promoters)
    .leftJoin(attempts, eq(attempts.promoterId, promoters.id))
    .leftJoin(promoterPhotos, eq(promoterPhotos.promoterId, promoters.id))
    .where(opts.search ? like(promoters.name, `%${opts.search}%`) : undefined)
    .groupBy(promoters.id)
    .orderBy(desc(sql`MAX(${attempts.startedAt})`), desc(promoters.createdAt))
    .limit(opts.limit ?? 200)
    .all();

  return rows.map((row) => ({
    promoter: row.promoter,
    attempts: Number(row.attempts ?? 0),
    lastAttemptAt: row.lastAttemptAt,
    bestPercent: row.bestPercent === null ? null : Number(row.bestPercent),
    everPassed: Number(row.everPassed ?? 0) === 1,
    photoAt: row.photoAt ?? null,
  }));
}

/* ------------------------------------------------------------------ attempts */

export async function createAttempt(
  db: Db,
  promoterId: string,
): Promise<Attempt> {
  const rows = await db
    .insert(attempts)
    .values({ id: id(), promoterId, startedAt: now() })
    .returning();
  return rows[0]!;
}

export function getAttempt(
  db: Db,
  attemptId: string,
): Promise<Attempt | undefined> {
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
    .where(
      and(
        eq(answers.attemptId, input.attemptId),
        eq(answers.questionId, input.question.id),
      ),
    )
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
  const done = new Set(
    answered.map((a) => a.questionId).filter(Boolean) as string[],
  );
  const question = active.find((q) => !done.has(q.id)) ?? null;
  return {
    question,
    answered: active.filter((q) => done.has(q.id)).length,
    total: active.length,
  };
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

/** The tabs above the attempts table. `all` is the default and adds no clause. */
export type AttemptFilter = "all" | "passed" | "failed" | "in-progress";

const FILTER_CLAUSE = {
  all: undefined,
  passed: and(isNotNull(attempts.submittedAt), eq(attempts.passed, true)),
  failed: and(isNotNull(attempts.submittedAt), eq(attempts.passed, false)),
  "in-progress": isNull(attempts.submittedAt),
} as const;

/** Unpaginated by design would degrade past ~500 rows, so it takes a window. */
export function listAttempts(
  db: Db,
  limit = 100,
  offset = 0,
  filter: AttemptFilter = "all",
): Promise<AttemptRow[]> {
  return db
    .select({ attempt: attempts, promoter: promoters })
    .from(attempts)
    .innerJoin(promoters, eq(promoters.id, attempts.promoterId))
    .where(FILTER_CLAUSE[filter])
    .orderBy(desc(attempts.startedAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export async function countAttempts(db: Db): Promise<number> {
  const row = await db
    .select({ n: sql<number>`COUNT(*)` })
    .from(attempts)
    .get();
  return row?.n ?? 0;
}

export function listAttemptsForPromoter(
  db: Db,
  promoterId: string,
): Promise<Attempt[]> {
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
    db
      .select({ n: sql<number>`COUNT(DISTINCT ${attempts.promoterId})` })
      .from(attempts)
      .get(),
    db
      .select({
        n: sql<number>`SUM(CASE WHEN ${attempts.passed} = 1 THEN 1 ELSE 0 END)`,
      })
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
    .select({
      snapshot: answers.questionSnapshot,
      isCorrect: answers.isCorrect,
    })
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
  let mostMissed: DashboardStats["mostMissed"] = null;
  for (const [prompt, entry] of tally) {
    if (entry.missed === 0) continue;
    if (!mostMissed || entry.missed > mostMissed.missed)
      mostMissed = { prompt, ...entry };
  }

  const split = { slides: 0, video: 0, unset: 0 };
  for (const row of formats) {
    if (row.mode === "slides") split.slides = Number(row.n);
    else if (row.mode === "video") split.video = Number(row.n);
    else split.unset = Number(row.n);
  }

  return {
    attempts: Number(totals?.attempts ?? 0),
    completed,
    uniquePromoters: Number(unique?.n ?? 0),
    passRate:
      completed === 0
        ? null
        : Math.round((Number(passes?.n ?? 0) / completed) * 100),
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
