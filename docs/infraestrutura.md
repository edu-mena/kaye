# Infraestrutura, containers e CI/CD

Como o Kayé é construído, testado e publicado. A arquitetura das peças está em [arquitetura.md](arquitetura.md); o método de trabalho, em [engenharia.md](engenharia.md).

## Ambientes

| Ambiente | Onde | Base de dados | Para quê |
|---|---|---|---|
| Local | O teu PC: PHP em `C:\php` + MariaDB do XAMPP (ou `docker compose`) | `kaye`, `kaye_test` | Desenvolver e testar |
| CI | GitHub Actions (Ubuntu) | MariaDB 11.4 em serviço ou em container | Verificar cada push e cada PR |
| Produção | `https://kayeangola.com` (o `www` redireciona para aqui), Hostinger Cloud Startup | Produção | Utilizadores e apresentações |
| Staging | Subdomínio `staging.` na Hostinger (depois do domínio) | Separada | Testar a release antes de produção |
| Produção (domínio) | Domínio principal na Hostinger + Cloudflare | Produção | Utilizadores |
| Demonstração | Vercel (`kaye-indol.vercel.app`) | Dados de demonstração dentro da app | Plano B, sem servidor |

## Containers

**Para que servem:** dar ao CI e aos testes E2E o mesmo ambiente que a produção (PHP 8.4, Apache com `.htaccess`, sem ferramentas de desenvolvimento), e deixar o Kayé pronto para um VPS.

**Onde não correm:** na produção atual. O alojamento partilhado da Hostinger não corre containers ([ADR-0004](decisoes/0004-containers-fora-de-producao.md)). Por isso a imagem copia o modelo da Hostinger, e o mesmo código corre nos dois sítios.

| Ficheiro | O que faz |
|---|---|
| `docker/Dockerfile` | Imagem em 4 etapas: compila a app React → base PHP 8.4 + Apache → dependências de produção → imagem final |
| `docker/php.ini` | Definições de produção (`expose_php=Off`, opcache, limites) |
| `docker/entrypoint.sh` | No arranque: valida a `APP_KEY`, corre as migrações (se pedido) e põe a configuração em cache |
| `compose.yaml` | Stack local e de CI: a imagem + MariaDB 11.4 |
| `.dockerignore` | Deixa de fora segredos (`.env`), `vendor`, `node_modules`, Android e docs |

**Endurecimento:**

- corre como `www-data`, na porta 8080;
- sistema de ficheiros só de leitura (só as pastas temporárias em memória são graváveis);
- sem *capabilities* do Linux e com `no-new-privileges`;
- sem `.env`, sem testes e sem o Laravel Boost;
- o Apache não mostra a versão (`ServerTokens Prod`).

```sh
docker compose up --build --wait        # abre http://localhost:8080
scripts/smoke-test.sh http://localhost:8080
docker compose logs app                 # logs JSON
docker compose down                     # parar (a base de dados fica no volume db-data)
```

## Pipeline de CI

Definida em `.github/workflows/ci.yml`. Corre em cada push para o `main` e em cada PR. Todos os jobs correm em paralelo; o `package` só corre se todos passarem.

```mermaid
flowchart LR
  P["push / PR"] --> T["pr-title<br/>Conventional Commits"]
  P --> A["api<br/>Pint · PHPStan max · PHPUnit ≥90% · composer audit"]
  P --> W["web<br/>Prettier · oxlint · tsc · Knip · Vitest ≥90% · npm audit · build"]
  P --> R["reuse<br/>jscpd ≤3%"]
  P --> C["container<br/>build · teste de fumo · Trivy imagem · E2E Playwright · OWASP ZAP"]
  P --> S["security<br/>Gitleaks · Semgrep · Trivy fs"]
  A & W & R & C & S --> K["package (só main)<br/>kaye-&lt;versão&gt;.tar.gz"]
```

- O CI só tem permissão de leitura (`permissions: contents: read`).
- **Auditorias de dependências:** `composer audit` falha com qualquer aviso de segurança; `npm audit --audit-level=moderate` falha a partir de moderado, **incluindo** as dependências de desenvolvimento (mais rigoroso do que `--omit=dev` com `high`).
- **OWASP ZAP *baseline*:** depois do E2E, o ZAP percorre o container (`http://localhost:8080`) e analisa as respostas sem atacar. As regras que fazem falhar o CI estão em `.zap/rules.tsv` (cabeçalhos de segurança, fugas de versão ou de erros); o relatório fica nos artefactos.
- O job `api` instala o cliente MariaDB, para o `BackupTest` fazer um `mysqldump` real e repor a cópia em `kaye_test_restore`.
- As actions estão fixadas pelo hash do commit; o Dependabot atualiza-as.
- Um push novo no mesmo ramo cancela a execução anterior.

