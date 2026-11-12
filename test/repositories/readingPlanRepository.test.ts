import { describe, it, expect, beforeEach } from 'vitest';
import { MockSqliteDb } from '../helpers/mockSqliteDb';
import { ReadingPlanRepository } from '@/src/shared/db/repositories/readingPlanRepository';

describe('ReadingPlanRepository', () => {
  let db: MockSqliteDb;
  let repo: ReadingPlanRepository;

  beforeEach(() => {
    db = new MockSqliteDb();
    repo = new ReadingPlanRepository(db);
  });

  it('deve inicializar e listar os planos de leitura padrão', async () => {
    const plans = await repo.getPlans();
    expect(plans.length).toBeGreaterThanOrEqual(2);
    expect(plans.map((p) => p.id)).toContain('nt_90_days');
    expect(plans.map((p) => p.id)).toContain('bible_1_year');
  });

  it('deve retornar as leituras diárias de um plano', async () => {
    const readings = await repo.getDayReadings('nt_90_days');
    expect(readings.length).toBe(90);
    expect(readings[0].day_number).toBe(1);
    expect(readings[0].passage_reference).toBeDefined();
    expect(readings[0].is_completed).toBe(0);
  });

  it('deve alternar status de conclusão e calcular streak e progresso', async () => {
    // Inicialmente 0%
    const initialProgress = await repo.getPlanProgress('nt_90_days');
    expect(initialProgress.completedDays).toBe(0);
    expect(initialProgress.percent).toBe(0);

    // Marca dia 1 como lido
    const completed = await repo.toggleDayCompleted('nt_90_days', 1);
    expect(completed).toBe(true);

    // Marca dia 2 como lido
    await repo.toggleDayCompleted('nt_90_days', 2);

    const updatedProgress = await repo.getPlanProgress('nt_90_days');
    expect(updatedProgress.completedDays).toBe(2);
    expect(updatedProgress.streak).toBe(2);
    expect(updatedProgress.percent).toBeGreaterThan(0);

    // Desmarca dia 1
    const uncompleted = await repo.toggleDayCompleted('nt_90_days', 1);
    expect(uncompleted).toBe(false);

    const finalProgress = await repo.getPlanProgress('nt_90_days');
    expect(finalProgress.completedDays).toBe(1);
  });

  it('deve criar um plano de leitura personalizado e persistir dias e leituras', async () => {
    await repo.createCustomPlan({
      id: 'custom_teste_30',
      title: 'Plano Personalizado de Teste',
      description: '30 dias de leitura bíblica',
      totalDays: 30,
      readings: [
        { day: 1, passage: 'Gênesis 1-2' },
        { day: 2, passage: 'Gênesis 3-4' },
      ],
    });

    const plans = await repo.getPlans();
    expect(plans.map((p) => p.id)).toContain('custom_teste_30');

    const readings = await repo.getDayReadings('custom_teste_30');
    expect(readings.length).toBe(2);
    expect(readings[0].passage_reference).toBe('Gênesis 1-2');
  });
});

