import { describe, it, expect } from 'vitest';
import { formatChapterForShare } from '../../src/features/reader/utils/copyChapter';

describe('copyChapter', () => {
  const sampleVerses = [
    { verse: 1, text: 'No princípio era o Verbo' },
    { verse: 2, text: 'Ele estava no princípio com Deus' },
  ];

  it('formats chapter with title, verse numbers and footer by default', () => {
    const text = formatChapterForShare({
      bookName: 'João',
      chapter: 1,
      translationId: 'ACF11',
      verses: sampleVerses,
    });

    expect(text).toContain('📖 João 1 (ACF11)');
    expect(text).toContain('1 No princípio era o Verbo');
    expect(text).toContain('2 Ele estava no princípio com Deus');
    expect(text).toContain('— Bíblia Go');
  });

  it('can format without verse numbers and without footer', () => {
    const text = formatChapterForShare({
      bookName: 'Salmos',
      chapter: 23,
      translationId: 'ARA',
      verses: [{ verse: 1, text: 'O Senhor é o meu pastor; nada me faltará.' }],
      includeVerseNumbers: false,
      includeFooter: false,
    });

    expect(text).toContain('📖 Salmos 23 (ARA)');
    expect(text).toContain('O Senhor é o meu pastor; nada me faltará.');
    expect(text).not.toContain('1 O Senhor');
    expect(text).not.toContain('— Bíblia Go');
  });
});
