# 0023. Cada notícia traz um resumo com os dados que importam; a IA é opcional

22 de novembro de 2026 · Estado: Aceite

## Contexto

- As Novidades entram sozinhas dos feeds ([fontes-de-noticias.md](../fontes-de-noticias.md)). O Novo Jornal e a Expansão só dão o título; o cartão ficava com "Notícia publicada por Expansão." e uma ligação para o original.
- O Eduardo quer que cada novidade traga a matéria resumida, com os dados que importam, e não seja só um empurrão para a pessoa sair do Kayé.
- A regra anterior era "nunca se pede a página do artigo".
- Pagar a API de uma IA não é possível agora.

## Decisão

- Depois de recolher, o servidor lê **uma vez** a página de cada notícia nova e tira só os parágrafos.
- **Sem chave (o normal agora):** um excerto cortado por regras, sem IA e sem custo: a frase de abertura (onde uma notícia põe o facto principal) como resumo; no corpo, até 3 frases do primeiro parágrafo (máximo 350 caracteres) e até 2 frases seguintes que tragam um número ou uma data (cada uma até 250 caracteres). No total, algumas centenas de caracteres, nunca o artigo.
- **Com `ANTHROPIC_API_KEY`:** a API do Claude (`NEWS_AI_MODEL`, por defeito `claude-haiku-5-5`) escreve em vez disso um resumo com palavras próprias: uma frase e 2 a 4 parágrafos com quem, quanto, quando, onde, prazos e o que muda para um jovem. O texto do artigo vai como dados (a instrução manda ignorar ordens que apareçam nele) e a resposta só vale se for JSON dentro dos limites.
- Em ambos os casos a fonte continua nomeada e ligada no fim do cartão.
- Limites: 15 resumos por corrida, 3 tentativas por notícia (`summary_attempts`), 3 s de pausa entre páginas, páginas até 1,5 MB. Se a página falhar, a notícia fica como estava e a recolha não pára.

## Consequências

- Custo zero por defeito. Ligar a IA é pôr uma chave no `.env`, sem mudar código; custaria uns cêntimos por dia.
- **O excerto reproduz frases da fonte**, ao contrário do resumo por IA. É curto, atribuído e com ligação ao original, mas é a parte com mais risco de direitos. As fontes sem página de termos devem ser confirmadas pelo Eduardo (já assim em [fontes-de-noticias.md](../fontes-de-noticias.md)); se uma fonte pedir para sair, tira-se de `config/news.php`.
- O excerto é menos bom que um resumo: a primeira frase pode ser uma linha de agência ("Luanda, 20 Nov (Lusa) –") e os números escolhidos podem não ser os mais importantes. Uma notícia má apaga-se no painel e não volta.
- Com a IA ligada, o resumo pode errar; o prompt proíbe inventar.
