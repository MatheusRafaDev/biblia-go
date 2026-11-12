import { DatabaseSync } from 'node:sqlite';
import { env } from '../config/env.js';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    const dbPath = env.NODE_ENV === 'test' ? ':memory:' : env.DATABASE_PATH;
    dbInstance = new DatabaseSync(dbPath);

    // Enforce SQLite integrity and concurrency pragmas
    dbInstance.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
    `);

    if (dbPath !== ':memory:') {
      dbInstance.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
      `);
    }

    initSchema(dbInstance);
  }
  return dbInstance;
}

export function checkpointDatabase(): void {
  if (dbInstance && env.NODE_ENV !== 'test') {
    try {
      dbInstance.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    } catch {
      // Ignored if in-memory or already checkpointed
    }
  }
}

export function resetTestDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

function initSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      translation_id TEXT NOT NULL,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      highlight_color TEXT,
      note TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, translation_id, book_id, chapter, verse)
    );

    CREATE TABLE IF NOT EXISTS user_reading_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      day_number INTEGER NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, plan_id, day_number)
    );

    CREATE TABLE IF NOT EXISTS semantic_themes (
      id TEXT PRIMARY KEY,
      theme TEXT NOT NULL,
      keywords TEXT NOT NULL,
      book_id INTEGER NOT NULL,
      book_name TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL
    );

    -- Performance indexes
    CREATE INDEX IF NOT EXISTS idx_fav_user_id ON user_favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_fav_updated ON user_favorites(updated_at);
    CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_reading_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_semantic_theme ON semantic_themes(theme);
  `);

  // Seed semantic biblical themes for search & RAG
  const countRow = db.prepare('SELECT COUNT(*) as count FROM semantic_themes').get() as { count: number };
  if (countRow.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO semantic_themes (id, theme, keywords, book_id, book_name, chapter, verse, text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedThemes = [
      {
        id: 'sem_1',
        theme: 'ansiedade',
        keywords: 'preocupação medo aflição futuro cuidado paz descanso',
        bookId: 50,
        bookName: 'Filipenses',
        chapter: 4,
        verse: 6,
        text: 'Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças.',
      },
      {
        id: 'sem_2',
        theme: 'ansiedade',
        keywords: 'fardo cansaço descanso alívio paz fardos pesados',
        bookId: 40,
        bookName: 'Mateus',
        chapter: 11,
        verse: 28,
        text: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.',
      },
      {
        id: 'sem_3',
        theme: 'esperança',
        keywords: 'futuro desânimo renovo asas águias força esperar',
        bookId: 23,
        bookName: 'Isaías',
        chapter: 40,
        verse: 31,
        text: 'Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.',
      },
      {
        id: 'sem_4',
        theme: 'fé',
        keywords: 'certeza convicção crer fidelidade invisível Deus',
        bookId: 58,
        bookName: 'Hebreus',
        chapter: 11,
        verse: 1,
        text: 'Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem.',
      },
      {
        id: 'sem_5',
        theme: 'perdão',
        keywords: 'mágoa ofensa reconciliação misericórdia perdoar graça',
        bookId: 49,
        bookName: 'Efésios',
        chapter: 4,
        verse: 32,
        text: 'Antes sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros, como também Deus vos perdoou em Cristo.',
      },
      {
        id: 'sem_6',
        theme: 'amor',
        keywords: 'ágape compaixão paciência bondade sacrifício supremo',
        bookId: 46,
        bookName: '1 Coríntios',
        chapter: 13,
        verse: 4,
        text: 'O amor é sofredor, é benigno; o amor não é invejoso; o amor não trata com leviandade, não se ensoberbece.',
      },
      {
        id: 'sem_7',
        theme: 'provisão',
        keywords: 'pastor falta sustento cuidado vale sombra mesa unção',
        bookId: 19,
        bookName: 'Salmos',
        chapter: 23,
        verse: 1,
        text: 'O Senhor é o meu pastor, nada me faltará.',
      },
      {
        id: 'sem_8',
        theme: 'propósito',
        keywords: 'vontade planos plano de Deus bem futuro esperança',
        bookId: 24,
        bookName: 'Jeremias',
        chapter: 29,
        verse: 11,
        text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.',
      },
    ];

    for (const t of seedThemes) {
      insertStmt.run(t.id, t.theme, t.keywords, t.bookId, t.bookName, t.chapter, t.verse, t.text);
    }
  }
}
