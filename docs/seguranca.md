# Segurança

O Kayé guarda dados de jovens a partir dos 14 anos. A segurança é tratada como funcionalidade: cada controlo tem um teste que falha se o controlo deixar de funcionar.

## Princípios

1. **Defesa em profundidade.** Nunca há só uma barreira. O painel, por exemplo, exige um papel **e** um email autorizado.
2. **Mínimo privilégio.** Cada parte só tem o acesso de que precisa: o container corre sem ser root e o CI só tem permissão de leitura.
3. **Privacidade por omissão.** Recolhe-se o mínimo, nada sai para terceiros e o Sentry nunca recebe dados pessoais.
4. **Falhar fechado.** Na dúvida, recusa. Uma lista de admins vazia significa ninguém; sem `APP_KEY`, o container não arranca.
5. **Nada de segurança por obscuridade.** O código pode ser lido por qualquer pessoa sem perigo; os segredos vivem fora do código.

## Modelo de ameaças

| Ameaça | Exemplo | Controlo | Estado | Prova |
|---|---|---|---|---|
| Injeção de script (XSS) | Testemunho com `<script>` | React e Blade escapam o output; CSP rigorosa sem `unsafe-inline` na app | Feito | `SecurityHeadersTest`, `e2e/security.spec.ts` (o script injetado é bloqueado) |
| Roubo de sessão | Um script lê o token | Web: cookie `HttpOnly` (o JavaScript não o lê). Android: token no armazenamento seguro. Ver [ADR-0003](decisoes/0003-sessao-web-em-cookie.md) | Desenho feito; implementação com o login | Teste do login (Fase 0.1) |
| Clickjacking | O Kayé dentro de um iframe de outro site | `X-Frame-Options: DENY` + `frame-ancestors 'none'` | Feito | `SecurityHeadersTest` |
| Pedidos de outros sites (CORS/CSRF) | Um site chama a API com a sessão do utilizador | CORS só para as apps nativas, sem credenciais; cookie `SameSite=Lax` + token CSRF | CORS feito; CSRF com o login | `CorsTest` |
| Força bruta e abuso | Milhares de pedidos | Limite de pedidos: API 300 leituras e 60 escritas por minuto, por conta ou IP, contadas à parte (as leituras públicas vêm da cache, cada página faz várias e muitos telemóveis partilham o IP da operadora, CGNAT); login 10/min; contribuições 20/dia | API feito; o resto com cada funcionalidade | `ApiRateLimitTest` |
| Acesso indevido ao painel | Um utilizador muda o seu papel | Papel `admin`/`moderator` **e** email em `ADMIN_EMAILS`; lista vazia = ninguém | Feito | `AdminAccessTest` |
| Injeção SQL | `' OR 1=1` | Só Eloquent e *query builder*, com parâmetros; o Semgrep procura SQL cru | Feito | Semgrep no CI |
| Fuga de ficheiros | Pedir `/.env` | Raiz do site = `public/`; caminhos com ponto dão 404; o `.env` nunca entra na imagem | Feito | `SpaTest`, `scripts/smoke-test.sh` |
| Fuga de detalhes internos | *Stack trace* num erro | `APP_DEBUG=false` obrigatório em produção; erros JSON genéricos; `expose_php=Off`; `ServerTokens Prod` | Feito | `kaye:check-production`, E2E, teste de fumo |
| Segredos no código | Uma chave num commit | `.env` fora do git; Gitleaks em todo o histórico | Feito | Gitleaks no CI |
| Dependência maliciosa ou vulnerável | Um pacote npm comprometido | Ficheiros de bloqueio; scripts de instalação bloqueados (`ignore-scripts`); auditorias; Trivy; Dependabot com espera de 7 dias; actions fixadas por hash | Feito | CI (`npm audit`, `composer audit`, Trivy) |
| Exploração do servidor | Uma falha no PHP dá acesso à máquina | Container: utilizador `www-data`, sistema de ficheiros só de leitura, sem *capabilities*, `no-new-privileges` | Feito (containers) | `compose.yaml`, teste de fumo |
| Dados de menores expostos | Perfil público de um menor de 15 anos | Menores sem perfil público e sem relatos de salário; instituições nunca recebem dados individuais | Regras escritas; aplicadas em cada funcionalidade | Testes de cada funcionalidade |
| Dados pessoais em terceiros | IPs ou emails no Sentry | `send_default_pii` fixo em `false`; sem *trackers* | Feito | `ErrorTrackingTest` |
| Ferramentas de desenvolvimento em produção | O Boost injeta um script e abre um endpoint | `composer install --no-dev`; o pacote de release falha se o Boost lá estiver; `kaye:check-production` | Feito | `CheckProductionConfigTest`, `package-release.sh` |

