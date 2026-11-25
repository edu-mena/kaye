# Engenharia: como construímos o Kayé

Este documento define o método de trabalho. Aplica-se a todo o código, seja escrito pelo Eduardo ou pelo Claude. A decisão está registada em [ADR-0001](decisoes/0001-metodologia-devops.md).

## Princípios

1. **Nada entra sem teste.** Cada comportamento novo tem um teste, e cada bug corrigido ganha um teste que o reproduz.
2. **O CI decide.** Se uma verificação falha, o código não entra no `main`. Não há exceções "só desta vez".
3. **Reutilizar antes de criar.** Antes de escrever, procura o que já existe.
4. **Segurança e privacidade desde o primeiro commit.** O público inclui menores.
5. **A documentação muda no mesmo commit que o código.** Alguns documentos são verificados por testes.

## Fluxo de trabalho

- **`main` está sempre pronto a publicar.** Ninguém faz commit direto no `main`.
- Cada trabalho vive num ramo curto (`tipo/descricao`, por exemplo `feat/login-google`) e entra por um *pull request* (PR).
- O PR só entra com o CI todo verde. Entra com *squash merge*: um PR fica um commit.
- **Proteção do `main` no GitHub** (configurar quando o repositório lá estiver):
  - PR obrigatório;
  - todos os jobs do CI obrigatórios;
  - sem *force push*;
  - histórico linear.

### Mensagens de commit

