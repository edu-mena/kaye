# 0018. O link para a família leva os dados no fragmento (#)

13 de novembro de 2026 · Estado: Aceite

## Contexto

- "Mostrar à família" já criava um PDF de uma carreira no telemóvel ([ADR 0006](0006-pdf-do-cv-gerado-no-aparelho.md)). Os pais pediam algo que se abrisse no próprio telemóvel, com o resultado do teste e até três carreiras.
- O site de teste não tem servidor para isto e, em produção, a Hostinger só tem PHP e MySQL. Não queremos guardar dados de jovens (muitos são menores) só para lhes mostrar uma página.
- Para o cartão de visita, [ADR 0014](0014-pagina-publica-do-cartao.md) rejeitou pôr os dados no link, porque um QR impresso nunca se invalida. Aqui o conteúdo é muito menor e não tem contactos.

## Decisão

- **Página pública `/familia`**, fora do login (como `/c/:slug`), com `noindex`.
- **O link leva os dados no fragmento:** `/familia#<dados>`, um JSON pequeno em base64url: `{ v, firstName?, code, careers, lang, adult? }`. O resto (o que faz, cursos, custos, reconhecimento, bolsas) vem do catálogo, no aparelho de quem abre.
- O que fica de fora: respostas do teste, ano de nascimento, localidade, contactos. O primeiro nome só vai se o jovem marcar a caixa. `adult` só vai para maiores de idade e é a única coisa que mostra salários; sem ano de nascimento conhecido, conta como menor.
- A página valida tudo o que lê (versão, código RIASEC, até 3 slugs, nome só com letras, língua conhecida). Um link inválido ou de outra versão mostra uma mensagem amigável e um link para conhecer o Kayé.
- A página abre na língua do link, sem a guardar, a não ser que quem abre já tenha escolhido uma.

## Consequências

- **O que garante:** o navegador nunca envia o fragmento ao servidor, por isso os dados não chegam ao Kayé, à Vercel ou à Hostinger, nem ficam nos registos (logs). Não há nada para apagar nem para vazar do nosso lado.
- **O que não garante:** quem tem o link vê o conteúdo, e o link não se pode desligar. Se for reencaminhado, quem o receber também vê. Por isso a app explica isto antes de partilhar, e o conteúdo é só o que um familiar pode ver sem problema.
- Se o catálogo mudar, o mesmo link mostra os dados novos. Se uma carreira deixar de existir, desaparece da página.
- Mudar o formato obriga a subir `v`. Os links antigos passam a mostrar a mensagem de link inválido.
