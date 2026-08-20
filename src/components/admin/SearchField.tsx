import { FiSearch } from 'react-icons/fi';

/**
 * A GET form, so the search term lands in the URL and the result is a page you
 * can bookmark or send on. It matches names only — a phone number must never
 * appear in a URL or a log line, and a query string is both.
 */
export function SearchField(props: { action: string; value?: string; placeholder: string }) {
  return (
    <form method="get" action={props.action} class="flex gap-2" role="search">
      <span class="relative flex min-w-0 flex-1 items-center sm:w-72 sm:flex-none">
        <span class="pointer-events-none absolute left-3.5 flex text-muted" aria-hidden="true">
          <FiSearch size={18} />
        </span>
        <input
          class="h-12 w-full rounded-xl border border-line bg-white pr-3 pl-11 text-[15px] text-ink"
          type="search"
          name="q"
          value={props.value ?? ''}
          placeholder={props.placeholder}
          aria-label={props.placeholder}
        />
      </span>
      <button
        class="h-12 shrink-0 cursor-pointer rounded-xl border-0 bg-brand px-5 text-[15px] font-medium text-white"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}

export default SearchField;
