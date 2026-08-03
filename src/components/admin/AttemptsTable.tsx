import { Alert } from '../common/Alert';
import type { AttemptRow } from '../../db/queries';
import { formatPhone } from '../../lib/phone';
import { formatDate } from '../../lib/format';
import './AttemptsTable.css';

export function AttemptsTable(props: { rows: AttemptRow[] }) {
  if (props.rows.length === 0) {
    return <Alert tone="info">No attempts yet. Share the training link with a promoter to start.</Alert>;
  }

  return (
    <div class="tablewrap">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Tier</th>
            <th>Started</th>
            <th>Format</th>
            <th>Score</th>
            <th>Result</th>
            <th>Attested</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map(({ attempt, promoter }) => (
            <tr>
              <td>
                <a href={`/admin/promoters/${promoter.id}`}>{promoter.name}</a>
              </td>
              <td>{formatPhone(promoter.phone)}</td>
              <td>{promoter.tier}</td>
              <td>{formatDate(attempt.startedAt)}</td>
              <td>{attempt.tutorialMode ?? '—'}</td>
              <td>
                {attempt.submittedAt ? (
                  `${attempt.score}/${attempt.total}`
                ) : (
                  <span class="muted">in progress</span>
                )}
              </td>
              <td>
                {attempt.submittedAt ? (
                  <span class={attempt.passed ? 'pill pill-pass' : 'pill pill-fail'}>
                    {attempt.passed ? 'Pass' : 'Fail'}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td>{attempt.attestedAt ? formatDate(attempt.attestedAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttemptsTable;
