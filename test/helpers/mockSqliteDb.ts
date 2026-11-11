import { ISqliteDb, DbTranslation, DbBook, DbVerse, DbFavorite, SearchVerseResult } from '@/src/shared/db/types';

export class MockSqliteDb implements ISqliteDb {
  translations: Map<string, DbTranslation> = new Map();
  books: Map<number, DbBook> = new Map();
  verses: DbVerse[] = [];
  favorites: DbFavorite[] = [];
  private nextVerseId = 1;
  private nextFavId = 1;

  async execAsync(_sql: string): Promise<void> {
    // Simulated table creation
  }

  async runAsync(sql: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }> {
    const s = sql.replace(/\s+/g, ' ').trim();

    if (s.startsWith('INSERT OR IGNORE INTO translations')) {
      const [id, name, language] = params as [string, string, string];
      if (!this.translations.has(id)) {
        this.translations.set(id, { id, name, language, is_downloaded: 0, downloaded_at: null });
      }
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (s.startsWith('UPDATE translations SET is_downloaded = 1')) {
      const [id] = params as [string];
      const t = this.translations.get(id);
      if (t) {
        t.is_downloaded = 1;
        t.downloaded_at = new Date().toISOString();
      }
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (s.startsWith('INSERT OR REPLACE INTO books')) {
      const [id, name, abbrev, testament, chapters_count, order_index] = params as [
        number,
        string,
        string,
        'OT' | 'NT',
        number,
        number,
      ];
      this.books.set(id, { id, name, abbrev, testament, chapters_count, order_index });
      return { changes: 1, lastInsertRowId: id };
    }

    if (s.includes('INSERT OR REPLACE INTO verses')) {
      // Chunk insert
      let changes = 0;
      for (let i = 0; i < params.length; i += 5) {
        const [translation_id, book_id, chapter, verse, text] = params.slice(i, i + 5) as [
          string,
          number,
          number,
          number,
          string,
        ];
        this.verses.push({
          id: this.nextVerseId++,
          translation_id,
          book_id,
          chapter,
          verse,
          text,
        });
        changes++;
      }
      return { changes, lastInsertRowId: this.nextVerseId - 1 };
    }

    if (s.startsWith('INSERT INTO favorites')) {
      const [translation_id, book_id, chapter, verse, highlight_color] = params as [
        string,
        number,
        number,
        number,
        string | null,
      ];
      const newFav: DbFavorite = {
        id: this.nextFavId++,
        translation_id,
        book_id,
        chapter,
        verse,
        highlight_color: highlight_color ?? null,
        note: null,
        created_at: new Date().toISOString(),
      };
      this.favorites.push(newFav);
      return { changes: 1, lastInsertRowId: newFav.id };
    }

    if (s.startsWith('DELETE FROM favorites WHERE translation_id')) {
      const [translation_id, book_id, chapter, verse] = params as [string, number, number, number];
      const initial = this.favorites.length;
      this.favorites = this.favorites.filter(
        (f) =>
          !(
            f.translation_id === translation_id &&
            f.book_id === book_id &&
            f.chapter === chapter &&
            f.verse === verse
          )
      );
      return { changes: initial - this.favorites.length, lastInsertRowId: 0 };
    }

    if (s.startsWith('DELETE FROM favorites WHERE id')) {
      const [id] = params as [number];
      const initial = this.favorites.length;
      this.favorites = this.favorites.filter((f) => f.id !== id);
      return { changes: initial - this.favorites.length, lastInsertRowId: 0 };
    }

    return { changes: 0, lastInsertRowId: 0 };
  }

  async getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
    const s = sql.replace(/\s+/g, ' ').trim();

    if (s.includes('FROM translations')) {
      return Array.from(this.translations.values()) as unknown as T[];
    }

    if (s.includes('FROM books WHERE testament')) {
      const [testament] = params as ['OT' | 'NT'];
      return Array.from(this.books.values()).filter((b) => b.testament === testament) as unknown as T[];
    }

    if (s.includes('FROM books')) {
      return Array.from(this.books.values()) as unknown as T[];
    }

    if (s.includes('FROM verses WHERE translation_id = ? AND book_id = ? AND chapter = ?')) {
      const [translation_id, book_id, chapter] = params as [string, number, number];
      return this.verses.filter(
        (v) => v.translation_id === translation_id && v.book_id === book_id && v.chapter === chapter
      ) as unknown as T[];
    }

    if (s.includes('verses_fts MATCH') || s.includes('v.text LIKE ?')) {
      const [queryOrFts, translationId] = params as [string, string];
      const searchTerms = queryOrFts
        .replace(/["*]/g, '')
        .split(' AND ')
        .map((t) => t.trim().toLowerCase());

      const matched: SearchVerseResult[] = [];
      for (const v of this.verses) {
        if (v.translation_id !== translationId && translationId !== undefined) continue;
        const lowerText = v.text.toLowerCase();
        const matchesAll = searchTerms.every((term) => lowerText.includes(term));
        if (matchesAll) {
          const book = this.books.get(v.book_id);
          matched.push({
            id: v.id,
            translation_id: v.translation_id,
            book_id: v.book_id,
            chapter: v.chapter,
            verse: v.verse,
            text: v.text,
            book_name: book?.name ?? 'Livro',
            book_abbrev: book?.abbrev ?? 'Lv',
          });
        }
      }
      return matched as unknown as T[];
    }

    if (s.includes('FROM favorites WHERE translation_id = ? AND book_id = ? AND chapter = ?')) {
      const [translation_id, book_id, chapter] = params as [string, number, number];
      return this.favorites.filter(
        (f) => f.translation_id === translation_id && f.book_id === book_id && f.chapter === chapter
      ) as unknown as T[];
    }

    if (s.includes('FROM favorites WHERE translation_id = ?')) {
      const [translation_id] = params as [string];
      return this.favorites.filter((f) => f.translation_id === translation_id) as unknown as T[];
    }

    if (s.includes('FROM favorites')) {
      return [...this.favorites] as unknown as T[];
    }

    return [];
  }

  async getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null> {
    const s = sql.replace(/\s+/g, ' ').trim();

    if (s.includes('SELECT is_downloaded FROM translations WHERE id = ?')) {
      const [id] = params as [string];
      const t = this.translations.get(id);
      return (t ? { is_downloaded: t.is_downloaded } : null) as unknown as T;
    }

    if (s.includes('FROM books WHERE id = ?')) {
      const [id] = params as [number];
      return (this.books.get(id) ?? null) as unknown as T;
    }

    if (s.includes('SELECT COUNT(*) as count FROM verses WHERE translation_id = ?')) {
      const [translation_id] = params as [string];
      const count = this.verses.filter((v) => v.translation_id === translation_id).length;
      return { count } as unknown as T;
    }

    if (s.includes('SELECT id FROM favorites WHERE translation_id = ?')) {
      const [translation_id, book_id, chapter, verse] = params as [string, number, number, number];
      const fav = this.favorites.find(
        (f) =>
          f.translation_id === translation_id &&
          f.book_id === book_id &&
          f.chapter === chapter &&
          f.verse === verse
      );
      return (fav ? { id: fav.id } : null) as unknown as T;
    }

    return null;
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }
}
