import type { SimulationDraft } from './draft'

// Services: an IT support technician and a head chef.

export const SERVICE_SIMULATIONS: SimulationDraft[] = [
  {
    id: 'um-dia-como-tecnico-de-suporte',
    careerSlug: 'tecnico-de-suporte',
    title: 'Um dia como técnico de suporte informático num banco',
    intro:
      'Trabalhas na equipa de suporte de um banco em Luanda, que atende a sede e quinze agências. Há quatro técnicos e um supervisor. Todos os pedidos entram no sistema de tickets.',
    minutes: 7,
    moments: [
      {
        id: 'chegada',
        time: '07:45',
        title: 'A fila de tickets',
        text: 'Abres o sistema e já há onze pedidos: um computador que não liga, uma impressora sem toner, uma agência sem internet e um director que não consegue abrir o email. O supervisor marca as prioridades.',
      },
      {
        id: 'agencia',
        time: '08:15',
        title: 'A agência sem internet',
        text: 'Uma agência em Viana não tem rede: os caixas não conseguem atender clientes e a fila já passa da porta. Falas com a gerente por telefone, que está nervosa e quer saber quando volta.',
        decision: {
          question: 'O que fazes primeiro?',
          options: [
            {
              id: 'a',
              text: 'Vais logo de táxi à agência, sem ver nada à distância.',
              result:
                'Chegas uma hora depois e vês que era só o router desligado da tomada. Perdeste uma hora.',
              why: 'Começa sempre pelo mais simples e pelo que podes ver à distância. Deslocar-se é o último passo.',
            },
            {
              id: 'b',
              text: 'Pedes à gerente que veja as luzes do equipamento e se o cabo está ligado, e verificas à distância se a linha responde.',
              result:
                'Em cinco minutos descobres que o equipamento reiniciou-se com uma falha de luz. Ela liga-o e a rede volta.',
              why: 'Fazer perguntas simples e testar à distância resolve a maioria dos problemas, sem custo.',
            },
            {
              id: 'c',
              text: 'Dizes que vais ver mais tarde, porque tens outros tickets.',
              result: 'A agência fica uma manhã parada e o director liga ao supervisor.',
              why: 'Num banco, um balcão parado custa clientes. A prioridade vem do impacto, não da ordem de chegada.',
            },
          ],
        },
      },
      {
        id: 'director',
        time: '10:30',
        title: 'O director e a palavra-passe',
        text: 'Um director ligou: não consegue abrir o email e tem uma reunião às 11h. Pede-te a sua palavra-passe e diz que quer a de uma colega, "para ver uma coisa urgente".',
        decision: {
          question: 'Como respondes?',
          options: [
            {
              id: 'a',
              text: 'Dás-lhe a palavra-passe da colega, porque é o director.',
              result:
                'O email da colega é lido sem ela saber. Mais tarde, a segurança informática abre um inquérito e o teu nome aparece.',
              why: 'As palavras-passe são pessoais e nunca se dão, por muito que o pedido seja de um superior. É regra de segurança.',
            },
            {
              id: 'b',
              text: 'Recuperas o acesso do director pelo processo normal e explicas que o acesso à conta da colega só se faz com um pedido formal à segurança.',
              result:
                'O director está no email em dez minutos e acaba por pedir o acesso à segurança, pelos canais certos.',
              why: 'Resolver o problema dele sem quebrar a regra é o que se espera de ti, com educação e firmeza.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '13:00',
        title: 'Almoço',
        text: 'Almoças com os colegas e aprendes um truque novo para limpar o cache de uma aplicação que dá erros. Os mais velhos contam os casos mais malucos que já viram: um servidor desligado por alguém a limpar o chão.',
      },
      {
        id: 'instalar',
        time: '14:00',
        title: 'Instalar um computador novo',
        text: 'Preparas um computador para um novo funcionário: sistema, programas, impressoras, acesso ao email e à rede interna. Segues a lista, tickado ponto a ponto, para não falhares nenhum.',
      },
      {
        id: 'ensinar',
        time: '16:00',
        title: 'Explicar sem confundir',
        text: 'Uma utilizadora liga pela terceira vez no mês com o mesmo problema: ficheiros que desaparecem. Percebes que ela guarda tudo no ambiente de trabalho, que se apaga ao reiniciar.',
        decision: {
          question: 'Como lhe explicas?',
          options: [
            {
              id: 'a',
              text: 'Dizes que ela devia saber, que já foi explicado.',
              result: 'Ela fica envergonhada e deixa de ligar. Daqui a pouco perde um ficheiro importante.',
              why: 'O suporte é também ensinar, sem humilhar. Quem tem medo de perguntar acaba por perder dados.',
            },
            {
              id: 'b',
              text: 'Mostras-lhe, ao lado dela, onde guardar na pasta certa e fazes uma cópia dos ficheiros que lá estavam.',
              result: 'Ela agradece e deixa de ligar com este problema. Fechas o ticket com uma nota.',
              why: 'Resolver a causa, com paciência, evita o próximo ticket.',
            },
          ],
        },
      },
      {
        id: 'fim',
        time: '17:00',
        title: 'Fecho dos tickets',
        text: 'Fechas os tickets resolvidos, com uma nota do que fizeste, e passas os pendentes ao colega da noite. A nota serve a quem apanha o mesmo problema daqui a seis meses.',
      },
    ],
    asks: [
      'Paciência para ouvir e explicar sem fazer sentir mal.',
      'Método: começar pelo mais simples e testar uma coisa de cada vez.',
      'Saber dizer não a pedidos que quebram a segurança.',
      'Estudar sempre: as ferramentas mudam muito depressa.',
    ],
    next: [
      { kind: 'course', text: 'Vê os cursos de informática e redes na página da carreira.' },
      { kind: 'academy', text: 'Compara os institutos e centros de formação de TI em Luanda.' },
      { kind: 'internship', text: 'Procura estágios em bancos, operadoras e empresas de TI.' },
    ],
  },
  {
    id: 'um-dia-como-chefe-de-cozinha',
    careerSlug: 'chefe-de-cozinha',
    title: 'Um dia como chefe de cozinha num restaurante de hotel',
    intro:
      'És o chefe de cozinha de um restaurante de hotel em Luanda. Tens uma equipa de oito pessoas e hoje há um jantar de empresa com 60 convidados.',
    minutes: 8,
    moments: [
      {
        id: 'chegada',
        time: '09:00',
        title: 'As compras e o stock',
        text: 'Chegas, vais à câmara fria e confirmas o stock. O fornecedor de peixe ligou: o peixe que encomendaste só chega ao fim da tarde. O jantar é às 20h e a ementa leva peixe grelhado.',
        decision: {
          question: 'O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Esperas que o peixe chegue, na esperança de não atrasar.',
              result:
                'O peixe chega às 18h30, já sem tempo para o preparar com calma. O jantar atrasa e os convidados notam.',
              why: 'Um chefe tem sempre um plano B. Esperar sem alternativa põe o serviço em risco.',
            },
            {
              id: 'b',
              text: 'Ligas ao mercado do peixe e a outro fornecedor, e preparas uma alternativa com o que já tens, como frango, caso o peixe falhe.',
              result:
                'Compras uma parte do peixe noutro lado, e o frango fica pronto como reserva. O jantar corre bem.',
              why: 'Antecipar e ter alternativas é o essencial numa cozinha. O prato tem de sair sempre.',
            },
            {
              id: 'c',
              text: 'Substituis o peixe por outro mais barato, sem dizer à direcção.',
              result: 'Um convidado repara e queixa-se ao gerente. Tens de explicar a troca.',
              why: 'Mudar o que foi prometido ao cliente exige acordo prévio. O chefe responde pela ementa.',
            },
          ],
        },
      },
      {
        id: 'equipa',
        time: '11:00',
        title: 'Distribuir o trabalho',
        text: 'Reúnes a equipa e distribuis as tarefas: um prepara os legumes, outra faz as sobremesas, o mais novo lava e corta. Explicas a ordem dos pratos e a hora a que cada um tem de estar pronto.',
      },
      {
        id: 'higiene',
        time: '13:30',
        title: 'Higiene e segurança',
        text: 'Ao passar pela bancada, vês um ajudante a cortar carne crua e depois legumes na mesma tábua, sem lavar.',
        decision: {
          question: 'O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Deixas passar, porque estão com pressa.',
              result: 'Um convidado fica doente depois do jantar. O hotel abre um inquérito.',
              why: 'A higiene é uma regra, não um pormenor. Uma intoxicação destrói a reputação de um restaurante.',
            },
            {
              id: 'b',
              text: 'Paras o ajudante com calma, mostras as tábuas por cor e explicas porque é que se separam. Mandas lavar tudo.',
              result:
                'Ele ouve, corrige e passa a usar as tábuas certas. A equipa vê que és exigente com respeito.',
              why: 'Corrigir com calma e explicar o porquê forma a equipa e protege o cliente.',
            },
            {
              id: 'c',
              text: 'Gritas com ele à frente de todos.',
              result: 'O ajudante fica com medo, a equipa fica tensa e dois cometem erros à tarde.',
              why: 'Gritar não ensina e piora a pressão. A autoridade vem da calma e do exemplo.',
            },
          ],
        },
      },
      {
        id: 'pausa',
        time: '15:00',
        title: 'Pausa e reunião',
        text: 'Almoças tarde, de pé. Falas com o gerente do hotel sobre o preço do menu e os custos: ele quer um prato mais barato, sem perder a qualidade. Fazes contas dos custos por porção.',
      },
      {
        id: 'servico',
        time: '19:30',
        title: 'O serviço',
        text: 'O jantar começa. Na cozinha ouvem-se pedidos e passam pratos. Dizes "passa", "pronto" e "mais dois" em voz firme. Um prato volta da sala: o convidado diz que a carne está mal passada.',
        decision: {
          question: 'O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Dizes à sala que o cliente não percebe e que o prato está certo.',
              result: 'O cliente fica aborrecido e não volta. O gerente pergunta o que se passou.',
              why: 'Na hotelaria, o cliente é quem decide. Discutir não resolve.',
            },
            {
              id: 'b',
              text: 'Pegas no prato, refazes um novo no ponto pedido e vais tu ver o resultado.',
              result: 'O novo prato sai a tempo e o cliente fica satisfeito. A cozinha mantém o ritmo.',
              why: 'Resolver depressa e sem drama é o que distingue uma cozinha profissional.',
            },
          ],
        },
      },
      {
        id: 'fim',
        time: '23:00',
        title: 'Fim do serviço',
        text: 'Quando o último prato sai, a equipa limpa e tu verificas as câmaras e as luzes. Escreves o que ficou por repor e o que correu bem. Chegas a casa quando a cidade já dorme.',
      },
    ],
    asks: [
      'Aguentar horas longas, em pé e sob pressão.',
      'Planear e ter sempre um plano B.',
      'Liderar uma equipa com calma e exigência.',
      'Respeitar a higiene e o custo de cada prato.',
    ],
    next: [
      { kind: 'course', text: 'Vê os cursos de Cozinha e de Hotelaria na página da carreira.' },
      { kind: 'academy', text: 'Compara as escolas de hotelaria e turismo.' },
      { kind: 'internship', text: 'Procura estágios em cozinhas de hotéis e restaurantes.' },
    ],
  },
]
