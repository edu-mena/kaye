import { type ExamQuestion, topicWriter } from './types'

// Língua Portuguesa: original questions and texts at the level of the 10.ª–12.ª classes (INIDE/MED programmes).
// Spelling follows the Acordo Ortográfico de 1990, as the rest of the app; the spelling questions only use words
// written the same way before and after it. The right option is the first one; the session shuffles them.

const interpretacao = topicWriter('portugues', 'por', 'interpretacao')
const gramatica = topicWriter('portugues', 'por', 'gramatica')
const ortografia = topicWriter('portugues', 'por', 'ortografia')
const vocabulario = topicWriter('portugues', 'por', 'vocabulario')

const KWANZA =
  'O rio Kwanza nasce no planalto do Bié e percorre cerca de mil quilómetros até ao oceano Atlântico, a sul de Luanda. Ao longo do seu curso, as águas regam campos de cultivo, movem as turbinas de barragens e dão sustento a muitas famílias de pescadores. Nos últimos anos, porém, o lixo e a areia retirada sem controlo das margens têm ameaçado o equilíbrio do rio. Proteger o Kwanza é proteger uma parte da própria história de Angola, que dele recebeu o nome da sua moeda.'

const LUEJI =
  'Quando a Lueji terminou o ensino médio, enviou dezenas de currículos e não recebeu resposta. Em vez de desistir, decidiu fazer voluntariado numa associação do seu bairro, onde ensinava informática a crianças. Seis meses depois, o pai de uma das crianças, gerente de uma pequena empresa, reparou na paciência e na organização da jovem e ofereceu-lhe um estágio. Hoje, a Lueji diz que aprendeu uma lição: as oportunidades nem sempre chegam pela porta que esperamos.'

const TELEMOVEL =
  'Há quem defenda que os telemóveis devem ser proibidos nas salas de aula, por distraírem os alunos. Contudo, proibir é a solução mais fácil, não a mais inteligente. Um telemóvel pode ser um dicionário, uma calculadora e uma biblioteca no bolso. O desafio está em ensinar os jovens a usá-lo com regras claras: na hora certa e para o fim certo. Uma escola que ignora a tecnologia prepara os alunos para um mundo que já não existe.'

const VARANDA = 'Na varanda da avó\no tempo anda devagar:\na panela canta no fogo,\no vento penteia o mar.'

const ACESSO =
  'Em Angola, o acesso às instituições públicas de ensino superior faz-se, em regra, através de um exame. Como o número de candidatos é muito superior ao de vagas, ter a nota mínima não basta: entram os candidatos com as melhores classificações, até se preencherem as vagas de cada curso. Por isso, preparar-se com antecedência, conhecer as disciplinas do exame e treinar com tempo pode fazer a diferença.'

const MERCADO =
  'O mercado abre antes do sol. As bancas enchem-se de mandioca, gimboa, peixe seco e fruta da época, e as vozes das zungueiras misturam-se com o ruído dos candongueiros que chegam e partem. Às dez horas, o calor já pesa, mas o movimento não abranda: vende-se, regateia-se, conversa-se. O mercado é, ao mesmo tempo, loja, ponto de encontro e jornal do bairro.'

const MALARIA =
  'A malária é transmitida pela picada do mosquito Anopheles fêmea, infetado por um parasita. Dormir debaixo de uma rede mosquiteira tratada com inseticida, eliminar as águas paradas perto de casa e procurar um centro de saúde ao primeiro sinal de febre são medidas simples que salvam vidas. O tratamento precoce é decisivo, sobretudo nas crianças.'

const PONTUALIDADE =
  '— Que pontualidade! — disse o professor, quando o Kiala entrou na sala, quarenta minutos depois do início da aula.'

