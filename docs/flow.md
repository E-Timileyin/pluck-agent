# Flow — Pluck Sales Promoter Training

## Agent path

```
/                     Get started      name + phone + tier
    ↓                                  creates promoter + attempt, sets cookie
/learn                Training         Slides (default) or Video
    ↓                                  server-enforced time gate
/quiz                 Quiz             one question per screen
    ↓                                  scored per answer, on the server
/attest               Confirmation     the compliance checkbox
    ↓
/results/[attemptId]  Result           score, pass/fail, per-question review
```

Five screens. An agent on 3G should finish in under fifteen minutes including the deck.

## 1. `/` — Get started

Pluck logo, "Sales Promoter Training", one line on what it is and how long it takes, then three fields and one button.

- **Full name** — required, 2–80 chars.
- **Phone number** — required, Nigerian format. Normalize to `+234XXXXXXXXXX` before storing so `08012345678`, `2348012345678` and `+234 801 234 5678` resolve to one promoter.
- **Tier** — SP3 / SP2 / SP1, defaulting to SP3. One tap, and it makes the dashboard answer "are my team leads actually completing this?" without extra work.

**Phone, not email.** I originally specced email. The deck describes field promoters working their own communities — many will have no work email and an inconsistent personal one. Phone is what Pluck already uses to reach them. Keep an optional email field if you want, but don't make it the key. **Confirm this before M2**; changing the identity column afterwards means a migration.

On submit: upsert promoter by normalized phone, insert an attempt, set the signed `attempt_id` cookie, redirect to `/learn`. Same phone twice = same promoter, new attempt. If a cookie already exists for an unsubmitted attempt, skip this screen and resume where they left off.

**Known hole:** an agent can type a colleague's name. Accepted for the prototype. Name it in the demo before someone else does; the fix is an OTP to that phone number, which is a day of work and a Termii account.

## 2. `/learn` — Training

Two choice cards. **Slides first, video second** — see the data-cost section in `tech-stack.md`. Label the video card with its approximate size, e.g. "Video — about 60 MB".

Picking one records `tutorial_mode`, stamps `tutorial_started_at`, and swaps the cards for the embed.

- Slides → `https://docs.google.com/presentation/d/{ID}/embed?start=false&loop=false`
- Video → `https://drive.google.com/file/d/{ID}/preview`
- Both URLs live in `settings`, editable at `/admin/settings`.

**Gate:** *Continue to quiz* is rejected server-side until `min_tutorial_seconds` have elapsed since `tutorial_started_at`. Default 45 seconds. A countdown under the button — "Available in 0:31" — makes the disabled state read as intentional rather than broken. Agents can switch between slides and video freely; the timer doesn't reset.

**Convert the PPTX to native Google Slides first.** A `.pptx` sitting in Drive does not embed reliably. Open it in Slides, `File → Save as Google Slides`, use that link.

**Say this in the demo before you're asked:** the gate proves elapsed time, not comprehension. The quiz is what proves comprehension. Real watch-tracking needs a player API and is separate work.

## 3. `/quiz` — Quiz

One question per screen. Full-width tappable option rows, not radio dots. **Next** advances; no back navigation.

- Questions come from the DB ordered by `order_index`, filtered to `is_active`, with `correct_index` never rendered into the markup.
- Each answer POSTs immediately and is scored server-side on write.
- Progress reads "Question 4 of 14".

**Why one POST per question rather than client-side state:** an agent on 3G walking between customers will lose connection mid-quiz. Server-side per-answer writes mean a refresh, a dropped connection or a dead battery resumes at the exact question they left. The cost is one small round trip per question. On this audience that trade is obviously right — losing fourteen answers to a dropped signal is the failure that makes people abandon the training.

**Snapshot every answer.** Store the prompt, options and correct index as JSON on the answer row. When someone later fixes the deck's contradictory commission figures and edits the questions to match, past results must not silently change. Skip this and the dashboard quietly starts lying.

