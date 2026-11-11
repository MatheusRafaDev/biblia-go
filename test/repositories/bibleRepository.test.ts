import { describe, it, expect, beforeEach } from 'vitest';
import { MockSqliteDb } from '../helpers/mockSqliteDb';
import { BibleRepository } from '@/src/shared/db/repositories/bibleRepository';
import { CANONICAL_BOOKS } from '@/src/shared/constants/books';

describe('BibleRepository', () => {
  let db: MockSqliteDb;
  let repo: BibleRepository;

  beforeEach(async () => {
    db = new MockSqliteDb();
    repo = new BibleRepository(db);

    // Seed translations
    await db.runAsync('INSERT OR IGNORE INTO translations', 'ACF11', 'Almeida Corrigida Fiel', 'pt-BR');
    await db.runAsync('INSERT OR IGNORE INTO translations', 'ARA', 'Almeida Revista e Atualizada', 'pt-BR');

    // Seed books
    for (const b of CANONICAL_BOOKS) {
      await db.runAsync(
        'INSERT OR REPLACE INTO books',
        b.id,
        b.name,
        b.abbrev,
        b.testament,
        b.chaptersCount,
        b.orderIndex
      );
    }
  });

  it('deve listar as traduções cadastradas', async () => {
    const translations = await repo.getTranslations();
    expect(translations).toHaveLength(2);
    expect(translations[0].id).toBe('ACF11');
    expect(translations[1].id).toBe('ARA');
  });

  it('deve verificar status de download da tradução', async () => {
    const initial = await repo.isTranslationDownloaded('ACF11');
    expect(initial).toBe(false);

    await repo.markTranslationDownloaded('ACF11');

    const updated = await repo.isTranslationDownloaded('ACF11');
    expect(updated).toBe(true);
  });

  it('deve filtrar livros por testamento', async () => {
    const otBooks = await repo.getBooks('OT');
    expect(otBooks).toHaveLength(39);
    expect(otBooks[0].name).toBe('Gênesis');

    const ntBooks = await repo.getBooks('NT');
    expect(ntBooks).toHaveLength(27);
    expect(ntBooks[0].name).toBe('Mateus');

    const allBooks = await repo.getBooks();
    expect(allBooks).toHaveLength(66);
  });

  it('deve buscar livro por ID', async () => {
    const book = await repo.getBookById(19);
    expect(book).toBeDefined();
    expect(book?.name).toBe('Salmos');
    expect(book?.abbrev).toBe('Sl');
    expect(book?.chapters_count).toBe(150);
  });

  it('deve inserir versículos em lote e consultar capítulo', async () => {
    const sampleVerses = [
      { book: 1, chapter: 1, verse: 1, text: 'No princípio criou Deus os céus e a terra.' },
      { book: 1, chapter: 1, verse: 2, text: 'E a terra era sem forma e vazia.' },
      { book: 1, chapter: 1, verse: 3, text: 'E disse Deus: Haja luz; e houve luz.' },
      { book: 19, chapter: 23, verse: 1, text: 'O Senhor é o meu pastor, nada me faltará.' },
    ];

    const inserted = await repo.bulkInsertVerses('ACF11', sampleVerses);
    expect(inserted).toBe(4);

    const count = await repo.getVerseCount('ACF11');
    expect(count).toBe(4);

    const genesis1 = await repo.getChapterVerses('ACF11', 1, 1);
    expect(genesis1).toHaveLength(3);
    expect(genesis1[0].verse).toBe(1);
    expect(genesis1[0].text).toBe('No princípio criou Deus os céus e a terra.');

    const singleVerse = await repo.getSingleVerse('ACF11', 1, 1, 2);
    expect(singleVerse).toBeDefined();
    expect(singleVerse?.verse).toBe(2);
    expect(singleVerse?.text).toBe('E a terra era sem forma e vazia.');
  });

  it('deve realizar busca textual por palavras-chave', async () => {
    const sampleVerses = [
      { book: 1, chapter: 1, verse: 1, text: 'No princípio criou Deus os céus e a terra.' },
      { book: 1, chapter: 1, verse: 3, text: 'E disse Deus: Haja luz; e houve luz.' },
      { book: 43, chapter: 1, verse: 1, text: 'No princípio era o Verbo, e o Verbo estava com Deus.' },
      { book: 19, chapter: 23, verse: 1, text: 'O Senhor é o meu pastor, nada me faltará.' },
    ];

    await repo.bulkInsertVerses('ACF11', sampleVerses);

    // Busca por termo "princípio" deve retornar Gn 1:1 e Jo 1:1
    const results = await repo.searchVerses('princípio', 'ACF11');
    expect(results).toHaveLength(2);
    expect(results[0].book_name).toBe('Gênesis');
    expect(results[1].book_name).toBe('João');

    // Busca por termo inexistente
    const emptyResults = await repo.searchVerses('galileu', 'ACF11');
    expect(emptyResults).toHaveLength(0);
  });
});

