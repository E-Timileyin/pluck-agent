import type { QuestionSnapshot } from '../db/schema';

export type ScoredAnswer = {
  questionSnapshot: QuestionSnapshot;
  selectedIndex: number | null;
  isCorrect: boolean;
};

export type Result = {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  missedCritical: QuestionSnapshot[];
};

/**
 * The pass rule: score >= passMark% AND every critical question correct.
 *
 * An agent who scores 12/14 but got "can I take customer payments myself?"
 * wrong has not passed — a compliance record that passes people who failed
 * the compliance questions is worse than no record.
 */
export function computeResult(answers: ScoredAnswer[], passMark: number): Result {
  const total = answers.length;
  const score = answers.filter((a) => a.isCorrect).length;
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  const missedCritical = answers
    .filter((a) => a.questionSnapshot.isCritical && !a.isCorrect)
    .map((a) => a.questionSnapshot);

  return {
    score,
    total,
    percent,
    passed: total > 0 && percent >= passMark && missedCritical.length === 0,
    missedCritical,
  };
}
