import { describe, it, expect, beforeEach } from 'vitest';
import { MockSqliteDb } from '../helpers/mockSqliteDb';
import { FavoritesRepository } from '@/src/shared/db/repositories/favoritesRepository';

describe('FavoritesRepository', () => {
  let db: MockSqliteDb;
  let repo: FavoritesRepository;

  beforeEach(() => {
    db = new MockSqliteDb();
    repo = new FavoritesRepository(db);
  });

  it('deve alternar favorito (adicionar e remover na segunda chamada)', async () => {
    const isFavInitial = await repo.isFavorite('ACF11', 1, 1, 1);
    expect(isFavInitial).toBe(false);

    // Adiciona favorito
    const added = await repo.toggleFavorite('ACF11', 1, 1, 1, '#FFF59D');
    expect(added).toBe(true);

    const isFavAfterAdd = await repo.isFavorite('ACF11', 1, 1, 1);
    expect(isFavAfterAdd).toBe(true);

    // Remove favorito
    const removed = await repo.toggleFavorite('ACF11', 1, 1, 1);
    expect(removed).toBe(false);

    const isFavAfterRemove = await repo.isFavorite('ACF11', 1, 1, 1);
    expect(isFavAfterRemove).toBe(false);
  });

  it('deve listar versículos destacados de um capítulo', async () => {
    await repo.toggleFavorite('ACF11', 1, 1, 1, '#FFF59D');
    await repo.toggleFavorite('ACF11', 1, 1, 3, '#BBDEFB');
    await repo.toggleFavorite('ACF11', 1, 2, 1, '#C8E6C9'); // Capítulo diferente

    const chapter1Favs = await repo.getFavoritesForChapter('ACF11', 1, 1);
    expect(chapter1Favs).toHaveLength(2);
    expect(chapter1Favs.map((f) => f.verse)).toEqual([1, 3]);
  });
});

