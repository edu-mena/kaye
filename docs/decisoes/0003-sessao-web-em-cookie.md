# 0003. Sessão da app web em cookie HttpOnly, não em localStorage

23 de outubro de 2026 · Estado: Aceite · Altera [arquitetura.md, 5.1](../arquitetura.md#51-login-com-google)

## Contexto

A arquitetura v1 previa guardar o token Kayé no `localStorage` do browser. Qualquer script que corra na página consegue ler o `localStorage`. Se um dia houver uma falha de XSS (num pacote npm, num testemunho mal tratado), o atacante leva o token e a sessão da pessoa, que pode ser um menor.

## Decisão

- **App web:** sessão do Laravel Sanctum em cookie `HttpOnly` (o JavaScript não o consegue ler), `Secure` e `SameSite=Lax`, com proteção CSRF. A app e a API estão no mesmo domínio, por isso o Sanctum suporta isto diretamente.
- **App Android:** token Sanctum, porque a app nativa não partilha os cookies do domínio. Fica no armazenamento seguro do sistema, não no `localStorage` da WebView, e é válido 30 dias.

## Consequências

- Mesmo com uma falha de XSS, a sessão web não pode ser levada para outro sítio.
- A API aceita os dois modos (cookie e token). Os testes do login cobrem os dois.
- Os pedidos que alteram dados na web precisam do token CSRF. O cliente `api()` vai tratar disso, para nenhum ecrã ter de se lembrar.
