import { Card } from '../common/Card';
import { formatClock } from '../../lib/format';

/**
 * The rules of the quiz, in numbers — read live from settings, so what a
 * promoter is told here is what the server will actually enforce.
 */
export function QuickFacts(props: {
  passMark: number;
  minTutorialSeconds: number;
  questionCount: number;
  criticalCount: number;
}) {
  const facts: { label: string; value: string; note: string }[] = [
    {
      label: 'Pass mark',
      value: `${props.passMark}%`,
      note: 'And every compliance question correct.',
    },
    {
      label: 'Questions',
      value: String(props.questionCount),
      note: `${props.criticalCount} of them are compliance questions.`,
    },
    {
      label: 'Time on the material',
      value: formatClock(props.minTutorialSeconds),
      note: 'Before the quiz unlocks. Checked on the server.',
    },
    {
      label: 'Attempts',
      value: 'Unlimited',
      note: 'Take it again whenever you like; every attempt is kept.',
    },
  ];

  return (
    <Card title="How the quiz works" sub="Set by your administrator, and applied as you answer.">
      <dl class="m-0 grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div class="rounded-xl border border-line p-4">
            <dt class="text-[13px] font-medium text-muted">{fact.label}</dt>
            <dd class="m-0 mt-1 text-xl font-bold text-ink">{fact.value}</dd>
            <dd class="m-0 mt-1 text-[13px]/[1.5] text-muted">{fact.note}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default QuickFacts;
