import type { Child } from 'hono/jsx';

/**
 * The card a table sits in, plus the cell styling for whatever rows are passed
 * in — the `[&_td]` variants mean a row is `<tr><td>…</td></tr>` and nothing
 * else, so every table in the console lines up without repeating classes.
 *
 * The wrapper scrolls sideways rather than the page: these tables are read on a
 * phone as often as on a laptop.
 */
export function TableShell(props: { columns: string[]; children?: Child }) {
  return (
    <div class="overflow-x-auto rounded-2xl border border-line bg-white">
      <table
        class="w-full border-collapse text-left text-[15px] [&_td]:border-b [&_td]:border-line [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-middle [&_td]:whitespace-nowrap [&_tr:last-child_td]:border-b-0"
      >
        <thead>
          <tr>
            {props.columns.map((column) => (
              <th class="border-b border-line px-4 py-2.5 text-xs font-semibold tracking-[0.06em] text-muted uppercase whitespace-nowrap">
                {column}
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
