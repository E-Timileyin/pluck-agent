/**
 * What the bell has to say — derived from the attempt, never a constant.
 *
 * There is no notification system behind this and the app does not push
 * anything: these are the things that are true about *this* promoter right now
 * and that they can act on. If none of them are, the bell shows no count.
 */
import type { Settings } from '../db/schema';
import type { Progress } from './progress';
import { formatClock } from './format';

export type Notice = {
  title: string;
  body: string;
  href: string;
  /** `todo` is something to do now; `done` is a result waiting to be read. */
  tone: 'todo' | 'done' | 'blocked';
};

export function noticesFor(args: {
  progress: Progress;
  settings: Settings;
  resultsHref?: string;
}): Notice[] {
  const { progress, settings } = args;
  const notices: Notice[] = [];

  // An unconfigured worker is the promoter's problem before it is anyone
  // else's — they cannot start, and nothing on the screen would say why.
  if (!settings.slidesUrl && !settings.videoUrl) {
    notices.push({
      title: 'Training material not published',
      body: 'Your supervisor still has to add the slides or the video. Nothing you have done is lost.',
      href: '/resources',
      tone: 'blocked',
    });
  }

  if (args.resultsHref) {
    notices.push({
      title: 'Your result is ready',
      body: 'See your score and review every answer, including the ones you missed.',
      href: args.resultsHref,
      tone: 'done',
    });
    return notices;
  }

  switch (progress.current) {
    case 'start':
      notices.push({
        title: 'Start your training',
        body: 'Pick slides or video — you can switch at any time, the timer keeps running.',
        href: '/learn',
        tone: 'todo',
      });
      break;

    case 'training':
      notices.push({
        title: 'Training not finished',
        body: progress.gatePassed
          ? 'Continue to the quiz when you are ready.'
          : `${formatClock(progress.minTutorialSeconds - progress.tutorialSeconds)} left before the quiz unlocks.`,
        href: '/learn',
        tone: 'todo',
      });
      break;

    case 'quiz':
      notices.push({
        title: 'Quiz in progress',
        body:
          progress.totalQuestions === 0
            ? 'There are no active questions yet — an administrator has to add them.'
            : `${progress.answered} of ${progress.totalQuestions} questions answered.`,
        href: '/quiz',
        tone: progress.totalQuestions === 0 ? 'blocked' : 'todo',
      });
      break;

    case 'attest':
      notices.push({
        title: 'One step from your result',
        body: 'Confirm you have read the conduct rules and your answers are submitted.',
        href: '/attest',
        tone: 'todo',
      });
      break;

    case 'results':
      break;
  }

  return notices;
}
