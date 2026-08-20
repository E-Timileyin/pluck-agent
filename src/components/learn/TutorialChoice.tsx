import { FiFileText, FiPlayCircle } from 'react-icons/fi';

export function TutorialChoice(props: { slidesUrl: string | null; videoUrl: string | null }) {
  const none = !props.slidesUrl && !props.videoUrl;

  return (
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(150deg,#045023_0%,#023d1a_100%)] p-6 text-center">
      {none ? (
        <p class="m-0 max-w-[40ch] text-[15px]/[1.6] text-white/80">
          The training material has not been published yet. An administrator has to add the slides
          or the video before this screen will play anything.
        </p>
      ) : (
        <>
          <p class="m-0 text-lg font-medium text-white">Choose how you want to learn</p>
          <p class="m-0 max-w-[38ch] text-sm text-white/70">
            You can switch at any time — the timer keeps running either way.
          </p>

          <div class="flex flex-wrap justify-center gap-3">
            {props.slidesUrl ? (
              <form method="post" action="/learn/mode">
                <input type="hidden" name="mode" value="slides" />
                <button
                  class="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-white px-5 text-[15px] font-medium text-brand-deep"
                  type="submit"
                >
                  <FiFileText size={20} />
                  Slides
                  <span class="font-normal text-muted">· very little data</span>
                </button>
              </form>
            ) : null}

            {props.videoUrl ? (
              <form method="post" action="/learn/mode">
                <input type="hidden" name="mode" value="video" />
                <button
                  class="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border border-white/40 bg-white/10 px-5 text-[15px] font-medium text-white"
                  type="submit"
                >
                  <FiPlayCircle size={20} />
                  Video
                  <span class="font-normal text-white/60">· about 60 MB</span>
                </button>
              </form>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

export default TutorialChoice;
