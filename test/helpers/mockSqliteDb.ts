import { ISqliteDb, DbTranslation, DbBook, DbVerse, DbFavorite, SearchVerseResult } from '@/src/shared/db/types';

export class MockSqliteDb implements ISqliteDb {
  translations: Map<string, DbTranslation> = new Map();
  books: Map<number, DbBook> = new Map();
  verses: DbVerse[] = [];
  favorites: DbFavorite[] = [];
  plans: { id: string; title: string; description: string; total_days: number }[] = [];
  readingProgress: { id: number; plan_id: string; day_number: number; passage_reference: string; completed_at: string | null; is_completed: number }[] = [];
  quizProgress: { id: number; category: string; score: number; total_questions: number; played_at: string }[] = [];
  private nextVerseId = 1;
  private nextFavId = 1;
  private nextProgressId = 1;
  private nextQuizId = 1;

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

    if (s.startsWith('INSERT OR IGNORE INTO reading_plans')) {
      const [id, title, description, total_days] = params as [string, string, string, number];
      if (!this.plans.some((p) => p.id === id)) {
        this.plans.push({ id, title, description, total_days });
      }
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (s.startsWith('INSERT INTO reading_progress')) {
      const [plan_id, day_number, passage_reference] = params as [string, number, string];
      this.readingProgress.push({
        id: this.nextProgressId++,
        plan_id,
        day_number,
        passage_reference,
        completed_at: null,
        is_completed: 0,
      });
      return { changes: 1, lastInsertRowId: this.nextProgressId - 1 };
    }

    if (s.startsWith('UPDATE reading_progress SET is_completed')) {
      const [is_completed, completed_at, plan_id, day_number] = params as [number, string | null, string, number];
      const found = this.readingProgress.find((p) => p.plan_id === plan_id && p.day_number === day_number);
      if (found) {
        found.is_completed = is_completed;
        found.completed_at = completed_at;
      }
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (s.startsWith('INSERT INTO quiz_progress')) {
      const [category, score, total_questions] = params as [string, number, number];
      const item = {
        id: this.nextQuizId++,
        category,
        score,
        total_questions,
        played_at: new Date().toISOString(),
      };
      this.quizProgress.push(item);
      return { changes: 1, lastInsertRowId: item.id };
    }

    if (s.startsWith('DELETE FROM quiz_progress')) {
      const count = this.quizProgress.length;
      this.quizProgress = [];
      return { changes: count, lastInsertRowId: 0 };
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

    if (s.includes('FROM quiz_progress')) {
      return [...this.quizProgress].reverse() as unknown as T[];
    }

    if (s.includes('FROM reading_plans')) {
      return [...this.plans] as unknown as T[];
    }

    if (s.includes('FROM reading_progress WHERE plan_id = ? AND is_completed = 1')) {
      const [plan_id] = params as [string];
      return this.readingProgress.filter((p) => p.plan_id === plan_id && p.is_completed === 1) as unknown as T[];
    }

    if (s.includes('FROM reading_progress WHERE plan_id = ?')) {
      const [plan_id] = params as [string];
      return this.readingProgress.filter((p) => p.plan_id === plan_id) as unknown as T[];
    }

    if (s.includes('FROM favorites')) {
      return [...this.favorites] as unknown as T[];
    }

    return [];
  }

  async getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null> {
    const s = sql.replace(/\s+/g, ' ').trim();

    if (s.includes('FROM verses WHERE translation_id = ? AND book_id = ? AND chapter = ? AND verse = ?')) {
      const [translation_id, book_id, chapter, verse] = params as [string, number, number, number];
      const match = this.verses.find(
        (v) =>
          v.translation_id === translation_id &&
          v.book_id === book_id &&
          v.chapter === chapter &&
          v.verse === verse
      );
      return (match ?? null) as unknown as T;
    }

    if (s.includes('SELECT COUNT(*) as count FROM quiz_progress')) {
      return { count: this.quizProgress.length } as unknown as T;
    }

    if (s.includes('SELECT MAX(score) as maxScore FROM quiz_progress')) {
      const max = this.quizProgress.reduce((m, item) => Math.max(m, item.score), 0);
      return { maxScore: max } as unknown as T;
    }

    if (s.includes('SELECT COUNT(*) as count FROM reading_progress WHERE plan_id = ? AND is_completed = 1')) {
      const [plan_id] = params as [string];
      const count = this.readingProgress.filter((p) => p.plan_id === plan_id && p.is_completed === 1).length;
      return { count } as unknown as T;
    }

    if (s.includes('SELECT COUNT(*) as count FROM reading_progress WHERE plan_id = ?')) {
      const [plan_id] = params as [string];
      const count = this.readingProgress.filter((p) => p.plan_id === plan_id).length;
      return { count } as unknown as T;
    }

    if (s.includes('FROM reading_plans WHERE id = ?')) {
      const [id] = params as [string];
      const p = this.plans.find((item) => item.id === id);
      return (p ?? null) as unknown as T;
    }

    if (s.includes('SELECT is_completed FROM reading_progress WHERE plan_id = ? AND day_number = ?')) {
      const [plan_id, day_number] = params as [string, number];
      const found = this.readingProgress.find((p) => p.plan_id === plan_id && p.day_number === day_number);
      return (found ? { is_completed: found.is_completed } : null) as unknown as T;
    }

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
