import { FiChevronRight, FiExternalLink, FiFileText, FiPlayCircle } from 'react-icons/fi';
import type { Module } from '../../lib/progress';

const PILL: Record<Module['state'], string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  'not-started': 'Not started',
  unavailable: 'Unavailable',
};

const PILL_TONE: Record<Module['state'], string> = {
  completed: 'bg-brand-mint text-brand-ink',
  'in-progress': 'bg-brand-mint text-brand-ink',
  'not-started': 'bg-line text-muted',
  unavailable: 'bg-line text-muted',
};

/**
 * The action is a POST, not a link: opening a module *is* choosing that format,
 * which is the mutation `/learn` offers. Nothing here touches the timer — the
 * server stamps `tutorial_started_at` once and switching format never resets it.
 *
 * A card on desktop, a horizontal row on a phone.
 */
export function ModuleRow(props: { module: Module }) {
  const { module } = props;
  const disabled = module.state === 'unavailable';
  const Icon = module.mode === 'video' ? FiPlayCircle : FiFileText;

  return (
    <form
      method="post"
      action="/learn/mode"
      class="relative overflow-hidden rounded-2xl border border-line bg-white p-4 lg:p-6"
    >
      <input type="hidden" name="mode" value={module.mode} />

      <div class="flex items-center gap-4 lg:items-start">
        <span
          class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-deep"
          aria-hidden="true"
        >
          <Icon size={24} />
        </span>

        <div class="min-w-0 flex-1 lg:mt-1">
          <div class="flex items-start justify-between gap-3">
            <h3 class="m-0 text-[15px] font-semibold text-ink lg:text-base">{module.title}</h3>
            <span
              class={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold lg:inline-block ${PILL_TONE[module.state]}`}
            >
              {PILL[module.state]}
            </span>
          </div>

          <p class="m-0 mt-2 hidden text-sm/[1.6] text-muted lg:block">
            {disabled ? 'Not published yet — your supervisor still has to add it.' : module.blurb}
          </p>

          <button
            class="mt-1 hidden cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50 lg:mt-3 lg:inline-flex"
            type="submit"
            disabled={disabled}
          >
            {module.action}
            <FiExternalLink size={14} />
          </button>
        </div>

        {/* Phone: the pill and a chevron sit at the end of the row, and the
            whole card is the tap target. */}
        <span
          class={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold lg:hidden ${PILL_TONE[module.state]}`}
        >
          {PILL[module.state]}
        </span>
        <button
          class="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-muted disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
          type="submit"
          disabled={disabled}
          aria-label={module.action}
        >
          <FiChevronRight size={22} />
        </button>
      </div>

      {/* Flush along the bottom edge, inset to the card's horizontal padding. */}
      <span class="absolute inset-x-4 bottom-0 block h-[3px] rounded-full bg-line lg:inset-x-6">
        <span
          class="block h-full rounded-full bg-brand"
          style={`width:${Math.round(module.percent)}%`}
        ></span>
      </span>
    </form>
  );
}

export default ModuleRow;
