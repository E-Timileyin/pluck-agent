import {
  FiFileText,
  FiMaximize,
  FiMinimize,
  FiPlayCircle,
} from "react-icons/fi";
import type { Lesson } from "../../lib/lesson";
import { formatClock } from "../../lib/format";

// Covered by a click-to-play button instead of autoplaying. Fullscreen API only grants on a real user gesture.
// Exit button only shows once fullscreen is active (fullscreen-lesson.js); Esc works too, this is just visible.
export function LessonPlayer(props: {
  lesson: Lesson;
  elapsedSeconds: number;
  remainingSeconds: number;
}) {
  const { lesson } = props;
  const total = Math.max(1, lesson.minSeconds);
  const percent = Math.min(
    100,
    Math.round((props.elapsedSeconds / total) * 100),
  );

  return (
    <section
      id="lesson-player"
      class="overflow-hidden rounded-[28px] border border-line bg-white lg:rounded-2xl"
      aria-label="Lesson"
      data-gate
      data-lesson-id={lesson.id}
      data-remaining={String(props.remainingSeconds)}
      data-total={String(lesson.minSeconds)}
    >
      <div class="relative aspect-video w-full bg-ink" id="lesson-frame">
        {lesson.hosted ? (
          // A file this deployment serves itself, straight out of R2 — a real
          // <video> element, not an iframe. Drive's embed URL is meant to sit
          // inside an iframe; a raw media file navigated-to inside one is not
          // reliably rendered across browsers, mobile Safari especially.
          <video
            class="absolute inset-0 size-full"
            src={lesson.url}
            title={lesson.title}
            controls
            playsinline
            preload="metadata"
          ></video>
        ) : (
          <iframe
            class="absolute inset-0 size-full border-0"
            src={lesson.url}
            title={lesson.title}
            allow="autoplay; fullscreen"
            allowfullscreen
            loading="lazy"
          ></iframe>
        )}

        {lesson.type === "video" && !lesson.hosted ? (
          <button
            type="button"
            id="lesson-fullscreen-enter"
            class="absolute inset-0 flex size-full cursor-pointer flex-col items-center justify-center gap-2 border-0 bg-ink/70 text-white sm:gap-3"
          >
            {/* text-sized (not a fixed px) so the icon scales with the frame instead of dwarfing a phone-width crop */}
            <span class="text-[32px] sm:text-[40px] lg:text-[48px]">
              <FiPlayCircle />
            </span>
            <span class="text-xs font-medium sm:text-sm">
              Play in full screen
            </span>
          </button>
        ) : null}

        <button
          type="button"
          id="lesson-fullscreen-exit"
          class="absolute top-3 right-3 hidden items-center gap-2 rounded-full border-0 bg-black/60 px-3 py-2 text-[13px] font-medium text-white"
        >
          <FiMinimize size={16} />
          Exit full screen
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <span
          class="flex shrink-0 items-center gap-2 text-muted"
          aria-hidden="true"
        >
          {lesson.type === "video" ? (
            <FiPlayCircle size={20} />
          ) : (
            <FiFileText size={20} />
          )}
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

        <span class="shrink-0 font-mono text-sm text-muted tabular-nums lg:text-[13px]">
          <span data-elapsed>{formatClock(props.elapsedSeconds)}</span>
          {" / "}
          {formatClock(lesson.minSeconds)}
        </span>

        <a
          class="hidden shrink-0 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-muted no-underline transition-colors duration-150 hover:text-brand sm:flex"
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
