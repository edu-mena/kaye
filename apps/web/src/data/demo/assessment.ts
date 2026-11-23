import type { Locale } from '../../lib/i18n'
import {
  RIASEC_KEYS,
  type AssessmentQuestion,
  type RiasecKey,
  type SituationContext,
  type SituationOption,
} from '../types'

type Text = Record<Locale, string>

// DEMO DATA, ADR 0017. The test has two kinds of question, 42 in all:
// - 30 statements, 5 per interest (RIASEC), each completing "Quanto gostas de…", answered from 1 to 5;
// - 12 situations, each with 6 cards, one per interest, of which the person picks one.
// Every statement is one idea, in the words of a young person in Angola, and none needs a profession to
// be answered. Technology shows up at most once per interest. Validation with real young people is part of
// Fase 1 (roadmap, 1.2).
const STATEMENTS: Record<RiasecKey, Text[]> = {
  R: [
    {
      pt: 'cuidar de uma horta ou de animais',
      en: 'looking after a vegetable garden or animals',
      fr: 't’occuper d’un potager ou d’animaux',
    },
    {
      pt: 'reparar uma mota, um gerador ou uma bomba de água',
      en: 'fixing a motorbike, a generator or a water pump',
      fr: 'réparer une moto, un groupe électrogène ou une pompe à eau',
    },
    {
      pt: 'construir um móvel ou levantar uma parede',
      en: 'building a piece of furniture or putting up a wall',
      fr: 'construire un meuble ou monter un mur',
    },
    {
      pt: 'conduzir e entregar encomendas pela cidade',
      en: 'driving and delivering parcels around the city',
      fr: 'conduire et livrer des colis dans la ville',
    },
    {
      pt: 'cozinhar para muita gente, numa festa ou num casamento',
      en: 'cooking for lots of people, at a party or a wedding',
      fr: 'cuisiner pour beaucoup de monde, à une fête ou à un mariage',
    },
  ],
  I: [
    {
      pt: 'descobrir porque é que alguém ficou doente',
      en: 'finding out why someone fell ill',
      fr: 'découvrir pourquoi quelqu’un est tombé malade',
    },
    {
      pt: 'fazer experiências para ver o que acontece',
      en: 'doing experiments to see what happens',
      fr: 'faire des expériences pour voir ce qui se passe',
    },
    {
      pt: 'perceber porque é que uma plantação secou',
      en: 'working out why a crop dried up',
      fr: 'comprendre pourquoi une plantation a séché',
    },
    {
      pt: 'olhar para números e perceber o que dizem',
      en: 'looking at numbers and understanding what they say',
      fr: 'regarder des chiffres et comprendre ce qu’ils disent',
    },
    {
      pt: 'resolver um enigma de lógica, nem que demores',
      en: 'solving a logic puzzle, even if it takes a while',
      fr: 'résoudre une énigme de logique, même si ça prend du temps',
    },
  ],
  A: [
    {
      pt: 'desenhar, pintar ou fazer artesanato',
      en: 'drawing, painting or making crafts',
      fr: 'dessiner, peindre ou faire de l’artisanat',
    },
    {
      pt: 'cantar, dançar ou tocar um instrumento',
      en: 'singing, dancing or playing an instrument',
      fr: 'chanter, danser ou jouer d’un instrument',
    },
    {
      pt: 'escrever histórias, poemas ou letras de música',
      en: 'writing stories, poems or song lyrics',
      fr: 'écrire des histoires, des poèmes ou des paroles de chansons',
    },
    {
      pt: 'fazer fotografias ou vídeos que contam uma história',
      en: 'taking photos or making videos that tell a story',
      fr: 'faire des photos ou des vidéos qui racontent une histoire',
    },
    {
      pt: 'criar penteados ou roupa com o teu estilo',
      en: 'creating hairstyles or clothes with your own style',
      fr: 'créer des coiffures ou des vêtements à ton style',
    },
  ],
  S: [
    {
      pt: 'cuidar de alguém que está doente',
      en: 'caring for someone who is ill',
      fr: 'prendre soin de quelqu’un de malade',
    },
    {
      pt: 'ajudar um colega a estudar',
      en: 'helping a classmate study',
      fr: 'aider un camarade à réviser',
    },
    {
      pt: 'ouvir os problemas de um amigo',
      en: 'listening to a friend’s problems',
      fr: 'écouter les problèmes d’un ami',
    },
    {
      pt: 'dar aulas ou catequese a crianças',
      en: 'teaching children, at school or at church',
      fr: 'faire la classe ou le catéchisme à des enfants',
    },
    {
      pt: 'ajudar a organizar uma atividade no teu bairro ou na tua igreja',
      en: 'helping to organise an activity in your neighbourhood or church',
      fr: 'aider à organiser une activité dans ton quartier ou ton église',
    },
  ],
  E: [
    {
      pt: 'vender na praça ou online',
      en: 'selling at the market or online',
      fr: 'vendre au marché ou en ligne',
    },
    {
      pt: 'liderar um grupo e decidir o que fazer',
      en: 'leading a group and deciding what to do',
      fr: 'diriger un groupe et décider quoi faire',
    },
    {
      pt: 'abrir e fazer crescer o teu próprio negócio',
      en: 'starting and growing your own business',
      fr: 'lancer et faire grandir ta propre affaire',
    },
    {
      pt: 'negociar um preço',
      en: 'negotiating a price',
      fr: 'négocier un prix',
    },
    {
      pt: 'falar em público, na rádio ou num evento',
      en: 'speaking in public, on the radio or at an event',
      fr: 'parler en public, à la radio ou lors d’un événement',
    },
  ],
  C: [
    {
      pt: 'controlar as contas de um negócio',
      en: 'keeping the accounts of a business',
      fr: 'tenir les comptes d’une affaire',
    },
    {
      pt: 'arrumar documentos e arquivos',
      en: 'filing documents and records',
      fr: 'classer des documents et des archives',
    },
    {
      pt: 'registar o que entra e sai de um armazém',
      en: 'recording what comes in and goes out of a warehouse',
      fr: 'noter ce qui entre et sort d’un entrepôt',
    },
    {
      pt: 'preencher formulários com muito cuidado',
      en: 'filling in forms very carefully',
      fr: 'remplir des formulaires avec beaucoup de soin',
    },
    {
      pt: 'planear horários, turnos ou uma viagem ao pormenor',
      en: 'planning timetables, shifts or a trip in detail',
      fr: 'planifier des horaires, des équipes ou un voyage dans le détail',
    },
  ],
}

