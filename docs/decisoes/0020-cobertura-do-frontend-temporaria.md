# 0020. Cobertura do frontend abaixo de 90%, temporariamente, com calendário para voltar

16 de novembro de 2026 · Estado: Aceite

## Contexto

- O gate de cobertura da app web é 90% (linhas, instruções e funções) e 85% (ramos), como na API ([ADR 0001](0001-metodologia-devops.md), [engenharia.md](../engenharia.md)).
- Desde 30 de outubro, para andar depressa no conteúdo, as mudanças no frontend deixaram de levar testes. Nesse tempo entraram funcionalidades inteiras sem testes: oportunidades (bolsas e estágios), exames de acesso, entrevistas, prazos, a página dos testes, psicotécnicos, Kursos, sem universidade, landing, mentores e o plano.
- Os testes que já existiam ficaram desatualizados (75 a falhar no CI) e foram corrigidos no PR do fecho do backend. Com todos a passar, a cobertura medida é de **61% das linhas, 60% das instruções, 59% das funções e 50% dos ramos**. Voltar já aos 90% obriga a testar cerca de 15 funcionalidades antes de qualquer outra entrega.
- O CI tem de voltar a estar verde para o trabalho do backend avançar ([ADR 0019](0019-backend-e-migracao-dos-dados.md)), e um gate que falha sempre deixa de proteger o que quer que seja.

## Decisão

- **Mínimo temporário no `vite.config.ts`:** 60% das linhas, 59% das instruções, 58% das funções e 49% dos ramos, logo abaixo do valor de hoje. A cobertura não pode descer.
- **O mínimo sobe por etapas, ligadas aos prompts do fecho do backend** ([roadmap](../roadmap.md#fecho-do-backend-15-de-novembro-de-2026)):

  | Quando | Linhas, instruções e funções | Ramos |
  |---|---|---|
  | Agora | 60 / 59 / 58 | 49 |
  | Fim do prompt 3 (a app lê do Laravel) | 70 | 60 |
  | Fim do prompt 6 (comunicação) | 80 | 72 |
  | Fim do prompt 10, **antes de a produção abrir** | 90 | 85 |

  **18 de novembro de 2026: etapa do prompt 3 cumprida.** Testes novos para o plano, exames de acesso, psicotécnicos, entrevistas, valências, mentores, sem universidade, família, Kursos e os modelos de CV e de cartão levaram a cobertura a 84% das linhas, 82% das instruções, 80% das funções e 71% dos ramos. O mínimo no `vite.config.ts` passou a 83 / 82 / 79 / 70, logo abaixo disso, e só pode subir.

  Subir o valor no `vite.config.ts` faz parte de cada um desses prompts. Se uma etapa não for cumprida, a seguinte não começa sem nova decisão escrita aqui.
- **A regra "sem testes no frontend" acaba.** Código novo ou alterado na app web leva testes, como na API. Só as mudanças de conteúdo (os ficheiros de `src/data`, textos e imagens) dispensam testes novos; os testes que já existem continuam a ter de passar.
- A API não muda: continua nos 90%.

## Consequências

- O CI volta a estar verde sem esconder o problema: o número real fica escrito no `vite.config.ts` e aqui, e só pode subir.
- Até ao fim do prompt 10, uma parte da app pode partir sem que um teste unitário o diga. Os testes de ponta a ponta (Playwright, contra o Docker igual à Hostinger) cobrem os percursos principais nesse intervalo.
- Os prompts 3, 6 e 10 ficam mais longos: cada um inclui os testes que faltam para a etapa seguinte, começando pelas funcionalidades com menos cobertura.
- Quando o mínimo voltar a 90/85, este ADR passa a "Substituída" por uma nota no mesmo ficheiro, e o gate fica como o [ADR 0001](0001-metodologia-devops.md) o definiu.
