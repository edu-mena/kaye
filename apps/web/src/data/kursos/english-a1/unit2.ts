import type { UnitContent } from '../types'

// Unit 2: pronouns and possessives. Adapted from English Grammar (Wikibooks, CC BY-SA 4.0) and
// An English Grammar (Baskervill and Sewell, public domain); see the credits.

const unit: UnitContent = {
  lessons: [
    {
      id: 'l1',
      title: 'Pronomes de complemento: me, him, us',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'Sujeito e complemento',
          body: [
            'Na unidade 1 viste os pronomes que fazem a ação (sujeito): I, you, he, she, it, we, they. Quando a pessoa recebe a ação, o pronome muda: She helps me (ela ajuda-me), I call him (eu ligo-lhe).',
            'Em português o pronome vai muitas vezes antes ou colado ao verbo (ajuda-me, liga-lhe). Em inglês vem sempre depois do verbo ou depois de uma preposição: with me, for her, to them.',
          ],
        },
        {
          type: 'table',
          caption: 'Pronomes pessoais',
          head: ['Sujeito', 'Complemento', 'Em português'],
          rows: [
            ['I', 'me', 'me, mim'],
            ['you', 'you', 'te, ti, você'],
            ['he', 'him', 'o, lhe, ele'],
            ['she', 'her', 'a, lhe, ela'],
            ['it', 'it', 'o, a (coisa)'],
            ['we', 'us', 'nos, nós'],
            ['they', 'them', 'os, as, lhes, eles'],
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: 'Antes do verbo usa a forma de sujeito; depois do verbo ou de uma preposição (with, for, to, about) usa a de complemento. Ela e eu: She and I are friends (sujeito). Connosco: Come with us (complemento).',
        },
        {
          type: 'examples',
          items: [
            { text: 'The teacher knows me.', note: 'O professor conhece-me.' },
            { text: 'Call him tomorrow.', note: 'Liga-lhe amanhã.' },
            { text: 'This message is for her.', note: 'Esta mensagem é para ela.' },
            { text: 'Can you help us?', note: 'Podes ajudar-nos?' },
            { text: 'I like them.', note: 'Gosto deles.' },
            { text: 'Where is my phone? I need it.', note: 'Onde está o meu telefone? Preciso dele.' },
          ],
        },
        {
          type: 'exercise',
          id: 'u2l1-a',
          kind: 'choice',
          instruction: 'Escolhe o pronome certo.',
          items: [
            {
              prompt: 'Maria is my friend. I see ___ every day.',
              options: ['she', 'her', 'hers'],
              answer: 1,
            },
            {
              prompt: 'Paulo and I are colleagues. The boss pays ___ on Friday.',
              options: ['we', 'us', 'our'],
              answer: 1,
            },
            { prompt: '___ is a nurse.', options: ['Him', 'He', 'His'], answer: 1 },
            { prompt: 'These books are for ___.', options: ['they', 'them', 'their'], answer: 1 },
          ],
        },
        {
          type: 'exercise',
          id: 'u2l1-b',
          kind: 'gap',
          instruction: 'Troca as palavras entre parênteses por um pronome.',
          items: [
            { prompt: 'I know (Mr. Kiala). → I know ___.', answers: ['him'] },
            { prompt: 'Talk to (Rosa and Ana). → Talk to ___.', answers: ['them'] },
            { prompt: 'Is this for (my brother and me)? → Is this for ___?', answers: ['us'] },
          ],
        },
        {
          type: 'summary',
          points: [
            'Complemento: me, you, him, her, it, us, them.',
            'Depois do verbo e das preposições usa-se sempre esta forma.',
          ],
        },
      ],
    },
    {
      id: 'l2',
      title: 'Possessivos: my, your, his, her',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'De quem é',
          body: [
            'Os possessivos dizem a quem pertence uma coisa e vêm antes do nome: my phone, her school. Não mudam com o número da coisa: my book, my books.',
            'A grande diferença para o português: o possessivo concorda com o dono, não com a coisa. "O pai dela" é her father; "o pai dele" é his father. Em português "seu pai" pode ser de qualquer um; em inglês nunca há dúvida.',
          ],
        },
        {
          type: 'table',
          caption: 'Adjetivos possessivos',
          head: ['Pronome', 'Possessivo', 'Exemplo'],
          rows: [
            ['I', 'my', 'my name'],
            ['you', 'your', 'your house'],
            ['he', 'his', 'his job'],
            ['she', 'her', 'her mother'],
            ['it', 'its', 'its colour'],
            ['we', 'our', 'our team'],
            ['they', 'their', 'their children'],
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: "Escolhe o possessivo pelo dono: homem → his, mulher → her, coisa → its, várias pessoas → their. Não se usa artigo antes: my car, nunca the my car. Lembra-te: its (possessivo) não leva apóstrofo; it's é it is.",
        },
        {
          type: 'rule',
          title: 'their, there e they’re',
          body: "Soam quase igual e confundem-se muito: their = deles (their house); there = lá (over there); they're = they are.",
        },
        {
          type: 'examples',
          items: [
            { text: 'My name is Edna.', note: 'O meu nome é Edna.' },
            { text: 'Kiala is with his sister.', note: 'O Kiala está com a irmã (dele).' },
            { text: 'Teresa is with her brother.', note: 'A Teresa está com o irmão (dela).' },
            { text: 'Our school is in Viana.', note: 'A nossa escola é em Viana.' },
            { text: 'The company and its workers.', note: 'A empresa e os seus trabalhadores.' },
            { text: 'Their office is on the second floor.', note: 'O escritório deles é no segundo andar.' },
          ],
        },
        {
          type: 'exercise',
          id: 'u2l2-a',
          kind: 'choice',
          instruction: 'Escolhe o possessivo.',
          items: [
            { prompt: 'Ana lives with ___ grandmother.', options: ['his', 'her', 'their'], answer: 1 },
            { prompt: 'Mateus and ___ wife are in Lobito.', options: ['his', 'her', 'its'], answer: 0 },
            {
              prompt: 'The students are with ___ teacher.',
              options: ['there', 'their', "they're"],
              answer: 1,
            },
            { prompt: 'The dog is in ___ house.', options: ["it's", 'its', 'his'], answer: 1 },
          ],
        },
        {
          type: 'exercise',
          id: 'u2l2-b',
          kind: 'gap',
          instruction: 'Completa com o possessivo.',
          items: [
            { prompt: 'I am Rui. ___ surname is Neto.', answers: ['my'] },
            { prompt: 'We are a team. ___ team is from Cuanza Sul.', answers: ['our'] },
            { prompt: 'Are you Mr. Lopes? Is this ___ bag?', answers: ['your'] },
          ],
        },
        {
          type: 'exercise',
          id: 'u2l2-c',
          kind: 'match',
          instruction: 'Liga o pronome ao possessivo.',
          items: [
            { left: 'he', right: 'his' },
            { left: 'she', right: 'her' },
            { left: 'we', right: 'our' },
            { left: 'they', right: 'their' },
          ],
        },
        {
          type: 'summary',
          points: [
            'my, your, his, her, its, our, their: antes do nome, sem artigo.',
            'Concorda com o dono: his (dele), her (dela).',
            "its ≠ it's; their ≠ there ≠ they're.",
          ],
        },
      ],
    },
    {
      id: 'l3',
      title: 'mine, yours e o ’s do possessivo',
      estimatedMinutes: 20,
      blocks: [
        {
          type: 'text',
          title: 'Sem o nome a seguir',
          body: [
            'Quando não repetes o nome, usas os pronomes possessivos: This phone is mine (este telefone é meu). Substituem o possessivo e o nome juntos: my phone → mine.',
          ],
        },
        {
          type: 'table',
          caption: 'Possessivo com e sem nome',
          head: ['Com nome', 'Sem nome'],
          rows: [
            ['my bag', 'mine'],
            ['your bag', 'yours'],
            ['his bag', 'his'],
            ['her bag', 'hers'],
            ['our bag', 'ours'],
            ['their bag', 'theirs'],
          ],
        },
        {
          type: 'rule',
          title: 'O ’s',
          body: "Para dizer de quem é uma coisa com o nome do dono, junta 's ao dono e põe a coisa a seguir: Ana's phone (o telefone da Ana). Se o dono é plural e já acaba em s, junta só o apóstrofo: the students' room (a sala dos estudantes). Para perguntar de quem é: Whose bag is this?",
        },
        {
          type: 'rule',
          title: "O 's tem dois usos",
          body: "Ana's phone = o telefone da Ana (possessivo). Ana's here = Ana is here (contração de is). Decide pelo que vem a seguir: um nome indica posse.",
        },
        {
          type: 'examples',
          items: [
            { text: 'Is this pen yours? Yes, it is mine.', note: 'Esta caneta é tua? Sim, é minha.' },
            { text: "This is Pedro's car.", note: 'Este é o carro do Pedro.' },
            { text: "My mother's shop is in Kilamba.", note: 'A loja da minha mãe é no Kilamba.' },
            { text: "The workers' uniforms are blue.", note: 'Os uniformes dos trabalhadores são azuis.' },
            { text: "Whose keys are these? They're hers.", note: 'De quem são estas chaves? São dela.' },
          ],
        },
        {
          type: 'exercise',
          id: 'u2l3-a',
          kind: 'choice',
          instruction: 'Escolhe a opção correta.',
          items: [
            { prompt: 'This book is ___.', options: ['my', 'mine', 'me'], answer: 1 },
            {
              prompt: 'O telefone da Joana.',
              options: ["Joana's phone", "the phone's Joana", 'Joana phone'],
              answer: 0,
            },
            { prompt: '___ jacket is this?', options: ['Who', 'Whose', "Who's"], answer: 1 },
            { prompt: 'Are these bags ___? (de vocês)', options: ['your', 'yours', "your's"], answer: 1 },
          ],
        },
        {
          type: 'exercise',
          id: 'u2l3-b',
          kind: 'gap',
          instruction: 'Completa com mine, yours, his, hers, ours ou theirs.',
          items: [
            { prompt: "It's my laptop. It's ___.", answers: ['mine'] },
            { prompt: "It's Teresa's notebook. It's ___.", answers: ['hers'] },
            { prompt: "It's our classroom. It's ___.", answers: ['ours'] },
          ],
        },
        {
          type: 'exercise',
          id: 'u2l3-c',
          kind: 'order',
          instruction: 'Ordena as palavras.',
          items: [
            { words: ['car', 'is', "father's", 'This', 'my'], answer: "This is my father's car" },
            { words: ['is', 'Whose', 'this', 'phone'], answer: 'Whose phone is this' },
          ],
        },
        {
          type: 'summary',
          points: [
            'Sem nome a seguir: mine, yours, his, hers, ours, theirs (sem apóstrofo).',
            "Dono + 's + coisa: Ana's phone; plural em s: the students' room.",
            'Whose…? pergunta de quem é.',
          ],
        },
      ],
    },
  ],
  review: [
    {
      type: 'exercise',
      id: 'u2r-a',
      kind: 'choice',
      instruction: 'Escolhe a opção correta.',
      items: [
        { prompt: 'Nzinga is with ___ cousin.', options: ['his', 'her', 'hers'], answer: 1 },
        { prompt: 'Please call ___ (a mim).', options: ['I', 'me', 'my'], answer: 1 },
        { prompt: 'The house is ___ (nossa).', options: ['our', 'ours', 'us'], answer: 1 },
        {
          prompt: 'Os livros dos alunos.',
          options: ["the students' books", "the student's books", 'the students books'],
          answer: 0,
        },
      ],
    },
    {
      type: 'exercise',
      id: 'u2r-b',
      kind: 'gap',
      instruction: 'Completa.',
      items: [
        { prompt: 'Carlos and ___ brother are pilots. (dele)', answers: ['his'] },
        { prompt: 'I like ___. (deles)', answers: ['them'] },
        { prompt: '___ book is this? (de quem)', answers: ['whose'] },
        { prompt: 'The company changed ___ logo. (dela, coisa)', answers: ['its'] },
      ],
    },
    {
      type: 'exercise',
      id: 'u2r-c',
      kind: 'match',
      instruction: 'Liga as formas da mesma pessoa.',
      items: [
        { left: 'I', right: 'mine' },
        { left: 'she', right: 'hers' },
        { left: 'they', right: 'theirs' },
      ],
    },
  ],
}

export default unit
