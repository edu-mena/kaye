# 0017. Teste vocacional geral com valências

13 de novembro de 2026 · Estado: Aceite

## Contexto

- O catálogo já cobre as 13 áreas do Mercado (ADR 0015), mas o teste vocacional ainda era "Kayé Tech": as 42 frases RIASEC falavam de cabos, antenas, apps e programas, e só existiam em português. Quem gosta de saúde, agricultura, direito ou hotelaria respondia "nada" a quase tudo e recebia um perfil errado.
- O resultado só olhava para os interesses. Não sabia o que a pessoa já sabe fazer, o que já fez, nem se pode estudar muito tempo ou fora da sua província. A viabilidade da fórmula (arquitetura, 5.4) estava fixa em 0,5.
- Muitos jovens chegam ao CV sem saber o que lá pôr, mas já falam várias línguas, já fizeram biscatos, voluntariado na igreja ou cursos curtos.

## Decisão

- **Parte 1, "O que gostas":** as 42 frases foram reescritas para todas as áreas, curtas e do dia a dia (cuidar de plantas, reparar um gerador, vender na praça, controlar as contas de um negócio), com no máximo uma frase de tecnologia por dimensão. Os ids (`R1`…`C7`) e as dimensões ficam iguais: as respostas guardadas continuam válidas. As frases existem em pt, en e fr no ficheiro de demonstração e `getAssessment(locale)` devolve-as na língua do ecrã, como fará a API.
- **Parte 2, "O que já sabes" (as valências):** sete passos opcionais, cada um com "Saltar" e guardado à medida que se responde: línguas e nível, competências digitais, ofícios e competências técnicas das áreas da pessoa (só as que já existem no catálogo das carreiras, guardadas em `user_skills` para o encaixe), competências transversais (autoavaliação privada), o que já fez (trabalho ou biscato, voluntariado, estágio, curso), como gosta de trabalhar, e condições (até onde quer estudar, se pode estudar fora da província, se precisa de trabalhar já).
- **Recomendação:** a viabilidade passa a usar as condições (pesos em configuração em `domain/recommend.ts`): o nível de estudo pedido pelo caminho mais curto da carreira face ao que a pessoa quer estudar, se há formação na sua província (ou online) quando não pode sair, e, para quem precisa de trabalhar já, um caminho de formação curta ou médio técnico vale o máximo. O estilo de trabalho tem um peso pequeno (0,05) contra os estilos de trabalho da carreira. Sem respostas, cada parte vale 0,5 e a ordem fica igual à de antes. A lista inclui pelo menos uma carreira sem ensino superior quando existe uma que combina.
- **CV:** o preenchimento (`domain/cvFill.ts`) passa a propor línguas, experiência, projetos e certificações (incluindo os Kursos concluídos, com o número do certificado). Continua tudo proposto: nada entra sem a pessoa marcar, e o que substituiria texto dela começa desmarcado.

## Atualização de 23 de novembro de 2026: perguntas de situação e resultado explicado

- **Parte 1 com dois tipos de pergunta, 42 no total.** 30 frases (5 por dimensão, reescritas na linguagem de um jovem angolano, uma ideia por frase, nenhuma que só uma profissão responda) e 12 **situações** do dia a dia (feira da escola, banca na praça, candongueiro, igreja, falta de água no bairro, telemóvel, biscato…) com 6 cartões, um por dimensão. Cada dimensão aparece em cada posição de cartão o mesmo número de vezes (2 em 12), por rotação. Os ids `R6`, `R7`… deixaram de existir e as frases que ficaram mudaram: quem já tinha concluído o teste vê-o como incompleto e só responde às situações novas.
- **Cálculo.** Cada dimensão = 70% da média das frases + 30% das situações; cada situação dá um voto à dimensão do cartão escolhido, e metade ou mais dos votos já conta como o máximo (`SITUATION_WEIGHT` em `domain/riasec.ts`). As escolhas ficam em `userStore.choices`, junto das respostas.
- **Resultado.** Explica até 3 áreas com o que a pessoa disse («Disseste que gostas de…», «Escolheste: …»), mostra 5 carreiras e, em cada uma, o passo seguinte do caminho mais curto (estudar, formação, certificação, portefólio, estágio). As carreiras e áreas do resultado alimentam o filtro de interesses das listas (`useInterestProfile`).
- **API.** `assessment_questions` ganha `kind`, `context` e `options`; `dimension` passa a poder ser vazio (docs/base-de-dados.md).

## O que se recolhe, e o que não, incluindo de menores (14–17)

- Tudo fica no aparelho (`userStore.strengths`), como o resto antes da API, e sai com "Apagar os meus dados". Há também "Apagar as valências", junto de "Recomeçar o teste".
- Não se pergunta religião, etnia, rendimento, morada, saúde nem data de nascimento. As condições são escolhas (sim, não, nível), nunca montantes.
- Os menores respondem às mesmas perguntas, porque são as que os ajudam a escolher, mas: não veem salários no resultado (nem como razão), o CV deles não leva a localidade, e nada vai para instituições nem para um perfil público.
- As competências transversais só a pessoa as vê; entram no CV só as que ela escolhe.

## Consequências

- As frases novas precisam de validação com jovens reais (roadmap, 1.2), tal como as antigas.
- Só as carreiras com página curada têm caminhos, competências e estilos; as outras recebem viabilidade e estilo neutros até serem curadas.
- Quando houver API, `strengths` passa a ser um recurso do utilizador, com as mesmas regras de minimização.
