import { describe, it, expect } from 'vitest';
import { THEOGRAPHIC_CHARACTERS, THEOGRAPHIC_EDGES } from '@/src/features/graph/data/theographicData';

describe('Theographic Biblical Graph Data', () => {
  it('deve possuir personagens bíblicos canônicos com metadados completos', () => {
    expect(THEOGRAPHIC_CHARACTERS.length).toBeGreaterThanOrEqual(10);

    const characterIds = THEOGRAPHIC_CHARACTERS.map((c) => c.id);
    expect(characterIds).toContain('adao');
    expect(characterIds).toContain('abraao');
    expect(characterIds).toContain('davi');
    expect(characterIds).toContain('jesus');
  });

  it('todos os nós devem possuir versículos-chave válidos associados', () => {
    for (const char of THEOGRAPHIC_CHARACTERS) {
      expect(char.name).toBeDefined();
      expect(char.keyVerses.length).toBeGreaterThan(0);
      expect(char.keyVerses[0].bookId).toBeGreaterThan(0);
      expect(char.keyVerses[0].chapter).toBeGreaterThan(0);
      expect(char.keyVerses[0].verse).toBeGreaterThan(0);
      expect(char.keyVerses[0].text.length).toBeGreaterThan(5);
    }
  });

  it('todas as arestas de genealogia devem apontar para nós existentes', () => {
    const characterIdSet = new Set(THEOGRAPHIC_CHARACTERS.map((c) => c.id));

    for (const edge of THEOGRAPHIC_EDGES) {
      expect(characterIdSet.has(edge.source)).toBe(true);
      expect(characterIdSet.has(edge.target)).toBe(true);
    }
  });
});
