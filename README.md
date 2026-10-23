# Kayé

Orientação de carreira para jovens angolanos. O MVP é o **"Kayé Tech: descobre o teu lugar na tecnologia"**.

- [Arquitetura](docs/arquitetura.md)
- [Roadmap](docs/roadmap.md)

## Estrutura

| Pasta | O que é |
|---|---|
| `apps/api` | Laravel 13: API (`/api/v1`), painel de administração (`/admin`) e a app web compilada |
| `apps/web` | React + TypeScript + Vite + Tailwind + Capacitor: a app (web e Android) |
| `scrapers` | Recolha de vagas em Python, no GitHub Actions (Fase 0.2) |
| `docs` | Arquitetura e roadmap |

## Requisitos

- PHP 8.4 ou mais recente, com as extensões `intl`, `pdo_mysql`, `mbstring`, `zip`, `gd` e `sodium`
- Composer 2
- MySQL ou MariaDB (no teu PC: o do XAMPP)
- Node 22
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

3. Instala a app:

   ```sh
   cd apps/web
   npm install
   ```

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

```sh
cd apps/api && php artisan test && vendor/bin/pint --test
cd apps/web && npm run lint && npm run typecheck
```

O GitHub Actions corre estas verificações em cada push (`.github/workflows/ci.yml`).

## Compilar

| Comando (em `apps/web`) | Resultado |
|---|---|
| `npm run build` | Compila a app web para `apps/api/public/spa`; o Laravel serve-a em http://127.0.0.1:8000 |
| `npm run build:native` | Compila para o Android e copia para `apps/web/android` |
| `npm run android` | Abre o projeto Android no Android Studio |
