import { FiFilm, FiUpload, FiX } from "react-icons/fi";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Field } from "../common/Field";
import type { Settings } from "../../db/schema";

/**
 * Lives on the Questions page, not Settings — the video is training content
 * an admin authors, same as the quiz, not a site-wide switch like the pass
 * mark or the support desk.
 */
export function TrainingMaterialCard(props: {
  settings: Settings;
  error?: string;
}) {
  const { settings } = props;

  return (
    <Card
      title="Training material"
      sub="Upload the video sales agents watch as part of training. Stored on this deployment's own storage, not Drive."
    >
      {settings.videoKey ? (
        <div class="grid gap-4">
          <div class="flex flex-col gap-3 rounded-xl border border-line p-3 sm:flex-row sm:items-center sm:px-4 sm:py-3">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-mint text-brand-deep"
                aria-hidden="true"
              >
                <FiFilm size={18} />
              </span>
              <span class="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">
                Video uploaded
              </span>
            </div>

            <div class="flex items-center gap-3 sm:ml-auto sm:shrink-0">
              <a
                class="shrink-0 text-[13px] font-medium text-brand no-underline hover:underline"
                href="/admin/questions/video"
                target="_blank"
                rel="noreferrer"
              >
                Preview
              </a>
              <form method="post" action="/admin/questions/video/remove">
                <Button type="submit" tone="ghost" small>
                  <FiX size={16} />
                  Remove uploaded video
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <form
          method="post"
          action="/admin/questions/video"
          enctype="multipart/form-data"
        >
          <Field
            label="Video file"
            hint="MP4, WebM or MOV, up to 200 MB."
            error={props.error}
          >
            <div class="flex w-full flex-col gap-2 rounded-xl border border-line bg-white p-1.5 focus-within:border-brand sm:flex-row sm:items-center sm:py-1.5 sm:pr-1.5 sm:pl-3.5">
              <input
                class="block w-full min-w-0 truncate text-[15px] text-ink file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-mint file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-brand-ink sm:flex-1"
                name="video"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                required
              />
              <Button type="submit" small class="w-full shrink-0 sm:w-auto">
                <FiUpload size={16} />
                Upload
              </Button>
            </div>
          </Field>
        </form>
      )}
    </Card>
  );
}

export default TrainingMaterialCard;
