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
