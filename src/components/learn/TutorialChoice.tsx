import './TutorialChoice.css';

/**
 * Slides first, video second, and the video labelled with its data cost — on a
 * personal Nigerian mobile bundle that label is the difference between finishing
 * the training and abandoning it.
 */
export function TutorialChoice(props: { slidesUrl: string | null; videoUrl: string | null }) {
  return (
    <div class="choices">
      {props.slidesUrl ? (
        <form method="post" action="/learn/mode" class="choice">
          <input type="hidden" name="mode" value="slides" />
          <button class="choice-btn" type="submit">
            <span class="choice-title">Slides</span>
            <span class="choice-meta">Recommended · uses very little data</span>
          </button>
        </form>
      ) : null}

      {props.videoUrl ? (
        <form method="post" action="/learn/mode" class="choice">
          <input type="hidden" name="mode" value="video" />
          <button class="choice-btn" type="submit">
            <span class="choice-title">Video</span>
            <span class="choice-meta">About 60 MB of data</span>
          </button>
        </form>
      ) : null}
    </div>
  );
}

export default TutorialChoice;
