import { ISqliteDb, DbTranslation, DbBook, DbVerse, SearchVerseResult } from '../types';

export interface IBibleRepository {
  getTranslations(): Promise<DbTranslation[]>;
  isTranslationDownloaded(translationId: string): Promise<boolean>;
  markTranslationDownloaded(translationId: string): Promise<void>;
  getBooks(testament?: 'OT' | 'NT'): Promise<DbBook[]>;
  getBookById(id: number): Promise<DbBook | null>;
  getChapterVerses(translationId: string, bookId: number, chapter: number): Promise<DbVerse[]>;
  searchVerses(query: string, translationId?: string, limit?: number): Promise<SearchVerseResult[]>;
  bulkInsertVerses(
    translationId: string,
    verses: { book: number; chapter: number; verse: number; text: string }[]
  ): Promise<number>;
  getVerseCount(translationId: string): Promise<number>;
}

export class BibleRepository implements IBibleRepository {
  constructor(private db: ISqliteDb) {}

  async getTranslations(): Promise<DbTranslation[]> {
    return this.db.getAllAsync<DbTranslation>(
      `SELECT id, name, language, is_downloaded, downloaded_at FROM translations ORDER BY id ASC;`
    );
  }

  async isTranslationDownloaded(translationId: string): Promise<boolean> {
    const row = await this.db.getFirstAsync<{ is_downloaded: number }>(
      `SELECT is_downloaded FROM translations WHERE id = ?;`,
      translationId
    );
    return Boolean(row && row.is_downloaded === 1);
  }

  async markTranslationDownloaded(translationId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE translations SET is_downloaded = 1, downloaded_at = datetime('now') WHERE id = ?;`,
      translationId
    );
  }

  async getBooks(testament?: 'OT' | 'NT'): Promise<DbBook[]> {
    if (testament) {
      return this.db.getAllAsync<DbBook>(
        `SELECT id, name, abbrev, testament, chapters_count, order_index 
         FROM books WHERE testament = ? ORDER BY order_index ASC;`,
        testament
      );
    }
    return this.db.getAllAsync<DbBook>(
      `SELECT id, name, abbrev, testament, chapters_count, order_index 
       FROM books ORDER BY order_index ASC;`
    );
  }

  async getBookById(id: number): Promise<DbBook | null> {
    return this.db.getFirstAsync<DbBook>(
      `SELECT id, name, abbrev, testament, chapters_count, order_index 
       FROM books WHERE id = ?;`,
      id
    );
  }

  async getChapterVerses(
    translationId: string,
    bookId: number,
    chapter: number
  ): Promise<DbVerse[]> {
    return this.db.getAllAsync<DbVerse>(
      `SELECT id, translation_id, book_id, chapter, verse, text 
       FROM verses 
       WHERE translation_id = ? AND book_id = ? AND chapter = ? 
       ORDER BY verse ASC;`,
      translationId,
      bookId,
      chapter
    );
  }

  async searchVerses(
    query: string,
    translationId = 'ACF11',
    limit = 50
  ): Promise<SearchVerseResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Sanitize tokens for FTS5 (strip punctuation, wrap terms with wildcard prefix)
    const tokens = trimmed
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 0);

    if (tokens.length === 0) return [];

    const ftsQuery = tokens.map((t) => `"${t}"*`).join(' AND ');

    try {
      const results = await this.db.getAllAsync<SearchVerseResult>(
        `SELECT v.id, v.translation_id, v.book_id, v.chapter, v.verse, v.text,
                b.name as book_name, b.abbrev as book_abbrev
         FROM verses_fts fts
         JOIN verses v ON fts.rowid = v.id
         JOIN books b ON v.book_id = b.id
         WHERE verses_fts MATCH ? AND v.translation_id = ?
         ORDER BY v.book_id ASC, v.chapter ASC, v.verse ASC
         LIMIT ?;`,
        ftsQuery,
        translationId,
        limit
      );
      return results;
    } catch {
      // Fallback to LIKE if FTS expression encounters an unexpected issue
      const likeQuery = `%${trimmed}%`;
      return this.db.getAllAsync<SearchVerseResult>(
        `SELECT v.id, v.translation_id, v.book_id, v.chapter, v.verse, v.text,
                b.name as book_name, b.abbrev as book_abbrev
         FROM verses v
         JOIN books b ON v.book_id = b.id
         WHERE v.translation_id = ? AND v.text LIKE ?
         ORDER BY v.book_id ASC, v.chapter ASC, v.verse ASC
         LIMIT ?;`,
        translationId,
        likeQuery,
        limit
      );
    }
  }

  async bulkInsertVerses(
    translationId: string,
    verses: { book: number; chapter: number; verse: number; text: string }[]
  ): Promise<number> {
    if (verses.length === 0) return 0;

    // Use withTransactionAsync for high performance
    return this.db.withTransactionAsync(async () => {
      // Insert in chunks of 500 to stay well under SQLite parameter limits
      const chunkSize = 250;
      let insertedCount = 0;

      for (let i = 0; i < verses.length; i += chunkSize) {
        const chunk = verses.slice(i, i + chunkSize);
        const placeholders = chunk.map(() => '(?, ?, ?, ?, ?)').join(', ');
        const params: (string | number)[] = [];

        for (const v of chunk) {
          params.push(translationId, v.book, v.chapter, v.verse, v.text);
        }

        await this.db.runAsync(
          `INSERT OR REPLACE INTO verses (translation_id, book_id, chapter, verse, text) 
           VALUES ${placeholders};`,
          ...params
        );
        insertedCount += chunk.length;
      }

      await this.markTranslationDownloaded(translationId);
      return insertedCount;
    });
  }

  async getVerseCount(translationId: string): Promise<number> {
    const row = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM verses WHERE translation_id = ?;`,
      translationId
    );
    return row?.count ?? 0;
  }
}
