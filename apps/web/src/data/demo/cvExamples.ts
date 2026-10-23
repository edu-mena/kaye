import type { CvExample } from '../types'

// DEMO DATA. Fictional people, written by the team (docs/arquitetura.md, 5.5):
// never a real person's CV.
export const CV_EXAMPLES: CvExample[] = [
  {
    id: 'frontend-primeiro-emprego',
    careerSlug: 'desenvolvedor-frontend',
    seniority: 'primeiro_emprego',
    cv: {
      name: 'Joana Manuel',
      headline: 'Desenvolvedora Frontend em início de carreira',
      contact: 'joana.manuel@exemplo.ao · Luanda · github.com/exemplo',
      summary:
        'Técnica média de Informática, com um curso de React e três projetos publicados. Procuro o primeiro emprego numa equipa onde possa crescer a construir ecrãs rápidos e fáceis de usar.',
      experience: [
        {
          id: 'e1',
          title: 'Estágio em desenvolvimento web',
          place: 'Agência digital (exemplo)',
          period: '2025 · 4 meses',
          description:
            'Construí 6 páginas de um site de uma escola, a partir de desenhos no Figma, e reduzi o tempo de carregamento para metade.',
        },
      ],
      education: [
        {
          id: 'e2',
          title: 'Curso de Desenvolvimento Web com React',
          place: 'Academia Digital Exemplo',
          period: '2025',
          description: 'Projeto final: app de marcações para um salão de beleza.',
        },
        {
          id: 'e3',
          title: 'Técnico Médio de Informática',
          place: 'Instituto Médio Politécnico Exemplo',
          period: '2020 – 2024',
          description: '',
        },
      ],
      projects: [
        {
          id: 'e4',
          title: 'Kitanda Online',
          place: 'Projeto pessoal',
          period: '2025',
          description:
            'Catálogo de uma loja de bairro com pesquisa e carrinho. React, API pública, publicado na web.',
        },
      ],
      skills: ['HTML e CSS', 'JavaScript', 'React', 'Git', 'Design responsivo', 'Figma (básico)'],
      languages: ['Português (nativo)', 'Inglês (leitura técnica)'],
    },
    notes: {
      summary:
        'Diz o que a pessoa já tem e o que procura, em duas frases. Nada de "sou dinâmica e proativa".',
      experience:
        'Um estágio curto vale muito quando mostra um resultado concreto: 6 páginas, metade do tempo.',
      projects:
        'Sem muita experiência, os projetos são a prova. Cada um diz o que é, com que tecnologia e onde se vê.',
      skills: 'Só competências que aparecem nas vagas e que consegue demonstrar numa entrevista.',
    },
  },
  {
    id: 'dados-junior',
    careerSlug: 'analista-de-dados',
    seniority: 'junior',
    cv: {
      name: 'Edson Cassoma',
      headline: 'Analista de Dados Júnior',
      contact: 'edson.cassoma@exemplo.ao · Luanda',
      summary:
        'Licenciado em Economia, com um ano a analisar vendas num banco. Uso SQL e Power BI para responder a perguntas de negócio e explico os resultados sem jargão.',
      experience: [
        {
          id: 'e5',
          title: 'Analista de Dados Júnior',
          place: 'Banco (exemplo)',
          period: '2024 – presente',
          description:
            'Criei o painel semanal de vendas por agência, usado por 40 gestores. Encontrei um erro que duplicava 3% dos clientes.',
        },
      ],
      education: [
        {
          id: 'e6',
          title: 'Licenciatura em Economia',
          place: 'Universidade Pública Exemplo',
          period: '2019 – 2023',
          description: '',
        },
        {
          id: 'e7',
          title: 'Análise de Dados com Excel, SQL e Power BI',
          place: 'Academia Digital Exemplo',
          period: '2023',
          description: '',
        },
      ],
      projects: [
        {
          id: 'e8',
          title: 'Inflação em Angola, 2015–2025',
          place: 'Projeto pessoal, dados do INE',
          period: '2024',
          description: 'Painel público que compara a inflação por província.',
        },
      ],
      skills: ['SQL', 'Power BI', 'Excel avançado', 'Estatística básica', 'Python (pandas)'],
      languages: ['Português (nativo)', 'Inglês (intermédio)'],
    },
    notes: {
      summary:
        'Junta a formação, a experiência e a forma de trabalhar. Quem lê percebe logo o que esta pessoa resolve.',
      experience:
        'Números concretos ("40 gestores", "3% dos clientes") convencem mais do que listas de tarefas.',
      projects: 'Um projeto com dados angolanos mostra iniciativa e conhecimento do mercado local.',
    },
  },
  {
    id: 'ux-primeiro-emprego',
    careerSlug: 'designer-ui-ux',
    seniority: 'primeiro_emprego',
    cv: {
      name: 'Ana Kiala',
      headline: 'Designer UI/UX',
      contact: 'ana.kiala@exemplo.ao · Luanda · portfolio.exemplo.ao',
      summary:
        'Fiz o curso de Design UI/UX e redesenhei a app de uma associação de estudantes, testada com 12 pessoas. Gosto de transformar processos confusos em passos simples.',
      experience: [],
      education: [
        {
          id: 'e9',
          title: 'Design UI/UX',
          place: 'Academia Digital Exemplo',
          period: '2025',
          description: 'Pesquisa com utilizadores, Figma, protótipos e testes.',
        },
      ],
      projects: [
        {
          id: 'e10',
          title: 'App da Associação de Estudantes',
          place: 'Projeto voluntário',
          period: '2025',
          description:
            'A inscrição em atividades passou de 7 para 3 passos; 10 das 12 pessoas testadas concluíram sem ajuda.',
        },
        {
          id: 'e11',
          title: 'Marcações num centro de saúde',
          place: 'Caso de estudo',
          period: '2025',
          description: 'Pesquisa com 8 utentes e protótipo de marcação por WhatsApp.',
        },
      ],
      skills: ['Figma', 'Pesquisa com utilizadores', 'Prototipagem', 'Design visual', 'Acessibilidade'],
      languages: ['Português (nativo)', 'Francês (intermédio)'],
    },
    notes: {
      summary:
        'Sem experiência formal, o resumo aponta logo para o melhor projeto e para o resultado dos testes.',
      projects: 'Em design, o portfólio é o CV: cada caso mostra o problema, o processo e o que mudou.',
      skills: 'Mistura ferramentas (Figma) com métodos (pesquisa): as vagas pedem as duas coisas.',
    },
  },
]
