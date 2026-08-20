/**
 * A sales agent's face, or their initials when they have not uploaded one.
 *
 * `src` carries the photo's timestamp as a query string, so a new upload is a
 * new URL — otherwise the browser keeps showing the old face until the cache
 * expires, which reads as the upload having failed.
 */
export function Avatar(props: {
  name: string;
  src?: string | null;
  /** Pixels. The comp uses 40 in the sidebar, 56 on a profile, 96 on upload. */
  size?: number;
  class?: string;
}) {
  const size = props.size ?? 40;
  const box = `shrink-0 rounded-full object-cover ${props.class ?? ''}`;
  const style = `width:${size}px;height:${size}px`;

  if (props.src) {
    return <img class={`${box} bg-step-idle`} style={style} src={props.src} alt="" loading="lazy" />;
  }

  const initials = props.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      class={`${box} flex items-center justify-center bg-brand-deep font-medium text-white`}
      style={`${style};font-size:${Math.round(size * 0.36)}px`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export default Avatar;
