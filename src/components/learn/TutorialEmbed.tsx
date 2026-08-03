import { Alert } from '../common/Alert';
import type { TutorialMode } from '../../db/schema';
import './TutorialEmbed.css';

export function TutorialEmbed(props: { mode: TutorialMode; src: string | null }) {
  if (!props.src) return <Alert tone="info">This format has not been configured yet.</Alert>;

  const title = props.mode === 'video' ? 'Training video' : 'Training slides';
  return (
    <div class="embed">
      <iframe src={props.src} title={title} allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>
    </div>
  );
}

export default TutorialEmbed;
