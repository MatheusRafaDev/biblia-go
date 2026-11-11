export interface QuizQuestion {
  id: string;
  category: 'geral' | 'antigo_testamento' | 'novo_testamento' | 'personagens';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reference: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'antigo_testamento',
    question: 'Quantos dias durou a chuva do grande dilúvio na época de Noé?',
    options: ['7 dias', '40 dias e 40 noites', '100 dias', '150 dias'],
    correctIndex: 1,
    explanation: 'A chuva caiu sobre a terra durante 40 dias e 40 noites.',
    reference: 'Gênesis 7:12',
  },
  {
    id: 'q2',
    category: 'antigo_testamento',
    question: 'Qual foi o sinal da aliança de Deus com Noé para nunca mais destruir a terra com água?',
    options: ['Uma pomba branca', 'Um ramo de oliveira', 'O arco-íris nas nuvens', 'Uma coluna de fogo'],
    correctIndex: 2,
    explanation: 'Deus colocou o arco nas nuvens como sinal da sua aliança eterna com a Terra.',
    reference: 'Gênesis 9:13',
  },
  {
    id: 'q3',
    category: 'personagens',
    question: 'Quem liderou os israelitas na travessia do Mar Vermelho?',
    options: ['Abraão', 'Josué', 'Moisés', 'Arão'],
    correctIndex: 2,
    explanation: 'Moisés estendeu a mão sobre o mar, e o Senhor abriu um caminho seco no meio das águas.',
    reference: 'Êxodo 14:21',
  },
  {
    id: 'q4',
    category: 'personagens',
    question: 'Quem foi o pastor de ovelhas que derrotou o gigante Golias?',
    options: ['Saul', 'Salomão', 'Sansão', 'Davi'],
    correctIndex: 3,
    explanation: 'Davi enfrentou Golias em nome do Senhor dos Exércitos usando apenas uma funda e pedras do ribeiro.',
    reference: '1 Samuel 17:49',
  },
  {
    id: 'q5',
    category: 'antigo_testamento',
    question: 'Qual rei pediu a Deus sabedoria em vez de riquezas ou longa vida?',
    options: ['Davi', 'Salomão', 'Ezequias', 'Josias'],
    correctIndex: 1,
    explanation: 'Salomão pediu um coração compreensivo para governar o povo, agradando profundamente a Deus.',
    reference: '1 Reis 3:9-10',
  },
  {
    id: 'q6',
    category: 'novo_testamento',
    question: 'Onde Jesus nasceu segundo as profecias e os evangelhos?',
    options: ['Nazaré', 'Jerusalém', 'Belém da Judeia', 'Cafarnaum'],
    correctIndex: 2,
    explanation: 'Jesus nasceu em Belém da Judeia, cumprindo a profecia de Miquéias 5:2.',
    reference: 'Mateus 2:1',
  },
  {
    id: 'q7',
    category: 'novo_testamento',
    question: 'Qual foi o primeiro milagre público registrado realizado por Jesus?',
    options: [
      'Multiplicação dos pães',
      'Cura de um cego de nascença',
      'Transformação de água em vinho nas bodas de Caná',
      'Ressurreição de Lázaro',
    ],
    correctIndex: 2,
    explanation: 'Nas bodas de Caná da Galileia, Jesus transformou água em vinho, manifestando sua glória.',
    reference: 'João 2:11',
  },
  {
    id: 'q8',
    category: 'novo_testamento',
    question: 'Quantos discípulos Jesus escolheu para serem seus apóstolos mais próximos?',
    options: ['7', '10', '12', '70'],
    correctIndex: 2,
    explanation: 'Jesus chamou doze discípulos para estarem com Ele e serem enviados a pregar.',
    reference: 'Marcos 3:14',
  },
  {
    id: 'q9',
    category: 'personagens',
    question: 'Qual discípulo andou sobre as águas ao encontro de Jesus?',
    options: ['Pedro', 'João', 'Tiago', 'André'],
    correctIndex: 0,
    explanation: 'Pedro desceu do barco e andou por sobre as águas para ir até Jesus.',
    reference: 'Mateus 14:29',
  },
  {
    id: 'q10',
    category: 'novo_testamento',
    question: 'Quem se converteu no caminho de Damasco após ver uma luz brilhante do céu?',
    options: ['Estêvão', 'Saulo de Tarso (Paulo)', 'Cornélio', 'Timóteo'],
    correctIndex: 1,
    explanation: 'Saulo, perseguidor da igreja, foi confrontado por Jesus ressurreto e tornou-se o grande apóstolo Paulo.',
    reference: 'Atos 9:3-6',
  },
];

