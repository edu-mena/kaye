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
| Roubo de sessão | Um script lê o token | Web: cookie `HttpOnly` e `SameSite=Lax` (o JavaScript não o lê), id de sessão novo depois do login. Android: token no armazenamento seguro, 30 dias. Ver [ADR-0003](decisoes/0003-sessao-web-em-cookie.md) | Feito | `WebLoginTest`, `AndroidLoginTest` |
| Token Google forjado ou de outra app | Um `id_token` de outra app, expirado ou assinado por outra chave | Assinatura com as chaves públicas do Google, `aud` = o nosso ID de cliente, `iss` do Google, `exp` (30 s de tolerância), email verificado; sem ID de cliente configurado ninguém entra | Feito | `AndroidLoginTest` (desligar o `aud` faz falhar dois testes) |
| Redirecionamento aberto | `/auth/google/redirect?next=//evil.example` | O `next` só aceita um caminho do próprio site; o `state` do OAuth (Socialite) liga o regresso ao browser que começou | Feito | `WebLoginTest` |
| Clickjacking | O Kayé dentro de um iframe de outro site | `X-Frame-Options: DENY` + `frame-ancestors 'none'` | Feito | `SecurityHeadersTest` |
| Pedidos de outros sites (CORS/CSRF) | Um site chama a API com a sessão do utilizador | CORS só para as apps nativas, sem credenciais; cookie `SameSite=Lax` + token CSRF (`X-XSRF-TOKEN`) em cada escrita da sessão web. Só o domínio de `APP_URL` conta como browser (nunca `localhost`, a origem da app Android) | Feito | `CorsTest`, `WebLoginTest` (419 sem o token) |
| Força bruta e abuso | Milhares de pedidos | Limite de pedidos: API 300 leituras e 60 escritas por minuto, por conta ou IP, contadas à parte (as leituras públicas vêm da cache, cada página faz várias e muitos telemóveis partilham o IP da operadora, CGNAT); login 10/min; escritas sem conta por hora e por IP: lista de espera 10, críticas 10, entrevistas 6, cartões públicos 30; contribuições 20/dia; comentários e denúncias 20 por hora por conta; rotas com segredo (exportação, ingestão, desligar um cartão) 30 por minuto por IP; contadores das perguntas dos Kursos 300 por hora por conta | API e escritas sem conta feitos; o resto com cada funcionalidade | `ApiRateLimitTest`, `WaitlistTest`, `InterviewSubmissionTest`, `PublicCardTest`, `SecretRoutesLimitTest` |
| Robôs nos formulários sem conta | Um robô enche a lista de espera | Campo-isco `website`: o pedido "funciona" e não se guarda nada; consentimento obrigatório; email e telefone validados no servidor | Feito | `WaitlistTest` (desligar o campo-isco faz falhar um teste) |
| Descarregar a lista de espera sem autorização | Adivinhar a senha da exportação | `WAITLIST_EXPORT_TOKEN` com 16 caracteres ou mais (mais curta = fechada), comparada em tempo constante (SHA-256 + `hash_equals`); no painel, só a equipa | Feito | `WaitlistExportTest` (desligar a verificação faz falhar dois testes) |
| Comentários com insultos, telefones, emails ou ligações (spam, assédio, dados de menores) | Escrever no site | Só com conta; filtro automático `CommentFilter` (recusa com 422); 3 denúncias escondem; o autor apaga; menores só com o primeiro nome; limite por conta | Feito | `CommentsTest` |
| Enviar vagas falsas à API | `POST /ingest/jobs` sem o segredo | Token `INGEST_TOKEN` em tempo constante; menos de 16 caracteres = fechado; linhas inválidas descartadas | Feito | `IngestJobsTest` |
| Mudar o cartão público de outra pessoa | `PUT /public-cards/{slug}` sem o segredo | Só o SHA-256 do segredo fica no servidor; comparado em tempo constante | Feito | `PublicCardTest` |
| Acesso indevido ao painel | Uma senha roubada; um utilizador muda o seu papel | Papel da equipa (`admin`, `editor`, `reviewer`) **e** email em `ADMIN_EMAILS` **e** 2FA (TOTP) obrigatória; lista vazia = ninguém. Os papéis só mudam pelo painel, por um admin, nunca o próprio | Feito | `AdminAccessTest` (desligar a 2FA obrigatória faz falhar um teste), `StaffPermissionsTest` |
| Fazer no painel mais do que o papel permite | Um editor descarrega a lista de espera ou envia uma campanha | Uma *policy* em cada modelo; permissões fixas por papel (`StaffRole`); CSV só com `people.export`, envio só com `messages.send` | Feito | `StaffPermissionsTest` (falha se um modelo ficar sem *policy*) |
| Ninguém saber quem mudou o quê | Um dado do catálogo alterado sem rasto | `activity_log`: cada alteração de conteúdo (antes e depois, quem), logins, falhas de login, CSV, envios, papéis | Feito | `AuditLogTest` |
| Fuga da base de dados (uma cópia perdida) | Alguém obtém um dump | Email e WhatsApp da lista de espera cifrados com a `APP_KEY`; cópias num zip cifrado (AES-256) fora da Hostinger | Feito | `WaitlistTest` (desligar a cifra faz falhar um teste), `BackupTest` |
| Perder os dados | A Hostinger apaga a conta; um erro numa migração | Cópia diária fora da Hostinger, 30 dias, com teste semanal de reposição que compara contagens | Feito (falta o bucket: ver Pendências) | `BackupTest` |
| Injeção SQL | `' OR 1=1` | Só Eloquent e *query builder*, com parâmetros; o Semgrep procura SQL cru | Feito | Semgrep no CI |
| Uma configuração insegura que os testes não veem | Um cabeçalho que falta numa resposta servida pelo Apache | Scan passivo OWASP ZAP *baseline* contra o container em cada PR; as regras de `.zap/rules.tsv` falham o CI | Feito | ZAP no CI (job `container`) |
| Fuga de ficheiros | Pedir `/.env` | Raiz do site = `public/`; caminhos com ponto dão 404; o `.env` nunca entra na imagem | Feito | `SpaTest`, `scripts/smoke-test.sh` |
| Fuga de detalhes internos | *Stack trace* num erro | `APP_DEBUG=false` obrigatório em produção; erros JSON genéricos; `expose_php=Off`; `ServerTokens Prod` | Feito | `kaye:check-production`, E2E, teste de fumo |
| Segredos no código | Uma chave num commit | `.env` fora do git; Gitleaks em todo o histórico | Feito | Gitleaks no CI |
| Dependência maliciosa ou vulnerável | Um pacote npm comprometido | Ficheiros de bloqueio; scripts de instalação bloqueados (`ignore-scripts`); auditorias; Trivy; Dependabot com espera de 7 dias; actions fixadas por hash | Feito | CI (`npm audit`, `composer audit`, Trivy) |
| Exploração do servidor | Uma falha no PHP dá acesso à máquina | Container: utilizador `www-data`, sistema de ficheiros só de leitura, sem *capabilities*, `no-new-privileges` | Feito (containers) | `compose.yaml`, teste de fumo |
| Dados de menores expostos | Perfil público de um menor de 15 anos | Menores sem perfil público, sem relatos de salário e sem marketing (`User::canHavePublicProfile`, `canReportSalaries`, `canReceiveMarketing`; sem ano de nascimento conta como menor). Passar a ser menor retira os consentimentos de marketing. Instituições nunca recebem dados individuais | Regras no modelo; o marketing já é recusado; as outras aplicam-se em cada funcionalidade | `AccountTest`, `UserDataTest` |
| Dados pessoais em terceiros | IPs ou emails no Sentry | `send_default_pii` fixo em `false`; `before_send` (`SentryScrubber`) tira utilizador, corpo, cookies, cabeçalhos secretos, query string e qualquer email, telefone, IP ou token do texto; sem *trackers* | Feito | `ErrorTrackingTest` (desligar o filtro faz falhar um teste) |
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
- **As navegações para `/api`, `/admin` e `/auth` vão sempre ao servidor** (`navigateFallbackDenylist`): sem isto, o service worker responderia a `/auth/google/redirect` com a página da app e o login nunca chegaria ao Google. O E2E do primeiro acesso falha se isso voltar a acontecer.
- **"Apagar tudo"** também apaga todas as caches do browser e, com conta, apaga primeiro a conta no servidor; se não conseguir, não apaga nada.
- **CSP:** `worker-src 'self'` e `manifest-src 'self'` ficam escritos, mas não alargam nada (o `default-src 'self'` já os cobria).
- **Atualizações:** `sw.js` e `manifest.webmanifest` vão com `Cache-Control: no-cache`; quando há versão nova, a pessoa vê "Há uma versão nova do Kayé." e escolhe quando atualizar.

