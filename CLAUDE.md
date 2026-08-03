# Pluck Sales Promoter Training

Server-rendered training + quiz app for Nigerian field sales promoters. One Hono
Worker, `hono/jsx` SSR, D1 via Drizzle. Every page is HTML; every mutation is a
form POST that writes and redirects. No client framework, no hydration, no JSON API.

The design docs this was built from live in `docs/`: `tech-stack.md`,
`architecture.md`, `flow.md`, `development.md`.

## Component structure

Adapted from the project's SolidJS component convention — the rules are the same,
the runtime is not (these are server-rendered `hono/jsx` components, so there are
no signals, resources, or client-side state anywhere).

1. **One component per file** under `src/components/`, default-exported and named
   to match the file (`ProgressRail.tsx` exports `ProgressRail`).
2. **Components are grouped by navigation area**: `common/` (shell and chrome
   shared by both), `agent/` (the five agent screens), `admin/` (the dashboard).
3. **Pages are composition roots.** `src/pages/*.tsx` (and `src/pages/admin/*.tsx`)
   import top-level components and return a shallow tree. No markup beyond layout
   wrappers and simple conditionals belongs in a page — the SolidJS convention's
   `App.tsx` rule, applied per page since each route renders its own document.
4. **Co-locate CSS**: `ComponentName.css` next to `ComponentName.tsx`, imported
   from the component file. Shared/global styles stay in `src/App.css`.
5. When a component grows distinct visual sections, extract each into its own file
   under the matching area folder — prefer many small files over one large file.

`npm run build:css` concatenates `src/App.css` + every `src/components/**/*.css`
into `public/styles.css`, which is what the browser actually loads. It runs
automatically before `dev` and `deploy`. The `.css` imports inside components are
for co-location only; `wrangler.toml` has a `[[rules]]` entry treating `.css` as
text so the bundler doesn't choke on them.

## Layers

```
src/
  index.tsx           app, global middleware, route mounting
  routes/             agent.tsx, admin.tsx — handlers only, no SQL, no markup
  pages/              one composition root per screen
  components/         common/ agent/ admin/ — UI + co-located CSS
  db/schema.ts        drizzle tables
  db/queries.ts       ALL database access
  lib/                session, phone, drive, scoring, validators, format
  types.ts            Bindings and Env
```

**Nothing outside `db/queries.ts` imports drizzle.** It keeps SQL out of handlers
and makes a future D1 → Postgres swap a single-file job.

## Rules that are load-bearing

- **`correct_index` never reaches the browser.** The server renders options only.
  Check view-source after touching the quiz.
- **The tutorial gate is server-enforced** in `POST /learn/continue` and again on
  `GET /quiz`. `public/app.js` is a countdown display and nothing else.
- **Every answer stores a `questionSnapshot`.** Editing a question must not
  rewrite historical results. Read past answers from the snapshot, never from the
  live question.
- **Pass rule**: `score >= passMark%` **and** every `isCritical` question correct.
  Lives in `lib/scoring.ts`; do not re-implement it in a route.
- **Phone is the identity column**, normalized to `+234XXXXXXXXXX` on write.
  Email is optional. Never put a phone number in a URL or a log line.
- **Deactivate questions, never delete them** — deleting orphans historical answers.
- **Every mutation is a cookie-authenticated form POST**, so `csrf()` is mandatory
  and both cookies are signed.
- **Mobile first, literally**: 48px minimum tap targets, nothing below 16px, one
  150ms transition. `#FF2E00` appears on missed answers and nowhere else.

## Commit style

Conventional Commits, one concern per commit.

```
<type>(<scope>): <summary in the imperative, lower case, no full stop>

<why this change, if it isn't obvious from the diff — wrap at 72>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style` (formatting
only), `perf`. Breaking changes take a `!` before the colon and a
`BREAKING CHANGE:` footer.

**Scopes** are the layers in this repo, so a scope tells you which folder moved:
`auth`, `learn`, `quiz`, `admin`, `db`, `lib`, `ui`, `infra`, `seed`, `docs`.

```
feat(quiz): score answers on write and store a question snapshot
fix(admin): scope the attempt guard so it stops hijacking /admin
refactor(ui): group components by navigation area
docs: record the deck's four internal contradictions
```

Rules that matter here:

- **Never commit `.dev.vars`, a real passcode, a session secret, or a promoter's
  phone number** — not in a message, not in a fixture.
- A commit that changes `db/schema.ts` includes its generated migration.
- Keep the subject under ~72 characters and skip the trailing period.

## Commands

```bash
npm run dev              # build:css + wrangler dev
npm test                 # vitest: phone, drive, scoring
npm run typecheck
npm run db:generate      # drizzle-kit generate after a schema change
npm run setup:local      # apply migrations + seed to local D1
npm run deploy
```

## Known gaps (say them before you're asked)

No agent authentication — a promoter can type a colleague's name; the fix is an
OTP. The admin passcode is one shared secret with no audit trail. The gate proves
elapsed time, not attention. `/admin` is windowed at 200 rows, not paginated.
