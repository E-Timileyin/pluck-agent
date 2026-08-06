import { FiFileText, FiMaximize, FiPlayCircle, FiRepeat } from 'react-icons/fi';
import { TutorialChoice } from './TutorialChoice';
import type { Settings, TutorialMode } from '../../db/schema';
import { formatClock } from '../../lib/format';

/**
 * The training screen's centrepiece: the material in a 16:9 frame with a
 * control bar beneath it.
 *
 * The bar is not a media transport — the material is a cross-origin Drive
 * embed and its own controls are inside the frame. What it reports is the one
 * timeline this app actually owns: time spent against the gate. The figures
 * come from the server and the countdown in app.js only advances them.
 */
export function TrainingPlayer(props: {
  mode: TutorialMode | null;
  settings: Settings;
  elapsedSeconds: number;
  remainingSeconds: number;
  otherMode: TutorialMode | null;
}) {
  const { settings, mode } = props;
  const src = mode === 'video' ? settings.videoUrl : mode === 'slides' ? settings.slidesUrl : null;
  const total = Math.max(1, settings.minTutorialSeconds);
  const percent = Math.min(100, Math.round((props.elapsedSeconds / total) * 100));

  return (
    <section
      class="overflow-hidden rounded-2xl border border-line bg-white"
      aria-label="Training material"
      data-gate
      data-remaining={String(props.remainingSeconds)}
      data-total={String(settings.minTutorialSeconds)}
    >
      <div class="relative aspect-video w-full bg-ink">
        {src ? (
          <iframe
            class="absolute inset-0 size-full border-0"
            src={src}
            title={mode === 'video' ? 'Training video' : 'Training slides'}
            allow="autoplay; fullscreen"
            allowfullscreen
            loading="lazy"
          ></iframe>
        ) : (
          /* No format chosen yet — the frame becomes the chooser rather than a
             blank rectangle with the real screen somewhere below it. */
          <TutorialChoice slidesUrl={settings.slidesUrl} videoUrl={settings.videoUrl} />
        )}
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <span class="flex shrink-0 items-center gap-2 text-muted" aria-hidden="true">
          {mode === 'video' ? <FiPlayCircle size={20} /> : <FiFileText size={20} />}
        </span>

        <span
          class="order-last h-1.5 w-full min-w-0 flex-1 overflow-hidden rounded-full bg-line sm:order-none sm:w-auto"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Time on the material"
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
          {formatClock(settings.minTutorialSeconds)}
        </span>

        {props.otherMode ? (
          <form method="post" action="/learn/mode" class="shrink-0">
            <input type="hidden" name="mode" value={props.otherMode} />
            <button
              class="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2 text-[13px] font-semibold text-muted transition-colors duration-150 hover:text-brand"
              type="submit"
            >
              <FiRepeat size={16} />
              Switch to {props.otherMode}
            </button>
          </form>
        ) : null}

        {src ? (
          <a
            class="hidden shrink-0 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-muted no-underline transition-colors duration-150 hover:text-brand sm:flex"
            href={src}
            target="_blank"
            rel="noreferrer"
          >
            <FiMaximize size={16} />
            Open full screen
          </a>
        ) : null}
      </div>
    </section>
  );
}

export default TrainingPlayer;
