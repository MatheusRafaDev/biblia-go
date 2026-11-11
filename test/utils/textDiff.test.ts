import { describe, it, expect } from 'vitest';
import { computeWordDiff } from '@/src/shared/utils/textDiff';

describe('computeWordDiff', () => {
  it('deve marcar todas as palavras como equal quando os textos são idênticos', () => {
    const textA = 'No princípio criou Deus os céus e a terra.';
    const textB = 'No princípio criou Deus os céus e a terra.';

    const { baseTokens, compareTokens } = computeWordDiff(textA, textB);

    expect(baseTokens.every((t) => t.type === 'equal')).toBe(true);
    expect(compareTokens.every((t) => t.type === 'equal')).toBe(true);
  });

  it('deve identificar palavras diferentes ou adicionadas entre traduções', () => {
    // Exemplo: ACF vs ARA ou NVT
    const textA = 'O Senhor é o meu pastor, nada me faltará.';
    const textB = 'O Senhor é o meu pastor; de nada terei falta.';

    const { baseTokens, compareTokens } = computeWordDiff(textA, textB);

    // "Senhor", "é", "o", "meu", "pastor" devem ser iguais
    const equalCompare = compareTokens.filter((t) => t.type === 'equal');
    const equalCleanWords = equalCompare.map((t) => t.value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''));
    expect(equalCleanWords).toContain('senhor');
    expect(equalCleanWords).toContain('pastor');

    // Palavras divergentes devem ser marcadas como 'added' ou 'removed'
    const addedTokens = compareTokens.filter((t) => t.type === 'added');
    expect(addedTokens.length).toBeGreaterThan(0);
    expect(addedTokens.map((t) => t.value)).toContain('terei');
  });

  it('deve lidar com textos vazios graciosamente', () => {
    const { baseTokens, compareTokens } = computeWordDiff('', '');
    expect(baseTokens).toEqual([]);
    expect(compareTokens).toEqual([]);
  });
});
