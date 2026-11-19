import type { UnitContent } from '../types'

// Unit 2: scams and phishing. Defence only (docs/decisoes/0016, note of 13/11 on Cibersegurança). Warning signs and
// checks adapted from the FTC's consumer advice (US government work, public domain) and Wikipedia
// (CC BY-SA 4.0). The cases are Angolan and hypothetical; no reporting contact is given that an
// official Angolan source does not confirm: the advice is the bank's number on the back of the card.

const unit: UnitContent = {
  lessons: [
    {
      id: 'l1',
      title: 'O que é phishing e como o reconhecer',
      estimatedMinutes: 15,
      blocks: [
        {
          type: 'text',
          title: 'Pescar dados',
          body: [
            'Phishing (do inglês fishing, pescar) é uma burla em que alguém finge ser uma pessoa ou empresa de confiança para te levar a entregar dados, códigos ou dinheiro. Chega por e-mail, SMS (aí chama-se smishing), WhatsApp, redes sociais ou chamada.',
            'Não é preciso “entrar” no teu telemóvel: a burla funciona porque és tu a abrir o link, a escrever a palavra-passe ou a dizer o código. Por isso a melhor defesa é saber reconhecer os sinais.',
          ],
        },
        {
          type: 'table',
          caption: 'Os sinais de alerta',
          head: ['Sinal', 'Exemplo'],
          rows: [
            ['Pressa ou medo', '“A tua conta será bloqueada em 24 horas.”'],
            ['Prémio ou oferta boa demais', '“Ganhaste 500 000 Kz num sorteio em que não participaste.”'],
            ['Pedido de dados ou códigos', '“Confirma o teu PIN e o código que vais receber.”'],
            ['Link estranho', 'Um endereço parecido com o verdadeiro, com letras trocadas ou a mais'],
            ['Remetente desconhecido', 'Um número que não conheces a falar em nome de um banco ou empresa'],
            ['Pedido de segredo', '“Não contes a ninguém, resolve isto já.”'],
          ],
        },
        {
          type: 'rule',
          title: 'Regra de ouro',
          body: 'Não respondas pelo canal que te contactou. Se uma mensagem diz que é do teu banco, da operadora ou de uma empresa, fecha-a e contacta essa entidade por um canal que já conheces: o número no verso do cartão, a app oficial ou o balcão.',
        },
        {
          type: 'examples',
          title: 'Verdadeiro ou falso?',
          items: [
            {
              text: 'SMS: “Caro cliente, o seu cartão foi suspenso. Reative em http://banco-angola-seguro.co/ativar”.',
              note: 'Falso: pressa, link estranho, pedido para “reativar”. Liga para o número do verso do cartão.',
            },
            {
              text: 'E-mail da universidade com o calendário de exames, igual ao que está no site oficial.',
              note: 'Provavelmente verdadeiro: não pede dados nem dinheiro, e confirma-se no site.',
            },
            {
              text: 'Mensagem: “Parabéns! Foste escolhido para receber um telemóvel. Paga só o envio.”',
              note: 'Falso: prémio sem teres participado e pedido de pagamento.',
            },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u2l1-a',
          kind: 'choice',
          instruction: 'É provável que seja phishing?',
          items: [
            {
              prompt: '“A sua conta será encerrada hoje. Clique aqui e confirme a palavra-passe.”',
              options: ['Sim', 'Não'],
              answer: 0,
            },
            {
              prompt: 'Lembrete da escola com a data da reunião de pais, sem links nem pedidos.',
              options: ['Sim', 'Não'],
              answer: 1,
            },
            {
              prompt: '“Ganhou um carro! Envie 20 000 Kz para levantar o prémio.”',
              options: ['Sim', 'Não'],
              answer: 0,
            },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u2l1-b',
          kind: 'match',
          instruction: 'Liga cada frase ao sinal de alerta.',
          items: [
            { left: '“Tem 1 hora para responder.”', right: 'Pressa' },
            { left: '“Envie o código que recebeu.”', right: 'Pedido de códigos' },
            { left: '“Não fale disto com a família.”', right: 'Pedido de segredo' },
            { left: '“Ganhou um prémio.”', right: 'Oferta boa demais' },
          ],
        },
        {
          type: 'summary',
          points: [
            'Phishing: alguém finge ser de confiança para te tirar dados, códigos ou dinheiro.',
            'Sinais: pressa, prémio, pedido de dados, link estranho, segredo.',
            'Não respondas pelo mesmo canal: contacta a entidade por um canal que já conheces.',
          ],
        },
      ],
    },
    {
      id: 'l2',
      title: '“Olá mãe, mudei de número” e os pedidos de código',
      estimatedMinutes: 20,
      blocks: [
        {
          type: 'text',
          title: 'Quando a burla usa a família',
          body: [
            'Uma das burlas mais comuns no WhatsApp começa assim: “Olá mãe, mudei de número, guarda este.” Pouco depois chega o pedido: uma conta urgente, um telemóvel avariado, uma transferência que tem de ser feita hoje.',
            'O burlão aproveita o carinho e a pressa. Às vezes usa a foto de perfil verdadeira do filho, tirada das redes sociais, e há casos em que imita a voz de alguém com inteligência artificial.',
          ],
        },
        {
          type: 'rule',
          title: 'Como verificar',
          body: 'Antes de enviar dinheiro, liga para o número antigo, que já conheces. Faz uma pergunta que só a pessoa verdadeira sabe responder. Fala com outro familiar, mesmo que a mensagem peça segredo. Se for mesmo a pessoa, ela vai perceber o cuidado.',
        },
        {
          type: 'text',
          title: 'Os pedidos de código',
          body: [
            'Outra variante: “Enviei-te um código por engano, podes reencaminhar?” Esse código é, muitas vezes, o de verificação da tua conta de WhatsApp. Quem o recebe fica com a tua conta e usa-a para enganar os teus contactos.',
            'O mesmo acontece com o Multicaixa Express e as apps dos bancos: alguém liga a dizer que é do banco ou de uma loja e pede “o código que acabou de chegar” para “confirmar” uma compra ou um reembolso. Com esse código, o dinheiro sai da tua conta.',
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: 'Códigos por SMS, PIN e palavras-passe não se partilham com ninguém, nem com quem diz ser do banco, da operadora, da polícia ou da família. Nenhum banco te pede o PIN ou um código por mensagem ou chamada.',
        },
        {
          type: 'case',
          title: 'A mãe do Edson',
          body: [
            'A dona Luísa, no Huambo, recebe uma mensagem de um número novo: “Mãe, sou eu, o Edson. O telemóvel caiu na água. Preciso de 80 000 Kz hoje para pagar a propina, senão perco o exame.” (Valores só para ilustrar.)',
            'Desconfia da pressa. Liga para o número antigo do Edson: ele atende, está bem e nunca mudou de número. A dona Luísa bloqueia o número falso, denuncia-o no WhatsApp e avisa o grupo da família.',
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u2l2-a',
          kind: 'choice',
          instruction: 'O que fazes?',
          items: [
            {
              prompt: '“Olá tia, este é o meu número novo. Podes mandar-me 30 000 Kz?”',
              options: ['Envio já', 'Ligo para o número antigo antes', 'Peço o PIN dele para confirmar'],
              answer: 1,
            },
            {
              prompt: 'Um contacto pede o código de 6 dígitos que chegou ao teu telemóvel “por engano”.',
              options: ['Envio, é um amigo', 'Não envio a ninguém', 'Envio só metade'],
              answer: 1,
            },
            {
              prompt:
                'Alguém diz que é do banco e pede o código do Multicaixa Express para “cancelar uma compra”.',
              options: ['Desligo e ligo para o número no verso do cartão', 'Dou o código', 'Dou só o PIN'],
              answer: 0,
            },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u2l2-b',
          kind: 'order',
          instruction: 'Ordena a frase: o que fazer quando um “familiar” pede dinheiro.',
          items: [
            {
              words: ['enviar', 'antigo', 'ligo', 'de', 'número', 'antes', 'ao'],
              answer: 'ligo ao número antigo antes de enviar',
            },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u2l2-c',
          kind: 'gap',
          instruction: 'Completa com uma palavra.',
          items: [
            { prompt: 'Nenhum banco te pede o ___ por mensagem ou chamada.', answers: ['PIN', 'código'] },
            { prompt: 'Antes de enviar dinheiro, liga para o número ___.', answers: ['antigo'] },
          ],
        },
        {
          type: 'summary',
          points: [
            '“Mudei de número” + pedido de dinheiro = verifica sempre pelo número antigo.',
            'Faz uma pergunta que só a pessoa verdadeira sabe.',
            'Códigos, PIN e palavras-passe não se partilham com ninguém.',
            'Quem pede o código do WhatsApp ou do Multicaixa Express quer a tua conta ou o teu dinheiro.',
          ],
        },
      ],
    },
    {
      id: 'l3',
      title: 'Falsas ofertas de emprego e de bolsas',
      estimatedMinutes: 20,
      blocks: [
        {
          type: 'text',
          title: 'Quando a burla promete um futuro',
          body: [
            'Quem procura o primeiro emprego ou uma bolsa de estudo é um alvo preferido. As falsas ofertas aparecem em grupos de WhatsApp, páginas de Facebook e anúncios: “Empresa petrolífera contrata 50 jovens sem experiência, salário de 900 000 Kz.”',
            'O objetivo é quase sempre o mesmo: cobrar uma “taxa” (inscrição, formação, farda, exame médico) ou recolher os teus dados pessoais e documentos para outras burlas.',
          ],
        },
        {
          type: 'table',
          caption: 'Oferta verdadeira ou falsa?',
          head: ['Sinal', 'Oferta verdadeira', 'Oferta falsa'],
          rows: [
            ['Pagamento', 'Não te pedem dinheiro para concorrer', 'Pedem uma taxa para garantir a vaga'],
            ['Salário', 'Coerente com a função', 'Muito alto para pouco trabalho'],
            ['Contacto', 'E-mail e site da empresa ou da instituição', 'Só um número de WhatsApp'],
            ['Processo', 'Candidatura, testes, entrevista', '“Foste aprovado” sem entrevista'],
            ['Pressa', 'Prazos publicados com antecedência', '“Últimas vagas, paga hoje”'],
          ],
        },
        {
          type: 'rule',
          title: 'Regra',
          body: 'Nunca pagues para conseguir um emprego ou uma bolsa. Antes de enviar documentos, confirma a oferta no site oficial da empresa ou da instituição, ou por telefone, com um contacto que encontraste tu e não o que vem no anúncio.',
        },
        {
          type: 'case',
          title: 'A bolsa da Ana',
          body: [
            'A Ana, finalista em Malanje, vê no Facebook: “Bolsas integrais para estudar no estrangeiro. Inscrição: 15 000 Kz por Multicaixa Express. Últimos dias!” (Imagina estes valores: são só para ilustrar.)',
            'Antes de pagar, a Ana procura o programa no site oficial da instituição que, segundo o anúncio, oferece a bolsa. Não encontra nada. Mostra o anúncio à professora, que confirma: as candidaturas a bolsas verdadeiras não se fazem com pagamentos para números pessoais.',
            'A Ana denuncia a página no Facebook e avisa a turma. Guarda capturas de ecrã, para o caso de alguém precisar de apresentar queixa.',
          ],
        },
        {
          type: 'text',
          title: 'Se já caíste numa burla',
          body: [
            'Não tenhas vergonha: acontece a pessoas atentas. Age depressa. Se deste dados bancários ou códigos, contacta o teu banco pelo número no verso do cartão para bloquear o cartão ou a conta. Se deste uma palavra-passe, troca-a logo e ativa a verificação em dois passos.',
            'Guarda as provas (capturas de ecrã, números, comprovativos), denuncia o perfil ou o número na própria app (WhatsApp, Facebook) e avisa os teus contactos, para que não caiam na mesma burla.',
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u2l3-a',
          kind: 'choice',
          instruction: 'Escolhe a resposta certa.',
          items: [
            {
              prompt: 'Uma “empresa” pede 10 000 Kz para garantir a tua entrevista. É…',
              options: ['normal', 'sinal de burla', 'obrigatório por lei'],
              answer: 1,
            },
            {
              prompt: 'Onde confirmas uma oferta de bolsa?',
              options: [
                'No número de WhatsApp do anúncio',
                'No site oficial da instituição',
                'Nos comentários da publicação',
              ],
              answer: 1,
            },
            {
              prompt: 'Deste o código do cartão a um burlão. Qual é o primeiro passo?',
              options: ['Esperar para ver', 'Ligar para o número no verso do cartão', 'Apagar a conversa'],
              answer: 1,
            },
          ],
        },
        {
          type: 'exercise',
          id: 'cs-u2l3-b',
          kind: 'match',
          instruction: 'Liga cada situação ao que deves fazer.',
          items: [
            { left: 'Deste a palavra-passe do e-mail', right: 'Troca-a e ativa os dois passos' },
            { left: 'Viste uma oferta suspeita no Facebook', right: 'Denuncia a página e avisa os amigos' },
            { left: 'Pagaste uma “taxa” a um burlão', right: 'Guarda as provas e contacta o banco' },
          ],
        },
        {
          type: 'summary',
          points: [
            'Nunca pagues para conseguir emprego ou bolsa.',
            'Confirma no site oficial ou por um contacto que encontraste tu.',
            'Se caíste: banco (número no verso do cartão), trocar palavras-passe, guardar provas, avisar contactos.',
          ],
        },
      ],
    },
  ],
  review: [
    {
      type: 'exercise',
      id: 'cs-u2r-a',
      kind: 'choice',
      instruction: 'Escolhe a resposta certa.',
      items: [
        {
          prompt: 'O que é phishing?',
          options: [
            'Uma app de mensagens',
            'Uma burla em que alguém finge ser de confiança',
            'Uma forma de proteger a conta',
          ],
          answer: 1,
        },
        {
          prompt: 'Um SMS do “banco” traz um link para reativar o cartão. O que fazes?',
          options: ['Abro o link', 'Ligo para o número no verso do cartão', 'Respondo ao SMS'],
          answer: 1,
        },
        {
          prompt: '“Olá pai, mudei de número, preciso de dinheiro hoje.” O primeiro passo é…',
          options: ['enviar o dinheiro', 'ligar para o número antigo', 'enviar o PIN'],
          answer: 1,
        },
        {
          prompt: 'Quem pode pedir-te o código que chegou por SMS?',
          options: ['O banco', 'Um amigo', 'Ninguém'],
          answer: 2,
        },
      ],
    },
    {
      type: 'exercise',
      id: 'cs-u2r-b',
      kind: 'gap',
      instruction: 'Completa com uma palavra.',
      items: [
        { prompt: 'O phishing por SMS chama-se ___.', answers: ['smishing'] },
        { prompt: 'Nunca pagues para conseguir um emprego ou uma ___.', answers: ['bolsa'] },
        {
          prompt: 'Se caíste numa burla, guarda as ___: capturas de ecrã e comprovativos.',
          answers: ['provas'],
        },
      ],
    },
    {
      type: 'exercise',
      id: 'cs-u2r-c',
      kind: 'match',
      instruction: 'Liga cada mensagem ao tipo de burla.',
      items: [
        { left: '“Envia-me o código que te chegou por engano.”', right: 'Roubo da conta de WhatsApp' },
        { left: '“Paga a inscrição para garantir a vaga.”', right: 'Falsa oferta de emprego' },
        { left: '“Mãe, este é o meu número novo.”', right: 'Falso familiar' },
      ],
    },
  ],
}

export default unit
