import { FiFileText, FiMaximize, FiMinimize, FiPlayCircle } from 'react-icons/fi';
import type { Lesson } from '../../lib/lessons';
import { formatClock } from '../../lib/format';

/**
 * The active lesson in a 16:9 frame with a timeline bar beneath it.
 *
 * For video lessons the frame starts covered by a "Play in full screen"
 * button rather than autoplaying. The Fullscreen API only grants a request
 * made from a real user gesture, and that click is also what makes fullscreen
 * a deliberate "I am starting this lesson now" rather than something that
 * happens to you. Once granted, the browser shows only this section's
 * subtree — the sidebar and nav are not just visually hidden, they are not
 * rendered on screen at all — so there is nothing to lock down separately.
 *
 * The exit button only appears while fullscreen is active (see
 * fullscreen-lesson.js); Esc still works too, this is just a visible way out
 * for people who don't know that.
 */
export function LessonPlayer(props: {
  lesson: Lesson;
  elapsedSeconds: number;
  remainingSeconds: number;
}) {
  const { lesson } = props;
  const total = Math.max(1, lesson.minSeconds);
  const percent = Math.min(100, Math.round((props.elapsedSeconds / total) * 100));

  return (
    <section
      id="lesson-player"
      class="overflow-hidden rounded-2xl border border-line bg-white"
      aria-label="Lesson"
      data-gate
      data-lesson-id={lesson.id}
      data-remaining={String(props.remainingSeconds)}
      data-total={String(lesson.minSeconds)}
    >
      <div class="relative aspect-video w-full bg-ink" id="lesson-frame">
        <iframe
          class="absolute inset-0 size-full border-0"
          src={lesson.url}
          title={lesson.title}
          allow="autoplay; fullscreen"
          allowfullscreen
          loading="lazy"
        ></iframe>

        {lesson.type === 'video' ? (
          <button
            type="button"
            id="lesson-fullscreen-enter"
            class="absolute inset-0 flex size-full cursor-pointer flex-col items-center justify-center gap-3 border-0 bg-ink/70 text-white"
          >
            <FiPlayCircle size={48} />
            <span class="text-sm font-semibold">Play in full screen</span>
          </button>
        ) : null}

        <button
          type="button"
          id="lesson-fullscreen-exit"
          class="absolute top-3 right-3 hidden items-center gap-2 rounded-full border-0 bg-black/60 px-3 py-2 text-[13px] font-semibold text-white"
        >
          <FiMinimize size={16} />
          Exit full screen
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <span class="flex shrink-0 items-center gap-2 text-muted" aria-hidden="true">
          {lesson.type === 'video' ? <FiPlayCircle size={20} /> : <FiFileText size={20} />}
        </span>

        <span
          class="order-last h-1.5 w-full min-w-0 flex-1 overflow-hidden rounded-full bg-line sm:order-none sm:w-auto"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Time on this lesson"
        >
          <span
            class="block h-full rounded-full bg-brand transition-[width] duration-150"
            style={`width:${percent}%`}
            data-progress
          ></span>
        </span>

        <span class="shrink-0 font-mono text-[13px] text-muted tabular-nums">
          <span data-elapsed>{formatClock(props.elapsedSeconds)}</span>
          {' / '}
          {formatClock(lesson.minSeconds)}
        </span>

        <a
          class="hidden shrink-0 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-muted no-underline transition-colors duration-150 hover:text-brand sm:flex"
          href={lesson.url}
          target="_blank"
          rel="noreferrer"
        >
          <FiMaximize size={16} />
          Open in a new tab
        </a>
      </div>
    </section>
  );
}

export default LessonPlayer;