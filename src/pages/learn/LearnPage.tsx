import { PromoterShell } from '../../components/common/PromoterShell';
import { Alert } from '../../components/common/Alert';
import { TrainingPlayer } from '../../components/learn/TrainingPlayer';
import { TrainingOverview } from '../../components/learn/TrainingOverview';
import { ContinueGate } from '../../components/learn/ContinueGate';
import { ChapterRail } from '../../components/learn/ChapterRail';
import { OtherMaterial } from '../../components/learn/OtherMaterial';
import type { TutorialMode } from '../../db/schema';
import type { Module } from '../../lib/progress';
import type { Shell } from '../../lib/shell';

/**
 * My Training: the material on the left with its own timeline under it, the
 * course structure on the right. One screen for the whole training step —
 * choosing a format, working through it, and leaving for the quiz.
 */
export function LearnPage(props: {
  shell: Shell;
  mode: TutorialMode | null;
  modules: Module[];
  elapsedSeconds: number;
  remainingSeconds: number;
  questionCount: number;
  criticalCount: number;
  error?: string;
}) {
  const { shell, mode } = props;
  const { settings } = shell;

  const other: TutorialMode = mode === 'video' ? 'slides' : 'video';
  const otherUrl = other === 'video' ? settings.videoUrl : settings.slidesUrl;

  const title =
    mode === 'video' ? 'Training Video' : mode === 'slides' ? 'Training Slides' : 'Training';

  return (
    <PromoterShell
      title="My Training"
      shell={shell}
      active="training"
      wide
      script
      rail={
        <>
          <ChapterRail progress={shell.progress} mode={mode} />
          <OtherMaterial modules={props.modules} progress={shell.progress} mode={mode} />
        </>
      }
    >
      <div class="mb-3">
        <h1 class="m-0 text-xl font-bold tracking-tight text-ink lg:text-2xl">Sales Agent Training</h1>
        <p class="m-0 mt-0.5 text-sm font-semibold text-brand">
          Step 2 — {title}
          {mode ? null : ' · pick a format to begin'}
        </p>
      </div>

      {props.error ? <Alert tone="error">{props.error}</Alert> : null}

      <TrainingPlayer
        mode={mode}
        settings={settings}
        elapsedSeconds={props.elapsedSeconds}
        remainingSeconds={props.remainingSeconds}
        otherMode={mode && otherUrl ? other : null}
      />

      <TrainingOverview
        passMark={settings.passMark}
        questionCount={props.questionCount}
        criticalCount={props.criticalCount}
      />

      {/* Only offered once a format has been chosen — POST /learn/continue
          rejects it anyway, and a button that always fails is worse than none. */}
      {mode ? <ContinueGate remainingSeconds={props.remainingSeconds} /> : null}
    </PromoterShell>
  );
}

export default LearnPage;
