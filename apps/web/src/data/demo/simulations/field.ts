import type { SimulationDraft } from './draft'

// Field work: a civil engineer, a mining engineer, an environmental technician and a warehouse technician.

export const FIELD_SIMULATIONS: SimulationDraft[] = [
  {
    id: 'um-dia-como-engenheiro-civil',
    careerSlug: 'engenheiro-civil',
    title: 'Um dia como engenheiro civil numa obra de edifício',
    intro:
      'És engenheiro civil júnior numa obra de um edifício de cinco andares em Luanda. O engenheiro director de obra está contigo no terreno e o encarregado manda nas equipas.',
    minutes: 8,
    moments: [
      {
        id: 'chegada',
        time: '06:30',
        title: 'Chegada ao estaleiro',
        text: 'A obra começa cedo, para fugir ao calor e ao trânsito. Chegas com o capacete e as botas, assinas a folha de presenças e passas pelo encarregado, que te diz o que há para fazer: betonar a laje do segundo andar.',
      },
      {
        id: 'verificar',
        time: '07:15',
        title: 'Verificar antes de betonar',
        text: 'Antes de chegar o betão, tens de conferir a armadura da laje com o projecto: diâmetro dos varões, espaçamento e recobrimento. Medes com a fita e encontras uma zona com os varões mais afastados do que o desenho.',
        decision: {
          question: 'O camião do betão está a chegar e cada minuto de atraso custa dinheiro. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Deixas passar, é só uma zona pequena.',
              result:
                'A laje é betonada. Meses depois aparecem fissuras e a empresa gasta muito mais a reparar.',
              why: 'A armadura fica escondida para sempre. Se não verificares agora, ninguém verifica mais.',
            },
            {
              id: 'b',
              text: 'Paras a betonagem na zona, mostras ao encarregado a diferença e esperas que a equipa corrija antes de chamares o camião.',
              result:
                'Perdes quarenta minutos e o encarregado resmunga, mas a laje fica conforme ao projecto.',
              why: 'Um engenheiro assina pela qualidade. Ser o chato na hora certa evita o problema grande depois.',
            },
            {
              id: 'c',
              text: 'Corriges tu mesmo, com as tuas mãos, para ser mais depressa.',
              result: 'Fazes o trabalho mal e magoas as costas. O encarregado perde o respeito por ti.',
              why: 'O engenheiro dirige e verifica; a equipa executa. Tomar o lugar dos outros não resolve.',
            },
          ],
        },
      },
      {
        id: 'betao',
        time: '09:00',
        title: 'A betonagem',
        text: 'O camião betoneira chega e começa o trabalho. Pedes uma amostra para o ensaio de resistência e controlas a trabalhabilidade com o cone de Abrams. O sol já aperta e a equipa não pode parar.',
      },
      {
        id: 'material',
        time: '11:30',
        title: 'O fornecedor falha',
        text: 'O fornecedor de ferro liga: a entrega de amanhã vai atrasar uma semana. Sem ferro, a equipa fica parada no terceiro andar. O director de obra está numa reunião no escritório.',
        decision: {
          question: 'O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Deixas a equipa parada até o director voltar.',
              result: 'Perdem-se dois dias de trabalho e salário a quem não trabalha.',
              why: 'Um problema de obra pede decisão rápida. Esperar sempre custa dinheiro.',
            },
            {
              id: 'b',
              text: 'Reorganizas o plano: a equipa passa a trabalhar nas paredes do segundo andar, enquanto procuras outro fornecedor e avisas o director por mensagem.',
              result:
                'A equipa continua ocupada. O director liga à noite, aprova o novo fornecedor e agradece.',
              why: 'Resolver o que está ao teu alcance e informar quem decide é a postura de um bom engenheiro.',
            },
            {
              id: 'c',
              text: 'Compras ferro a um vendedor de rua, sem factura, para não parar.',
              result: 'O ferro não tem certificado. Na fiscalização, a obra é parada.',
              why: 'Materiais sem certificado põem em risco a obra e as pessoas. A pressa não justifica.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '13:00',
        title: 'Almoço no estaleiro',
        text: 'Almoças com o encarregado e os pedreiros, num banco debaixo de uma árvore. Aprendes mais sobre como as coisas realmente se fazem do que num mês de aulas. Ele conta o que já viu correr mal noutras obras.',
      },
      {
        id: 'escritorio',
        time: '15:00',
        title: 'Diário de obra',
        text: 'No contentor-escritório, registas no diário de obra o que foi feito, quem esteve, o material que chegou e o problema do ferro. Se mais tarde houver uma disputa, este caderno é a prova.',
      },
      {
        id: 'fim',
        time: '17:00',
        title: 'Fim do dia',
        text: 'Mandas as fotos da laje ao director de obra e planeias amanhã. Voltas a casa com poeira nas botas e a certeza de que, de manhã, há um edifício um pouco mais alto do que ontem.',
      },
    ],
    asks: [
      'Rigor com medidas e normas, mesmo sob pressão.',
      'Gostar de estar no terreno, ao sol e à poeira.',
      'Ser respeitado por quem trabalha contigo, sem gritar.',
      'Resolver problemas práticos e registar tudo.',
    ],
    next: [
      { kind: 'course', text: 'Vê a licenciatura em Engenharia Civil na página da carreira.' },
      { kind: 'academy', text: 'Compara as faculdades de engenharia de Luanda.' },
      { kind: 'internship', text: 'Procura estágios em construtoras e em gabinetes de fiscalização.' },
    ],
  },
  {
    id: 'um-dia-como-engenheiro-de-minas',
    careerSlug: 'engenheiro-de-minas',
    title: 'Um dia como engenheiro de minas numa exploração das Lundas',
    intro:
      'Trabalhas numa exploração mineira das Lundas, em regime de turnos longos no local. Hoje és o engenheiro de turno de uma frente de desmonte a céu aberto.',
    minutes: 8,
    moments: [
      {
        id: 'chegada',
        time: '05:45',
        title: 'Briefing de segurança',
        text: 'O dia começa antes do sol, com a reunião de segurança: o chefe de turno lê os riscos do dia, as zonas interditas e os pontos de reunião. Tu assinas, colocas o capacete, os óculos e os coletes, e subis à frente de trabalho na carrinha.',
      },
      {
        id: 'frente',
        time: '06:30',
        title: 'A frente de trabalho',
        text: 'Com o mapa da mina na mão, vês onde as máquinas vão escavar. Escavadoras e camiões estão a postos. Um operador diz-te que o terreno numa das bermas está a ceder.',
        decision: {
          question: 'A produção do turno está atrasada e o supervisor pede para não parar. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Dizes ao operador para continuar com cuidado.',
              result:
                'A berma cede a meio da manhã e a escavadora quase cai. Ninguém se magoa, mas a frente fica parada três dias.',
              why: 'Na mina, a segurança vem antes da produção. Quem pára cedo evita o acidente e a paragem longa.',
            },
            {
              id: 'b',
              text: 'Paras a máquina, isolas a zona, inspeccionas a berma com o geotécnico e só voltas quando estiver estável.',
              result:
                'Perdes duas horas, o supervisor não gosta, mas a equipa fica segura e a produção recupera à tarde.',
              why: 'O engenheiro tem autoridade e dever de parar uma operação perigosa. É a decisão que se defende no relatório.',
            },
            {
              id: 'c',
              text: 'Mudas a máquina para outra frente, sem avisar ninguém.',
              result:
                'A mudança estraga o plano de lavra e deixa as equipas confusas. O supervisor pergunta porquê.',
              why: 'Mudar o plano sem avisar desorganiza a mina. Comunicar é parte da segurança.',
            },
          ],
        },
      },
      {
        id: 'geologia',
        time: '09:30',
        title: 'Com os geólogos',
        text: 'Falas com a geóloga sobre as amostras da semana. Ela diz que a concentração de diamantes numa zona é menor do que o previsto. Isso muda quanto vale a pena escavar ali.',
      },
      {
        id: 'explosivos',
        time: '11:30',
        title: 'O desmonte com explosivos',
        text: 'Hoje há uma detonação programada. Verificas a evacuação, as sirenes e a lista de pessoas. Um camionista diz que ainda precisa de dez minutos para tirar o camião de uma zona de risco.',
        decision: {
          question: 'A detonação está marcada e o prazo é apertado. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Esperas até o camião sair e só depois dás ordem.',
              result: 'A detonação atrasa dez minutos, o plano ajusta-se e ninguém corre risco.',
              why: 'Nenhuma detonação avança sem a zona estar vazia. Dez minutos custam menos do que uma vida.',
            },
            {
              id: 'b',
              text: 'Autorizas a detonação, porque o camião está longe.',
              result: 'Fragmentos de rocha atingem o camião. O motorista fica ferido e abre-se um inquérito.',
              why: 'A distância de segurança é uma regra, não uma estimativa. Quem a quebra responde por ela.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '13:30',
        title: 'Almoço no refeitório',
        text: 'No refeitório do acampamento, comes com os geólogos e os operadores. A conversa é sobre quando é a próxima folga e sobre o que se come em casa. Estar longe da família é a parte mais difícil.',
      },
      {
        id: 'relatorio',
        time: '16:00',
        title: 'Relatório do turno',
        text: 'No gabinete, registas a produção do turno, as paragens, as ocorrências e o plano para amanhã. Passas o turno ao colega da noite e vais ao dormitório.',
      },
    ],
    asks: [
      'Aguentar turnos longos, longe de casa e da família.',
      'Pôr a segurança acima da produção, sempre.',
      'Trabalhar em equipa com geólogos, operadores e chefias.',
      'Gostar de campo, de máquinas e de números.',
    ],
    next: [
      { kind: 'course', text: 'Vê a licenciatura em Engenharia de Minas na página da carreira.' },
      { kind: 'academy', text: 'Compara as instituições com cursos de minas e geologia.' },
      { kind: 'internship', text: 'Procura estágios em empresas mineiras.' },
    ],
  },
  {
    id: 'um-dia-como-tecnico-de-ambiente',
    careerSlug: 'tecnico-de-ambiente',
    title: 'Um dia como técnico de ambiente num projecto de obra',
    intro:
      'És técnico de ambiente na equipa de ambiente e segurança de uma empresa que constrói uma estrada na província do Bengo. Controlas resíduos, descargas e licenças.',
    minutes: 7,
    moments: [
      {
        id: 'chegada',
        time: '07:00',
        title: 'Reunião de arranque',
        text: 'Começas na reunião de segurança com o chefe do projecto e os encarregados. Hoje há movimento de terras e transporte de resíduos. Levas a lista de licenças e os formulários de controlo.',
      },
      {
        id: 'estaleiro',
        time: '08:30',
        title: 'Inspecção ao estaleiro',
        text: 'Percorres o estaleiro com a lista na mão: onde estão os óleos, como estão guardados os resíduos, se os contentores estão tapados. Num canto, vês óleo usado a escorrer para o solo.',
        decision: {
          question: 'O encarregado diz que é só hoje e que o camião de recolha vem à tarde. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Deixas, porque o camião vem à tarde.',
              result:
                'Chove ao meio-dia e o óleo chega a uma linha de água. A empresa é multada e o projecto atrasa.',
              why: 'O risco ambiental não espera o camião. A prevenção é o trabalho.',
            },
            {
              id: 'b',
              text: 'Mandas parar, contens o óleo com areia, recolhes o solo contaminado e registas a ocorrência.',
              result: 'O encarregado resmunga, mas o problema fica contido e o relatório mostra que agiste.',
              why: 'Conter, limpar e registar é a sequência certa. O registo protege a empresa e prova que cumpriste.',
            },
            {
              id: 'c',
              text: 'Limpas o óleo e não dizes nada ao chefe, para não criar problema.',
              result: 'Uma semana depois a falha repete-se e o chefe pergunta porque não foi avisado.',
              why: 'Esconder uma ocorrência impede que se corrija a causa. Os relatórios existem para isso.',
            },
          ],
        },
      },
      {
        id: 'medicoes',
        time: '10:30',
        title: 'Medições',
        text: 'Medes o ruído junto à povoação mais próxima e recolhes uma amostra da água de uma vala. Anotas hora, local e leituras. Os moradores aproximam-se: querem saber se a água do poço vai ficar suja.',
      },
      {
        id: 'comunidade',
        time: '11:30',
        title: 'Falar com a comunidade',
        text: 'Um morador mais velho pergunta, zangado, porque é que os camiões levantam tanta poeira. Outros acenam.',
        decision: {
          question: 'Como respondes?',
          options: [
            {
              id: 'a',
              text: 'Dizes que isso é com a empresa e que não podes fazer nada.',
              result: 'O grupo fica ainda mais zangado e bloqueia a estrada no dia seguinte.',
              why: 'Para a comunidade, tu és a empresa. Uma resposta fria custa dias de obra.',
            },
            {
              id: 'b',
              text: 'Ouves, anotas o horário dos camiões que mais incomodam e prometes levar o assunto ao chefe, com resposta em dois dias.',
              result: 'O chefe manda regar a estrada e mudar o horário. O morador reconhece que o ouviram.',
              why: 'Ouvir, registar e dar um prazo realista constrói confiança. É um trabalho de pessoas.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '13:00',
        title: 'Almoço',
        text: 'Almoças com o técnico de segurança e a topógrafa. Falam de como a obra mudou o sítio e de quanto ainda falta para acabar. Ele explica-te como se prepara um relatório para a fiscalização.',
      },
      {
        id: 'relatorio',
        time: '15:00',
        title: 'O relatório',
        text: 'No contentor, passas as medições e a ocorrência do óleo para o relatório da semana. O relatório vai para o chefe e depois para a fiscalização do projecto. Escreves factos, datas e o que foi feito.',
      },
    ],
    asks: [
      'Atenção a pormenores e coragem de dizer que algo está mal.',
      'Falar com trabalhadores e comunidades com calma.',
      'Escrever relatórios com factos e datas.',
      'Aceitar deslocações às obras, longe da cidade.',
    ],
    next: [
      { kind: 'course', text: 'Vê as licenciaturas em Ambiente e Engenharia na página da carreira.' },
      { kind: 'academy', text: 'Compara as instituições com cursos de ambiente e agronomia.' },
      { kind: 'internship', text: 'Procura estágios em empresas, consultoras e projectos do Estado.' },
    ],
  },
  {
    id: 'um-dia-como-tecnico-de-logistica',
    careerSlug: 'tecnico-de-logistica',
    title: 'Um dia como técnico de logística num armazém de distribuição',
    intro:
      'Trabalhas no armazém de uma distribuidora de bens alimentares no Zango, em Luanda. O turno começa cedo, porque os camiões chegam antes do trânsito.',
    minutes: 7,
    moments: [
      {
        id: 'chegada',
        time: '06:00',
        title: 'Início do turno',
        text: 'Marcas o ponto, vestes o colete e vais ao quadro: hoje há três camiões a descarregar e catorze encomendas a preparar. O fiel de armazém, teu chefe, distribui as tarefas.',
      },
      {
        id: 'receber',
        time: '06:30',
        title: 'Receber mercadoria',
        text: 'Um camião de arroz e óleo chega ao cais. Confrontas a guia de remessa com a nota de encomenda e contas os paletes. Faltam duas caixas de óleo e uma das palete tem sacos rasgados.',
        decision: {
          question: 'O motorista tem pressa e pede-te para assinar já. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Assinas sem ressalvas, para não o atrasar.',
              result:
                'Na contagem do dia, faltam as duas caixas e a empresa perde o valor. Ninguém sabe onde ficaram.',
              why: 'Quem assina sem ressalva aceita o que recebeu. A conferência à chegada protege a empresa.',
            },
            {
              id: 'b',
              text: 'Conferes tudo, escreves na guia o que falta e o que está danificado, fotografas e só então assinas.',
              result: 'O motorista resmunga, mas a transportadora reconhece e a empresa é compensada.',
              why: 'Registar as diferenças no momento da entrega é a única prova que tens.',
            },
            {
              id: 'c',
              text: 'Recusas o camião inteiro.',
              result:
                'O camião vai embora e os clientes ficam sem encomenda. O chefe pergunta se era mesmo preciso.',
              why: 'Recusar tudo por um problema pequeno cria outros. Aceita-se o que está bom e anota-se o resto.',
            },
          ],
        },
      },
      {
        id: 'arrumar',
        time: '08:30',
        title: 'Arrumar e registar',
        text: 'Etiquetas os paletes e arrumas pelo sistema FIFO: o que chegou primeiro, sai primeiro. Registas as entradas no sistema, para o stock ficar certo.',
      },
      {
        id: 'preparar',
        time: '10:00',
        title: 'Preparar as saídas',
        text: 'Pegas na lista de encomendas, buscas os produtos e agrupas por cliente. Um supermercado pediu 40 caixas de um produto de que só tens 25.',
        decision: {
          question: 'O comercial já prometeu as 40. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Envias 25 sem avisar ninguém.',
              result: 'O supermercado queixa-se e o comercial fica a saber só quando o cliente liga.',
              why: 'Uma entrega parcial sem aviso quebra a confiança. A informação tem de andar à frente do camião.',
            },
            {
              id: 'b',
              text: 'Avisas o comercial de imediato, propões enviar 25 hoje e 15 quando chegar a reposição, e registas as duas saídas.',
              result: 'O cliente aceita a entrega em duas partes e fica a saber o que esperar.',
              why: 'Dar o problema e a solução a quem fala com o cliente é a boa prática de armazém.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '12:30',
        title: 'Almoço e inventário',
        text: 'Almoças com os colegas do armazém, no pátio, à sombra. Depois fazes o inventário rotativo de um corredor: contas os produtos e comparas com o sistema. Tudo certo, menos um produto com uma caixa a mais.',
      },
      {
        id: 'fim',
        time: '15:00',
        title: 'Fim do turno',
        text: 'Passas o turno ao colega, com a lista de encomendas por sair e o problema do arroz anotado. Sais com as pernas cansadas e o armazém organizado.',
      },
    ],
    asks: [
      'Organização e atenção a números e códigos.',
      'Aguentar trabalho físico e turnos cedo.',
      'Registar tudo, mesmo quando há pressa.',
      'Comunicar problemas depressa a quem decide.',
    ],
    next: [
      { kind: 'course', text: 'Vê os cursos técnicos de Logística na página da carreira.' },
      { kind: 'academy', text: 'Compara as escolas técnicas e institutos de logística.' },
      { kind: 'internship', text: 'Procura estágios em distribuidoras, portos e supermercados.' },
    ],
  },
]
