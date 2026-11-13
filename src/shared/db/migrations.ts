import { CANONICAL_BOOKS } from '../constants/books';
import { ISqliteDb } from './types';

export interface Migration {
  version: number;
  name: string;
  up: (db: ISqliteDb) => Promise<void>;
}

export const KNOWN_TRANSLATIONS = [
  { id: 'ACF11', name: 'Almeida Corrigida Fiel (2011)', language: 'pt-BR' },
  { id: 'ARA', name: 'Almeida Revista e Atualizada (1993)', language: 'pt-BR' },
  { id: 'ARC09', name: 'Almeida Revista e Corrigida (2009)', language: 'pt-BR' },
  { id: 'TB10', name: 'Tradução Brasileira (2010)', language: 'pt-BR' },
  { id: 'KJV', name: 'King James Version', language: 'en' },
];

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema_and_fts5',
    up: async (db: ISqliteDb) => {
      // 1. Translations table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS translations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          language TEXT NOT NULL,
          is_downloaded INTEGER NOT NULL DEFAULT 0,
          downloaded_at TEXT
        );
      `);

      // 2. Books table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          abbrev TEXT NOT NULL,
          testament TEXT NOT NULL,
          chapters_count INTEGER NOT NULL,
          order_index INTEGER NOT NULL
        );
      `);

      // 3. Verses table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS verses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          translation_id TEXT NOT NULL,
          book_id INTEGER NOT NULL,
          chapter INTEGER NOT NULL,
          verse INTEGER NOT NULL,
          text TEXT NOT NULL,
          UNIQUE(translation_id, book_id, chapter, verse),
          FOREIGN KEY (translation_id) REFERENCES translations(id),
          FOREIGN KEY (book_id) REFERENCES books(id)
        );
      `);

      // Index for instant chapter query
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_verses_lookup 
        ON verses(translation_id, book_id, chapter);
      `);

      // 4. FTS5 Virtual Table for full-text search (with fallback for environments without FTS5 like web wa-sqlite)
      try {
        await db.execAsync(`
          CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
            text,
            content='verses',
            content_rowid='id'
          );

          CREATE TRIGGER IF NOT EXISTS verses_ai AFTER INSERT ON verses BEGIN
            INSERT INTO verses_fts(rowid, text) VALUES (new.id, new.text);
          END;

          CREATE TRIGGER IF NOT EXISTS verses_ad AFTER DELETE ON verses BEGIN
            INSERT INTO verses_fts(verses_fts, rowid, text) VALUES('delete', old.id, old.text);
          END;

          CREATE TRIGGER IF NOT EXISTS verses_au AFTER UPDATE ON verses BEGIN
            INSERT INTO verses_fts(verses_fts, rowid, text) VALUES('delete', old.id, old.text);
            INSERT INTO verses_fts(rowid, text) VALUES (new.id, new.text);
          END;
        `);
      } catch (ftsError) {
        console.warn(
          '[migrations] FTS5 not supported in this SQLite environment (e.g. web wa-sqlite without FTS extension). Falling back to index/LIKE search.',
          ftsError
        );
      }

      // Supplementary search index for non-FTS environments
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_verses_text_fallback 
        ON verses(translation_id, text);
      `);

      // 5. Favorites and highlights table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          translation_id TEXT NOT NULL,
          book_id INTEGER NOT NULL,
          chapter INTEGER NOT NULL,
          verse INTEGER NOT NULL,
          highlight_color TEXT,
          note TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          UNIQUE(translation_id, book_id, chapter, verse)
        );
      `);

      // 6. Reading Plans and Progress (MVP 3)
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS reading_plans (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          total_days INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reading_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plan_id TEXT NOT NULL,
          day_number INTEGER NOT NULL,
          passage_reference TEXT NOT NULL,
          completed_at TEXT,
          is_completed INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (plan_id) REFERENCES reading_plans(id)
        );
      `);

      // 7. Quiz Progress (MVP 4)
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS quiz_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          score INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          played_at TEXT DEFAULT (datetime('now'))
        );
      `);

      // 8. Seed translations
      for (const t of KNOWN_TRANSLATIONS) {
        await db.runAsync(
          `INSERT OR IGNORE INTO translations (id, name, language, is_downloaded) VALUES (?, ?, ?, 0);`,
          t.id,
          t.name,
          t.language
        );
      }

      // 9. Seed canonical books
      for (const b of CANONICAL_BOOKS) {
        await db.runAsync(
          `INSERT OR REPLACE INTO books (id, name, abbrev, testament, chapters_count, order_index)
           VALUES (?, ?, ?, ?, ?, ?);`,
          b.id,
          b.name,
          b.abbrev,
          b.testament,
          b.chaptersCount,
          b.orderIndex
        );
      }
    },
  },
];

export async function runMigrations(db: ISqliteDb): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const currentVersionResult = await db.getFirstAsync<{ version: number }>(
    `SELECT MAX(version) as version FROM schema_version;`
  );
  const currentVersion = currentVersionResult?.version ?? 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      await migration.up(db);
      await db.runAsync(
        `INSERT INTO schema_version (version, applied_at) VALUES (?, datetime('now'));`,
        migration.version
      );
    }
  }
}