type Card = { icon: string; text: Text }
type Situation = { context: SituationContext; text: Text; cards: Record<RiasecKey, Card> }

const card = (icon: string, pt: string, en: string, fr: string): Card => ({ icon, text: { pt, en, fr } })

const SITUATIONS: Situation[] = [
  {
    context: 'school',
    text: {
      pt: 'Na feira da tua escola, o que preferes fazer?',
      en: 'At your school fair, what would you rather do?',
      fr: 'À la foire de ton école, que préfères-tu faire ?',
    },
    cards: {
      R: card(
        'gear',
        'Montar as bancas e consertar o que avaria',
        'Set up the stalls and fix what breaks',
        'Monter les stands et réparer ce qui casse',
      ),
      I: card(
        'flask',
        'Fazer uma experiência para mostrar como funciona',
        'Do an experiment to show how it works',
        'Faire une expérience pour montrer comment ça marche',
      ),
      A: card(
        'palette',
        'Pintar os cartazes e decorar o espaço',
        'Paint the posters and decorate the space',
        'Peindre les affiches et décorer l’espace',
      ),
      S: card(
        'users',
        'Receber os visitantes e ajudar os mais pequenos',
        'Welcome the visitors and help the little ones',
        'Accueillir les visiteurs et aider les plus petits',
      ),
      E: card(
        'megaphone',
        'Vender os produtos da tua turma',
        'Sell your class’s products',
        'Vendre les produits de ta classe',
      ),
      C: card(
        'wallet',
        'Fazer a lista de tudo e contar o dinheiro',
        'Make the list of everything and count the money',
        'Faire la liste de tout et compter l’argent',
      ),
    },
  },
  {
    context: 'market',
    text: {
      pt: 'A tua família abre uma banca na praça. O que ficas a fazer?',
      en: 'Your family opens a stall at the market. What do you take on?',
      fr: 'Ta famille ouvre un étal au marché. Que prends-tu en charge ?',
    },
    cards: {
      R: card(
        'truck',
        'Carregar a mercadoria e montar a banca',
        'Load the goods and set up the stall',
        'Charger la marchandise et monter l’étal',
      ),
      I: card(
        'chart',
        'Descobrir o que as pessoas mais compram',
        'Find out what people buy most',
        'Découvrir ce que les gens achètent le plus',
      ),
      A: card(
        'palette',
        'Arranjar a banca para chamar a atenção',
        'Dress the stall to catch the eye',
        'Arranger l’étal pour attirer le regard',
      ),
      S: card(
        'heart',
        'Conversar com os clientes e ganhar a confiança deles',
        'Chat with customers and earn their trust',
        'Discuter avec les clients et gagner leur confiance',
      ),
      E: card(
        'target',
        'Negociar os preços e fazer crescer as vendas',
        'Negotiate prices and grow the sales',
        'Négocier les prix et faire croître les ventes',
      ),
      C: card(
        'document',
        'Registar tudo o que entra e sai',
        'Write down everything that comes in and goes out',
        'Noter tout ce qui entre et sort',
      ),
    },
  },
  {
    context: 'transport',
    text: {
      pt: 'Estás num candongueiro cheio e o motor falha. O que fazes?',
      en: 'You are in a packed minibus taxi and the engine fails. What do you do?',
      fr: 'Tu es dans un minibus bondé et le moteur tombe en panne. Que fais-tu ?',
    },
    cards: {
      R: card(
        'gear',
        'Ajudo o motorista a ver a avaria',
        'Help the driver look for the fault',
        'J’aide le chauffeur à chercher la panne',
      ),
      I: card(
        'brain',
        'Penso no que pode ter causado a avaria',
        'Think about what may have caused the fault',
        'Je réfléchis à ce qui a pu causer la panne',
      ),
      A: card(
        'volume',
        'Passo o tempo a cantar ou a imaginar uma história',
        'Pass the time singing or imagining a story',
        'Je passe le temps à chanter ou à imaginer une histoire',
      ),
      S: card(
        'heart',
        'Acalmo os passageiros e ajudo quem tem pressa',
        'Calm the passengers and help those in a hurry',
        'Je calme les passagers et j’aide ceux qui sont pressés',
      ),
      E: card(
        'megaphone',
        'Organizo o grupo para apanhar outro carro',
        'Get the group organised to catch another ride',
        'J’organise le groupe pour prendre un autre véhicule',
      ),
      C: card(
        'pencil',
        'Anoto a hora e a matrícula para reclamar',
        'Note the time and the plate to make a complaint',
        'Je note l’heure et la plaque pour faire une réclamation',
      ),
    },
  },
  {
    context: 'church',
    text: {
      pt: 'A tua igreja vai fazer uma festa de fim de ano. Qual é o teu papel?',
      en: 'Your church is holding an end-of-year party. What is your part?',
      fr: 'Ton église organise une fête de fin d’année. Quel est ton rôle ?',
    },
    cards: {
      R: card(
        'helmet',
        'Montar as tendas e cozinhar para todos',
        'Put up the tents and cook for everyone',
        'Monter les tentes et cuisiner pour tout le monde',
      ),
      I: card(
        'search',
        'Ver o que correu bem e mal nos outros anos',
        'Look at what went well and badly in other years',
        'Regarder ce qui a bien et mal marché les autres années',
      ),
      A: card(
        'volume',
        'Ensaiar o coro, a dança ou uma peça',
        'Rehearse the choir, the dance or a play',
        'Répéter la chorale, la danse ou une pièce',
      ),
      S: card(
        'heart',
        'Acolher as famílias e cuidar dos mais velhos',
        'Welcome the families and look after the elderly',
        'Accueillir les familles et s’occuper des aînés',
      ),
      E: card(
        'megaphone',
        'Convencer pessoas a ajudar e a dar donativos',
        'Persuade people to help and to give donations',
        'Convaincre les gens d’aider et de faire des dons',
      ),
      C: card(
        'calendar',
        'Planear o horário e a lista de convidados',
        'Plan the schedule and the guest list',
        'Planifier l’horaire et la liste des invités',
      ),
    },
  },
  {
    context: 'neighbourhood',
    text: {
      pt: 'No teu bairro falta água há uma semana. O que fazes?',
      en: 'Your neighbourhood has had no water for a week. What do you do?',
      fr: 'Ton quartier n’a pas d’eau depuis une semaine. Que fais-tu ?',
    },
    cards: {
      R: card(
        'drop',
        'Procuro onde está a avaria e ajudo a consertar',
        'Look for where the fault is and help fix it',
        'Je cherche où est la panne et j’aide à la réparer',
      ),
      I: card(
        'search',
        'Pergunto e investigo até descobrir a causa',
        'Ask around and investigate until I find the cause',
        'Je demande et j’enquête jusqu’à trouver la cause',
      ),
      A: card(
        'camera',
        'Faço um vídeo para mostrar o problema',
        'Make a video to show the problem',
        'Je fais une vidéo pour montrer le problème',
      ),
      S: card(
        'heart',
        'Ajudo os vizinhos mais velhos a arranjar água',
        'Help the older neighbours get water',
        'J’aide les voisins âgés à trouver de l’eau',
      ),
      E: card(
        'users',
        'Junto os vizinhos e vou falar com quem manda',
        'Rally the neighbours and go and speak to those in charge',
        'Je rassemble les voisins et je vais parler aux responsables',
      ),
      C: card(
        'document',
        'Escrevo a queixa certa e guardo os papéis',
        'Write the right complaint and keep the papers',
        'J’écris la bonne plainte et je garde les papiers',
      ),
    },
  },
  {
    context: 'phone',
    text: {
      pt: 'Compras um telemóvel novo. O que te dá mais gosto?',
      en: 'You buy a new phone. What do you enjoy most?',
      fr: 'Tu achètes un nouveau téléphone. Qu’est-ce qui te plaît le plus ?',
    },
    cards: {
      R: card(
        'gear',
        'Mexer nele e ver como é por dentro',
        'Tinker with it and see how it works inside',
        'Le démonter et voir comment il est fait à l’intérieur',
      ),
      I: card(
        'chart',
        'Ler as características e comparar modelos',
        'Read the specs and compare models',
        'Lire les caractéristiques et comparer les modèles',
      ),
      A: card(
        'camera',
        'Escolher o fundo de ecrã e tirar as primeiras fotos',
        'Pick the wallpaper and take the first photos',
        'Choisir le fond d’écran et prendre les premières photos',
      ),
      S: card(
        'phone',
        'Ensinar um familiar a usá-lo',
        'Show a relative how to use it',
        'Apprendre à un proche à s’en servir',
      ),
      E: card(
        'briefcase',
        'Vender o antigo pelo melhor preço',
        'Sell the old one for the best price',
        'Vendre l’ancien au meilleur prix',
      ),
      C: card(
        'document',
        'Organizar os contactos e as aplicações',
        'Organise the contacts and the apps',
        'Organiser les contacts et les applications',
      ),
    },
  },
  {
    context: 'family',
    text: {
      pt: 'Um familiar adoece em casa. O que tens vontade de fazer?',
      en: 'A relative falls ill at home. What do you feel like doing?',
      fr: 'Un proche tombe malade à la maison. Qu’as-tu envie de faire ?',
    },
    cards: {
      R: card(
        'helmet',
        'Arrumar o quarto e preparar tudo o que é preciso',
        'Tidy the room and get everything ready',
        'Ranger la chambre et préparer tout ce qu’il faut',
      ),
      I: card(
        'search',
        'Pesquisar o que pode ser e como se trata',
        'Look up what it could be and how it is treated',
        'Chercher ce que ça peut être et comment ça se soigne',
      ),
      A: card(
        'volume',
        'Fazer-lhe companhia com música e histórias',
        'Keep them company with music and stories',
        'Lui tenir compagnie avec de la musique et des histoires',
      ),
      S: card(
        'heart',
        'Cuidar dessa pessoa e ouvir o que sente',
        'Care for them and listen to how they feel',
        'Prendre soin d’elle et écouter ce qu’elle ressent',
      ),
      E: card(
        'target',
        'Tratar de tudo e decidir com a família o que fazer',
        'Take charge and decide with the family what to do',
        'Prendre les choses en main et décider avec la famille',
      ),
      C: card(
        'calendar',
        'Organizar as consultas e os medicamentos',
        'Organise the appointments and the medicines',
        'Organiser les rendez-vous et les médicaments',
      ),
    },
  },
  {
    context: 'school',
    text: {
      pt: 'O professor pede um trabalho de grupo sobre Angola. Qual é a tua parte?',
      en: 'The teacher sets a group project on Angola. What is your part?',
      fr: 'Le professeur demande un travail de groupe sur l’Angola. Quelle est ta part ?',
    },
    cards: {
      R: card('ruler', 'Construir a maqueta', 'Build the model', 'Construire la maquette'),
      I: card(
        'book',
        'Pesquisar e confirmar os factos',
        'Research and check the facts',
        'Chercher et vérifier les faits',
      ),
      A: card(
        'palette',
        'Fazer o desenho ou o vídeo',
        'Do the drawing or the video',
        'Faire le dessin ou la vidéo',
      ),
      S: card(
        'users',
        'Garantir que todos do grupo participam',
        'Make sure everyone in the group takes part',
        'Veiller à ce que tout le groupe participe',
      ),
      E: card(
        'mic',
        'Liderar o grupo e apresentar à turma',
        'Lead the group and present to the class',
        'Diriger le groupe et présenter à la classe',
      ),
      C: card(
        'pencil',
        'Organizar o texto e rever os erros',
        'Organise the text and check for mistakes',
        'Organiser le texte et relire les erreurs',
      ),
    },
  },
  {
    context: 'work',
    text: {
      pt: 'Arranjas um biscato nas férias. Qual preferias?',
      en: 'You find a holiday job. Which would you prefer?',
      fr: 'Tu trouves un petit boulot pendant les vacances. Lequel préfères-tu ?',
    },
    cards: {
      R: card(
        'helmet',
        'Ajudar numa obra ou numa oficina',
        'Help on a building site or in a workshop',
        'Aider sur un chantier ou dans un atelier',
      ),
      I: card(
        'chart',
        'Ajudar num estudo ou num inquérito',
        'Help with a study or a survey',
        'Aider pour une étude ou une enquête',
      ),
      A: card(
        'camera',
        'Fotografar eventos ou decorar festas',
        'Photograph events or decorate parties',
        'Photographier des événements ou décorer des fêtes',
      ),
      S: card(
        'chalkboard',
        'Ser explicador ou monitor de crianças',
        'Be a tutor or a children’s activity leader',
        'Être répétiteur ou animateur pour enfants',
      ),
      E: card(
        'briefcase',
        'Vender numa loja ou numa feira',
        'Sell in a shop or at a fair',
        'Vendre dans un magasin ou à une foire',
      ),
      C: card(
        'document',
        'Trabalhar num escritório a arquivar e digitar',
        'Work in an office filing and typing',
        'Travailler dans un bureau à classer et à saisir',
      ),
    },
  },
  {
    context: 'money',
    text: {
      pt: 'Recebes dinheiro para um projeto teu. O que fazes primeiro?',
      en: 'You are given money for a project of your own. What do you do first?',
      fr: 'On te donne de l’argent pour un projet à toi. Que fais-tu d’abord ?',
    },
    cards: {
      R: card(
        'gear',
        'Compro as ferramentas e começo a fazer',
        'Buy the tools and start making',
        'J’achète les outils et je commence à fabriquer',
      ),
      I: card(
        'brain',
        'Estudo primeiro qual é a melhor ideia',
        'Study first which idea is best',
        'J’étudie d’abord quelle est la meilleure idée',
      ),
      A: card(
        'palette',
        'Crio algo bonito e diferente de tudo',
        'Create something beautiful and different',
        'Je crée quelque chose de beau et de différent',
      ),
      S: card(
        'heart',
        'Penso em como vai ajudar a minha comunidade',
        'Think about how it will help my community',
        'Je pense à comment ça aidera ma communauté',
      ),
      E: card(
        'target',
        'Planeio como o fazer crescer num negócio',
        'Plan how to grow it into a business',
        'Je prévois comment en faire une affaire qui grandit',
      ),
      C: card(
        'wallet',
        'Faço o orçamento e guardo cada recibo',
        'Make the budget and keep every receipt',
        'Je fais le budget et je garde chaque reçu',
      ),
    },
  },
  {
    context: 'free',
    text: {
      pt: 'Tens um sábado livre, sem nada marcado. Como o passas?',
      en: 'You have a free Saturday with nothing planned. How do you spend it?',
      fr: 'Tu as un samedi libre, sans rien de prévu. Comment le passes-tu ?',
    },
    cards: {
      R: card(
        'sprout',
        'A tratar da horta ou a arranjar algo em casa',
        'Looking after the garden or fixing something at home',
        'À m’occuper du potager ou à réparer quelque chose à la maison',
      ),
      I: card(
        'book',
        'A ler ou a ver vídeos para aprender algo novo',
        'Reading or watching videos to learn something new',
        'À lire ou à regarder des vidéos pour apprendre quelque chose',
      ),
      A: card(
        'pencil',
        'A desenhar, a escrever ou a fazer música',
        'Drawing, writing or making music',
        'À dessiner, écrire ou faire de la musique',
      ),
      S: card(
        'users',
        'Com amigos ou a ajudar alguém',
        'With friends or helping someone',
        'Avec des amis ou à aider quelqu’un',
      ),
      E: card(
        'briefcase',
        'A tratar de uma venda ou de um projeto meu',
        'Working on a sale or a project of mine',
        'À m’occuper d’une vente ou d’un projet à moi',
      ),
      C: card(
        'calendar',
        'A arrumar tudo e a planear a semana',
        'Tidying everything and planning the week',
        'À tout ranger et à planifier la semaine',
      ),
    },
  },
  {
    context: 'future',
    text: {
      pt: 'Daqui a dez anos, o que gostavas de poder dizer do teu trabalho?',
      en: 'Ten years from now, what would you like to say about your work?',
      fr: 'Dans dix ans, que voudrais-tu pouvoir dire de ton travail ?',
    },
    cards: {
      R: card(
        'ruler',
        'Construí e consertei coisas que duram',
        'I built and fixed things that last',
        'J’ai construit et réparé des choses qui durent',
      ),
      I: card(
        'atom',
        'Descobri respostas que ninguém tinha',
        'I found answers nobody had',
        'J’ai trouvé des réponses que personne n’avait',
      ),
      A: card(
        'palette',
        'Criei coisas de que as pessoas gostam',
        'I created things people love',
        'J’ai créé des choses que les gens aiment',
      ),
      S: card(
        'heart',
        'Ajudei muita gente a viver melhor',
        'I helped many people live better',
        'J’ai aidé beaucoup de gens à mieux vivre',
      ),
      E: card(
        'target',
        'Liderei e fiz crescer uma empresa',
        'I led and grew a company',
        'J’ai dirigé et fait grandir une entreprise',
      ),
      C: card(
        'scale',
        'Deixei tudo bem organizado e sem falhas',
        'I left everything well organised and error-free',
        'J’ai tout laissé bien organisé et sans failles',
      ),
    },
  },
]

