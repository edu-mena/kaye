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
