# 0014. A página pública do cartão guarda só o que a pessoa escolheu

Estado: Aceite (2026-11-03)

## Contexto

- O cartão de visita tem um QR que abre uma página pública, tipo Linktree, em `/c/:slug`. Quem lê o QR está noutro aparelho, sem acesso aos dados locais.
- Até aqui, tudo o que a pessoa faz fica no aparelho ([ADR 0005](0005-frontend-primeiro-com-dados-de-demonstracao.md)). O site de teste, na Vercel, não tem API.
- Produção é alojamento partilhado na Hostinger, com Laravel e MySQL.
- Os menores (14–17) não têm perfil público.

## Decisão

- **Os dados vão para um servidor só quando a pessoa ativa a página**, e só os campos que escolheu. Nunca a data de nascimento nem a morada.
- **No site de teste**, uma função Vercel (`apps/web/api/`) guarda os dados no Upstash Redis, sem bibliotecas novas. O contrato é `/api/v1/public-cards`: o mesmo que o Laravel vai cumprir.
- **Desligada por defeito.** Ativar devolve um slug aleatório, sem o nome, e um segredo que só o aparelho guarda; no servidor fica apenas o resumo (hash) do segredo. Desativar apaga os dados e o link deixa de funcionar de imediato. "Apagar os meus dados" também apaga a página.
- **Rejeitámos pôr os dados dentro do link.** Não precisa de servidor, mas um link assim nunca se invalida: um QR impresso ficaria válido para sempre.
- **`noindex`** no cabeçalho `X-Robots-Tag` e na própria página.
- **Menores:** nem a opção aparece, e o cartão exporta-se sem QR.
- O servidor só aceita os campos previstos, valida-os (e-mail, número, links `http` e `https`, foto em JPEG com tamanho máximo) e limita as escritas por IP.
- A biblioteca de QR é o `qrcode-generator`: é pequena, não tem dependências, e o QR é desenhado com o mesmo motor do cartão, por isso sai em vetor no PDF.

## Consequências

- **No site de teste, sem contas, o servidor não sabe a idade de quem publica.** A regra dos menores vive só na app. Em produção, o Laravel tem de a validar a partir da conta, sem exceções.
- O site de teste precisa de `KV_REST_API_URL` e `KV_REST_API_TOKEN` nas variáveis da Vercel. Sem elas, a API responde 503 e a página não se ativa.
- O segredo vive só no aparelho: se a pessoa limpar os dados do navegador sem desativar, a página fica no ar sem dono. Com contas, o dono passa a ser a conta.
- O que for publicado no site de teste fica na Upstash, um serviço externo. Só se usam dados de teste.
- Na migração para Laravel, a app muda apenas o endereço da API. As funções em `apps/web/api/` e os dados do Redis deixam de existir; o cabeçalho `noindex` tem de passar para o `.htaccess` ou para a resposta do Laravel.
