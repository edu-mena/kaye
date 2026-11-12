import type { Course } from './types'

// The Kursos catalogue. Only English A1 for now; Programação is announced as "Em breve".

export const ENGLISH_A1: Course = {
  id: 'ingles-a1',
  title: 'Inglês A1',
  level: 'A1 (QECR)',
  subtitle: 'O inglês básico, explicado como num livro: regra, exemplos, exercícios e chave.',
  audience:
    'Para quem está a começar ou nunca estudou inglês com método: estudantes, quem procura o primeiro emprego e quem quer ler documentação técnica.',
  goals: [
    'Apresentar-te e falar de outras pessoas com o verbo to be.',
    'Usar pronomes e possessivos sem confundir he/his, she/her.',
    'Fazer e responder a perguntas simples sobre ti, a tua família e o teu trabalho.',
    'Ler frases curtas do dia a dia e escrever as tuas.',
  ],
  units: [
    {
      id: 'u1',
      number: 1,
      title: 'O verbo to be',
      summary: 'I am, you are, she is: afirmativa, negativa e perguntas.',
      load: () => import('./english-a1/unit1').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'I am, you are, he is', estimatedMinutes: 15 },
        { id: 'l2', title: 'A negativa e as contrações', estimatedMinutes: 15 },
        { id: 'l3', title: 'Perguntas e respostas curtas', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'u2',
      number: 2,
      title: 'Pronomes e possessivos',
      summary: 'me, him, her; my, your, his; mine, yours e o ’s.',
      load: () => import('./english-a1/unit2').then((module) => module.default),
      lessons: [
        { id: 'l1', title: 'Pronomes de complemento: me, him, us', estimatedMinutes: 15 },
        { id: 'l2', title: 'Possessivos: my, your, his, her', estimatedMinutes: 15 },
        { id: 'l3', title: 'mine, yours e o ’s do possessivo', estimatedMinutes: 20 },
      ],
    },
    { id: 'u3', number: 3, title: 'Artigos e plurais', summary: 'a, an, the; books, boxes, children.' },
    { id: 'u4', number: 4, title: 'Present simple', summary: 'I work, she works, do you work?' },
    { id: 'u5', number: 5, title: 'Rotina e horas', summary: 'What time is it? I get up at six.' },
    {
      id: 'u6',
      number: 6,
      title: 'There is / there are',
      summary: 'Descrever lugares: there is a bank near here.',
    },
    { id: 'u7', number: 7, title: 'Can', summary: 'Capacidades e pedidos: I can drive. Can you help me?' },
    { id: 'u8', number: 8, title: 'O passado de to be', summary: 'was, were: I was at school yesterday.' },
  ],
  loadExam: () => import('./english-a1/exam').then((module) => module.default),
  credits: [
    {
      title: 'English Grammar (Wikibooks)',
      author: 'Contribuidores do Wikibooks',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wikibooks.org/wiki/English_Grammar',
      use: 'Ordem dos temas e formulação das regras do to be e dos pronomes, adaptadas e traduzidas.',
    },
    {
      title: 'An English Grammar (W. M. Baskervill e J. W. Sewell, 1896)',
      author: 'Project Gutenberg',
      license: 'Domínio público',
      url: 'https://www.gutenberg.org/ebooks/search/?query=Baskervill+Sewell',
      use: 'Classificação dos pronomes pessoais e possessivos.',
    },
    {
      title: 'Wiktionary',
      author: 'Contribuidores do Wiktionary',
      license: 'CC BY-SA 4.0',
      url: 'https://en.wiktionary.org/',
      use: 'Confirmação de significados e formas contraídas.',
    },
  ],
}

export const KURSOS: Course[] = [ENGLISH_A1]

export function findCourse(id: string | undefined): Course | undefined {
  return KURSOS.find((course) => course.id === id)
}

/** "Concluir e seguir" walks this list: every written lesson, then each unit's review. */
export type Step = { unit: string; lesson: string }
export const REVIEW = 'revisao'

export function courseSteps(course: Course): Step[] {
  return course.units.flatMap((unit) =>
    unit.load
      ? (unit.lessons ?? [])
          .map((lesson): Step => ({ unit: unit.id, lesson: lesson.id }))
          .concat({ unit: unit.id, lesson: REVIEW })
      : [],
  )
}

export const stepKey = (step: Step) => `${step.unit}/${step.lesson}`
