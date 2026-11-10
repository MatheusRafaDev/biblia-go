import { ISqliteDb, DbFavorite } from '../types';

export interface IFavoritesRepository {
  getFavorites(translationId?: string): Promise<DbFavorite[]>;
  toggleFavorite(
    translationId: string,
    bookId: number,
    chapter: number,
    verse: number,
    color?: string
  ): Promise<boolean>;
  isFavorite(
    translationId: string,
    bookId: number,
    chapter: number,
    verse: number
  ): Promise<boolean>;
  getFavoritesForChapter(
    translationId: string,
    bookId: number,
    chapter: number
  ): Promise<DbFavorite[]>;
  removeFavorite(id: number): Promise<void>;
}

export class FavoritesRepository implements IFavoritesRepository {
  constructor(private db: ISqliteDb) {}

  async getFavorites(translationId?: string): Promise<DbFavorite[]> {
    if (translationId) {
      return this.db.getAllAsync<DbFavorite>(
        `SELECT id, translation_id, book_id, chapter, verse, highlight_color, note, created_at 
         FROM favorites WHERE translation_id = ? ORDER BY id DESC;`,
        translationId
      );
    }
    return this.db.getAllAsync<DbFavorite>(
      `SELECT id, translation_id, book_id, chapter, verse, highlight_color, note, created_at 
       FROM favorites ORDER BY id DESC;`
    );
  }

  async getFavoritesForChapter(
    translationId: string,
    bookId: number,
    chapter: number
  ): Promise<DbFavorite[]> {
    return this.db.getAllAsync<DbFavorite>(
      `SELECT id, translation_id, book_id, chapter, verse, highlight_color, note, created_at 
       FROM favorites 
       WHERE translation_id = ? AND book_id = ? AND chapter = ?;`,
      translationId,
      bookId,
      chapter
    );
  }

  async isFavorite(
    translationId: string,
    bookId: number,
    chapter: number,
    verse: number
  ): Promise<boolean> {
    const row = await this.db.getFirstAsync<{ id: number }>(
      `SELECT id FROM favorites 
       WHERE translation_id = ? AND book_id = ? AND chapter = ? AND verse = ?;`,
      translationId,
      bookId,
      chapter,
      verse
    );
    return Boolean(row);
  }

  async toggleFavorite(
    translationId: string,
    bookId: number,
    chapter: number,
    verse: number,
    color = '#FFF59D'
  ): Promise<boolean> {
    const existing = await this.isFavorite(translationId, bookId, chapter, verse);
    if (existing) {
      await this.db.runAsync(
        `DELETE FROM favorites 
         WHERE translation_id = ? AND book_id = ? AND chapter = ? AND verse = ?;`,
        translationId,
        bookId,
        chapter,
        verse
      );
      return false;
    } else {
      await this.db.runAsync(
        `INSERT INTO favorites (translation_id, book_id, chapter, verse, highlight_color)
         VALUES (?, ?, ?, ?, ?);`,
        translationId,
        bookId,
        chapter,
        verse,
        color
      );
      return true;
    }
  }

  async removeFavorite(id: number): Promise<void> {
    await this.db.runAsync(`DELETE FROM favorites WHERE id = ?;`, id);
  }
}
