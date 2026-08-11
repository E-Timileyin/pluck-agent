import { PromoterShell } from '../../components/common/PromoterShell';
import { Alert } from '../../components/common/Alert';
import { LessonPlayer } from '../../components/learn/LessonPlayer';
import { TrainingOverview } from '../../components/learn/TrainingOverview';
import { ContinueGate } from '../../components/learn/ContinueGate';
import { CourseSidebar } from '../../components/learn/CourseSidebar';
import type { LessonWithState } from '../../lib/lesson';
import type { Shell } from '../../lib/shell';

export function LearnPage(props: {
  shell: Shell;
  lesson: LessonWithState;
  lessons: LessonWithState[];
  mode?: string | null;
  modules?: any[];
  elapsedSeconds: number;
  remainingSeconds: number;
  questionCount: number;
  criticalCount: number;
  error?: string;
}) {
  const { shell, lesson, lessons, remainingSeconds, error } = props;
  const isLastLesson = lesson?.order === lessons[lessons.length - 1]?.order;

  return (
    <PromoterShell
      title="My Training"
      shell={shell}
      active="training"
      wide
      script
      rail={
        <CourseSidebar lessons={lessons} progress={shell.progress} activeLessonId={lesson?.id} />
      }
    >
      <div class="mb-3">
        <h1 class="m-0 text-xl font-bold tracking-tight text-ink lg:text-2xl">Sales Agent Training</h1>
        <p class="m-0 mt-0.5 text-sm font-semibold text-brand">
          Lesson {lesson?.order ?? 1} of {lessons.length} — {lesson?.title ?? 'Training'}
        </p>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <LessonPlayer
        lesson={lesson}
        elapsedSeconds={lesson?.elapsedSeconds ?? 0}
        remainingSeconds={remainingSeconds}
      />

      <TrainingOverview
        passMark={shell.settings.passMark}
        questionCount={props.questionCount}
        criticalCount={props.criticalCount}
      />

      <ContinueGate
        lessonId={lesson?.id}
        remainingSeconds={remainingSeconds}
        isLastLesson={isLastLesson}
      />
    </PromoterShell>
  );
}

export default LearnPage;