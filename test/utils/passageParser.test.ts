import { describe, it, expect } from 'vitest';
import { parsePassageReference, formatPassageReference } from '@/src/shared/utils/passageParser';

describe('passageParser', () => {
  it('deve fazer parse de referências completas como João 3:16', () => {
    const parsed = parsePassageReference('João 3:16');
    expect(parsed).not.toBeNull();
    expect(parsed?.book.name).toBe('João');
    expect(parsed?.chapter).toBe(3);
    expect(parsed?.verse).toBe(16);
  });

  it('deve fazer parse de referências com intervalo de versículos', () => {
    const parsed = parsePassageReference('Salmos 23:1-6');
    expect(parsed).not.toBeNull();
    expect(parsed?.book.name).toBe('Salmos');
    expect(parsed?.chapter).toBe(23);
    expect(parsed?.verse).toBe(1);
    expect(parsed?.endVerse).toBe(6);
  });

  it('deve fazer parse de abreviações e livros com número (1 João 1:9)', () => {
    const parsed = parsePassageReference('1 João 1:9');
    expect(parsed).not.toBeNull();
    expect(parsed?.book.name).toBe('1 João');
    expect(parsed?.chapter).toBe(1);
    expect(parsed?.verse).toBe(9);
  });

  it('deve formatar referência bíblica corretamente', () => {
    expect(formatPassageReference('Mateus', 5, 3)).toBe('Mateus 5:3');
    expect(formatPassageReference('Romanos', 8, 28, 30)).toBe('Romanos 8:28-30');
    expect(formatPassageReference('Gênesis', 1)).toBe('Gênesis 1');
  });
});
