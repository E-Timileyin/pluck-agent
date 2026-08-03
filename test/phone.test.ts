import { describe, expect, it } from 'vitest';
import { formatPhone, normalizePhone } from '../src/lib/phone';

describe('normalizePhone', () => {
  it('accepts all four input formats', () => {
    expect(normalizePhone('08012345678')).toBe('+2348012345678');
    expect(normalizePhone('8012345678')).toBe('+2348012345678');
    expect(normalizePhone('2348012345678')).toBe('+2348012345678');
    expect(normalizePhone('+234 801 234 5678')).toBe('+2348012345678');
  });

  it('resolves the same promoter however they type it', () => {
    const forms = ['08012345678', '+2348012345678', '234 801 234 5678', '0801-234-5678'];
    const normalized = new Set(forms.map(normalizePhone));
    expect(normalized.size).toBe(1);
  });

  it('rejects what it cannot normalize, rather than storing junk', () => {
    expect(normalizePhone('123')).toBeNull();
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('+1 415 555 0100')).toBeNull();
    expect(normalizePhone('080123456789')).toBeNull();
  });
});

describe('formatPhone', () => {
  it('displays stored numbers in the local shape', () => {
    expect(formatPhone('+2348012345678')).toBe('0801 234 5678');
  });

  it('passes through anything unexpected untouched', () => {
    expect(formatPhone('unknown')).toBe('unknown');
  });
});
