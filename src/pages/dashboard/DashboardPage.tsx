import { FiAward, FiCheckCircle, FiClock, FiShield, FiUser } from 'react-icons/fi';
import { PromoterShell } from '../../components/common/PromoterShell';
import { Panel } from '../../components/common/Panel';
import { DashboardGreeting } from '../../components/dashboard/DashboardGreeting';
import { ProgressHero } from '../../components/dashboard/ProgressHero';
import { FigureTile } from '../../components/dashboard/FigureTile';
import { CertificationGoal } from '../../components/dashboard/CertificationGoal';
import { AttemptBars } from '../../components/dashboard/AttemptBars';
import { MiniTile } from '../../components/dashboard/MiniTile';
import type { Attempt } from '../../db/schema';
import type { Module, Resume } from '../../lib/progress';
import type { Shell } from '../../lib/shell';
import { firstName, formatClock } from '../../lib/format';

/**
 * A bento grid sized to one screen: the headline figure, the two that support
 * it, the goal, the score history and the way into everything else.
 *
 * Every tile is real state — there is no placeholder anywhere here, which is
 * the whole reason it is worth showing anyone.
 */
export function DashboardPage(props: {
  shell: Shell;
  modules: Module[];
  resume: Resume;
  /** From `stepFor()` — the same destination the server would redirect to. */
  resumeHref: string;
  attempts: Attempt[];
}) {
  const { shell } = props;
  const { progress, settings, promoter } = shell;

  const submitted = props.attempts.filter((a) => a.submittedAt);
  const bars = submitted
    .slice(0, 6)
    .reverse()
    .map((attempt, i) => ({
      label: `Attempt ${i + 1}`,
      percent: attempt.total ? ((attempt.score ?? 0) / attempt.total) * 100 : 0,
      passed: attempt.passed,
    }));

  const gateSeconds = Math.max(0, progress.minTutorialSeconds - progress.tutorialSeconds);

  return (
    <PromoterShell
      title="Dashboard"
      shell={shell}
      active="dashboard"
      wide
      header={
        <DashboardGreeting greeting={shell.greeting} firstName={firstName(promoter.name)} />
      }
    >
      {/* Tiles size to their content — a fixed row height stretched them and
          left dead space in the middle of every card. Equal heights come from
          `h-full` within a row, not from the grid being told how tall to be. */}
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <ProgressHero progress={progress} resume={props.resume} resumeHref={props.resumeHref} />

        <FigureTile
          Icon={FiCheckCircle}
          title="Quiz"
          period={progress.totalQuestions === 0 ? 'not published' : 'this attempt'}
          value={String(progress.answered)}
          unit={`/ ${progress.totalQuestions}`}
          chip={
            progress.totalQuestions > 0 && progress.answered >= progress.totalQuestions
              ? { text: 'All answered', tone: 'good' }
              : undefined
          }
          note={
            progress.totalQuestions === 0
              ? 'No questions have been published yet.'
              : `${settings.passMark}% to pass, and every compliance question right.`
          }
        />

        <FigureTile
          Icon={FiClock}
          title="Time on material"
          period={progress.gatePassed ? 'gate passed' : 'gate'}
          value={formatClock(progress.tutorialSeconds)}
          unit={`/ ${formatClock(progress.minTutorialSeconds)}`}
          chip={
            progress.gatePassed
              ? { text: 'Unlocked', tone: 'good' }
              : { text: `${formatClock(gateSeconds)} left`, tone: 'quiet' }
          }
          note="Checked on the server. The countdown on the training screen is display only."
        />

        {/* ---- second row ---- */}

        <CertificationGoal
          percent={progress.percent}
          passMark={settings.passMark}
          modules={props.modules}
        />

        <div class="lg:col-span-2">
          <AttemptBars bars={bars} passMark={settings.passMark} />
        </div>

        <div class="grid content-start gap-3">
          <Panel tone="tint">
            <h2 class="m-0 mb-2 flex items-center gap-2.5 text-sm font-semibold text-ink">
              <span
                class="flex size-8 items-center justify-center rounded-full bg-white text-brand-deep"
                aria-hidden="true"
              >
                <FiShield size={15} />
              </span>
              Why this matters
            </h2>
            <p class="m-0 text-[13px]/[1.5] text-muted">
              This training proves you understand how commission, credit checks and customer money
              work. Your certification is what lets you sell.
            </p>
          </Panel>

          {/* Only the two screens this one hands off to. Resources and Support
              are a click away in the sidebar and do not need repeating here. */}
          <div class="grid grid-cols-2 gap-3">
            <MiniTile Icon={FiAward} label="History" title="My results" href="/results" />
            <MiniTile Icon={FiUser} label="You" title="Profile" href="/profile" />
          </div>
        </div>

      </div>
    </PromoterShell>
  );
}

export default DashboardPage;
