import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiAward,
  FiPlayCircle,
  FiPlus,
  FiSettings,
  FiUpload,
  FiUsers,
} from "react-icons/fi";
import { AdminShell } from "../../components/admin/AdminShell";
import { Panel } from "../../components/common/Panel";
import { PanelHead } from "../../components/common/PanelHead";
import { Chip } from "../../components/common/Chip";
import { StatusPill } from "../../components/common/StatusPill";
import { FigureTile } from "../../components/dashboard/FigureTile";
import { MiniTile } from "../../components/dashboard/MiniTile";
import type { AttemptRow, DashboardStats } from "../../db/queries";
import type { Admin } from "../../db/schema";
import { firstName } from "../../lib/format";

/**
 * Two rows of four, sized to one screen. Anything that grows without bound —
 * the attempt list, the agent directory, the questions — is its own
 * destination in the rail rather than a block you scroll past.
 */
export function DashboardPage(props: {
  admin: Admin;
  stats: DashboardStats;
  rows: AttemptRow[];
}) {
  const { stats } = props;
  const unfinished = stats.attempts - stats.completed;
  const failed =
    stats.completed -
    Math.round((stats.completed * (stats.passRate ?? 0)) / 100);
  const passed = stats.completed - failed;

  const segments = [
    { label: "Passed", value: passed, colour: "bg-brand" },
    { label: "Failed", value: failed, colour: "bg-miss" },
    { label: "Unfinished", value: unfinished, colour: "bg-step-idle" },
  ];
  const total = Math.max(1, stats.attempts);

  // From the same attempt rows the "Latest attempts" list already has —
  // no extra query just to preview who is in the directory.
  const recentAgents = props.rows
    .map((r) => r.promoter)
    .filter((p, i, all) => all.findIndex((other) => other.id === p.id) === i)
    .slice(0, 4);

  return (
    <AdminShell title="Overview" active="overview" admin={props.admin} bare>
      <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 class="m-0 text-[26px] font-semibold tracking-tight text-ink lg:text-2xl">
          Welcome back, {firstName(props.admin.name)}
        </h1>
        <p class="m-0 mt-0.5 text-[15px] text-muted lg:text-sm">
          Every attempt, and what the training material is doing to people.
        </p>
      </div>

      {/* Tiles size to their content — a fixed row height stretched them and
          left dead space in the middle of every card. Equal heights come from
          `h-full` within a row, not from the grid being told how tall to be. */}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Panel class="flex h-full flex-col lg:col-span-2">
          <PanelHead
            Icon={FiActivity}
            title="Attempts"
            aside={<Chip tone="quiet">All time</Chip>}
          />

          <div class="flex flex-wrap items-end justify-between gap-6">
            <div class="min-w-0">
              <p class="m-0 text-[34px] leading-none font-semibold tracking-tight text-ink lg:text-[40px]">
                {stats.attempts}
              </p>
              <p class="m-0 mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted">
                <Chip tone="good" Icon={FiUsers}>
                  {stats.uniquePromoters} sales{" "}
                  {stats.uniquePromoters === 1 ? "agent" : "agents"}
                </Chip>
                {stats.completed} completed · {unfinished} unfinished
              </p>
            </div>

            <ol
              class="m-0 flex list-none items-end gap-2 p-0"
              aria-hidden="true"
            >
              {segments.map((segment) => (
                <li class="flex w-10 flex-col items-center gap-1.5">
                  <span class="text-[11px] font-medium text-muted">
                    {segment.value}
                  </span>
                  <span
                    class={`w-full rounded-lg ${segment.colour}`}
                    style={`height:${Math.max(6, Math.round((segment.value / total) * 64))}px`}
                  ></span>
                </li>
              ))}
            </ol>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <a
              class="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-medium text-white no-underline transition-colors duration-150 hover:bg-brand-deep"
              href="/admin/questions#question-form"
            >
              <FiPlus size={17} />
              Add question
            </a>
            <a
              class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-medium text-ink no-underline transition-colors duration-150 hover:border-brand hover:text-brand"
              href="/admin/settings"
            >
              <FiSettings size={17} />
              Settings
            </a>
          </div>
        </Panel>

        <FigureTile
          Icon={FiAward}
          title="Pass rate"
          period={stats.completed === 0 ? "no data" : "submitted"}
          value={stats.passRate === null ? "—" : String(stats.passRate)}
          unit={stats.passRate === null ? undefined : "%"}
          chip={
            stats.passRate === null
              ? undefined
              : {
                  text: `${passed} of ${stats.completed}`,
                  tone: stats.passRate >= 50 ? "good" : "miss",
                }
          }
        >
          <span
            class="flex h-2.5 overflow-hidden rounded-full bg-line"
            aria-hidden="true"
          >
            {segments.map((segment) => (
              <span
                class={`block h-full ${segment.colour}`}
                style={`width:${(segment.value / total) * 100}%`}
              ></span>
            ))}
          </span>
          <ul class="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[11px] text-muted">
            {segments.map((segment) => (
              <li class="flex items-center gap-1.5">
                <span
                  class={`size-2 rounded-full ${segment.colour}`}
                  aria-hidden="true"
                ></span>
                {segment.label}
              </li>
            ))}
          </ul>
        </FigureTile>

        <FigureTile
          Icon={FiPlayCircle}
          title="Format split"
          period="by format"
          value={`${stats.formatSplit.slides} / ${stats.formatSplit.video}`}
          note="Tells you whether the video is worth producing at all."
        >
          <p class="m-0 text-[13px] text-muted">
            {stats.formatSplit.unset}{" "}
            {stats.formatSplit.unset === 1 ? "attempt has" : "attempts have"}{" "}
            not opened either yet.
          </p>
        </FigureTile>

        {/* ---- second row ---- */}

        <Panel class="h-full lg:col-span-2">
          <PanelHead
            Icon={FiActivity}
            title="Latest attempts"
            aside={
              <a
                class="inline-flex items-center gap-1.5 text-sm font-medium text-brand no-underline hover:underline"
                href="/admin/attempts"
              >
                See all
                <FiArrowRight size={15} />
              </a>
            }
          />

          {props.rows.length === 0 ? (
            <p class="m-0 text-[15px] text-muted">
              No attempts yet. Share the training link with a sales agent and
              the first one lands here.
            </p>
          ) : (
            <ul class="m-0 grid list-none gap-1.5 p-0">
              {props.rows.map(({ attempt, promoter }) => (
                <li>
                  <a
                    class="flex items-center gap-3 rounded-xl border border-line px-3 py-2 no-underline transition-colors duration-150 hover:border-brand"
                    href={`/admin/promoters/${promoter.id}`}
                  >
                    <span class="min-w-0 flex-1">
                      <span class="block truncate text-sm font-medium text-ink">
                        {promoter.name}
                      </span>
                      <span class="block text-[11px] text-muted">
                        {promoter.tier} ·{" "}
                        {attempt.tutorialMode ?? "no format yet"}
                      </span>
                    </span>

                    <span class="shrink-0 text-sm font-medium text-ink">
                      {attempt.submittedAt
                        ? `${attempt.score}/${attempt.total}`
                        : "—"}
                    </span>

                    {attempt.submittedAt ? (
                      <StatusPill tone={attempt.passed ? "pass" : "miss"}>
                        {attempt.passed ? "Pass" : "Fail"}
                      </StatusPill>
                    ) : (
                      <StatusPill>In progress</StatusPill>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel class="h-full">
          <PanelHead Icon={FiAlertTriangle} title="Most missed" tone="miss" />

          {stats.mostMissed ? (
            <div class="rounded-2xl bg-brand-deep p-4">
              <p class="m-0 line-clamp-3 text-sm/[1.5] font-medium text-white">
                {stats.mostMissed.prompt}
              </p>
              <p class="m-0 mt-3 flex items-baseline gap-2">
                <span class="text-[30px] leading-none font-semibold text-white">
                  {Math.round(
                    (stats.mostMissed.missed /
                      Math.max(1, stats.mostMissed.asked)) *
                      100,
                  )}
                  %
                </span>
                <span class="text-[13px] text-white/60">
                  wrong ({stats.mostMissed.missed}/{stats.mostMissed.asked})
                </span>
              </p>
            </div>
          ) : (
            <p class="m-0 text-[15px] text-muted">
              Nothing has been missed yet. This is the one tile that says
              something about the training material rather than the people
              taking it.
            </p>
          )}

          <div class="mt-4 border-t border-line pt-4">
            <div class="mb-2 flex items-center justify-between gap-2">
              <p class="m-0 text-sm font-medium text-ink">
                Sales agents · {stats.uniquePromoters} total
              </p>
              <a
                class="shrink-0 text-sm font-medium text-brand no-underline hover:underline"
                href="/admin/promoters"
              >
                See all
              </a>
            </div>

            {recentAgents.length === 0 ? (
              <p class="m-0 text-[13px] text-muted">
                No sales agent has started yet.
              </p>
            ) : (
              <ul class="m-0 grid list-none gap-1 p-0">
                {recentAgents.map((agent) => (
                  <li>
                    <a
                      class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-line/40"
                      href={`/admin/promoters/${agent.id}`}
                    >
                      <span class="truncate text-sm font-medium text-ink">
                        {agent.name}
                      </span>
                      <span class="shrink-0 text-[11px] font-medium text-muted">
                        {agent.tier}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <div class="grid content-start gap-3">
          <MiniTile
            Icon={FiUsers}
            label="Directory"
            title="Sales agents"
            href="/admin/promoters"
          />
          <MiniTile
            Icon={FiUpload}
            label="Bulk authoring"
            title="Import questions"
            href="/admin/questions"
            tone="tint"
          />
        </div>
      </div>
    </AdminShell>
  );
}

export default DashboardPage;
