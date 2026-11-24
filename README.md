# Kayé

Orientação de carreira para jovens angolanos. O MVP é o **"Kayé Tech: descobre o teu lugar na tecnologia"**.

Toda a documentação está em [docs/](docs/README.md). Para começar: [arquitetura](docs/arquitetura.md), [roadmap](docs/roadmap.md) e [como trabalhamos](docs/engenharia.md).

## Estrutura

| Pasta | O que é |
|---|---|
| `apps/api` | Laravel 13: API (`/api/v1`), painel de administração (`/admin`) e a app web compilada |
| `apps/web` | React + TypeScript + Vite + Tailwind + Capacitor: a app (web e Android) |
| `docker` | Imagem de produção (PHP 8.4 + Apache) |
| `scripts` | Pacote de release e teste de fumo |
| `scrapers` | Recolha de vagas em Python, no GitHub Actions (Fase 0.2) |
| `docs` | Documentação e decisões (ADR) |

O detalhe está em [organizacao-do-codigo.md](docs/organizacao-do-codigo.md).

## Requisitos

- PHP 8.4 ou mais recente, com as extensões `intl`, `pdo_mysql`, `mbstring`, `zip`, `gd` e `sodium`
- Composer 2
- MySQL ou MariaDB (no teu PC: o do XAMPP)
- Node 22
- Docker Desktop, para a stack em containers
- Android Studio, só para compilar a app Android

## Primeira vez

1. Liga o MySQL no painel do XAMPP e cria as bases de dados:

   ```sql
   CREATE DATABASE kaye CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE kaye_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Instala a API:

   ```sh
   cd apps/api
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   ```

   No `.env` local, põe `ADMIN_EMAILS=admin@kaye.test`.

3. Instala a app e as ferramentas da raiz (os scripts de instalação npm estão bloqueados por segurança):

   ```sh
   cd apps/web && npm ci
   cd ../.. && npm ci && npm run hooks:install
   ```

   O último comando instala os hooks do git, que formatam e verificam o código antes de cada commit.

## No dia a dia

Abre dois terminais:

```sh
# Terminal 1: API em http://127.0.0.1:8000
cd apps/api
php artisan serve

# Terminal 2: app em http://localhost:5173 (atualiza sozinha ao gravar)
cd apps/web
npm run dev
```

O painel de administração fica em http://127.0.0.1:8000/admin. Localmente, entra com `admin@kaye.test` e a senha `password`.

## Verificações

Antes de abrir um PR, corre o mesmo que o CI:

```sh
cd apps/api && vendor/bin/pint --test && vendor/bin/phpstan analyse && php artisan test
cd apps/web && npm run check && npm run build && npm run e2e
cd ../.. && npm run duplication
```

A lista completa e o que cada verificação faz estão em [engenharia.md](docs/engenharia.md#portões-de-qualidade).

## Containers

A stack de produção no teu PC (a imagem do Kayé + MariaDB):

```sh
docker compose up --build --wait        # http://localhost:8080
scripts/smoke-test.sh http://localhost:8080
docker compose down
```

O detalhe está em [infraestrutura.md](docs/infraestrutura.md).

## Deploy (Hostinger)

Cada push no `main` corre o workflow `Deploy` (`.github/workflows/deploy.yml`): constrói a app web e o `vendor` do Laravel (`scripts/package-release.sh`), publica o resultado no ramo `deploy` (`scripts/publish-deploy.sh`) e a Hostinger puxa-o pelo webhook do Git do hPanel. Depois, por SSH, o `scripts/post-deploy.sh` corre as migrações, o `kaye:import`, o `optimize` e o teste de fumo. Sem domínio, o endereço é o temporário e sai todo de `APP_URL`. A primeira vez (chave SSH, base de dados, `.env`, Google, Git, cron, segredos) está em [infraestrutura.md](docs/infraestrutura.md#pôr-no-ar-pela-primeira-vez).

```bash
SMOKE_REQUIRE_CRON=1 scripts/smoke-test.sh https://kayeangola.com   # confirma o site no ar
```

## Compilar

| Comando (em `apps/web`) | Resultado |
|---|---|
| `npm run build` | Compila a app web para `apps/api/public/spa`; o Laravel serve-a em http://127.0.0.1:8000 |
| `npm run build:native` | Compila para o Android e copia para `apps/web/android` |
| `npm run build:static` | Compila um site estático em `apps/web/dist`, só com os dados de demonstração, para testes no Vercel (`apps/web/vercel.json`: o projecto `kaye` do Vercel usa `apps/web` como pasta raiz; o `.vercelignore` da raiz só envia `apps/web`). Publicado em https://kaye-indol.vercel.app; `vercel deploy --prod` na raiz volta a publicar |
| `npm run android` | Abre o projeto Android no Android Studio |

## Lista de espera e críticas (pré-lançamento)

No site de teste (Vercel), a landing guarda a lista de espera e as críticas no Redis (listas `waitlist` e `feedback`, `apps/web/api/_waitlist.ts`). Para as descarregar em CSV:

| Variável | Onde | Para quê |
|---|---|---|
| `WAITLIST_EXPORT_TOKEN` | Vercel, projeto `kaye`, Production | Senha da exportação (16 caracteres ou mais); sem ela a exportação responde 401 |

- Lista de espera: `https://kaye-indol.vercel.app/api/v1/waitlist/export?kind=waitlist&token=<token>`
- Críticas: `https://kaye-indol.vercel.app/api/v1/waitlist/export?kind=feedback&token=<token>`