## Cabeçalhos HTTP

São aplicados a todas as respostas por `App\Http\Middleware\SecurityHeaders`.

| Cabeçalho | Valor |
|---|---|
| `Content-Security-Policy` | Depende da zona (ver abaixo) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Câmara, microfone, localização, pagamento e USB desligados |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` (permite a janela do login Google) |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`, só em HTTPS |
| `X-Request-Id` | Identificador do pedido (ver [observabilidade.md](observabilidade.md)) |

### Content-Security-Policy por zona

| Zona | Política | Notas |
|---|---|---|
| App React (`/`, `/carreiras`…) | Só ficheiros do próprio domínio; **sem código inline nem `eval`** | O E2E falha se a página tiver qualquer violação. O login Google vai acrescentar `accounts.google.com`, e só isso |
| Painel (`/admin`) | Como a app, mas com `unsafe-inline` e `unsafe-eval` nos scripts | O Livewire e o Alpine precisam deles. Aceite porque só pessoal autorizado lá entra. Ver [ADR-0002](decisoes/0002-csp-do-painel-admin.md) |
| API (`/api/*`) | `default-src 'none'` | Só devolve JSON; não carrega nada |

### App instalável (PWA) e cache offline

A app web regista um service worker (`vite-plugin-pwa`, Workbox) para se instalar no ecrã principal e abrir sem rede. Nunca dentro da app Android (Capacitor).

- **O que fica guardado no telemóvel:** o código, os estilos, as fontes e os ícones (precache, ~3,4 MB) e as últimas 150 fotos vistas (30 dias; as mais antigas saem primeiro, e tudo sai se faltar espaço).
- **O que nunca fica:** dados pessoais. O perfil e o CV vivem no `localStorage` e não passam pelo service worker; tudo em `/api` é `NetworkOnly`. Quando os endpoints públicos do catálogo existirem, só esses passam a `StaleWhileRevalidate`.
- **"Apagar tudo"** também apaga todas as caches do browser.
- **CSP:** `worker-src 'self'` e `manifest-src 'self'` ficam escritos, mas não alargam nada (o `default-src 'self'` já os cobria).
- **Atualizações:** `sw.js` e `manifest.webmanifest` vão com `Cache-Control: no-cache`; quando há versão nova, a pessoa vê "Há uma versão nova do Kayé." e escolhe quando atualizar.

## Autenticação e sessões

- **Só login social:** Google (e Apple no iOS). Não há senhas para roubar nem para reutilizar.
- **App web:** sessão do Sanctum em cookie `HttpOnly`, `Secure` e `SameSite=Lax`, com proteção CSRF.
- **App Android:** token Sanctum guardado no armazenamento seguro do sistema, válido 30 dias e revogado no logout. Os tokens expirados são apagados todos os dias às 02:00.
- **Painel:** papel `admin` ou `moderator` **e** email em `ADMIN_EMAILS`. Hoje entra-se com senha (só no PC local); vai passar para o login Google.
- O servidor confirma a assinatura, o destinatário e a validade do token Google; nunca confia no que a app diz.

## Dados pessoais e menores

