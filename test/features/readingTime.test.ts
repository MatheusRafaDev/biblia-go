import { describe, it, expect } from 'vitest';
import {
  countTotalWords,
  estimateReadingTimeMinutes,
  formatReadingTime,
} from '../../src/features/reader/utils/readingTime';

describe('readingTime', () => {
  it('counts words correctly handling whitespace and empty texts', () => {
    const verses = [
      { text: 'No princípio era o Verbo' }, // 5 words
      { text: '   ' }, // 0
      { text: 'e o Verbo estava com Deus' }, // 6 words
    ];
    expect(countTotalWords(verses)).toBe(11);
  });

  it('estimates reading time accurately with default and custom WPM', () => {
    // 400 words at 200 WPM = 2 minutes
    const text200 = Array(200).fill('palavra').join(' ');
    const verses = [{ text: text200 }, { text: text200 }];

    expect(estimateReadingTimeMinutes(verses)).toBe(2);

    // At 100 WPM = 4 minutes
    expect(estimateReadingTimeMinutes(verses, 100)).toBe(4);
  });

  it('returns 0 for empty verses list', () => {
    expect(estimateReadingTimeMinutes([])).toBe(0);
  });

  it('formats reading time string in pt-BR', () => {
    expect(formatReadingTime(0)).toBe('< 1 min de leitura');
    expect(formatReadingTime(1)).toBe('1 min de leitura');
    expect(formatReadingTime(5)).toBe('5 min de leitura');
  });
});