const STATEMENT_ITEMS = STATEMENTS[RIASEC_KEYS[0]].length

/** Where a situation falls among the 42: after the 2nd and the 5th statement of every block of seven. */
const isSituationSlot = (position: number) => position % 7 === 2 || position % 7 === 5

/**
 * The 42 questions in the order the person answers them: the statements go R, I, A, S, E, C so no interest comes in
 * a block, and a situation comes after every two or three of them. Each situation shows its cards in a different
 * rotation, so every interest is in every position the same number of times.
 */
export function questions(locale: Locale): AssessmentQuestion[] {
  const statements = Array.from({ length: STATEMENT_ITEMS }, (_, round) =>
    RIASEC_KEYS.map((dimension): AssessmentQuestion => ({
      kind: 'statement',
      id: `${dimension}${round + 1}`,
      dimension,
      text: STATEMENTS[dimension][round]?.[locale] ?? '',
    })),
  ).flat()
  const situations = SITUATIONS.map((situation, index): AssessmentQuestion => {
    const options = RIASEC_KEYS.map((_, at): SituationOption => {
      const dimension = RIASEC_KEYS[(at + index) % RIASEC_KEYS.length] ?? 'R'
      const { icon, text } = situation.cards[dimension]
      return { dimension, icon, text: text[locale] }
    })
    return {
      kind: 'situation',
      id: `X${index + 1}`,
      context: situation.context,
      text: situation.text[locale],
      options,
    }
  })

  const list: AssessmentQuestion[] = []
  const total = statements.length + situations.length
  for (let position = 0; position < total; position++) {
    const next = isSituationSlot(position) ? situations.shift() : statements.shift()
    list.push((next ?? situations.shift() ?? statements.shift()) as AssessmentQuestion)
  }
  return list
}

/** In Portuguese, the source language (tests and code that only needs the ids). */
export const QUESTIONS = questions('pt')
