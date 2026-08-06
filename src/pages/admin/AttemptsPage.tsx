import { AdminShell } from '../../components/admin/AdminShell';
import { AttemptsTable } from '../../components/admin/AttemptsTable';
import { FilterTabs } from '../../components/admin/FilterTabs';
import type { AttemptFilter, AttemptRow } from '../../db/queries';
import type { Admin } from '../../db/schema';

const TABS: { key: AttemptFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'passed', label: 'Passed' },
  { key: 'failed', label: 'Failed' },
  { key: 'in-progress', label: 'In progress' },
];

/**
 * The full list, on its own screen. The overview keeps only the latest few —
 * this is where you come to actually read them.
 */
export function AttemptsPage(props: {
  admin: Admin;
  rows: AttemptRow[];
  filter: AttemptFilter;
  /** The window `listAttempts` was called with — said out loud, not implied. */
  limit: number;
}) {
  return (
    <AdminShell
      title="Attempts"
      active="attempts"
      admin={props.admin}
      sub={`${props.rows.length} ${props.rows.length === 1 ? 'attempt' : 'attempts'}, newest first.`}
      actions={
        <FilterTabs
          active={props.filter}
          tabs={TABS.map((tab) => ({
            key: tab.key,
            label: tab.label,
            href: tab.key === 'all' ? '/admin/attempts' : `/admin/attempts?filter=${tab.key}`,
          }))}
        />
      }
    >
      <AttemptsTable
        rows={props.rows}
        emptyCopy={
          props.filter === 'all' ? undefined : 'No attempts match this filter yet. Try “All”.'
        }
      />

      {props.rows.length >= props.limit ? (
        <p class="mt-3 text-[13px] text-muted">
          Showing the {props.limit} most recent attempts. This view is windowed, not paginated.
        </p>
      ) : null}
    </AdminShell>
  );
}

export default AttemptsPage;
