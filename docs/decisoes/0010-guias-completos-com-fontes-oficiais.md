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

- A Enfermagem (30/10/2026), segundo grupo, com as suas fontes:
  - as categorias, o ingresso por concurso, as promoções de 4 em 4 anos e as 36 horas semanais: Regime Jurídico da Carreira de Enfermagem (Decreto Presidencial n.º 187/18);
  - a especialização dos licenciados (exame de acesso, vínculo ao Serviço Nacional de Saúde, carteira da Ordem, até 45 anos, equiparação): Regulamento sobre a Formação Especializada em Enfermagem (Decreto Presidencial n.º 212/23); dura dois anos (MINSA, Março de 2025) e o Ministério anunciou 4 800 vagas em Setembro de 2026 (Ver Angola);
  - os licenciados inscrevem-se na Ordem dos Enfermeiros e os técnicos no Conselho Geral de Enfermagem: Estatuto da Ordem dos Enfermeiros (Decreto Presidencial n.º 179/10);
  - os técnicos nas especializações pós-médias (360 parteiras, 194 instrumentistas, 186 de cuidados intensivos) e os enfermeiros em cada especialização: Anuário do MINSA de 2023, tabelas 153 e 156;
  - as vagas de 2026: 944 de Enfermeiro e 95 de Técnico Médio nos hospitais centrais (Despacho Conjunto n.º 42/26);
  - o curso médio suspenso por 5 anos em 10 províncias (Decreto Executivo n.º 01/25), que o guia do técnico avisa.
- O salário de entrada do Instrumentista Cirúrgico passa a ser o do Técnico Médio de Enfermagem Especializado de 3.ª Classe (180 955 Kz), porque se forma sobretudo na especialização pós-média.
- Os 7 395 médicos e 49 283 profissionais de enfermagem de 2023 são a linha "Total" da tabela 70 do anuário; somá-la às províncias dava o dobro, erro que o guia de Medicina tinha e foi corrigido.
- O Diagnóstico (30/10/2026), terceiro grupo: as cinco profissões são da carreira dos Profissionais de Diagnóstico e Terapêutica (Decreto Presidencial n.º 188/18), que tem a sua tabela de 2026. Em 2026 o Estado abriu 588 vagas de Técnico Superior de Diagnóstico e Terapêutica e nenhuma de Técnico Médio (Despacho Conjunto n.º 42/26); por isso o salário de entrada é o do licenciado (361 910 Kz), menos em Anatomia Patológica, que só tem curso médio (156 828 Kz). Os alunos de cada licenciatura vêm do anuário do ensino superior de 2023/24.
- O que os guias da saúde partilham (os passos da escola, o concurso de 2026, o mercado de quem o Estado contrata por concurso, o que evitar no CV) está em `data/demo/healthGuideParts.ts`.
- Os últimos cinco grupos da saúde (30/10/2026): Farmácia, Reabilitação, Saúde oral, Saúde pública e Saúde mental. Com eles, as 39 profissões da saúde têm guia completo.
  - Quase todas são da carreira de diagnóstico e terapêutica, cujas peças (salários, concursos, etapas, mercado) passam para `data/demo/diagnosisTherapyCareer.ts`. O salário de entrada é o do licenciado quando há licenciatura (farmacêutico, fisioterapeuta, nutricionista, técnico de saúde pública, psicólogo clínico) e o do técnico médio quando só há curso médio (técnico de farmácia, ortoprotésico, ortoptista, técnico de estomatologia, técnico de saúde ambiental).
  - O médico de saúde pública fica com os médicos, porque é da carreira médica (ramo de Saúde Pública e Administração, Decreto Presidencial n.º 186/18; internato de 3 anos).
  - Fontes próprias: o licenciamento farmacêutico, que exige a cada farmácia, distribuidor e importador um Director Técnico declarado pela Ordem dos Farmacêuticos (Decreto Presidencial n.º 41/24); a Ordem dos Fisioterapeutas, que desde 2025 pede curso superior, exame e 2 anos de estágio (Decreto Presidencial n.º 195/25); e o anuário do MINSA de 2023 (consultas de estomatologia, de fisioterapia e do Programa de Saúde Mental).
  - O médico dentista e o delegado de informação médica não têm tabela do Estado nem anúncios: os guias não mostram salário e dizem o que se sabe, com a fonte.
- As fotografias mostram profissionais de saúde em África; quando não há uma do trabalho em si, usa-se uma de trabalho próximo, com uma descrição fiel. Ficam de fora as que têm o nome da pessoa fotografada no ficheiro. A única de fora de África é a do ortoprotésico (uma oficina de próteses na Indonésia), porque nenhuma africana mostrava o trabalho.

## Consequências

- O mesmo molde serve para os outros grupos: um ficheiro por grupo, as partes comuns uma vez, fontes oficiais.
- Os guias da saúde ainda não têm CVs modelo.
