/**
 * The data every promoter screen needs to draw the shell around itself: who is
 * signed in, how far along they are, and where the nav can point.
 *
 * It lives here rather than in the shell component because `db/queries` is the
 * only place allowed to touch drizzle, and components never take a `Db`.
 */
import type { Attempt, Promoter, Settings } from '../db/schema';
import { getAttemptWithPromoter, getSettings, type Db } from '../db/queries';
import { attemptProgress, type Progress } from './progress';
import { greetingFor } from './format';

export type Shell = {
  promoter: Promoter;
  progress: Progress;
  settings: Settings;
  greeting: string;
  /** Absent until the attempt has been submitted. */
  resultsHref?: string;
};

export async function shellFor(db: Db, attempt: Attempt): Promise<Shell | null> {
  const [row, settings] = await Promise.all([
    getAttemptWithPromoter(db, attempt.id),
    getSettings(db),
  ]);
  if (!row) return null;

  return {
    promoter: row.promoter,
    progress: await attemptProgress(db, attempt, settings),
    settings,
    greeting: greetingFor(),
    resultsHref: attempt.submittedAt ? `/results/${attempt.id}` : undefined,
  };
}
