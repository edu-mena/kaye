// Source language. en.ts and fr.ts must have exactly the same keys (TypeScript checks it).
export const pt = {
  app: {
    tagline: 'Descobre o teu lugar na tecnologia',
  },
  nav: {
    home: 'Início',
    explore: 'Explorar',
    jobs: 'Vagas',
    cv: 'CV',
    profile: 'Perfil',
  },
  home: {
    greeting: 'Olá! Este é o Kayé',
    intro:
      'Descobre as profissões tech que combinam contigo, quanto custa chegar lá e quem está a contratar em Luanda.',
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
  explore: {
    title: 'Explorar',
    body: 'Carreiras, rankings, instituições e cursos.',
  },
  jobs: {
    title: 'Vagas',
    body: 'Vagas tech recentes, com o link para a vaga original.',
  },
  cv: {
    title: 'CV',
    body: 'Cria o teu CV por secções e descarrega-o em PDF.',
  },
  profile: {
    title: 'Perfil',
    language: 'Idioma',
  },
}

export type Messages = typeof pt
