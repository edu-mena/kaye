import type { UnitContent } from '../types'

// Unit 1: passwords and two-step verification. Defence only (docs/decisoes/0016, note of 13/11 on Cibersegurança).
// Recommendations from NIST SP 800-63B (US government work) and Wikipedia (CC BY-SA 4.0),
// adapted and written from scratch in Portuguese; the cases are Angolan and hypothetical.

const unit: UnitContent = {
  lessons: [
    {
      id: 'l1',
      title: 'Uma palavra-passe forte',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'Para que serve',
          body: [
            'A palavra-passe (password) é a chave das tuas contas: e-mail, WhatsApp, redes sociais, banco. Quem a descobre entra como se fosse tu, lê as tuas mensagens e pode pedir dinheiro aos teus contactos em teu nome.',
            'Durante anos ensinou-se que uma boa palavra-passe era curta e cheia de símbolos, como “Lu@nd4!”. Hoje sabe-se que o que mais protege é o comprimento: uma frase longa é mais difícil de adivinhar e mais fácil de lembrar.',
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: 'Uma palavra-passe forte é longa (pelo menos 15 caracteres), não é usada em mais nenhuma conta e não aparece em listas de palavras-passe comuns ou já roubadas. Não precisa de ser trocada todos os meses: troca-a quando houver sinal de que alguém a conhece.',
        },
        {
          type: 'text',
          title: 'A frase-passe',
          body: [
            'Uma frase-passe (passphrase) é uma palavra-passe feita de várias palavras: “manga-verde-no-quintal-da-avó”. É longa, por isso é forte, e cria uma imagem na cabeça, por isso é fácil de lembrar.',
            'Escolhe palavras que não tenham ligação óbvia contigo. O nome do teu clube, do teu bairro ou a tua data de nascimento são fáceis de adivinhar por quem vê as tuas redes sociais.',
          ],
        },
        {
          type: 'table',
          caption: 'Fraca ou forte?',
          head: ['Palavra-passe', 'Avaliação', 'Porquê'],
          rows: [
            ['123456', 'Muito fraca', 'É das mais usadas no mundo: está em todas as listas'],
            ['Petro2006', 'Fraca', 'Clube e ano de nascimento: fácil de adivinhar'],
            ['Lu@nd4!', 'Fraca', 'Curta; trocar letras por símbolos não engana ninguém'],
            ['candeeiro-azul-dança-no-rio', 'Forte', 'Longa, sem ligação contigo, fácil de lembrar'],
          ],
        },
        {
          type: 'case',
          title: 'A conta da Nzinga',
          body: [
            'A Nzinga, de 19 anos, usava a mesma palavra-passe, “Nzinga2005”, no e-mail, no Instagram e num site de cupões de desconto. Imagina que esse site é atacado e a lista de utilizadores e palavras-passe aparece na internet.',
            'Quem tem a lista experimenta o mesmo e-mail e a mesma palavra-passe noutros serviços. Como a Nzinga a repetia, perdeu também o Instagram, e os amigos começaram a receber mensagens “dela” a pedir dinheiro.',
            'Depois do susto, a Nzinga criou uma frase-passe diferente para cada conta importante, começando pelo e-mail, porque é por ele que se recuperam todas as outras.',
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u1l1-a',
          kind: 'choice',
          instruction: 'Qual é a palavra-passe mais forte?',
          items: [
            {
              prompt: 'Para o e-mail do Mateus, de Benguela:',
              options: ['Mateus123', 'B3ngu3la!', 'cadeira-laranja-sobe-a-colina'],
              answer: 2,
            },
            {
              prompt: 'Para a conta do Facebook da Rosa:',
              options: ['rosa-ama-o-1º-de-agosto', 'janela-fria-come-pão-de-milho', 'Rosa2004'],
              answer: 1,
            },
            {
              prompt: 'O que torna uma palavra-passe forte, acima de tudo?',
              options: ['Ter símbolos', 'Ser longa e única', 'Ser trocada todos os meses'],
              answer: 1,
            },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u1l1-b',
          kind: 'gap',
          instruction: 'Completa com uma palavra.',
          items: [
            { prompt: 'Uma palavra-passe feita de várias palavras chama-se frase-___.', answers: ['passe'] },
            { prompt: 'Nunca uses a mesma palavra-passe em mais de uma ___.', answers: ['conta'] },
            {
              prompt: 'A primeira conta a proteger é o ___, porque recupera as outras.',
              answers: ['e-mail', 'email', 'correio eletrónico'],
            },
          ],
        },
        {
          type: 'summary',
          points: [
            'O comprimento protege mais do que os símbolos: pelo menos 15 caracteres.',
            'Uma palavra-passe diferente para cada conta.',
            'Frase-passe: várias palavras sem ligação contigo.',
            'Troca a palavra-passe quando houver sinal de que alguém a conhece.',
          ],
        },
      ],
    },
    {
      id: 'l2',
      title: 'O gestor de palavras-passe',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'Ninguém decora 20 palavras-passe',
          body: [
            'Se cada conta tem uma palavra-passe diferente e longa, como te lembras de todas? A resposta é não te lembrares: usa um gestor de palavras-passe (password manager).',
            'Um gestor é uma aplicação que cria palavras-passe fortes, guarda-as num cofre cifrado e preenche-as por ti quando entras num site ou numa app. Só tens de decorar uma: a palavra-passe principal (master password) que abre o cofre.',
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: 'A palavra-passe principal do gestor tem de ser a mais forte de todas (uma frase-passe longa) e não pode ser usada em mais lado nenhum. Ativa também a verificação em dois passos no gestor.',
        },
        {
          type: 'table',
          caption: 'Onde guardar as palavras-passe',
          head: ['Onde', 'Avaliação', 'Porquê'],
          rows: [
            [
              'Gestor de palavras-passe',
              'Recomendado',
              'Cofre cifrado, preenche sozinho, avisa se uma palavra-passe foi roubada',
            ],
            [
              'O gestor do navegador ou do telemóvel',
              'Bom',
              'Já vem instalado; protege-o com o bloqueio do telemóvel',
            ],
            [
              'Caderno guardado em casa',
              'Aceitável',
              'Longe de quem está na internet, mas pode perder-se ou ser visto',
            ],
            [
              'Nota no telemóvel ou foto',
              'Mau',
              'Quem pega no telemóvel ou entra na cópia de segurança vê tudo',
            ],
            ['Mensagem para ti no WhatsApp', 'Mau', 'Qualquer pessoa que abra a conversa lê'],
          ],
        },
        {
          type: 'examples',
          title: 'O gestor no dia a dia',
          items: [
            {
              text: 'O Kiala cria conta num site de emprego e o gestor sugere “Tq7#vRm2…”, com 20 caracteres.',
              note: 'Aceita a sugestão: não precisa de a decorar.',
            },
            {
              text: 'A Teresa abre um link que imita o site do banco; o gestor não preenche a palavra-passe.',
              note: 'O gestor só preenche no endereço verdadeiro: é um aviso de que o site é falso.',
            },
            {
              text: 'O gestor avisa que a palavra-passe do Paulo apareceu numa lista roubada.',
              note: 'O Paulo troca-a logo nesse site e em qualquer outro onde a tenha repetido.',
            },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u1l2-a',
          kind: 'match',
          instruction: 'Liga cada termo ao que quer dizer.',
          items: [
            { left: 'Gestor de palavras-passe', right: 'app que cria e guarda palavras-passe' },
            { left: 'Palavra-passe principal', right: 'a única que tens de decorar' },
            { left: 'Cofre', right: 'onde as palavras-passe ficam cifradas' },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u1l2-b',
          kind: 'choice',
          instruction: 'Escolhe a melhor opção.',
          items: [
            {
              prompt: 'Onde é melhor guardar as tuas palavras-passe?',
              options: ['Numa foto na galeria', 'Num gestor de palavras-passe', 'Numa conversa do WhatsApp'],
              answer: 1,
            },
            {
              prompt:
                'O gestor não preenche a palavra-passe num site que parece o do teu banco. O que pode querer dizer?',
              options: [
                'Que o site pode ser falso',
                'Que o gestor está avariado',
                'Que tens de desligar o gestor',
              ],
              answer: 0,
            },
          ],
        },
        {
          type: 'summary',
          points: [
            'O gestor cria, guarda e preenche palavras-passe fortes e diferentes.',
            'Só decoras a palavra-passe principal, que tem de ser a mais forte.',
            'Fotos, notas e mensagens com palavras-passe são um risco.',
          ],
        },
      ],
    },
    {
      id: 'l3',
      title: 'A verificação em dois passos',
      estimatedMinutes: 20,
      blocks: [
        {
          type: 'text',
          title: 'Uma segunda fechadura',
          body: [
            'Mesmo uma boa palavra-passe pode ser roubada. A verificação em dois passos (two-factor authentication, 2FA) junta uma segunda prova: depois da palavra-passe, o serviço pede um código ou uma confirmação que só tu tens.',
            'As provas podem ser de três tipos: algo que sabes (a palavra-passe, o PIN), algo que tens (o telemóvel, uma chave de segurança) e algo que és (a impressão digital, o rosto). Juntar dois tipos diferentes é muito mais seguro do que só um.',
          ],
        },
        {
          type: 'table',
          caption: 'As formas mais comuns do segundo passo',
          head: ['Forma', 'Como funciona', 'Segurança'],
          rows: [
            [
              'Código por SMS',
              'Recebes um código numa mensagem',
              'Melhor do que nada, mas o SMS pode ser desviado',
            ],
            [
              'App autenticadora (authenticator app)',
              'Uma app no telemóvel mostra um código que muda a cada 30 segundos',
              'Melhor: o código não viaja pela rede',
            ],
            [
              'Confirmação na app',
              'O serviço pergunta “és tu?” na app já ligada',
              'Boa, se leres o pedido antes de aceitar',
            ],
            [
              'Chave de segurança (security key)',
              'Um pequeno dispositivo físico',
              'A mais forte, mais usada em empresas',
            ],
          ],
        },
        {
          type: 'rule',
          title: 'SMS ou app?',
          body: 'O código por SMS depende do teu número de telefone. Se alguém convencer a operadora a passar o teu número para outro cartão SIM, recebe os teus códigos. Por isso, sempre que o serviço permitir, prefere uma app autenticadora. Se só houver SMS, ativa-o na mesma: é muito melhor do que não ter segundo passo.',
        },
        {
          type: 'rule',
          title: 'O código é só teu',
          body: 'Nenhum banco, operadora, empresa ou amigo verdadeiro te pede o código de verificação. Quem pede o código está a tentar entrar na tua conta. Guarda também os códigos de recuperação (backup codes) num sítio seguro, para o caso de perderes o telemóvel.',
        },
        {
          type: 'case',
          title: 'O código do Domingos',
          body: [
            'O Domingos tem a verificação em dois passos ativa no e-mail. Uma noite, recebe por SMS um código de entrada que não pediu.',
            'Percebe que alguém sabe a sua palavra-passe, mas não consegue entrar sem o código. Não partilha o código com ninguém, troca a palavra-passe do e-mail por uma frase-passe nova e passa a usar uma app autenticadora em vez do SMS.',
            'Sem o segundo passo, a conta teria sido perdida nessa noite.',
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u1l3-a',
          kind: 'match',
          instruction: 'Liga cada prova ao tipo.',
          items: [
            { left: 'A palavra-passe', right: 'algo que sabes' },
            { left: 'O telemóvel com a app autenticadora', right: 'algo que tens' },
            { left: 'A impressão digital', right: 'algo que és' },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u1l3-b',
          kind: 'choice',
          instruction: 'Escolhe a resposta certa.',
          items: [
            {
              prompt: 'Qual destas formas do segundo passo é mais segura?',
              options: ['Código por SMS', 'App autenticadora', 'Nenhuma, é igual'],
              answer: 1,
            },
            {
              prompt: 'Um serviço só oferece código por SMS. O que fazes?',
              options: ['Ativas na mesma', 'Não ativas nada', 'Partilhas o código com um amigo de confiança'],
              answer: 0,
            },
            {
              prompt: 'Recebes um código que não pediste. O que quer dizer?',
              options: [
                'Nada de especial',
                'Que alguém pode saber a tua palavra-passe',
                'Que ganhaste um prémio',
              ],
              answer: 1,
            },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u1l3-c',
          kind: 'order',
          instruction: 'Ordena a frase.',
          items: [
            {
              words: ['pede', 'confiança', 'código', 'ninguém', 'o', 'de', 'teu'],
              answer: 'ninguém de confiança pede o teu código',
            },
          ],
        },
        {
          type: 'summary',
          points: [
            'Verificação em dois passos: palavra-passe + uma segunda prova.',
            'App autenticadora é melhor do que SMS; SMS é melhor do que nada.',
            'O código é só teu: quem o pede está a tentar entrar na tua conta.',
            'Guarda os códigos de recuperação num sítio seguro.',
          ],
        },
      ],
    },
  ],
  review: [
    {
      type: 'exercise',
      id: 'cs-u1r-a',
      kind: 'choice',
      instruction: 'Escolhe a resposta certa.',
      items: [
        {
          prompt: 'Qual destas é a melhor palavra-passe?',
          options: ['Kilamba2006', 'pássaro-de-papel-sobe-o-muro', 'K!l4mb@'],
          answer: 1,
        },
        {
          prompt: 'Deves trocar a palavra-passe…',
          options: ['todos os meses', 'quando houver sinal de que alguém a conhece', 'nunca, em caso nenhum'],
          answer: 1,
        },
        {
          prompt: 'Se usas a mesma palavra-passe em várias contas e um site é atacado…',
          options: ['só perdes esse site', 'as outras contas também ficam em risco', 'não acontece nada'],
          answer: 1,
        },
        {
          prompt: 'Um “funcionário do banco” liga e pede o código que recebeste por SMS. É…',
          options: ['normal', 'uma tentativa de burla', 'obrigatório'],
          answer: 1,
        },
      ],
    },
    {
      type: 'exercise',
      id: 'cs-u1r-b',
      kind: 'gap',
      instruction: 'Completa com uma palavra.',
      items: [
        { prompt: 'O que mais protege uma palavra-passe é o ___.', answers: ['comprimento', 'tamanho'] },
        { prompt: 'No gestor só tens de decorar a palavra-passe ___.', answers: ['principal', 'mestra'] },
        {
          prompt: 'Em inglês, a verificação em dois passos chama-se two-factor ___.',
          answers: ['authentication'],
        },
      ],
    },
    {
      type: 'exercise',
      id: 'cs-u1r-c',
      kind: 'match',
      instruction: 'Liga cada situação ao melhor conselho.',
      items: [
        { left: 'Esqueces-te sempre das palavras-passe', right: 'Usa um gestor de palavras-passe' },
        { left: 'Vais perder o telemóvel um dia', right: 'Guarda os códigos de recuperação' },
        { left: 'O serviço oferece app ou SMS', right: 'Escolhe a app autenticadora' },
      ],
    },
  ],
}

export default unit
