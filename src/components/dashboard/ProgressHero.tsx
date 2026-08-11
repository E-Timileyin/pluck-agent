import { FiTrendingUp } from 'react-icons/fi';
import { Panel } from '../common/Panel';
import { PanelHead } from '../common/PanelHead';
import { Chip } from '../common/Chip';
import type { Progress } from '../../lib/progress';

/**
 * The headline tile: one number, one bar, one line of context. Navigation
 * used to live here too — it now lives in `ContinueJourney`, so this tile
 * only ever has to answer "how far along am I."
 */
export function ProgressHero(props: { progress: Progress }) {
  const percent = Math.round(props.progress.percent);
  const done = props.progress.current === 'results' && percent === 100;

  return (
    <Panel class="h-full lg:col-span-2">
      <PanelHead Icon={FiTrendingUp} title="Training progress" />

      <p class="m-0 text-[34px] leading-none font-bold tracking-tight text-ink lg:text-[40px]">
        {percent}
        <span class="text-[20px] text-muted lg:text-[24px]">%</span>
      </p>

      <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
        <div class="h-full rounded-full bg-brand" style={`width:${percent}%`}></div>
      </div>

      <p class="m-0 mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <Chip tone="good" Icon={FiTrendingUp}>
          {done ? 'Complete' : `${props.progress.answered}/${props.progress.totalQuestions} answered`}
        </Chip>
        {done ? 'Training complete. Nice work.' : "You're doing great! Keep going."}
      </p>
    </Panel>
  );
}

export default ProgressHero;