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

## Segurança

Para reportar uma vulnerabilidade, vê [SECURITY.md](SECURITY.md).
