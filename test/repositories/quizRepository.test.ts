import { describe, it, expect, beforeEach } from 'vitest';
import { MockSqliteDb } from '../helpers/mockSqliteDb';
import { QuizRepository } from '@/src/shared/db/repositories/quizRepository';

describe('QuizRepository', () => {
  let db: MockSqliteDb;
  let repo: QuizRepository;

  beforeEach(() => {
    db = new MockSqliteDb();
    repo = new QuizRepository(db);
  });

  it('deve registrar pontuação de partida no SQLite e retornar ID', async () => {
    const id = await repo.saveResult('antigo_testamento', 8, 10);
    expect(id).toBe(1);

    const history = await repo.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].category).toBe('antigo_testamento');
    expect(history[0].score).toBe(8);
    expect(history[0].total_questions).toBe(10);
  });

  it('deve calcular estatísticas de partidas, recorde e média', async () => {
    // Estatísticas vazias
    const emptyStats = await repo.getStats();
    expect(emptyStats.totalGames).toBe(0);
    expect(emptyStats.highestScore).toBe(0);

    // Partida 1: 6 de 10 (60%)
    await repo.saveResult('geral', 6, 10);
    // Partida 2: 10 de 10 (100%)
    await repo.saveResult('novo_testamento', 10, 10);

    const stats = await repo.getStats();
    expect(stats.totalGames).toBe(2);
    expect(stats.highestScore).toBe(10);
    expect(stats.averagePercent).toBe(80); // (60 + 100) / 2 = 80%
  });

  it('deve limpar histórico quando solicitado', async () => {
    await repo.saveResult('personagens', 7, 10);
    await repo.clearHistory();

    const history = await repo.getHistory();
    expect(history).toHaveLength(0);
  });
});
