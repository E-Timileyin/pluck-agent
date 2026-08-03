# Development

## Timeline

**Roughly 7 hours** of focused work. The attestation screen and the critical-question rule add about 90 minutes to the earlier estimate; both earn it back in the demo.

Milestones are ordered so that if you run out of time you stop at M5 and still have something to show. M6 and M7 are polish you can narrate instead of demo.

## Setup

```bash
npm create hono@latest pluck-training      # choose: cloudflare-workers
cd pluck-training

npm i drizzle-orm zod @hono/zod-validator
npm i -D drizzle-kit wrangler @cloudflare/workers-types

npx wrangler d1 create pluck-training --location weur
# paste the printed database_id into wrangler.toml
```

`--location weur` matters. The default may place your primary in North America; western Europe is the closest hint to Lagos and every write pays the difference.

`tsconfig.json` for `hono/jsx` — miss this and every `.tsx` fails to compile:
```json
{ "compilerOptions": { "jsx": "react-jsx", "jsxImportSource": "hono/jsx" } }
```

`drizzle.config.ts`:
```ts
export default {
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
};
```

```bash
npx drizzle-kit generate
npx wrangler d1 migrations apply pluck-training --local
npx wrangler d1 execute pluck-training --local --file=./seed.sql
npx wrangler dev
```

Secrets: `npx wrangler secret put ADMIN_PASSCODE` and `SESSION_SECRET`. For local dev put the same values in `.dev.vars` and add it to `.gitignore`.

## Milestones

**M1 — Foundation (60 min)**
Wrangler config, D1 binding, Drizzle schema, first migration with `PRAGMA foreign_keys = ON`. Global middleware. `views/layout.tsx` with the progress rail. `styles.css` with the Pluck palette and 48px tap targets. Session helpers. `lib/phone.ts` with all four input formats tested. `lib/drive.ts` with both link shapes tested.
*Done when:* a route reads `settings` from local D1 and renders it.

**M2 — Promoter identity (45 min)**
`/` form with name, phone, tier. `POST /start`, phone normalization, promoter upsert, attempt creation, signed cookie, redirect.
*Done when:* `08012345678` and `+234 801 234 5678` produce **one** promoter row and two attempts.

**M3 — Training screen (60 min)**
Choice cards with slides first and the video labelled with its size. Both embeds. `tutorial_started_at` stamping. **Server-side gate check.** Countdown in `app.js`. Config-missing empty state.
*Done when:* both Drive files play inside the app, and `curl -X POST /learn/continue` immediately after choosing a mode is rejected.

**M4 — Quiz (90 min)**
`GET /quiz` renders the next unanswered question. `POST /quiz/answer` scores and writes with snapshot. Full-width tap rows.
*Done when:* a full run scores correctly, killing the connection mid-quiz and reloading resumes at the right question, and view-source contains no answer key.

**M5 — Attestation, results, admin (150 min)**
`/attest` with the four rules and the checkbox. Finalization including the critical-question rule. Results page with review. Then: passcode login, guard middleware, attempts table, four tiles, questions CRUD, settings.
*Done when:* you can author a question in the dashboard, take the quiz as a promoter, and see that attempt appear with its attestation timestamp. **This is the demo.**

**M6 — Promoter detail (30 min)**
Per-promoter history and per-question breakdown from snapshots.

**M7 — Polish (45 min)**
Empty states, inline form errors, **real device test**, visible keyboard focus.

## Seed and demo data

`seed.sql` ships with 14 questions and default settings. Mark the compliance questions critical:

```sql
UPDATE questions SET is_critical = 1 WHERE id IN ('q07','q08','q09');
```

Then add demo promoters before presenting — **not during**:

- Five promoters with varied results: one perfect, two passes, one fail, one repeat attempt showing improvement between the two. A dashboard with one row proves nothing. **The repeat-attempt promoter is what sells the concept**, because it shows the tool measuring improvement rather than recording a number.
- Mix the tiers — include at least one SP2, so the tier column has a job.
- Make one commission question missed by three of five, so the most-missed tile has something to say. Commission is the right one to fake as most-missed, because the deck genuinely does contradict itself there and it sets up the point in step 4 of the demo.
- Make one promoter fail on a critical question despite a decent score, so you can show the rule working.

## Verify before presenting

- [ ] **Open it on a real Android phone on mobile data**, not a desktop browser at 375px. This is the check that finds the actual problems: tap targets, iframe sizing, the Slides embed on a small screen.
- [ ] View-source on `/quiz` contains no correct-answer marker
- [ ] `curl -X POST /learn/continue` immediately after mode selection → rejected
- [ ] `08012345678` and `+2348012345678` resolve to one promoter
- [ ] Quiz cannot be submitted without the attestation checkbox
- [ ] A promoter scoring 12/14 but missing a critical question is marked failed
- [ ] `/admin` redirects to login in a private window
- [ ] `admin_session=anything` in devtools does **not** grant access
- [ ] `/results/<random-uuid>` without the cookie → 404
- [ ] Both Drive embeds load **in a private window** — catches sharing-permission mistakes, the single most common thing that kills a live demo
- [ ] Editing a question does not change an existing result
- [ ] Zero active questions → empty state, not a crash
- [ ] Remote migrations applied, not just local
- [ ] No phone numbers in logs

## Deploy

```bash
npx wrangler d1 migrations apply pluck-training --remote
npx wrangler d1 execute pluck-training --remote --file=./seed.sql
npx wrangler deploy
```

Do a throwaway deploy at M4, not at the end. A first deploy always surfaces something — usually a missing secret or an unapplied remote migration — and you don't want to find it during the demo. Check `*.workers.dev` isn't blocked on your office network while you're at it.

## Demo script

Six minutes.

1. **Open the empty questions dashboard and add a question live.** This lands "you can change the training yourself, without a developer" in fifteen seconds and it's the strongest thing you have.
2. **Switch to the agent URL on your phone**, not a desktop window. Enter a name and phone, pick the slides, hit the gate — pause and say it proves elapsed time, not comprehension, and that the quiz is what proves comprehension. Answer a few questions, get one wrong on purpose.
3. **Hit the attestation screen and stop there.** This is the moment worth the pause: *"Every promoter now has a timestamped record that they were shown the rules on customer payments and asset recovery, and answered questions on them. If someone later collects payments into their own account, we have this."* That reframes the app from training to compliance, which is a different budget.
4. **Back to the dashboard.** New row, attestation timestamp, then the most-missed tile — the only thing on screen that says something about the *training material* rather than the promoters. Then say: **the deck contradicts itself on commission in four places**, and this is the tool that would have caught it. You found it by reading; the dashboard would have found it by watching everyone miss the same question.
5. **State the gaps before you're asked:** no login means a promoter can enter a colleague's name (fixable with an OTP, about a day); the timer proves time, not attention; the admin passcode is shared. Naming your own gaps reads as judgment. Having them found reads as oversight.

## Open questions blocking work

1. **Phone or email as the identifier?** Confirm before M2 — changing it later is a migration.
2. **Is ₦7,290 the daily or weekly motorcycle repayment?** Slide 5 says "Daily/Weekly" and neither reading produces a sane total. Blocks two more quiz questions.
3. **Which earning figures are correct** — slide 7's ₦75,000/week, or the speaker notes' ₦196,667/month? They imply different commission rates. Blocks the highest-value questions in the set.
4. **Do SP1/SP2/SP3 need different training?** If yes within a month, add `course_id` at M1 rather than migrating later.
