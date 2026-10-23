# 0002. CSP mais permissiva só no painel de administração

23 de outubro de 2026 · Estado: Aceite

## Contexto

A Content-Security-Policy (CSP) diz ao browser que código pode correr numa página. A app React funciona com a política mais rigorosa: só ficheiros do próprio domínio, sem código inline nem `eval`. O painel Filament usa Livewire e Alpine.js, que precisam de scripts inline e de `eval`. Com a política rigorosa, o painel não funciona.

## Decisão

- A app React e a API mantêm a política rigorosa, e o E2E falha se aparecer qualquer violação.
- O painel (`/admin`, `/livewire*`) recebe `'unsafe-inline'` e `'unsafe-eval'` nos scripts.
- O resto da política do painel continua fechada: `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'` e `form-action 'self'`.

## Consequências

- Uma falha de XSS no painel seria mais fácil de explorar do que na app. O risco é aceite porque:
  - só entram pessoas com o papel certo **e** o email na lista `ADMIN_EMAILS`;
  - o Blade escapa o output;
  - os testemunhos e as contribuições nunca são mostrados como HTML.
- A reavaliar se o Filament passar a suportar CSP com *nonces*, ou se o painel for aberto a parceiros (instituições, Fase 4).