## Entrega (CD)

### O pacote

O job `package` corre `scripts/package-release.sh <versão>` e guarda `kaye-<versão>.tar.gz` como artefacto durante 30 dias. O pacote leva:

- o Laravel com as dependências de produção (`--no-dev`, *classmap* otimizado);
- a app React compilada em `public/spa`;
- os ficheiros do Filament;
- um ficheiro `RELEASE` com a versão.

Não leva `.env`, testes nem ferramentas de desenvolvimento. O script falha se encontrar o Laravel Boost.

### O deploy na Hostinger

Hostinger Cloud Startup, partilhado: sem Node, sem Composer no servidor, sem processos longos. Por isso a construção acontece no GitHub e o servidor só **puxa** o resultado.

```mermaid
flowchart LR
  M["push no main"] --> W["workflow Deploy<br/>(GitHub Actions)"]
  W -->|"app web + vendor"| D["ramo deploy"]
  D -->|"webhook"| H["Git do hPanel puxa<br/>para public_html"]
  W -->|"SSH, quando o servidor puxou"| P["scripts/post-deploy.sh<br/>migrate · kaye:import · optimize<br/>check-production · smoke-test"]
```

- **O ramo `deploy`** só tem builds: a app Laravel na raiz, `vendor/` sem ferramentas de desenvolvimento, a app web compilada em `public/spa/`, `scripts/` e um ficheiro `RELEASE` com o commit. Não se edita à mão. É o `scripts/publish-deploy.sh` que o monta (reutiliza o `scripts/package-release.sh`).
- **A raiz do site** (`public_html`) é a pasta da app. Só `public/` é servido: o `.htaccess` da raiz (`apps/api/.htaccess`) reescreve tudo para lá e força HTTPS. Assim `.env`, `vendor/` e `storage/` nunca são acessíveis; o teste de fumo confirma-o.
- **O que o servidor guarda e o `git pull` não toca:** `.env`, `storage/` (logs, cache, sessões) e tudo o que não está no ramo.
- **Fila e cache** na base de dados. Uma só linha de cron no hPanel: `* * * * * cd ~/domains/<site>/public_html && php artisan schedule:run >> /dev/null 2>&1`. O agendador bate o pulso do cron todos os minutos (`CronHeartbeat`), e `GET /api/v1/health` mostra `checks.cron`: `ok`, `stale` (parou há mais de 5 minutos) ou `unknown` (nunca bateu). O teste de fumo na Hostinger exige `ok`.
- **O endereço** vem todo de `APP_URL`: o redirecionamento do Google (`APP_URL/auth/google/callback`), o domínio com sessão (Sanctum) e os links dos emails. O domínio de produção é `kayeangola.com` (24 de novembro de 2026). Trocar de endereço é mudar o `APP_URL` no `.env`, juntar o novo endereço no Google Cloud (origem e URI de redirecionamento), mudar na GitHub (ambiente `production`) o segredo `HOSTINGER_SITE_DIR` e a variável `SITE_URL` (e a variável `KAYE_API_URL`, da recolha de dados) e correr `php artisan optimize`. Os `.htaccess` mandam o `www.` para o domínio sem `www` e o `http` para `https`, para as cookies e o login Google verem um só site.
- **PWA e HTTPS** (ADR 0002): `worker-src 'self'` e `manifest-src 'self'` na CSP (`SecurityHeaders`); `Cache-Control: no-cache` no `sw.js` e no `manifest.webmanifest`, ficheiros do `/spa/assets/` imutáveis, e `Service-Worker-Allowed: /` no `sw.js` (`apps/api/public/.htaccess`). O `.htaccess` da raiz também apaga o cabeçalho `X-Powered-By` (o PHP da Hostinger ignora o `docker/php.ini`, por isso o `expose_php=Off` não chega lá). O `.htaccess` manda o http para https, menos em `localhost` (container e testes). `X-Forwarded-Proto` é aceite por trás do proxy da Hostinger e, mais tarde, do Cloudflare.

#### Pôr no ar pela primeira vez

