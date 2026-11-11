import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBibleRepository, useFavoritesRepository } from '@/src/shared/db/client';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { BOOKS_BY_ID } from '@/src/shared/constants/books';
import { BibleSyncService, SyncProgress } from '../services/bibleSyncService';
import { useState } from 'react';

export function useCurrentBook() {
  const currentBookId = useReaderStore((s) => s.currentBookId);
  return BOOKS_BY_ID.get(currentBookId) ?? BOOKS_BY_ID.get(1)!;
}

export function useBooks() {
  const repo = useBibleRepository();
  return useQuery({
    queryKey: ['books'],
    queryFn: () => repo.getBooks(),
  });
}

export function useChapterVerses() {
  const repo = useBibleRepository();
  const currentTranslation = useReaderStore((s) => s.currentTranslation);
  const currentBookId = useReaderStore((s) => s.currentBookId);
  const currentChapter = useReaderStore((s) => s.currentChapter);

  return useQuery({
    queryKey: ['chapter-verses', currentTranslation, currentBookId, currentChapter],
    queryFn: () => repo.getChapterVerses(currentTranslation, currentBookId, currentChapter),
  });
}

export function useChapterFavorites() {
  const favRepo = useFavoritesRepository();
  const currentTranslation = useReaderStore((s) => s.currentTranslation);
  const currentBookId = useReaderStore((s) => s.currentBookId);
  const currentChapter = useReaderStore((s) => s.currentChapter);

  return useQuery({
    queryKey: ['chapter-favorites', currentTranslation, currentBookId, currentChapter],
    queryFn: () => favRepo.getFavoritesForChapter(currentTranslation, currentBookId, currentChapter),
  });
}

export function useToggleFavorite() {
  const favRepo = useFavoritesRepository();
  const queryClient = useQueryClient();
  const currentTranslation = useReaderStore((s) => s.currentTranslation);
  const currentBookId = useReaderStore((s) => s.currentBookId);
  const currentChapter = useReaderStore((s) => s.currentChapter);

  return useMutation({
    mutationFn: async ({ verse, color }: { verse: number; color?: string }) => {
      return favRepo.toggleFavorite(currentTranslation, currentBookId, currentChapter, verse, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chapter-favorites', currentTranslation, currentBookId, currentChapter],
      });
      queryClient.invalidateQueries({
        queryKey: ['all-favorites'],
      });
    },
  });
}

export function useAllFavorites() {
  const favRepo = useFavoritesRepository();
  const currentTranslation = useReaderStore((s) => s.currentTranslation);

  return useQuery({
    queryKey: ['all-favorites', currentTranslation],
    queryFn: () => favRepo.getFavorites(currentTranslation),
  });
}

export function useUpdateFavoriteNote() {
  const favRepo = useFavoritesRepository();
  const queryClient = useQueryClient();
  const currentTranslation = useReaderStore((s) => s.currentTranslation);

  return useMutation({
    mutationFn: async ({
      bookId,
      chapter,
      verse,
      note,
    }: {
      bookId: number;
      chapter: number;
      verse: number;
      note: string;
    }) => {
      return favRepo.updateFavoriteNote(currentTranslation, bookId, chapter, verse, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['chapter-favorites'] });
    },
  });
}

export function useVerseSearch(query: string) {
  const repo = useBibleRepository();
  const currentTranslation = useReaderStore((s) => s.currentTranslation);

  return useQuery({
    queryKey: ['search-verses', currentTranslation, query],
    queryFn: () => repo.searchVerses(query, currentTranslation, 60),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTranslationSync() {
  const repo = useBibleRepository();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<SyncProgress>({
    status: 'idle',
    percent: 0,
    message: '',
  });

  const mutation = useMutation({
    mutationFn: async (translationId: string) => {
      const service = new BibleSyncService(repo);
      return service.downloadAndStoreTranslation(translationId, setProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return {
    downloadTranslation: mutation.mutateAsync,
    isDownloading: mutation.isPending,
    progress,
    error: mutation.error,
  };
}

export function useTranslationStatus(translationId: string) {
  const repo = useBibleRepository();
  return useQuery({
    queryKey: ['translation-downloaded', translationId],
    queryFn: () => repo.isTranslationDownloaded(translationId),
  });
}
