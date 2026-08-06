import type { IconType } from 'react-icons';
import { FiCalendar, FiMail, FiPhone, FiTag } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { StatusPill } from '../common/StatusPill';
import type { Attempt, Promoter } from '../../db/schema';
import { formatPhone } from '../../lib/phone';
import { formatDate } from '../../lib/format';

/** The identity block at the top of a promoter's page in the console. */
export function PromoterCard(props: {
  promoter: Promoter;
  attempts: Attempt[];
  photoAt?: string | null;
}) {
  const { promoter } = props;
  const submitted = props.attempts.filter((a) => a.submittedAt);
  const passed = submitted.some((a) => a.passed);
  const best = submitted.reduce((top, a) => {
    const percent = a.total ? Math.round(((a.score ?? 0) / a.total) * 100) : 0;
    return percent > top ? percent : top;
  }, 0);

  const rows: { Icon: IconType; value: string }[] = [
    { Icon: FiPhone, value: formatPhone(promoter.phone) },
    { Icon: FiTag, value: `${promoter.tier} Sales Agent` },
    { Icon: FiMail, value: promoter.email ?? 'No email on file' },
    { Icon: FiCalendar, value: `Joined ${formatDate(promoter.createdAt)}` },
  ];

  return (
    <Card>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex min-w-0 items-center gap-4">
          <Avatar
            name={promoter.name}
            src={
              props.photoAt
                ? `/admin/promoters/${promoter.id}/photo?v=${encodeURIComponent(props.photoAt)}`
                : undefined
            }
            size={56}
          />

          <div class="min-w-0">
            <h2 class="m-0 text-xl font-bold text-ink">{promoter.name}</h2>
            <p class="m-0 text-sm text-muted">
              {props.attempts.length} {props.attempts.length === 1 ? 'attempt' : 'attempts'} ·{' '}
              {submitted.length} submitted
            </p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          {submitted.length > 0 ? (
            <span class="text-sm text-muted">
              best <span class="font-semibold text-ink">{best}%</span>
            </span>
          ) : null}
          {passed ? (
            <StatusPill tone="pass">Certified</StatusPill>
          ) : props.attempts.length > 0 ? (
            <StatusPill>In training</StatusPill>
          ) : (
            <StatusPill>Not started</StatusPill>
          )}
        </div>
      </div>

      <dl class="m-0 mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
        {rows.map(({ Icon, value }) => (
          <div class="flex items-center gap-3">
            <dt class="flex shrink-0 text-muted" aria-hidden="true">
              <Icon size={18} />
            </dt>
            <dd class="m-0 min-w-0 truncate text-[15px] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default PromoterCard;
