# 0011. Catálogo de cursos reais e planos de estudos dos decretos

30 de outubro de 2026 · Estado: Aceite

## Contexto

- A página Cursos mostrava só a classificação de exemplo (instituições "Exemplo", com preços e pontuações inventados, ADR 0005), toda de tecnologia. Os cursos reais (1 010 ofertas de 256 cursos em 115 instituições, do anuário do ensino superior 2023/24) só apareciam dentro de cada academia.
- O Eduardo pediu (30/10/2026): os cursos reais na página Cursos, com um filtro por área; na academia, os cursos em cartões de duas colunas; ao abrir um curso, a oferta curricular segundo a instituição que o dá e um botão para a página do curso.
- O plano de estudos de um curso numa instituição é público: vem no anexo do decreto executivo do Ministério do Ensino Superior que cria o curso e "aprova o seu Plano de Estudos". Os decretos de 2020 a 2026 estão no lex.ao (índices por ano em `lex.ao/llms`), mas os anexos só existem no PDF digitalizado do Diário da República, sem texto.

## Decisão

- **Catálogo:** cada curso real junta as ofertas de todas as instituições (`domain/courses.ts`, `GET /courses`). A página Cursos mostra-o logo a seguir ao topo, uma área de cada vez (botões a partir do tablet, uma lista no telemóvel, o mesmo `AreaPicker` das Carreiras) ou todas, com o nível e uma pesquisa, 12 por página. A classificação de exemplo continua por baixo, com o título "Classificação Kayé (exemplo)".
- **Página do curso:** `/cursos/curso/:id` (o `/cursos/:id` continua a ser a oferta de exemplo). Mostra onde estudar (com `?academia=`, essa instituição primeiro, "A ver"), o plano de estudos de cada instituição que o tenha, as profissões a que leva e os decretos.
- **Academia:** os cursos em cartões de duas colunas; o cartão abre uma janela com a oferta (o que está por confirmar diz "Por confirmar"), o plano de estudos dessa instituição e "Ver mais sobre o curso", que leva à página do curso nessa instituição.
- **Planos de estudos:** cada plano tem o decreto como fonte (`Curriculum.source`). Sem plano, a página diz que ainda não o temos; nunca se inventa uma disciplina. Os planos são transcritos à mão do PDF oficial, a começar pelos cursos de saúde.
- Um nível novo, "Especialização", para as especialidades e especializações depois de um curso.
- **Os primeiros planos (30/10/2026), todos da saúde**, em `data/demo/healthCourseDecrees.ts` (juntados às academias por `courseDecrees.ts`):
  - as licenciaturas em Enfermagem, Ciências Farmacêuticas, Fisioterapia e Análises Clínicas da Escola Superior de Saúde Castelo (Decreto Executivo n.º 174/23);
  - as licenciaturas em Enfermagem, Análises Clínicas, Ciências Farmacêuticas, Fisioterapia e Medicina Dentária do Instituto Superior Politécnico Ombaka (Decreto Executivo n.º 2/25), que o anuário de 2023/24 ainda não tinha;
  - as especializações em Enfermagem em Urgência e Emergências, Bioquímica Clínica e Hematologia, Enfermagem Pediátrica e Enfermagem Gineco-Obstétrica do Instituto Superior Politécnico da Caála (Decretos Executivos n.º 367/25 a 370/25), em Novas Tecnologias Aplicadas à Saúde da Universidade José Eduardo dos Santos (n.º 92/23), em Educação para a Saúde do Instituto Superior Politécnico Tundavala (n.º 13/25) e em Informática Médica da Universidade Katyavala Bwila (n.º 421/25).
  - A transcrição segue a ordem do decreto e corrige só gralhas evidentes ("Inmunologia").
- **As 39 especialidades médicas** do Regulamento sobre o Internato Médico (Decreto Presidencial n.º 60/25, anexo I) entram como cursos do Instituto de Especialização em Saúde, que coordena os internatos (Decreto Presidencial n.º 151/21); sem plano de estudos, que o decreto não publica.

## Consequências

- A maior parte das ofertas não tem plano de estudos: só as dos cursos criados por decreto com o anexo publicado. A cobertura cresce decreto a decreto.
- A transcrição manual pede revisão: cada plano fica com a ligação ao decreto, para quem quiser confirmar.
- Para automatizar, a recolha precisa de OCR (por exemplo, no GitHub Actions); fica para depois.
