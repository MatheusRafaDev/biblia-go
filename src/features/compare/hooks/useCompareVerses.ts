import { useQuery } from '@tanstack/react-query';
import { useBibleRepository } from '@/src/shared/db/client';

export interface TranslationVerseData {
  translationId: string;
  text: string;
  isAvailable: boolean;
}

export function useCompareVerses(
  bookId: number,
  chapter: number,
  verse: number,
  translations: string[]
) {
  const repo = useBibleRepository();

  return useQuery({
    queryKey: ['compare-verses', bookId, chapter, verse, translations],
    queryFn: async (): Promise<TranslationVerseData[]> => {
      const results: TranslationVerseData[] = [];

      for (const tId of translations) {
        // 1. Try SQLite local database
        const localVerse = await repo.getSingleVerse(tId, bookId, chapter, verse);
        if (localVerse && localVerse.text) {
          results.push({
            translationId: tId,
            text: localVerse.text,
            isAvailable: true,
          });
          continue;
        }

        // 2. Fallback to on-demand API fetch for chapter
        try {
          const res = await fetch(`https://bolls.life/get-chapter/${tId}/${bookId}/${chapter}/`);
          if (res.ok) {
            const chapterData = (await res.json()) as { verse: number; text: string }[];
            const found = chapterData.find((v) => v.verse === verse);
            if (found) {
              const cleanedText = found.text.replace(/<[^>]*>/g, '').trim();
              results.push({
                translationId: tId,
                text: cleanedText,
                isAvailable: true,
              });

              // Seed this chapter into SQLite in the background
              const versesToInsert = chapterData.map((v) => ({
                book: bookId,
                chapter,
                verse: v.verse,
                text: v.text.replace(/<[^>]*>/g, '').trim(),
              }));
              repo.bulkInsertVerses(tId, versesToInsert).catch(() => {});
              continue;
            }
          }
        } catch {
          // Offline and not yet downloaded
        }

        results.push({
          translationId: tId,
          text: 'Versículo não disponível nesta tradução. Baixe a tradução para uso offline.',
          isAvailable: false,
        });
      }

      return results;
    },
    staleTime: 1000 * 60 * 10,
  });
}

