import { AppData } from './types';

export const INITIAL_DATA: AppData = {
  modules: [
    {
      id: 'm1',
      title: 'Introdução ao Mercado Financeiro',
      description: 'Conceitos básicos sobre o funcionamento do mercado e principais ativos.',
      videos: [
        { id: 'v1', title: 'O que é a Bolsa?', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
      ],
      materials: [
        { id: 'mat1', title: 'Guia do Iniciante PDF', type: 'pdf', url: '#' }
      ],
      quizzes: [
        {
          id: 'q1',
          title: 'Quiz de Nivelamento',
          questions: [
            {
              id: 'q1_1',
              question: 'Qual o papel da CVM?',
              options: ['Regular o mercado', 'Vender ações', 'Emprestar dinheiro', 'Gerar lucro', 'Nenhuma das anteriores'],
              correctAnswerIndex: 0,
              explanation: 'A CVM é o órgão regulador do mercado de capitais no Brasil.'
            }
          ]
        }
      ]
    }
  ],
  cases: [],
  faq: [
    { id: 'f1', question: 'Como obtenho meu certificado?', answer: 'Você precisa completar 70% do módulo para liberar o certificado.' }
  ],
  library: [],
};
