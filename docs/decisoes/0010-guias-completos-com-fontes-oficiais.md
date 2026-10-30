# 0010. Guias completos das profissões com fontes oficiais, um grupo de cada vez

30 de outubro de 2026 · Estado: Aceite

## Contexto

- Das 230 profissões, só três tinham a página completa (o "guia": dia a dia, competências, caminhos, etapas da carreira, mercado e CV), com dados de demonstração. As outras mostram "Em curadoria".
- O Eduardo decidiu (30/10/2026) completar as páginas de forma organizada, um grupo de cada vez, a começar pela Medicina.
- Os médicos não aparecem nos sites de emprego: nos últimos 12 meses houve 11 anúncios. O Estado contrata-os por concurso público.

## Decisão

- Cada grupo tem o seu ficheiro de guias (`data/demo/medicineGuides.ts`): o que é comum ao grupo escreve-se uma vez (o curso, a Ordem, o concurso, o internato, as etapas e os salários da carreira, o mercado, o CV) e cada profissão traz só o que é dela (a descrição, o dia a dia, o ambiente, as competências e a duração da especialidade).
- Tudo tem fonte oficial:
  - as especialidades e a duração de cada internato, a admissão e a equiparação dos graus obtidos no estrangeiro: Regulamento sobre o Internato Médico (Decreto Presidencial n.º 60/25);
  - as categorias da carreira e o que cada promoção pede: Regime Jurídico da Carreira Médica (Decreto Presidencial n.º 186/18);
  - o salário de cada categoria: a tabela de 2026 (Decreto Presidencial n.º 16/26);
  - os médicos em cada internato e no Serviço Nacional de Saúde: Anuário Estatístico Sanitário 2023 do MINSA;
  - os concursos de 2026: Despachos Conjuntos n.º 43/26 a 63/26, com 2 963 vagas para médicos.
- Uma profissão que os anúncios não mostram não tem tendência nem gráfico de vagas (`trendPct: null`): a página mostra, com a fonte, o que se sabe da procura (`demandNote`). Também não tem "o que os empregadores pedem" nem o custo do caminho, enquanto não houver dados.
- Os guias aparecem na página Carreiras numa fila que desliza (`CardRow`), para caberem quantos houver.
- Cada guia tem uma fotografia do Wikimedia Commons com licença livre, guardada com o autor, a licença e a página (`data/demo/images.ts`).

## Consequências

- O mesmo molde serve para os outros grupos: um ficheiro por grupo, as partes comuns uma vez, fontes oficiais.
- Os guias de Medicina ainda não têm CVs modelo.
