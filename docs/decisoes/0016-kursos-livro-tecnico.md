# 0016. Kursos: cursos como livro técnico, progresso e certificado no aparelho

12 de novembro de 2026 · Estado: Aceite

## Contexto

- Os jovens pedem formação curta e grátis que possam fazer no telemóvel. O primeiro pedido é inglês básico.
- Não há servidor para guardar progresso nem para verificar certificados (ADR 0005), e o conteúdo ainda está em revisão.

## Decisão

- Os Kursos (`/kursos`) são escritos como um livro técnico: explicação em português, exemplos e exercícios na língua ensinada, chave de respostas, revisão com nota no fim de cada unidade e exame final. Não é um jogo e não tem áudio.
- O primeiro curso é Inglês A1 (QECR): 8 unidades no roadmap, só as unidades 1 e 2 escritas nesta versão; o exame conta só com as unidades escritas.
- O progresso (lições feitas, notas, posição, tempo ativo, tentativas do exame) fica no aparelho, no `userStore`; "Apagar os meus dados" também o apaga.
- O certificado é um PDF gerado no aparelho (como o CV, ADR 0006), com marca de água e o texto "SEM VALIDADE". Sem QR, sem verificação, sem servidor.
- Fontes só de domínio público, CC BY ou CC BY-SA. O texto é adaptado, não copiado, e cada fonte aparece nos créditos do curso com a licença.
- Exceção ao ADR 0007: os ecrãs dos Kursos mostram uma faixa fina "Versão de teste: o conteúdo está em revisão e o certificado ainda não tem validade.", porque um certificado sem validade não pode parecer um certificado verdadeiro.

## Consequências

- Mudar de telemóvel perde o progresso até haver API.
- Quando o conteúdo for revisto e houver verificação no servidor, a faixa e a marca de água saem numa nova decisão.

## Nota (13 de novembro de 2026): cursos que não são de línguas

- O segundo curso é Fundamentos da Gestão de Projetos (nível "Iniciante": o campo `level` é texto livre, o QECR só serve para línguas). 6 unidades no roadmap, só as unidades 1 e 2 escritas.
- Num curso que não é de línguas, a explicação, os exemplos e os exercícios ficam todos em português. Um exemplo é um caso curto angolano (`examples` com `text` e `note`); um caso mais longo usa o bloco `case`. Valores em Kz só como ilustração, sem afirmar preços reais.
- Termos ingleses do ofício aparecem entre parênteses na primeira vez: âmbito (scope), partes interessadas (stakeholders).
- O PMBOK é protegido e não é usado. A fonte principal é "Project Management, 2nd ed." (Adrienne Watt, BCcampus, CC BY 4.0).
- As respostas escritas ignoram acentos ("ambito" = "âmbito"), porque no telemóvel muita gente escreve sem eles.
- Os cursos anunciados ("Em breve") são dados (`ANNOUNCED` em `data/kursos/index.ts`), um de cada vez: Economia, Contabilidade, Programação.

## Nota (13 de novembro de 2026): Fundamentos da Cibersegurança

- Nível "Iniciante". 6 unidades no roadmap; escritas a 1 (palavras-passe e verificação em dois passos) e a 2 (burlas e phishing), com revisão, exame (21 perguntas no banco) e certificado.
- Fontes: NIST SP 800-63B e os conselhos ao consumidor da FTC, ambos obras do governo dos EUA (domínio público nos EUA; a NIST reserva direitos fora dos EUA, por isso usamos só as recomendações, escritas de raiz), e a Wikipedia (CC BY-SA 4.0). Os materiais da CISA não foram usados: o site não os declara de domínio público ("subject to copyright controls").
- Só defesa: nenhuma técnica de ataque nem passo a passo para entrar em contas alheias. Os riscos explicam-se só o necessário para os reconhecer (por exemplo, porque é que o SMS pode ser desviado).
- Contactos de denúncia só com fonte oficial angolana. Enquanto não houver, o conselho é "contacta o teu banco pelo número no verso do cartão", denunciar o perfil na própria app e guardar provas.

## Nota (13 de novembro de 2026): Fundamentos do Marketing Digital

