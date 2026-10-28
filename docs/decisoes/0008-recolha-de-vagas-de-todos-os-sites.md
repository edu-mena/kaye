# 0008. Recolha de vagas de todos os sites de emprego, só para estatística

27 de outubro de 2026 · Estado: Aceite (substitui a regra "se os termos proíbem, não se recolhe" de [fontes-de-vagas.md](../fontes-de-vagas.md))

## Contexto

- O Mercado quer mostrar o estado do trabalho em Angola com dados atuais: quantas vagas saem, em que áreas, onde e quem recruta.
- A regra anterior era não recolher de um site cujos termos o proíbem até haver autorização escrita. Com ela, quase não havia dados: os pedidos de autorização ainda não tinham resposta.
- O Eduardo decidiu (27/10/2026) que o Kayé é um site informativo, não um site de emprego. Ler os anúncios publicados e contá-los é o mesmo que uma pessoa visitar cada site, apontar as vagas que saem e fazer um resumo. O Kayé não mostra os anúncios nem como se candidatar, por isso não tira o lugar a esses sites.

## Decisão

- Recolhem-se as vagas de todos os sites de emprego angolanos a que se consegue chegar, mesmo quando os termos de uso o proíbem.
- Mantêm-se as regras de boa vizinhança:
  - respeitar o `robots.txt`;
  - um robô identificado (`KayeBot/1.0`, com um endereço de contacto);
  - um pedido de cada vez, com 3 segundos de pausa.
- Guardam-se só factos: data, título, tipo (vaga, concurso, estágio, candidatura espontânea), empresa, província, número de vagas, salário, setor, carreira, contrato e experiência pedida. O texto do anúncio é lido para encontrar estes factos e depois descartado.
- A app mostra só números agregados, com as fontes citadas. Nunca mostra um anúncio, a sua descrição nem como se candidatar.
- Se um site pedir para parar, para-se e apagam-se os seus dados.

## Consequências

- O Mercado passa a ter vagas reais de cinco fontes: AngoVagas, Ango Emprego, AngoRecruta, Jobartis e Ver Angola Empregos.
- **Risco legal:** alguns termos proíbem copiar os conteúdos ou usá-los para fins comerciais. Ver Angola Empregos (Ydeal.net) é um exemplo. O risco fica mais baixo por se guardarem só factos e se mostrarem só agregados com a fonte. Continua pendente a validação com um advogado ([arquitetura, secção 8](../arquitetura.md#8-segurança-e-privacidade)).
- Os pedidos de autorização ([modelo](../fontes-de-vagas.md#pedido-de-autorização-modelo)) continuam a valer a pena: uma parceria dá dados melhores (datas exatas, salários) e protege o Kayé.
