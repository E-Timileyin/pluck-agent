import { PromoterShell } from '../../components/common/PromoterShell';
import { Alert } from '../../components/common/Alert';
import { TutorialChoice } from '../../components/learn/TutorialChoice';
import { TutorialEmbed } from '../../components/learn/TutorialEmbed';
import { ContinueGate } from '../../components/learn/ContinueGate';
import type { TutorialMode } from '../../db/schema';
import type { Shell } from '../../lib/shell';

export function LearnPage(props: {
  shell: Shell;
  mode: TutorialMode | null;
  remainingSeconds: number;
  error?: string;
}) {
  const { settings } = props.shell;
  const { mode } = props;
  const configured = !!settings.slidesUrl || !!settings.videoUrl;

  if (!mode) {
    return (
      <PromoterShell title="Training" shell={props.shell} active="training" showRail>
        <h1>Training material</h1>
        <p class="lede">Pick one. You can switch at any time — the timer keeps running.</p>
        {props.error ? <Alert tone="error">{props.error}</Alert> : null}
        {configured ? (
          <TutorialChoice slidesUrl={settings.slidesUrl} videoUrl={settings.videoUrl} />
        ) : (
          <Alert tone="info">
            The training material has not been added yet. An administrator needs to paste the Google
            Drive links in Admin → Settings before this screen will work.
          </Alert>
        )}
      </PromoterShell>
    );
  }

  const src = mode === 'video' ? settings.videoUrl : settings.slidesUrl;
  const other: TutorialMode = mode === 'video' ? 'slides' : 'video';
  const otherUrl = other === 'video' ? settings.videoUrl : settings.slidesUrl;

  return (
    <PromoterShell title="Training" shell={props.shell} active="training" showRail script>
      <h1>{mode === 'video' ? 'Training video' : 'Training slides'}</h1>
      {props.error ? <Alert tone="error">{props.error}</Alert> : null}
      <TutorialEmbed mode={mode} src={src} />
      <ContinueGate remainingSeconds={props.remainingSeconds} otherMode={otherUrl ? other : null} />
    </PromoterShell>
  );
}

export default LearnPage;
