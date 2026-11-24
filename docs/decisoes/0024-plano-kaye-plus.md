# 0024. Kayé Plus: 1.999 Kz por mês, atrás de uma flag, sem cobrar nada ainda

24 de novembro de 2026 · Estado: Aceite

## Contexto

- O [ADR 0015](0015-catalogo-largo.md) diz que o Kayé é grátis no MVP. Este ADR acrescenta o Plus e **não revoga** o resto: fica a vigorar só para as funcionalidades listadas abaixo.
- Algumas funcionalidades custam tempo à equipa (entrevistas com feedback) ou são o que as pessoas mais repetem (treino, simulações, PDF do CV). Descobrir carreiras, cursos, institutos e empresas é o que traz as pessoas, e tem de continuar grátis.
- O meio de pagamento em Angola ainda não está escolhido (Multicaixa Express, Unitel Money…). Esta entrega faz a interface e a regra, não cobra.

## Decisão

- **Grátis, sempre:** descobrir (carreiras, áreas, cursos, institutos, empresas, mercado, notícias, prazos, bolsas e estágios), o feed da home, a sequência, o desafio do dia e o primeiro teste vocacional.
- **Kayé Plus, 1.999 Kz por mês** (`PLUS_PRICE_KZ` em `apps/web/src/lib/plan.ts`): CV em PDF, testes psicotécnicos e treino dos exames de acesso sem limite, simulações e entrevistas com feedback.
- **Uma utilização grátis de cada** ("experimenta 1 vez"), guardada no estado da pessoa (`plusTrials`). A experiência gasta-se quando a pessoa conclui a ação (descarregar o PDF, terminar uma sessão de treino, enviar a entrevista, começar uma simulação). A sessão em curso nunca é cortada: o bloqueio só aparece da vez seguinte.
- **Flag `VITE_PLUS_ENABLED`**, desligada por defeito. Desligada, a app fica exatamente como era: sem cadeados, sem cartão, sem item de menu, e `/plus` leva à home.
- **Ninguém é Plus nesta fase** (`isPlus` é sempre falso): não há pagamento. A página `/plus` tem os benefícios, o preço, perguntas frequentes e "Avisa-me quando abrir", que reaproveita a lista de espera (`source: plus`, com um consentimento próprio para este fim).

## Regras

- **Nada pago influencia recomendações nem a ordem do feed.** O cartão do Plus tem um lugar fixo no feed, nunca um lugar ganho por relevância ou por dinheiro.
- Descoberta, feed, sequência, desafio e o primeiro teste ficam sempre grátis; o Plus nunca tira o que já era livre.
- **Menores (14–17):** a promoção do Plus não aparece a menores de 18 anos (nem o cartão, nem o item de menu, nem os distintivos, nem `/plus`). Para eles as funcionalidades continuam abertas enquanto não houver fluxo com o encarregado de educação: sem pressão comercial. Quem não tem perfil, e por isso não tem idade conhecida, conta como menor. A decisão final (Plus para menores com o encarregado, ou nunca) fica em aberto.
- Sem urgência falsa nem mensagens de culpa nos bloqueios.

## Em aberto

- O meio de pagamento (Multicaixa Express, Unitel Money…) e a faturação.
- O fluxo com o encarregado para menores.

## Consequências

- A landing e o selo `home.freeBadge` ("Grátis · imparcial") dizem hoje que tudo é grátis. Quando a flag for ligada, passam a dizer que **explorar** é grátis.
- Os **Termos** e a política de privacidade precisam de revisão antes de ligar a flag (preço, renovação, reembolso, a lista de espera do Plus).
- A cobertura de testes do frontend continua a regra do [ADR 0020](0020-cobertura-do-frontend-temporaria.md): o `PlusGate` com a flag ligada e desligada tem testes próprios.
- Quando houver pagamento, `isPlus` passa a vir da conta (servidor); até lá o estado das experiências grátis vive no aparelho e sincroniza com o resto do estado da pessoa.
