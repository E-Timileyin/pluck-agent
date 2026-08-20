import type { TutorialMode } from '../db/schema';

export type LessonState = 'done' | 'current' | 'locked';

export interface Lesson {
  id: string;
  order: number;
  title: string;
  type: TutorialMode; // 'video' | 'slides'
  url: string;
  minSeconds: number;
  /**
   * True when `url` is this deployment's own `/learn/video`, serving bytes
   * straight out of R2 — as opposed to a Google Drive embed URL. Drive's URL
   * is meant to sit inside an iframe; a raw media file is not, and rendering
   * it as one is unreliable on mobile browsers. LessonPlayer uses this to
   * choose a real `<video>` element instead.
   */
  hosted: boolean;
}

export interface LessonWithState extends Lesson {
  state: LessonState;
  percent: number;
  elapsedSeconds: number;
}

export function allLessonsDone(lessons: LessonWithState[]): boolean {
  return lessons.every((l) => l.state === 'done');
}