## Autenticação e sessões

- **Só login social:** Google (e Apple no iOS). Não há senhas para roubar nem para reutilizar.
- **App web:** `/auth/google/redirect` e `/auth/google/callback` (Socialite) abrem uma sessão do Laravel em cookie `HttpOnly`, `Secure` e `SameSite=Lax`, com um id novo depois do login. Cada escrita leva o token CSRF, que o cliente `api()` lê do cookie `XSRF-TOKEN` e envia em `X-XSRF-TOKEN`. Só as rotas de conta (`/auth/*`, `/me*`) abrem sessão: as leituras públicas continuam sem cookies, para poderem ficar em cache.
- **App Android:** `POST /api/v1/auth/google` troca o `id_token` do Google por um token Sanctum, guardado no armazenamento seguro do sistema, válido 30 dias e apagado no logout (só o deste aparelho). Os tokens expirados são apagados todos os dias às 02:00. A app Android não conta como browser: usa o token, sem CSRF.
- **Limite:** 10 tentativas de login por minuto e por IP (`throttle:login`).
- **Contas fechadas não voltam:** uma conta apagada pelo painel (*soft delete*) não entra de novo pelo Google; uma conta local com o mesmo email verificado (o admin) fica ligada ao Google, sem duplicar.
- **Painel:** papel da equipa **e** email em `ADMIN_EMAILS` **e** o segundo fator. Entra-se com senha (só no PC local; vai passar para o login Google) e, a seguir, com o código da app de autenticação (TOTP). Na primeira entrada, o painel só mostra a página que configura o 2FA e os códigos de recuperação. O segredo TOTP fica cifrado na base e nunca sai no JSON.
- **Falhas de login registadas:** senha errada no painel, token Google inválido ou de outra app, email não verificado e conta fechada ficam em `activity_log` com o canal, o motivo, o IP truncado e, quando há, um *hash* do email (nunca o email).
- O servidor confirma a assinatura (chaves públicas do Google, guardadas 1 hora e pedidas de novo quando aparece uma chave nova), o destinatário (`aud`), o emissor (`iss`), a validade (`exp`) e o email verificado do token Google; nunca confia no que a app diz (`App\Support\GoogleIdTokenVerifier`).

