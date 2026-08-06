/**
 * The data every promoter screen needs to draw the shell around itself: who is
 * signed in, how far along they are, and where the nav can point.
 *
 * It lives here rather than in the shell component because `db/queries` is the
 * only place allowed to touch drizzle, and components never take a `Db`.
 */
import type { Attempt, Promoter, Settings } from '../db/schema';
import { getAttemptWithPromoter, getSettings, photoUpdatedAt, type Db } from '../db/queries';
import { attemptProgress, type Progress } from './progress';
import { noticesFor, type Notice } from './notices';
import { greetingFor } from './format';

export type Shell = {
  promoter: Promoter;
  progress: Progress;
  settings: Settings;
  greeting: string;
  /** What the bell shows. Derived, so it is never stale and never a constant. */
  notices: Notice[];
  /** The agent's photo, or absent when they have not uploaded one. */
  photoHref?: string;
  /** Absent until the attempt has been submitted. */
  resultsHref?: string;
};

export async function shellFor(db: Db, attempt: Attempt): Promise<Shell | null> {
  const [row, settings] = await Promise.all([
    getAttemptWithPromoter(db, attempt.id),
    getSettings(db),
  ]);
  if (!row) return null;

  const progress = await attemptProgress(db, attempt, settings);
  const resultsHref = attempt.submittedAt ? `/results/${attempt.id}` : undefined;

  // The timestamp is the cache key: replace the photo and every <img> on every
  // screen points somewhere new, so nobody keeps seeing the old face.
  const photoAt = await photoUpdatedAt(db, row.promoter.id);

  return {
    promoter: row.promoter,
    progress,
    settings,
    greeting: greetingFor(),
    notices: noticesFor({ progress, settings, resultsHref }),
    photoHref: photoAt ? `/profile/photo?v=${encodeURIComponent(photoAt)}` : undefined,
    resultsHref,
  };
}
