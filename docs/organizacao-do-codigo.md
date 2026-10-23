# Organização do código

Onde fica cada coisa, como se chama e onde pôr o que é novo. A estrutura do sistema (componentes, fluxos, API) está em [arquitetura.md](arquitetura.md).

## Repositório

```
kaye/
  apps/
    api/              Laravel 13: API, painel /admin, serve a app web
    web/              React + TypeScript + Vite + Capacitor (web e Android)
  docker/             Imagem de produção (Dockerfile, php.ini, entrypoint)
  docs/               Esta documentação; decisoes/ tem os ADR
  scrapers/           Recolha de vagas em Python (Fase 0.2)
  scripts/            package-release.sh, smoke-test.sh
  .github/            CI (workflows/ci.yml) e Dependabot
  compose.yaml        Stack local e de CI: imagem de produção + MariaDB
  lefthook.yml        Hooks do git (formatação e lint antes de cada commit)
  commitlint.config.mjs, .jscpd.json, .semgrepignore, .dockerignore
```

## API (`apps/api`)

| Pasta | O que vai lá | Exemplo |
|---|---|---|
| `app/Enums` | Listas fixas de valores, com tipo | `Locale`, `UserRole` |
| `app/Models` | Modelos Eloquent: uma tabela, as suas regras e relações | `User` |
| `app/Http/Controllers` | Um controlador por recurso ou ação. Fino: valida, chama, responde | `HealthController`, `SpaController` |
| `app/Http/Middleware` | O que se aplica a muitos pedidos | `SecurityHeaders`, `AssignRequestId`, `SetLocaleFromRequest` |
| `app/Console/Commands` | Comandos `php artisan kaye:*` | `CheckProductionConfig` |
| `app/Providers` | Arranque: limites de pedidos e painel Filament | `AppServiceProvider` |
| `app/Filament` | Ecrãs do painel de administração (recursos, páginas) | (Fase 0.4) |
| `config/kaye.php` | Configuração própria do Kayé | Lista `ADMIN_EMAILS` |
| `routes/api.php` | Rotas da API (servidas em `/api/v1`) | `GET /health` |
| `routes/web.php` | O resto: a app React | |
| `routes/console.php` | Tarefas agendadas | Limpeza de tokens às 02:00 |
| `database/migrations` | Estrutura da base de dados, por ordem | Ver [base-de-dados.md](base-de-dados.md) |
| `database/factories` | Dados falsos para testes | `UserFactory` (`admin()`, `minor()`) |
| `tests/Feature` | Testes por pedido HTTP, com MySQL real | Um ficheiro por assunto |

Quando a lógica de negócio crescer (por exemplo, a fórmula das recomendações), vai para `app/Services`, em classes pequenas com nomes de ação (`RecommendOccupations`). Os controladores continuam finos.

## App (`apps/web`)

| Pasta | O que vai lá |
|---|---|
| `src/app` | Arranque: `App` (providers), `router`, `Layout` |
| `src/features/<área>` | Um ecrã e o que só ele usa (hooks, componentes). Áreas: `home`, `careers`, `training`, `cv`, `profile` e outras novas (`fit`, `assessment`…) |
| `src/components` | Peças usadas por mais de uma área (`BottomNav`, `PagePlaceholder`, `AppLoading`, `icons`) |
| `src/lib` | Código sem interface: cliente da API (`api.ts`) e idiomas (`i18n.ts`) |
| `src/locales` | Textos em `pt.ts` (a fonte), `en.ts` e `fr.ts` |
| `src/test` | Preparação e ajudas dos testes (`setup.ts`, `render.tsx`) |
| `e2e` | Testes end-to-end com o Playwright |
| `android` | Projeto Android gerado pelo Capacitor; não se edita à mão |

Regra das dependências: `features` pode usar `components` e `lib`, mas `components` e `lib` nunca importam de `features`. O `import/no-cycle` do oxlint impede ciclos.

## Nomes

| O quê | Convenção | Exemplo |
|---|---|---|
| Código, comentários, tabelas, colunas | Inglês | `occupation_program` |
| URLs da app | Português | `/carreiras`, `/formacao` |
| Textos para o utilizador | Chaves em inglês, textos em pt, en e fr | `t('nav.jobs')` |
| Classes PHP | PascalCase, uma por ficheiro | `CheckProductionConfig` |
| Casos de enum | TitleCase | `UserRole::Moderator` |
| Componentes React | PascalCase, ficheiro com o mesmo nome | `BottomNav.tsx` |
| Hooks | `use` + o que devolvem | `useApiHealth` |
| Testes web | Ao lado do ficheiro, `.test.ts(x)` | `BottomNav.test.tsx` |
| Testes PHP | `tests/Feature/<Assunto>Test.php`, métodos `test_frase_em_ingles` | `test_empty_allowlist_locks_everyone_out` |
| Comandos Artisan | `kaye:<ação>` | `kaye:check-production` |

## Receitas

### Novo endpoint da API

1. Escreve primeiro o teste em `tests/Feature`, com o caso de sucesso, de erro e de quem não tem permissão.
2. Cria o controlador com `php artisan make:controller --no-interaction`.
3. Valida o input com um Form Request (`php artisan make:request`) e devolve com um API Resource.
4. Regista a rota em `routes/api.php` (fica em `/api/v1`, com o limite de pedidos).
5. Acrescenta a linha à tabela da API em [arquitetura.md](arquitetura.md#6-api-v1).

### Novo ecrã

1. Cria `src/features/<área>/<Nome>Page.tsx` com `export default`.
2. Regista-o em `src/app/router.tsx` com `lazy`, para só descarregar quando é aberto.
3. Põe os textos em `pt.ts`. O TypeScript obriga a pô-los também em `en.ts` e `fr.ts`.
4. Escreve o teste com `renderWithApp` e, se for um fluxo novo, um teste em `e2e/`.

### Nova tabela

1. `php artisan make:migration --no-interaction`; nomes em inglês, `utf8mb4`.
2. Modelo, factory e testes.
3. Documenta-a em [base-de-dados.md](base-de-dados.md). O `DocumentationTest` falha se te esqueceres.

### Nova variável de ambiente

1. Acrescenta-a a `apps/api/.env.example`, com um comentário.
2. Documenta-a em [infraestrutura.md](infraestrutura.md#variáveis-de-ambiente). O `DocumentationTest` falha se te esqueceres.
3. Se for obrigatória em produção, acrescenta a verificação ao `kaye:check-production`.
