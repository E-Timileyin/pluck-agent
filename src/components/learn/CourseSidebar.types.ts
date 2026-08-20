import type { IconType } from 'react-icons';
import type { LessonState, LessonWithState } from '../../lib/lesson';
import type { Progress } from '../../lib/progress';

export interface CourseSidebarProps {
  lessons: LessonWithState[];
  progress: Progress;
  activeLessonId: string | null;
}

export interface CourseRow {
  index: number;
  Icon: IconType;
  title: string;
  meta: string;
  percent: number;
  state: LessonState;
  active: boolean;
  href: string;
}
