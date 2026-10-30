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
| `src/app` | Arranque: `App` (providers), `router` (rotas com `lazy` e `withProfile`), `Layout` |
| `src/features/<área>` | Um ecrã e o que só ele usa. Áreas: `home`, `onboarding`, `assessment`, `careers`, `training` (a secção Cursos), `cv`, `profile`, `settings` (Configurações; as suas peças também servem o Perfil), `legal` (Termos e Política de privacidade), `search` (Pesquisa), `market` (Mercado), `news` (Novidades), `notifications` (Notificações), `support` (Suporte) |
| `src/components/ui` | Peças base sem regras de negócio: `Button`, `Card`, `Chip`, `Dialog`, `Field`… Ver [design.md](design.md#peças-base-srccomponentsui) |
| `src/components` | Peças do produto usadas por mais de uma área: `CareerCard`, `AreaPicker` (uma área de cada vez, nas Carreiras e nos Cursos), `Navigation`, `QueryState`, `RequireProfile`, `icons` |
| `src/data` | De onde vêm os conteúdos: `types.ts` (o contrato com a API), `source.ts` (a única porta), `queries.ts` (hooks do TanStack Query), `demo/` (dados fictícios e o catálogo por áreas: `areaCatalog.ts`, o construtor comum; `healthCareers.ts` e `healthCatalog.ts`; `businessCareers.ts` e `businessCatalog.ts`; `humanitiesCareers.ts` e `humanitiesCatalog.ts`; `sciencesCareers.ts` e `sciencesCatalog.ts`; `educationCareers.ts` e `educationCatalog.ts`; e os de engenharia, petróleo e minas, agricultura, logística e turismo (`engineering`, `oilMining`, `agriculture`, `logistics` e `hospitality`, cada um com `Careers.ts` e `Catalog.ts`; e os guias completos de cada grupo, a gestão de projectos (`projectManagement.ts`) e a mecânica e operações offshore (`offshoreTrades.ts`); os cursos criados por decreto, com o plano de estudos (`courseDecrees.ts` e `healthCourseDecrees.ts`, ADR 0011); um ficheiro por grupo da saúde, de `medicineGuides.ts` a `mentalHealthGuides.ts`, com as peças comuns em `healthGuideParts.ts` e a carreira de diagnóstico e terapêutica em `diagnosisTherapyCareer.ts`, ADR 0010)), `market/` (os dados reais do Mercado, gerados em `scrapers/`: `jobs.json`, `education.json`, `employment.json`), `catalog/` (o que a app mostra de cada área, gerado em `scrapers/catalog/`: `health.json`, `business.json`, `humanities.json`, `sciences.json`, `education.json`, `engineering.json`, `oil_mining.json`, `agriculture.json`, `logistics.json`, `hospitality.json`). Ver [ADR 0005](decisoes/0005-frontend-primeiro-com-dados-de-demonstracao.md) |
| `src/domain` | As regras do Kayé em funções puras: teste RIASEC, encaixe, recomendações, ranking de cursos, o catálogo de cursos reais (`courses.ts`), pesquisa, mercado, CV, conquistas, o caminho e as notificações (`path.ts`), formatos |
| `src/state` | O que a pessoa fez: `userStore.ts` (perfil, respostas, competências, CV, pesquisas recentes, quando viu as notificações), `useRiasecProfile` e `useUnseenNotifications` (o ponto do sino) |
| `src/lib` | Ajudas para os ecrãs: API (`api.ts`), idiomas (`i18n.ts`), `useUrlFilters` e `useUrlText` (filtros e campos de texto no URL), `useFormat`, `useRecommendations`, `useApiHealth`, `usePersistentFlag` (preferências no aparelho), `ui.ts` (`stagger`, `safeNext`) |
| `src/locales` | Textos em `pt.ts` (a fonte), `en.ts` e `fr.ts`. Exceção: os textos longos dos Termos e da Política de privacidade ficam em `features/legal` (`terms.ts`, `privacy.ts`, com as três línguas), para viajarem com a sua página e não pesarem no arranque. Um teste confirma que as três línguas têm as mesmas secções |
| `src/test` | Preparação e ajudas dos testes (`setup.ts`, `render.tsx`, `user.ts`) |
| `e2e` | Testes end-to-end com o Playwright: `app.spec.ts` (a casca) e `journeys.spec.ts` (os percursos) |
| `android` | Projeto Android gerado pelo Capacitor; não se edita à mão |

Regra das dependências (o oxlint verifica-a com `no-restricted-imports`, e o `import/no-cycle` impede ciclos):

```
features                ->  tudo o resto
components, lib, state  ->  entre si, domain e data; nunca features
data                    ->  lib (o cliente da API, quando ligar); nunca state nem interface
domain                  ->  só data/types; nada de React, estado ou interface
```

O `domain` sem React quer dizer que as regras se testam sem ecrãs e que, quando a API existir, os mesmos casos de teste servem de especificação para o servidor.

## Nomes

| O quê | Convenção | Exemplo |
|---|---|---|
| Código, comentários, tabelas, colunas | Inglês | `occupation_program` |
| URLs da app | Português | `/carreiras`, `/formacao` |
| Textos para o utilizador | Chaves em inglês, textos em pt, en e fr | `t('nav.jobs')` |
| Classes PHP | PascalCase, uma por ficheiro | `CheckProductionConfig` |
| Casos de enum | TitleCase | `UserRole::Moderator` |
| Componentes React | PascalCase, ficheiro com o mesmo nome | `CareerCard.tsx` |
| Hooks | `use` + o que devolvem | `useApiHealth`, `useUrlFilters` |
| Testes web | Ao lado do ficheiro, `.test.ts(x)`; um ficheiro pode cobrir a área inteira | `riasec.test.ts`, `cv.test.tsx` |
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

1. Cria `src/features/<área>/<Nome>Page.tsx` com `export default`. Usa as peças de `components/ui` e os padrões de [design.md](design.md#padrões) antes de criar novas.
2. Regista-o em `src/app/router.tsx` com `page()` (carrega só quando é aberto) ou `withProfile()` (se precisar de perfil).
3. Dados novos: o tipo em `data/types.ts`, a função em `data/source.ts` (com o endpoint no comentário) e o hook em `data/queries.ts`. As regras vão para `domain/`, com testes.
4. Põe os textos em `pt.ts`. O TypeScript obriga a pô-los também em `en.ts` e `fr.ts`.
5. Escreve o teste com `renderWithApp` (e `seedUser` para começar com dados) e, se for um percurso novo, um teste em `e2e/journeys.spec.ts`.

### Nova tabela

1. `php artisan make:migration --no-interaction`; nomes em inglês, `utf8mb4`.
2. Modelo, factory e testes.
3. Documenta-a em [base-de-dados.md](base-de-dados.md). O `DocumentationTest` falha se te esqueceres.

### Nova variável de ambiente

1. Acrescenta-a a `apps/api/.env.example`, com um comentário.
2. Documenta-a em [infraestrutura.md](infraestrutura.md#variáveis-de-ambiente). O `DocumentationTest` falha se te esqueceres.
3. Se for obrigatória em produção, acrescenta a verificação ao `kaye:check-production`.
