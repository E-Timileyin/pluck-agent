import { FiAward } from 'react-icons/fi';
import { formatCertDate } from '../../lib/format';

/**
 * The printable certificate — same anatomy as the reference design (logo,
 * greeting line, a name at real display size, a meta row under thin rules,
 * a circular badge, corner ribbons, a certificate id in the corner), with
 * Pluck's own brand and this domain's fields swapped in: there's no fixed
 * "class length" or "teacher" here, so those become score and tier.
 */
export function Certificate(props: {
  certificateId: string;
  promoterName: string;
  tier: string;
  score: number;
  total: number;
  percent: number;
  issuedAt: string;
}) {
  return (
    <div class="relative overflow-hidden rounded-[28px] border border-line bg-white p-8 sm:p-12 lg:p-16">
      {/* Corner ribbons — decorative, so hidden from the accessibility tree. */}
      <svg
        class="pointer-events-none absolute -top-10 -right-14 h-56 w-56 text-brand sm:h-72 sm:w-72"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 195 C 55 165, 35 120, 85 100 C 135 80, 120 35, 165 5"
          stroke="currentColor"
          stroke-width="22"
          stroke-linecap="round"
        />
      </svg>
      <svg
        class="pointer-events-none absolute -right-6 -bottom-10 h-32 w-32 text-brand-mint sm:h-40 sm:w-40"
        viewBox="0 0 160 160"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M155 20 C 120 30, 130 65, 95 75 C 60 85, 65 120, 25 140"
          stroke="currentColor"
          stroke-width="20"
          stroke-linecap="round"
        />
      </svg>

      <div class="relative z-10 flex items-start justify-between gap-4 pr-20 sm:pr-28">
        <img src="/logo-dark.png" alt="Pluck" class="h-8 w-auto sm:h-9" />
        <p class="m-0 max-w-[22ch] text-right text-[10px] font-medium tracking-wide text-muted sm:text-xs">
          CERTIFICATE ID: {props.certificateId}
        </p>
      </div>

      <div class="relative mt-10 max-w-[46ch] sm:mt-14">
        <p class="m-0 text-[15px] font-medium text-muted sm:text-base">
          Pluck officially and enthusiastically certifies that
        </p>

        <p class="m-0 mt-2 text-[40px] leading-[1.05] font-black tracking-tight text-ink sm:text-6xl">
          {props.promoterName}
        </p>

        <p class="m-0 mt-4 text-[15px]/[1.6] text-ink sm:text-base">
          has completed the training and passed the certification quiz for{' '}
          <strong>{props.tier} Sales Agent Certification</strong>.
        </p>
      </div>

      <div class="relative mt-10 flex flex-wrap items-end justify-between gap-10 sm:mt-16">
        <div class="grid grid-cols-3 gap-8 sm:gap-14">
          <div>
            <p class="m-0 pb-2 text-[10px] font-medium tracking-wide text-muted uppercase sm:text-xs">
              Date of issue
            </p>
            <p class="m-0 border-t border-line pt-2 text-sm font-medium text-ink sm:text-[15px]">
              {formatCertDate(props.issuedAt)}
            </p>
          </div>

          <div>
            <p class="m-0 pb-2 text-[10px] font-medium tracking-wide text-muted uppercase sm:text-xs">
              Score
            </p>
            <p class="m-0 border-t border-line pt-2 text-sm font-medium text-ink sm:text-[15px]">
              {props.percent}% ({props.score}/{props.total})
            </p>
          </div>

          <div>
            <p class="m-0 pb-2 text-[10px] font-medium tracking-wide text-muted uppercase sm:text-xs">
              Tier
            </p>
            <p class="m-0 border-t border-line pt-2 text-sm font-medium text-ink sm:text-[15px]">
              {props.tier}
            </p>
          </div>
        </div>

        <span
          class="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-brand-deep bg-brand-mint text-brand-deep sm:size-28"
          aria-hidden="true"
        >
          <span class="text-[32px] sm:text-[44px]">
            <FiAward />
          </span>
        </span>
      </div>
    </div>
  );
}

export default Certificate;
