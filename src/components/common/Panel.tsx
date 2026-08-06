import type { Child } from 'hono/jsx';

/**
 * One tile of the bento grid: 24px radius, hairline border, generous padding.
 *
 * `tone` covers the three surfaces the comp uses — white for most tiles, the
 * dark inset for the one figure a screen is really about, and a tinted one for
 * the promotional card.
 */
export function Panel(props: {
  tone?: 'plain' | 'dark' | 'tint';
  class?: string;
  children?: Child;
}) {
  const surface =
    props.tone === 'dark'
      ? 'bg-brand-deep text-white'
      : props.tone === 'tint'
        ? 'bg-brand-mint text-ink'
        : 'border border-line bg-white text-ink';

  return (
    <section class={`rounded-2xl p-4 lg:p-5 ${surface} ${props.class ?? ''}`}>{props.children}</section>
  );
}

export default Panel;
