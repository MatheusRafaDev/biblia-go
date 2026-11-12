import { describe, it, expect } from 'vitest';
import { formatComparisonClipboard } from '../../src/features/compare/utils/formatCompareSummary';

describe('formatComparisonClipboard', () => {
  it('formats comparison output with header, translation tags and footer', () => {
    const result = formatComparisonClipboard('João 3:16', [
      {
        translationId: 'ACF11',
        text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito...',
      },
      {
        translationId: 'ARA',
        text: 'Porque Deus amou ao mundo de tal maneira que deu o seu Filho unigênito...',
      },
    ]);

    expect(result).toContain('📊 Comparação de Traduções — João 3:16');
    expect(result).toContain('[ACF11]: Porque Deus amou o mundo');
    expect(result).toContain('[ARA]: Porque Deus amou ao mundo');
    expect(result).toContain('— Bíblia Go');
  });

  it('handles single translation comparison', () => {
    const result = formatComparisonClipboard('Gênesis 1:1', [
      { translationId: 'KJV', text: 'In the beginning God created the heaven and the earth.' },
    ]);

    expect(result).toContain('📊 Comparação de Traduções — Gênesis 1:1');
    expect(result).toContain('[KJV]: In the beginning');
  });

  it('handles empty translation list gracefully', () => {
    const result = formatComparisonClipboard('Salmos 23:1', []);
    expect(result).toBe('📊 Comparação de Traduções — Salmos 23:1\n\n\n— Bíblia Go');
  });
});
