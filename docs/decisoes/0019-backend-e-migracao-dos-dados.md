# 0019. Backend em Laravel e migração dos dados do frontend

15 de novembro de 2026 · Estado: Aceite

## Contexto

- O frontend está fechado (roadmap, "Para fechar"). Todo o conteúdo (2,1 MB de carreiras, cursos, instituições, empresas, bolsas, notícias…) vive em TypeScript em `apps/web/src/data`, lido por `src/data/source.ts`, que já tem uma função por rota da API (ADR 0005).
- Os dados de cada pessoa (perfil, plano, guardados, testes, CVs, Kursos) vivem só no aparelho (`state/userStore.ts`).
- A lista de espera, as críticas, as entrevistas e os cartões públicos estão em funções do Vercel com Upstash Redis (`apps/web/api`).
- A produção é alojamento partilhado da Hostinger: sem Redis, sem processos sempre ligados, fila e cache em base de dados pelo cron.
- O Eduardo quer mudar tudo num painel e ligar a sua IA à pesquisa e à introdução de conteúdo, sem perder nada do que já existe.

## Decisão

1. **Um só Laravel serve tudo:** a API `/api/v1`, a app web compilada, o painel Filament e o servidor MCP para a IA. Um deploy, um domínio, sem CORS na web (arquitetura, secção 11, decisão 3).
2. **Os dados do frontend migram por um contrato de paridade.** Um script corre as funções de `source.ts` (e os módulos que a app lê diretamente: Kursos, exames de acesso, perguntas dos testes e das entrevistas, mentores, vídeos) em pt, en e fr e grava o resultado em `apps/api/database/data/<recurso>.<locale>.json`, com um `manifest.json` (contagem e SHA-256 por ficheiro). `php artisan kaye:import` lê esses ficheiros, recusa um hash errado e faz *upsert* por `slug`: pode correr as vezes que for preciso sem duplicar nem apagar, e uma relação partida falha com a lista dos casos. Um teste pede cada rota e compara com o JSON, campo a campo. A forma das respostas é a de `apps/web/src/data/types.ts`: o frontend não muda de tipos.
3. **O modelo de dados está em [base-de-dados.md](../base-de-dados.md#modelo-completo-adr-0019):** uma tabela por tipo com identidade própria; o que é lista aninhada sem identidade fica em JSON. Todas as tabelas de conteúdo têm `slug` único, `status` (`draft`, `review`, `published`), `source_url`, `source_checked_at`, `estimated`, *timestamps* e *soft deletes*. A API só devolve `published`.
4. **Os dados das pessoas sobem do aparelho no primeiro login.** O servidor **funde** o que o aparelho envia com o que já tem (nunca apaga), guarda-o em `user_data` com uma versão (para não perder escritas de dois aparelhos) e o `userStore` passa a sincronizar: offline primeiro, envia quando há rede. A fotografia e a capa do perfil continuam só no aparelho. A lista de espera e as críticas saem do Redis por um comando de migração, com contagem antes e depois.
5. **A IA só escreve rascunhos com fonte.** O servidor MCP (`laravel/mcp`) e a pesquisa em fila com a API do Claude podem ler tudo o que é público e criar ou propor alterações, mas cada escrita entra com `status = draft`, exige `source_url` e fica em `revisions` até o Eduardo (ou um revisor) aprovar no painel. A IA nunca publica, nunca apaga e nunca lê dados de pessoas.
6. **Email, WhatsApp e push só com consentimento.** Cada canal tem o seu consentimento em `consents` (com versão, data de dar e de retirar) e confirmação dupla no email; cada mensagem tem "deixar de receber" (no WhatsApp, "PARAR"). **Menores (14–17): nada de marketing**, em nenhum canal; recebem só avisos de serviço que pediram (um prazo marcado com "Lembrar-me", o plano). O WhatsApp usa a WhatsApp Cloud API da Meta por HTTP, com modelos aprovados, sem SDK.
7. **Pacotes**, escolhidos por correrem em alojamento partilhado, sem processos sempre ligados:

| Para quê | Pacote |
|---|---|
| Login Google (web e troca do `id_token` no Android) | `laravel/socialite` + Sanctum (já instalado) |
| Papéis do painel (admin, editor, revisor) | `spatie/laravel-permission` |
| Quem mudou o quê e quando | `spatie/laravel-activitylog` |
| Colunas pt/en/fr | `spatie/laravel-translatable` |
| Cópias de segurança pelo cron, fora da Hostinger | `spatie/laravel-backup` |
| Ligação à IA | `laravel/mcp` |
| Saúde da aplicação (driver `database`) | `laravel/pulse` |
| Notificações no aparelho com a app fechada (VAPID) | `laravel-notification-channels/webpush` |
| WhatsApp | WhatsApp Cloud API por HTTP (`Http::` do Laravel), sem SDK |

8. **Decisões do Eduardo (15/11/2026):** os dados de exemplo (instituições, ofertas, novidades e testemunhos inventados) importam-se como `draft`, invisíveis em produção; o conteúdo em en e fr é traduzido pela IA como rascunho para aprovar; as listas da API vêm inteiras (paginação só acima de 1 MB); os papéis `admin`, `editor` e `revisor` existem desde o início, embora por agora só o Eduardo entre no painel; a foto e a capa do perfil nunca saem do aparelho; as entrevistas apagam-se ao fim de 12 meses.

## Consequências

- O conteúdo passa a ter uma só fonte: o MySQL. Depois da importação, editar `apps/web/src/data/demo` deixa de ter efeito em produção; o modo `demo` fica só para o Vercel até à mudança (`VITE_DATA_SOURCE`).
- Cada mudança de conteúdo no frontend até à mudança obriga a voltar a exportar (um teste falha se o `manifest.json` estiver desatualizado).
- `user_data` guarda o estado da pessoa como um documento JSON (o mesmo `UserData` do aparelho), em vez de vinte tabelas: a fusão e a exportação ficam simples, e as partes que o servidor precisa de consultar (consentimentos, inscrições em push, cartão público) têm tabela própria.
- Apagar a conta apaga `user_data`, `consents` ativos, inscrições e entregas de mensagens da pessoa (Lei n.º 22/11); os consentimentos retirados guardam só a prova, sem dados de contacto.
- As mensagens de marketing no WhatsApp pagam-se à Meta: cada envio fica em `message_deliveries` para se saber o custo.
- Substitui, nos pontos em que diverge, o modelo planeado de [arquitetura.md, secção 4](../arquitetura.md#4-modelo-de-dados), que fica como visão de longo prazo (vagas, estatísticas semanais, XP).