Seguem o formato [Conventional Commits](https://www.conventionalcommits.org/): `tipo(âmbito): resumo`. Por exemplo, `feat(api): add Google sign-in`. O `commitlint` verifica-as no commit e o CI verifica o título do PR.

| Tipo | Quando |
|---|---|
| `feat` | Funcionalidade nova |
| `fix` | Correção de um bug |
| `security` | Correção ou reforço de segurança |
| `test` | Só testes |
| `docs` | Só documentação |
| `refactor` | Muda a estrutura sem mudar o comportamento |
| `perf` | Desempenho |
| `build` | Dependências, Docker, build |
| `ci` | Pipelines |
| `chore` | Manutenção que não cabe acima |

Âmbitos: `api`, `web`, `android`, `admin`, `db`, `docker`, `ci`, `docs`, `deps`, `security`, `scrapers`.

## Definição de Pronto

Uma tarefa só está pronta quando cumpre **tudo**:

- [ ] Procurei código existente para reutilizar (ver [Reutilização](#reutilização)).
- [ ] Há testes para o comportamento e para os casos de erro. Se o fluxo do utilizador mudou, há também um teste E2E.
- [ ] A cobertura de testes continua em 90% ou mais na API, e na app web não desce do mínimo do `vite.config.ts` (temporariamente abaixo de 90%, [ADR 0020](decisoes/0020-cobertura-do-frontend-temporaria.md)).
- [ ] As verificações locais passam: `composer` e `npm run check` (ver [Comandos](#comandos)).
- [ ] Os textos novos existem em pt, en e fr.
- [ ] Segurança:
  - o servidor valida todo o input;
  - a autorização é verificada no servidor;
  - não há dados pessoais nos logs;
  - a CSP não foi alargada sem um ADR.
- [ ] Acessibilidade: o axe não encontra problemas sérios ou críticos.
- [ ] Os documentos afetados foram atualizados no mesmo commit:
  - [base-de-dados.md](base-de-dados.md), se houve uma migração;
  - [seguranca.md](seguranca.md), se houve um controlo novo;
  - [infraestrutura.md](infraestrutura.md), se houve uma variável de ambiente nova;
  - um ADR, se houve uma decisão.
- [ ] O CI está verde.

## Portões de qualidade

| Verificação | Ferramenta | Onde corre | Falha quando |
|---|---|---|---|
| Formatação PHP | Pint (preset Laravel + regras estritas, `pint.json`) | pre-commit, CI | O código não está formatado |
| Análise estática PHP | PHPStan + Larastan, **nível máximo** (`phpstan.neon`) | CI | Há qualquer erro de tipos |
| Testes da API | PHPUnit, em MySQL real (`kaye_test`) | CI | Um teste falha ou a cobertura fica abaixo de 90% |
| Formatação web | Prettier + ordenação das classes Tailwind | pre-commit, CI | O código não está formatado |
| Lint web | oxlint (react, a11y, import, unicorn, promise, vitest); erros de correção e suspeitos bloqueiam | pre-commit, CI | Há qualquer aviso |
| Tipos | TypeScript strict (app, configuração, E2E) | CI | Há qualquer erro |
| Código e dependências mortos | Knip | CI | Há um ficheiro, export ou dependência por usar |
| Testes web | Vitest + Testing Library | CI | Um teste falha ou a cobertura fica abaixo do mínimo: 90% depois do prompt 10, até lá o calendário do [ADR 0020](decisoes/0020-cobertura-do-frontend-temporaria.md) |
| Código duplicado | jscpd (`.jscpd.json`) | CI | Mais de 3% duplicado |
| End-to-end | Playwright: Pixel 7 em pt-AO, contra o container de produção, com axe | CI | Um fluxo falha, há um erro na consola (CSP incluída) ou há um problema de acessibilidade sério |
| Segredos | Gitleaks, em todo o histórico | CI | Encontra uma chave ou senha |
| Padrões inseguros | Semgrep (OWASP Top 10, PHP, TS, React, Dockerfile) | CI | Encontra um padrão |
| Dependências vulneráveis | `composer audit`, `npm audit`, Trivy | CI | Há uma vulnerabilidade conhecida |
| Imagem Docker | Trivy | CI | Há uma vulnerabilidade CRITICAL ou HIGH com correção disponível |
| Mensagens | commitlint, título do PR | commit-msg, CI | Fora do formato |
| Atualizações | Dependabot | GitHub, todas as semanas | Abre um PR, que passa pelo CI como qualquer outro |

## Estratégia de testes

| Nível | Ferramenta | O que testa | Onde |
|---|---|---|---|
| Unitário | Vitest + Testing Library | Lógica e componentes isolados; o `fetch` é simulado | `apps/web/src/**/*.test.tsx` |
| Feature | PHPUnit | Pedidos HTTP reais à app Laravel com MySQL real | `apps/api/tests/Feature` |
| End-to-end | Playwright | A app compilada num browser real, em modo de produção | `apps/web/e2e` |

Regras:

- **Testa o comportamento, não a implementação.** Procura elementos pelo papel e pelo texto que o utilizador vê (`getByRole`), não por classes CSS.
- **Testa os casos de falha:** base de dados em baixo, armazenamento bloqueado, origem não autorizada, input malicioso.
- **Mutação manual nos controlos de segurança:** desliga o controlo e confirma que um teste falha. Já foi feito com os cabeçalhos de segurança e o limite de pedidos: com a proteção desligada, falharam 8 testes.
- **Alguns documentos são verificados por testes:** `DocumentationTest` falha se houver uma tabela ou uma variável de ambiente sem documentação.
- Funções de ajuda para os testes: `renderWithApp` e `mockFetchJson` (`apps/web/src/test/render.tsx`), e as fixtures `consoleErrors` e `expectAccessible` (`apps/web/e2e/fixtures.ts`). Usa-as sempre.

## Reutilização

Antes de criar alguma coisa, procura se já existe:

| Preciso de… | Já existe |
|---|---|
| Chamar a API | `api()` em `apps/web/src/lib/api.ts` (idioma, erros e URL já tratados) |
| Mudar ou ler o idioma | `changeLocale`, `LOCALES` e `LOCALE_NAMES` em `apps/web/src/lib/i18n.ts` |
| Botões, cartões, etiquetas, campos, janelas, barras | `apps/web/src/components/ui/` (ver [design.md](design.md#peças-base-srccomponentsui)) |
| Um ícone | `<Icon name>` em `apps/web/src/components/icons.tsx` (acrescenta lá o desenho) |
| Ler dados (carreiras, cursos, teste, CVs modelo, novidades) | Os hooks de `apps/web/src/data/queries.ts`; `useCatalog` junta carreiras, cursos, academias e empresas |
| Ler ou mudar o que a pessoa fez | `useUser()` e `userActions` em `apps/web/src/state/userStore.ts` |
| Idioma, descarregar e apagar os dados, estado do servidor, ligações aos textos legais | `LanguagePicker`, `ExportButton`, `EraseButton`, `ServiceStatus`, `LegalLinks` em `apps/web/src/features/settings/SettingsParts.tsx` |
| Procurar texto sem acentos nem maiúsculas, ordenar por relevância e marcar as palavras | `searchWords`, `rank`, `matchRanges` em `apps/web/src/domain/search.ts` (e `normalize` em `domain/careers.ts`) |
| Um bloco compacto de um painel | `Panel` em `apps/web/src/components/ui/Panel.tsx`; o cabeçalho com `PageHeader compact` |
| Contas do mercado (rankings, equilíbrio entre vagas e diplomados por área) | `apps/web/src/domain/market.ts` |
| Recolher vagas ou números da educação | `scrapers/` (ver o [README](../scrapers/README.md)): `jobs/http.py` para pedir com educação, `jobs/facts.py` e `jobs/classify.py` para os factos, `areas.py` para as áreas comuns |
| Uma ficha etiqueta/valor, ou "Em breve" | `Rows`, `Soon` em `apps/web/src/components/ui/Rows.tsx` |
| Filtros no URL | `useUrlFilters` em `apps/web/src/lib/useUrlFilters.ts`; para um campo de texto (pesquisa), `useUrlText`, que não perde letras escritas depressa |
| Mostrar Kz, percentagens, durações, avaliações | `formatKz`, `formatPercent` (`domain/format.ts`), `useDuration`, `useRatingLabel` (`lib/useFormat.ts`) |
| A carregar ou erro | `QueryState` |
| Um ecrã que precisa de perfil | `withProfile()` em `router.tsx` |
| Montar um componente num teste | `renderWithApp`, `mockFetchJson`; dados da pessoa com `seedUser`, `seedTested` (`src/test/user.ts`) |
| A lista de idiomas no PHP | `App\Enums\Locale` |
| Papéis e permissões da equipa | `App\Enums\StaffRole` e `StaffPermission`; a policy de cada modelo em `App\Support\ModelKinds` |
| Um utilizador de teste | `User::factory()`, com os estados `admin()`, `editor()`, `reviewer()` (já com 2FA; `withoutTotp()` tira-o) e `minor()` |
| Registar na auditoria um login ou uma ação da equipa | `App\Support\AuditLog` (o conteúdo regista-se sozinho com `LogsContentChanges`) |
| Cifrar um campo pessoal e continuar a procurá-lo | O cast `encrypted` e uma coluna `*_hash` com `App\Support\BlindIndex` (ver `WaitlistEntry`) |
| Uma rota protegida por um segredo | `App\Support\AccessToken` e `throttle:secret` |
| Validar um email ou um WhatsApp no PHP (os mesmos padrões da app) | `App\Support\Contact` |
| Uma escrita sem conta: corpo JSON com limite, campo-isco, resposta `no-store` | `App\Support\Submission` |
| Um limite de pedidos por hora para uma rota sem conta | `AppServiceProvider::HOURLY_WRITES` e `throttle:<nome>` |

**Regra dos três:** a primeira vez escreve-se, a segunda copia-se com cuidado e a terceira extrai-se para uma peça partilhada. Antes disso, duplicar sai mais barato do que acertar na abstração errada. O jscpd vigia o total e o Knip apanha o que ficou por usar.

## Desempenho

O Kayé tem de ser rápido num telemóvel modesto com dados caros. Regras:

- **Código por página.** Cada rota carrega o seu código só quando é aberta (`lazy` no `router.tsx`); bibliotecas pesadas só quando são usadas (o jsPDF, só ao descarregar um CV).
- **Línguas a pedido.** O português vem com a app; o inglês e o francês descarregam-se só para quem os escolhe (`lib/i18n.ts`). A app espera pela língua da pessoa antes de se mostrar, para não piscar em português.
- **Fotos no tamanho certo.** Cada foto existe em 400, 800 e 1600 px (WebP); `PhotoImg` dá-as com `srcSet` e `sizes`, adiadas fora do ecrã. As fotos que a pessoa carrega são cortadas e reduzidas no aparelho antes de serem guardadas.
- **Medir antes de juntar dependências.** `npm run build` mostra o tamanho de cada pedaço; o pedaço principal não deve crescer sem razão.

## Comandos

| O quê | Onde | Comando |
|---|---|---|
| Todas as verificações da API | `apps/api` | `vendor/bin/pint --test && vendor/bin/phpstan analyse && php artisan test` |
| Formatar o PHP | `apps/api` | `vendor/bin/pint` |
| Todas as verificações da app | `apps/web` | `npm run check` |
| Formatar a app | `apps/web` | `npm run format` |
| Testes da app em modo contínuo | `apps/web` | `npm run test:watch` |
| End-to-end (compilar primeiro) | `apps/web` | `npm run build && npm run e2e` (o servidor local recria a `kaye_test` e corre `kaye:import`: a app lê o catálogo da API) |
| Código duplicado | raiz | `npm run duplication` |
| Stack de produção em containers | raiz | `docker compose up --build --wait` |

## Revisão de um PR

- O código faz o que o título diz, e só isso?
- Os testes falhariam se o código estivesse errado?
- O servidor valida o input e verifica quem pode fazer a ação?
- Algum dado pessoal pode ir parar a logs, ao Sentry ou a terceiros?
- Já existia uma peça que fazia isto?
- Os textos estão em pt, en e fr? A documentação acompanhou a mudança?
