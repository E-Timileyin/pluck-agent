import { Layout } from '../../components/common/Layout';
import { Alert } from '../../components/common/Alert';
import { TutorialChoice } from '../../components/learn/TutorialChoice';
import { TutorialEmbed } from '../../components/learn/TutorialEmbed';
import { ContinueGate } from '../../components/learn/ContinueGate';
import type { Settings, TutorialMode } from '../../db/schema';

export function LearnPage(props: {
  settings: Settings;
  mode: TutorialMode | null;
  remainingSeconds: number;
  error?: string;
}) {
  const { settings, mode } = props;
  const configured = !!settings.slidesUrl || !!settings.videoUrl;

  if (!mode) {
    return (
      <Layout title="Training" step="learn">
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
      </Layout>
    );
  }

  const src = mode === 'video' ? settings.videoUrl : settings.slidesUrl;
  const other: TutorialMode = mode === 'video' ? 'slides' : 'video';
  const otherUrl = other === 'video' ? settings.videoUrl : settings.slidesUrl;

  return (
    <Layout title="Training" step="learn" script>
      <h1>{mode === 'video' ? 'Training video' : 'Training slides'}</h1>
      {props.error ? <Alert tone="error">{props.error}</Alert> : null}
      <TutorialEmbed mode={mode} src={src} />
      <ContinueGate remainingSeconds={props.remainingSeconds} otherMode={otherUrl ? other : null} />
    </Layout>
  );
}

export default LearnPage;
