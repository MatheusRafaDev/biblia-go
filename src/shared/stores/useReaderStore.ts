import { create } from 'zustand';

export interface RecentPassage {
  bookId: number;
  chapter: number;
  timestamp: number;
}

export function updateRecentPassages(
  current: RecentPassage[],
  bookId: number,
  chapter: number,
  max = 8
): RecentPassage[] {
  const filtered = current.filter(
    (item) => !(item.bookId === bookId && item.chapter === chapter)
  );
  return [{ bookId, chapter, timestamp: Date.now() }, ...filtered].slice(0, max);
}

interface ReaderState {
  currentTranslation: string;
  currentBookId: number;
  currentChapter: number;
  fontSize: number;
  targetVerse: number | null;
  recentPassages: RecentPassage[];
  setTranslation: (translation: string) => void;
  setBook: (bookId: number) => void;
  setChapter: (chapter: number) => void;
  setFontSize: (fontSize: number) => void;
  goToPassage: (bookId: number, chapter: number, verse?: number) => void;
  clearTargetVerse: () => void;
  clearRecentPassages: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  currentTranslation: 'ACF11',
  currentBookId: 1, // Gênesis
  currentChapter: 1,
  fontSize: 18,
  targetVerse: null,
  recentPassages: [{ bookId: 1, chapter: 1, timestamp: Date.now() }],
  setTranslation: (currentTranslation) => set({ currentTranslation }),
  setBook: (currentBookId) =>
    set((state) => ({
      currentBookId,
      currentChapter: 1,
      targetVerse: null,
      recentPassages: updateRecentPassages(state.recentPassages, currentBookId, 1),
    })),
  setChapter: (currentChapter) =>
    set((state) => ({
      currentChapter,
      targetVerse: null,
      recentPassages: updateRecentPassages(
        state.recentPassages,
        state.currentBookId,
        currentChapter
      ),
    })),
  setFontSize: (fontSize) => set({ fontSize }),
  goToPassage: (bookId, chapter, verse) =>
    set((state) => ({
      currentBookId: bookId,
      currentChapter: chapter,
      targetVerse: verse ?? null,
      recentPassages: updateRecentPassages(state.recentPassages, bookId, chapter),
    })),
  clearTargetVerse: () => set({ targetVerse: null }),
  clearRecentPassages: () => set({ recentPassages: [] }),
}));
