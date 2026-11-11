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

  it('deve permitir adicionar e atualizar anotação de estudo no versículo favorito', async () => {
    await repo.toggleFavorite('ACF11', 1, 1, 1, '#FFF59D');
    await repo.updateFavoriteNote('ACF11', 1, 1, 1, 'Versículo fundamental da criação do universo.');

    const favs = await repo.getFavorites('ACF11');
    expect(favs).toHaveLength(1);
    expect(favs[0].note).toBe('Versículo fundamental da criação do universo.');
  });
});