## Papéis e permissões

`spatie/laravel-permission` ([ADR 0026](decisoes/0026-papeis-2fa-copias-e-saude.md)). As permissões de cada papel estão no código (`App\Enums\StaffRole`) e uma migração escreve-as na base; ninguém recebe uma permissão à mão.

| Permissão | O que deixa fazer | `admin` | `editor` | `reviewer` |
|---|---|---|---|---|
| `content.view` | Ver o catálogo no painel, rascunhos incluídos | ✓ | ✓ | ✓ |
| `content.edit` | Criar e mudar conteúdo (fica rascunho) | ✓ | ✓ | |
| `content.publish` | Publicar ou despublicar | ✓ | | ✓ |
| `content.delete` | Apagar conteúdo | ✓ | | |
| `comments.moderate` | Esconder ou apagar comentários de outros | ✓ | | ✓ |
| `messages.manage` | Escrever mensagens (email, push) como rascunho | ✓ | ✓ | |
| `messages.send` | Enviar uma mensagem | ✓ | | |
| `people.view` | Ver dados pessoais (lista de espera, críticas, entrevistas) | ✓ | | |
| `people.export` | Descarregar esses dados em CSV | ✓ | | |
| `staff.manage` | Dar e tirar papéis, fechar contas (nunca a própria) | ✓ | | |
| `audit.view` | Ler a auditoria | ✓ | | |
| `monitoring.view` | Abrir o Pulse | ✓ | | |

Cada modelo tem uma *policy*, escolhida pelo tipo de dados em `App\Support\ModelKinds`: `ContentPolicy` (catálogo), `PersonalDataPolicy` (dados de uma pessoa: só se veem, nunca se editam no painel), e `MessagePolicy`, `CommentPolicy`, `UserPolicy`. O `StaffPermissionsTest` falha se aparecer um modelo sem lista ou sem *policy*.

