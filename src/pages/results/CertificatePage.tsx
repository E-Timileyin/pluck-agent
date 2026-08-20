import { FiArrowLeft, FiEye, FiPrinter } from 'react-icons/fi';
import { Layout } from '../../components/common/Layout';
import { Alert } from '../../components/common/Alert';
import { Certificate } from '../../components/results/Certificate';

/**
 * Deliberately not wrapped in PromoterShell or AdminShell — this is meant to
 * be printed or saved as a PDF, so no nav, tab bar or footer has any business
 * being on the page. `variant="auth"` gives the same full-bleed, no-chrome
 * document every other unshelled screen uses. One page, three callers: the
 * promoter's own result, an admin looking at a promoter's record, and an
 * admin previewing the template with sample data (`isSample`).
 */
export function CertificatePage(props: {
  certificateId: string;
  promoterName: string;
  tier: string;
  score: number;
  total: number;
  percent: number;
  issuedAt: string;
  backHref: string;
  backLabel: string;
  isSample?: boolean;
}) {
  return (
    <Layout title="Certificate" variant="auth">
      <style>{'@media print { @page { size: landscape; margin: 0.4in; } }'}</style>

      <div class="flex min-h-screen items-center justify-center bg-page p-4 print:min-h-0 print:bg-white print:p-0 sm:p-10">
        <div class="w-full max-w-[880px]">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <a
              class="inline-flex items-center gap-2 text-sm font-medium text-muted no-underline hover:text-brand"
              href={props.backHref}
            >
              <FiArrowLeft size={16} />
              {props.backLabel}
            </a>

            <button
              type="button"
              onclick="window.print()"
              class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-0 bg-brand px-5 text-sm font-medium text-white hover:bg-brand-deep"
            >
              <FiPrinter size={16} />
              Print / Save as PDF
            </button>
          </div>

          {props.isSample ? (
            <div class="mb-4 print:hidden">
              <Alert tone="info">
                <span class="inline-flex items-center gap-2">
                  <FiEye size={16} />
                  Preview only — the name, tier and score below are sample data, not a real record.
                </span>
              </Alert>
            </div>
          ) : null}

          <Certificate
            certificateId={props.certificateId}
            promoterName={props.promoterName}
            tier={props.tier}
            score={props.score}
            total={props.total}
            percent={props.percent}
            issuedAt={props.issuedAt}
          />
        </div>
      </div>
    </Layout>
  );
}

export default CertificatePage;
