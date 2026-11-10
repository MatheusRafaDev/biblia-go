import { z } from 'zod';
import { IBibleRepository } from '@/src/shared/db/repositories/bibleRepository';
import { INITIAL_SEED_VERSES } from '@/src/shared/constants/initialSeed';

const RemoteVerseItemSchema = z.object({
  book: z.number(),
  chapter: z.number(),
  verse: z.number(),
  text: z.string(),
});

const RemoteBibleDumpSchema = z.array(RemoteVerseItemSchema);

export interface SyncProgress {
  status: 'idle' | 'downloading' | 'saving' | 'completed' | 'error';
  percent: number;
  message: string;
}

export class BibleSyncService {
  constructor(private repo: IBibleRepository) {}

  async downloadAndStoreTranslation(
    translationId = 'ACF11',
    onProgress?: (progress: SyncProgress) => void
  ): Promise<number> {
    const notify = (status: SyncProgress['status'], percent: number, message: string) => {
      onProgress?.({ status, percent, message });
    };

    try {
      notify('downloading', 10, `Baixando versão ${translationId}...`);

      const url = `https://bolls.life/static/translations/${translationId}.json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Falha no download da tradução (HTTP ${response.status})`);
      }

      notify('downloading', 40, 'Processando dados da tradução...');
      const rawData = await response.json();

      // Validate with Zod
      notify('saving', 60, 'Validando integridade dos textos bíblicos com Zod...');
      const parsedVerses = RemoteBibleDumpSchema.parse(rawData);

      // Clean HTML tags from verse text
      const cleanedVerses = parsedVerses.map((v) => ({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.replace(/<[^>]*>/g, '').trim(),
      }));

      notify('saving', 75, `Gravando ${cleanedVerses.length.toLocaleString('pt-BR')} versículos no SQLite...`);
      const inserted = await this.repo.bulkInsertVerses(translationId, cleanedVerses);

      notify('completed', 100, 'Tradução pronta para leitura offline!');
      return inserted;
    } catch (err) {
      // If error occurs and DB is completely empty, insert offline fallback seed
      const currentCount = await this.repo.getVerseCount(translationId);
      if (currentCount === 0) {
        await this.repo.bulkInsertVerses(translationId, INITIAL_SEED_VERSES);
      }

      notify(
        'error',
        0,
        err instanceof Error ? err.message : 'Erro ao sincronizar tradução bíblica'
      );
      throw err;
    }
  }

  async ensureStarterContent(translationId = 'ACF11'): Promise<void> {
    const isDownloaded = await this.repo.isTranslationDownloaded(translationId);
    if (!isDownloaded) {
      const count = await this.repo.getVerseCount(translationId);
      if (count === 0) {
        await this.repo.bulkInsertVerses(translationId, INITIAL_SEED_VERSES);
      }
    }
  }
}
