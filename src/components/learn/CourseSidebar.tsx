import { FiCheck, FiFileText, FiHelpCircle, FiLock, FiPlayCircle } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { LessonWithState } from '../../lib/lesson';
import type { Progress } from '../../lib/progress';
import { allLessonsDone } from '../../lib/lesson';

/**
 * The whole curriculum as one ordered list, lessons then the quiz, in the
 * same visual language as your old ChapterRail. A locked row renders as a
 * <span>, not a link — there is nothing to click into, because the route
 * guard on GET /learn/:id and GET /quiz redirects straight back out if the
 * server disagrees with what this list shows.
 */
export function CourseSidebar(props: {
  lessons: LessonWithState[];
  progress: Progress;
  activeLessonId: string | null;
}) {
  const quizAnswered = props.progress.totalQuestions > 0 && props.progress.answered >= props.progress.totalQuestions;
  const quizState: 'done' | 'current' | 'locked' = quizAnswered
    ? 'done'
    : allLessonsDone(props.lessons)
      ? 'current'
      : 'locked';

  return (
    <section class="rounded-2xl border border-line bg-white p-4" aria-label="Course content">
      <h2 class="m-0 mb-3 text-base font-semibold text-ink">Course content</h2>

      <ol class="m-0 grid list-none gap-2 p-0">
        {props.lessons.map((lesson, i) => (
          <li>
            <Row
              index={i + 1}
              Icon={lesson.type === 'video' ? FiPlayCircle : FiFileText}
              title={lesson.title}
              meta={lesson.type === 'video' ? 'Video' : 'Slides'}
              percent={lesson.percent}
              state={lesson.state}
              active={lesson.id === props.activeLessonId}
              href={`/learn/${lesson.id}`}
            />
          </li>
        ))}

        <li>
          <Row
            index={props.lessons.length + 1}
            Icon={FiHelpCircle}
            title="The quiz"
            meta={
              props.progress.totalQuestions === 0
                ? 'No questions published yet'
                : `${props.progress.answered} of ${props.progress.totalQuestions} answered`
            }
            percent={
              props.progress.totalQuestions === 0
                ? 0
                : (props.progress.answered / props.progress.totalQuestions) * 100
            }
            state={quizState}
            active={false}
            href="/quiz"
          />
        </li>
      </ol>
    </section>
  );
}

function Row(props: {
  index: number;
  Icon: IconType;
  title: string;
  meta: string;
  percent: number;
  state: 'done' | 'current' | 'locked';
  active: boolean;
  href: string;
}) {
  const locked = props.state === 'locked';

  const body = (
    <>
      <span
        class={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          props.state === 'done'
            ? 'bg-brand text-white'
            : props.state === 'current'
              ? 'bg-brand-mint text-brand-deep'
              : 'bg-step-idle text-muted'
        }`}
        aria-hidden="true"
      >
        {props.state === 'done' ? <FiCheck size={14} /> : locked ? <FiLock size={13} /> : props.index}
      </span>

      <span class="min-w-0 flex-1 text-left">
        <span class="block truncate text-sm font-semibold text-ink">{props.title}</span>
        <span class="mt-0.5 block text-[13px] text-muted">{props.meta}</span>
        {!locked ? (
          <span class="mt-2 block h-1.5 overflow-hidden rounded-full bg-line">
            <span
              class="block h-full rounded-full bg-brand"
              style={`width:${Math.round(props.percent)}%`}
            ></span>
          </span>
        ) : null}
      </span>
    </>
  );

  const shell = `flex w-full items-center gap-3 rounded-xl border p-2.5 ${
    props.active ? 'border-brand bg-brand-mint/40' : 'border-line'
  }`;

  return locked ? (
    <span class={`${shell} opacity-60`} aria-disabled="true">
      {body}
    </span>
  ) : (
    <a class={`${shell} no-underline hover:border-brand`} href={props.href}>
      {body}
    </a>
  );
}

export default CourseSidebar;