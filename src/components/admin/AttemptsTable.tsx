import { FiInbox } from 'react-icons/fi';
import { TableShell } from '../common/TableShell';
import { StatusPill } from '../common/StatusPill';
import { EmptyState } from '../common/EmptyState';
import type { AttemptRow } from '../../db/queries';
import { formatPhone } from '../../lib/phone';
import { formatDate } from '../../lib/format';

const COLUMNS = ['Name', 'Phone', 'Tier', 'Started', 'Format', 'Score', 'Result', 'Attested'];

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
            <a class="font-semibold text-ink no-underline hover:underline" href={`/admin/promoters/${promoter.id}`}>
              {promoter.name}
            </a>
          </td>
          <td class="text-muted">{formatPhone(promoter.phone)}</td>
          <td class="text-muted">{promoter.tier}</td>
          <td class="text-muted">{formatDate(attempt.startedAt)}</td>
          <td class="text-muted">{attempt.tutorialMode ?? '—'}</td>
          <td class={attempt.submittedAt ? 'font-semibold text-ink' : 'text-muted'}>
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
          <td class="text-muted">{attempt.attestedAt ? formatDate(attempt.attestedAt) : '—'}</td>
        </tr>
      ))}
    </TableShell>
  );
}

export default AttemptsTable;