O token também pode ir no header `X-Export-Token` ou `Authorization: Bearer <token>` (não fica no histórico do navegador).

No Laravel, as mesmas rotas guardam em MySQL (`waitlist`, `feedback`, `interviews`, `public_cards`). O CSV descarrega-se no painel (Lista de espera e Críticas e ideias, botão "Descarregar CSV") ou em `/api/v1/waitlist/export` com `WAITLIST_EXPORT_TOKEN` no `.env`.

**Passar os dados do Redis para o MySQL (uma vez, antes de mudar o site):** põe no `apps/api/.env` o `UPSTASH_REDIS_REST_URL` e o `UPSTASH_REDIS_REST_TOKEN` (no Vercel: Storage → a base Upstash → REST API) e corre em `apps/api`:

```bash
php artisan kaye:migrate-redis --dry-run   # só conta, não grava
php artisan kaye:migrate-redis             # grava
```

No Windows, se aparecer `cURL error 60` (o PHP não tem a lista de certificados), descarrega https://curl.se/ca/cacert.pem para `C:\php\extras\ssl\cacert.pem` e põe no `php.ini` `curl.cainfo` e `openssl.cafile` com esse caminho (com barras `/`). Nunca desligues a verificação. Antes, `php artisan migrate` cria as tabelas na base local.

A tabela mostra, para cada tabela, quantas linhas há no Redis, no MySQL antes e depois, as criadas e as que já lá estavam. Pode correr-se de novo sem duplicar. O Redis só é lido, nunca alterado. Se uma linha não se conseguir ler, o comando diz qual e termina com erro; as outras ficam gravadas.

### Avisos: email e Web Push

Os emails e as notificações saem pela fila; em produção o cron corre `php artisan schedule:run` a cada minuto, e o agendador processa a fila, envia os lotes das campanhas (`kaye:send-messages`) e, às 08:00, os lembretes dos prazos guardados (`kaye:deadline-reminders`). Localmente, `MAIL_MAILER=log` escreve os emails em `storage/logs`.

```bash
php artisan webpush:vapid --show   # gera o par VAPID; cola-o no .env (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
php artisan queue:work --stop-when-empty
php artisan kaye:send-messages
```

No Windows, o PHP só cria chaves EC (precisas para o Web Push e para os seus testes) com a variável `OPENSSL_CONF` a apontar para o `openssl.cnf` do PHP. Uma vez, no PowerShell: `[Environment]::SetEnvironmentVariable('OPENSSL_CONF', 'C:\php\extras\ssl\openssl.cnf', 'User')`, e abre um terminal novo. No Linux (CI, Hostinger) não é preciso.

## Segurança

Para reportar uma vulnerabilidade, vê [SECURITY.md](SECURITY.md).
