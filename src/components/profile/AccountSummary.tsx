import { FiAward, FiCalendar, FiLogOut, FiRepeat } from "react-icons/fi";
import { Card } from "../common/Card";
import { Avatar } from "../common/Avatar";
import { StatusPill } from "../common/StatusPill";
import type { Attempt, Promoter } from "../../db/schema";
import { formatDate } from "../../lib/format";

/**
 * The read-only half of the profile: what the record says about this promoter,
 * and the one destructive action on the screen — signing out, which clears the
 * attempt cookie and returns to the start form.
 */
export function AccountSummary(props: {
  promoter: Promoter;
  attempts: Attempt[];
  photoHref?: string;
}) {
  const submitted = props.attempts.filter((a) => a.submittedAt);
  const passed = submitted.some((a) => a.passed);

  const rows = [
    {
      Icon: FiCalendar,
      label: "Member since",
      value: formatDate(props.promoter.createdAt),
    },
    {
      Icon: FiRepeat,
      label: "Attempts",
      value: `${props.attempts.length} (${submitted.length} submitted)`,
    },
    {
      Icon: FiAward,
      label: "Certification",
      value: passed
        ? "Passed"
        : submitted.length > 0
          ? "Not passed yet"
          : "Not attempted",
    },
  ];

  return (
    <div class="mt-3 grid gap-3 lg:mt-0">
      <Card title="Account">
        <div class="mb-4 flex items-center gap-3">
          <Avatar name={props.promoter.name} src={props.photoHref} size={48} />

          <span class="min-w-0">
            <span class="block truncate text-[15px] font-medium text-ink">
              {props.promoter.name}
            </span>
            <span class="block text-[13px] text-muted">
              {props.promoter.tier} Sales Agent
            </span>
          </span>
          {passed ? <StatusPill tone="pass">Certified</StatusPill> : null}
        </div>

        <dl class="m-0 grid gap-3 border-t border-line pt-4">
          {rows.map(({ Icon, label, value }) => (
            <div class="flex items-center gap-3">
              <dt class="flex shrink-0 text-muted" aria-label={label}>
                <Icon size={18} />
              </dt>
              <dd class="m-0 min-w-0 text-[15px] text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card
        title="Sign out"
        sub="Ends this session on this phone. Your answers stay saved."
      >
        <form method="post" action="/logout">
          <button
            class="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-line bg-muted/60 text-sm font-medium text-red-500 transition-colors duration-150 hover:border-miss hover:text-miss"
            type="submit"
          >
            <FiLogOut size={18} />
            Sign out
          </button>
        </form>
      </Card>
    </div>
  );
}

export default AccountSummary;
