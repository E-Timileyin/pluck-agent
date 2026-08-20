import type { Child } from "hono/jsx";

export type ButtonTone = "primary" | "ghost" | "quiet";

const TONE: Record<ButtonTone, string> = {
  primary: "bg-brand text-white hover:bg-brand-deep",
  ghost:
    "border border-line bg-white text-ink hover:border-brand hover:text-brand",
  quiet: "bg-brand-mint text-brand-ink hover:bg-brand-tint",
};

const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 font-medium no-underline transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

/* Written out per size rather than overridden: two utilities for the same
   property resolve by stylesheet order, not by the order they appear here. */
const SIZE = {
  normal: "min-h-11 px-5 text-sm",
  small: "min-h-10 px-3.5 text-sm",
} as const;

export function Button(props: {
  tone?: ButtonTone;
  href?: string;
  type?: "submit" | "button";
  disabled?: boolean;
  small?: boolean;
  class?: string;
  children?: Child;
}) {
  const cls = `${BASE} ${SIZE[props.small ? "small" : "normal"]} ${TONE[props.tone ?? "primary"]} ${
    props.class ?? ""
  }`;

  if (props.href) {
    return (
      <a class={cls} href={props.href}>
        {props.children}
      </a>
    );
  }

  return (
    <button class={cls} type={props.type ?? "submit"} disabled={props.disabled}>
      {props.children}
    </button>
  );
}

export default Button;