export const PORTUGUES: ExamQuestion[] = [
  // ---------- Interpretação de texto ----------
  interpretacao(
    'easy',
    'Segundo o texto, onde nasce o rio Kwanza?',
    ['No planalto do Bié', 'Em Luanda', 'No oceano Atlântico', 'Numa barragem'],
    'O texto diz logo na primeira frase: «nasce no planalto do Bié». O Atlântico é onde o rio termina.',
    KWANZA,
  ),
  interpretacao(
    'easy',
    'Que ameaças ao rio o texto refere?',
    [
      'O lixo e a areia retirada das margens sem controlo',
      'A pesca e a agricultura',
      'As barragens e a moeda',
      'A falta de chuva',
    ],
    'A frase com «porém» aponta o lixo e a areia retirada sem controlo. A pesca e a agricultura aparecem como benefícios do rio.',
    KWANZA,
  ),
  interpretacao(
    'medium',
    'No texto, «dão sustento a muitas famílias» significa que as águas…',
    [
      'garantem o meio de vida dessas famílias',
      'dão força física às famílias',
      'seguram as margens do rio',
      'alimentam os peixes',
    ],
    '«Sustento» é aquilo de que alguém vive: aqui, a pesca dá rendimento e comida às famílias.',
    KWANZA,
  ),
  interpretacao(
    'medium',
    'Qual é a ideia principal do texto?',
    [
      'O Kwanza é muito importante para Angola e precisa de ser protegido',
      'O Kwanza é o rio mais longo de África',
      'Os pescadores poluem o rio',
      'A moeda angolana vai mudar de nome',
    ],
    'O texto mostra a importância do rio e termina com o apelo a protegê-lo. As outras opções não estão no texto.',
    KWANZA,
  ),
  interpretacao(
    'medium',
    'A palavra «porém» estabelece entre as frases uma relação de…',
    ['oposição', 'causa', 'conclusão', 'adição'],
    '«Porém» é uma conjunção adversativa: depois dos benefícios do rio, introduz o que se opõe a eles, as ameaças.',
    KWANZA,
  ),
  interpretacao(
    'easy',
    'Porque conseguiu a Lueji o estágio?',
    [
      'Um pai reparou nas qualidades dela durante o voluntariado',
      'Respondeu a um anúncio de emprego',
      'Uma empresa respondeu a um currículo',
      'A associação contratou-a',
    ],
    'O estágio veio do pai de uma das crianças, que reparou na paciência e na organização da jovem. Os currículos não tiveram resposta.',
    LUEJI,
  ),
  interpretacao(
    'medium',
    'A expressão «Em vez de desistir» mostra que a Lueji foi…',
    ['persistente', 'impaciente', 'desorganizada', 'indecisa'],
    'Perante a falta de resposta, ela continuou a procurar outro caminho: é sinal de persistência.',
    LUEJI,
  ),
  interpretacao(
    'medium',
    'A lição final quer dizer que…',
    [
      'as oportunidades podem surgir por caminhos inesperados',
      'é inútil enviar currículos',
      'só se arranja emprego por amizade',
      'o voluntariado é sempre pago',
    ],
    'A «porta que esperamos» eram os currículos; a oportunidade veio por outra, o voluntariado.',
    LUEJI,
  ),
  interpretacao(
    'medium',
    'Em «ofereceu-lhe um estágio», o pronome «lhe» refere-se…',
    ['à Lueji', 'ao pai', 'à empresa', 'às crianças'],
    'O estágio foi oferecido à jovem: «lhe» substitui «à Lueji» (complemento indireto).',
    LUEJI,
  ),
  interpretacao(
    'easy',
    'Quanto ao tipo, o texto é sobretudo…',
    ['narrativo', 'argumentativo', 'instrucional', 'poético'],
    'Conta acontecimentos de uma personagem ao longo do tempo («Quando…», «Seis meses depois…», «Hoje…»).',
    LUEJI,
  ),
  interpretacao(
    'easy',
    'Qual é a posição do autor?',
    [
      'É contra a proibição e defende o uso com regras',
      'Defende a proibição total',
      'Não tem opinião',
      'Defende o uso sem qualquer regra',
    ],
    'O autor diz que proibir não é a solução mais inteligente e propõe ensinar a usar o telemóvel com regras claras.',
    TELEMOVEL,
  ),
  interpretacao(
    'medium',
    'Que argumento usa o autor para defender a sua posição?',
    [
      'O telemóvel pode servir de ferramenta de estudo',
      'Os telemóveis são baratos',
      'Os professores também usam telemóveis',
      'Os pais exigem que os filhos o levem',
    ],
    'Diz que o telemóvel «pode ser um dicionário, uma calculadora e uma biblioteca no bolso».',
    TELEMOVEL,
  ),
  interpretacao(
    'medium',
    'A palavra «Contudo» pode ser substituída, sem mudar o sentido, por…',
    ['No entanto', 'Portanto', 'Porque', 'Além disso'],
    'Ambas exprimem oposição. «Portanto» é conclusivo, «porque» é causal e «além disso» é aditivo.',
    TELEMOVEL,
  ),
  interpretacao(
    'easy',
    'Que tipo de texto é este?',
    ['Argumentativo (de opinião)', 'Narrativo', 'Descritivo', 'Instrucional'],
    'O autor apresenta uma tese (proibir não é a melhor solução) e argumentos para a defender.',
    TELEMOVEL,
  ),
  interpretacao(
    'hard',
    'Com a última frase, o autor quer dizer que…',
    [
      'a escola deve acompanhar as mudanças do mundo',
      'a escola deve voltar ao passado',
      'o mundo vai acabar',
      'a tecnologia não tem futuro',
    ],
    'Uma escola que ignora a tecnologia prepara para um mundo antigo, que «já não existe»: deve, pelo contrário, acompanhar o presente.',
    TELEMOVEL,
  ),
  interpretacao(
    'medium',
    'Que recurso expressivo há em «a panela canta no fogo»?',
    ['Personificação', 'Comparação', 'Hipérbole', 'Antítese'],
    'Atribui-se uma ação humana (cantar) a um objeto. Não há «como» (comparação) nem exagero (hipérbole).',
    VARANDA,
  ),
  interpretacao(
    'medium',
    'O verso «o tempo anda devagar» sugere…',
    [
      'um ambiente calmo e tranquilo',
      'que o relógio está avariado',
      'que a avó é lenta',
      'pressa e agitação',
    ],
    'Na casa da avó tudo parece calmo: a passagem do tempo sente-se mais lenta.',
    VARANDA,
  ),
  interpretacao(
    'easy',
    'Que palavras rimam no poema?',
    ['devagar e mar', 'avó e fogo', 'canta e penteia', 'varanda e tempo'],
    'Rimam o 2.º e o 4.º versos: «devagar» e «mar», com o mesmo som final.',
    VARANDA,
  ),
  interpretacao(
    'easy',
    'Quantos versos tem a estrofe e como se chama?',
    ['Quatro: uma quadra', 'Três: um terceto', 'Dois: um dístico', 'Cinco: uma quintilha'],
    'Cada linha é um verso; quatro versos formam uma quadra.',
    VARANDA,
  ),
  interpretacao(
    'easy',
    'Segundo o texto, porque não basta ter a nota mínima?',
    [
      'Porque há mais candidatos do que vagas',
      'Porque o exame é fácil',
      'Porque as vagas são ilimitadas',
      'Porque não há exame',
    ],
    'O texto explica: «Como o número de candidatos é muito superior ao de vagas», entram só os mais bem classificados.',
    ACESSO,
  ),
  interpretacao(
    'medium',
    'No texto, «em regra» significa…',
    ['normalmente', 'nunca', 'por obrigação da lei', 'raramente'],
    '«Em regra» quer dizer «na maior parte dos casos», admitindo exceções.',
    ACESSO,
  ),
  interpretacao(
    'medium',
    'A expressão «Por isso» introduz…',
    ['uma conclusão', 'uma causa', 'uma oposição', 'um exemplo'],
    'Do que foi dito (há poucas vagas) tira-se uma conclusão: preparar-se com tempo faz a diferença.',
    ACESSO,
  ),
  interpretacao(
    'medium',
    'Qual é a finalidade principal do texto?',
    [
      'Informar e aconselhar os candidatos',
      'Contar uma história',
      'Descrever uma paisagem',
      'Criticar as universidades',
    ],
    'Explica como funciona o acesso e termina com um conselho prático.',
    ACESSO,
  ),
  interpretacao(
    'easy',
    'Que tipo de texto predomina?',
    ['Descritivo', 'Argumentativo', 'Instrucional', 'Dramático'],
    'O texto mostra o mercado através de pormenores: os produtos, os sons, o calor, o movimento.',
    MERCADO,
  ),
  interpretacao(
    'hard',
    'Dizer que o mercado é «jornal do bairro» significa que…',
    [
      'é um lugar onde circulam as notícias do bairro',
      'lá se vendem jornais',
      'tem uma redação de jornalistas',
      'é um edifício novo',
    ],
    'É uma metáfora: como num jornal, no mercado ficam-se a saber as novidades, porque as pessoas conversam.',
    MERCADO,
  ),
  interpretacao(
    'medium',
    'No texto, «regateia-se» quer dizer que…',
    ['se discute o preço', 'se foge', 'se grita', 'se rega'],
    'Regatear é discutir o preço para o baixar.',
    MERCADO,
  ),
  interpretacao(
    'medium',
    'No texto, «o movimento não abranda» quer dizer que o movimento…',
    ['não diminui', 'não começa', 'não aumenta', 'não muda de lugar'],
    'Abrandar é diminuir de intensidade ou de velocidade: apesar do calor, há tanta gente como antes.',
    MERCADO,
  ),
  interpretacao(
    'hard',
    'Que recurso há em «loja, ponto de encontro e jornal do bairro»?',
    ['Enumeração', 'Antítese', 'Ironia', 'Eufemismo'],
    'Enumeram-se, um a seguir ao outro, os vários papéis do mercado.',
    MERCADO,
  ),
  interpretacao(
    'easy',
    'Segundo o texto, quem transmite a malária?',
    ['O mosquito Anopheles fêmea infetado', 'A água parada', 'Qualquer mosquito macho', 'A rede mosquiteira'],
    'A primeira frase diz que é a picada do mosquito Anopheles fêmea infetado. A água parada é onde os mosquitos se reproduzem.',
    MALARIA,
  ),
  interpretacao(
    'medium',
    'Que medida NÃO é referida no texto?',
    [
      'Tomar banho de água fria',
      'Dormir com rede mosquiteira',
      'Eliminar as águas paradas',
      'Ir ao centro de saúde quando há febre',
    ],
    'O texto refere a rede, as águas paradas e o centro de saúde. O banho não aparece.',
    MALARIA,
  ),
  interpretacao(
    'medium',
    'No texto, «tratamento precoce» é um tratamento…',
    ['feito cedo', 'feito tarde', 'caro', 'doloroso'],
    '«Precoce» quer dizer que acontece cedo, logo nos primeiros sinais.',
    MALARIA,
  ),
  interpretacao(
    'easy',
    'No texto, «sobretudo» pode ser substituído por…',
    ['principalmente', 'apenas', 'nunca', 'também não'],
    '«Sobretudo» destaca as crianças, sem excluir os outros: «principalmente».',
    MALARIA,
  ),
  interpretacao(
    'medium',
    'Que recurso expressivo usa o professor?',
    ['Ironia', 'Comparação', 'Aliteração', 'Hipérbole'],
    'Diz o contrário do que pensa: elogia a pontualidade de quem chegou muito atrasado.',
    PONTUALIDADE,
  ),
  interpretacao(
    'easy',
    'Com a sua frase, o professor pretende…',
    ['criticar o atraso do Kiala', 'elogiar o Kiala', 'saber as horas', 'começar a aula'],
    'A ironia serve aqui para criticar: o Kiala chegou quarenta minutos atrasado.',
    PONTUALIDADE,
  ),
  interpretacao(
    'easy',
    'Que recurso há em «Já te disse isto um milhão de vezes!»?',
    ['Hipérbole', 'Ironia', 'Metáfora', 'Eufemismo'],
    'É um exagero intencional para dar força à ideia: hipérbole.',
  ),
  interpretacao(
    'medium',
    'Que recurso há em «Ele partiu desta para melhor», dito de alguém que morreu?',
    ['Eufemismo', 'Hipérbole', 'Ironia', 'Antítese'],
    'Suaviza-se uma ideia dura (a morte) com uma expressão mais leve: eufemismo.',
  ),
  interpretacao(
    'easy',
    'Que recurso há em «És forte como um leão»?',
    ['Comparação', 'Metáfora', 'Personificação', 'Antítese'],
    'Há uma palavra que compara («como»). Sem ela («És um leão») seria uma metáfora.',
  ),
  interpretacao(
    'medium',
    'Que recurso há em «A vida é um rio»?',
    ['Metáfora', 'Comparação', 'Ironia', 'Hipérbole'],
    'Identifica-se a vida com um rio, sem palavra comparativa: metáfora.',
  ),

  // ---------- Gramática ----------
  gramatica(
    'easy',
    'Na frase «O João correu rapidamente», a que classe pertence «rapidamente»?',
    ['Advérbio', 'Adjetivo', 'Verbo', 'Nome'],
    'Modifica o verbo (diz como correu). Muitas palavras terminadas em -mente são advérbios de modo.',
  ),
  gramatica(
    'easy',
    'Na frase «Os alunos estudam todos os dias», qual é o sujeito?',
    ['Os alunos', 'estudam', 'todos os dias', 'Não tem sujeito'],
    'Quem estuda? «Os alunos». O verbo concorda com ele no plural.',
  ),
  gramatica(
    'easy',
    'Na frase «A Maria comprou um livro», qual é o complemento direto?',
    ['um livro', 'A Maria', 'comprou', 'A Maria comprou'],
    'Comprou o quê? «um livro». Pode ser substituído por «o»: «A Maria comprou-o».',
  ),
  gramatica(
    'medium',
    'Na frase «Dei o caderno ao meu irmão», qual é o complemento indireto?',
    ['ao meu irmão', 'o caderno', 'Dei', 'o caderno ao meu irmão'],
    'Dei a quem? «ao meu irmão». Pode ser substituído por «lhe»: «Dei-lhe o caderno».',
  ),
  gramatica(
    'easy',
    'Em «Amanhã viajarei para o Huambo», em que tempo está o verbo?',
    ['Futuro do indicativo', 'Pretérito perfeito do indicativo', 'Presente do conjuntivo', 'Condicional'],
    '«Viajarei» indica uma ação que ainda vai acontecer: futuro do indicativo.',
  ),
  gramatica(
    'medium',
    'Em «Se eu tivesse tempo, ajudava-te», em que tempo e modo está «tivesse»?',
    [
      'Pretérito imperfeito do conjuntivo',
      'Presente do conjuntivo',
      'Pretérito mais-que-perfeito do indicativo',
      'Condicional',
    ],
    'Exprime uma condição hipotética: pretérito imperfeito do conjuntivo (que eu tivesse, que tu tivesses…).',
  ),
  gramatica(
    'easy',
    'Qual é o plural de «cidadão»?',
    ['cidadãos', 'cidadões', 'cidadães', 'cidadans'],
    'Cidadão faz o plural em -ãos, como irmão (irmãos) e mão (mãos).',
  ),
  gramatica(
    'easy',
    'Qual é o plural de «pão»?',
    ['pães', 'pãos', 'pões', 'pãis'],
    'Pão faz o plural em -ães, como cão (cães) e capitão (capitães).',
  ),
  gramatica(
    'easy',
    'Qual é o plural de «papel»?',
    ['papéis', 'papels', 'papeles', 'papéus'],
    'Os nomes terminados em -el fazem o plural em -éis: papel, papéis; anel, anéis.',
  ),
  gramatica(
    'easy',
    'Qual é o feminino de «genro»?',
    ['nora', 'genra', 'sogra', 'cunhada'],
    'Alguns nomes formam o feminino com uma palavra diferente: genro e nora, como pai e mãe.',
  ),
  gramatica(
    'hard',
    'Qual é o superlativo absoluto sintético de «difícil»?',
    ['dificílimo', 'muito difícil', 'o mais difícil', 'dificilão'],
    '«Muito difícil» é o superlativo analítico (com advérbio) e «o mais difícil» é o superlativo relativo.',
  ),
  gramatica(
    'medium',
    'Na frase «Os livros que li eram bons», a palavra «que» é…',
    ['um pronome relativo', 'uma conjunção', 'um advérbio', 'uma preposição'],
    'Retoma «os livros» (os livros que li = li os livros) e introduz uma oração relativa.',
  ),
  gramatica(
    'medium',
    'Qual é a passiva de «O professor corrigiu os testes»?',
    [
      'Os testes foram corrigidos pelo professor.',
      'Os testes corrigiram o professor.',
      'O professor foi corrigido pelos testes.',
      'Os testes eram corrigidos pelo professor.',
    ],
    'O complemento direto passa a sujeito, o verbo fica com «ser» no mesmo tempo (pretérito perfeito: foram) e o sujeito passa a agente.',
  ),
  gramatica(
    'hard',
    'Ele disse: «Estou cansado.» Qual é a frase em discurso indireto?',
    [
      'Ele disse que estava cansado.',
      'Ele disse que estou cansado.',
      'Ele disse que estará cansado.',
      'Ele disse que esteve cansado.',
    ],
    'No discurso indireto, o presente («estou») passa a pretérito imperfeito («estava») e a 1.ª pessoa passa à 3.ª.',
  ),
  gramatica(
    'medium',
    'Qual destas frases tem o pronome bem colocado?',
    ['Não me disse nada.', 'Não disse-me nada.', 'Não disseme nada.', 'Não disse nada-me.'],
    'Palavras negativas como «não» atraem o pronome para antes do verbo.',
  ),
  gramatica(
    'hard',
    'Qual é a forma correta do futuro de «dar» com o pronome «te»?',
    [
      'Dar-te-ei o livro amanhã.',
      'Darei-te o livro amanhã.',
      'Dar-ei-te o livro amanhã.',
      'Daretei o livro amanhã.',
    ],
    'No futuro, sem palavra que atraia o pronome, ele fica no meio do verbo (mesóclise): dar-te-ei.',
  ),
  gramatica(
    'medium',
    'Completa: «___ muitas pessoas na fila.»',
    ['Havia', 'Haviam', 'Houveram', 'Haverão'],
    'O verbo «haver» com o sentido de existir é impessoal e fica sempre no singular.',
  ),
  gramatica(
    'medium',
    'Completa: «___ dois anos que terminei o ensino médio.»',
    ['Faz', 'Fazem', 'Fizeram', 'Façam'],
    'O verbo «fazer» a indicar tempo decorrido é impessoal e fica no singular.',
  ),
  gramatica(
    'medium',
    'Em «Estudei, mas não passei», a oração «mas não passei» é coordenada…',
    ['adversativa', 'copulativa', 'conclusiva', 'explicativa'],
    '«Mas» liga duas ideias opostas: conjunção coordenativa adversativa.',
  ),
  gramatica(
    'medium',
    'Em «Embora chovesse, saímos», a oração «Embora chovesse» é subordinada adverbial…',
    ['concessiva', 'causal', 'condicional', 'temporal'],
    'Apresenta um obstáculo que não impede a ação principal: concessiva.',
  ),
  gramatica(
    'medium',
    'Em «Como estava cansado, deitou-se cedo», a palavra «Como» introduz uma ideia de…',
    ['causa', 'comparação', 'condição', 'concessão'],
    'Deitou-se cedo porque estava cansado: «como» tem aqui valor causal.',
  ),
  gramatica(
    'medium',
    'Em «Quando chegaste, eu já tinha saído», a oração «Quando chegaste» é…',
    [
      'subordinada adverbial temporal',
      'subordinada adverbial causal',
      'subordinada adverbial final',
      'coordenada copulativa',
    ],
    'Indica o momento em que algo acontece: temporal.',
  ),
  gramatica(
    'easy',
    'Em «A criança feliz brinca no quintal», a que classe pertence «feliz»?',
    ['Adjetivo', 'Advérbio', 'Nome', 'Verbo'],
    'Caracteriza o nome «criança»: é um adjetivo.',
  ),
  gramatica(
    'medium',
    'Em «Ele trabalha muito», a que classe pertence «muito»?',
    ['Advérbio', 'Adjetivo', 'Pronome', 'Determinante'],
    'Modifica o verbo «trabalha», indicando intensidade: advérbio. Em «muito trabalho» seria quantificador.',
  ),
  gramatica(
    'medium',
    'Em «Esta casa é minha», a palavra «Esta» é…',
    [
      'um determinante demonstrativo',
      'um pronome pessoal',
      'um artigo definido',
      'um determinante possessivo',
    ],
    'Acompanha o nome «casa» e indica a sua posição perto de quem fala: demonstrativo.',
  ),
  gramatica(
    'hard',
    'Qual destas frases está correta?',
    ['Vendem-se casas.', 'Vende-se casas.', 'Vendem-se casa.', 'Vende-se as casas.'],
    'Com o «se» passivo, o verbo concorda com o sujeito: as casas são vendidas, logo «vendem-se casas».',
  ),
  gramatica(
    'easy',
    'Qual é o pretérito perfeito do verbo «pôr» na 1.ª pessoa do singular?',
    ['pus', 'pôs', 'pusi', 'ponhei'],
    'Eu pus, tu puseste, ele pôs. «Pôs» é a 3.ª pessoa.',
  ),
  gramatica(
    'easy',
    'Qual é o futuro do indicativo do verbo «fazer» na 1.ª pessoa do singular?',
    ['farei', 'fazerei', 'fazei', 'fará'],
    '«Fazer» é irregular no futuro: farei, farás, fará…',
  ),
  gramatica(
    'medium',
    'Qual é o pretérito perfeito do verbo «trazer» na 3.ª pessoa do plural?',
    ['trouxeram', 'trazeram', 'trouxem', 'traziram'],
    '«Trazer» é irregular: eu trouxe, eles trouxeram.',
  ),
  gramatica(
    'medium',
    'Completa: «É importante que tu ___ pontual.»',
    ['sejas', 'és', 'seres', 'sês'],
    'Depois de «é importante que» usa-se o conjuntivo: que eu seja, que tu sejas.',
  ),
  gramatica(
    'hard',
    'Qual é o sujeito de «Chegámos cedo»?',
    ['Nulo subentendido (nós)', 'Indeterminado', 'Inexistente', '«cedo»'],
    'O sujeito não está escrito, mas a terminação do verbo mostra que é «nós».',
  ),
  gramatica(
    'hard',
    'Qual é o sujeito de «Choveu muito ontem»?',
    ['Inexistente', 'Nulo subentendido', 'Indeterminado', '«muito»'],
    'Os verbos que exprimem fenómenos da natureza não têm sujeito: sujeito inexistente (nulo expletivo).',
  ),
  gramatica(
    'hard',
    'Em «A Ana parece cansada», que função desempenha «cansada»?',
    ['Predicativo do sujeito', 'Complemento direto', 'Modificador', 'Sujeito'],
    'Depois de um verbo copulativo (ser, estar, parecer…), atribui uma característica ao sujeito.',
  ),
  gramatica(
    'medium',
    'Como se formou a palavra «guarda-chuva»?',
    ['Por composição', 'Por prefixação', 'Por sufixação', 'Por parassíntese'],
    'Juntam-se duas palavras que já existem, «guarda» e «chuva», para formar uma nova.',
  ),
  gramatica(
    'hard',
    'Como se formou a palavra «entardecer»?',
    ['Por parassíntese', 'Por composição', 'Só por prefixação', 'Só por sufixação'],
    'Juntam-se ao mesmo tempo um prefixo (en-) e um sufixo (-ecer) a «tarde»; não existem «entarde» nem «tardecer».',
  ),

  // ---------- Ortografia ----------
  ortografia(
    'easy',
    'Qual palavra está bem escrita?',
    ['excelente', 'exelente', 'escelente', 'excellente'],
    'Escreve-se com «xc»: excelente, como exceder.',
  ),
  ortografia(
    'medium',
    'Qual palavra está bem escrita?',
    ['privilégio', 'previlégio', 'privilégeo', 'previlégeo'],
    'Pri-vi-lé-gio: com «i» na primeira sílaba e terminação «-gio».',
  ),
  ortografia(
    'medium',
    'Qual palavra está bem escrita?',
    ['cabeleireiro', 'cabelereiro', 'cabeleleiro', 'cabelireiro'],
    'Vem de «cabeleira» + «-eiro»: cabeleireiro.',
  ),
  ortografia(
    'hard',
    'Qual palavra está bem escrita?',
    ['beneficente', 'beneficiente', 'benificente', 'beneficênte'],
    'Escreve-se beneficente, como beneficência. Não há «i» depois do «c».',
  ),
  ortografia(
    'medium',
    'Qual palavra está bem escrita?',
    ['empecilho', 'impecilho', 'empecílio', 'impecílio'],
    'Vem do verbo «empecer» (estorvar): empecilho, com «e» inicial e «lh».',
  ),
  ortografia(
    'easy',
    'Qual palavra está bem escrita?',
    ['mendigo', 'mendingo', 'mindigo', 'mendíngo'],
    'Men-di-go: sem «n» antes do «g».',
  ),
  ortografia(
    'medium',
    'Qual palavra está bem escrita?',
    ['paralisar', 'paralizar', 'paralissar', 'paralizár'],
    'Vem de «paralisia», com «s»: paralisar.',
  ),
  ortografia(
    'easy',
    'Qual palavra está bem escrita?',
    ['análise', 'análize', 'anális', 'analíse'],
    'Escreve-se com «s», como analisar. A sílaba tónica é «na»: palavra esdrúxula, com acento.',
  ),
  ortografia(
    'easy',
    'Qual palavra está bem escrita?',
    ['pesquisa', 'pesquiza', 'pesquissa', 'pesqisa'],
    'Escreve-se com «s» (som de z entre vogais) e «qu».',
  ),
  ortografia(
    'hard',
    'Qual palavra está bem escrita?',
    ['ascensão', 'acensão', 'ascenção', 'assenção'],
    'Ascensão vem de «ascender» (subir): com «sc» e terminação «-são».',
  ),
  ortografia(
    'hard',
    'Qual palavra está bem escrita?',
    ['obsessão', 'obcessão', 'obseção', 'obsseção'],
    'Escreve-se com «bs» e «ss»: obsessão, obsessivo.',
  ),
  ortografia(
    'medium',
    'Qual palavra está bem escrita?',
    ['extensão', 'extenção', 'estensão', 'extenssão'],
    'Vem de «estender», mas escreve-se com «x»: extensão, extenso.',
  ),
  ortografia(
    'easy',
    'Completa: «___ dois anos que estudo inglês.»',
    ['Há', 'À', 'A', 'Ah'],
    '«Há» (do verbo haver) indica tempo passado. «À» é a preposição «a» com o artigo «a».',
  ),
  ortografia(
    'easy',
    'Completa: «Vou ___ escola de manhã.»',
    ['à', 'há', 'a', 'á'],
    'Vou a + a escola = à escola (contração da preposição com o artigo).',
  ),
  ortografia(
    'easy',
    'Completa: «Ainda vou ___ a mesa para o jantar.»',
    ['pôr', 'por', 'pór', 'poer'],
    'O verbo «pôr» leva acento para se distinguir da preposição «por».',
  ),
  ortografia(
    'medium',
    'Completa: «Não fui à festa ___ estava doente.»',
    ['porque', 'por que', 'porquê', 'por quê'],
    'Introduz uma causa: «porque», numa só palavra e sem acento.',
  ),
  ortografia(
    'medium',
    'Completa: «Chegaste tarde. ___?»',
    ['Porquê', 'Porque', 'Por que', 'Por quê'],
    'No fim de uma pergunta, sozinho, escreve-se «porquê», com acento.',
  ),
  ortografia(
    'easy',
    'Completa: «Queria ir, ___ não tive dinheiro.»',
    ['mas', 'mais', 'más', 'maz'],
    '«Mas» liga ideias opostas. «Mais» indica quantidade e «más» é o feminino plural de «mau».',
  ),
  ortografia(
    'easy',
    'Qual palavra está bem escrita?',
    ['saída', 'saida', 'saìda', 'sáida'],
    'O «i» tónico depois de vogal, sozinho na sílaba, leva acento: sa-í-da.',
  ),
  ortografia(
    'medium',
    'Qual palavra está bem escrita?',
    ['raízes', 'raizes', 'ráizes', 'raíses'],
    'Ra-í-zes: o «i» tónico em hiato leva acento. «Raiz» não leva, porque o «z» fica na mesma sílaba.',
  ),
  ortografia(
    'easy',
    'Completa: «O meu ___ é Angola.»',
    ['país', 'pais', 'paìs', 'paiz'],
    '«País» (nação) leva acento no «i»; «pais» é o plural de «pai».',
  ),
  ortografia(
    'easy',
    'Qual palavra está bem escrita?',
    ['atrás', 'atraz', 'atráz', 'átras'],
    'Atrás escreve-se com «s» e acento na última sílaba.',
  ),
  ortografia(
    'easy',
    'Qual palavra está bem escrita?',
    ['através', 'atravéz', 'atravez', 'átraves'],
    'Através escreve-se com «s» e acento no «e».',
  ),
  ortografia(
    'medium',
    'Qual palavra está bem escrita?',
    ['ansioso', 'ancioso', 'ansiozo', 'anssioso'],
    'Vem de «ânsia», com «s»: ansioso, ansiedade.',
  ),
  ortografia(
    'medium',
    'Qual palavra está bem escrita?',
    ['rigidez', 'rigides', 'rigideza', 'regidez'],
    'Os nomes abstratos que vêm de adjetivos terminam em «-ez»: rígido, rigidez.',
  ),
  ortografia(
    'medium',
    'Qual destas frases está bem escrita?',
    [
      'Eles têm muitos livros.',
      'Eles tem muitos livros.',
      'Eles teem muitos livros.',
      'Eles tẽm muitos livros.',
    ],
    'Na 3.ª pessoa do plural, «ter» leva acento circunflexo: ele tem, eles têm.',
  ),
  ortografia(
    'easy',
    'Qual palavra está bem escrita?',
    ['mexer', 'mecher', 'mexêr', 'mechêr'],
    'Mexer escreve-se com «x».',
  ),
  ortografia(
    'easy',
    'Qual palavra está bem escrita?',
    ['enxada', 'enchada', 'inxada', 'enxáda'],
    'Depois de «en-» escreve-se geralmente «x»: enxada, enxame, enxugar.',
  ),
  ortografia(
    'medium',
    'Qual palavra está bem escrita?',
    ['hesitar', 'exitar', 'ezitar', 'hezitar'],
    'Hesitar tem «h» inicial e «s».',
  ),
  ortografia(
    'medium',
    'Completa: «Estudo muito ___ entrar na universidade.»',
    ['a fim de', 'afim de', 'à fim de', 'há fim de'],
    '«A fim de» (para) escreve-se separado. «Afim» é um adjetivo que quer dizer semelhante.',
  ),

  // ---------- Vocabulário ----------
  vocabulario(
    'medium',
    'Qual é o sinónimo de «efémero»?',
    ['passageiro', 'eterno', 'enorme', 'alegre'],
    'Efémero é o que dura pouco tempo. «Eterno» é o antónimo.',
  ),
  vocabulario(
    'medium',
    'Qual é o sinónimo de «perspicaz»?',
    ['sagaz', 'lento', 'distraído', 'tímido'],
    'Perspicaz é quem percebe as coisas depressa e bem: sagaz.',
  ),
  vocabulario(
    'easy',
    'Qual é o antónimo de «escasso»?',
    ['abundante', 'raro', 'pouco', 'curto'],
    'Escasso é o que existe em pouca quantidade; o contrário é abundante.',
  ),
  vocabulario(
    'easy',
    'Qual é o antónimo de «generoso»?',
    ['avarento', 'bondoso', 'gentil', 'rico'],
    'Generoso é quem dá com facilidade; avarento é quem não quer gastar nem dar.',
  ),
  vocabulario(
    'medium',
    'Qual é o sinónimo de «ímpeto»?',
    ['impulso', 'calma', 'medo', 'atraso'],
    'Ímpeto é um movimento repentino e forte: impulso.',
  ),
  vocabulario(
    'hard',
    'O que significa «ratificar» um acordo?',
    ['Confirmar', 'Corrigir', 'Rasgar', 'Recusar'],
    'Ratificar é confirmar oficialmente. Não confundir com «retificar», que é corrigir.',
  ),
  vocabulario(
    'hard',
    'Completa: «O perigo era ___: podia acontecer a qualquer momento.»',
    ['iminente', 'eminente', 'emitente', 'imanente'],
    '«Iminente» é o que está para acontecer; «eminente» quer dizer ilustre, importante.',
  ),
  vocabulario(
    'hard',
    'Completa: «Foi homenageado um ___ médico angolano, conhecido em todo o mundo.»',
    ['eminente', 'iminente', 'imigrante', 'emergente'],
    '«Eminente» quer dizer ilustre, notável.',
  ),
  vocabulario(
    'medium',
    'Completa: «O ___ da sala é de seis metros.»',
    ['comprimento', 'cumprimento', 'cumprido', 'comprido'],
    '«Comprimento» é a medida; «cumprimento» é a saudação ou o ato de cumprir.',
  ),
  vocabulario(
    'medium',
    'Completa: «A ___ de cinema começa às 20 horas.»',
    ['sessão', 'cessão', 'sesão', 'ceção'],
    '«Sessão» é o tempo de uma reunião ou espetáculo; «cessão» é o ato de ceder.',
  ),
  vocabulario(
    'hard',
    'Completa: «Pediu ___ sobre o assunto: não queria que ninguém soubesse.»',
    ['discrição', 'descrição', 'discreção', 'descripção'],
    '«Discrição» é a qualidade de quem é discreto; «descrição» é o ato de descrever.',
  ),
  vocabulario(
    'medium',
    'Completa: «O ___ de drogas é crime.»',
    ['tráfico', 'tráfego', 'trafico', 'tráfeco'],
    '«Tráfico» é o comércio ilegal; «tráfego» é o movimento de veículos.',
  ),
  vocabulario(
    'medium',
    'Completa: «Nos anos 90, muitos angolanos ___ para Portugal.»',
    ['emigraram', 'imigraram', 'migraram-se', 'emergiram'],
    'Quem sai do seu país emigra; quem chega a um país imigra. Do ponto de vista de Angola, saíram: emigraram.',
  ),
  vocabulario(
    'easy',
    'Qual é o sinónimo de «célere»?',
    ['rápido', 'lento', 'famoso', 'claro'],
    'Célere quer dizer rápido, veloz.',
  ),
  vocabulario(
    'hard',
    'Qual é o antónimo de «prolixo»?',
    ['conciso', 'extenso', 'confuso', 'vago'],
    'Prolixo é quem diz em muitas palavras o que podia dizer em poucas; o contrário é conciso.',
  ),
  vocabulario(
    'easy',
    'O que quer dizer «dar com a língua nos dentes»?',
    ['Revelar um segredo', 'Ter dor de dentes', 'Falar baixo', 'Comer depressa'],
    'É uma expressão popular para quem conta o que devia guardar.',
  ),
  vocabulario(
    'medium',
    'O que quer dizer «meter os pés pelas mãos»?',
    ['Atrapalhar-se', 'Correr muito', 'Trabalhar com as mãos', 'Desistir'],
    'Diz-se de quem se confunde e faz ou diz as coisas de forma desajeitada.',
  ),
  vocabulario(
    'medium',
    'O que quer dizer «ser a ovelha negra» da família?',
    ['Ser quem se distingue pela negativa', 'Ser o mais velho', 'Ser o preferido', 'Criar animais'],
    'É a pessoa que se comporta de forma diferente (e mal vista) do resto do grupo.',
  ),
  vocabulario(
    'medium',
    'Uma frase «ambígua» é uma frase…',
    ['com mais de um sentido', 'muito clara', 'ambiciosa', 'antiga'],
    'Ambíguo é o que se pode entender de mais de uma maneira.',
  ),
  vocabulario(
    'hard',
    'Qual é o sinónimo de «inócuo»?',
    ['inofensivo', 'perigoso', 'invisível', 'inútil'],
    'Inócuo é o que não faz mal.',
  ),
  vocabulario(
    'easy',
    'Qual é o antónimo de «êxito»?',
    ['fracasso', 'sucesso', 'saída', 'fama'],
    'Êxito é sucesso; o contrário é fracasso.',
  ),
  vocabulario(
    'hard',
    'Qual é o sinónimo de «exíguo»?',
    ['escasso', 'enorme', 'exigente', 'rápido'],
    'Exíguo é o que é pequeno ou insuficiente: escasso.',
  ),
  vocabulario(
    'medium',
    'Em «Ele logrou terminar o curso em quatro anos», «logrou» quer dizer…',
    ['conseguiu', 'enganou-se', 'desistiu de', 'recusou-se a'],
    '«Lograr» também pode querer dizer enganar, mas aqui, seguido de um verbo, quer dizer conseguir.',
  ),
  vocabulario(
    'medium',
    'Qual é o sinónimo de «obsoleto»?',
    ['ultrapassado', 'moderno', 'obstinado', 'obscuro'],
    'Obsoleto é o que caiu em desuso.',
  ),
  vocabulario(
    'hard',
    'Qual é o sinónimo de «ufano»?',
    ['orgulhoso', 'triste', 'humilde', 'cansado'],
    'Ufano é quem mostra orgulho ou vaidade.',
  ),
  vocabulario(
    'medium',
    'Qual é o antónimo de «benévolo»?',
    ['malévolo', 'bondoso', 'benéfico', 'voluntário'],
    'Benévolo é quem quer bem; malévolo é quem quer mal.',
  ),
  vocabulario(
    'easy',
    'O provérbio «Mais vale um pássaro na mão do que dois a voar» quer dizer que…',
    [
      'é melhor ter algo certo do que arriscar por mais',
      'os pássaros fogem depressa',
      'é melhor ter dois do que um',
      'não se deve caçar',
    ],
    'Aconselha a valorizar o que já se tem em vez de o perder por algo incerto.',
  ),
  vocabulario(
    'medium',
    'Qual é o sinónimo de «intrépido»?',
    ['corajoso', 'medroso', 'intruso', 'rápido'],
    'Intrépido é quem não tem medo.',
  ),
  vocabulario(
    'medium',
    'Qual é o antónimo de «efémero»?',
    ['duradouro', 'passageiro', 'frágil', 'breve'],
    'Efémero é o que dura pouco; o contrário é duradouro.',
  ),
  vocabulario(
    'hard',
    'Qual é o sinónimo de «anuir»?',
    ['concordar', 'recusar', 'anunciar', 'aborrecer'],
    'Anuir é dar o seu acordo, consentir.',
  ),
  vocabulario(
    'medium',
    'Qual palavra NÃO pertence à família de «terra»?',
    ['terrível', 'terreno', 'enterrar', 'terráqueo'],
    '«Terrível» vem de «terror», não de «terra». As outras partilham o radical terr- de terra.',
  ),
]
