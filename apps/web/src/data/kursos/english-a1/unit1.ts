import type { UnitContent } from '../types'

// Unit 1: the verb "to be". Adapted from English Grammar (Wikibooks, CC BY-SA 4.0); see the credits.

const unit: UnitContent = {
  lessons: [
    {
      id: 'l1',
      title: 'I am, you are, he is',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'Para que serve',
          body: [
            'O verbo to be corresponde, em português, a ser e a estar ao mesmo tempo. O inglês não faz essa distinção: I am a student (sou estudante) e I am in Luanda (estou em Luanda) usam o mesmo verbo.',
            'É o verbo mais usado da língua. Com ele dizes o teu nome, a tua idade, de onde és, onde estás e como te sentes.',
          ],
        },
        {
          type: 'table',
          caption: 'Presente do verbo to be (afirmativa)',
          head: ['Pronome', 'Verbo', 'Em português'],
          rows: [
            ['I', 'am', 'eu sou / estou'],
            ['you', 'are', 'tu és / estás, você é'],
            ['he', 'is', 'ele é / está'],
            ['she', 'is', 'ela é / está'],
            ['it', 'is', 'é / está (coisa, animal)'],
            ['we', 'are', 'nós somos / estamos'],
            ['you', 'are', 'vocês são / estão'],
            ['they', 'are', 'eles, elas são / estão'],
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: 'I leva sempre am. He, she e it levam is. You, we e they levam are. O pronome I escreve-se sempre com maiúscula, mesmo no meio da frase.',
        },
        {
          type: 'text',
          title: 'O sujeito nunca falta',
          body: [
            'Em português podes dizer só "sou de Benguela". Em inglês o sujeito é obrigatório: I am from Benguela, nunca Am from Benguela.',
            'It usa-se para coisas, animais e para falar do tempo e das horas: It is hot today. It is a phone.',
          ],
        },
        {
          type: 'examples',
          items: [
            { text: 'I am Nzinga. I am 17.', note: 'Sou a Nzinga. Tenho 17 anos.' },
            { text: 'You are a good student.', note: 'És um bom estudante.' },
            { text: 'Mateus is a nurse in Huambo.', note: 'O Mateus é enfermeiro no Huambo.' },
            { text: 'She is at the market.', note: 'Ela está no mercado.' },
            { text: 'It is hot in Luanda.', note: 'Está calor em Luanda.' },
            { text: 'We are from Lubango.', note: 'Somos do Lubango.' },
            { text: 'They are at work.', note: 'Eles estão no trabalho.' },
          ],
        },
        {
          type: 'rule',
          title: 'Atenção à idade',
          body: 'A idade diz-se com to be, não com "ter": I am 20 (years old). Dizer I have 20 years é um erro comum de quem fala português.',
        },
        {
          type: 'exercise',
          id: 'u1l1-a',
          kind: 'choice',
          instruction: 'Escolhe a forma correta do verbo.',
          items: [
            { prompt: 'I ___ from Malanje.', options: ['am', 'is', 'are'], answer: 0 },
            { prompt: 'Kiala ___ a mechanic.', options: ['am', 'is', 'are'], answer: 1 },
            { prompt: 'We ___ students.', options: ['am', 'is', 'are'], answer: 2 },
            { prompt: 'It ___ a laptop.', options: ['am', 'is', 'are'], answer: 1 },
            { prompt: 'You ___ my friend.', options: ['am', 'is', 'are'], answer: 2 },
          ],
        },
        {
          type: 'exercise',
          id: 'u1l1-b',
          kind: 'gap',
          instruction: 'Completa com am, is ou are.',
          items: [
            { prompt: 'My sister ___ 19.', answers: ['is'] },
            { prompt: 'Ana and Rosa ___ in Cabinda.', answers: ['are'] },
            { prompt: 'I ___ at home.', answers: ['am'] },
            { prompt: 'The bus ___ late.', answers: ['is'] },
          ],
        },
        {
          type: 'exercise',
          id: 'u1l1-c',
          kind: 'match',
          instruction: 'Liga cada pronome ao verbo certo.',
          items: [
            { left: 'I', right: 'am' },
            { left: 'she', right: 'is' },
            { left: 'they', right: 'are' },
          ],
        },
        {
          type: 'summary',
          points: [
            'to be = ser e estar.',
            'I am · he/she/it is · you/we/they are.',
            'O sujeito é obrigatório e I escreve-se sempre com maiúscula.',
            'A idade diz-se com to be: I am 18.',
          ],
        },
      ],
    },
    {
      id: 'l2',
      title: 'A negativa e as contrações',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'Como se nega',
          body: [
            'Para negar, põe not depois do verbo: I am not, she is not, they are not. Não há outra palavra a acrescentar, ao contrário de outros verbos que vais ver na unidade 4.',
          ],
        },
        {
          type: 'table',
          caption: 'Formas completas e contraídas',
          head: ['Completa', 'Contraída', 'Negativa contraída'],
          rows: [
            ['I am', "I'm", "I'm not"],
            ['you are', "you're", "you aren't / you're not"],
            ['he is', "he's", "he isn't / he's not"],
            ['she is', "she's", "she isn't / she's not"],
            ['it is', "it's", "it isn't / it's not"],
            ['we are', "we're", "we aren't / we're not"],
            ['they are', "they're", "they aren't / they're not"],
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: "As contrações são a forma normal de falar e de escrever mensagens. Num documento formal (uma carta de candidatura, um relatório) prefere a forma completa. Não existe amn't: com I usa-se sempre I'm not.",
        },
        {
          type: 'rule',
          title: "it's não é its",
          body: "it's (com apóstrofo) quer dizer it is. its (sem apóstrofo) é o possessivo, que vais ver na unidade 2. O apóstrofo marca as letras que faltam.",
        },
        {
          type: 'examples',
          items: [
            { text: "I'm not tired.", note: 'Não estou cansado.' },
            { text: "Joana isn't at school today.", note: 'A Joana não está na escola hoje.' },
            { text: "We aren't from Luanda. We're from Uíge.", note: 'Não somos de Luanda. Somos do Uíge.' },
            { text: "It isn't expensive.", note: 'Não é caro.' },
            { text: "They're not ready.", note: 'Eles não estão prontos.' },
          ],
        },
        {
          type: 'exercise',
          id: 'u1l2-a',
          kind: 'gap',
          instruction: 'Escreve a forma contraída.',
          items: [
            { prompt: 'I am → ___', answers: ["I'm"] },
            { prompt: 'they are → ___', answers: ["they're"] },
            { prompt: 'she is not → ___', answers: ["she isn't", "she's not"] },
            { prompt: 'we are not → ___', answers: ["we aren't", "we're not"] },
          ],
        },
        {
          type: 'exercise',
          id: 'u1l2-b',
          kind: 'choice',
          instruction: 'Escolhe a frase correta.',
          items: [
            {
              prompt: 'Negativa de "I am late".',
              options: ["I amn't late.", "I'm not late.", "I isn't late."],
              answer: 1,
            },
            {
              prompt: 'Negativa de "He is a doctor".',
              options: ["He isn't a doctor.", "He aren't a doctor.", 'He not is a doctor.'],
              answer: 0,
            },
            { prompt: '"Está frio."', options: ['Its cold.', "It's cold.", 'Is cold.'], answer: 1 },
          ],
        },
        {
          type: 'exercise',
          id: 'u1l2-c',
          kind: 'order',
          instruction: 'Ordena as palavras para fazer uma frase.',
          items: [
            { words: ['not', 'I', 'from', "'m", 'Namibe'], answer: "I'm not from Namibe" },
            { words: ['office', "isn't", 'the', 'in', 'She'], answer: "She isn't in the office" },
          ],
        },
        {
          type: 'summary',
          points: [
            'Negativa: verbo + not (I am not, she is not).',
            "Contrações: I'm, you're, he's, isn't, aren't. Com I: I'm not.",
            "it's = it is; its = possessivo.",
          ],
        },
      ],
    },
    {
      id: 'l3',
      title: 'Perguntas e respostas curtas',
      estimatedMinutes: 20,
      blocks: [
        {
          type: 'text',
          title: 'A inversão',
          body: [
            'Para perguntar, troca a ordem do sujeito e do verbo: You are a student → Are you a student? Em português basta mudar a entoação; em inglês a ordem muda sempre.',
          ],
        },
        {
          type: 'table',
          caption: 'Perguntas e respostas curtas',
          head: ['Pergunta', 'Sim', 'Não'],
          rows: [
            ['Am I late?', 'Yes, you are.', "No, you aren't."],
            ['Are you ready?', 'Yes, I am.', "No, I'm not."],
            ['Is he your brother?', 'Yes, he is.', "No, he isn't."],
            ['Is it far?', 'Yes, it is.', "No, it isn't."],
            ['Are they at home?', 'Yes, they are.', "No, they aren't."],
          ],
        },
        {
          type: 'rule',
          title: 'Respostas curtas',
          body: "Na resposta curta repete-se o pronome e o verbo, sem o resto da frase. No sim não se contrai: Yes, I am (nunca Yes, I'm). No não, a contração é a forma normal: No, I'm not.",
        },
        {
          type: 'table',
          caption: 'Palavras para perguntar',
          head: ['Palavra', 'Significa', 'Exemplo'],
          rows: [
            ['What', 'O quê / qual', "What's your name?"],
            ['Where', 'Onde', 'Where are you from?'],
            ['How old', 'Que idade', 'How old are you?'],
            ['Who', 'Quem', 'Who is she?'],
            ['How', 'Como', 'How are you?'],
          ],
        },
        {
          type: 'examples',
          title: 'Um diálogo numa entrevista de estágio',
          items: [
            { text: "Hello. What's your name?", note: 'Olá. Como te chamas?' },
            { text: "My name is Ndalu. I'm 21.", note: 'Chamo-me Ndalu. Tenho 21 anos.' },
            { text: 'Where are you from?', note: 'De onde és?' },
            {
              text: "I'm from Benguela, but I'm a student in Luanda.",
              note: 'Sou de Benguela, mas estudo em Luanda.',
            },
            { text: 'Are you a student of informatics?', note: 'És estudante de informática?' },
            { text: "Yes, I am. I'm in my third year.", note: 'Sim. Estou no terceiro ano.' },
          ],
        },
        {
          type: 'exercise',
          id: 'u1l3-a',
          kind: 'order',
          instruction: 'Ordena as palavras para fazer a pergunta.',
          items: [
            { words: ['you', 'Are', 'tired'], answer: 'Are you tired' },
            { words: ['from', 'Where', 'is', 'she'], answer: 'Where is she from' },
            { words: ['old', 'are', 'How', 'you'], answer: 'How old are you' },
          ],
        },
        {
          type: 'exercise',
          id: 'u1l3-b',
          kind: 'gap',
          instruction: 'Completa a resposta curta.',
          items: [
            { prompt: 'Is Teresa a teacher? Yes, she ___.', answers: ['is'] },
            { prompt: "Are you hungry? No, I'm ___.", answers: ['not'] },
            { prompt: 'Are they in Huíla? No, they ___.', answers: ["aren't", 'are not'] },
          ],
        },
        {
          type: 'exercise',
          id: 'u1l3-c',
          kind: 'match',
          instruction: 'Liga cada pergunta à resposta.',
          items: [
            { left: "What's your name?", right: "I'm Paulo." },
            { left: 'Where are you from?', right: 'From Huambo.' },
            { left: 'How old are you?', right: "I'm 16." },
            { left: 'How are you?', right: "I'm fine, thanks." },
          ],
        },
        {
          type: 'summary',
          points: [
            'Pergunta: verbo antes do sujeito (Are you…? Is she…?).',
            "Resposta curta: Yes, I am / No, I'm not. No sim não se contrai.",
            'What, where, who, how e how old vêm no início da pergunta.',
          ],
        },
      ],
    },
  ],
  review: [
    {
      type: 'exercise',
      id: 'u1r-a',
      kind: 'choice',
      instruction: 'Escolhe a opção correta.',
      items: [
        { prompt: 'Lukeny ___ an engineer.', options: ['am', 'is', 'are'], answer: 1 },
        { prompt: 'Tenho 18 anos.', options: ['I have 18 years.', "I'm 18.", 'I am 18 years.'], answer: 1 },
        { prompt: 'Are you from Luanda? Yes, ___', options: ["I'm.", 'I am.', 'I is.'], answer: 1 },
        { prompt: '___ cold today.', options: ['Its', "It's", 'Is'], answer: 1 },
      ],
    },
    {
      type: 'exercise',
      id: 'u1r-b',
      kind: 'gap',
      instruction: 'Completa com a forma certa de to be (podes contrair).',
      items: [
        { prompt: 'We ___ not at home.', answers: ['are'] },
        { prompt: '___ your brother a doctor?', answers: ['is'] },
        { prompt: 'I ___ not hungry.', answers: ['am'] },
        { prompt: 'The shops ___ open on Sunday.', answers: ['are'] },
      ],
    },
    {
      type: 'exercise',
      id: 'u1r-c',
      kind: 'order',
      instruction: 'Ordena as palavras.',
      items: [
        { words: ['is', 'your', 'What', 'name'], answer: 'What is your name' },
        { words: ['aren’t', 'They', 'ready'], answer: "They aren't ready" },
      ],
    },
  ],
}

export default unit
