/**
 * Lets `react-icons` run on `hono/jsx`.
 *
 * react-icons is built against React: its IconBase calls `React.createElement`
 * and renders `IconContext.Consumer`. hono/jsx provides everything it needs
 * except `Consumer` — its `createContext` returns only `{ values, Provider }`.
 * This module re-exports hono/jsx with that one gap filled, and wrangler.toml
 * aliases `react` to it so the icons render server-side like any other
 * component.
 *
 * The explicit `createContext` below shadows the one from `export *`, which is
 * how ES modules resolve the collision.
 */
import {
  createContext as honoCreateContext,
  createElement as honoCreateElement,
  Fragment,
  useContext,
  type Context,
} from 'hono/jsx';

export * from 'hono/jsx';

/**
 * react-icons builds its svg props with a helper that leaves `children` in the
 * props object *and* passes children positionally. React lets the positional
 * ones win; hono/jsx instead tries to render the prop as an attribute and
 * throws. Applying React's precedence rule here fixes it.
 *
 * Only react-icons goes through this — the app's own JSX compiles against
 * hono/jsx's runtime directly.
 */
export function createElement(type: unknown, props: unknown, ...children: unknown[]) {
  if (children.length > 0 && props && typeof props === 'object' && 'children' in props) {
    const { children: _positional, ...rest } = props as Record<string, unknown>;
    return (honoCreateElement as CreateElement)(type, rest, ...children);
  }
  return (honoCreateElement as CreateElement)(type, props, ...children);
}

type CreateElement = (type: unknown, props: unknown, ...children: unknown[]) => unknown;

type WithConsumer<T> = Context<T> & {
  Consumer: (props: { children: (value: T) => unknown }) => unknown;
};

export function createContext<T>(defaultValue: T): WithConsumer<T> {
  const ctx = honoCreateContext(defaultValue) as WithConsumer<T>;

  // hono/jsx normalizes children to an array, so the render-prop React would
  // hand straight back arrives wrapped. Unwrap before calling it.
  ctx.Consumer = (props) => {
    const render = Array.isArray(props.children) ? props.children[0] : props.children;
    return typeof render === 'function' ? render(useContext(ctx)) : render;
  };

  return ctx;
}

export default { createElement, createContext, useContext, Fragment };
