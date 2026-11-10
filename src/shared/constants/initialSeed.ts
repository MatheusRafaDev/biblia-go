export interface SeedVerse {
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

export const INITIAL_SEED_VERSES: SeedVerse[] = [
  // Gênesis 1 (1-10)
  { book: 1, chapter: 1, verse: 1, text: 'No princípio criou Deus os céus e a terra.' },
  { book: 1, chapter: 1, verse: 2, text: 'E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.' },
  { book: 1, chapter: 1, verse: 3, text: 'E disse Deus: Haja luz; e houve luz.' },
  { book: 1, chapter: 1, verse: 4, text: 'E viu Deus que era boa a luz; e fez Deus separação entre a luz e as trevas.' },
  { book: 1, chapter: 1, verse: 5, text: 'E Deus chamou à luz Dia; e às trevas chamou Noite. E foi a tarde e a manhã, o dia primeiro.' },
  { book: 1, chapter: 1, verse: 6, text: 'E disse Deus: Haja uma expansão no meio das águas, e haja separação entre águas e águas.' },
  { book: 1, chapter: 1, verse: 7, text: 'E fez Deus a expansão, e fez separação entre as águas que estavam debaixo da expansão e as águas que estavam sobre a expansão; e assim foi.' },
  { book: 1, chapter: 1, verse: 8, text: 'E chamou Deus à expansão Céus, e foi a tarde e a manhã, o dia segundo.' },
  { book: 1, chapter: 1, verse: 9, text: 'E disse Deus: Ajuntem-se as águas debaixo dos céus num só lugar; e apareça a porção seca; e assim foi.' },
  { book: 1, chapter: 1, verse: 10, text: 'E chamou Deus à porção seca Terra; e ao ajuntamento das águas chamou Mares; e viu Deus que era bom.' },

  // Salmos 23
  { book: 19, chapter: 23, verse: 1, text: 'O Senhor é o meu pastor, nada me faltará.' },
  { book: 19, chapter: 23, verse: 2, text: 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranqüilas.' },
  { book: 19, chapter: 23, verse: 3, text: 'Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.' },
  { book: 19, chapter: 23, verse: 4, text: 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.' },
  { book: 19, chapter: 23, verse: 5, text: 'Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.' },
  { book: 19, chapter: 23, verse: 6, text: 'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias.' },

  // João 1 (1-5)
  { book: 43, chapter: 1, verse: 1, text: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.' },
  { book: 43, chapter: 1, verse: 2, text: 'Ele estava no princípio com Deus.' },
  { book: 43, chapter: 1, verse: 3, text: 'Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez.' },
  { book: 43, chapter: 1, verse: 4, text: 'Nele estava a vida, e a vida era a luz dos homens.' },
  { book: 43, chapter: 1, verse: 5, text: 'E a luz resplandece nas trevas, e as trevas não a compreenderam.' },
];
