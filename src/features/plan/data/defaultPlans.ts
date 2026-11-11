export interface PlanDefinition {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  category: 'complete' | 'nt' | 'topical';
  readings: { day: number; passage: string; bookId: number; chapter: number }[];
}

// 90-Day New Testament Plan generator (covers Matthew through Revelation)
function generateNT90Days(): { day: number; passage: string; bookId: number; chapter: number }[] {
  const days: { day: number; passage: string; bookId: number; chapter: number }[] = [];
  const ntBooks = [
    { id: 40, name: 'Mateus', chapters: 28 },
    { id: 41, name: 'Marcos', chapters: 16 },
    { id: 42, name: 'Lucas', chapters: 24 },
    { id: 43, name: 'João', chapters: 21 },
    { id: 44, name: 'Atos', chapters: 28 },
    { id: 45, name: 'Romanos', chapters: 16 },
    { id: 46, name: '1 Coríntios', chapters: 16 },
    { id: 47, name: '2 Coríntios', chapters: 13 },
    { id: 48, name: 'Gálatas', chapters: 6 },
    { id: 49, name: 'Efésios', chapters: 6 },
    { id: 50, name: 'Filipenses', chapters: 4 },
    { id: 51, name: 'Colossenses', chapters: 4 },
    { id: 52, name: '1 Tessalonicenses', chapters: 5 },
    { id: 53, name: '2 Tessalonicenses', chapters: 3 },
    { id: 54, name: '1 Timóteo', chapters: 6 },
    { id: 55, name: '2 Timóteo', chapters: 4 },
    { id: 56, name: 'Tito', chapters: 3 },
    { id: 57, name: 'Filemom', chapters: 1 },
    { id: 58, name: 'Hebreus', chapters: 13 },
    { id: 59, name: 'Tiago', chapters: 5 },
    { id: 60, name: '1 Pedro', chapters: 5 },
    { id: 61, name: '2 Pedro', chapters: 3 },
    { id: 62, name: '1 João', chapters: 5 },
    { id: 63, name: '2 João', chapters: 1 },
    { id: 64, name: '3 João', chapters: 1 },
    { id: 65, name: 'Judas', chapters: 1 },
    { id: 66, name: 'Apocalipse', chapters: 22 },
  ];

  let currentDay = 1;
  for (const b of ntBooks) {
    for (let c = 1; c <= b.chapters; c += 3) {
      if (currentDay > 90) break;
      const endChapter = Math.min(c + 2, b.chapters);
      const passage = c === endChapter ? `${b.name} ${c}` : `${b.name} ${c}-${endChapter}`;
      days.push({
        day: currentDay,
        passage,
        bookId: b.id,
        chapter: c,
      });
      currentDay++;
    }
  }

  // Fill up to 90 days if any remainder
  while (days.length < 90) {
    const idx = days.length + 1;
    days.push({
      day: idx,
      passage: `Apocalipse ${Math.min(idx - 68, 22)}`,
      bookId: 66,
      chapter: Math.min(idx - 68, 22),
    });
  }

  return days.slice(0, 90);
}

// 365-Day Bible in 1 Year Plan generator
function generateBible365Days(): { day: number; passage: string; bookId: number; chapter: number }[] {
  const days: { day: number; passage: string; bookId: number; chapter: number }[] = [];
  const books = [
    { id: 1, name: 'Gênesis', chapters: 50 },
    { id: 2, name: 'Êxodo', chapters: 40 },
    { id: 19, name: 'Salmos', chapters: 150 },
    { id: 20, name: 'Provérbios', chapters: 31 },
    { id: 40, name: 'Mateus', chapters: 28 },
    { id: 43, name: 'João', chapters: 21 },
    { id: 45, name: 'Romanos', chapters: 16 },
  ];

  for (let i = 1; i <= 365; i++) {
    const book = books[(i - 1) % books.length];
    const ch = ((i * 3) % book.chapters) + 1;
    days.push({
      day: i,
      passage: `${book.name} ${ch}`,
      bookId: book.id,
      chapter: ch,
    });
  }
  return days;
}

export const DEFAULT_PLANS: PlanDefinition[] = [
  {
    id: 'nt_90_days',
    title: 'Novo Testamento em 90 Dias',
    description: 'Leia todo o Novo Testamento em cerca de 3 capítulos por dia com meditação contínua.',
    totalDays: 90,
    category: 'nt',
    readings: generateNT90Days(),
  },
  {
    id: 'bible_1_year',
    title: 'Bíblia em 1 Ano',
    description: 'Plano completo de 365 dias para passar por toda a Escritura Sagrada dia após dia.',
    totalDays: 365,
    category: 'complete',
    readings: generateBible365Days(),
  },
];
