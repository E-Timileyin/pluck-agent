# Architecture — Hono on Cloudflare Workers

## Shape

One Worker. Every page is server-rendered HTML; every mutation is a form POST that writes and redirects. No JSON API, no client framework, no hydration.

```
Browser ──form POST──► Hono route ──► zValidator ──► Drizzle ──► D1 binding (env.DB)
        ◄──302────────┘
        ◄──SSR HTML─── hono/jsx

Google Drive ◄── iframe, client-side only, no API
```

This is why Hono works here: the app is forms and tables. It never needed a client framework, and on a low-end Android phone on 3G, not shipping one is a feature.

## File tree

```
src/
  index.tsx              # app, global middleware, route mounting
  routes/
    agent.tsx            # /, /learn, /quiz, /attest, /results/:id
    admin.tsx            # /admin/*
  db/
    schema.ts            # drizzle table definitions
    queries.ts           # ALL database access — nothing else imports drizzle
  lib/
    session.ts           # signed cookie helpers
    phone.ts             # Nigerian number normalization
    drive.ts             # share link → embed URL
    validators.ts        # every zod schema
  views/
    layout.tsx           # shell, progress rail
    agent.tsx
    admin.tsx
migrations/
public/
  styles.css
  app.js                 # countdown display only
wrangler.toml
seed.sql
```

Keeping Drizzle imports confined to `db/queries.ts` is worth enforcing. It keeps SQL out of route handlers and makes a future D1 → Postgres swap a single-file job.

## Routes

| Method | Path | Does |
|---|---|---|
| GET | `/` | Get-started form. Resumes to the current step if a cookie exists. |
| POST | `/start` | Validate name, phone, tier. Upsert promoter, create attempt, set cookie → `/learn` |
| GET | `/learn` | Choice cards, or the embed if a mode is set |
| POST | `/learn/mode` | Set `tutorial_mode`, stamp `tutorial_started_at` → `/learn` |
| POST | `/learn/continue` | **Server-checks elapsed ≥ gate** → `/quiz` |
| GET | `/quiz` | Render next unanswered question |
| POST | `/quiz/answer` | Score one answer, write row with snapshot → `/quiz` or `/attest` |
| GET | `/attest` | Compliance confirmation screen |
| POST | `/attest` | Require checkbox, stamp `attested_at`, finalize score → `/results/:id` |
| GET | `/results/:id` | Score + review. Cookie-guarded. |
| POST | `/restart` | Clear cookie → `/` |
| GET/POST | `/admin/login` | Passcode |
| GET | `/admin` | Attempts table + four tiles |
| GET | `/admin/promoters/:id` | One promoter, all attempts |
| GET | `/admin/questions` | List + add/edit forms |
| POST | `/admin/questions`, `/:id`, `/:id/toggle` | CRUD |
| GET/POST | `/admin/settings` | Drive links, pass mark, gate seconds |

## Three decisions that differ from a conventional build

**1. The quiz holds no client state.** Each question is its own POST; the server writes the answer row and renders the next unanswered question. A dropped connection, a refresh or a dead battery resumes at the exact question. For field agents on 3G this is the difference between a completed training and an abandoned one. Cost is one small round trip per question.

**2. The tutorial gate is server-enforced.** `tutorial_started_at` is stamped on mode selection; `POST /learn/continue` compares it server-side and rejects early requests. The countdown in `app.js` is display only. A disabled button is defeated by devtools in five seconds.

**3. Scoring happens at answer time, finalization at attestation.** `is_correct` is computed and stored per answer. `POST /attest` totals them, applies `pass_mark`, applies the critical-question rule, and stamps `submitted_at`. This means an abandoned attempt has real partial data in the DB — useful for spotting where people drop out.

## Schema (Drizzle, D1)

```ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id:                 integer('id').primaryKey(),           // always 1
  videoUrl:           text('video_url'),
  slidesUrl:          text('slides_url'),
  minTutorialSeconds: integer('min_tutorial_seconds').notNull().default(45),
  passMark:           integer('pass_mark').notNull().default(80),
  updatedAt:          text('updated_at').notNull(),
});

export const questions = sqliteTable('questions', {
  id:           text('id').primaryKey(),
  prompt:       text('prompt').notNull(),
  options:      text('options', { mode: 'json' }).$type<string[]>().notNull(),
  correctIndex: integer('correct_index').notNull(),
  orderIndex:   integer('order_index').notNull().default(0),
  isCritical:   integer('is_critical', { mode: 'boolean' }).notNull().default(false),
  isActive:     integer('is_active',   { mode: 'boolean' }).notNull().default(true),
  createdAt:    text('created_at').notNull(),
}, t => ({ active: index('q_active_order').on(t.isActive, t.orderIndex) }));

export const promoters = sqliteTable('promoters', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  phone:     text('phone').notNull().unique(),              // stored as +234XXXXXXXXXX
  tier:      text('tier', { enum: ['SP1', 'SP2', 'SP3'] }).notNull().default('SP3'),
  email:     text('email'),                                 // optional
  createdAt: text('created_at').notNull(),
});

export const attempts = sqliteTable('attempts', {
  id:                text('id').primaryKey(),
  promoterId:        text('promoter_id').notNull()
                       .references(() => promoters.id, { onDelete: 'cascade' }),
  tutorialMode:      text('tutorial_mode', { enum: ['video', 'slides'] }),
  tutorialStartedAt: text('tutorial_started_at'),
  startedAt:         text('started_at').notNull(),
  attestedAt:        text('attested_at'),
  submittedAt:       text('submitted_at'),
  score:             integer('score'),
  total:             integer('total'),
  passed:            integer('passed', { mode: 'boolean' }),
}, t => ({ byPromoter: index('a_promoter_started').on(t.promoterId, t.startedAt) }));

export const answers = sqliteTable('answers', {
  id:               text('id').primaryKey(),
  attemptId:        text('attempt_id').notNull()
                      .references(() => attempts.id, { onDelete: 'cascade' }),
  questionId:       text('question_id')
                      .references(() => questions.id, { onDelete: 'set null' }),
  questionSnapshot: text('question_snapshot', { mode: 'json' })
                      .$type<{ prompt: string; options: string[];
                               correctIndex: number; isCritical: boolean }>().notNull(),
  selectedIndex:    integer('selected_index'),
  isCorrect:        integer('is_correct', { mode: 'boolean' }).notNull(),
  answeredAt:       text('answered_at').notNull(),
}, t => ({ byAttempt: index('ans_attempt').on(t.attemptId) }));
```

Enable foreign keys in the first migration — SQLite does not by default:
```sql
PRAGMA foreign_keys = ON;
```

Three decisions worth defending:

**`questionSnapshot` on every answer row.** Denormalized on purpose. The deck has four internal contradictions (see the notes at the bottom of `seed.sql`); when those get fixed, the questions get edited. Historical results must not change underneath. Without the snapshot, editing a question rewrites every past attempt.

**`onDelete: 'set null'` on `questionId`.** A hard-deleted question shouldn't cascade away someone's result. The snapshot still renders the row.

**`isCritical`.** Compliance questions — customer payments into personal accounts, asset recovery conduct, data protection — are the ones with legal consequence attached. The pass rule is `score >= passMark% AND every critical question correct`. An agent who scores 12/14 but got "can I take customer payments myself?" wrong has not passed.

## Phone normalization

```ts
// 08012345678 | 8012345678 | 2348012345678 | +234 801 234 5678 → +2348012345678
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0'))  return '+234' + d.slice(1);
  if (d.length === 10)                       return '+234' + d;
  if (d.length === 13 && d.startsWith('234')) return '+' + d;
  return null;
}
```

Store normalized, display formatted. Without this the same promoter appears three times in the dashboard and the "unique promoters" tile is wrong.

## Session

| Cookie | Contents | Flags | Life |
|---|---|---|---|
| `attempt_id` | attempt UUID, signed | httpOnly, sameSite=Lax, secure | 8 h |
| `admin_session` | signed marker | httpOnly, sameSite=Lax, secure | 12 h |

Both via `setSignedCookie(c, name, value, c.env.SESSION_SECRET, opts)`.

Admin guard on the `/admin` router, exempting login:

```ts
admin.use('*', async (c, next) => {
  if (c.req.path === '/admin/login') return next();
  const s = await getSignedCookie(c, c.env.SESSION_SECRET, 'admin_session');
  if (!s) return c.redirect('/admin/login');
  await next();
});
```

Passcode comparison must be constant-time — compare hashes, not `===` on raw strings.

## Global middleware, in order

```ts
app.use('*', secureHeaders());
app.use('*', csrf({ origin: ALLOWED_ORIGIN }));
app.use('*', logger());   // never log phone numbers
```

`csrf()` is the one people skip. Every mutation here is a cookie-authenticated form POST — exactly the shape CSRF exploits. Next.js Server Actions handled this for you; Hono does not.

## Drive URL parsing

Admins paste normal share links. `lib/drive.ts` extracts the ID and stores the embed URL, so `/learn` does no parsing at render:

```ts
const VIDEO  = /\/file\/d\/([a-zA-Z0-9_-]+)/;          // drive.google.com/file/d/<ID>/view
const SLIDES = /\/presentation\/d\/([a-zA-Z0-9_-]+)/;  // docs.google.com/presentation/d/<ID>/edit

videoEmbed  = `https://drive.google.com/file/d/${id}/preview`;
slidesEmbed = `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false`;
```

Reject non-matching input with an inline error naming both accepted link shapes.

## What breaks first at scale

- **`/admin` table is unpaginated.** Degrades past ~500 attempts. Add `limit`/`offset`.
- **Most-missed tile** is computed in JS over all answers. Becomes a `GROUP BY` past a few thousand rows.
- **One round trip per question** is right for flaky connections but adds latency on good ones. Don't optimize until someone complains.
- **No `course_id` anywhere.** Multi-course later means a migration touching `questions`, `attempts` and `settings`. Given SP1/SP2/SP3 have genuinely different responsibilities in the deck, tier-specific training is a plausible next request — if it's likely within a month, add the column now. It's nearly free up front and awkward to retrofit.
