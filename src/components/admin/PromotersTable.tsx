import { FiUsers } from 'react-icons/fi';
import { TableShell } from '../common/TableShell';
import { Avatar } from '../common/Avatar';
import { StatusPill } from '../common/StatusPill';
import { EmptyState } from '../common/EmptyState';
import type { PromoterRow } from '../../db/queries';
import { formatPhone } from '../../lib/phone';
import { formatDate } from '../../lib/format';

const COLUMNS = ['Name', 'Phone', 'Tier', 'Attempts', 'Best score', 'Status', 'Last attempt'];

/** One row per person — the attempts table answers the per-attempt question. */
export function PromotersTable(props: { rows: PromoterRow[]; searching?: boolean }) {
  if (props.rows.length === 0) {
    return (
      <EmptyState
        Icon={FiUsers}
        title={props.searching ? 'Nobody by that name' : 'No sales agents yet'}
        copy={
          props.searching
            ? 'Search matches the name only — a phone number must never end up in a URL.'
            : 'A sales agent appears here the moment they fill in the start form.'
        }
      />
    );
  }

  return (
    <TableShell columns={COLUMNS}>
      {props.rows.map((row) => (
        <tr class="hover:bg-brand-tint">
          <td>
            <a
              class="flex items-center gap-3 font-semibold text-ink no-underline hover:underline"
              href={`/admin/promoters/${row.promoter.id}`}
            >
              <Avatar
                name={row.promoter.name}
                src={
                  row.photoAt
                    ? `/admin/promoters/${row.promoter.id}/photo?v=${encodeURIComponent(row.photoAt)}`
                    : undefined
                }
                size={32}
              />
              {row.promoter.name}
            </a>
          </td>
          <td class="text-muted">{formatPhone(row.promoter.phone)}</td>
          <td class="text-muted">{row.promoter.tier}</td>
          <td class="font-semibold text-ink">{row.attempts}</td>
          <td class={row.bestPercent === null ? 'text-muted' : 'font-semibold text-ink'}>
            {row.bestPercent === null ? '—' : `${row.bestPercent}%`}
          </td>
          <td>
            {row.everPassed ? (
              <StatusPill tone="pass">Certified</StatusPill>
            ) : row.attempts === 0 ? (
              <StatusPill>Not started</StatusPill>
            ) : (
              <StatusPill tone="neutral">In training</StatusPill>
            )}
          </td>
          <td class="text-muted">
            {row.lastAttemptAt ? formatDate(row.lastAttemptAt) : '—'}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

export default PromotersTable;
