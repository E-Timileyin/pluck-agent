import { describe, expect, it } from 'vitest';
import { consecutiveFails, cooldownRemaining, RETRY_COOLDOWN_SECONDS } from '../src/lib/flow';
import type { Attempt } from '../src/db/schema';

let seq = 0;

/** Newest-first fixtures, same shape `listAttemptsForPromoter` returns. */
const attempt = (opts: { passed: boolean | null; ageSeconds?: number }): Attempt => {
  seq += 1;
  const submittedAt =
    opts.passed === null ? null : new Date(Date.now() - (opts.ageSeconds ?? 0) * 1000).toISOString();
  return {
    id: `a${seq}`,
    promoterId: 'p1',
    tutorialMode: 'slides',
    tutorialStartedAt: null,
    startedAt: submittedAt ?? new Date().toISOString(),
    attestedAt: submittedAt,
    submittedAt,
    score: opts.passed === null ? null : 5,
    total: opts.passed === null ? null : 10,
    passed: opts.passed,
  };
};

describe('consecutiveFails', () => {
  it('is 0 when the most recent submitted attempt passed', () => {
    expect(consecutiveFails([attempt({ passed: true })])).toBe(0);
  });

  it('counts back from the newest attempt until a pass', () => {
    const history = [
      attempt({ passed: false }),
      attempt({ passed: false }),
      attempt({ passed: true }),
      attempt({ passed: false }),
    ];
    expect(consecutiveFails(history)).toBe(2);
  });

  it('skips an in-progress attempt at the front of the list', () => {
    const history = [attempt({ passed: null }), attempt({ passed: false }), attempt({ passed: false })];
    expect(consecutiveFails(history)).toBe(2);
  });
});

describe('cooldownRemaining', () => {
  it('is 0 after a single fail', () => {
    expect(cooldownRemaining([attempt({ passed: false, ageSeconds: 0 })])).toBe(0);
  });

  it('is roughly the full window right after a second consecutive fail', () => {
    const history = [attempt({ passed: false, ageSeconds: 0 }), attempt({ passed: false, ageSeconds: 600 })];
    const remaining = cooldownRemaining(history);
    expect(remaining).toBeGreaterThan(RETRY_COOLDOWN_SECONDS - 5);
    expect(remaining).toBeLessThanOrEqual(RETRY_COOLDOWN_SECONDS);
  });

  it('clears once the cooldown window has elapsed', () => {
    const history = [
      attempt({ passed: false, ageSeconds: RETRY_COOLDOWN_SECONDS + 30 }),
      attempt({ passed: false, ageSeconds: RETRY_COOLDOWN_SECONDS + 700 }),
    ];
    expect(cooldownRemaining(history)).toBe(0);
  });
});
