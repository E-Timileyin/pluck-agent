import { FiCheckCircle, FiClock } from 'react-icons/fi';
import { PromoterShell } from '../../components/common/PromoterShell';
import { DashboardGreeting } from '../../components/dashboard/DashboardGreeting';
import { ProgressHero } from '../../components/dashboard/ProgressHero';
import { FigureTile } from '../../components/dashboard/FigureTile';
// import { GoalSummaryTile } from '../../components/dashboard/GoalSummaryTile';
import { ContinueJourney } from '../../components/dashboard/ContinueJourney';
import { ScoresPanel } from '../../components/dashboard/ScoresPanel';
import { CertificationGoal } from '../../components/dashboard/CertificationGoal';
import type { Attempt } from '../../db/schema';
import type { Module, Resume } from '../../lib/progress';
import type { Shell } from '../../lib/shell';
import { firstName, formatClock } from '../../lib/format';

/**
 * One screen, two rows. Row one is four single-number tiles — the same
 * numbers a promoter would ask about if they called support. Row two is
 * "what do I do next" (left) and "how far to certified" (right). Nothing
 * here duplicates the sidebar, and nothing here is a placeholder.
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
      header={<DashboardGreeting greeting={shell.greeting} firstName={firstName(promoter.name)} />}
    >
      {/* Row 1 — four single-number tiles. Progress is twice as wide as the
          rest, same as the comp: it is the number the other three explain. */}
      <div class="grid gap-3 lg:grid-cols-4">
        <ProgressHero progress={progress} />

        <FigureTile
          Icon={FiCheckCircle}
          title="Quiz"
          period={progress.totalQuestions === 0 ? 'not published' : 'this attempt'}
          value={String(progress.answered)}
          unit={`/ ${progress.totalQuestions}`}
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

        {/* <GoalSummaryTile passMark={settings.passMark} /> */}
      </div>

      {/* Row 2 — next actions (left, 2/3) and the certification goal (right,
          1/3). This is the only place the gauge and the module list live. */}
      <div class="mt-3 grid gap-3 lg:grid-cols-3">
        <div class="grid content-start gap-3 lg:col-span-2">
          <ContinueJourney resume={props.resume} resumeHref={props.resumeHref} />
          <ScoresPanel bars={bars} />
        </div>

        <CertificationGoal percent={progress.percent} passMark={settings.passMark} modules={props.modules} />
      </div>
    </PromoterShell>
  );
}

export default DashboardPage;