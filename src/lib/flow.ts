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
