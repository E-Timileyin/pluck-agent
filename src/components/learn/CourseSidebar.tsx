import { FiCheck, FiFileText, FiHelpCircle, FiLock, FiPlayCircle } from 'react-icons/fi';
import { allLessonsDone } from '../../lib/lesson';
import type { CourseRow, CourseSidebarProps } from './CourseSidebar.types';

// Locked rows render as a <span>, not a link, since GET /learn/:id and GET /quiz redirect back out anyway.
export function CourseSidebar(props: CourseSidebarProps) {
  const quizAnswered =
    props.progress.totalQuestions > 0 && props.progress.answered >= props.progress.totalQuestions;
  const quizState: CourseRow['state'] = quizAnswered
    ? 'done'
    : allLessonsDone(props.lessons)
      ? 'current'
      : 'locked';

  const rows: CourseRow[] = [
    ...props.lessons.map(
      (lesson, i): CourseRow => ({
        index: i + 1,
        Icon: lesson.type === 'video' ? FiPlayCircle : FiFileText,
        title: lesson.title,
        meta: lesson.type === 'video' ? 'Video' : 'Slides',
        percent: lesson.percent,
        state: lesson.state,
        active: lesson.id === props.activeLessonId,
        href: `/learn/${lesson.id}`,
      }),
    ),
    {
      index: props.lessons.length + 1,
      Icon: FiHelpCircle,
      title: 'The quiz',
      meta:
        props.progress.totalQuestions === 0
          ? 'No questions published yet'
          : `${props.progress.answered} of ${props.progress.totalQuestions} answered`,
      percent:
        props.progress.totalQuestions === 0
          ? 0
          : (props.progress.answered / props.progress.totalQuestions) * 100,
      state: quizState,
      active: false,
      href: '/quiz',
    },
  ];

  return (
    <section class="rounded-2xl border border-line bg-white p-4" aria-label="Course content">
      <h2 class="m-0 mb-3 text-lg font-medium text-ink lg:text-base">Course content</h2>

      <ol class="m-0 grid list-none gap-2 p-0">
        {rows.map((row) => {
          const locked = row.state === 'locked';

          const shell = `flex w-full items-center gap-3 rounded-xl border p-2.5 ${
            row.active ? 'border-brand bg-brand-mint/40' : 'border-line'
          }`;

          const body = (
            <>
              <span
                class={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  row.state === 'done'
                    ? 'bg-brand text-white'
                    : row.state === 'current'
                      ? 'bg-brand-mint text-brand-deep'
                      : 'bg-step-idle text-muted'
                }`}
                aria-hidden="true"
              >
                {row.state === 'done' ? <FiCheck size={14} /> : locked ? <FiLock size={13} /> : row.index}
              </span>

              <span class="min-w-0 flex-1 text-left">
                <span class="block truncate text-[15px] font-medium text-ink lg:text-sm">{row.title}</span>
                <span class="mt-0.5 block text-sm text-muted lg:text-[13px]">{row.meta}</span>
                {!locked ? (
                  <span class="mt-2 block h-1.5 overflow-hidden rounded-full bg-line">
                    <span
                      class="block h-full rounded-full bg-brand"
                      style={`width:${Math.round(row.percent)}%`}
                    ></span>
                  </span>
                ) : null}
              </span>

              {/* Pill status badge — mobile only; the desktop rail already
                  reads its state from the round index badge and progress bar. */}
              <span
                class={`shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap lg:hidden ${
                  row.state === 'done'
                    ? 'bg-brand-mint text-brand-deep'
                    : row.state === 'current'
                      ? 'bg-brand text-white'
                      : 'bg-step-idle text-muted'
                }`}
              >
                {row.state === 'done' ? 'Done' : row.state === 'current' ? 'In progress' : 'Locked'}
              </span>
            </>
          );

          return (
            <li class="min-w-0">
              {locked ? (
                <span class={`${shell} opacity-60`} aria-disabled="true">
                  {body}
                </span>
              ) : (
                <a class={`${shell} no-underline hover:border-brand`} href={row.href}>
                  {body}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default CourseSidebar;
