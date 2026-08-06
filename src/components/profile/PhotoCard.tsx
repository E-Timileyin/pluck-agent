import { FiCamera, FiTrash2 } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { MAX_PHOTO_BYTES } from '../../lib/photo';

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
        <p class="m-0 mb-4 rounded-xl bg-[#ffe6e0] px-4 py-3 text-[15px] font-semibold text-miss" role="alert">
          {props.error}
        </p>
      ) : null}

      <div class="flex flex-wrap items-center gap-5">
        <Avatar name={props.name} src={props.photoHref} size={96} />

        <div class="grid min-w-0 flex-1 gap-3">
          <form method="post" action="/profile/photo" enctype="multipart/form-data" class="grid gap-3">
            <input
              class="w-full rounded-xl border border-line bg-white p-3 text-[15px] text-ink file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-mint file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-ink"
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              required
              aria-label="Choose a photo"
            />
            <div>
              <button
                class="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-0 bg-brand px-5 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-brand-deep"
                type="submit"
              >
                <FiCamera size={18} />
                {props.photoHref ? 'Replace photo' : 'Upload photo'}
              </button>
            </div>
          </form>

          {props.photoHref ? (
            <form method="post" action="/profile/photo/remove">
              <button
                class="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-0 text-sm font-semibold text-muted transition-colors duration-150 hover:text-miss"
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
