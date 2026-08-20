import { FiUsers } from 'react-icons/fi';
import { TableShell, cellVisibility, type Column } from '../common/TableShell';
import { Avatar } from '../common/Avatar';
import { StatusPill } from '../common/StatusPill';
import { EmptyState } from '../common/EmptyState';
import type { PromoterRow } from '../../db/queries';
import { formatPhone } from '../../lib/phone';
import { formatDate } from '../../lib/format';

// Name and Best score answer "who is this and are they certified" on a phone
// screen, where three columns of a real name plus a status pill genuinely
// don't fit without cramping every one of them. Status re-appears at lg,
// where there's room for it without shrinking everything else to get there.
const COLUMNS: Column[] = [
  'Name',
  { label: 'Sales Agent ID', hideBelowLg: true },
  { label: 'Phone', hideBelowLg: true },
  { label: 'Tier', hideBelowLg: true },
  { label: 'Attempts', hideBelowLg: true },
  'Best score',
  { label: 'Status', hideBelowLg: true },
  { label: 'Last attempt', hideBelowLg: true },
];
const [, AGENT_ID, PHONE, TIER, ATTEMPTS, , STATUS, LAST_ATTEMPT] = COLUMNS;

/** One row per person — the attempts table answers the per-attempt question. */
export function PromotersTable(props: { rows: PromoterRow[]; searching?: boolean }) {
  if (props.rows.length === 0) {
    return (
      <EmptyState
        Icon={FiUsers}
        title={props.searching ? 'Nobody by that name' : 'No sales agents imported yet'}
        copy={
          props.searching
            ? 'Search matches the name only — a phone number must never end up in a URL.'
            : 'Add sales agents, then they appear here once they sign in.'
        }
      />
    );
  }

  return (
    <TableShell columns={COLUMNS}>
      {props.rows.map((row) => (
        <tr class="hover:bg-brand-tint">
          <td class="max-w-0 w-full">
            <a
              class="flex min-w-0 items-center gap-3 font-medium text-ink no-underline hover:underline"
              href={`/admin/promoters/${row.promoter.id}`}
            >
              <Avatar
                name={row.promoter.name}
                src={
                  row.photoAt
                    ? `/admin/promoters/${row.promoter.id}/photo?v=${encodeURIComponent(row.photoAt)}`
                    : undefined
                }
                size={36}
              />
              <span class="min-w-0 truncate">{row.promoter.name}</span>
            </a>
          </td>
          <td class={`text-muted ${cellVisibility(AGENT_ID)}`}>{row.promoter.agentId}</td>
          <td class={`text-muted ${cellVisibility(PHONE)}`}>{formatPhone(row.promoter.phone)}</td>
          <td class={`text-muted ${cellVisibility(TIER)}`}>{row.promoter.tier}</td>
          <td class={`font-medium text-ink ${cellVisibility(ATTEMPTS)}`}>{row.attempts}</td>
          <td class={row.bestPercent === null ? 'text-muted' : 'font-medium text-ink'}>
            {row.bestPercent === null ? '—' : `${row.bestPercent}%`}
          </td>
          <td class={cellVisibility(STATUS)}>
            {row.everPassed ? (
              <StatusPill tone="pass">Certified</StatusPill>
            ) : row.attempts === 0 ? (
              <StatusPill>Not started</StatusPill>
            ) : (
              <StatusPill tone="neutral">In training</StatusPill>
            )}
          </td>
          <td class={`text-muted ${cellVisibility(LAST_ATTEMPT)}`}>
            {row.lastAttemptAt ? formatDate(row.lastAttemptAt) : '—'}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

export default PromotersTable;