- Recolhe-se o mínimo: o **ano** de nascimento, a **província** e o telefone opcional.
- Os consentimentos ficam registados com a versão e a data (tabela `consents`, com o login).
- **Menores (14–17):** sem perfil público, sem relatos de salário e com uma confirmação de que o encarregado de educação tem conhecimento.
- **Apagar a conta** remove os dados pessoais e revoga os tokens. **Exportar os dados** devolve tudo o que temos sobre a pessoa.
- **Logs:** não registam emails, nomes nem tokens. Ficam guardados 14 dias.
- Nada sai para terceiros: as instituições e os anunciantes só veem números agregados de 5 ou mais pessoas.

## Segredos

| Segredo | Onde vive | Nunca em |
|---|---|---|
| `APP_KEY`, senha da base de dados, DSN do Sentry, credenciais Google | `.env` no servidor; GitHub Secrets para o CI/CD | Código, imagem Docker, logs, conversas |
| Chave SSH do deploy | GitHub Secrets (ambiente `production`) | PCs partilhados |

- O `.dockerignore` exclui todos os `.env`, e a imagem apaga qualquer `.env` que lá chegue.
- Se um segredo vazar, **roda-o primeiro** (gera um novo e invalida o antigo) e só depois investiga.

## Cadeia de fornecimento

- `composer.lock` e `package-lock.json` vão para o git; o CI instala só o que lá está (`npm ci`).
- Os scripts de instalação npm estão bloqueados (`.npmrc`: `ignore-scripts=true`).
- Uma dependência indireta vulnerável (`uuid`, usada pela ferramenta iOS do Capacitor) foi forçada para a versão corrigida, em `overrides` no `package.json`.
- As GitHub Actions estão fixadas pelo hash do commit, não pela etiqueta.
- O Dependabot propõe atualizações todas as semanas, com 7 dias de espera para versões novas. As correções de segurança passam à frente.
- **Duas regras do Semgrep estão excluídas, com motivo:**
  - *idade mínima de publicação no npm*: o npm 11.12 não a suporta; o `npm ci` e a espera do Dependabot cobrem o risco;
  - *atividade Android exportada*: a atividade principal tem de estar exportada para o ícone abrir a app.

## Verificação de produção

`php artisan kaye:check-production` corre em cada deploy e **pára-o** se alguma destas condições falhar:

- `APP_ENV=production` e `APP_DEBUG=false`;
- `APP_KEY` definida;
- `APP_URL` em `https://`;
- cookie de sessão `Secure` e `HttpOnly`;
- `ADMIN_EMAILS` com pelo menos um email;
- tokens da API com prazo de validade;
- logs em JSON e acima do nível `debug`;
- Sentry ligado;
- ferramentas de desenvolvimento desligadas.

## Pendências

| O quê | Quando |
|---|---|
| Ativar a autenticação de dois fatores (2FA) no GitHub, Google, Hostinger e Cloudflare | **Já**: quem entra nestas contas controla o Kayé |
| Proteção do ramo `main` no GitHub | Quando o repositório estiver no GitHub |
| Configurar os *proxies* de confiança (Cloudflare), para o limite de pedidos ver o IP real | Na configuração da Hostinger |
| Sentry: criar a conta e pôr o DSN no `.env` de produção | Antes do lançamento |
| As três questões legais de [arquitetura.md, secção 8](arquitetura.md#8-segurança-e-privacidade) | Antes do lançamento público |
| Teste de intrusão externo (mesmo informal) | Antes do lançamento público |

## Resposta a incidentes

1. **Conter:** pôr a app em manutenção (`php artisan down`), revogar os tokens e rodar os segredos afetados.
2. **Perceber:** usar os logs (pelo `request_id`) e o Sentry para saber o que aconteceu, desde quando e que dados foram afetados.
3. **Corrigir:** fazer a correção com um teste que reproduz o ataque e seguir o fluxo normal (PR e CI).
4. **Comunicar:** se houver dados pessoais afetados, avisar os utilizadores e avaliar a notificação à APD (validar com o advogado).
5. **Aprender:** escrever o que aconteceu e o que muda, sem procurar culpados.