## Auditoria

Tudo em `activity_log` (`spatie/laravel-activitylog`), guardado um ano (`activitylog:clean`, diário).

| O quê | Como | Teste |
|---|---|---|
| Cada alteração de conteúdo e de mensagens | `LogsContentChanges` em todos os modelos de `ModelKinds::CONTENT` e em `Message`: as colunas mudadas, antes e depois, e quem | `AuditLogTest`, `StaffPermissionsTest` (falha se um modelo de conteúdo não registar, ou se um de dados pessoais registar) |
| Logins | Web (Google, sessão), Android (token) e painel (senha): quem, canal, IP truncado | `AuditLogTest` |
| Falhas de login | Canal, motivo, IP truncado e *hash* do email (HMAC com a `APP_KEY`) | `AuditLogTest` |
| Ações da equipa | CSV (painel ou token), envio de mensagens, resposta a críticas, papel dado ou tirado | `AuditLogTest` |

Os dados pessoais nunca se copiam para a auditoria: uma cópia sobreviveria ao apagamento da conta. Os logins de uma pessoa apagam-se com a conta (`Accounts::delete`).

## Cifra dos dados pessoais

| Dado | Como | Procurar | Teste |
|---|---|---|---|
| Email e WhatsApp da lista de espera | Cast `encrypted` (AES-256 com a `APP_KEY`) | `email_hash`, `whatsapp_hash`: HMAC-SHA256 do valor normalizado, com a `APP_KEY` (`App\Support\BlindIndex`). Encontra duplicados e procura no painel pelo contacto inteiro | `WaitlistTest` |
| Candidato das entrevistas | `encrypted:array` (já existia) | Não se procura | `InterviewSubmissionTest` |
| Segredo e códigos do 2FA | `encrypted` e `encrypted:array` (Filament) | Não se procura | `AdminAccessTest` |

Rodar a `APP_KEY`: pôr a antiga em `APP_PREVIOUS_KEYS` (decifra os valores) e recalcular os *hashes* da lista de espera, que são feitos com a chave atual.

## Revisão das rotas (25/11/2026)

Revistas todas as rotas de `routes/api.php` e `routes/web.php` e as ações do painel: autorização, validação, limites, *mass assignment*, IDs adivinháveis, dados pessoais nas respostas, uploads, CORS e CSP.

| Brecha encontrada | Correção | Teste que falhava antes |
|---|---|---|
| Qualquer moderador do painel descarregava a lista de espera e enviava campanhas | Permissões `people.export` e `messages.send` (só `admin`) | `StaffPermissionsTest` |
| O painel entrava só com senha | 2FA (TOTP) obrigatória | `AdminAccessTest::test_the_panel_requires_the_second_factor_before_anything_else` |
| `POST /kursos/{course}/answers` aceitava qualquer texto em `question_id`: uma conta enchia `kurso_question_stats` sem fim | Só as perguntas publicadas do exame desse Kurso (422); 300 por hora por conta | `KursosDiariosTest::test_only_the_questions_of_the_kursos_exam_are_counted` |
| As rotas com segredo (`/waitlist/export`, `/ingest/jobs`, `DELETE /public-cards`) só tinham o limite geral: 300 tentativas por minuto e por IP | `throttle:secret`, 30 por minuto | `SecretRoutesLimitTest` |
| Email e WhatsApp da lista de espera em claro na base | Cifrados, com *hash* para procurar | `WaitlistTest::test_the_contacts_are_encrypted_at_rest_and_found_by_their_hash` |
| Uma exceção com um email na mensagem (por exemplo, um `Duplicate entry`) ia assim para o Sentry | `SentryScrubber` | `ErrorTrackingTest::test_before_send_takes_out_every_personal_detail_left_in_an_event` |
| Logins falhados e ações da equipa sem rasto | `AuditLog` | `AuditLogTest` |
| O `/api/v1/health` público dizia o estado do cron | Os detalhes só com `HEALTH_TOKEN` | `MonitoringTest` |
| Os ficheiros que o Apache serve sozinho (JavaScript, estilos, imagens) não passam pelo `SecurityHeaders` e saíam sem `X-Content-Type-Options: nosniff` | `public/.htaccess` acrescenta-o (e a `Referrer-Policy`) a todas as respostas | `HostingTest::test_the_files_apache_serves_by_itself_are_never_type_sniffed`; o ZAP falha o CI se voltar (regra 10021) |

