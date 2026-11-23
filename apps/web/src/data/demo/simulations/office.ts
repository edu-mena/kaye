import type { SimulationDraft } from './draft'

// Offices: an accountant, a lawyer in a company, a public-procurement officer and a social media manager.

export const OFFICE_SIMULATIONS: SimulationDraft[] = [
  {
    id: 'um-dia-como-contabilista',
    careerSlug: 'contabilista',
    title: 'Um dia como contabilista numa empresa de distribuição',
    intro:
      'Trabalhas no departamento de contabilidade de uma empresa de distribuição em Luanda. Estamos a três dias do fecho do mês e o chefe quer o balancete na quinta-feira.',
    minutes: 8,
    moments: [
      {
        id: 'chegada',
        time: '08:00',
        title: 'A caixa de entrada',
        text: 'Chegas ao escritório e abres o programa de contabilidade. Na secretária há uma pilha de facturas dos fornecedores e no email, três pedidos urgentes: pagamentos, o extracto do banco e um cliente que diz que já pagou.',
      },
      {
        id: 'registos',
        time: '09:00',
        title: 'Registar e reconciliar',
        text: 'Lanças as facturas no programa e confrontas o extracto do banco com os teus registos. Falta uma entrada de 1 200 000 Kz que o banco mostra e tu não encontras.',
        decision: {
          question: 'A diferença trava-te o fecho. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Lanças a diferença numa conta de "outros" para a reconciliação bater certo.',
              result:
                'O balancete fecha, mas daqui a duas semanas o auditor pergunta o que é aquele valor e ninguém sabe responder.',
              why: 'Esconder uma diferença não a resolve. Na contabilidade, o que não se explica volta com juros.',
            },
            {
              id: 'b',
              text: 'Procuras o cliente pelo valor e pela data, pedes o talão à tesouraria e lanças o recebimento certo.',
              result:
                'Descobres que era o cliente que dizia ter pago. Registas, e a reconciliação bate certo com a prova.',
              why: 'Cada lançamento precisa de um documento que o justifique. Procurar a origem é o trabalho.',
            },
            {
              id: 'c',
              text: 'Deixas a diferença para o mês seguinte.',
              result:
                'O chefe nota a diferença no balancete e pergunta porque a deixaste. Perdes a manhã a justificar.',
              why: 'Um fecho com pendentes sem explicação põe em causa os números todos. Pelo menos regista-os como pendentes.',
            },
          ],
        },
      },
      {
        id: 'impostos',
        time: '11:30',
        title: 'Os impostos',
        text: 'Preparas a declaração do IVA do mês. Cada factura precisa do NIF do fornecedor e de estar bem classificada. Encontras uma factura sem NIF.',
        decision: {
          question: 'O fornecedor é um prestador que o director conhece bem. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Incluis a factura na declaração, para o director não se queixar.',
              result:
                'Meses depois, uma inspecção da AGT não aceita a despesa e a empresa paga mais imposto e uma multa.',
              why: 'Uma factura sem os dados exigidos não é aceite como despesa. O contabilista responde pela correcção das contas.',
            },
            {
              id: 'b',
              text: 'Pedes ao fornecedor uma factura correcta e avisas o director da razão.',
              result: 'O fornecedor reemite em dois dias. O director percebe que a regra é para todos.',
              why: 'Dizer não com a razão e a solução faz parte do trabalho. O contabilista protege a empresa de problemas futuros.',
            },
            {
              id: 'c',
              text: 'Deixas a factura fora e não dizes nada.',
              result: 'O fornecedor liga ao director, que quer saber porque ainda não foi pago.',
              why: 'Calar-te deixa os outros sem saber o que fazer. Explicar é metade do teu trabalho.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '13:00',
        title: 'Almoço com os colegas',
        text: 'Almoças com uma colega da tesouraria e com o estagiário. Ela explica-te como os pagamentos são aprovados; ele pergunta-te como é que se estuda para a Ordem dos Contabilistas e Peritos Contabilistas.',
      },
      {
        id: 'chefe',
        time: '15:00',
        title: 'A pergunta do director',
        text: 'O director financeiro chama-te e pergunta: "Porque é que as vendas subiram e a margem desceu?" Tens o balancete provisório no ecrã e uns minutos para responder.',
        decision: {
          question: 'Como respondes?',
          options: [
            {
              id: 'a',
              text: 'Lês-lhe os números linha a linha, tal como estão no programa.',
              result: 'Ele perde-se no meio e diz que volta a perguntar amanhã.',
              why: 'Quem decide precisa da resposta, não da lista. Explicar os números em poucas palavras é uma competência.',
            },
            {
              id: 'b',
              text: 'Dizes que o custo do transporte subiu mais do que os preços e mostras as duas linhas lado a lado.',
              result: 'Ele percebe logo e pede-te uma estimativa do efeito de rever os preços.',
              why: 'Escolher os números que respondem à pergunta e mostrá-los é o que torna um contabilista útil à gestão.',
            },
          ],
        },
      },
      {
        id: 'fim',
        time: '17:30',
        title: 'Fim do dia',
        text: 'Gravas o ficheiro, deixas a lista do que falta e sais mais tarde do que queres, porque estás em fecho de mês. Amanhã há mais, mas o balancete está a meio caminho.',
      },
    ],
    asks: [
      'Rigor: um zero a mais ou a menos muda tudo.',
      'Paciência para procurar a origem de uma diferença.',
      'Saber dizer não e explicar porquê, mesmo ao director.',
      'Explicar números a quem não é da área.',
    ],
    next: [
      {
        kind: 'course',
        text: 'Vê as licenciaturas e os cursos médios de Contabilidade na página da carreira.',
      },
      { kind: 'academy', text: 'Compara as escolas de contabilidade de Luanda.' },
      { kind: 'internship', text: 'Procura estágios em gabinetes de contabilidade e em empresas.' },
    ],
  },
  {
    id: 'um-dia-como-jurista',
    careerSlug: 'jurista',
    title: 'Um dia como jurista numa empresa',
    intro:
      'És o jurista de uma empresa de média dimensão em Luanda. Trabalhas para uma só organização: a direcção, as finanças, os recursos humanos e as compras pedem-te ajuda.',
    minutes: 8,
    moments: [
      {
        id: 'chegada',
        time: '08:15',
        title: 'Os pedidos do dia',
        text: 'Abres o email e tens quatro pedidos: um contrato de arrendamento para rever, uma dúvida do director de recursos humanos sobre um despedimento, um parecer sobre uma licença e um fornecedor que ameaça processar.',
      },
      {
        id: 'contrato',
        time: '09:30',
        title: 'O contrato de arrendamento',
        text: 'Lês o contrato palavra a palavra. Há uma cláusula que permite ao proprietário subir a renda quando quiser, sem aviso.',
        decision: {
          question: 'O director comercial quer assinar hoje, porque gostou do espaço. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Dizes que está tudo bem para não atrasar o negócio.',
              result: 'Seis meses depois a renda sobe 40% e a empresa não pode reclamar.',
              why: 'O jurista existe para ver o que os outros não vêem. Calar-te sai caro à empresa.',
            },
            {
              id: 'b',
              text: 'Explicas o risco em duas frases e propões uma versão da cláusula com um limite e um aviso prévio.',
              result: 'O proprietário aceita um limite anual e o contrato assina-se na semana seguinte.',
              why: 'Um bom jurista não só trava: propõe uma saída. O negócio avança com o risco controlado.',
            },
            {
              id: 'c',
              text: 'Recusas o contrato, sem mais explicações.',
              result: 'O director fica irritado e passa a evitar-te. O negócio perde-se.',
              why: 'Dizer não sem alternativa afasta os colegas. O jurista é útil quando ajuda a fazer.',
            },
          ],
        },
      },
      {
        id: 'rh',
        time: '11:30',
        title: 'O pedido dos recursos humanos',
        text: 'O director de recursos humanos quer despedir um trabalhador por faltas. Pergunta-te se pode fazê-lo hoje. Ao ver o processo, notas que não há registo das advertências anteriores.',
        decision: {
          question: 'O que lhe dizes?',
          options: [
            {
              id: 'a',
              text: 'Que pode despedir, porque as faltas são claras.',
              result: 'O trabalhador vai ao tribunal e a empresa perde, por falta de procedimento.',
              why: 'Na lei laboral, o procedimento conta tanto como a razão. Sem provas escritas, a empresa fica sem defesa.',
            },
            {
              id: 'b',
              text: 'Que primeiro é preciso reunir as faltas, as advertências e a resposta do trabalhador, e que explicas os passos que a lei exige.',
              result: 'O processo leva três semanas, mas fica pronto e a empresa está protegida.',
              why: 'O trabalho é prevenir problemas. Um processo bem montado vale mais do que uma pressa.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '13:00',
        title: 'Almoço',
        text: 'Almoças com a colega das finanças, que te pergunta se podem pagar mais cedo a um fornecedor para ter desconto. Aprendes que muita coisa que parece financeira tem um lado legal.',
      },
      {
        id: 'parecer',
        time: '14:30',
        title: 'O parecer',
        text: 'Escreves um parecer curto sobre a licença: o que a lei exige, o que a empresa já tem, o que falta e quanto tempo demora. Escreves para quem não é jurista: frases curtas e uma conclusão no início.',
      },
      {
        id: 'fim',
        time: '17:30',
        title: 'Fim do dia',
        text: 'Respondes ao fornecedor que ameaça processar, com cuidado e sem prometer nada. Fechas o email e deixas a lista de amanhã. O dia foi de ler, escrever e dizer o que os outros não querem ouvir, com jeito.',
      },
    ],
    asks: [
      'Ler com atenção e perceber o risco no que está escrito.',
      'Escrever claro, para quem não é jurista.',
      'Dizer que não com uma alternativa.',
      'Estudar leis que mudam e manter-se actualizado.',
    ],
    next: [
      { kind: 'course', text: 'Vê as licenciaturas em Direito na página da carreira.' },
      { kind: 'academy', text: 'Compara as faculdades de Direito de Luanda.' },
      { kind: 'internship', text: 'Procura estágios em empresas, bancos e escritórios de advogados.' },
    ],
  },
  {
    id: 'um-dia-como-tecnico-de-contratacao-publica',
    careerSlug: 'tecnico-de-contratacao-publica',
    title: 'Um dia como técnico de contratação pública',
    intro:
      'Trabalhas na Unidade de Contratação Pública de um organismo do Estado. Tens um concurso para a compra de computadores para escolas, com prazo de propostas a acabar hoje.',
    minutes: 8,
    moments: [
      {
        id: 'chegada',
        time: '07:45',
        title: 'O último dia de propostas',
        text: 'Chegas cedo. O prazo de entrega das propostas fecha às 15h e a sala de abertura tem de estar pronta. O chefe da unidade quer tudo registado no portal e as regras do concurso bem à vista.',
      },
      {
        id: 'duvidas',
        time: '09:00',
        title: 'As dúvidas dos concorrentes',
        text: 'Um concorrente telefona: pergunta se pode entregar a proposta às 15h05, porque está preso no trânsito. Outro pergunta, em privado, qual é o orçamento que o organismo tem.',
        decision: {
          question: 'O que respondes aos dois?',
          options: [
            {
              id: 'a',
              text: 'Ao primeiro dizes que "5 minutos não faz mal". Ao segundo dizes o valor, para ele fazer uma proposta mais certa.',
              result: 'Os outros concorrentes descobrem e queixam-se. O concurso pode ser anulado.',
              why: 'Todos os concorrentes têm de ser tratados da mesma forma, com as mesmas informações. É o princípio do concurso.',
            },
            {
              id: 'b',
              text: 'Dizes ao primeiro que o prazo é o do caderno de encargos e que não há excepções. Ao segundo, que a resposta será publicada para todos no portal.',
              result:
                'O primeiro corre e entrega a tempo; o segundo vê a resposta publicada com as outras dúvidas.',
              why: 'Regras iguais e respostas públicas protegem o concurso e protegem-te a ti.',
            },
            {
              id: 'c',
              text: 'Não atendes mais chamadas durante o dia.',
              result: 'Dois concorrentes não conseguem esclarecer dúvidas e entregam propostas incompletas.',
              why: 'Esclarecer dúvidas, por canais oficiais, faz parte do processo. Fugir à comunicação não é imparcialidade.',
            },
          ],
        },
      },
      {
        id: 'chefe',
        time: '11:30',
        title: 'A chamada de um director',
        text: 'Um director de outro departamento liga-te: um amigo dele vai concorrer e pede que "ajudes" quando as propostas forem avaliadas.',
        decision: {
          question: 'Como respondes?',
          options: [
            {
              id: 'a',
              text: 'Dizes que vais ver o que se pode fazer.',
              result: 'Ficas comprometido. Se isto se souber, perdes o cargo e podes responder em tribunal.',
              why: 'Dar sinais de favor é o primeiro passo de uma corrupção. A tua assinatura responde por ti.',
            },
            {
              id: 'b',
              text: 'Dizes que a avaliação é feita em comissão, com critérios escritos, e que não podes falar de nenhuma proposta. No fim, informas o chefe da unidade.',
              result:
                'O director desliga, desagradado. O chefe regista a chamada e agradece-te por avisares.',
              why: 'Recusar com calma e avisar é o que protege o processo e a tua carreira.',
            },
          ],
        },
      },
      {
        id: 'abertura',
        time: '15:00',
        title: 'A abertura das propostas',
        text: 'Às 15h fecha-se a recepção. Na sala, com os representantes de seis empresas presentes, abres os envelopes um a um e lês em voz alta o nome e o valor. Alguém regista tudo na acta.',
      },
      {
        id: 'avaliacao',
        time: '16:15',
        title: 'Primeira verificação',
        text: 'Com a comissão, verificas se cada proposta tem os documentos obrigatórios: certidões, NIF, alvará. Uma das propostas, a mais barata, não traz uma certidão.',
        decision: {
          question: 'A proposta é a mais barata. O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Aceitas a proposta e pedes a certidão depois, porque é a melhor para o Estado.',
              result: 'Outro concorrente reclama e a reclamação é aceite. O concurso atrasa meses.',
              why: 'As regras valem para todos. Uma excepção abre a porta a reclamações e a mais atrasos.',
            },
            {
              id: 'b',
              text: 'Aplicas a regra: a proposta é excluída e a razão fica escrita na acta.',
              result: 'A empresa reclama mas a decisão fica de pé, porque seguiste o caderno de encargos.',
              why: 'Fazer cumprir as regras, mesmo quando custa, é a base da contratação pública.',
            },
          ],
        },
      },
      {
        id: 'fim',
        time: '18:00',
        title: 'Fim do dia',
        text: 'Carregas a acta no portal, arquivas os envelopes e sais tarde. O processo tem uma semana de avaliação à frente, sempre por escrito.',
      },
    ],
    asks: [
      'Tratar todos de igual modo e resistir a pressões.',
      'Rigor com prazos, regras e documentos.',
      'Ler leis e cadernos de encargos com atenção.',
      'Registar tudo por escrito.',
    ],
    next: [
      { kind: 'course', text: 'Vê as formações em contratação pública na página da carreira.' },
      { kind: 'academy', text: 'Conhece as instituições que dão esta formação.' },
      { kind: 'internship', text: 'Procura estágios e concursos públicos em organismos do Estado.' },
    ],
  },
  {
    id: 'um-dia-como-gestor-de-redes-sociais',
    careerSlug: 'gestor-de-redes-sociais',
    title: 'Um dia como gestor de redes sociais numa agência',
    intro:
      'Trabalhas numa pequena agência de Luanda e geres as redes sociais de uma marca de bebidas e de uma loja de roupa. Hoje há lançamento de uma promoção.',
    minutes: 7,
    moments: [
      {
        id: 'chegada',
        time: '08:30',
        title: 'As notificações',
        text: 'Antes do café, já abriste as mensagens das duas contas: perguntas sobre preços, uma queixa de uma entrega, um comentário a elogiar e outro a insultar. Respondes ao que podes e deixas o resto para depois da reunião.',
      },
      {
        id: 'reuniao',
        time: '09:30',
        title: 'Reunião de planeamento',
        text: 'Com a directora de contas, vês o calendário da semana. A promoção da bebida sai às 12h e o cliente quer um vídeo curto no Instagram e no TikTok. Tens uma manhã e um telemóvel com boa câmara.',
      },
      {
        id: 'criar',
        time: '10:00',
        title: 'Criar o conteúdo',
        text: 'Filmas, editas, escreves a legenda e escolhes as hashtags. O cliente envia por WhatsApp uma mensagem: "Pode ser com a minha filha a dizer o texto?" É menor de idade.',
        decision: {
          question: 'O que respondes?',
          options: [
            {
              id: 'a',
              text: 'Dizes que sim, porque o cliente decide.',
              result:
                'O vídeo sai e uma conta denuncia a marca por usar uma criança em publicidade de bebidas. O vídeo é retirado.',
              why: 'Há regras para a publicidade, sobretudo de bebidas e com menores. O gestor deve conhecê-las e avisar o cliente.',
            },
            {
              id: 'b',
              text: 'Explicas que numa campanha de bebidas não podes usar menores, e propões uma pessoa adulta ou só a música e o produto.',
              result: 'O cliente aceita a segunda ideia e o vídeo sai a horas.',
              why: 'Conhecer os limites e propor uma alternativa faz de ti um profissional, não só alguém que executa.',
            },
            {
              id: 'c',
              text: 'Recusas e não dizes porquê.',
              result: 'O cliente fica confuso e liga à directora. Perdes uma tarde a explicar.',
              why: 'Uma recusa sem razão custa tempo e confiança. Explicar é parte do serviço.',
            },
          ],
        },
      },
      {
        id: 'almoco',
        time: '12:30',
        title: 'A publicação sai',
        text: 'Publicas às 12h, como combinado. Em poucos minutos entram os primeiros comentários e as primeiras perguntas. Almoças com o portátil aberto, a responder.',
      },
      {
        id: 'crise',
        time: '14:30',
        title: 'Um comentário que cresce',
        text: 'Uma pessoa publicou na conta da loja de roupa: "Paguei e nunca chegou." Já tem 40 gostos e outras pessoas a juntar-se. Ainda não falaste com o cliente.',
        decision: {
          question: 'O que fazes?',
          options: [
            {
              id: 'a',
              text: 'Apagas o comentário.',
              result: 'A pessoa volta a escrever, mais zangada, e publica uma captura. O assunto cresce.',
              why: 'Apagar queixas reais piora o problema. As pessoas esperam resposta, não silêncio.',
            },
            {
              id: 'b',
              text: 'Respondes em público, com calma, a pedir os dados da encomenda em privado, e avisas o cliente para resolver a entrega.',
              result: 'A pessoa manda os dados, a entrega é encontrada e ela volta a comentar a agradecer.',
              why: 'Responder depressa, em público, e resolver em privado é o que se faz numa crise pequena.',
            },
            {
              id: 'c',
              text: 'Respondes a dizer que a culpa foi dela.',
              result: 'O comentário tem centenas de respostas em duas horas. O cliente liga, furioso.',
              why: 'Uma marca nunca ganha uma discussão em público. O tom é parte do trabalho.',
            },
          ],
        },
      },
      {
        id: 'fim',
        time: '17:00',
        title: 'Os números do dia',
        text: 'Abres as estatísticas: o vídeo teve 18 mil visualizações e 60 mensagens. Escreves o resumo para o cliente, com o que funcionou e o que mudar na próxima publicação.',
      },
    ],
    asks: [
      'Escrever curto e claro, com o tom da marca.',
      'Manter a calma com críticas e queixas.',
      'Conhecer as regras da publicidade e das plataformas.',
      'Medir resultados, não só publicar.',
    ],
    next: [
      { kind: 'course', text: 'Vê os cursos de marketing digital e de comunicação na página da carreira.' },
      { kind: 'academy', text: 'Compara as escolas de comunicação e marketing.' },
      { kind: 'internship', text: 'Procura estágios em agências e em departamentos de marketing.' },
    ],
  },
]
