export interface ISqliteDb {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export interface DbTranslation {
  id: string;
  name: string;
  language: string;
  is_downloaded: number;
  downloaded_at: string | null;
}

export interface DbBook {
  id: number;
  name: string;
  abbrev: string;
  testament: 'OT' | 'NT';
  chapters_count: number;
  order_index: number;
}

export interface DbVerse {
  id: number;
  translation_id: string;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface DbFavorite {
  id: number;
  translation_id: string;
  book_id: number;
  chapter: number;
  verse: number;
  highlight_color: string | null;
  note: string | null;
  created_at: string;
}

export interface SearchVerseResult {
  id: number;
  translation_id: string;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  book_name: string;
  book_abbrev: string;
}