Sem brecha: os modelos só recebem campos limpos um a um (o `User` não aceita `role` nem `plus_until` em massa); os IDs públicos são aleatórios (`public_id`, cartões com 12 caracteres, segredos de 32) e os numéricos (`comments/{id}`) verificam o dono ou a permissão; as respostas não trazem contactos de outras pessoas; não há uploads de ficheiros (a foto do cartão é um JPEG em base64 até 120 kB, validado); CORS só para as apps nativas, sem credenciais; CSP sem alterações (o Pulse fica em `/admin/pulse`, na zona do painel, [ADR-0002](decisoes/0002-csp-do-painel-admin.md)).

## Dados pessoais e menores

- Recolhe-se o mínimo: o **ano** de nascimento, a **província** e o telefone opcional.
- Os consentimentos ficam registados com a versão e a data (tabela `consents`): no primeiro login, a app regista os termos, a privacidade e, nos menores, a confirmação do encarregado de educação. Retirar guarda a prova (`revoked_at`). Um menor, ou quem não tem ano de nascimento, não consegue dar um consentimento de marketing (422).
- **Menores (14–17):** sem perfil público, sem relatos de salário e com uma confirmação de que o encarregado de educação tem conhecimento.
- **Apagar a conta** (`DELETE /api/v1/me`) apaga a pessoa de vez (não é *soft delete*), com `user_data`, `consents`, as subscrições push, as entregas de mensagens, os tokens e as sessões web. **Exportar os dados** (`GET /api/v1/me/export`) devolve tudo o que temos sobre a pessoa num JSON: a conta, os dados da app, os consentimentos (com a origem e o IP truncado), as subscrições push, as mensagens recebidas e os aparelhos com sessão.
- **A foto e a capa do perfil nunca saem do aparelho:** a app não as envia e o servidor tira-as se chegarem.
- **Logs:** não registam emails, nomes nem tokens. Ficam guardados 14 dias.
- Nada sai para terceiros: as instituições e os anunciantes só veem números agregados de 5 ou mais pessoas.

## Avisos: email e Web Push

Os avisos saem por email ou por Web Push (o browser e a PWA). O WhatsApp é mandado à mão a partir do CSV da lista de espera; o push nativo do Android fica para depois (a app Android é uma WebView, onde o Web Push não funciona, e por isso nem mostra a opção).

| Controlo | Como | Teste |
|---|---|---|
| Nada sai sem consentimento | Um consentimento por canal e tipo: `email_service`, `email_marketing`, `push_service`, `push_marketing` (e `whatsapp_marketing`, para o envio à mão). Cada um guarda a versão do texto, a data, a origem (`app`, `landing`, `onboarding`) e o IP truncado (IPv4 sem o último byte, IPv6 com 48 bits). O consentimento é verificado ao montar o lote **e outra vez** no momento do envio (`App\Support\Consents::allows`) | `MessageSendingTest` |
| Um menor nunca recebe novidades | Um menor, ou quem não tem ano de nascimento, não consegue dar `*_marketing` (422), perde-o quando o ano mostra que é menor, e o envio filtra outra vez por idade ≥ 18. A lista de espera não tem idade: só recebe avisos de serviço. Os lembretes dos prazos são serviço e chegam aos menores | `NoticeConsentTest`, `MessageSendingTest` |
| Confirmação dupla do email da lista de espera | Ao inscrever-se, sai um email com um link assinado (`GET /waitlist/confirm/{token}`, válido 7 dias). Até lá o consentimento do email fica sem `confirmed_at` e nada mais chega a esse endereço | `NoticeLinksTest` |
| Deixar de receber sem conta | Todos os emails trazem um link assinado (`GET` e `POST /unsubscribe/{token}?kind=…`, sem prazo) e os cabeçalhos `List-Unsubscribe` e `List-Unsubscribe-Post` (RFC 8058: o botão do Gmail funciona com um clique). O `POST` não tem token CSRF (`bootstrap/app.php`); a assinatura é a prova. O link retira só o consentimento desse tipo de email | `NoticeLinksTest` |
| Links adulterados recusados | A assinatura (HMAC com a `APP_KEY`) cobre a pessoa (`user-7`, `waitlist-3`) e o tipo: mudar qualquer um dá 403 e não muda nada. Limite de 20 pedidos por minuto e por IP. Desligar a verificação faz falhar `test_a_changed_unsubscribe_link_withdraws_nothing` (verificado a 18/11/2026) | `NoticeLinksTest` |
| Nunca a mesma mensagem duas vezes | `message_deliveries` tem uma chave única (`message_id`, `recipient`); o trabalho da fila tenta uma só vez e não envia uma entrega que já não esteja `queued` | `MessageSendingTest` |
| Limite por hora | `MAIL_HOURLY_LIMIT` e `PUSH_HOURLY_LIMIT`: o SMTP da Hostinger recusa acima do limite do plano | `MessageSendingTest` |
| Subscrições push | Só se guardam com um consentimento push; retirar o último apaga-as. Uma subscrição morta (404/410) é apagada no envio. O endpoint tem de ser HTTPS. O service worker só abre caminhos do próprio site | `NoticeConsentTest`, `MessageSendingTest`, `pushWorker.test.ts` |
| Sem dados pessoais nos erros | Uma entrega falhada guarda só a classe da exceção, nunca a mensagem (pode trazer o endereço) | `MessageSendingTest` |

