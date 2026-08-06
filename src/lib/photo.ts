/**
 * What counts as an acceptable profile photo.
 *
 * There is no image processing at the edge — no resize, no re-encode, no EXIF
 * strip — so everything here is a *rejection* rule rather than a repair. The
 * bytes that arrive are the bytes that get stored and served back.
 *
 * The ceiling is deliberately well under D1's ~1 MB value limit: a modern phone
 * camera produces 3–8 MB, so most uploads will be refused and the message has
 * to say what to do about it.
 */
export const MAX_PHOTO_BYTES = 512 * 1024;

export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type PhotoCheck = { ok: true; mime: string } | { ok: false; error: string };

export function checkPhoto(file: { type: string; size: number }): PhotoCheck {
  const mime = file.type.split(';')[0]?.trim().toLowerCase() ?? '';

  if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(mime)) {
    return { ok: false, error: 'Use a JPEG, PNG or WebP image.' };
  }

  if (file.size === 0) {
    return { ok: false, error: 'That file is empty. Pick the photo again.' };
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return {
      ok: false,
      error: `That photo is ${Math.round(file.size / 1024)} KB. The limit is ${Math.round(
        MAX_PHOTO_BYTES / 1024,
      )} KB — crop it, or use your phone's "small" or "medium" size when sharing.`,
    };
  }

  return { ok: true, mime };
}
