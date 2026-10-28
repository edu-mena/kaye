# Fontes de vagas

O Kayé **não é um site de emprego**. As vagas servem só como dados, para mostrar o que o mercado angolano pede a cada profissão: competências, formação, anos de experiência, certificações, salários e procura. **Nenhuma vaga é publicada nem mostrada como anúncio.** Só aparecem estatísticas agregadas (por exemplo, "78% das vagas de Analista de Dados pedem SQL").

Isto reduz muito o risco legal: não reproduzimos o conteúdo dos sites, só contamos factos. Mesmo assim, respeitamos os termos de cada fonte e pedimos autorização quando os termos o exigem.

## Regras de recolha

- Respeitar o `robots.txt`. Os termos de uso já não impedem a recolha para estatística ([ADR 0008](decisoes/0008-recolha-de-vagas-de-todos-os-sites.md)): guardam-se só factos e mostram-se só números agregados, com a fonte.
- Preferir *feeds* RSS ou APIs (foram feitos para serem lidos por máquinas) a ler páginas HTML.
- Um pedido a cada 3 a 5 segundos, com um User-Agent identificado e um contacto (`KayeBot/1.0 (+https://<domínio>/bot)`).
- Guardar só os factos de cada vaga (`scrapers/data/postings.jsonl`); o texto do anúncio é lido e descartado. Quando houver API, o original fica em `job_postings_raw`, que nunca é mostrado a ninguém.
- Apagar os dados pessoais que apareçam nas vagas (telefones e emails de pessoas) antes de os guardar.
- Rever cada fonte de 6 em 6 meses: os termos mudam.

## Fontes avaliadas

Verificadas a 23 de outubro de 2026.

| Fonte | O que é | `robots.txt` | Feed | Termos de uso | Decisão |
|---|---|---|---|---|---|
| [angovagas.net](https://angovagas.net) | Blog de vagas (WordPress) | Permite tudo, exceto `/wp-admin/` | **RSS** em `/feed/` | [Página](https://angovagas.net/termos-de-utilizacao/) carregada por JavaScript; não foi possível ler | **Candidata n.º 1, pelo RSS**, depois de o Eduardo ler os termos no browser |
| [empregos.verangola.net](https://empregos.verangola.net) | Portal da Ydeal.net | Permite tudo, exceto `/BOempregos/` | **RSS** em `/feed` | [Termos](https://empregos.verangola.net/termos-p25): os conteúdos são da Ydeal.net e não podem ser usados para fins comerciais nem copiados | **Pedir autorização** antes de usar |
| [jobartis.com](https://www.jobartis.com) | Portal comercial de emprego | Não tem | Não tem | Não aparecem na página inicial | **Não recolher** até lermos os termos; candidata a parceria (Fase 4) |
| [bolsadeoportunidades.com](https://www.bolsadeoportunidades.com) | Portal do FAJE | Não tem | Não encontrado | Só tem [política de privacidade](https://www.bolsadeoportunidades.com/politica-privacidade) | **Pedir autorização**: é uma entidade ligada ao emprego jovem, interessada no mesmo objetivo |
| [angola.un.org/pt/jobs](https://angola.un.org/pt/jobs) | Vagas da ONU em Angola | Permite `/pt/jobs` | Não encontrado | Termos gerais da ONU | **Prioridade baixa**: poucas vagas tech, quase todas seniores |
| Canais e páginas de WhatsApp | Grupos de vagas | Não aplicável | Não aplicável | Os termos do WhatsApp proíbem automatização | **Só colagem manual** no painel ([arquitetura, 5.2](arquitetura.md#52-recolha-e-tratamento-de-vagas)) |

## Fontes recolhidas (28/10/2026)

AngoVagas, Ango Emprego e AngoRecruta (API do WordPress, todo o histórico), Jobartis (listagem, datas estimadas; e a página de cada vaga dos últimos 60 dias, com as habilitações mínimas e o prazo) e Ver Angola Empregos (RSS). Para os concursos públicos, os despachos do Diário da República publicados no AngoLEX (o número oficial de lugares de cada órgão). Detalhe em [scrapers/README.md](../scrapers/README.md).

## Pedido de autorização (modelo)

> Assunto: Pedido de autorização para uso estatístico de vagas — Kayé
>
> Olá, equipa do {fonte}.
>
> Sou o Eduardo Baptista, estudante de Engenharia Informática na UCAN e fundador do Kayé, uma app gratuita de orientação vocacional para jovens angolanos. O Kayé ajuda os jovens a perceber o que cada profissão faz, o que exige e como lá chegar.
>
> Gostaríamos de usar as vagas publicadas no {fonte} **apenas para estatísticas agregadas** (por exemplo, "as competências mais pedidas para Analista de Dados em Luanda"). Não publicamos as vagas nem copiamos os textos. Indicamos sempre o {fonte} como fonte dos dados.
>
> Podemos ler o vosso RSS uma vez por semana, com um robô identificado e a um ritmo que não pese no vosso servidor. Teríamos todo o gosto em mostrar o resultado e em ouvir as vossas condições.
>
> Obrigado,
> Eduardo Baptista

## Pendente

- O Eduardo lê os termos do angovagas no browser e confirma se permitem este uso.
- Enviar o pedido de autorização ao verangola (Ydeal.net), ao FAJE e ao Jobartis.
- Avaliar as outras fontes que o Eduardo conhece.
- Validar com um advogado o uso estatístico de dados públicos ([arquitetura, secção 8](arquitetura.md#8-segurança-e-privacidade)).
