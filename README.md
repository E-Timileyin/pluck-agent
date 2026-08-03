# Pluck Sales Promoter Training

A five-screen training and quiz for Pluck sales promoters, plus an admin
dashboard. Server-rendered Hono on Cloudflare Workers, D1 for storage.

Agents are field promoters on personal Android phones and mobile data, often on
3G — every decision here follows from that. See `docs/` for the reasoning
(`tech-stack.md`, `architecture.md`, `flow.md`, `development.md`) and `CLAUDE.md`
for the conventions this codebase follows.

```
/                     name + phone + tier
/learn                slides or video, server-enforced time gate
/quiz                 one question per screen, scored on the server
/attest               the compliance checkbox
/results/:attemptId   score, pass/fail, per-question review
```

## Setup

```bash
npm install
cp .dev.vars.example .dev.vars      # then edit both values

npx wrangler d1 create pluck-training --location weur
# paste the printed database_id into wrangler.toml
```

`--location weur` matters: the default may put your primary in North America and
every write from Lagos pays the difference.

```bash
npm run db:generate                 # only after a schema change
npm run setup:local                 # migrations + seed into local D1
npm run dev
```

The seed ships 14 questions drawn from unambiguous slides, with `q07`–`q09`
marked compliance-critical. Four topics were deliberately left out because the
deck contradicts itself — the notes at the bottom of `seed.sql` say which.

## Deploy

```bash
npx wrangler secret put ADMIN_PASSCODE
npx wrangler secret put SESSION_SECRET      # 32+ random chars
npm run db:migrate:remote
npm run db:seed:remote
npm run deploy
```

Do a throwaway deploy early, not at the end — a first deploy always surfaces
something, usually a missing secret or an unapplied remote migration.

## Before demoing

- [ ] Open it on a real Android phone on mobile data, not a desktop at 375px
- [ ] View-source on `/quiz` contains no correct-answer marker
- [ ] `curl -X POST /learn/continue` right after picking a mode → rejected
- [ ] `08012345678` and `+2348012345678` resolve to one promoter
- [ ] No result without the attestation checkbox
- [ ] 12/14 with a missed compliance question → failed
- [ ] `/admin` redirects to login in a private window
- [ ] `admin_session=anything` in devtools does **not** grant access
- [ ] `/results/<random-uuid>` without the cookie → 404
- [ ] Both Drive embeds load **in a private window** — sharing-permission
      mistakes are the single most common thing that kills a live demo
- [ ] Editing a question does not change an existing result
- [ ] Zero active questions → empty state, not a crash

## Known gaps

No agent login: a promoter can enter a colleague's name. The fix is an OTP to
that phone number — about a day of work plus a Termii account. The gate proves
elapsed time, not attention; the quiz is what proves comprehension. The admin
passcode is one shared secret with no audit trail, and it is not authentication.
The Drive files must be "anyone with the link", and the deck contains commission
rates and internal targets — say that before the demo, not after.
