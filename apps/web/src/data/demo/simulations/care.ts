import type { SimulationDraft } from './draft'

// Health, social work and training: a day as a nurse, a social worker and a vocational trainer.

export const CARE_SIMULATIONS: SimulationDraft[] = [
  {
    id: 'um-dia-como-enfermeiro',
    careerSlug: 'enfermeiro',
    title: 'Um dia como enfermeiro numa enfermaria',
    intro:
      'Turno da manhã numa enfermaria de medicina de um hospital municipal de Luanda. Tens 12 doentes à tua responsabilidade e uma técnica de enfermagem a trabalhar contigo.',
    minutes: 8,
    moments: [
      {
        id: 'chegada',
        time: '06:50',
        title: 'Passagem de turno',
        text: 'Chegas de candongueiro dez minutos antes do turno, porque a colega da noite não sai sem passar o turno. À volta do livro de registos, ela diz-te o estado de cada cama: quem tem febre, quem foi operado, quem espera análises. Na cama 7 há um senhor com a tensão alta que passou a noite agitado.',
      },
      {
        id: 'sinais-vitais',
        time: '07:30',
        title: 'Sinais vitais e medicação',
        text: 'Começas a ronda: tensão, temperatura, pulso e oxigénio de cada doente, tudo escrito no processo. Depois vem a medicação das 8h, que confirmas pelo nome, pela dose e pela hora antes de dar a cada um.',
        decision: {
          question: 'Na cama 7 a tensão continua alta e o senhor diz que não dormiu nada. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Dás a medicação da hora e anotas a tensão no fim da ronda.',
              result: 'Meia hora depois o senhor queixa-se de uma dor de cabeça forte. A tensão subiu mais.',
              why: 'Um valor fora do normal não espera pelo fim da ronda: quem vigia é o enfermeiro, e os atrasos pagam-se em saúde do doente.',
            },
            {
              id: 'b',
              text: 'Voltas a medir, anotas os dois valores e chamas o médico de serviço.',
              result:
                'O médico vem em dez minutos, ajusta a medicação e pede-te para medires de hora a hora.',
              why: 'Confirmar o valor e avisar logo é o que a equipa espera de ti: o médico decide com números, não com palpites.',
            },
            {
              id: 'c',
              text: 'Dás uma segunda dose do comprimido, para baixar mais depressa.',
              result:
                'A tensão baixa depressa demais e o doente fica tonto. O médico pergunta quem autorizou.',
              why: 'Só o médico prescreve doses. O enfermeiro cumpre, vigia e avisa; mudar a dose por conta própria põe o doente em risco.',
            },
          ],
        },
      },
      {
        id: 'pensos',
        time: '10:00',
        title: 'Pensos e um doente novo',
        text: 'Fazes os pensos de uma senhora operada há dois dias e ensinas a filha a manter a ferida limpa. Chega uma maca da urgência com um doente novo, com pneumonia. Tens de o instalar, medir os sinais e abrir-lhe o processo.',
      },
      {
        id: 'falta-material',
        time: '12:15',
        title: 'Falta de material',
        text: 'Ao preparar um soro, vês que as luvas do teu tamanho acabaram e que o armazém da farmácia do hospital só abre às 14h. A enfermeira-chefe está numa reunião.',
        decision: {
          question: 'Precisas das luvas para a próxima hora. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Pedes à família do doente para comprar luvas na farmácia da rua.',
              result:
                'A família traz as luvas, mas fica a sentir que o hospital falhou. Mais tarde, a chefe diz-te que isto não se pede.',
              why: 'O doente tem direito ao material do serviço. Pedir à família é último recurso, e a chefe deve saber antes.',
            },
            {
              id: 'b',
              text: 'Pedes luvas emprestadas a outra enfermaria e registas o empréstimo no caderno.',
              result:
                'Resolves a hora seguinte e deixas escrito o que falta, para a chefe pedir mais ao armazém.',
              why: 'Entre colegas, emprestar e anotar é normal. O registo faz com que a falta chegue a quem compra.',
            },
            {
              id: 'c',
              text: 'Fazes o soro sem luvas, com mais cuidado.',
              result:
                'O doente fica bem, mas uma colega vê e avisa a chefe. Ficas com uma chamada de atenção.',
              why: 'As luvas protegem o doente e a ti. A segurança não se negoceia, mesmo com pressa.',
            },
          ],
        },
      },
      {
        id: 'equipa',
        time: '13:30',
        title: 'Com a equipa',
        text: 'No intervalo, a técnica de enfermagem conta-te como organiza as camas à hora das visitas. Depois, a médica passa visita contigo e pergunta como estiveram os doentes: és tu quem lhe explica o que viste.',
      },
      {
        id: 'registos',
        time: '14:30',
        title: 'Registos e passagem',
        text: 'Escreves no processo de cada doente o que fizeste, a que horas e o que mudou. Se não está escrito, para a equipa não aconteceu. Às 15h passas o turno à colega da tarde, cama a cama, e sais com os pés cansados.',
      },
    ],
    asks: [
      'Atenção ao pormenor: uma dose ou uma hora erradas contam.',
      'Resistência física e calma sob pressão.',
      'Falar com doentes e famílias com respeito, mesmo cansado.',
      'Trabalhar por turnos, incluindo noites e fins-de-semana.',
    ],
    next: [
      { kind: 'course', text: 'Vê o curso médio de Enfermagem e a licenciatura na página da carreira.' },
      { kind: 'academy', text: 'Compara as escolas de enfermagem de Luanda.' },
      { kind: 'internship', text: 'Procura estágios em centros de saúde e hospitais.' },
    ],
  },
  {
    id: 'um-dia-como-assistente-social',
    careerSlug: 'assistente-social',
    title: 'Um dia como assistente social numa administração municipal',
    intro:
      'Trabalhas num serviço de acção social de uma administração municipal na periferia de Luanda. A equipa é pequena e os casos são muitos.',
    minutes: 8,
    moments: [
      {
        id: 'chegada',
        time: '08:00',
        title: 'A fila à porta',
        text: 'Quando chegas, já há fila à porta do serviço: uma avó que cuida de três netos, um rapaz sem documentos e uma mulher que quer saber de um apoio de que ouviu falar. A tua colega abre o caderno de atendimento e dividem os casos pela urgência.',
      },
      {
        id: 'atendimento',
        time: '09:00',
        title: 'O primeiro atendimento',
        text: 'A avó explica que o neto mais velho deixou de ir à escola desde que a mãe foi trabalhar para outra província. Chora ao contar. Tu ouves, tomas notas e percebes que há três problemas ao mesmo tempo: documentos, escola e comida.',
        decision: {
          question: 'Ela quer uma solução hoje. O que lhe dizes?',
          options: [
            {
              id: 'a',
              text: 'Prometes que resolves tudo esta semana, para ela ir sossegada.',
              result:
                'Ela sai aliviada, mas uma semana depois volta zangada porque nada mudou. Perdeu a confiança.',
              why: 'Prometer o que não controlas estraga a relação. A tua palavra é a tua ferramenta.',
            },
            {
              id: 'b',
              text: 'Explicas o que vão fazer, por ordem: primeiro os documentos, depois a escola, e marcas quando voltas a vê-la.',
              result: 'Ela percebe os passos, marca a próxima visita e leva uma lista do que trazer.',
              why: 'Um plano com passos e datas dá segurança, mesmo sem resolver tudo hoje. É assim que se acompanha um caso.',
            },
            {
              id: 'c',
              text: 'Encaminhas para outro serviço e fechas o caso.',
              result: 'O outro serviço não a conhece e ela perde-se entre balcões. O caso volta, pior.',
              why: 'Encaminhar é parte do trabalho, mas acompanhar até ao fim também. Sem seguimento, a pessoa desiste.',
            },
          ],
        },
      },
      {
        id: 'visita',
        time: '11:00',
        title: 'Visita a uma família',
        text: 'Vais com o motorista da administração a casa de uma família de que recebeste um alerta: uma criança que fica sozinha de dia, sem comer. O bairro não tem ruas asfaltadas e a viatura deixa-te a dez minutos a pé.',
        decision: {
          question:
            'Em casa só está uma menina de 8 anos. A mãe vende no mercado e só volta ao fim do dia. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Deixas um recado e voltas quando a mãe estiver.',
              result:
                'Perdes a viagem, mas não expões a menina. Voltas dois dias depois e falas com a mãe com calma.',
              why: 'Falar da família com uma criança sozinha é um erro. A visita só vale com um adulto responsável presente.',
            },
            {
              id: 'b',
              text: 'Fazes perguntas à menina sobre a mãe e sobre o que comem em casa.',
              result:
                'A menina fica assustada e uma vizinha vem perguntar quem és. Quando a mãe sabe, fica zangada.',
              why: 'Uma criança sozinha não se interroga. Assusta-se, e a família sente-se vigiada.',
            },
            {
              id: 'c',
              text: 'Falas com uma vizinha de confiança, perguntas a que horas a mãe costuma chegar e voltas a essa hora.',
              result:
                'Encontras a mãe ao fim da tarde e ela aceita ser acompanhada porque não a apanhaste de surpresa.',
              why: 'Contar com a comunidade, sem expor a família, é o que se faz no terreno.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '13:00',
        title: 'Almoço com a equipa',
        text: 'Comes com a colega e com uma enfermeira do centro de saúde que veio tratar de um caso. Combinam quem acompanha o quê. Percebes que parte do teu trabalho é fazer com que serviços diferentes falem uns com os outros.',
      },
      {
        id: 'relatorio',
        time: '14:30',
        title: 'O relatório social',
        text: 'Escreves o relatório social do caso da manhã: a situação da família, o que foi feito e o que falta. O director vai ler isto para decidir um apoio, por isso tem de ser claro e com factos, sem opiniões.',
      },
      {
        id: 'fim',
        time: '16:30',
        title: 'Fim do dia',
        text: 'Marcas as visitas da próxima semana e escreves no caderno o que ficou por fazer. Sais com a sensação de que não resolveste tudo, mas que três famílias têm hoje um passo seguinte.',
      },
    ],
    asks: [
      'Saber ouvir sem julgar e sem prometer o que não depende de ti.',
      'Escrever relatórios claros, com factos.',
      'Aguentar casos difíceis e voltar no dia seguinte.',
      'Trabalhar com poucos meios e ligar serviços diferentes.',
    ],
    next: [
      { kind: 'course', text: 'Vê as licenciaturas em Serviço Social na página da carreira.' },
      { kind: 'academy', text: 'Compara as instituições que têm Serviço Social.' },
      { kind: 'internship', text: 'Procura estágios em ONG, hospitais e administrações.' },
    ],
  },
  {
    id: 'um-dia-como-formador-profissional',
    careerSlug: 'formador-profissional',
    title: 'Um dia como formador num centro de formação',
    intro:
      'Dás um curso de 40 horas de segurança no trabalho a 18 adultos de uma empresa de construção, num centro de formação em Luanda. Hoje é o terceiro dia.',
    minutes: 7,
    moments: [
      {
        id: 'preparar',
        time: '07:15',
        title: 'Preparar a sala',
        text: 'Chegas antes dos formandos para ligar o projector, que falha sempre à primeira, imprimir as fichas e arrumar os capacetes e os coletes da parte prática. A luz vai-se abaixo duas vezes, e por isso trouxeste os slides também impressos.',
      },
      {
        id: 'sessao',
        time: '08:30',
        title: 'A primeira sessão',
        text: 'Ensinas os tipos de extintor. Um formando, mais velho do que tu e com trinta anos de obra, diz que "isso são coisas de livro". Os outros olham para ti.',
        decision: {
          question: 'Como respondes ao formando?',
          options: [
            {
              id: 'a',
              text: 'Dizes que ele está enganado e continuas o slide.',
              result: 'O formando fecha-se e passa a manhã de braços cruzados. Os outros ficam desconfiados.',
              why: 'Os adultos aprendem melhor quando a sua experiência é respeitada. Contrariar em público custa-te a atenção da sala.',
            },
            {
              id: 'b',
              text: 'Pedes-lhe um exemplo de obra e usas o caso para mostrar porque é que o tipo de extintor importa.',
              result:
                'Ele conta um incêndio que viu e a sala percebe a utilidade. Ele passa a ajudar-te nas práticas.',
              why: 'Ligar a teoria à experiência dos formandos é a base da formação de adultos.',
            },
            {
              id: 'c',
              text: 'Ignoras o comentário para não perder tempo.',
              result: 'A sessão acaba a horas, mas a sala fica a pensar que não ligas ao que eles sabem.',
              why: 'Ignorar custa menos agora e mais depois: sem a sala contigo, a prática não corre bem.',
            },
          ],
        },
      },
      {
        id: 'pratica',
        time: '10:30',
        title: 'A parte prática',
        text: 'Lá fora, cada um treina com um extintor num exercício controlado. Um formando hesita, com medo do fogo. Dois outros riem-se dele.',
        decision: {
          question: 'O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Pedes aos que riem para esperarem de lado e acompanhas o formando, passo a passo.',
              result:
                'O formando faz o exercício, devagar, e no fim agradece. Os outros ficam mais respeitadores.',
              why: 'Segurança e respeito vêm antes da pressa. O formador cuida do grupo todo, não só dos mais rápidos.',
            },
            {
              id: 'b',
              text: 'Dizes-lhe para tentar já, que o medo passa a fazer.',
              result: 'Ele larga o extintor, assustado, e quase se queima. Tens de parar o exercício.',
              why: 'Num exercício com fogo, forçar é perigoso. O formador responde pela segurança do grupo.',
            },
            {
              id: 'c',
              text: 'Passas ao seguinte e deixas que ele tente no fim.',
              result: 'Ele não volta a tentar e sai sem a competência. Mais tarde, a empresa queixa-se.',
              why: 'A empresa paga por pessoas que saem a saber fazer. Quem fica para trás conta nos teus resultados.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '12:30',
        title: 'Almoço e coordenação',
        text: 'Comes com a coordenadora do centro, que te lembra que no sábado tens outro grupo e te pede a lista de presenças para o relatório à empresa cliente.',
      },
      {
        id: 'avaliacao',
        time: '14:30',
        title: 'Avaliação',
        text: 'Fazes uma pequena avaliação prática e escrita. Três formandos não chegam à nota mínima, e a empresa quer o certificado para todos.',
        decision: {
          question: 'O que fazes com os três que não chegaram?',
          options: [
            {
              id: 'a',
              text: 'Dás-lhes o certificado, para não criar problemas com a empresa.',
              result:
                'A empresa fica contente, mas um deles falha num exercício real semanas depois. O centro perde credibilidade.',
              why: 'O certificado diz o que a pessoa sabe fazer. Se mentir, deixa de valer para todos.',
            },
            {
              id: 'b',
              text: 'Marcas uma sessão de reforço e uma nova avaliação, e informas a coordenadora e a empresa.',
              result:
                'Dois passam à segunda tentativa; o terceiro repete o curso. A empresa aceita, porque percebe o critério.',
              why: 'Dar segunda oportunidade com um critério claro mantém a exigência e ajuda a pessoa.',
            },
          ],
        },
      },
      {
        id: 'fim',
        time: '17:00',
        title: 'Fim do dia',
        text: 'Anotas o que correu bem e o que mudar amanhã, e passas os resultados à coordenadora. Voltas para casa a pensar em como vais explicar melhor os extintores à segunda turma.',
      },
    ],
    asks: [
      'Gostar de explicar e de ver os outros aprender.',
      'Respeitar quem sabe por experiência e tem mais idade do que tu.',
      'Preparar tudo e improvisar quando o material falha.',
      'Dominar bem, na prática, a profissão que ensinas.',
    ],
    next: [
      { kind: 'course', text: 'Vê os cursos de formação de formadores e a área em que queres ensinar.' },
      { kind: 'academy', text: 'Conhece os centros de formação profissional de Luanda.' },
      { kind: 'internship', text: 'Pede para acompanhar um formador como assistente.' },
    ],
  },
]
