import type { CvExample } from '../types'

// DEMO DATA. Fictional people, written by the team (docs/arquitetura.md, 5.5):
// never a real person's CV. One ideal CV per path into each career.
export const CV_EXAMPLES: CvExample[] = [
  {
    id: 'frontend-primeiro-emprego',
    careerSlug: 'desenvolvedor-frontend',
    pathwayId: 'tecnica',
    seniority: 'primeiro_emprego',
    template: 'classico',
    why: 'Mostra o caminho técnico completo: o médio técnico, um curso curto e projetos publicados. Uma coluna e sem foto: os sistemas de recrutamento leem-no sem erros.',
    cv: {
      name: 'Joana Manuel',
      headline: 'Desenvolvedora Frontend em início de carreira',
      contact: 'joana.manuel@exemplo.ao · Luanda',
      links: ['github.com/exemplo-joana', 'joana.exemplo.dev'],
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
      certifications: [],
      skills: ['HTML e CSS', 'JavaScript', 'React', 'Git', 'Design responsivo', 'Figma (básico)'],
      languages: ['Português (nativo)', 'Inglês (leitura técnica)'],
    },
    notes: {
      summary:
        'Diz o que a pessoa já tem e o que procura, em duas frases. Nada de "sou dinâmica e proativa".',
      links: 'O GitHub e o site pessoal logo no topo: é o primeiro sítio onde um recrutador técnico vai.',
      experience:
        'Um estágio curto vale muito quando mostra um resultado concreto: 6 páginas, metade do tempo.',
      projects:
        'Sem muita experiência, os projetos são a prova. Cada um diz o que é, com que tecnologia e onde se vê.',
      skills: 'Só competências que aparecem nas vagas e que consegue demonstrar numa entrevista.',
    },
  },
  {
    id: 'frontend-autodidata',
    careerSlug: 'desenvolvedor-frontend',
    pathwayId: 'autodidata',
    seniority: 'primeiro_emprego',
    template: 'classico',
    why: 'Para quem aprendeu sozinho: o portfólio e o trabalho freelance fazem o papel do diploma. Os projetos vêm antes da formação, e não há foto nem elementos decorativos.',
    cv: {
      name: 'Kelson Domingos',
      headline: 'Desenvolvedor Frontend',
      contact: 'kelson.domingos@exemplo.ao · Luanda',
      links: ['github.com/exemplo-kelson', 'kelson.exemplo.dev'],
      summary:
        'Aprendi sozinho, com cursos online e muita prática. Tenho três projetos publicados, um deles usado todos os dias por uma lavandaria do Cazenga.',
      experience: [
        {
          id: 'e12',
          title: 'Desenvolvedor Frontend (freelance)',
          place: 'Pequenos negócios em Luanda',
          period: '2024 – presente · 1 ano',
          description:
            'Fiz 4 sites para negócios locais. O da lavandaria recebe 30 pedidos por semana pelo telemóvel.',
        },
      ],
      education: [
        {
          id: 'e13',
          title: 'Ensino médio (12.ª classe)',
          place: 'Escola Secundária Exemplo',
          period: '2021',
          description: '',
        },
      ],
      projects: [
        {
          id: 'e14',
          title: 'Lavandaria Já',
          place: 'Cliente real, publicado',
          period: '2025',
          description:
            'Pedidos e acompanhamento da roupa por telemóvel. React, API REST, 30 pedidos por semana.',
        },
        {
          id: 'e15',
          title: 'Calculadora de propinas',
          place: 'Projeto pessoal, código aberto',
          period: '2024',
          description:
            'Compara o custo total de cursos em Luanda. JavaScript, 1 200 visitas no primeiro mês.',
        },
      ],
      certifications: [],
      skills: ['HTML e CSS', 'JavaScript', 'React', 'Git', 'Consumir APIs REST', 'Design responsivo'],
      languages: ['Português (nativo)', 'Inglês (leitura técnica)'],
    },
    notes: {
      summary: 'Sem licenciatura, o resumo vai direto ao que prova o valor: projetos publicados e usados.',
      links: 'Neste caminho os links são o diploma: GitHub e site pessoal, bem à vista.',
      projects:
        'Os projetos vêm antes da formação. Um cliente real e um número de uso pesam mais do que um certificado.',
      education: 'A formação é curta e honesta. Os cursos online não precisam de certificado para contar.',
    },
  },
  {
    id: 'frontend-universitario',
    careerSlug: 'desenvolvedor-frontend',
    pathwayId: 'universitaria',
    seniority: 'junior',
    template: 'classico',
    why: 'Para quem vem da universidade e já teve o primeiro emprego: a experiência abre o CV, e cada linha mostra uma função, uma empresa, uma duração e um resultado.',
    cv: {
      name: 'Mariana Sebastião',
      headline: 'Desenvolvedora Frontend Júnior',
      contact: 'mariana.sebastiao@exemplo.ao · Luanda',
      links: ['github.com/exemplo-mariana'],
      summary:
        'Licenciada em Engenharia Informática, com um ano numa equipa de produto de uma operadora. Trabalho com React e TypeScript e preocupo-me com a velocidade das páginas.',
      experience: [
        {
          id: 'e16',
          title: 'Desenvolvedora Frontend Júnior',
          place: 'Operadora de telecomunicações (exemplo)',
          period: '2024 – presente · 1 ano',
          description:
            'Refiz o ecrã de carregamento de saldo, usado por 200 mil pessoas por mês. Os erros de pagamento caíram 18%.',
        },
        {
          id: 'e17',
          title: 'Estágio profissional',
          place: 'Banco (exemplo)',
          period: '2023 · 6 meses',
          description: 'Construí componentes reutilizáveis para o portal interno, hoje usados em 5 ecrãs.',
        },
      ],
      education: [
        {
          id: 'e18',
          title: 'Licenciatura em Engenharia Informática',
          place: 'Universidade Pública Exemplo',
          period: '2019 – 2023',
          description: 'Projeto final: horários da universidade no telemóvel.',
        },
      ],
      projects: [],
      certifications: [],
      skills: ['React', 'TypeScript', 'Testes automáticos', 'Git', 'Acessibilidade'],
      languages: ['Português (nativo)', 'Inglês (intermédio)'],
    },
    notes: {
      experience: 'Função, empresa, duração e um resultado com número: tudo ligado à área.',
      education:
        'A licenciatura vem depois da experiência: com um ano de trabalho, o que fizeste conta mais.',
      skills: 'Menos competências, mas todas usadas no trabalho descrito acima.',
    },
  },
  {
    id: 'dados-junior',
    careerSlug: 'analista-de-dados',
    pathwayId: 'universitaria',
    seniority: 'junior',
    template: 'europeu',
    why: 'Formal e direto, como pedem os bancos e as empresas grandes. As secções à esquerda deixam encontrar tudo depressa, e cada experiência tem um número.',
    cv: {
      name: 'Edson Cassoma',
      headline: 'Analista de Dados Júnior',
      contact: 'edson.cassoma@exemplo.ao · Luanda',
      links: ['painel-inflacao.exemplo.ao'],
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
      certifications: [],
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
    id: 'dados-reconversao',
    careerSlug: 'analista-de-dados',
    pathwayId: 'reconversao',
    seniority: 'junior',
    template: 'europeu',
    why: 'Para quem muda de área: a experiência anterior fica, mas escrita do ponto de vista dos dados. A certificação ajuda a provar a mudança, sem ser obrigatória.',
    cv: {
      name: 'Rosa Tchimbali',
      headline: 'Analista de Dados',
      contact: 'rosa.tchimbali@exemplo.ao · Benguela',
      links: ['github.com/exemplo-rosa'],
      summary:
        'Trabalhei 4 anos em contabilidade e fiz a reconversão para dados com um curso de análise. Junto o conhecimento de finanças com SQL e Power BI.',
      experience: [
        {
          id: 'e19',
          title: 'Técnica de contabilidade',
          place: 'Distribuidora (exemplo)',
          period: '2020 – 2024 · 4 anos',
          description: 'Automatizei o fecho mensal com Excel e reduzi-o de 5 para 2 dias.',
        },
      ],
      education: [
        {
          id: 'e20',
          title: 'Curso de Análise de Dados',
          place: 'Academia Digital Exemplo',
          period: '2024',
          description: '',
        },
        {
          id: 'e21',
          title: 'Licenciatura em Contabilidade',
          place: 'Instituto Superior Exemplo',
          period: '2016 – 2020',
          description: '',
        },
      ],
      projects: [
        {
          id: 'e22',
          title: 'Preços dos combustíveis, 2020–2025',
          place: 'Projeto pessoal, dados públicos',
          period: '2025',
          description: 'Painel que mostra o efeito das subidas no custo de vida por província.',
        },
      ],
      certifications: [
        {
          id: 'e23',
          title: 'Power BI Data Analyst',
          place: 'Microsoft (exemplo)',
          period: '2025',
          description: '',
        },
      ],
      skills: ['SQL', 'Power BI', 'Excel avançado', 'Contabilidade e finanças'],
      languages: ['Português (nativo)', 'Inglês (intermédio)'],
    },
    notes: {
      experience:
        'A experiência anterior conta quando mostra o que transita para a nova área: aqui, a automação.',
      certifications: 'Neste caminho, a certificação ajuda a provar a mudança de área. Não é obrigatória.',
      skills:
        'O conhecimento de finanças entra como competência: é o que distingue de outros analistas júnior.',
    },
  },
  {
    id: 'ux-primeiro-emprego',
    careerSlug: 'designer-ui-ux',
    pathwayId: 'portfolio',
    seniority: 'primeiro_emprego',
    template: 'moderno',
    why: 'Em design, o CV também é uma peça de design: duas colunas, limpo, com o portfólio em destaque e casos que mostram o processo.',
    cv: {
      name: 'Ana Kiala',
      headline: 'Designer UI/UX',
      contact: 'ana.kiala@exemplo.ao · Luanda',
      links: ['portfolio.exemplo.ao', 'behance.net/exemplo-ana'],
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
      certifications: [],
      skills: ['Figma', 'Pesquisa com utilizadores', 'Prototipagem', 'Design visual', 'Acessibilidade'],
      languages: ['Português (nativo)', 'Francês (intermédio)'],
    },
    notes: {
      summary:
        'Sem experiência formal, o resumo aponta logo para o melhor projeto e para o resultado dos testes.',
      links: 'O link do portfólio é o mais importante do CV: tem de estar no topo e funcionar.',
      projects: 'Em design, o portfólio é o CV: cada caso mostra o problema, o processo e o que mudou.',
      skills: 'Mistura ferramentas (Figma) com métodos (pesquisa): as vagas pedem as duas coisas.',
    },
  },
  {
    id: 'ux-universitario',
    careerSlug: 'designer-ui-ux',
    pathwayId: 'universitaria',
    seniority: 'junior',
    template: 'moderno',
    why: 'Para quem vem da licenciatura em Design: a formação dá a base visual, e a primeira experiência numa agência mostra que sabe trabalhar com clientes e prazos.',
    cv: {
      name: 'Délcio Neto',
      headline: 'Designer UI/UX Júnior',
      contact: 'delcio.neto@exemplo.ao · Luanda',
      links: ['delcio.exemplo.design'],
      summary:
        'Licenciado em Design, há um ano numa agência digital. Desenho apps de serviços com equipas de produto e testo cada ecrã com quem o vai usar.',
      experience: [
        {
          id: 'e24',
          title: 'Designer UI/UX Júnior',
          place: 'Agência digital (exemplo)',
          period: '2024 – presente · 1 ano',
          description:
            'Redesenhei o registo de uma app de seguros: o abandono caiu de 40% para 22% depois de 3 rondas de testes.',
        },
      ],
      education: [
        {
          id: 'e25',
          title: 'Licenciatura em Design',
          place: 'Universidade Pública Exemplo',
          period: '2019 – 2023',
          description: 'Projeto final: sinalética acessível para um hospital.',
        },
      ],
      projects: [
        {
          id: 'e26',
          title: 'Horários de táxis coletivos',
          place: 'Caso de estudo',
          period: '2024',
          description: 'Entrevistas com 15 passageiros e protótipo testado em 3 paragens.',
        },
      ],
      certifications: [],
      skills: ['Figma', 'Design de interação', 'Testes de usabilidade', 'Design system', 'Ilustração'],
      languages: ['Português (nativo)', 'Inglês (intermédio)'],
    },
    notes: {
      experience: 'Um antes e depois com números mostra o impacto do design, não só o aspeto.',
      education: 'O projeto final entra quando mostra o que interessa à vaga: aqui, acessibilidade.',
    },
  },
]