## 4. `/attest` — Confirmation

One screen, after the quiz, before the result. A short restatement of the four rules that carry real consequence, drawn from slide 14 and slide 10:

- Customer payments go only into company-approved accounts, never a promoter's personal account.
- Asset recovery follows company-approved procedure only — never force, threats or intimidation.
- Customer data is protected; breaches carry penalties.
- Products and repayment terms are explained honestly.

Then one checkbox — "I have read and understood these rules" — and a submit button. Stored as `attested_at` on the attempt.

**Why this is worth one extra screen.** Without it you have a training app. With it you have a timestamped record that a named promoter was shown specific conduct rules and confirmed understanding, backed by their quiz answers on those same rules. If a promoter later collects payments into their own account, that record is the difference between an argument and a file. It costs an hour to build and it is the thing that will get this funded.

Not optional, and not skippable — no checkbox, no result.

## 5. `/results/[attemptId]` — Result

Score as a fraction and a percentage, pass or fail against `pass_mark`, then every question with their answer and the correct one where they differ. `#FF2E00` appears only on missed answers.

- Guarded by the `attempt_id` cookie; without it the page 404s, otherwise result URLs are enumerable.
- **Retake** clears the cookie and returns to `/`. Unlimited retakes, each a new row. Limits are out of scope.

**Consider requiring 100% on the compliance questions** regardless of overall score. An agent who scores 12/14 but got the "can I take customer payments myself?" question wrong should not pass. This is a `is_critical` boolean on `questions` and one extra condition in the pass calculation — maybe thirty minutes. I'd build it; a compliance record that passes people who failed the compliance questions is worse than no record.

## Admin path

```
/admin/login          passcode
/admin                all attempts, newest first
/admin/promoters/[id] one promoter, all attempts, per-question breakdown
/admin/questions      add / edit / reorder / deactivate
/admin/settings       Drive links, pass mark, gate duration
```

### `/admin` — Overview

One table: Name, Phone, Tier, Date, Format used, Score, Pass/Fail, Attested. Newest first.

Four tiles above it:
- Attempts and unique promoters
- Pass rate
- **Most-missed question** — the only thing on the screen that says something about the *training material* rather than the agents. If everyone misses the commission question, the deck is unclear, not the promoters. Put it last in the demo so it lands.
- **Format split** — slides vs video. Tells you whether producing video is worth it.

### `/admin/promoters/[id]`

Promoter details, every attempt, and per attempt the questions right and missed, rendered from `question_snapshot`. Attestation timestamp shown.

### `/admin/questions`

The screen that justifies the database — you author questions here rather than shipping code.

- Fields: prompt, 2–6 options, correct option, order, active toggle, critical flag.
- **Deactivate, never delete.** Deleting orphans historical answers. The toggle removes it from future quizzes and leaves past results intact.
- Ship with the 14 questions from `seed.sql` already loaded.

### `/admin/settings`

Paste the Drive share links; the app extracts the ID and stores the embed URL. Also pass mark (%) and gate duration (seconds).

## Edge cases to handle before demoing

| Case | Behaviour |
|---|---|
| Zero active questions | `/quiz` shows an empty state and blocks entry. Never submit a 0/0 attempt. |
| Drive URLs not set | `/learn` shows a configuration notice, not a broken iframe. |
| Connection drops mid-quiz | Resumes at the next unanswered question. Handled by design. |
| Cookie missing at `/quiz` | Redirect to `/`. |
| Attempt already submitted | Redirect to its results page. |
| Attempt submitted but not attested | Redirect to `/attest`. |
| Duplicate phone | Same promoter, new attempt. Not an error. |
| Phone in a format you didn't expect | Normalize on write; reject with an inline example, never a generic error. |
| Admin edits a question mid-attempt | Scoring uses the live question at answer time; the snapshot preserves what was asked. |
