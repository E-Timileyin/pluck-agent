import type { Child } from 'hono/jsx';

export type Column = string | { label: string; hideBelowLg?: boolean };

/** Same rule a column's header declares — pass to the matching `<td>`'s class. */
export const cellVisibility = (column: Column): string =>
  typeof column !== 'string' && column.hideBelowLg ? 'hidden lg:table-cell' : '';

/**
 * The card a table sits in, plus the cell styling for whatever rows are passed
 * in — the `[&_td]` variants mean a row is `<tr><td>…</td></tr>` and nothing
 * else, so every table in the console lines up without repeating classes.
 *
 * The wrapper still scrolls sideways rather than the page as a last resort,
 * but a phone-width table that's mostly secondary detail columns scrolled to a
 * sliver of the first one is not usably "responsive" — a column marked
 * `hideBelowLg` drops out below the desktop breakpoint instead, so what's
 * left actually fits. The caller must give its `<td>`s the same class via
 * `cellVisibility()`, since this component never sees the row markup.
 */
export function TableShell(props: { columns: Column[]; children?: Child }) {
  return (
    <div class="overflow-x-auto rounded-2xl border border-line bg-white">
      <table
        class="w-full border-collapse text-left text-[15px] [&_td]:border-b [&_td]:border-line [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_td]:whitespace-nowrap [&_tr:last-child_td]:border-b-0"
      >
        <thead>
          <tr>
            {props.columns.map((column) => (
              <th
                class={`border-b border-line px-4 py-2.5 text-xs font-medium tracking-[0.06em] text-muted uppercase whitespace-nowrap ${cellVisibility(column)}`}
              >
                {typeof column === 'string' ? column : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{props.children}</tbody>
      </table>
    </div>
  );
}

export default TableShell;
