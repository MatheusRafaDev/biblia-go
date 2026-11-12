export interface DailyVerse {
  id: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  theme: string;
  reflection: string;
  prayer: string;
}

export const DAILY_VERSES: DailyVerse[] = [
  {
    id: 'dv-1',
    bookId: 50, // Filipenses
    bookName: 'Filipenses',
    chapter: 4,
    verse: 6,
    text: 'Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças.',
    theme: 'Paz & Ansiedade',
    reflection: 'A ansiedade tenta roubar a tranquilidade do presente. Quando transformamos preocupações em oração acompanhada de gratidão, abrimos espaço para a paz que excede todo entendimento.',
    prayer: 'Senhor, entrego todas as minhas inquietações em Tuas mãos. Dá-me serenidade e gratidão no coração.',
  },
  {
    id: 'dv-2',
    bookId: 19, // Salmos
    bookName: 'Salmos',
    chapter: 23,
    verse: 1,
    text: 'O Senhor é o meu pastor, nada me faltará.',
    theme: 'Provisão & Cuidado',
    reflection: 'Ter o Senhor como pastor significa confiar que, mesmo diante de escassez aparente, Ele supre todas as necessidades essenciais da nossa alma e da nossa vida.',
    prayer: 'Pai celeste, descanso na Tua provisão e no Teu cuidado diário. Confio plenamente no Teu pastoreio.',
  },
  {
    id: 'dv-3',
    bookId: 43, // João
    bookName: 'João',
    chapter: 14,
    verse: 27,
    text: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.',
    theme: 'Paz Verdadeira',
    reflection: 'A paz de Cristo não depende da ausência de conflitos externos, mas da presença reconfortante do Espírito Santo em nosso interior.',
    prayer: 'Jesus, enche a minha mente com a Tua paz que o mundo não pode oferecer nem tirar.',
  },
  {
    id: 'dv-4',
    bookId: 23, // Isaías
    bookName: 'Isaías',
    chapter: 41,
    verse: 10,
    text: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.',
    theme: 'Coragem & Firmeza',
    reflection: 'O medo perde a força quando nos lembramos de quem caminha conosco. O Deus soberano não apenas nos ajuda, mas nos segura firmemente.',
    prayer: 'Deus Todo-Poderoso, renova minhas forças quando me sentir fraco e dissipa meus medos.',
  },
  {
    id: 'dv-5',
    bookId: 45, // Romanos
    bookName: 'Romanos',
    chapter: 8,
    verse: 28,
    text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.',
    theme: 'Propósito & Esperança',
    reflection: 'Até as situações difíceis e inesperadas são moldadas pelas mãos de Deus para forjar nosso caráter e cumprir Seus desígnios eternos.',
    prayer: 'Pai, mesmo sem entender todos os caminhos, confio que o Teu plano para mim é de vida e paz.',
  },
  {
    id: 'dv-6',
    bookId: 20, // Provérbios
    bookName: 'Provérbios',
    chapter: 3,
    verse: 5,
    text: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.',
    theme: 'Sabedoria & Confiança',
    reflection: 'Nossa visão humana é limitada pelo tempo presente. Ao submeter decisões a Deus, encontramos discernimento superior e caminhos seguros.',
    prayer: 'Senhor, guia meus passos e decisões de hoje; afasta o orgulho e ensina-me a confiar em Ti.',
  },
  {
    id: 'dv-7',
    bookId: 40, // Mateus
    bookName: 'Mateus',
    chapter: 6,
    verse: 33,
    text: 'Mas, buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.',
    theme: 'Prioridades & Fé',
    reflection: 'Alinhar prioridades diárias em torno do que agrada a Deus liberta nossa mente de ansiedades materiais desnecessárias.',
    prayer: 'Jesus, sê o primeiro em meus pensamentos, planos e escolhas do dia.',
  },
  {
    id: 'dv-8',
    bookId: 48, // Gálatas
    bookName: 'Gálatas',
    chapter: 5,
    verse: 22,
    text: 'Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança.',
    theme: 'Fruto Espiritual',
    reflection: 'As verdadeiras virtudes cristãs não nascem do esforço puramente humano, mas do transbordar da intimidade diária com o Espírito Santo.',
    prayer: 'Espírito Santo, faz florescer em mim o Teu amor, a paciência e a bondade para com o próximo.',
  },
  {
    id: 'dv-9',
    bookId: 19, // Salmos
    bookName: 'Salmos',
    chapter: 119,
    verse: 105,
    text: 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.',
    theme: 'Palavra Viva',
    reflection: 'As Escrituras iluminam não todo o futuro de uma só vez, mas cada passo necessário para caminhar em fidelidade hoje.',
    prayer: 'Senhor, que a Tua Palavra seja o guia das minhas escolhas e o discernimento dos meus passos.',
  },
  {
    id: 'dv-10',
    bookId: 58, // Hebreus
    bookName: 'Hebreus',
    chapter: 11,
    verse: 1,
    text: 'Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem.',
    theme: 'Fé Inabalável',
    reflection: 'Fé não é ausência de dúvidas, mas a decisão firme de confiar na fidelidade de Deus mesmo antes de enxergar o resultado.',
    prayer: 'Pai, fortalece a minha fé quando o horizonte parecer incerto. Firmo meus olhos em Ti.',
  },
  {
    id: 'dv-11',
    bookId: 46, // 1 Coríntios
    bookName: '1 Coríntios',
    chapter: 13,
    verse: 13,
    text: 'Agora, pois, permanecem a fé, a esperança e o amor, estes três, mas o maior destes é o amor.',
    theme: 'Amor Fraternal',
    reflection: 'Todas as conquistas e talentos humanos passarão, mas o amor sincero refletido na vida do outro permanece para a eternidade.',
    prayer: 'Senhor, capacita-me a amar as pessoas ao meu redor com generosidade e graça sincera.',
  },
  {
    id: 'dv-12',
    bookId: 24, // Jeremias
    bookName: 'Jeremias',
    chapter: 29,
    verse: 11,
    text: 'Porque eu bem sei os pensamentos que tenho a respeito de vós, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.',
    theme: 'Esperança Futura',
    reflection: 'Mesmo nos momentos em que nos sentimos perdidos, o Senhor tem projetos sólidos de renovação e esperança para nossa caminhada.',
    prayer: 'Deus de bondade, descanso nos Teus propósitos perfeitos e renovo minha esperança.',
  },
];

