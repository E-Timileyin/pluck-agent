import { FiArrowRight, FiBookOpen, FiFolder, FiTrendingUp } from 'react-icons/fi';
import { Panel } from '../common/Panel';
import { PanelHead } from '../common/PanelHead';
import { Chip } from '../common/Chip';
import type { Progress, Resume } from '../../lib/progress';

/**
 * The hero tile: the one number this screen exists to report, the three things
 * you can do next, and — where the comp puts a decorative bar chart — the five
 * steps drawn as blocks. Real state, in the shape the design uses for texture.
 */
export function ProgressHero(props: { progress: Progress; resume: Resume; resumeHref: string }) {
  const percent = Math.round(props.progress.percent);
  const done = props.progress.current === 'results' && percent === 100;

  return (
    <Panel class="h-full lg:col-span-2">
      <PanelHead
        Icon={FiTrendingUp}
        title="Training progress"
        aside={<Chip tone="quiet">{props.progress.steps.find((s) => s.state === 'current')?.label}</Chip>}
      />

      <div class="flex flex-wrap items-end justify-between gap-5">
        <div class="min-w-0">
          <p class="m-0 text-[34px] leading-none font-bold tracking-tight text-ink lg:text-[40px]">
            {percent}
            <span class="text-[20px] text-muted lg:text-[24px]">%</span>
          </p>

          <p class="m-0 mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <Chip tone="good" Icon={FiTrendingUp}>
              {done ? 'Complete' : `${props.progress.answered}/${props.progress.totalQuestions} answered`}
            </Chip>
            {done ? 'Training complete. Nice work.' : "You're doing great! Keep going."}
          </p>
        </div>

        {/* The comp's bar-chart block, drawn from the five steps. */}
        <ol class="m-0 flex list-none items-end gap-1.5 p-0" aria-hidden="true">
          {props.progress.steps.map((step, i) => (
            <li
              class={`w-5 rounded-md ${
                step.state === 'done'
                  ? 'bg-brand'
                  : step.state === 'current'
                    ? 'bg-brand-ink'
                    : 'bg-step-idle'
              }`}
              style={`height:${20 + i * 9}px`}
            ></li>
          ))}
        </ol>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <a
          class="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white no-underline transition-colors duration-150 hover:bg-brand-deep"
          href={props.resumeHref}
        >
          {props.resume.cta}
          <FiArrowRight size={16} />
        </a>

        <a
          class="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white no-underline"
          href="/learn"
        >
          <FiBookOpen size={16} />
          Training
        </a>

        <a
          class="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink no-underline transition-colors duration-150 hover:border-brand hover:text-brand"
          href="/resources"
        >
          <FiFolder size={16} />
          Resources
        </a>
      </div>
    </Panel>
  );
}

export default ProgressHero;