> Primeira vez e nunca fizeste um deploy? Segue o [guia passo a passo](guia-hostinger.md), com o que clicar e como confirmar cada passo. A lista abaixo é o resumo.

1. **Chave SSH.** No teu PC: `ssh-keygen -t ed25519 -f ~/.ssh/kaye_hostinger -C "kaye-deploy"` (sem usar a senha da Hostinger). No hPanel → *Avançado → Acesso SSH*, cola o conteúdo de `kaye_hostinger.pub`. A chave **privada** (`kaye_hostinger`) nunca sai do teu PC, exceto para o segredo do GitHub abaixo. Testa: `ssh -i ~/.ssh/kaye_hostinger -p 65002 u727672645@93.127.189.106`.
2. **Base de dados.** hPanel → *Bases de dados MySQL*: cria a base e o utilizador só para o Kayé. A senha escreve-se no `.env` do servidor, nunca na conversa.
3. **O `.env` do servidor**, por SSH, na pasta do site: copia `apps/api/.env.example` e preenche como na tabela abaixo: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://kayeangola.com`, `SESSION_SECURE_COOKIE=true`, `LOG_STACK=json`, os dados da base, o email (SMTP da Hostinger), `ADMIN_EMAILS`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`, as chaves VAPID e `SENTRY_LARAVEL_DSN`. A `APP_KEY` gera-se uma vez com `php artisan key:generate`, depois de o primeiro deploy trazer o código.
4. **Google Cloud** → Credenciais → ID de cliente OAuth (aplicação web): origem `https://kayeangola.com` e URI de redirecionamento `https://kayeangola.com/auth/google/callback`.
5. **Git no hPanel** (*Avançado → Git*): repositório `git@github.com:edu-mena/kaye.git` (SSH), ramo `deploy`, pasta de destino vazia (a raiz do site). O hPanel mostra uma **chave de deploy** pública: no GitHub, *Settings → Deploy keys → Add*, só leitura. Depois copia o URL do **webhook** do hPanel e põe-no no GitHub, *Settings → Webhooks → Add* (tipo `application/json`, evento *push*).
6. **PHP 8.4.** hPanel → *Avançado → Configuração do PHP*: 8.4, com as extensões `intl`, `pdo_mysql`, `mbstring`, `zip`, `gd`, `sodium`, `openssl`. Se o `php` da linha de comandos não for 8.4 (`php -v`), usa `PHP=/opt/alt/php84/usr/bin/php scripts/post-deploy.sh`.
7. **Cron:** a linha acima, em *Avançado → Cron Jobs*.
8. **Segredos no GitHub** (*Settings → Environments → production*): os da tabela abaixo. A `HOSTINGER_SSH_KNOWN_HOSTS` obtém-se com `ssh-keyscan -p 65002 93.127.189.106`.
9. **A primeira vez:** *Actions → Deploy → Run workflow*. Sem os segredos SSH, o workflow publica o ramo e avisa; nesse caso, depois do webhook, por SSH: `cd ~/domains/<site>/public_html && php artisan key:generate --force && scripts/post-deploy.sh`.

Cada push no `main` repete: construir, publicar no `deploy`, a Hostinger puxa, e o workflow espera pelo `RELEASE` certo (até 5 minutos; cada tentativa de SSH desiste ao fim de 10 segundos), corre o `post-deploy.sh` com `PHP=/opt/alt/php84/usr/bin/php` (se acabar com 255, uma falha passageira da ligação ou do PHP, tenta mais duas vezes; com outro código, falha logo) e o teste de fumo contra `SITE_URL`. Se uma etapa falhar, o workflow fica vermelho e diz qual.

#### O que o `post-deploy.sh` faz

Primeiro espera que o `composer install` do Git da Hostinger acabe (ela corre-o sozinha ao puxar, e correr o `artisan` a meio falha com 255) e, se esse `install` tiver trazido de volta o `laravel/boost` e as outras ferramentas de desenvolvimento, volta a instalar só as de produção (`composer install --no-dev`). Depois: `migrate --force`, `kaye:import` (o catálogo que a app lê de `/api/v1`; só muda o que difere), `optimize` (config, rotas e vistas em cache), `kaye:check-production` (se falhar, pára), `queue:restart` e `scripts/smoke-test.sh` contra o `APP_URL`.

### Voltar atrás (rollback)

