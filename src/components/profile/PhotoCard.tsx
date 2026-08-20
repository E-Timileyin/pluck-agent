import { FiCamera, FiTrash2 } from "react-icons/fi";
import { Card } from "../common/Card";
import { Avatar } from "../common/Avatar";
import { Button } from "../common/Button";
import { MAX_PHOTO_BYTES } from "../../lib/photo";

/**
 * Upload and removal, as two plain form POSTs — no cropper, no preview, no
 * drag-and-drop. `capture` is left off deliberately: an Android file picker
 * then offers the camera *and* the gallery, and most people already have the
 * photo they want.
 */
export function PhotoCard(props: {
  name: string;
  photoHref?: string;
  error?: string;
}) {
  return (
    <Card
      title="Profile photo"
      sub={`JPEG, PNG or WebP, up to ${Math.round(MAX_PHOTO_BYTES / 1024)} KB. It appears beside your name here and on your record.`}
    >
      {props.error ? (
        <p
          class="m-0 mb-4 rounded-xl bg-[#ffe6e0] px-4 py-3 text-[15px] font-medium text-miss"
          role="alert"
        >
          {props.error}
        </p>
      ) : null}

      <div class="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
        <Avatar name={props.name} src={props.photoHref} size={96} />

        <div class="grid w-full min-w-0 gap-3">
          <form
            method="post"
            action="/profile/photo"
            enctype="multipart/form-data"
            class="w-full"
          >
            <div class="flex w-full flex-col gap-2 rounded-xl border border-line bg-white p-1.5 focus-within:border-brand sm:flex-row sm:items-center sm:py-1.5 sm:pr-1.5 sm:pl-3.5">
              <input
                class="block w-full min-w-0 truncate text-[15px] text-ink file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-mint file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-brand-ink sm:flex-1"
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                required
                aria-label="Choose a photo"
              />
              <Button type="submit" small class="w-full shrink-0 sm:w-auto">
                <FiCamera size={16} />
                {props.photoHref ? "Replace" : "Upload"}
              </Button>
            </div>
          </form>
          {props.photoHref ? (
            <form method="post" action="/profile/photo/remove">
              <button
                class="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border-0 bg-muted px-5 px-0 text-sm font-medium text-red-500 transition-colors duration-150 hover:text-miss"
                type="submit"
              >
                <FiTrash2 size={16} />
                Remove photo
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default PhotoCard;
