import type { TutorialMode } from '../db/schema';

export type LessonState = 'done' | 'current' | 'locked';

export interface Lesson {
  id: string;
  order: number;
  title: string;
  type: TutorialMode; // 'video' | 'slides'
  url: string;
  minSeconds: number;
}

export interface LessonProgressRow {
  lessonId: string;
  elapsedSeconds: number;
  completedAt: string | null;
}

export interface LessonWithState extends Lesson {
  state: LessonState;
  percent: number;
  elapsedSeconds: number;
}

/**
 * The one place "is this lesson reachable" gets decided. A lesson is locked
 * the moment any lesson before it (by `order`) is not yet complete — this is
 * also what the route guard calls server-side, so what the sidebar shows and
 * what GET /learn/:id will actually let through never disagree.
 */
export function lessonsWithState(
  lessons: Lesson[],
  progressByLesson: Record<string, LessonProgressRow>,
): LessonWithState[] {
  const ordered = [...lessons].sort((a, b) => a.order - b.order);
  let unlocked = true;

  return ordered.map((lesson) => {
    const row = progressByLesson[lesson.id];
    const elapsedSeconds = row?.elapsedSeconds ?? 0;
    const done = !!row?.completedAt;
    const percent = Math.min(
      100,
      Math.round((elapsedSeconds / Math.max(1, lesson.minSeconds)) * 100),
    );
    const state: LessonState = done ? 'done' : unlocked ? 'current' : 'locked';

    // Everything after the first not-done lesson locks — this line is the
    // entire sequencing rule.
    if (!done) unlocked = false;

    return { ...lesson, state, percent, elapsedSeconds };
  });
}

export function firstIncompleteLesson(lessons: LessonWithState[]): LessonWithState | null {
  return lessons.find((l) => l.state !== 'done') ?? null;
}

export function allLessonsDone(lessons: LessonWithState[]): boolean {
  return lessons.every((l) => l.state === 'done');
}