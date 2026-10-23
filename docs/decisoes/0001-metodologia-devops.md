# 0001. Metodologia DevOps com portões de qualidade obrigatórios

23 de outubro de 2026 · Estado: Aceite

## Contexto

O Kayé é feito por uma pessoa e pelo Claude, para um público que inclui menores. Não há testadores nem revisores. O Eduardo definiu como requisito "extremamente importante" que tudo seja testado e assegurado: CI/CD, testes, observabilidade, containers, lint, análise da reutilização, documentação e segurança de ponta a ponta.

## Decisão

- Cada mudança passa pelos portões automáticos de [engenharia.md](../engenharia.md#portões-de-qualidade), e o `main` só aceita código com todos verdes.
- A [Definição de Pronto](../engenharia.md#definição-de-pronto) é obrigatória em todas as tarefas.
- Os limites são exigentes desde o início, porque é mais fácil mantê-los do que subi-los depois:
  - PHPStan no nível máximo;
  - cobertura de 90%;
  - zero avisos de lint;
  - no máximo 3% de código duplicado.
- Alguns documentos são verificados por testes (tabelas e variáveis de ambiente).

## Consequências

- Cada funcionalidade demora um pouco mais a escrever e muito menos a corrigir. Os portões já encontraram problemas reais antes de chegarem a produção:
  - um ficheiro de compilação antigo;
  - um script injetado pelo Boost;
  - o painel em inglês sem `.env`;
  - o servidor a anunciar a versão.
- As ferramentas são todas gratuitas.
- Quando um limite incomodar sem razão, muda-se com um ADR novo. Nunca se desliga em silêncio.
