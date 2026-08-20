import { FiAward, FiCheckCircle, FiClock, FiRepeat } from "react-icons/fi";
import { PromoterShell } from "../../components/common/PromoterShell";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { Panel } from "../../components/common/Panel";
import { PanelHead } from "../../components/common/PanelHead";
import { FigureTile } from "../../components/dashboard/FigureTile";
import { AttemptCard } from "../../components/results/AttemptCard";
import { percentOf } from "../../components/results/ResultsOverview";
import type { Attempt } from "../../db/schema";
import type { Shell } from "../../lib/shell";

export function ResultsListPage(props: {
  shell: Shell;
  attempts: Attempt[];
  /** Where the unfinished attempt actually is, from `stepFor()`. */
  resumeHref: string;
}) {
  const { settings } = props.shell;
  const submitted = props.attempts.filter((a) => a.submittedAt);
  const best = submitted.reduce((top, a) => Math.max(top, percentOf(a)), 0);
  const passed = submitted.some((a) => a.passed);

  return (
    <PromoterShell
      title="My Results"
      shell={props.shell}
      active="results"
      wide
      header={
        <PageHeader
          title="My Results"
          sub="Your score, and every answer you gave including the ones you missed."
        />
      }
    >
      {props.attempts.length === 0 ? (
        <EmptyState
          Icon={FiAward}
          title="No attempts yet"
          copy="Work through the training and take the quiz your score and a full review of your answers appear here."
          actionHref="/learn"
          actionLabel="Start training"
        />
      ) : (
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FigureTile
            Icon={FiCheckCircle}
            title="Certification"
            period={passed ? "passed" : "not yet"}
            value={passed ? "Passed" : submitted.length > 0 ? "Not yet" : "—"}
            chip={passed ? { text: "Certified", tone: "good" } : undefined}
            note={
              passed
                ? "You have met the standard for your tier."
                : `${settings.passMark}% and every compliance question right.`
            }
          />

          <FigureTile
            Icon={FiAward}
            title="Best score"
            period={submitted.length > 0 ? "submitted" : "no data"}
            value={submitted.length > 0 ? String(best) : "—"}
            unit={submitted.length > 0 ? "%" : undefined}
            note={`Pass mark is ${settings.passMark}%.`}
          >
            <span
              class="block h-2 overflow-hidden rounded-full bg-line"
              aria-hidden="true"
            >
              <span
                class="block h-full rounded-full bg-brand"
                style={`width:${best}%`}
              ></span>
            </span>
          </FigureTile>

          <FigureTile
            Icon={FiRepeat}
            title="Attempts"
            period="all time"
            value={String(props.attempts.length)}
            note={`${submitted.length} submitted · attempts are unlimited.`}
          />

          <div class="lg:col-span-3">
            <Panel>
              <PanelHead Icon={FiClock} title="History" />
              <div class="grid gap-2">
                {props.attempts.map((attempt, i) => (
                  <AttemptCard
                    attempt={attempt}
                    number={props.attempts.length - i}
                    resumeHref={props.resumeHref}
                  />
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </PromoterShell>
  );
}

export default ResultsListPage;
