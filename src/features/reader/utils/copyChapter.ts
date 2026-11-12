export interface VerseItem {
  verse: number;
  text: string;
}

export interface FormatChapterOptions {
  bookName: string;
  chapter: number;
  translationId: string;
  verses: VerseItem[];
  includeVerseNumbers?: boolean;
  includeFooter?: boolean;
}

export function formatChapterForShare(options: FormatChapterOptions): string {
  const {
    bookName,
    chapter,
    translationId,
    verses,
    includeVerseNumbers = true,
    includeFooter = true,
  } = options;

  const lines: string[] = [`📖 ${bookName} ${chapter} (${translationId})`, ''];

  for (const v of verses) {
    if (includeVerseNumbers) {
      lines.push(`${v.verse} ${v.text}`);
    } else {
      lines.push(v.text);
    }
  }

  if (includeFooter) {
    lines.push('', '— Bíblia Go');
  }

  return lines.join('\n');
}
