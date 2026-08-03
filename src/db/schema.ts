import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(), // always 1
  videoUrl: text('video_url'),
  slidesUrl: text('slides_url'),
  minTutorialSeconds: integer('min_tutorial_seconds').notNull().default(45),
  passMark: integer('pass_mark').notNull().default(80),
  updatedAt: text('updated_at').notNull(),
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
export type Question = typeof questions.$inferSelect;
export type Promoter = typeof promoters.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type Tier = Promoter['tier'];
export type TutorialMode = NonNullable<Attempt['tutorialMode']>;
