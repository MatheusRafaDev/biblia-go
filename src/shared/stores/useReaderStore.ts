import { create } from 'zustand';

interface ReaderState {
  currentTranslation: string;
  currentBookId: number;
  currentChapter: number;
  fontSize: number;
  targetVerse: number | null;
  setTranslation: (translation: string) => void;
  setBook: (bookId: number) => void;
  setChapter: (chapter: number) => void;
  setFontSize: (fontSize: number) => void;
  goToPassage: (bookId: number, chapter: number, verse?: number) => void;
  clearTargetVerse: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  currentTranslation: 'ACF11',
  currentBookId: 1, // Gênesis
  currentChapter: 1,
  fontSize: 18,
  targetVerse: null,
  setTranslation: (currentTranslation) => set({ currentTranslation }),
  setBook: (currentBookId) => set({ currentBookId, currentChapter: 1, targetVerse: null }),
  setChapter: (currentChapter) => set({ currentChapter, targetVerse: null }),
  setFontSize: (fontSize) => set({ fontSize }),
  goToPassage: (bookId, chapter, verse) =>
    set({
      currentBookId: bookId,
      currentChapter: chapter,
      targetVerse: verse ?? null,
    }),
  clearTargetVerse: () => set({ targetVerse: null }),
}));
