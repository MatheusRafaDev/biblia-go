import { DAILY_VERSES, DailyVerse } from '../data/dailyVerses';

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime() + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getDailyVerse(targetDate?: Date): DailyVerse {
  const date = targetDate ?? new Date();
  const dayIndex = getDayOfYear(date);
  const index = Math.abs(dayIndex) % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

export function formatDailyVerseShare(verse: DailyVerse): string {
  return [
    `✨ Versículo do Dia — Bíblia Go 📖`,
    `"${verse.text}"`,
    `— ${verse.bookName} ${verse.chapter}:${verse.verse}`,
    ``,
    `🏷️ Tema: ${verse.theme}`,
    `💡 Reflexão: ${verse.reflection}`,
    `🙏 Oração: ${verse.prayer}`,
    ``,
    `#BibliaGo #VersiculoDoDia #Devocional`,
  ].join('\n');
}