As páginas dos links são do Laravel (`resources/views/notices/page.blade.php`), com a CSP da app (o estilo vem de `public/notices.css`, nada inline) e `noindex`. O service worker não as apanha (`navigateFallbackDenylist`).

## Segredos

| Segredo | Onde vive | Nunca em |
|---|---|---|
| `APP_KEY`, senha da base de dados, DSN do Sentry, credenciais Google, senha do SMTP, `VAPID_PRIVATE_KEY` | `.env` no servidor; GitHub Secrets para o CI/CD | Código, imagem Docker, logs, conversas |
| Chave SSH do deploy | GitHub Secrets (ambiente `production`) | PCs partilhados |

- O `.dockerignore` exclui todos os `.env`, e a imagem apaga qualquer `.env` que lá chegue.
- Se um segredo vazar, **roda-o primeiro** (gera um novo e invalida o antigo) e só depois investiga.

## Cadeia de fornecimento

- `composer.lock` e `package-lock.json` vão para o git; o CI instala só o que lá está (`npm ci`).
- Os scripts de instalação npm estão bloqueados (`.npmrc`: `ignore-scripts=true`).
- Uma dependência indireta vulnerável (`uuid`, usada pela ferramenta iOS do Capacitor) foi forçada para a versão corrigida, em `overrides` no `package.json`.
- As GitHub Actions estão fixadas pelo hash do commit, não pela etiqueta.
- O Dependabot propõe atualizações uma vez por mês, um PR por ecossistema (composer, npm, actions, docker), com 7 dias de espera para versões novas. As correções de segurança não esperam pelo mês: chegam assim que o aviso é publicado.
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
| Criar o bucket das cópias, a `BACKUP_ARCHIVE_PASSWORD`, a base `DB_RESTORE_*` e o `HEALTH_TOKEN` no monitor ([infraestrutura.md](infraestrutura.md#cópias-de-segurança)) | Antes do lançamento |
| **Exame dos Kursos:** as respostas certas vão para o aparelho e a nota vem do aparelho, por isso uma conta Plus consegue um certificado sem saber. Corrigir exige corrigir no servidor sem enviar as respostas (o exame deixa de funcionar sem rede) | Antes de o certificado valer alguma coisa fora do Kayé |
| Cifrar o `user_data` (tem o CV, com telefone e email): hoje o envio por áreas filtra dentro do JSON, que deixaria de se poder ler | Quando as áreas de interesse passarem para uma tabela própria |

## Resposta a incidentes

1. **Conter:** pôr a app em manutenção (`php artisan down`), revogar os tokens e rodar os segredos afetados.
2. **Perceber:** usar os logs (pelo `request_id`) e o Sentry para saber o que aconteceu, desde quando e que dados foram afetados.
3. **Corrigir:** fazer a correção com um teste que reproduz o ataque e seguir o fluxo normal (PR e CI).
4. **Comunicar:** se houver dados pessoais afetados, avisar os utilizadores e avaliar a notificação à APD (validar com o advogado).
5. **Aprender:** escrever o que aconteceu e o que muda, sem procurar culpados.
