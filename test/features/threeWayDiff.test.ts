import { describe, it, expect } from 'vitest';
import { computeThreeWayDiff } from '../../src/features/compare/utils/threeWayDiff';

describe('computeThreeWayDiff', () => {
  it('correctly identifies common words across three biblical translations', () => {
    const tA = { id: 'ACF11', text: 'No princípio criou Deus os céus e a terra.' };
    const tB = { id: 'ARA', text: 'No princípio criou Deus os céus e a terra.' };
    const tC = { id: 'TB10', text: 'No princípio criou Deus os céus e a terra.' };

    const result = computeThreeWayDiff(tA, tB, tC);

    expect(result.baseTranslation).toBe('ACF11');
    expect(result.comparedTranslations).toEqual(['ARA', 'TB10']);
    expect(result.commonTokens).toContain('princípio');
    expect(result.commonTokens).toContain('deus');
    expect(result.commonTokens).toContain('terra');
    expect(result.similarityScore.firstToSecond).toBe(1);
    expect(result.similarityScore.firstToThird).toBe(1);
  });

  it('identifies unique words when translations diverge', () => {
    const tA = { id: 'ACF11', text: 'O Senhor é o meu pastor, nada me faltará.' };
    const tB = { id: 'ARA', text: 'O Senhor é meu guia, nada me faltará.' };
    const tC = { id: 'TB10', text: 'Jeová é o meu pastor, não terei falta.' };

    const result = computeThreeWayDiff(tA, tB, tC);

    expect(result.commonTokens).toContain('o');
    expect(result.commonTokens).not.toContain('nada'); // not in C
    expect(result.uniqueTokensPerTranslation['ACF11']).not.toContain('pastor'); // pastor is in ACF and TB10
    expect(result.uniqueTokensPerTranslation['ARA']).toContain('guia');
    expect(result.uniqueTokensPerTranslation['TB10']).toContain('jeová');
    expect(result.similarityScore.firstToSecond).toBeLessThan(1);
  });

  it('handles empty verses gracefully', () => {
    const tA = { id: 'A', text: '' };
    const tB = { id: 'B', text: '' };
    const tC = { id: 'C', text: '' };

    const result = computeThreeWayDiff(tA, tB, tC);
    expect(result.commonTokens).toEqual([]);
    expect(result.similarityScore.firstToSecond).toBe(1);
  });
});
