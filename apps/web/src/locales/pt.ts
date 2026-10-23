// Source language. en.ts and fr.ts must have exactly the same keys (TypeScript checks it).
export const pt = {
  app: {
    tagline: 'Descobre o teu lugar na tecnologia',
  },
  nav: {
    home: 'Início',
    careers: 'Carreiras',
    training: 'Formação',
    cv: 'CV',
    profile: 'Perfil',
  },
  home: {
    greeting: 'Olá! Este é o Kayé',
    intro:
      'Descobre as profissões tech que combinam contigo, o que cada uma exige e o caminho para lá chegar.',
    testTitle: 'Teste vocacional',
    testBody:
      '42 perguntas, cerca de 8 minutos. Descobre o teu perfil e as 5 profissões que mais combinam contigo.',
  },
  status: {
    checking: 'A ligar ao servidor…',
    online: 'Ligado ao servidor',
    offline: 'Sem ligação ao servidor',
  },
  comingSoon: 'Em breve',
  loading: 'A carregar…',
  careers: {
    title: 'Carreiras',
    body: 'O que cada profissão faz, o que exige e como lá chegar: estudos, formação e experiência.',
  },
  training: {
    title: 'Formação',
    body: 'As melhores instituições e cursos para cada profissão, com os critérios e os custos à vista.',
  },
  cv: {
    title: 'CV',
    body: 'Cria o teu CV e vê CVs modelo para cada profissão.',
  },
  profile: {
    title: 'Perfil',
    language: 'Idioma',
  },
}

export type Messages = typeof pt
