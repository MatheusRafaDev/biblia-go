import { describe, it, expect } from 'vitest';
import {
  generateCustomReadingPlan,
  validatePlanRequest,
} from '../../src/features/plan/utils/planGenerator';

describe('planGenerator', () => {
  it('validates invalid title, duration and empty books', () => {
    expect(validatePlanRequest({ title: '', durationDays: 30, books: [] })).toBe(
      'Título deve ter pelo menos 3 caracteres.'
    );
    expect(
      validatePlanRequest({ title: 'Gênesis', durationDays: 0, books: [{ bookId: 'GEN', totalChapters: 50 }] })
    ).toBe('Duração deve estar entre 1 e 730 dias.');
    expect(
      validatePlanRequest({ title: 'Gênesis', durationDays: 10, books: [] })
    ).toBe('Selecione ao menos um livro para o plano de leitura.');
  });

  it('generates distributed reading assignments accurately without losing chapters', () => {
    const result = generateCustomReadingPlan({
      title: 'Epístolas Paulinas Rápidas',
      durationDays: 3,
      books: [
        { bookId: 'GAL', totalChapters: 6 },
        { bookId: 'EPH', totalChapters: 6 },
      ],
    });

    expect(result.totalChapters).toBe(12);
    expect(result.durationDays).toBe(3);
    expect(result.days).toHaveLength(3);
    expect(result.chaptersPerDayAverage).toBe(4);

    // Day 1, 2, 3 must each have 4 chapters
    expect(result.days[0].readings).toHaveLength(4);
    expect(result.days[1].readings).toHaveLength(4);
    expect(result.days[2].readings).toHaveLength(4);

    // First chapter is Galatians 1, last chapter is Ephesians 6
    expect(result.days[0].readings[0]).toEqual({ bookId: 'GAL', chapter: 1 });
    expect(result.days[2].readings[3]).toEqual({ bookId: 'EPH', chapter: 6 });
  });

  it('handles odd chapter counts distributing remainder properly', () => {
    const result = generateCustomReadingPlan({
      title: 'Tiago em 2 dias',
      durationDays: 2,
      books: [{ bookId: 'JAS', totalChapters: 5 }],
    });

    // 5 chapters / 2 days = 3 on day 1, 2 on day 2
    expect(result.days[0].readings).toHaveLength(3);
    expect(result.days[1].readings).toHaveLength(2);
  });
});
