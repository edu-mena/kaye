# 0027. A IA liga-se por MCP e só escreve propostas

25 de novembro de 2026 · Estado: Aceite (o ponto 6 foi alargado às edições do painel pelo [ADR 0028](0028-painel-completo.md))

## Contexto

- O [ADR 0019](0019-backend-e-migracao-dos-dados.md) previa que o Eduardo ligasse a sua IA ao Kayé para pesquisar e introduzir conteúdo, com as tabelas `ai_tasks` e `revisions` e a regra "a IA só escreve propostas".
- Já há papéis, 2FA e auditoria ([ADR 0026](0026-papeis-2fa-copias-e-saude.md)). Os tokens da app Android têm todas as permissões (`*`).
- O catálogo vem do JSON do frontend e o `kaye:import` corre em cada deploy, reescrevendo os campos que mudaram.

## Decisão

1. **Servidor MCP** (`laravel/mcp`, passa a dependência de produção) em `/mcp`, com seis ferramentas: `search_content`, `get_content`, `list_missing`, `list_sources`, `propose_change` e `attach_image`. Só entra um token Sanctum criado no painel com a permissão **exatamente** `["mcp"]`; um token `*` e um cookie de sessão são recusados (403). O dono tem de ter `content.edit` e o email em `ADMIN_EMAILS`.
2. **`revisions`** guarda cada proposta: os valores novos, os de antes, a fonte (obrigatória), a nota e o autor. Aprovar aplica, junta a fonte e publica; rejeitar guarda o motivo. Só aprova quem tem `content.publish`, e nunca a sua proposta. Uma proposta cujos campos mudaram entretanto fica bloqueada.
3. **Regras num só sítio:** `App\Support\ContentTypes` diz que tipos e campos a IA pode mudar e as regras de cada um. Nos campos de escolha, os valores válidos são os que a coluna já tem. As carreiras novas ficam fora: são decisão editorial.
4. **"Pesquisar com IA" em fila:** o job `RunAiTask` chama a API da Anthropic por HTTP (o mesmo padrão do `NewsSummariser`, e o que deixa os testes usarem `Http::fake`), com o Claude Sonnet 5.5, esforço `medium`, a pesquisa e a leitura web da Anthropic e as mesmas ferramentas de escrita. Os *fallbacks* do servidor estão ligados (`fallbacks: "default"`), como a Anthropic recomenda. Os limites são de voltas, de tokens por tarefa e um **orçamento diário** em dólares; com o orçamento gasto, a tarefa nem chama a API.
5. **Imagens:** o servidor descarrega com as defesas de um pedido próprio (só https, todos os IPs públicos, ligação fixada ao IP verificado, sem redirecionamentos, até 3 MB, JPEG, PNG ou WebP verdadeiros) e guarda fora de `public/` até à aprovação. Aprovada, a imagem passa para `storage/app/public` (servida em `/storage`; o pós-deploy cria a ligação).
6. **O import respeita as aprovações:** um campo alterado por uma proposta aprovada deixa de ser escrito pelo `kaye:import`. Uma alteração feita sem proposta continua a ser desfeita pelo JSON, como antes.

## Consequências

- O catálogo passa a ter duas origens: o JSON do frontend (o que já existe) e as aprovações (o que a IA e a equipa acrescentam). Para um campo aprovado, quem manda é a base de dados. O JSON não fica atualizado sozinho.
- O claude.ai no browser ainda não entra: os seus conectores exigem OAuth. Fica o Claude Code e o Claude Desktop (com `mcp-remote`).
- O `retry_after` da fila `database` sobe para 900 s, acima do tempo máximo de uma pesquisa (840 s): uma pesquisa a correr nunca é entregue a um segundo processo.
- Os formulários do painel completo (prompt 9) usam as regras de `ContentTypes` e o botão `ResearchWithAi` em cada registo.
