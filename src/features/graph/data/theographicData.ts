export interface CharacterNode {
  id: string;
  name: string;
  title: string;
  testament: 'OT' | 'NT';
  bio: string;
  x: number;
  y: number;
  color: string;
  era?: string;
  symbolLabel?: string;
  keyVerses: {
    bookId: number;
    bookName: string;
    chapter: number;
    verse: number;
    text: string;
  }[];
}

export interface CharacterEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'pai_de' | 'filho_de' | 'irmao_de';
  label: string;
}

export const THEOGRAPHIC_CHARACTERS: CharacterNode[] = [
  {
    id: 'adao',
    name: 'Adão',
    title: 'O Primeiro Homem',
    testament: 'OT',
    era: 'A Criação',
    symbolLabel: 'Árvore da Vida & Éden',
    bio: 'Criado à imagem e semelhança de Deus, colocado no Jardim do Éden para lavrar e guardar.',
    x: 200,
    y: 80,
    color: '#BBDEFB',
    keyVerses: [
      {
        bookId: 1,
        bookName: 'Gênesis',
        chapter: 1,
        verse: 27,
        text: 'E criou Deus o homem à sua imagem; à imagem de Deus o criou; homem e mulher os criou.',
      },
    ],
  },
  {
    id: 'sete',
    name: 'Sete',
    title: 'Filho da Promessa de Adão',
    testament: 'OT',
    era: 'Antediluviano',
    symbolLabel: 'Altar & Invocação',
    bio: 'Nascido após a morte de Abel; em seus dias começou-se a invocar o nome do Senhor.',
    x: 200,
    y: 190,
    color: '#C8E6C9',
    keyVerses: [
      {
        bookId: 1,
        bookName: 'Gênesis',
        chapter: 4,
        verse: 26,
        text: 'E a Sete mesmo também nasceu um filho; e chamou o seu nome Enos; então se começou a invocar o nome do Senhor.',
      },
    ],
  },
  {
    id: 'noe',
    name: 'Noé',
    title: 'Homem Justo e Íntegro',
    testament: 'OT',
    era: 'O Dilúvio',
    symbolLabel: 'Arca & Arco-Íris',
    bio: 'Construiu a arca conforme a ordem do Senhor para preservação da vida diante do dilúvio.',
    x: 200,
    y: 300,
    color: '#FFF59D',
    keyVerses: [
      {
        bookId: 1,
        bookName: 'Gênesis',
        chapter: 6,
        verse: 9,
        text: 'Noé era homem justo e perfeito em suas gerações; Noé andava com Deus.',
      },
    ],
  },
  {
    id: 'abraao',
    name: 'Abraão',
    title: 'O Pai da Fé',
    testament: 'OT',
    era: 'Patriarcas',
    symbolLabel: 'Estrelas da Promessa',
    bio: 'Chamado por Deus para sair de Ur dos Caldeus para a terra prometida. Em sua semente todas as famílias são abençoadas.',
    x: 200,
    y: 420,
    color: '#FFCCBC',
    keyVerses: [
      {
        bookId: 1,
        bookName: 'Gênesis',
        chapter: 12,
        verse: 2,
        text: 'E far-te-ei uma grande nação, e abençoar-te-ei e engrandecerei o teu nome; e tu serás uma bênção.',
      },
    ],
  },
  {
    id: 'isaque',
    name: 'Isaque',
    title: 'O Filho da Aliança',
    testament: 'OT',
    era: 'Patriarcas',
    symbolLabel: 'Cordeiro do Moriá & Poço',
    bio: 'Filho de Abraão e Sara nascido na velhice. Pai de Jacó e Esaú.',
    x: 200,
    y: 540,
    color: '#E1BEE7',
    keyVerses: [
      {
        bookId: 1,
        bookName: 'Gênesis',
        chapter: 21,
        verse: 3,
        text: 'E Abraão pôs no filho que lhe nascera, que Sara lhe dera, o nome de Isaque.',
      },
    ],
  },
  {
    id: 'jaco',
    name: 'Jacó (Israel)',
    title: 'Patriarca das 12 Tribos',
    testament: 'OT',
    era: 'Patriarcas',
    symbolLabel: 'Escada Celestial de Betel',
    bio: 'Lutou com o anjo em Peniel e seu nome foi mudado para Israel. Seus doze filhos deram origem às doze tribos.',
    x: 200,
    y: 660,
    color: '#BBDEFB',
    keyVerses: [
      {
        bookId: 1,
        bookName: 'Gênesis',
        chapter: 32,
        verse: 28,
        text: 'Então disse: Não te chamarás mais Jacó, mas Israel; pois como príncipe lutaste com Deus e com os homens, e prevaleceste.',
      },
    ],
  },
  {
    id: 'juda',
    name: 'Judá',
    title: 'A Linhagem Real',
    testament: 'OT',
    era: 'Tribos de Israel',
    symbolLabel: 'Leão de Judá & Cetro Real',
    bio: 'Quarto filho de Jacó. De sua descendência viriam os reis de Israel e o Messias (O Leão da Tribo de Judá).',
    x: 200,
    y: 780,
    color: '#C8E6C9',
    keyVerses: [
      {
        bookId: 1,
        bookName: 'Gênesis',
        chapter: 49,
        verse: 10,
        text: 'O cetro não se arredará de Judá, nem o legislador dentre seus pés, até que venha Siló; e a ele se congregarão os povos.',
      },
    ],
  },
  {
    id: 'moises',
    name: 'Moisés',
    title: 'O Libertador e Legislador',
    testament: 'OT',
    era: 'O Êxodo',
    symbolLabel: 'Tábuas da Lei & Sarça',
    bio: 'Conduziu Israel na saída do Egito, recebeu as Tábuas da Lei no Monte Sinai e escreveu o Pentateuco.',
    x: 70,
    y: 660,
    color: '#FEF8E7',
    keyVerses: [
      {
        bookId: 2,
        bookName: 'Êxodo',
        chapter: 3,
        verse: 10,
        text: 'Vem agora, pois, e eu te enviarei a Faraó para que tires o meu povo (os filhos de Israel) do Egito.',
      },
    ],
  },
  {
    id: 'davi',
    name: 'Davi',
    title: 'O Homem Segundo o Coração de Deus',
    testament: 'OT',
    era: 'Reino Unido',
    symbolLabel: 'Harpa dos Salmos & Coroa',
    bio: 'Segundo rei de Israel, unificador do reino, salmista de Israel. Deus prometeu que seu trono seria estabelecido para sempre.',
    x: 200,
    y: 900,
    color: '#FFE082',
    keyVerses: [
      {
        bookId: 9,
        bookName: '1 Samuel',
        chapter: 16,
        verse: 13,
        text: 'Então Samuel tomou o chifre do azeite, e ungiu-o no meio de seus irmãos; e desde aquele dia em diante o Espírito do Senhor se apoderou de Davi.',
      },
    ],
  },
  {
    id: 'salomao',
    name: 'Salomão',
    title: 'O Rei Sábio',
    testament: 'OT',
    era: 'Reino Unido',
    symbolLabel: 'O Templo Sagrado & Sabedoria',
    bio: 'Filho de Davi e Bate-Seba. Construiu o Primeiro Templo de Jerusalém e reinou no apogeu da paz e prosperidade de Israel.',
    x: 200,
    y: 1020,
    color: '#D1C4E9',
    keyVerses: [
      {
        bookId: 11,
        bookName: '1 Reis',
        chapter: 4,
        verse: 29,
        text: 'E deu Deus a Salomão sabedoria, e muitíssimo entendimento, e largueza de coração, como a areia que está na praia do mar.',
      },
    ],
  },
  {
    id: 'jesus',
    name: 'Jesus Cristo',
    title: 'O Messias e Salvador',
    testament: 'NT',
    era: 'Evangelhos & Graça',
    symbolLabel: 'A Santa Cruz & Cordeiro',
    bio: 'Filho de Deus e descendente de Davi segundo a carne. O Cordeiro de Deus que tira o pecado do mundo e ressuscitou ao terceiro dia.',
    x: 200,
    y: 1160,
    color: '#3B6EF5',
    keyVerses: [
      {
        bookId: 40,
        bookName: 'Mateus',
        chapter: 1,
        verse: 1,
        text: 'Livro da genealogia de Jesus Cristo, filho de Davi, filho de Abraão.',
      },
      {
        bookId: 43,
        bookName: 'João',
        chapter: 1,
        verse: 14,
        text: 'E o Verbo se fez carne, e habitou entre nós, e vimos a sua glória, como a glória do unigênito do Pai, cheio de graça e de verdade.',
      },
    ],
  },
];

export const THEOGRAPHIC_EDGES: CharacterEdge[] = [
  { id: 'e1', source: 'adao', target: 'sete', relationship: 'pai_de', label: 'Pai de' },
  { id: 'e2', source: 'sete', target: 'noe', relationship: 'pai_de', label: 'Linhagem de' },
  { id: 'e3', source: 'noe', target: 'abraao', relationship: 'pai_de', label: 'Linhagem de' },
  { id: 'e4', source: 'abraao', target: 'isaque', relationship: 'pai_de', label: 'Pai de' },
  { id: 'e5', source: 'isaque', target: 'jaco', relationship: 'pai_de', label: 'Pai de' },
  { id: 'e6', source: 'jaco', target: 'juda', relationship: 'pai_de', label: 'Pai de' },
  { id: 'e7', source: 'juda', target: 'davi', relationship: 'pai_de', label: 'Linhagem de' },
  { id: 'e8', source: 'davi', target: 'salomao', relationship: 'pai_de', label: 'Pai de' },
  { id: 'e9', source: 'salomao', target: 'jesus', relationship: 'pai_de', label: 'Genealogia até' },
];

