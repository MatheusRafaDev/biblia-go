import { describe, it, expect } from 'vitest';
import { getDayOfYear, getDailyVerse, formatDailyVerseShare } from '@/src/features/daily/utils/getDailyVerse';
import { DAILY_VERSES } from '@/src/features/daily/data/dailyVerses';

describe('dailyVerse utils', () => {
  it('calculates consistent day of year for given dates', () => {
    const jan1 = new Date(2026, 0, 1);
    expect(getDayOfYear(jan1)).toBe(1);

    const feb1 = new Date(2026, 1, 1);
    expect(getDayOfYear(feb1)).toBe(32);
  });

  it('returns a valid daily verse for any date', () => {
    const verse = getDailyVerse(new Date(2026, 5, 15));
    expect(verse).toBeDefined();
    expect(verse.id).toBeDefined();
    expect(verse.text.length).toBeGreaterThan(10);
    expect(verse.reflection.length).toBeGreaterThan(15);
    expect(DAILY_VERSES).toContainEqual(verse);
  });

  it('formats daily verse for sharing with all required elements', () => {
    const sample = DAILY_VERSES[0];
    const formatted = formatDailyVerseShare(sample);

    expect(formatted).toContain('Versículo do Dia — Bíblia Go');
    expect(formatted).toContain(sample.bookName);
    expect(formatted).toContain(sample.theme);
    expect(formatted).toContain(sample.prayer);
    expect(formatted).toContain('#BibliaGo');
  });
});
