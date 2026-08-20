import { FiAlertTriangle } from 'react-icons/fi';
import { Card } from '../common/Card';
import { CONDUCT_RULES } from '../quiz/ConductRules';

/**
 * The same four rules the attestation screen asks people to confirm, available
 * before the quiz rather than only at the moment of signing. They are read from
 * one exported constant so the two screens can never drift.
 */
export function ConductReference() {
  return (
    <Card
      title="The Two conduct rules"
      sub="These carry real consequences, up to suspension and legal action. You confirm you have read them before your answers are submitted."
    >
      <ol class="m-0 grid list-none gap-3 p-0">
        {CONDUCT_RULES.map((rule, i) => (
          <li class="flex items-start gap-3 rounded-xl bg-brand-tint p-4">
            <span
              class="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-brand-deep"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span class="text-[15px]/[1.55] text-ink">{rule}</span>
          </li>
        ))}
      </ol>

      <p class="m-0 mt-4 flex items-start gap-2 text-[13px]/[1.5] text-muted">
        <span class="mt-0.5 shrink-0 text-miss" aria-hidden="true">
          <FiAlertTriangle size={14} />
        </span>
        A question tagged “compliance” must be answered correctly whatever your overall score.
      </p>
    </Card>
  );
}

export default ConductReference;
