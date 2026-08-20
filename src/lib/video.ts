import type { Context } from 'hono';

/**
 * What counts as an acceptable training video upload, same shape as
 * lib/photo.ts. R2 has no per-object size ceiling that matters here, but a
 * Worker's request body does — this is well under it, and still enough for a
 * training clip a few minutes long.
 */
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

const EXT_FOR: Record<(typeof ALLOWED_VIDEO_TYPES)[number], string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

export type VideoCheck = { ok: true; mime: string } | { ok: false; error: string };

export function checkVideo(file: { type: string; size: number }): VideoCheck {
  const mime = file.type.split(';')[0]?.trim().toLowerCase() ?? '';

  if (!(ALLOWED_VIDEO_TYPES as readonly string[]).includes(mime)) {
    return { ok: false, error: 'Use an MP4, WebM or MOV file.' };
  }

  if (file.size === 0) {
    return { ok: false, error: 'That file is empty. Choose it again.' };
  }

  if (file.size > MAX_VIDEO_BYTES) {
    return {
      ok: false,
      error: `That video is ${Math.round(file.size / (1024 * 1024))} MB. The limit is ${Math.round(
        MAX_VIDEO_BYTES / (1024 * 1024),
      )} MB — compress it first.`,
    };
  }

  return { ok: true, mime };
}

/** One object per upload, named so a stale key never collides with the next. */
export function videoKeyFor(mime: string): string {
  const ext = EXT_FOR[mime as (typeof ALLOWED_VIDEO_TYPES)[number]] ?? 'mp4';
  return `training/${crypto.randomUUID()}.${ext}`;
}

/**
 * Serves one R2 object with Range support, so scrubbing a training video
 * works — without it the browser can fetch but never seek, and that failure
 * is silent (a stuck progress bar, not an error).
 */
export async function serveVideoRange(
  c: Context,
  bucket: R2Bucket,
  key: string,
): Promise<Response> {
  const head = await bucket.head(key);
  if (!head) return c.notFound();

  const size = head.size;
  const mime = head.httpMetadata?.contentType ?? 'video/mp4';
  const range = c.req.header('Range');

  if (!range) {
    const object = await bucket.get(key);
    if (!object) return c.notFound();
    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Length': String(size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=604800',
      },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });

  const [, startStr, endStr] = match;
  const start = startStr ? Number(startStr) : Math.max(0, size - Number(endStr));
  const end = endStr && startStr ? Math.min(Number(endStr), size - 1) : size - 1;

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }

  const object = await bucket.get(key, { range: { offset: start, length: end - start + 1 } });
  if (!object) return c.notFound();

  return new Response(object.body, {
    status: 206,
    headers: {
      'Content-Type': mime,
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=604800',
    },
  });
}
