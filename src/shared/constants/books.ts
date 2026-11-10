export interface BibleBook {
  id: number;
  name: string;
  abbrev: string;
  testament: 'OT' | 'NT';
  chaptersCount: number;
  orderIndex: number;
}

export const CANONICAL_BOOKS: BibleBook[] = [
  // Antigo Testamento (39)
  { id: 1, name: 'Gênesis', abbrev: 'Gn', testament: 'OT', chaptersCount: 50, orderIndex: 1 },
  { id: 2, name: 'Êxodo', abbrev: 'Êx', testament: 'OT', chaptersCount: 40, orderIndex: 2 },
  { id: 3, name: 'Levítico', abbrev: 'Lv', testament: 'OT', chaptersCount: 27, orderIndex: 3 },
  { id: 4, name: 'Números', abbrev: 'Nm', testament: 'OT', chaptersCount: 36, orderIndex: 4 },
  { id: 5, name: 'Deuteronômio', abbrev: 'Dt', testament: 'OT', chaptersCount: 34, orderIndex: 5 },
  { id: 6, name: 'Josué', abbrev: 'Js', testament: 'OT', chaptersCount: 24, orderIndex: 6 },
  { id: 7, name: 'Juízes', abbrev: 'Jz', testament: 'OT', chaptersCount: 21, orderIndex: 7 },
  { id: 8, name: 'Rute', abbrev: 'Rt', testament: 'OT', chaptersCount: 4, orderIndex: 8 },
  { id: 9, name: '1 Samuel', abbrev: '1Sm', testament: 'OT', chaptersCount: 31, orderIndex: 9 },
  { id: 10, name: '2 Samuel', abbrev: '2Sm', testament: 'OT', chaptersCount: 24, orderIndex: 10 },
  { id: 11, name: '1 Reis', abbrev: '1Rs', testament: 'OT', chaptersCount: 22, orderIndex: 11 },
  { id: 12, name: '2 Reis', abbrev: '2Rs', testament: 'OT', chaptersCount: 25, orderIndex: 12 },
  { id: 13, name: '1 Crônicas', abbrev: '1Cr', testament: 'OT', chaptersCount: 29, orderIndex: 13 },
  { id: 14, name: '2 Crônicas', abbrev: '2Cr', testament: 'OT', chaptersCount: 36, orderIndex: 14 },
  { id: 15, name: 'Esdras', abbrev: 'Ed', testament: 'OT', chaptersCount: 10, orderIndex: 15 },
  { id: 16, name: 'Neemias', abbrev: 'Ne', testament: 'OT', chaptersCount: 13, orderIndex: 16 },
  { id: 17, name: 'Ester', abbrev: 'Et', testament: 'OT', chaptersCount: 10, orderIndex: 17 },
  { id: 18, name: 'Jó', abbrev: 'Jó', testament: 'OT', chaptersCount: 42, orderIndex: 18 },
  { id: 19, name: 'Salmos', abbrev: 'Sl', testament: 'OT', chaptersCount: 150, orderIndex: 19 },
  { id: 20, name: 'Provérbios', abbrev: 'Pv', testament: 'OT', chaptersCount: 31, orderIndex: 20 },
  { id: 21, name: 'Eclesiastes', abbrev: 'Ec', testament: 'OT', chaptersCount: 12, orderIndex: 21 },
  { id: 22, name: 'Cânticos', abbrev: 'Ct', testament: 'OT', chaptersCount: 8, orderIndex: 22 },
  { id: 23, name: 'Isaías', abbrev: 'Is', testament: 'OT', chaptersCount: 66, orderIndex: 23 },
  { id: 24, name: 'Jeremias', abbrev: 'Jr', testament: 'OT', chaptersCount: 52, orderIndex: 24 },
  { id: 25, name: 'Lamentações', abbrev: 'Lm', testament: 'OT', chaptersCount: 5, orderIndex: 25 },
  { id: 26, name: 'Ezequiel', abbrev: 'Ez', testament: 'OT', chaptersCount: 48, orderIndex: 26 },
  { id: 27, name: 'Daniel', abbrev: 'Dn', testament: 'OT', chaptersCount: 12, orderIndex: 27 },
  { id: 28, name: 'Oséias', abbrev: 'Os', testament: 'OT', chaptersCount: 14, orderIndex: 28 },
  { id: 29, name: 'Joel', abbrev: 'Jl', testament: 'OT', chaptersCount: 3, orderIndex: 29 },
  { id: 30, name: 'Amós', abbrev: 'Am', testament: 'OT', chaptersCount: 9, orderIndex: 30 },
  { id: 31, name: 'Obadias', abbrev: 'Ob', testament: 'OT', chaptersCount: 1, orderIndex: 31 },
  { id: 32, name: 'Jonas', abbrev: 'Jn', testament: 'OT', chaptersCount: 4, orderIndex: 32 },
  { id: 33, name: 'Miquéias', abbrev: 'Mq', testament: 'OT', chaptersCount: 7, orderIndex: 33 },
  { id: 34, name: 'Naum', abbrev: 'Na', testament: 'OT', chaptersCount: 3, orderIndex: 34 },
  { id: 35, name: 'Habacuque', abbrev: 'Hc', testament: 'OT', chaptersCount: 3, orderIndex: 35 },
  { id: 36, name: 'Sofonias', abbrev: 'Sf', testament: 'OT', chaptersCount: 3, orderIndex: 36 },
  { id: 37, name: 'Ageu', abbrev: 'Ag', testament: 'OT', chaptersCount: 2, orderIndex: 37 },
  { id: 38, name: 'Zacarias', abbrev: 'Zc', testament: 'OT', chaptersCount: 14, orderIndex: 38 },
  { id: 39, name: 'Malaquias', abbrev: 'Ml', testament: 'OT', chaptersCount: 4, orderIndex: 39 },

  // Novo Testamento (27)
  { id: 40, name: 'Mateus', abbrev: 'Mt', testament: 'NT', chaptersCount: 28, orderIndex: 40 },
  { id: 41, name: 'Marcos', abbrev: 'Mc', testament: 'NT', chaptersCount: 16, orderIndex: 41 },
  { id: 42, name: 'Lucas', abbrev: 'Lc', testament: 'NT', chaptersCount: 24, orderIndex: 42 },
  { id: 43, name: 'João', abbrev: 'Jo', testament: 'NT', chaptersCount: 21, orderIndex: 43 },
  { id: 44, name: 'Atos', abbrev: 'At', testament: 'NT', chaptersCount: 28, orderIndex: 44 },
  { id: 45, name: 'Romanos', abbrev: 'Rm', testament: 'NT', chaptersCount: 16, orderIndex: 45 },
  { id: 46, name: '1 Coríntios', abbrev: '1Co', testament: 'NT', chaptersCount: 16, orderIndex: 46 },
  { id: 47, name: '2 Coríntios', abbrev: '2Co', testament: 'NT', chaptersCount: 13, orderIndex: 47 },
  { id: 48, name: 'Gálatas', abbrev: 'Gl', testament: 'NT', chaptersCount: 6, orderIndex: 48 },
  { id: 49, name: 'Efésios', abbrev: 'Ef', testament: 'NT', chaptersCount: 6, orderIndex: 49 },
  { id: 50, name: 'Filipenses', abbrev: 'Fp', testament: 'NT', chaptersCount: 4, orderIndex: 50 },
  { id: 51, name: 'Colossenses', abbrev: 'Cl', testament: 'NT', chaptersCount: 4, orderIndex: 51 },
  { id: 52, name: '1 Tessalonicenses', abbrev: '1Ts', testament: 'NT', chaptersCount: 5, orderIndex: 52 },
  { id: 53, name: '2 Tessalonicenses', abbrev: '2Ts', testament: 'NT', chaptersCount: 3, orderIndex: 53 },
  { id: 54, name: '1 Timóteo', abbrev: '1Tm', testament: 'NT', chaptersCount: 6, orderIndex: 54 },
  { id: 55, name: '2 Timóteo', abbrev: '2Tm', testament: 'NT', chaptersCount: 4, orderIndex: 55 },
  { id: 56, name: 'Tito', abbrev: 'Tt', testament: 'NT', chaptersCount: 3, orderIndex: 56 },
  { id: 57, name: 'Filemom', abbrev: 'Fm', testament: 'NT', chaptersCount: 1, orderIndex: 57 },
  { id: 58, name: 'Hebreus', abbrev: 'Hb', testament: 'NT', chaptersCount: 13, orderIndex: 58 },
  { id: 59, name: 'Tiago', abbrev: 'Tg', testament: 'NT', chaptersCount: 5, orderIndex: 59 },
  { id: 60, name: '1 Pedro', abbrev: '1Pe', testament: 'NT', chaptersCount: 5, orderIndex: 60 },
  { id: 61, name: '2 Pedro', abbrev: '2Pe', testament: 'NT', chaptersCount: 3, orderIndex: 61 },
  { id: 62, name: '1 João', abbrev: '1Jo', testament: 'NT', chaptersCount: 5, orderIndex: 62 },
  { id: 63, name: '2 João', abbrev: '2Jo', testament: 'NT', chaptersCount: 1, orderIndex: 63 },
  { id: 64, name: '3 João', abbrev: '3Jo', testament: 'NT', chaptersCount: 1, orderIndex: 64 },
  { id: 65, name: 'Judas', abbrev: 'Jd', testament: 'NT', chaptersCount: 1, orderIndex: 65 },
  { id: 66, name: 'Apocalipse', abbrev: 'Ap', testament: 'NT', chaptersCount: 22, orderIndex: 66 },
];

export const BOOKS_BY_ID = new Map<number, BibleBook>(
  CANONICAL_BOOKS.map((b) => [b.id, b])
);
