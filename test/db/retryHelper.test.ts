import { describe, it, expect, vi } from 'vitest';
import { withDatabaseRetry } from '@/src/shared/db/retryHelper';

describe('withDatabaseRetry', () => {
  it('deve retornar resultado com sucesso na primeira tentativa', async () => {
    const op = vi.fn().mockResolvedValue('resultado_sucesso');

    const result = await withDatabaseRetry(op);

    expect(result).toBe('resultado_sucesso');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('deve tentar novamente quando ocorrer falha transiente e ter sucesso', async () => {
    const op = vi
      .fn()
      .mockRejectedValueOnce(new Error('database locked'))
      .mockResolvedValueOnce('sucesso_apos_retry');

    const result = await withDatabaseRetry(op, { initialDelayMs: 5 });

    expect(result).toBe('sucesso_apos_retry');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('deve lançar erro caso atinja o limite máximo de tentativas', async () => {
    const op = vi.fn().mockRejectedValue(new Error('fatal db error'));

    await expect(withDatabaseRetry(op, { maxRetries: 2, initialDelayMs: 5 })).rejects.toThrow(
      'fatal db error'
    );
    expect(op).toHaveBeenCalledTimes(2);
  });
});
