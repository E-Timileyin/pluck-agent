import { sqliteTable, text, integer, index, customType } from 'drizzle-orm/sqlite-core';

/**
 * A BLOB column that hands D1 the bytes and takes them back unchanged.
 *
 * Drizzle's own `blob({ mode: 'buffer' })` maps to a Node Buffer, which workerd
 * does not have — an ArrayBuffer passed to it is stringified on the way in, and
 * what comes back out is the text "137,80,78,71,…" rather than a PNG. D1 binds
 * an ArrayBuffer as a BLOB natively, so the honest mapping is no mapping.
 */
const bytes = customType<{ data: ArrayBuffer; driverData: ArrayBuffer | number[] }>({
  dataType: () => 'blob',

  // D1 binds an ArrayBuffer as a BLOB natively, so writing is a pass-through.
  toDriver: (value) => value,

  // Reading is not: D1 hands a BLOB back as a plain array of byte values, and
  // handing that to a Response body yields the *text* "137,80,78,71,…" — a
  // 205-byte "image" that every browser refuses to draw.
  fromDriver: (value) => (Array.isArray(value) ? new Uint8Array(value).buffer : value),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(), // always 1
  videoUrl: text('video_url'),
  slidesUrl: text('slides_url'),
  minTutorialSeconds: integer('min_tutorial_seconds').notNull().default(45),
  passMark: integer('pass_mark').notNull().default(80),
  /**
   * Who a stuck promoter should contact. Both optional: the Support screen says
   * plainly that no desk is published rather than inventing a number.
   */
  supportPhone: text('support_phone'), // stored as +234XXXXXXXXXX
  supportEmail: text('support_email'),
  updatedAt: text('updated_at').notNull(),
});

/**
 * Named accounts for the training console. This replaces the single shared
 * passcode: every sign-in is now somebody, and `lastLoginAt` is the beginning
 * of the audit trail the README lists as missing.
 *
 * `passwordHash` is the self-describing PBKDF2 string from lib/password.ts —
 * never a raw password, and never reversible.
 */
export const admins = sqliteTable('admins', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(), // stored lower-cased
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
  lastLoginAt: text('last_login_at'),
});

export const questions = sqliteTable(
  'questions',
  {
    id: text('id').primaryKey(),
    prompt: text('prompt').notNull(),
    options: text('options', { mode: 'json' }).$type<string[]>().notNull(),
    correctIndex: integer('correct_index').notNull(),
    orderIndex: integer('order_index').notNull().default(0),
    isCritical: integer('is_critical', { mode: 'boolean' }).notNull().default(false),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
  },
  (t) => ({ active: index('q_active_order').on(t.isActive, t.orderIndex) }),
);

export const promoters = sqliteTable('promoters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(), // stored as +234XXXXXXXXXX
  tier: text('tier', { enum: ['SP1', 'SP2', 'SP3'] })
    .notNull()
    .default('SP3'),
  email: text('email'), // optional
  createdAt: text('created_at').notNull(),
});

/**
 * Profile photos, one per sales agent, kept out of `promoters` on purpose: that
 * row is read on every single request to build the shell, and a blob column
 * would be dragged along with it every time.
 *
 * The bytes live in D1 rather than R2 so the app keeps exactly one storage
 * binding. That is a size ceiling, not a free lunch — the upload route caps
 * what it accepts, and there is no resizing at the edge to fall back on.
 */
export const promoterPhotos = sqliteTable('promoter_photos', {
  promoterId: text('promoter_id')
    .primaryKey()
    .references(() => promoters.id, { onDelete: 'cascade' }),
  mime: text('mime').notNull(),
  data: bytes('data').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const attempts = sqliteTable(
  'attempts',
  {
    id: text('id').primaryKey(),
    promoterId: text('promoter_id')
      .notNull()
      .references(() => promoters.id, { onDelete: 'cascade' }),
    tutorialMode: text('tutorial_mode', { enum: ['video', 'slides'] }),
    tutorialStartedAt: text('tutorial_started_at'),
    startedAt: text('started_at').notNull(),
    attestedAt: text('attested_at'),
    submittedAt: text('submitted_at'),
    score: integer('score'),
    total: integer('total'),
    passed: integer('passed', { mode: 'boolean' }),
  },
  (t) => ({ byPromoter: index('a_promoter_started').on(t.promoterId, t.startedAt) }),
);

export const answers = sqliteTable(
  'answers',
  {
    id: text('id').primaryKey(),
    attemptId: text('attempt_id')
      .notNull()
      .references(() => attempts.id, { onDelete: 'cascade' }),
    questionId: text('question_id').references(() => questions.id, { onDelete: 'set null' }),
    questionSnapshot: text('question_snapshot', { mode: 'json' })
      .$type<QuestionSnapshot>()
      .notNull(),
    selectedIndex: integer('selected_index'),
    isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
    answeredAt: text('answered_at').notNull(),
  },
  (t) => ({ byAttempt: index('ans_attempt').on(t.attemptId) }),
);

export type QuestionSnapshot = {
  prompt: string;
  options: string[];
  correctIndex: number;
  isCritical: boolean;
};

export type Settings = typeof settings.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type PromoterPhoto = typeof promoterPhotos.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Promoter = typeof promoters.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type Tier = Promoter['tier'];
export type TutorialMode = NonNullable<Attempt['tutorialMode']>;