Corre o *Deploy* à mão (*Run workflow*) escolhendo o commit anterior do `main`: o ramo `deploy` recebe a versão antiga e a Hostinger puxa-a. As migrações são sempre compatíveis com a versão anterior ([base-de-dados.md](base-de-dados.md#migrações)), por isso não se desfazem. Se o `main` já tiver avançado, faz `git revert` do commit mau.

### O teste de fumo no endereço de produção

```sh
SMOKE_REQUIRE_CRON=1 scripts/smoke-test.sh https://kayeangola.com
```

Além do que corre no CI, em `https://` confirma que o http vai para o https, o HSTS, o `sw.js` e o manifest sem cache, o `Service-Worker-Allowed: /`, o `worker-src` na CSP e o pulso do cron.


## Variáveis de ambiente

> O `DocumentationTest` falha se uma variável do `apps/api/.env.example` não estiver nesta tabela.

| Variável | Local | Produção | Notas |
|---|---|---|---|
| `APP_NAME` | `Kayé` | `Kayé` | |
| `APP_ENV` | `local` | `production` | |
| `APP_KEY` | gerada (`php artisan key:generate`) | gerada, **secreta** | Cifra cookies e sessões. Mudá-la termina todas as sessões |
| `APP_DEBUG` | `true` | `false` | Obrigatório: `kaye:check-production` |
| `APP_URL` | `http://localhost:8000` | `https://<domínio>` | Obrigatório `https` |
| `APP_LOCALE`, `APP_FALLBACK_LOCALE` | `pt` | `pt` | |
| `APP_FAKER_LOCALE` | `pt_PT` | `pt_PT` | Só para dados de teste |
| `APP_MAINTENANCE_DRIVER` | `file` | `file` | `php artisan down` |
| `BCRYPT_ROUNDS` | `12` | `12` | Só para a senha do admin local |
| `LOG_CHANNEL` | `stack` | `stack` | |
| `LOG_STACK` | `single` | `json` | Container: `stderr_json` |
| `LOG_LEVEL` | `debug` | `info` | |
| `LOG_DAILY_DAYS` | `14` | `14` | Retenção dos logs |
| `LOG_DEPRECATIONS_CHANNEL` | `null` | `null` | |
| `DB_CONNECTION` | `mysql` | `mysql` | |
| `DB_HOST`, `DB_PORT` | `127.0.0.1`, `3306` | do hPanel | |
| `DB_DATABASE`, `DB_USERNAME` | `kaye`, `root` | do hPanel | Um utilizador só para o Kayé, só com acesso a esta base |
| `DB_PASSWORD` | vazio | **secreta** | |
| `SESSION_DRIVER` | `database` | `database` | Sem Redis no partilhado |
| `SESSION_LIFETIME` | `120` | `120` | Minutos |
| `SESSION_ENCRYPT` | `false` | `false` | |
| `SESSION_PATH`, `SESSION_DOMAIN` | `/`, `null` | `/`, `null` | |
| `SESSION_SECURE_COOKIE` | `false` | `true` | Obrigatório: `kaye:check-production` |
| `CACHE_STORE` | `database` | `database` | |
| `QUEUE_CONNECTION` | `database` | `database` | O cron processa a fila: a cada minuto, o agendador corre `queue:work --stop-when-empty --max-time=50` (`routes/console.php`). Basta a linha de cron do hPanel, `* * * * * php artisan schedule:run` |
| `FILESYSTEM_DISK` | `local` | `local` | |
| `BROADCAST_CONNECTION` | `log` | `log` | Não usado |
| `MAIL_MAILER` | `log` (os emails vão para o log) | `smtp` | O SMTP da Hostinger |
| `MAIL_SCHEME` | `null` | `smtps` | TLS desde o início, na porta 465 |
| `MAIL_HOST`, `MAIL_PORT` | `127.0.0.1`, `2525` | `smtp.hostinger.com`, `465` | |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | `null` | a caixa `ola@` do hPanel, **secreta** | |
| `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | `ola@kaye.ao`, `Kayé` | do domínio | Com SPF, DKIM e DMARC no DNS, ou os emails vão para o spam |
| `MAIL_HOURLY_LIMIT` | `80` | abaixo do limite por hora do plano | Quantos emails as campanhas e os lembretes enviam por hora (`kaye:send-messages`) |
| `PUSH_HOURLY_LIMIT` | `1000` | `1000` | O mesmo para o Web Push |
| `VAPID_SUBJECT` | `mailto:ola@kaye.ao` | igual | O contacto que os serviços de push veem |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | vazio (push desligado) | geradas uma vez, a privada **secreta** | `php artisan webpush:vapid --show` gera o par. A pública chega à app por `GET /api/v1/push/key`; vazia, a app não mostra o push. Mudá-las invalida todas as subscrições |
| `ADMIN_EMAILS` | `admin@kaye.test` | os emails da equipa | Vazio = ninguém entra no painel |
| `CORS_ALLOWED_ORIGINS` | `https://localhost,capacitor://localhost` | igual | As origens das apps nativas |
| `SANCTUM_TOKEN_EXPIRATION` | `43200` | `43200` | 30 dias |
| `SANCTUM_STATEFUL_DOMAINS` | não se define | não se define | Os domínios cujo browser usa a sessão com CSRF. Sem ela, só o de `APP_URL`; nunca `localhost` sozinho, que é a origem da app Android |
| `GOOGLE_CLIENT_ID` | o ID de cliente web de teste | o ID de cliente web | Login Google ([arquitetura.md, 5.1](arquitetura.md#51-login-com-google)). É também o `aud` aceite nos tokens do Android. Vazio = ninguém entra. O URI de redirecionamento a registar no Google Cloud é `APP_URL/auth/google/callback` |
| `GOOGLE_CLIENT_SECRET` | o segredo de teste | **secreta** | Só para a troca do código do OAuth na web |
| `WAITLIST_EXPORT_TOKEN` | vazio | **secreta**, 16 caracteres ou mais | A senha de `GET /api/v1/waitlist/export` (CSV da lista de espera e das críticas). Vazia ou curta = a exportação fica fechada (401); o painel exporta na mesma |
| `INGEST_TOKEN` | vazio | **secreta**, 16 caracteres ou mais; o mesmo valor no segredo `INGEST_TOKEN` do GitHub | A senha de `POST /api/v1/ingest/jobs`, com que as corridas do GitHub Actions enviam os factos das vagas. Vazia ou curta = fechado (401) |
| `ANTHROPIC_API_KEY` | vazio | **secreta**, a chave da API do Claude (opcional, é paga) | Com chave, a IA escreve o resumo de cada notícia recolhida; vazia (o normal), o resumo é um excerto curto cortado por regras ([ADR 0023](decisoes/0023-resumo-das-noticias-por-ia.md)) |
| `NEWS_AI_MODEL` | `claude-haiku-5-5` | o mesmo | O modelo que escreve os resumos das notícias |
| `AI_MODEL` | `claude-sonnet-5-5` | o mesmo; `claude-opus-5-5` só a pedido | O modelo de "Pesquisar com IA" ([ia.md](ia.md)). Usa a mesma `ANTHROPIC_API_KEY`; sem ela, a pesquisa no painel fica desligada (o MCP funciona na mesma) |
| `AI_EFFORT` | `medium` | `medium` | O esforço do modelo (`low` a `max`) |
| `AI_DAILY_BUDGET_USD` | `2` | o que quiseres gastar por dia | O máximo, em dólares, de todas as pesquisas de um dia (hora de Angola). Gasto: as tarefas ficam `skipped` sem chamar a API |
| `AI_TASK_MAX_TOKENS` | `300000` | `300000` | Os tokens (entrada + saída) de uma tarefa, somando todas as voltas |
| `MCP_TOKEN_DAYS` | `90` | `90` | Quanto dura um token MCP criado no painel |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | vazio | só no dia da migração, depois apagam-se | O Upstash Redis das antigas funções do Vercel, lido uma vez por `php artisan kaye:migrate-redis`. Também aceita os nomes do Vercel, `KV_REST_API_URL` e `KV_REST_API_TOKEN` |
| `SENTRY_LARAVEL_DSN` | vazio | o DSN do projeto | Obrigatório em produção |
| `SENTRY_TRACES_SAMPLE_RATE` | `0.1` | `0.1` | |
| `HEALTH_TOKEN` | vazio | **secreta**, 16 caracteres ou mais; a mesma no monitor externo | Abre todas as verificações de `GET /api/v1/health` (fila, cron, disco). Vazia ou curta: a resposta só diz se o Kayé funciona |
| `QUEUE_STUCK_MINUTES` | `15` | `15` | Um trabalho à espera há mais tempo do que isto = fila parada: `/health` dá 503 e sai um email para `ADMIN_EMAILS` |
| `DISK_MIN_FREE_PERCENT` | `10` | `10` | Abaixo disto de espaço livre, o `/health` com token dá 503 |
| `PULSE_ENABLED` | `true` | `true` | O Pulse em `/admin/pulse` (pedidos e consultas lentas), guardado nesta base de dados. Nos testes fica `false` |
| `BACKUP_DISK` | `local` | `backups` | Para onde vão as cópias diárias. `backups` = o bucket S3 abaixo, fora da Hostinger; `local` só em desenvolvimento |
| `BACKUP_ARCHIVE_PASSWORD` | vazio | **secreta**, longa; guardada também fora da Hostinger (gestor de senhas) | Cifra o zip de cada cópia (AES-256). Sem ela, uma cópia perdida não se abre: guarda-a bem |
| `BACKUP_S3_KEY`, `BACKUP_S3_SECRET` | vazio | **secretas**: uma chave só para este bucket | Acesso ao bucket das cópias (ler, escrever e apagar, nada mais) |
| `BACKUP_S3_BUCKET`, `BACKUP_S3_REGION`, `BACKUP_S3_ENDPOINT`, `BACKUP_S3_PATH_STYLE` | vazio, `auto`, vazio, `false` | os do fornecedor | AWS: a região e endpoint vazio. Cloudflare R2: região `auto` e endpoint `https://<conta>.r2.cloudflarestorage.com`. Backblaze B2: o endpoint S3 do bucket |
| `DB_DUMP_BINARY_PATH` | `C:/xampp/mysql/bin` no Windows | vazio (o `mysqldump` está no PATH) | Onde está o `mysqldump` |
| `DB_RESTORE_DATABASE` | `kaye_restore` | uma base vazia **criada no hPanel** só para isto | Onde `kaye:backup-restore-test` repõe a cópia. Tudo o que lá estiver é apagado; nunca é a base real (o comando recusa). Vazia = o teste semanal não corre |
| `DB_RESTORE_USERNAME`, `DB_RESTORE_PASSWORD` | vazio (usa `DB_USERNAME`) | o utilizador dessa base, **secreta** | |

Só nos containers: `ALLOW_EPHEMERAL_APP_KEY` (cria uma `APP_KEY` descartável; nunca em produção), `RUN_MIGRATIONS` (corre as migrações no arranque) e `RUN_IMPORT` (corre `kaye:import` a seguir, para o catálogo estar na base; o `compose.yaml` liga-o).

> O `DocumentationTest` também falha se uma variável `VITE_*` de `apps/web/src/env.d.ts` não estiver descrita aqui.

Só na app: `VITE_DATA_SOURCE`, de onde vem o conteúdo: `api` lê `/api/v1` (o Laravel); sem ela, ou com `demo`, a app usa os dados de demonstração que traz dentro ([ADR 0005](decisoes/0005-frontend-primeiro-com-dados-de-demonstracao.md)). O `apps/web/.env.production` põe `api` no build que o Laravel serve (Docker, CI, Hostinger); o site de teste no Vercel (`--mode static`) e a app Android (`--mode native`) continuam com `demo` até à mudança. Em modo `api`, se a API falhar a app mostra o erro, nunca os dados de demonstração. `VITE_API_URL`, o endereço completo da API para as apps nativas (`https://<domínio>/api/v1`). A app web usa `/api/v1` no mesmo domínio. `VITE_KAYE_EMAIL`: o email do Kayé para correções ("Ajuda-nos a completar") e para os pedidos de conversa com mentores. `VITE_KAYE_WHATSAPP`: o número de WhatsApp do Kayé, só dígitos com o indicativo (`244…`), para os pedidos de conversa com mentores ([mentores.md](mentores.md)). Sem nenhuma das duas, o botão "Pedir conversa" não aparece; as duas são públicas (vão no código da app), por isso nunca um número ou email pessoal. `VITE_PLUS_ENABLED`: `true` mostra o Kayé Plus (cadeados nas funcionalidades pagas, o cartão na home, o item do menu e a página `/plus`); por defeito é `false` e a app fica exatamente como sem o Plus. Nada é cobrado em nenhum dos casos ([ADR 0024](decisoes/0024-plano-kaye-plus.md)). Está em `apps/web/.env.example`; é pública (vai no código da app).

Só no site de teste (Vercel): `KV_REST_API_URL` e `KV_REST_API_TOKEN`, criadas ao ligar a base Upstash Redis ao projeto, para as páginas públicas ([ADR 0014](decisoes/0014-pagina-publica-do-cartao.md)). `WAITLIST_EXPORT_TOKEN`: a senha para descarregar a lista de espera e as críticas em CSV (ver o README).

## Segredos no GitHub (para o deploy)

| Segredo | Ambiente |
|---|---|
| `HOSTINGER_SSH_HOST`, `HOSTINGER_SSH_PORT`, `HOSTINGER_SSH_USER` | `staging`, `production` |
| `HOSTINGER_SITE_DIR` (a pasta do site no servidor, p. ex. `domains/<site>/public_html`) | `production` |
| Variável (não segredo) `SITE_URL`: o endereço a testar depois do deploy | `production` |
| `HOSTINGER_SSH_KEY` (chave privada só para o deploy) | `staging`, `production` |
| `HOSTINGER_SSH_KNOWN_HOSTS` (impressão digital do servidor) | `staging`, `production` |

## Cópias de segurança

- **As da Hostinger (Cloud Startup):** o plano inclui cópias diárias automáticas dos ficheiros e das bases de dados, guardadas durante alguns dias. **Confirma no hPanel** (*Websites → o site → Cópias de segurança*) que aparece a cópia de hoje: só tu vês essa página. Restaurar: nessa página, escolhe a data e *Restaurar* (ficheiros, base de dados ou ambos). Repor ficheiros pode apagar o `.env` e o `storage/`: guarda uma cópia do `.env` fora da Hostinger (num gestor de senhas) antes de restaurar, e depois corre o `scripts/post-deploy.sh`.
- **As nossas, fora da Hostinger (ADR 0026):** `spatie/laravel-backup`, pelo cron.

| Quando (hora de Angola) | Comando | O quê |
|---|---|---|
| Diário, 03:00 | `kaye:backup` | Escreve as contagens de cada tabela (`backup-manifest.json`), faz o `mysqldump` e envia um zip cifrado (AES-256, `BACKUP_ARCHIVE_PASSWORD`) para `BACKUP_DISK` |
| Diário, 03:30 | `backup:clean` | Apaga as cópias com mais de 30 dias |
| Diário, 04:00 | `backup:monitor` | Email para `ADMIN_EMAILS` se a cópia mais recente tiver mais de um dia |
| Domingo, 04:30 | `kaye:backup-restore-test` | Repõe a cópia mais recente em `DB_RESTORE_DATABASE`, compara as contagens com as do manifesto e esvazia essa base no fim. Falha (e aparece no log do cron) se faltar uma tabela ou uma linha |

Só as falhas mandam email. As tabelas que mudam a cada segundo (sessões, cache, fila, Pulse, `activity_log`, tokens) só se verifica que existem.

**Configurar (Eduardo, uma vez):**

1. Cria um bucket privado num fornecedor compatível com S3. O mais simples e gratuito até 10 GB: Cloudflare R2 (*R2 → Create bucket*, depois *Manage API tokens → Object Read & Write* só para esse bucket).
2. No `.env` da Hostinger: `BACKUP_DISK=backups`, as `BACKUP_S3_*` e uma `BACKUP_ARCHIVE_PASSWORD` longa. Guarda essa senha também no gestor de senhas: sem ela nenhuma cópia abre.
3. No hPanel, cria uma segunda base de dados vazia (p. ex. `u123_kaye_restore`) e põe o nome e o utilizador em `DB_RESTORE_*`.
4. Corre uma vez à mão: `php artisan kaye:backup` e depois `php artisan kaye:backup-restore-test`. O segundo tem de acabar em "restores".

**Repor de verdade:** descarrega o zip mais recente do bucket, abre-o com a `BACKUP_ARCHIVE_PASSWORD`, e importa `db-dumps/mysql-<base>.sql` no phpMyAdmin do hPanel (ou `mysql < ficheiro.sql`) com o site em manutenção (`php artisan down`).

## Custos

| Item | Custo |
|---|---|
| GitHub (repositório privado, Actions, Dependabot) | Grátis; o GitHub Student Developer Pack dá o GitHub Pro (ambientes com aprovação em repositórios privados) |
| Sentry, UptimeRobot, Cloudflare | Planos grátis |
| Docker Desktop | Grátis para uso pessoal e educativo |
| Hostinger, domínio, Google Play | Ver [arquitetura.md](arquitetura.md#custos-previstos) |
