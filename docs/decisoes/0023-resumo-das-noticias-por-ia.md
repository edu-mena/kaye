# 0023. Cada notícia tem um resumo escrito por IA, a partir do texto do artigo

22 de novembro de 2026 · Estado: Aceite

## Contexto

- As Novidades entram sozinhas dos feeds ([fontes-de-noticias.md](../fontes-de-noticias.md)). O Novo Jornal e a Expansão só dão o título; o cartão ficava com "Notícia publicada por Expansão." e uma ligação para o original.
- O Eduardo quer que cada novidade traga a matéria resumida, com os dados que importam, e não seja só um empurrão para a pessoa sair do Kayé.
- A regra anterior era "nunca se pede a página do artigo".

## Decisão

- Depois de recolher, o servidor lê **uma vez** a página de cada notícia nova, tira só os parágrafos e pede à API do Claude (`claude-haiku-5-5`, configurável em `NEWS_AI_MODEL`) um resumo **com palavras próprias**: uma frase e 2 a 4 parágrafos com quem, quanto, quando, onde, prazos, requisitos e o que muda para um jovem.
- Guarda-se **só o resumo** (`summary` e `body`), nunca o texto do artigo. A fonte continua nomeada e ligada no fim do cartão.
- O texto enviado à API é só o artigo público, sem dados de utilizadores. O texto do artigo é tratado como dados: a instrução diz para ignorar ordens que apareçam nele, e a resposta só é aceite se for JSON com os limites certos.
- Limites: 15 resumos por corrida, 3 tentativas por notícia (`summary_attempts`), 3 s de pausa entre páginas, páginas até 1,5 MB, 8000 caracteres enviados.
- Sem `ANTHROPIC_API_KEY`, ou se algo falhar, nada muda: a notícia fica com a primeira frase do *lead* ou só com a fonte, e a recolha nunca pára.

## Consequências

- Custo: uns cêntimos por dia (máximo 15 resumos de 2 em 2 horas, com um modelo pequeno).
- O resumo pode errar. O prompt proíbe inventar e a ligação ao original fica; uma notícia errada apaga-se no painel e não volta.
- Risco de direitos: o resumo é original e atribuído, e não se guarda nem mostra o texto da fonte, mas as fontes sem página de termos devem ser confirmadas pelo Eduardo (já assim em [fontes-de-noticias.md](../fontes-de-noticias.md)). Se uma fonte pedir para sair, tira-se de `config/news.php`.
- Passa a haver um segredo a mais (`ANTHROPIC_API_KEY`) no `.env` da Hostinger.
