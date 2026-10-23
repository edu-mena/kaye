# 0004. Containers para desenvolvimento e CI, não na produção atual

23 de outubro de 2026 · Estado: Aceite

## Contexto

A produção é um alojamento partilhado na Hostinger: PHP + Apache, sem Docker. A metodologia exige containerização. Um VPS para correr containers tem um custo mensal que o projeto ainda não justifica.

## Decisão

- O Kayé tem uma imagem Docker de produção (`docker/Dockerfile`) que copia o modelo da Hostinger: PHP 8.4, Apache com `.htaccess` e as mesmas extensões.
- A imagem é usada no CI (teste de fumo, análise com o Trivy, testes E2E) e, se quiseres, no desenvolvimento local (`docker compose`).
- Na Hostinger publica-se o pacote `kaye-<versão>.tar.gz`, construído a partir do mesmo código e das mesmas dependências.

## Consequências

- Os testes E2E correm contra um ambiente muito parecido com a produção, o que já apanhou diferenças reais (idioma e cabeçalhos).
- Há duas formas de entrega para manter: a imagem e o pacote. O risco de se afastarem é controlado porque o mesmo teste de fumo (`scripts/smoke-test.sh`) corre contra as duas.
- Quando o Kayé passar para um VPS (ver [arquitetura.md, secção 10](../arquitetura.md#10-como-crescer)), a imagem já existe e já está testada.
