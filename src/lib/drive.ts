/**
 * Admins paste normal Drive share links; we store the embed URL, so /learn
 * does no parsing at render time.
 */
const VIDEO = /\/file\/d\/([a-zA-Z0-9_-]+)/; // drive.google.com/file/d/<ID>/view
const SLIDES = /\/presentation\/d\/([a-zA-Z0-9_-]+)/; // docs.google.com/presentation/d/<ID>/edit

export function toVideoEmbed(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const id = VIDEO.exec(raw)?.[1];
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/preview`;
}

export function toSlidesEmbed(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const id = SLIDES.exec(raw)?.[1];
  if (!id) return null;
  return `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false`;
}

export const VIDEO_LINK_EXAMPLE = 'https://drive.google.com/file/d/<ID>/view';
export const SLIDES_LINK_EXAMPLE = 'https://docs.google.com/presentation/d/<ID>/edit';
