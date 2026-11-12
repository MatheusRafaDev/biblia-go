export const DEFAULT_WORDS_PER_MINUTE = 200;

export function countTotalWords(verses: { text: string }[]): number {
  let count = 0;
  for (const v of verses) {
    if (!v.text) continue;
    const words = v.text.trim().split(/\s+/).filter(Boolean);
    count += words.length;
  }
  return count;
}

export function estimateReadingTimeMinutes(
  verses: { text: string }[],
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE
): number {
  const totalWords = countTotalWords(verses);
  if (totalWords === 0) return 0;
  const speed = Math.max(50, wordsPerMinute);
  const minutes = Math.ceil(totalWords / speed);
  return minutes;
}

export function formatReadingTime(minutes: number): string {
  if (minutes <= 0) return '< 1 min de leitura';
  if (minutes === 1) return '1 min de leitura';
  return `${minutes} min de leitura`;
}
