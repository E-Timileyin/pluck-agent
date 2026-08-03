import { describe, expect, it } from 'vitest';
import { computeResult, type ScoredAnswer } from '../src/lib/scoring';

const answer = (isCorrect: boolean, isCritical = false): ScoredAnswer => ({
  questionSnapshot: { prompt: 'q', options: ['a', 'b'], correctIndex: 0, isCritical },
  selectedIndex: isCorrect ? 0 : 1,
  isCorrect,
});

describe('computeResult', () => {
  it('scores and applies the pass mark', () => {
    const result = computeResult([answer(true), answer(true), answer(true), answer(false)], 75);
    expect(result.score).toBe(3);
    expect(result.percent).toBe(75);
    expect(result.passed).toBe(true);
  });

  it('fails an otherwise good score that missed a compliance question', () => {
    const answers = [...Array(12).fill(answer(true)), answer(false, true), answer(true)];
    const result = computeResult(answers, 80);
    expect(result.score).toBe(13);
    expect(result.percent).toBeGreaterThanOrEqual(80);
    expect(result.missedCritical).toHaveLength(1);
    expect(result.passed).toBe(false);
  });

  it('never passes an empty attempt', () => {
    expect(computeResult([], 0).passed).toBe(false);
  });
});
