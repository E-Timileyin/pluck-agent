# Tech Stack — Pluck Sales Promoter Training

## What the deck changed

Reading the actual deck moved three assumptions I had wrong:

**Your users are field agents, not office staff.** Sales promoters work in their own communities, selling smartphones, solar systems and motorcycles door to door. They are on personal Android phones, on mobile data, often on 3G. Mobile-first is now a requirement, not polish. Every "we'll check mobile at the end" decision gets reversed.

**Email is probably the wrong identifier.** I specced name + email. Nigerian field promoters frequently have no work email and inconsistent personal ones. **Phone number is the identifier your business already uses** — it's how you contact them, how they're onboarded, likely how they're paid. Switch to name + phone, keep email optional. Flagged again in `flow.md`; confirm before M2.

**This is a compliance record, not just training.** Slide 14 covers agents collecting customer payments into personal accounts, asset recovery conduct, and customer data breaches — with suspension and legal action as consequences. Once you quiz someone on that and store the result, you own a timestamped record that a named agent was told the rules and demonstrated they understood them. That is worth more to your boss than a score. It costs one checkbox to make explicit. See the attestation step in `flow.md`.

## Decision

| Layer | Choice | Why |
|---|---|---|
| Framework | **Hono 4** | Your constraint. |
| Runtime | **Cloudflare Workers** | Cloudflare has a Lagos PoP, so SSR responses come from close by rather than us-east. On 3G that difference is felt. |
| Rendering | **`hono/jsx`, server-side** | Built in. No React, no client bundle, no hydration cost on a ₦40,000 Android phone. |
| Client JS | **~40 lines, one file** | A countdown. Nothing else. |
| Database | **Cloudflare D1** (SQLite), `--location weur` | Binding, not a connection string. Set the location hint at creation — the default may put your primary in North America and every write pays for it. |
| Query layer | **Drizzle ORM** | Type-safe queries and real migrations. Raw SQL across 20 endpoints means typos found at runtime. |
| Validation | **Zod + `@hono/zod-validator`** | Every POST. |
| Cookies | **`hono/cookie` signed cookies** | Built-in HMAC. |
| Styling | **One hand-written `styles.css`** | ~200 lines. Tailwind adds a build step; shadcn is React-only and doesn't apply. |
| Hosting | **Cloudflare Workers** | Same command as the DB. |

## Database

**Cloudflare D1.** Same vendor and same deploy as the Worker, provisioned in one command, free tier covers 5 GB and 5M row reads/day against your few thousand rows.

| Alternative | When to take it |
|---|---|
| **Neon** (serverless Postgres) | If Pluck standardizes on Postgres, or you want `jsonb` and window functions. HTTP driver works on Workers. |
| **Supabase** | If non-engineers need a table-editor GUI to eyeball data. Over-provisioned otherwise. |
| **Turso** | D1's pitch from a second vendor. No reason when you're already on Cloudflare. |
| **Mongo** | No. Agents have attempts, attempts have answers, answers reference questions. Four foreign keys deep. |

D1's costs, known up front: no `jsonb` (JSON lives in `TEXT`, parsed in app code), no `citext` (normalize phone numbers yourself), no native UUID (`crypto.randomUUID()`), single-region writes. Migrating to Postgres later is five tables and one file, provided all Drizzle calls stay in `db/queries.ts`.

## The mobile data problem

Nobody has raised this yet and it will decide whether agents finish the training.

A five-minute Drive video is roughly 50–80 MB. On Nigerian mobile data that's a real cost to the agent, on a personal bundle, for a task their employer assigned. On 3G it also buffers badly enough that some will give up.

The deck is the cheap path — a Google Slides embed is a few hundred KB.

**Recommendation:** keep both options, but present the slides first and label the video with its approximate size. Then watch `tutorial_mode` in the dashboard for the first week. If almost nobody picks video, you have your answer, and you saved yourself producing more of them. That single column is the most useful piece of telemetry in the app, and it's free.

If video does matter, host it on a platform with adaptive bitrate rather than Drive. Drive serves one file at one quality.

## Non-goals

- Agent authentication or SSO
- Video watch-progress tracking (server-enforced timer stands in)
- Retake limits, question randomization
- CSV export, charts, date filters
- Email or SMS notifications
- Multiple courses — one module, one quiz
- Tier-based content (SP1/SP2/SP3 see the same training)

## Security

1. **The admin passcode is not authentication.** One shared secret, no audit trail. Replace before real rollout.
2. **Drive files must be "anyone with the link."** The deck contains commission rates, promotion criteria and internal targets. Anyone holding the URL sees them. Say this to your boss before the demo, not after.
3. **Correct answers never reach the browser.** The server renders options; `correct_index` stays server-side. SSR makes this easy — just never put it in the markup.
4. **CSRF.** Every mutation is a cookie-authenticated form POST. Mount `csrf()` from `hono/csrf`.
5. **Sign the admin cookie.** Unsigned means anyone types `admin_session=1` in devtools and walks in.
6. **Phone numbers are personal data.** The deck itself threatens penalties for customer data breaches — apply the same standard to your promoters' numbers. Don't log them, don't put them in URLs.

## Environment

`wrangler.toml`:
```toml
name = "pluck-training"
main = "src/index.tsx"
compatibility_date = "2025-01-01"
assets = { directory = "./public" }

[[d1_databases]]
binding = "DB"
database_name = "pluck-training"
database_id = "<from wrangler d1 create>"
```

Secrets: `wrangler secret put ADMIN_PASSCODE`, `wrangler secret put SESSION_SECRET` (32+ random chars).

## Visual direction

Palette lifted from the deck itself, so the app and the training material read as one thing:

```
Green      #09B34F   primary action, active step, pass state
Deep       #045023   headers, footer, high-emphasis text
Mint       #DBFFE5   selected option, tile backgrounds
Ink        #1E1E1E   body text
Grey       #737373   labels, secondary text
Paper      #FFFFFF   surfaces
Miss       #FF2E00   missed answers only
```

- **Type:** system stack, one family. Question prompts at 20px/1.4 — the only text that matters on the screen. Nothing below 16px, because these are outdoor screens in daylight.
- **Targets:** every tappable element at least 48px tall. Options are full-width rows, not radio dots — agents are answering one-handed, possibly standing in a market.
- **Signature element:** a persistent Learn → Quiz → Result rail across the top of every agent screen, in Deep with the active step in Green. It's what makes this read as a course rather than a form, and on a small screen it's the only thing telling a distracted agent how much is left.
- Restraint everywhere else. No gradients, no illustration, one 150ms state transition. `#FF2E00` appears only on missed answers, so it carries meaning.
