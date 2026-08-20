import {
  FiAlertTriangle,
  FiAward,
  FiPlayCircle,
  FiUsers,
} from "react-icons/fi";
import { StatTile } from "../common/StatTile";
import { Card } from "../common/Card";
import type { DashboardStats } from "../../db/queries";

export function OverviewStats(props: { stats: DashboardStats }) {
  const { stats } = props;
  const unfinished = stats.attempts - stats.completed;

  return (
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        Icon={FiUsers}
        label="Attempts"
        value={String(stats.attempts)}
        note={`${stats.uniquePromoters} unique sales ${stats.uniquePromoters === 1 ? "agent" : "agents"}`}
      />

      <StatTile
        Icon={FiAward}
        label="Pass rate"
        value={stats.passRate === null ? "—" : `${stats.passRate}%`}
        percent={stats.passRate ?? undefined}
        note={`${stats.completed} completed · ${unfinished} unfinished`}
      />

      <StatTile
        Icon={FiPlayCircle}
        label="Format split"
        value={`${stats.formatSplit.slides} / ${stats.formatSplit.video}`}
        note="slides / video — tells you whether video is worth producing"
      />

      <Card class="sm:col-span-2 xl:col-span-1" tone="tint">
        <div class="mb-3 flex items-center justify-between gap-3">
          <p class="m-0 text-sm font-medium text-muted">Most-missed question</p>
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-deep"
            aria-hidden="true"
          >
            <FiAlertTriangle size={18} />
          </span>
        </div>

        {stats.mostMissed ? (
          <>
            <p class="m-0 text-[15px]/[1.45] font-medium text-ink">
              {stats.mostMissed.prompt}
            </p>
            <p class="m-0 mt-2 text-[13px] text-muted">
              missed {stats.mostMissed.missed} of {stats.mostMissed.asked} times
            </p>
          </>
        ) : (
          <p class="m-0 text-[15px] text-muted">Nothing missed yet.</p>
        )}
      </Card>
    </div>
  );
}

export default OverviewStats;
