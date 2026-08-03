import type { Result } from '../../lib/scoring';
import './ScoreVerdict.css';

export function ScoreVerdict(props: { result: Result; passMark: number }) {
  const { result, passMark } = props;

  return (
    <div class={`verdict ${result.passed ? 'is-pass' : 'is-fail'}`}>
      <p class="verdict-score">
        {result.score}/{result.total}
      </p>
      <p class="verdict-percent">{result.percent}%</p>
      <p class="verdict-label">{result.passed ? 'Passed' : 'Not passed'}</p>
      <p class="verdict-note">
        Pass mark is {passMark}%, and every compliance question must be correct.
      </p>
    </div>
  );
}

export default ScoreVerdict;
