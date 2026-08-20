import { FiInbox } from 'react-icons/fi';
import { TableShell, cellVisibility, type Column } from '../common/TableShell';
import { StatusPill } from '../common/StatusPill';
import { EmptyState } from '../common/EmptyState';
import type { AttemptRow } from '../../db/queries';
import { formatPhone } from '../../lib/phone';
import { formatDate } from '../../lib/format';

// Name, Score and Result are the three things worth knowing at a glance on a
// phone; the rest is detail that shows up once there's room for it.
const COLUMNS: Column[] = [
  'Name',
  { label: 'Phone', hideBelowLg: true },
  { label: 'Tier', hideBelowLg: true },
  { label: 'Started', hideBelowLg: true },
  { label: 'Format', hideBelowLg: true },
  'Score',
  'Result',
  { label: 'Attested', hideBelowLg: true },
];
const [, PHONE, TIER, STARTED, FORMAT, , , ATTESTED] = COLUMNS;

export function AttemptsTable(props: { rows: AttemptRow[]; emptyCopy?: string }) {
  if (props.rows.length === 0) {
    return (
      <EmptyState
        Icon={FiInbox}
        title="No attempts here"
        copy={props.emptyCopy ?? 'Share the training link with a sales agent and their attempt lands here.'}
      />
    );
  }

  return (
    <TableShell columns={COLUMNS}>
      {props.rows.map(({ attempt, promoter }) => (
        <tr class="hover:bg-brand-tint">
          <td>
            {/* The id is in the URL, never the phone number. */}
            <a class="font-medium text-ink no-underline hover:underline" href={`/admin/promoters/${promoter.id}`}>
              {promoter.name}
            </a>
          </td>
          <td class={`text-muted ${cellVisibility(PHONE)}`}>{formatPhone(promoter.phone)}</td>
          <td class={`text-muted ${cellVisibility(TIER)}`}>{promoter.tier}</td>
          <td class={`text-muted ${cellVisibility(STARTED)}`}>{formatDate(attempt.startedAt)}</td>
          <td class={`text-muted ${cellVisibility(FORMAT)}`}>{attempt.tutorialMode ?? '—'}</td>
          <td class={attempt.submittedAt ? 'font-medium text-ink' : 'text-muted'}>
            {attempt.submittedAt ? `${attempt.score}/${attempt.total}` : 'in progress'}
          </td>
          <td>
            {attempt.submittedAt ? (
              <StatusPill tone={attempt.passed ? 'pass' : 'miss'}>
                {attempt.passed ? 'Pass' : 'Fail'}
              </StatusPill>
            ) : (
              <StatusPill>In progress</StatusPill>
            )}
          </td>
          <td class={`text-muted ${cellVisibility(ATTESTED)}`}>
            {attempt.attestedAt ? formatDate(attempt.attestedAt) : '—'}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

export default AttemptsTable;