- Nível "Iniciante". 6 unidades no roadmap; escritas a 1 (o que é marketing: cliente, necessidade, proposta de valor, 4 P) e a 2 (presença digital: perfil de negócio, descrição, catálogo, horário e respostas), com revisão, exame (21 perguntas no banco) e certificado.
- Fonte: Wikipedia (CC BY-SA 4.0). O "Principles of Marketing" da OpenStax não foi usado: é CC BY-NC-SA 4.0. O "Introduction to Business" e o "Entrepreneurship", da OpenStax, também ficaram de fora (NC-SA ou licença ambígua).
- As funções das plataformas (WhatsApp, Instagram, Facebook) descrevem-se de forma geral, sem caminhos de menus, porque os menus mudam.
- Nada de promessas de ganhos. Os negócios dos exemplos são inventados: nenhuma marca real como cliente.

## Nota (13 de novembro de 2026): Programação: Nível Iniciante (Python)

- Nível "Iniciante". 6 unidades no roadmap; escritas a 1 (o que é programar: algoritmo, programa, Python, print) e a 2 (variáveis e tipos: números, texto, input, conversões), com revisão, exame (21 perguntas no banco) e certificado.
- Fonte principal: o Wikibook "Python Programming" (CC BY-SA 4.0), com a Wikipedia (CC BY-SA 4.0). O "Introduction to Python Programming" da OpenStax não foi usado: é CC BY-NC-SA 4.0. A documentação do Python também não: o texto está sob a licença PSF v2, que não é uma das permitidas. O Think Python é CC BY-NC.
- Novo bloco `code`: o código aparece como está, em monospace e sem cores. A página não corre código, porque a CSP estrita não o permite sem um ADR. Os exercícios são "o que imprime este código?", completar e ordenar; para praticar, o curso indica um editor de Python online, sem nada embutido na página.
- Os identificadores do código ficam em inglês; os comentários e as explicações, em português.

## Nota (13 de novembro de 2026): Fundamentos da Análise de Dados

- Nível "Iniciante". 6 unidades no roadmap; escritas a 1 (o que são dados: dados e informação, tabela, tipos de variáveis) e a 2 (recolher e limpar: amostra e viés, erros e duplicados, formatos de data e de Kz), com revisão, exame (21 perguntas no banco) e certificado.
- Fonte principal: OpenIntro Statistics, 4.ª ed. (CC BY-SA 3.0, confirmada na página de licenças da OpenIntro), com a Wikipedia (CC BY-SA 4.0).
- Todos os dados são inventados e marcados como tal (turmas, cantinas e associações fictícias). Não há dados pessoais reais.
- As fórmulas de folha de cálculo usam o bloco `code`, com os nomes das funções em pt-PT e, depois de //, em inglês. O separador de argumentos é ";", como na configuração portuguesa.

## Nota (24 de novembro de 2026): Programação com 30 tópicos (ADR 0025)

- O Kurso passa de 6 unidades no roadmap (2 escritas) a **30 tópicos**: 1 tópico = 1 unidade com 1 lição curta (cerca de 5 minutos), porque a conta grátis faz um tópico por dia. Os tópicos antigos 1 e 2 foram refeitos nos novos 1 a 7.
- Plano: variáveis e tipos, operadores, texto, input, decisões, ciclos `for` e `while`, listas, dicionários, funções, ficheiros de texto, erros e `try`, módulos, ler um problema, depuração e 5 mini-projetos (média de notas, tabuada, caixa registadora em Kz, lista de contactos, jogo de adivinhar).
- Cada tópico tem 8 a 10 exercícios no banco (`bank`), com os tipos do motor: `output` («o que imprime»), `fill`, `order`, `choice` e `case`. As 5 primeiras entram na lição como blocos `practice`; todas servem para o treino e o exame. A resposta de cada «o que imprime» é **calculada em TypeScript** na variante, nunca escrita à mão nem corrida (CSP).
- A revisão da unidade e o exame usam as 3 perguntas de escolha de cada tópico (90 no banco do exame).
- Fontes: as mesmas (Wikibook Python Programming e Wikipedia, CC BY-SA 4.0), só como tema; as perguntas e os dados (nomes, valores em Kz, telefones 900 000 xxx) são inventados. Cada exercício tem o campo `source`.
- `bank.test.ts` garante 8 ou mais exercícios por tópico, uma só resposta certa em cada escolha, `source` preenchida e ids únicos, para 12 sementes.
