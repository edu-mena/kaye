import type { UnitContent } from '../types'

// Unit 1: what programming is. Adapted from the Python Programming Wikibook and Wikipedia
// (Algorithm, Python; both CC BY-SA 4.0), written from scratch in Portuguese. Identifiers in
// the code are in English, comments and explanations in Portuguese (docs/decisoes/0016, note of
// 13/11 on Programação). No code runs in the page: learners practise in an online editor.

const unit: UnitContent = {
  lessons: [
    {
      id: 'l1',
      title: 'O que é um algoritmo',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'Para que serve',
          body: [
            'Antes de escrever código, é preciso saber o que se quer que o computador faça, passo a passo. A essa lista de passos chama-se algoritmo (algorithm). A palavra vem do nome de al-Khwarizmi, um matemático persa do século IX.',
            'Já usas algoritmos sem lhes chamar assim: uma receita de funje, as indicações para chegar a casa de um amigo, os passos para levantar dinheiro no multibanco.',
          ],
        },
        {
          type: 'rule',
          title: 'Definição',
          body: 'Um algoritmo é uma sequência finita de passos precisos que resolve um problema. Finita: acaba. Precisa: cada passo só pode ser entendido de uma maneira. O computador não adivinha: faz exatamente o que lhe dizes, pela ordem que lhe dizes.',
        },
        {
          type: 'table',
          caption: 'Passo vago ou passo preciso?',
          head: ['Vago', 'Preciso'],
          rows: [
            ['Põe um pouco de água', 'Põe 1 litro de água na panela'],
            ['Espera um bocado', 'Espera até a água ferver'],
            ['Vai até à escola', 'Segue 200 metros pela rua principal e vira à direita na farmácia'],
            ['Dá o troco', 'Subtrai o preço ao valor recebido e entrega a diferença'],
          ],
        },
        {
          type: 'case',
          title: 'O algoritmo do troco na cantina',
          body: [
            'O Kiala ajuda na cantina da escola e quer ensinar um colega novo a dar o troco. Em vez de dizer “faz as contas”, escreve os passos:',
            '1. Lê o preço da refeição. 2. Recebe o dinheiro do aluno. 3. Se o dinheiro for menor do que o preço, pede o que falta e volta ao passo 2. 4. Subtrai o preço ao dinheiro recebido. 5. Entrega essa diferença como troco.',
            'Com estes passos, qualquer pessoa dá o troco da mesma maneira. Um programa é exatamente isto, escrito numa linguagem que o computador entende.',
          ],
        },
        {
          type: 'exercise',
          id: 'pr-u1l1-a',
          kind: 'order',
          instruction: 'Ordena os passos para levantar dinheiro no multibanco.',
          items: [
            {
              words: ['marcar o PIN', 'tirar o dinheiro', 'inserir o cartão', 'escolher o valor'],
              answer: 'inserir o cartão marcar o PIN escolher o valor tirar o dinheiro',
            },
          ],
        },
        {
          type: 'exercise',
          id: 'pr-u1l1-b',
          kind: 'choice',
          instruction: 'Escolhe a resposta certa.',
          items: [
            {
              prompt: 'Um algoritmo é…',
              options: ['uma sequência finita de passos precisos', 'um computador', 'uma app de mensagens'],
              answer: 0,
            },
            {
              prompt: 'Qual destes passos é preciso?',
              options: ['Junta sal q.b.', 'Junta 1 colher de chá de sal', 'Junta o sal que achares'],
              answer: 1,
            },
            {
              prompt: 'O computador…',
              options: [
                'adivinha o que queres',
                'faz exatamente o que lhe dizes',
                'corrige os teus passos sozinho',
              ],
              answer: 1,
            },
          ],
        },
        {
          type: 'summary',
          points: [
            'Algoritmo: sequência finita de passos precisos que resolve um problema.',
            'Receitas e indicações de caminho são algoritmos do dia a dia.',
            'O computador segue os passos à letra, pela ordem dada.',
          ],
        },
      ],
    },
    {
      id: 'l2',
      title: 'Programas, linguagens e o Python',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'Do algoritmo ao programa',
          body: [
            'Um programa (program) é um algoritmo escrito numa linguagem de programação (programming language): um conjunto de palavras e regras que o computador consegue executar. Ao texto do programa chama-se código (code) ou código-fonte (source code).',
            'Há muitas linguagens. Neste curso usamos o Python, criado por Guido van Rossum e publicado pela primeira vez em 1991. É conhecido por ser fácil de ler e é usado em análise de dados, sites, automatização de tarefas e ensino.',
          ],
        },
        {
          type: 'rule',
          title: 'Como o Python corre',
          body: 'O Python é uma linguagem interpretada: um programa chamado interpretador (interpreter) lê o teu código de cima para baixo, uma linha de cada vez, e executa-a. Se encontra um erro, para e diz em que linha está.',
        },
        {
          type: 'code',
          language: 'Python',
          caption: 'O primeiro programa: uma linha que mostra uma mensagem no ecrã.',
          code: 'print("Olá, Angola!")',
        },
        {
          type: 'text',
          title: 'Onde praticar sem instalar nada',
          body: [
            'Não precisas de computador potente nem de instalar nada para começar. No navegador do telemóvel ou do computador, procura “Python online”: há vários editores grátis onde escreves o código à esquerda (ou em cima) e vês o resultado ao lado (ou em baixo), carregando num botão “Run” (correr).',
            'Esta página não corre código: lê os exemplos aqui, copia-os para um desses editores e experimenta mudar coisas. Errar e ver o que acontece é a melhor forma de aprender.',
          ],
        },
        {
          type: 'examples',
          title: 'Palavras que vais ouvir',
          items: [
            { text: 'Correr ou executar (run)', note: 'Pôr o programa a funcionar.' },
            {
              text: 'Erro (error) ou bug',
              note: 'Uma falha no código que impede o programa de fazer o que devia.',
            },
            { text: 'Saída (output)', note: 'O que o programa mostra no ecrã.' },
          ],
        },
        {
          type: 'exercise',
          id: 'pr-u1l2-a',
          kind: 'match',
          instruction: 'Liga cada termo ao que quer dizer.',
          items: [
            { left: 'Programa', right: 'algoritmo escrito numa linguagem de programação' },
            { left: 'Interpretador', right: 'lê e executa o código linha a linha' },
            { left: 'Saída', right: 'o que o programa mostra no ecrã' },
          ],
        },
        {
          type: 'exercise',
          id: 'pr-u1l2-b',
          kind: 'gap',
          instruction: 'Completa com uma palavra.',
          items: [
            { prompt: 'O texto de um programa chama-se ___.', answers: ['código', 'código-fonte'] },
            { prompt: 'O Python foi publicado pela primeira vez em ___.', answers: ['1991'] },
            {
              prompt: 'Quando o interpretador encontra um erro, ___ e diz em que linha está.',
              answers: ['para'],
            },
          ],
        },
        {
          type: 'summary',
          points: [
            'Programa: algoritmo escrito numa linguagem de programação.',
            'Python: linguagem interpretada, fácil de ler, de 1991.',
            'Pratica num editor de Python online, sem instalar nada.',
          ],
        },
      ],
    },
    {
      id: 'l3',
      title: 'A função print',
      estimatedMinutes: 20,
      blocks: [
        {
          type: 'text',
          title: 'Mostrar coisas no ecrã',
          body: [
            'A primeira instrução que se aprende em Python é print: mostra no ecrã o que pões entre parênteses. É uma função (function), uma ordem com nome que o Python já conhece. Vais criar as tuas funções na unidade 5.',
            'O texto vai entre aspas, para o Python saber onde começa e acaba. Ao texto chama-se string (cadeia de caracteres). Os números escrevem-se sem aspas, e o Python faz as contas antes de mostrar.',
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: 'print(...) mostra o que está entre parênteses. Texto entre aspas (simples ou duplas) aparece tal e qual. Números e contas sem aspas são calculados. Vários valores separados por vírgulas aparecem na mesma linha, separados por um espaço. Tudo o que vem depois de # é um comentário: o Python ignora-o.',
        },
        {
          type: 'code',
          language: 'Python',
          caption: 'Cada print mostra uma linha. À direita de # estão comentários.',
          code: [
            '# O meu cartão de visita',
            'print("Kiala Domingos")',
            'print("Estudante de Informática, Luanda")',
            'print("Idade:", 19)',
            'print(2 + 3)      # mostra 5',
            'print("2 + 3")    # mostra 2 + 3, porque está entre aspas',
          ].join('\n'),
        },
        {
          type: 'table',
          caption: 'O que mostra cada linha',
          head: ['Código', 'Saída'],
          rows: [
            ['print("Bom dia")', 'Bom dia'],
            ['print(10 - 4)', '6'],
            ['print("10 - 4")', '10 - 4'],
            ['print("Nota:", 15)', 'Nota: 15'],
          ],
        },
        {
          type: 'case',
          title: 'O primeiro erro da Ana',
          body: [
            'A Ana escreveu print(Olá) no editor online e carregou em “Run”. Em vez da mensagem, apareceu um erro com a palavra NameError.',
            'Sem aspas, o Python pensou que Olá era o nome de uma coisa que já devia existir, e não encontrou nada com esse nome. A Ana pôs as aspas, print("Olá"), e funcionou.',
            'Ler a mensagem de erro com calma, em vez de a ignorar, é um dos hábitos mais úteis de quem programa: diz o tipo de erro e em que linha está.',
          ],
        },
        {
          type: 'exercise',
          id: 'pr-u1l3-a',
          kind: 'choice',
          instruction: 'O que imprime este código?',
          items: [
            { prompt: 'print(4 * 5)', options: ['4 * 5', '20', '45'], answer: 1 },
            { prompt: 'print("4 * 5")', options: ['4 * 5', '20', 'Erro'], answer: 0 },
            {
              prompt: 'print("Luanda", 2026)',
              options: ['Luanda2026', 'Luanda 2026', 'Luanda, 2026'],
              answer: 1,
            },
            { prompt: 'print(1 + 1)  # soma', options: ['2', '2 # soma', '1 + 1'], answer: 0 },
          ],
        },
        {
          type: 'exercise',
          id: 'pr-u1l3-b',
          kind: 'gap',
          instruction: 'Completa.',
          items: [
            {
              prompt: 'Para mostrar uma mensagem no ecrã usa-se a função ___.',
              answers: ['print', 'print()'],
            },
            { prompt: 'Em Python, um comentário começa com o símbolo ___.', answers: ['#', 'cardinal'] },
          ],
        },
        {
          type: 'exercise',
          id: 'pr-u1l3-c',
          kind: 'order',
          instruction: 'Ordena para formar uma linha de Python válida.',
          items: [{ words: ['"Olá"', ')', 'print', '('], answer: 'print ( "Olá" )' }],
        },
        {
          type: 'summary',
          points: [
            'print(...) mostra no ecrã o que está entre parênteses.',
            'Texto entre aspas aparece tal e qual; contas sem aspas são calculadas.',
            'Vírgulas separam valores com um espaço.',
            '# começa um comentário, que o Python ignora.',
          ],
        },
      ],
    },
  ],
  review: [
    {
      type: 'exercise',
      id: 'pr-u1r-a',
      kind: 'choice',
      instruction: 'Escolhe a resposta certa.',
      items: [
        {
          prompt: 'Qual destes é um algoritmo?',
          options: [
            'Uma receita de funje com os passos por ordem',
            'Uma foto de um prato',
            'O nome de um restaurante',
          ],
          answer: 0,
        },
        { prompt: 'O que imprime print(7 + 3)?', options: ['7 + 3', '10', '73'], answer: 1 },
        { prompt: 'O que imprime print("7 + 3")?', options: ['7 + 3', '10', 'Erro'], answer: 0 },
        {
          prompt: 'print(Olá), sem aspas, dá…',
          options: ['Olá', 'um erro', 'uma linha em branco'],
          answer: 1,
        },
      ],
    },
    {
      type: 'exercise',
      id: 'pr-u1r-b',
      kind: 'gap',
      instruction: 'Completa com uma palavra.',
      items: [
        { prompt: 'Em Python, ao texto entre aspas chama-se ___.', answers: ['string'] },
        { prompt: 'O programa que lê e executa o código Python é o ___.', answers: ['interpretador'] },
        { prompt: 'Em inglês, um algoritmo é um ___.', answers: ['algorithm'] },
      ],
    },
    {
      type: 'exercise',
      id: 'pr-u1r-c',
      kind: 'match',
      instruction: 'Liga cada linha à saída.',
      items: [
        { left: 'print("Oi")', right: 'Oi' },
        { left: 'print(9 - 2)', right: '7' },
        { left: 'print("Ano:", 2026)', right: 'Ano: 2026' },
      ],
    },
  ],
}

export default unit
