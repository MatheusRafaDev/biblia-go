import { CANONICAL_BOOKS, BibleBook } from '../constants/books';

export interface ParsedPassage {
  book: BibleBook;
  chapter: number;
  verse?: number;
  endVerse?: number;
}

export function parsePassageReference(reference: string): ParsedPassage | null {
  const trimmed = reference.trim();
  const match = trimmed.match(/^([\d\w\sÀ-ÿ]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);

  if (!match) return null;

  const bookNameRaw = match[1].trim().toLowerCase();
  const chapter = Number(match[2]);
  const verse = match[3] ? Number(match[3]) : undefined;
  const endVerse = match[4] ? Number(match[4]) : undefined;

  const foundBook = CANONICAL_BOOKS.find(
    (b) =>
      b.name.toLowerCase() === bookNameRaw ||
      b.abbrev.toLowerCase() === bookNameRaw ||
      b.name.toLowerCase().startsWith(bookNameRaw)
  );

  if (!foundBook) return null;

  return {
    book: foundBook,
    chapter,
    verse,
    endVerse,
  };
}

export function formatPassageReference(
  bookName: string,
  chapter: number,
  verse?: number,
  endVerse?: number
): string {
  if (verse && endVerse && endVerse > verse) {
    return `${bookName} ${chapter}:${verse}-${endVerse}`;
  }
  if (verse) {
    return `${bookName} ${chapter}:${verse}`;
  }
  return `${bookName} ${chapter}`;
}
