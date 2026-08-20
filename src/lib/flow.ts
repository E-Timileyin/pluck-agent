import type { Attempt } from '../db/schema';
import { getSettings, nextUnansweredQuestion, type Db } from '../db/queries';

export function elapsedSeconds(since: string | null): number {
  if (!since) return 0;
  return Math.floor((Date.now() - new Date(since).getTime()) / 1000);
}

/** Where an attempt belongs right now — used to resume, and after every POST. */
export async function stepFor(db: Db, attempt: Attempt): Promise<string> {
  if (attempt.submittedAt) return `/results/${attempt.id}`;
  if (!attempt.tutorialMode) return '/learn';

  const { question, total } = await nextUnansweredQuestion(db, attempt.id);
  if (total === 0) return '/quiz'; // empty state
  return question ? '/quiz' : '/attest';
}

/**
 * The gate, checked on the server. The countdown in app.js is display only —
 * a disabled button is defeated by devtools in five seconds.
 */
export async function gatePassed(db: Db, attempt: Attempt): Promise<boolean> {
  const { minTutorialSeconds } = await getSettings(db);
  return elapsedSeconds(attempt.tutorialStartedAt) >= minTutorialSeconds;
}

/**
 * A second fail in a row means something isn't landing — five minutes to
 * step away before the material is offered again, rather than an agent
 * guessing their way through a third attempt back to back.
 */
export const RETRY_COOLDOWN_SECONDS = 5 * 60;

/**
 * How many submitted attempts in a row, most recent first, were failures.
 * An in-progress attempt (no `submittedAt`) is skipped rather than counted —
 * it hasn't failed anything yet.
 */
export function consecutiveFails(attempts: Attempt[]): number {
  let count = 0;
  for (const a of attempts) {
    if (!a.submittedAt) continue;
    if (a.passed) break;
    count++;
  }
  return count;
}

/** Seconds left before a retry is allowed, or 0 once the cooldown is clear. */
export function cooldownRemaining(attempts: Attempt[]): number {
  if (consecutiveFails(attempts) < 2) return 0;
  const lastSubmitted = attempts.find((a) => a.submittedAt);
  if (!lastSubmitted?.submittedAt) return 0;
  return Math.max(0, RETRY_COOLDOWN_SECONDS - elapsedSeconds(lastSubmitted.submittedAt));
}
