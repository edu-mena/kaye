import type { UnitContent } from '../types'

// Unit 2: starting a project. Adapted from Project Management, 2nd ed. (Adrienne Watt, BCcampus,
// CC BY 4.0), chapters on initiation and stakeholders; SMART after Wikipedia (CC BY-SA 4.0).
// The cases are Angolan and the amounts in Kz only illustrate.

const unit: UnitContent = {
  lessons: [
    {
      id: 'l1',
      title: 'O objetivo SMART',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'Porque é que o objetivo vem primeiro',
          body: [
            'Antes de comprar, contratar ou marcar datas, a equipa tem de saber exatamente o que quer alcançar. Um objetivo vago (“melhorar a escola”) não diz quando o projeto acabou nem se correu bem.',
            'Uma forma simples de escrever bons objetivos é a regra SMART. Cada letra é uma qualidade que o objetivo deve ter.',
          ],
        },
        {
          type: 'table',
          caption: 'As cinco letras',
          head: ['Letra', 'Quer dizer', 'Pergunta'],
          rows: [
            ['S', 'Específico (specific)', 'O que, exatamente?'],
            ['M', 'Mensurável (measurable)', 'Como vou contar ou medir?'],
            ['A', 'Atingível (achievable)', 'É possível com o que temos?'],
            ['R', 'Relevante (relevant)', 'Serve para o que realmente queremos?'],
            ['T', 'Temporal (time-bound)', 'Até quando?'],
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: 'Um objetivo SMART cabe numa frase e responde a: o quê, quanto e até quando. Se não consegues dizer, no fim, “cumprimos” ou “não cumprimos”, o objetivo ainda não é SMART.',
        },
        {
          type: 'examples',
          title: 'De vago a SMART',
          items: [
            {
              text: 'Vago: “Ajudar os alunos a encontrar emprego.”',
              note: 'SMART: “Realizar, até 15 de março, uma feira de emprego na escola com pelo menos 12 empresas e 300 alunos inscritos.”',
            },
            {
              text: 'Vago: “Vacinar o bairro.”',
              note: 'SMART: “Vacinar contra o sarampo 90% das crianças até 5 anos do bairro, em duas semanas de julho.”',
            },
            {
              text: 'Vago: “Abrir uma loja.”',
              note: 'SMART: “Abrir uma loja de acessórios de telemóvel no Kilamba até ao fim de setembro, gastando no máximo 3 000 000 Kz” (valor só para ilustrar).',
            },
          ],
        },
        {
          type: 'rule',
          title: 'Atenção ao A',
          body: 'Atingível não quer dizer fácil. Quer dizer possível com as pessoas, o dinheiro e o tempo que existem. Prometer 50 empresas numa feira organizada por quatro alunos em duas semanas não é atingível.',
        },
        {
          type: 'exercise',
          id: 'gp-u2l1-a',
          kind: 'choice',
          instruction: 'Qual objetivo é SMART?',
          items: [
            {
              prompt: 'Para a cantina da escola:',
              options: [
                'Ter uma cantina boa.',
                'Abrir a cantina até 30 de abril, a servir 150 almoços por dia.',
                'Melhorar a alimentação dos alunos.',
              ],
              answer: 1,
            },
            {
              prompt: 'Para um grupo de jovens no Cazenga:',
              options: [
                'Limpar o bairro.',
                'Fazer muitas limpezas.',
                'Retirar o lixo das 5 ruas junto à escola em 3 sábados de maio.',
              ],
              answer: 2,
            },
          ],
        },
        {
          type: 'exercise',
          id: 'gp-u2l1-b',
          kind: 'match',
          instruction: 'Que letra do SMART falta em cada objetivo?',
          items: [
            { left: '“Ter 300 visitantes na feira.” (sem data)', right: 'T: temporal' },
            { left: '“Organizar uma feira melhor.”', right: 'M: mensurável' },
            { left: '“Ter 500 empresas na feira da escola, este mês.”', right: 'A: atingível' },
          ],
        },
        {
          type: 'exercise',
          id: 'gp-u2l1-c',
          kind: 'gap',
          instruction: 'Completa.',
          items: [
            { prompt: 'Na regra SMART, o M quer dizer ___.', answers: ['mensurável'] },
            { prompt: 'Na regra SMART, o T quer dizer ___: tem uma data.', answers: ['temporal'] },
          ],
        },
        {
          type: 'summary',
          points: [
            'SMART: específico, mensurável, atingível, relevante, temporal.',
            'Um bom objetivo diz o quê, quanto e até quando.',
            'No fim, tem de dar para responder “cumprimos” ou “não cumprimos”.',
          ],
        },
      ],
    },
    {
      id: 'l2',
      title: 'As partes interessadas',
      estimatedMinutes: 20,
      blocks: [
        {
          type: 'text',
          title: 'Quem é afetado pelo projeto',
          body: [
            'Partes interessadas (stakeholders) são todas as pessoas, grupos ou organizações que afetam o projeto ou são afetados por ele. Não são só a equipa: são também quem paga, quem usa o resultado, quem autoriza e até quem pode ser contra.',
            'Esquecer uma parte interessada importante é das causas mais comuns de problemas: a administração municipal que não foi avisada, os vizinhos que se queixam do barulho, os pais que não sabiam da feira.',
          ],
        },
        {
          type: 'table',
          caption: 'Papéis que aparecem em quase todos os projetos',
          head: ['Papel', 'O que faz', 'Na feira de emprego'],
          rows: [
            ['Patrocinador (sponsor)', 'Apoia, decide e muitas vezes paga', 'A direção da escola'],
            [
              'Gestor do projeto (project manager)',
              'Planeia, coordena e responde pelo projeto',
              'A professora Teresa',
            ],
            ['Equipa (team)', 'Faz o trabalho', 'A comissão de alunos'],
            ['Beneficiários', 'Usam o resultado', 'Os alunos finalistas'],
            ['Outros', 'São afetados ou podem influenciar', 'Empresas, pais, vizinhos, administração'],
          ],
        },
        {
          type: 'rule',
          title: 'Poder e interesse',
          body: 'Para decidir a atenção que cada parte interessada merece, pergunta duas coisas: quanto poder tem sobre o projeto e quanto interesse tem nele. Muito poder e muito interesse: gerir de perto, envolver nas decisões. Muito poder e pouco interesse: manter satisfeito. Pouco poder e muito interesse: manter informado. Pouco poder e pouco interesse: acompanhar com pouco esforço.',
        },
        {
          type: 'case',
          title: 'A loja no Kilamba',
          body: [
            'O Paulo quer abrir uma loja de acessórios de telemóvel no Kilamba. Faz a lista das partes interessadas: ele próprio (gestor e patrocinador, porque o dinheiro é dele), o tio que lhe empresta parte do capital, o senhorio do espaço, a administração do condomínio, os fornecedores em Luanda, os futuros clientes e a loja concorrente na mesma rua.',
            'O senhorio e a administração do condomínio têm muito poder (podem não autorizar a obra) e pouco interesse: o Paulo fala com eles cedo e cumpre as regras, para os manter satisfeitos. O tio tem poder e interesse: o Paulo mostra-lhe o plano e dá notícias todas as semanas. Os futuros clientes têm interesse mas pouco poder sobre o projeto: o Paulo mantém-nos informados nas redes sociais sobre a data da abertura.',
          ],
        },
        {
          type: 'examples',
          title: 'Partes interessadas fáceis de esquecer',
          items: [
            {
              text: 'Os vizinhos da escola, no dia da feira (barulho, carros).',
              note: 'Pouco poder, algum interesse: avisar com antecedência.',
            },
            {
              text: 'O soba ou a comissão de moradores, na campanha de vacinação.',
              note: 'Têm influência sobre as famílias: envolver cedo.',
            },
            {
              text: 'Os funcionários da cozinha, na cantina nova.',
              note: 'Vão usar o espaço todos os dias: ouvir o que precisam.',
            },
          ],
        },
        {
          type: 'exercise',
          id: 'gp-u2l2-a',
          kind: 'match',
          instruction: 'Liga cada papel ao exemplo da campanha de vacinação.',
          items: [
            { left: 'Patrocinador', right: 'A direção municipal de saúde' },
            { left: 'Gestor do projeto', right: 'A enfermeira-chefe do centro' },
            { left: 'Equipa', right: 'Os vacinadores e ativistas' },
            { left: 'Beneficiários', right: 'As crianças e as famílias' },
          ],
        },
        {
          type: 'exercise',
          id: 'gp-u2l2-b',
          kind: 'choice',
          instruction: 'Como deves gerir cada parte interessada?',
          items: [
            {
              prompt: 'A direção da escola: decide tudo e quer muito que a feira corra bem.',
              options: ['Gerir de perto', 'Manter informada', 'Pouco esforço'],
              answer: 0,
            },
            {
              prompt: 'Os pais dos alunos: interessados, mas não decidem nada.',
              options: ['Gerir de perto', 'Manter informados', 'Manter satisfeitos'],
              answer: 1,
            },
            {
              prompt: 'A administração municipal: pode proibir o evento, mas pouco se importa com ele.',
              options: ['Manter satisfeita', 'Pouco esforço', 'Manter informada'],
              answer: 0,
            },
          ],
        },
        {
          type: 'summary',
          points: [
            'Partes interessadas: quem afeta o projeto ou é afetado por ele.',
            'Papéis: patrocinador, gestor, equipa, beneficiários e outros.',
            'Poder × interesse diz quanta atenção dar a cada uma.',
            'Faz a lista cedo: as esquecidas causam problemas tarde.',
          ],
        },
      ],
    },
    {
      id: 'l3',
      title: 'O termo de abertura',
      estimatedMinutes: 20,
      blocks: [
        {
          type: 'text',
          title: 'O documento que dá início',
          body: [
            'O termo de abertura (project charter) é um documento curto que autoriza o projeto a começar. Diz porquê, o quê, quem e com que limites. Quando o patrocinador o aprova, o gestor passa a ter autoridade para usar os recursos.',
            'Não precisa de ser longo: para um projeto pequeno, uma ou duas páginas chegam. O importante é que esteja escrito e aprovado, para que todos partam do mesmo acordo.',
          ],
        },
        {
          type: 'table',
          caption: 'O que um termo de abertura costuma ter',
          head: ['Parte', 'Responde a'],
          rows: [
            ['Justificação', 'Porque fazemos isto? Que problema resolve?'],
            ['Objetivo SMART', 'O que queremos alcançar, quanto e até quando?'],
            ['Âmbito resumido', 'O que entra e o que fica de fora?'],
            ['Entregas principais', 'O que vamos entregar?'],
            ['Prazo e marcos', 'Datas de início, fim e momentos importantes'],
            ['Orçamento estimado', 'Quanto, mais ou menos, vai custar?'],
            ['Partes interessadas', 'Patrocinador, gestor e outras principais'],
            ['Riscos e pressupostos', 'O que pode correr mal e o que damos como certo?'],
            ['Aprovação', 'Quem aprova, com data e assinatura'],
          ],
        },
        {
          type: 'rule',
          title: 'O que fica de fora também se escreve',
          body: 'Diz claramente o que não faz parte do projeto. “A cantina não inclui serviço de jantar” evita que, a meio, alguém conte com isso. É a forma mais barata de proteger o âmbito.',
        },
        {
          type: 'case',
          title: 'Termo de abertura: feira de emprego da Escola do Futungo',
          body: [
            'Justificação: muitos finalistas saem da escola sem nunca ter falado com uma empresa. Objetivo: realizar, a 15 de março, uma feira com pelo menos 12 empresas e 300 alunos inscritos.',
            'Âmbito: bancas das empresas, duas palestras e uma sala para simulação de entrevistas. Fica de fora: transporte dos alunos de outras escolas e refeições.',
            'Entregas: lista de empresas confirmadas, espaço montado, programa impresso e relatório final. Marcos: empresas confirmadas até 15 de fevereiro; inscrições fechadas a 8 de março.',
            'Orçamento estimado: 450 000 Kz para cadeiras, som e impressão (valor só para ilustrar). Patrocinador: a direção da escola. Gestora: a professora Teresa. Risco principal: poucas empresas aceitarem; resposta: começar os convites com dois meses de antecedência.',
            'Aprovado pelo diretor, com data e assinatura.',
          ],
        },
        {
          type: 'exercise',
          id: 'gp-u2l3-a',
          kind: 'match',
          instruction: 'Em que parte do termo de abertura fica cada frase?',
          items: [
            { left: '“Não inclui refeições.”', right: 'Âmbito' },
            { left: '“Cerca de 450 000 Kz.”', right: 'Orçamento estimado' },
            { left: '“Poucas empresas podem aceitar.”', right: 'Riscos' },
            { left: '“Muitos finalistas nunca falaram com uma empresa.”', right: 'Justificação' },
          ],
        },
        {
          type: 'exercise',
          id: 'gp-u2l3-b',
          kind: 'choice',
          instruction: 'Escolhe a resposta certa.',
          items: [
            {
              prompt: 'Quem aprova o termo de abertura?',
              options: ['O patrocinador', 'Os beneficiários', 'Os fornecedores'],
              answer: 0,
            },
            {
              prompt: 'Para que serve o termo de abertura?',
              options: [
                'Para registar as lições aprendidas',
                'Para autorizar o projeto e pôr todos de acordo',
                'Para pagar a equipa',
              ],
              answer: 1,
            },
            {
              prompt: 'Para uma campanha de vacinação no bairro, o termo de abertura deve ter…',
              options: ['50 páginas', 'Uma ou duas páginas com o essencial', 'Só o orçamento'],
              answer: 1,
            },
          ],
        },
        {
          type: 'summary',
          points: [
            'O termo de abertura (project charter) autoriza o projeto a começar.',
            'Tem justificação, objetivo, âmbito, entregas, prazos, orçamento, partes interessadas e riscos.',
            'Escreve também o que fica de fora.',
            'É aprovado pelo patrocinador.',
          ],
        },
      ],
    },
  ],
  review: [
    {
      type: 'exercise',
      id: 'gp-u2r-a',
      kind: 'choice',
      instruction: 'Escolhe a resposta certa.',
      items: [
        {
          prompt: 'Qual objetivo é SMART?',
          options: [
            'Vender muito na loja.',
            'Vender 200 capas de telemóvel no primeiro mês da loja.',
            'Ser a melhor loja do Kilamba.',
          ],
          answer: 1,
        },
        {
          prompt: '“Atingível” quer dizer…',
          options: ['fácil', 'possível com os recursos que existem', 'barato'],
          answer: 1,
        },
        {
          prompt: 'Quem são as partes interessadas?',
          options: ['Só a equipa', 'Quem afeta o projeto ou é afetado por ele', 'Só quem paga'],
          answer: 1,
        },
        {
          prompt: 'Muito poder e pouco interesse: como gerir?',
          options: ['Manter satisfeito', 'Gerir de perto', 'Ignorar'],
          answer: 0,
        },
        {
          prompt: 'O que autoriza o projeto a começar?',
          options: ['O relatório de estado', 'O termo de abertura aprovado', 'A primeira compra'],
          answer: 1,
        },
      ],
    },
    {
      type: 'exercise',
      id: 'gp-u2r-b',
      kind: 'gap',
      instruction: 'Completa com uma palavra.',
      items: [
        { prompt: 'Quem apoia, decide e muitas vezes paga o projeto é o ___.', answers: ['patrocinador'] },
        { prompt: 'Na regra SMART, o S quer dizer ___.', answers: ['específico'] },
        { prompt: 'Em inglês, o termo de abertura chama-se project ___.', answers: ['charter'] },
      ],
    },
    {
      type: 'exercise',
      id: 'gp-u2r-c',
      kind: 'match',
      instruction: 'Liga cada parte interessada da cantina ao papel.',
      items: [
        { left: 'A direção da escola', right: 'Patrocinador' },
        { left: 'Os alunos que almoçam', right: 'Beneficiários' },
        { left: 'O pintor e o canalizador', right: 'Equipa' },
      ],
    },
  ],
}

export default unit
