import type { Locale } from '../../lib/i18n'
import type { AssessmentQuestion, RiasecKey } from '../types'

type Statement = Record<Locale, string>

// DEMO DATA: 42 RIASEC statements, 7 per dimension, for every area of the catalogue (ADR 0017): health,
// education, law, business, farming, building, hotels, transport, the arts, the humanities and, at most
// once per dimension, technology. Each one completes "Quanto gostas de…". The ids never change, so the
// answers already saved stay valid. Validation with real users is part of Fase 1 (roadmap, 1.2).
const ITEMS: Record<RiasecKey, Statement[]> = {
  R: [
    {
      pt: 'cuidar de plantas, de uma horta ou de animais',
      en: 'looking after plants, a vegetable garden or animals',
      fr: 't’occuper de plantes, d’un potager ou d’animaux',
    },
    {
      pt: 'reparar uma mota, um gerador ou uma bomba de água',
      en: 'fixing a motorbike, a generator or a water pump',
      fr: 'réparer une moto, un groupe électrogène ou une pompe à eau',
    },
    {
      pt: 'construir coisas com as tuas mãos, como um móvel ou uma parede',
      en: 'building things with your hands, like a piece of furniture or a wall',
      fr: 'construire des choses de tes mains, comme un meuble ou un mur',
    },
    {
      pt: 'fazer uma instalação elétrica ou de canalização',
      en: 'wiring a house or fitting the plumbing',
      fr: 'faire une installation électrique ou de plomberie',
    },
    {
      pt: 'conduzir, carregar e entregar mercadorias',
      en: 'driving, loading and delivering goods',
      fr: 'conduire, charger et livrer des marchandises',
    },
    {
      pt: 'cozinhar para muitas pessoas numa cozinha a sério',
      en: 'cooking for many people in a real kitchen',
      fr: 'cuisiner pour beaucoup de monde dans une vraie cuisine',
    },
    {
      pt: 'montar ou reparar um computador ou um telemóvel',
      en: 'putting together or fixing a computer or a phone',
      fr: 'monter ou réparer un ordinateur ou un téléphone',
    },
  ],
  I: [
    {
      pt: 'descobrir porque é que uma pessoa ficou doente',
      en: 'finding out why someone fell ill',
      fr: 'découvrir pourquoi quelqu’un est tombé malade',
    },
    {
      pt: 'fazer experiências num laboratório',
      en: 'doing experiments in a lab',
      fr: 'faire des expériences dans un laboratoire',
    },
    {
      pt: 'perceber porque é que uma colheita correu mal',
      en: 'working out why a harvest went wrong',
      fr: 'comprendre pourquoi une récolte a mal tourné',
    },
    {
      pt: 'analisar números para perceber o que está a acontecer',
      en: 'looking at numbers to understand what is going on',
      fr: 'analyser des chiffres pour comprendre ce qui se passe',
    },
    {
      pt: 'investigar um caso até encontrar a verdade',
      en: 'investigating a case until you find the truth',
      fr: 'enquêter sur une affaire jusqu’à trouver la vérité',
    },
    {
      pt: 'pesquisar a história de Angola e de outros povos',
      en: 'researching the history of Angola and other peoples',
      fr: 'faire des recherches sur l’histoire de l’Angola et d’autres peuples',
    },
    {
      pt: 'resolver um problema de lógica ou de programação',
      en: 'solving a logic or coding puzzle',
      fr: 'résoudre un problème de logique ou de programmation',
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
      pt: 'criar roupa, penteados ou maquilhagem',
      en: 'designing clothes, hairstyles or make-up',
      fr: 'créer des vêtements, des coiffures ou du maquillage',
    },
    {
      pt: 'decorar uma sala, uma montra ou uma festa',
      en: 'decorating a room, a shop window or a party',
      fr: 'décorer une pièce, une vitrine ou une fête',
    },
    {
      pt: 'imaginar como devia ser o ecrã de uma app',
      en: 'imagining what an app screen should look like',
      fr: 'imaginer à quoi devrait ressembler l’écran d’une appli',
    },
  ],
  S: [
    {
      pt: 'cuidar de alguém doente',
      en: 'caring for someone who is ill',
      fr: 'prendre soin de quelqu’un de malade',
    },
    {
      pt: 'ajudar um colega a estudar',
      en: 'helping a classmate study',
      fr: 'aider un camarade à réviser',
    },
    {
      pt: 'ouvir os problemas de um amigo e dar conselhos',
      en: 'listening to a friend’s problems and giving advice',
      fr: 'écouter les problèmes d’un ami et lui donner des conseils',
    },
    {
      pt: 'dar aulas a crianças',
      en: 'teaching children',
      fr: 'faire la classe à des enfants',
    },
    {
      pt: 'organizar atividades no teu bairro, igreja ou associação',
      en: 'organising activities in your neighbourhood, church or club',
      fr: 'organiser des activités dans ton quartier, ton église ou ton association',
    },
    {
      pt: 'receber e orientar as pessoas que chegam a um serviço',
      en: 'welcoming and guiding the people who come to a service',
      fr: 'accueillir et orienter les personnes qui arrivent dans un service',
    },
    {
      pt: 'ensinar alguém a usar o telemóvel ou o computador',
      en: 'showing someone how to use a phone or a computer',
      fr: 'apprendre à quelqu’un à se servir d’un téléphone ou d’un ordinateur',
    },
  ],
  E: [
    {
      pt: 'vender na praça ou online',
      en: 'selling at the market or online',
      fr: 'vendre au marché ou en ligne',
    },
    {
      pt: 'liderar um grupo e tomar decisões',
      en: 'leading a group and making decisions',
      fr: 'diriger un groupe et prendre des décisions',
    },
    {
      pt: 'abrir e fazer crescer o teu próprio negócio',
      en: 'starting and growing your own business',
      fr: 'lancer et faire grandir ta propre affaire',
    },
    {
      pt: 'convencer alguém a apoiar uma ideia tua',
      en: 'persuading someone to back one of your ideas',
      fr: 'convaincre quelqu’un de soutenir une de tes idées',
    },
    {
      pt: 'negociar um preço ou um acordo',
      en: 'negotiating a price or a deal',
      fr: 'négocier un prix ou un accord',
    },
    {
      pt: 'defender alguém numa discussão ou num tribunal',
      en: 'standing up for someone in an argument or in court',
      fr: 'défendre quelqu’un dans une discussion ou devant un tribunal',
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
      pt: 'organizar documentos e arquivos',
      en: 'organising documents and records',
      fr: 'classer des documents et des archives',
    },
    {
      pt: 'registar o que entra e sai de um armazém',
      en: 'recording what comes in and goes out of a warehouse',
      fr: 'noter ce qui entre et sort d’un entrepôt',
    },
    {
      pt: 'preencher formulários e seguir as regras com cuidado',
      en: 'filling in forms and following the rules carefully',
      fr: 'remplir des formulaires et suivre les règles avec soin',
    },
    {
      pt: 'rever um trabalho até não haver nenhum erro',
      en: 'checking a piece of work until there are no mistakes',
      fr: 'relire un travail jusqu’à ce qu’il n’y ait plus aucune erreur',
    },
    {
      pt: 'planear horários, turnos ou uma viagem ao pormenor',
      en: 'planning timetables, shifts or a trip in detail',
      fr: 'planifier des horaires, des équipes ou un voyage dans le détail',
    },
    {
      pt: 'organizar dados numa folha de Excel',
      en: 'organising data in an Excel sheet',
      fr: 'organiser des données dans une feuille Excel',
    },
  ],
}

const ORDER: RiasecKey[] = ['R', 'I', 'A', 'S', 'E', 'C']

/** Interleaved R, I, A, S, E, C so no dimension comes in a block; the text in the person's language. */
export function questions(locale: Locale): AssessmentQuestion[] {
  return ITEMS.R.flatMap((_, round) =>
    ORDER.map((dimension) => ({
      id: `${dimension}${round + 1}`,
      dimension,
      text: ITEMS[dimension][round]?.[locale] ?? '',
    })),
  )
}

/** In Portuguese, the source language (tests and code that only needs the ids). */
export const QUESTIONS = questions('pt')
