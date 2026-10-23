# 0005. Frontend primeiro, com dados de demonstração

23 de outubro de 2026 · Estado: Aceite

## Contexto

- A prioridade agora é o frontend: ver e testar o produto inteiro antes de existir a API.
- A API ainda só tem `GET /health`. Os dados reais (profissões, cursos, mercado) dependem da recolha e da curadoria (Fases 0.2 e 0.3), e o login com o Google depende do Client ID.
- Esperar pela API atrasaria a validação do produto. Mas um frontend com os dados espalhados pelos ecrãs daria muito trabalho a ligar depois.

## Decisão

- **Uma só porta para os dados.** Os ecrãs leem tudo através de `src/data/queries.ts` (TanStack Query), que chama `src/data/source.ts`.
  - Cada função de `source.ts` corresponde a um endpoint planeado da `/api/v1` (o comentário diz qual).
  - Hoje `DATA_SOURCE = 'demo'`: as funções devolvem os dados de `src/data/demo/`.
- **Os tipos são o contrato.** `src/data/types.ts` descreve o que a API vai devolver. Os API Resources do Laravel seguem esses tipos.
- **Os dados de demonstração são fictícios e dizem-no.**
  - As instituições chamam-se "Exemplo …".
  - Os CVs modelo são de pessoas inventadas.
  - Os números são exemplos.
  - A faixa "Demonstração" aparece em todos os ecrãs (`DemoBanner`).
- **O que a pessoa faz fica no aparelho.**
  - O perfil, as respostas do teste, as competências, as carreiras guardadas e o CV ficam em `localStorage`, na chave `kaye.user.v1`, através de `src/state/userStore.ts`.
  - Cada função de `userActions` corresponde a uma chamada futura à API.
  - Nada sai do aparelho. O botão "Continuar com o Google" cria apenas um perfil local e diz isso ao utilizador.
- **As regras de negócio são funções puras** em `src/domain/`: teste RIASEC, encaixe, recomendações, ranking de cursos e CV. Têm testes próprios, sem interface.

## Consequências

- O produto pode ser visto e testado de ponta a ponta agora. Os testes E2E cobrem os percursos principais: teste, carreira e encaixe, comparar cursos, CV a partir de um modelo e apagar os dados.
- Ligar à API muda poucos ficheiros:
  1. Em `source.ts`, cada função passa a chamar `api()` (de `src/lib/api.ts`), e `DATA_SOURCE` passa a `'api'`.
  2. Em `userStore.ts`, as ações passam a chamar a API, com o TanStack Query a guardar em cache.
  3. A faixa "Demonstração" deixa de aparecer, porque depende de `DATA_SOURCE`.
- **O servidor passa a ser a fonte da verdade** das fórmulas (recomendações e ranking, em `app/Services`). Os testes de `src/domain/` são a especificação: os mesmos casos passam para o PHPUnit, para as duas implementações darem o mesmo resultado. Depois, o código do cliente fica só onde ajuda (pré-visualizar sem rede) ou é apagado.
- **No primeiro login**, o que está no aparelho é importado para a conta, uma única vez, e depois apagado do aparelho. Isto fica por fazer, junto com o login.
- **Privacidade.** Enquanto os dados vivem no aparelho:
  - não há nada no servidor que possa ser exposto;
  - a pessoa pode descarregar e apagar tudo no Perfil.

  O risco é um aparelho partilhado. Por isso o Perfil explica onde os dados ficam e o botão de apagar está sempre à mão.
- **Risco: a demonstração afastar-se da API real.** Fica controlado porque os tipos são o contrato e o servidor tem de os seguir. Se se afastarem, gera-se os tipos a partir da especificação OpenAPI.
