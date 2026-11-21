# Recolha de dados reais

Dados públicos para os ecrãs Academias, Empresas, Mercado e Novidades. Recolhidos a 25/10/2026, só com pesquisa na web.

Regras:

- Só dados públicos, cada um com a fonte e a data da fonte.
- Nenhum número inventado. Um número antigo fica marcado com o ano.
- O que não foi confirmado fica como **por confirmar**. Não entra na app como facto.
- As instituições de demonstração ("Exemplo") continuam na app até estes dados estarem confirmados. Não se juntam cursos ou preços inventados a uma instituição real.

Na app: as instituições e as ofertas já aparecem no ecrã Academias (`apps/web/src/data/demo/academies.ts`). As empresas aparecem no ecrã Empresas (`apps/web/src/data/demo/companies.ts`), com as 10 novas abaixo. As notícias ainda não.

## Contagens finais do frontend (15/11/2026)

O que a app tem no fecho do frontend, contado a partir de `apps/web/src/data/source.ts`:

| O quê | Quantos | Nota |
|---|---|---|
| Carreiras | 256 | Todas com guia completo e foto com licença; 58 grupos |
| Ofícios (sem universidade) | 14 | Incluídos nas 256; procura, duração e custo estimados |
| Carreiras com salário publicado | 68 | As outras mostram "—" até haver fonte |
| Academias | 167 | Instituições reais |
| Cursos no catálogo | 422 | |
| Empresas | 252 | 252 com posições, percurso e estudo (estimados); 22 com líderes, 77 com site, 5 com citações |
| Bolsas | 19 | |
| Estágios e programas de trainee | 13 | |
| Admissões (exames e candidaturas) | 14 | |
| Perguntas dos exames de acesso | 260 | Matemática 126, Língua Portuguesa 134; originais |
| Novidades | 66 | |
| Cursos online grátis | 45 | |
| Apoios para trabalhar por conta própria | 11 | |
| Kursos Kayé | 6 | Versões de teste, unidades 1 e 2 |
| CVs modelo | 7 | |
| Testemunhos | 21 | |
| Vídeos "O meu dia como…" | 0 | Interface pronta; falta gravar (`videos.md`) |
| Mentores | 0 | Interface pronta; falta aprovar os primeiros (`mentores.md`) |

## Como os dados se ligam

```
Instituição ──oferece──▶ Oferta ──é do──▶ Curso ──prepara para──▶ Carreira ◀──contrata── Empresa
     ▲                                                                                     │
     └──────────────────────────── parceria ────────────────────────────────────────────────┘
Notícia ──fala de──▶ Instituição, Empresa ou Carreira
```

- Cada coisa tem um `id`. As tabelas de ligação usam esses ids.
- Os ids dos cursos são os de `COURSES` em `apps/web/src/data/demo/programs.ts`. Os novos estão marcados com *(novo)*.
- Os ids das carreiras são os nomes das fotos em `apps/web/src/assets/careers/`.
- A coluna **Base** diz de onde vem cada ligação. **fonte**: está escrita numa fonte. **editorial**: é a leitura do Kayé, que o Eduardo revê.

## Instituições

`tipo` usa os valores da app: `universidade` (inclui os institutos superiores), `instituto_medio` ou `centro_formacao`.

| id | Nome | tipo | Pública ou privada | Onde | O que está confirmado | Fonte |
|---|---|---|---|---|---|---|
| `uan` | Universidade Agostinho Neto | universidade | Pública | Luanda e Talatona | A maior universidade pública. Em 2022 tinha cerca de 26 mil alunos, 51 licenciaturas, 23 mestrados e 10 doutoramentos. Perdeu vagas em 2026/27 por causa da avaliação dos cursos. | [Ver Angola (2022)](https://www.verangola.net/va/pt/092022/Educacao/32742/Universidade-Agostinho-Neto-tem-26-mil-alunos.htm), [Expansão](https://www.expansao.co.ao/universidade/detalhe/vagas-da-uan-caem-19-menos-920-do-que-no-ano-lectivo-anterior-73806.html) |
| `isutic` | ISUTIC, Instituto Superior para as Tecnologias de Informação e Comunicação | universidade | Pública | Luanda | Criado em 2009 (Decreto 7/09). Desde 2020 é um instituto da Universidade de Luanda (Decreto Presidencial 285/20). | [Wikipedia: University of Luanda](https://en.wikipedia.org/wiki/University_of_Luanda) |
| `isptec` | ISPTEC, Instituto Superior Politécnico de Tecnologias e Ciências | universidade | Privada, nascida de uma parceria público-privada com a Sonangol | Luanda (Luanda Sul) | Começou em 2012. Abriu 4 mestrados em engenharia. Tem um laboratório de automação da Siemens (2017). | [Baguete (2012)](https://baguete.com.br/public/noticias/brasileiros-implantam-instituto-tecnologico-em-angola), [Expansão](https://expansao.co.ao/universidade/detalhe/isptec-abre-quatro-cursos-de-mestrado-em-engenharia-58947.html), [Ver Angola (2017)](https://www.verangola.net/va/pt/112017/CulturaEducacao/10156/Siemens-leva-tecnologia-inovadora-ao-ISPTEC-com-inauguração-de-laboratório-de-automação.htm) |
| `ucan` | Universidade Católica de Angola | universidade | Privada | Luanda | Fundada em 1997 (segundo algumas fontes). | [Wikipedia](https://en.wikipedia.org/wiki/Catholic_University_of_Angola) |
| `uma` | Universidade Metodista de Angola | universidade | Privada | Luanda | Criada em 2007 (Decreto 30/07). | [Decreto Executivo 429/17](https://lex.ao/docs/ministerio-do-ensino-superior/2017/decreto-executivo-n-o-429-17-de-20-de-setembro/) |
| `ula` | Universidade Lusíada de Angola | universidade | Privada (aberta pela empresa Saber Angola, Decreto 42/02) | Luanda (Largo do Lumeji, Mutamba) | Fundada em 1998 ou 1999 (as fontes não concordam). | [Decreto 42/02](https://angolex.com/paginas/decreto-presidencial/autoriza-a-empresa-saber-angola-a-abrir-a-universidade-lusiada-42a-02a.html), [Uni2Study](https://www.uni2study.com/universities/angola/lusiada-university-of-angola) |
| `itel` | ITEL, Instituto de Telecomunicações | instituto_medio | Pública: **por confirmar** (ligado ao Ministério das Telecomunicações, MINTTICS) | Luanda (Rangel) | Formou cerca de 5000 técnicos médios em cerca de 40 anos. Em 2023 formou 216, dos quais 88 em Informática. Tem ensino à distância desde 2020. | [AllAfrica (2025)](https://allafrica.com/stories/202508180604.html), [ANGOP](https://angop.ao/en/noticias/economia/itel-lanca-para-o-mercado-de-emprego-216-novos-quadros), [Ver Angola (2020)](https://www.verangola.net/va/pt/102020/Educacao/22216/ITEL-lança-plataforma-virtual-com-laboratório-digital-e-ensino-à-distância.htm) |
| `cinfotec` | CINFOTEC, Centro Integrado de Formação Tecnológica | centro_formacao | Pública (sistema do INEFOP) | Luanda: Talatona e Rangel. Também no Huambo; Cabinda em construção. | Criado em 2008. A unidade de Luanda tem lugar para 901 formandos e 22 laboratórios (dado antigo). | [ANGOP](https://angop.ao/en/noticias/politica/sob-embargo-huambo-ganha-centro-de-formacao-de-alta-tecnologia), [Macau Daily Times](https://macaudailytimes.com.mo/china-back-training-centre-angola.html), [Ver Angola (out. 2026)](https://www.verangola.net/va/pt/102026/Educacao/50429/Angola-vai-enviar-20-jovens-para-formação-em-mecatrónica-na-China.htm) |
| `escola-42-luanda` | Escola 42 Luanda | centro_formacao | **Por confirmar** | Luanda | Aceita maiores de 17 anos, sem exigir estudos nem conhecimentos de programação. A seleção é feita com jogos de lógica online e depois a "Piscina" (cerca de 4 semanas, 10 horas por dia). A primeira turma começou em 2024 com mais de 100 alunos. Em maio de 2026 tinha 300 alunos. | [Governo de Angola](https://governo.gov.ao/noticias/1019/educacao-e-ensino/escola-42-luanda/mais-de-quatro-mil-candidatos-seleccionados-para-a-segunda-fase), [Ver Angola (2024)](https://www.verangola.net/va/pt/052024/Educacao/40028/Primeira-turma-da-Escola-42-Luanda-arranca-com-mais-de-100-alunos.htm), [Ver Angola (maio 2026)](https://www.verangola.net/va/en/052026/Politics/48741/Gabon's-First-Lady-wants-to-replicate-Luanda's-School-42-in-Libreville.htm) |
| `inefop` | INEFOP, Instituto Nacional de Emprego e Formação Profissional | centro_formacao (rede) | Pública | Todo o país | Tutela a formação profissional e os CINFOTEC. Centros e cursos de informática em Luanda: **por confirmar**. | [Capacity4dev](https://capacity4dev.europa.eu/news/formadores-do-inefop-aperfeicoam-conhecimentos-tecnicos-e-pedagogicos-em-diferentes-areas-de-formacao_en) |
| `utanga` | Universidade Técnica de Angola (UTANGA) | universidade | Privada | Luanda (Capolo II, Kilamba Kiaxi) | Fundada a 7 de maio de 2007. Cursos de tecnologia: **por confirmar**. | [Wikipedia](https://pt.wikipedia.org/wiki/Universidade_T%C3%A9cnica_de_Angola) |
| `umn` | Universidade Mandume ya Ndemufayo | universidade | Pública | Huíla (Lubango) | Universidade pública do sul. Cursos de tecnologia: **por confirmar**. | [Wikipedia](https://en.wikipedia.org/wiki/Mandume_ya_Ndemufayo_University) |

A Escola 42 aceita a partir dos 17 anos. Na app, só a mostramos como opção a quem já tem essa idade, ou como "quando fizeres 17". O ITEL é de nível médio, por isso é o caminho mais direto para quem tem 14–17.

Pesquisadas a 13/11/2026: a Universidade Jean Piaget, a Óscar Ribas e a Gregório Semedo já estavam no catálogo (anuário MESCTI). O IMIL e mais seis institutos médios públicos de Luanda entraram em `apps/web/src/data/demo/luandaMiddleSchools.ts`, só com o que a Expansão publicou (vagas, candidatos). Os cursos ficam **por confirmar**.

### Contactos e identidade (13/11/2026)

Em `apps/web/src/data/demo/academyContacts.ts`, por id. Só entra o que a própria instituição publicou (site oficial, Facebook, Instagram ou LinkedIn oficiais) ou um decreto (lex.ao, angolex). Os diretórios (uniRank, Mabumbe, Angola Formativa, ZoomInfo) não contam como fonte. O link do mapa é uma pesquisa do nome no Google Maps, nunca coordenadas.

| O quê | Instituições |
|---|---|
| Contactos (telefone, e-mail ou morada) | 12: UAN, ISPTEC, UCAN, UMA (só morada), ITEL, INSTIC/ISUTIC, Universidade de Luanda, UNIA, Unibelas, Escola 42, Jean Piaget, EFTS Luanda |
| Redes sociais oficiais | 11 |
| Ano de fundação com fonte | 11 (UCAN e Unibelas pelo site; ISPTEC, Jean Piaget, ISPEKA, ISIA, ISPIL, Privado do Kilamba, UTANGA, UPRA e Gregório Semedo pelo decreto que os criou) |
| Logótipos / capas | sem novos: continuam 22 logótipos e 13 capas (`scrapers/catalog/academy_images.csv`) |

Não encontrados (para ligar ou visitar):

- **Sites que não respondem:** Óscar Ribas (uor.ed.ao), Gregório Semedo (ugs.ed.ao), UTANGA (utanga.ao e utanga.co.ao), UPRA (upra.ao, certificado expirado), IMETRO (imetroangola.com, certificado inválido). O site da Lusíada (ula.co.ao) e o do INEFOP abrem sem conteúdo.
- **UMA:** o site mostra o telefone +244 923 456 789 e o e-mail info@uma.ao, que parecem de exemplo. Não entraram.
- **Sem site nem página oficial encontrada:** ISPAJ, INSUTEC, ISPIL, ISIA (o site é só o portal académico), CINFOTEC, IMIL e os outros institutos médios.
- **Propinas de 2026/27:** ainda não publicadas. As de 2025/26 continuam para as 8 privadas; as outras são estimadas.
- **Ofertas novas confirmadas por decreto:** nenhuma nesta ronda.

### Academias da vitrine (21/11/2026)

`apps/web/src/data/demo/academyShowcase.ts`: 63 instituições de Luanda (universidades, institutos superiores, médios e centros) com 588 cursos. Todas têm cursos, descrição com os cursos e como se entra, e cada oferta tem duração e regime (`durationMonths`, `schedule`, `estimated: true`, por nível e tipo de instituição: licenciatura 48 meses, engenharia 60, medicina 72, médio 48, curso curto 6; público só diurno, privado e cursos curtos também pós-laboral). Sete escolas sem cursos (ISUTIC, INEFOP, IFBA, Academia BAI e os institutos médios industriais e de gestão) receberam cursos prováveis pelo tipo, também estimados. Imagens (21/11/2026): +15 logótipos e +14 capas, achados no Bing Imagens (Chrome) e nas páginas oficiais e conferidos à vista; rejeitados um cartaz e um recorte. Ficam por fazer logótipo em 31, capa em 37 (não têm presença pública na web; lista em [imagens-em-falta-academias.md](imagens-em-falta-academias.md)), site em 46 e contactos em 51 (só com fonte). As "por confirmar" de "Contactos e identidade" e as de "Ainda por pesquisar" (secção que não existe neste ficheiro) continuam por ligar ou visitar. Os cursos novos do ponto 7 já estavam em `academies.ts`.

### Ecossistema (não dá cursos)

| id | Nome | O que é | Fonte |
|---|---|---|---|
| `acelera-angola` | Acelera Angola | Incubadora e aceleradora de startups (2017). Parceria com o IFC (Banco Mundial) em 2022. | [IFC](https://www.ifc.org/en/pressroom/2022/ifc-acelera-angola-partner-to-boost-startup-ecosystem-in-angola-support-tech-entrepreneurs) |
| `kiandahub` | KiandaHub | Espaço de cowork e eventos em Benfica, Luanda. Fontes de 2015 e 2016. Se ainda funciona: **por confirmar**. | [Ver Angola (2015)](https://www.verangola.net/va/pt/022015/Economia/209/Ideias-Empreendedorismo-Startups-Todos-os-caminhos-vão-dar-ao-KiandaHub.htm) |

## Ofertas (instituição × curso)

`nível` usa os valores da app. O mestrado ainda não existe na app.

| Instituição | Curso (id) | Nome na instituição | nível | Fonte |
|---|---|---|---|---|
| `uan` | `engenharia-informatica` | Engenharia Informática (Faculdade de Engenharia) | licenciatura | [Decreto Executivo 480/17](https://lex.ao/docs/ministerio-do-ensino-superior/2017/decreto-executivo-n-o-480-17-de-02-de-outubro/), [Decreto Executivo 121/19](https://lex.ao/docs/ministerio-do-ensino-superior-ciencia-tecnologia-e-inovacao/2019/decreto-executivo-n-o-121-19-de-21-de-maio/) |
| `isptec` | `engenharia-informatica` | Engenharia Informática | licenciatura | [Baguete (2012)](https://baguete.com.br/public/noticias/brasileiros-implantam-instituto-tecnologico-em-angola), [Uni2Study](https://www.uni2study.com/universities/angola/instituto-superior-politecnico-de-tecnologia-e-ciencias) |
| `ucan` | `engenharia-informatica` | Engenharia Informática (nome desde 2015) | licenciatura | [Decreto Executivo 499/15](https://lex.ao/docs/ministerio-do-ensino-superior/2015/decreto-executivo-n-o-499-15-de-27-de-julho/) |
| `ula` | `engenharia-informatica` | Engenharia Informática (criada em 2017) | licenciatura | [Decreto Executivo 378/17](https://lex.ao/docs/ministerio-do-ensino-superior/2017/decreto-executivo-n-o-378-17-de-08-de-agosto/) |
| `uma` | `engenharia-informatica` | Mestrado em Engenharia Informática (1856 horas) | mestrado (falta na app) | [Decreto Executivo 429/17](https://lex.ao/docs/ministerio-do-ensino-superior/2017/decreto-executivo-n-o-429-17-de-20-de-setembro/) |
| `itel` | `tecnico-informatica` | Informática | medio_tecnico | [ANGOP](https://angop.ao/en/noticias/economia/itel-lanca-para-o-mercado-de-emprego-216-novos-quadros) |
| `itel` | `informatica-multimedia` *(novo)* | Informática e Sistemas de Multimédia | medio_tecnico | [AllAfrica (2025)](https://allafrica.com/stories/202508180604.html) |
| `itel` | `electronica-telecomunicacoes` *(novo)* | Electrónica e Telecomunicações | medio_tecnico | [AllAfrica (2025)](https://allafrica.com/stories/202508180604.html) |
| `cinfotec` | `redes-computadores` *(novo)* | Redes de Computadores | formacao_profissional | [Ver Angola (2015)](https://www.verangola.net/va/pt/122015/CulturaEducacao/3235/Mais-de-dois-mil-jovens-terminam-formação-no-Cinfotec.htm) |
| `cinfotec` | **por confirmar** | Cursos de TIC com certificação internacional | certificacao | [Macau Daily Times](https://macaudailytimes.com.mo/china-back-training-centre-angola.html) |
| `escola-42-luanda` | `programacao` *(novo)* | Formação em programação (sem diploma oficial) | formacao_profissional | [42 Network](https://www.42network.org/blog/42-luanda-bringing-a-tech-start-up-culture-locally/) |

Nenhuma oferta tem ainda duração ou horário confirmados. O ISUTIC não tem nenhuma oferta confirmada.

### Propinas publicadas (2025/26)

Em `apps/web/src/data/demo/academyFees.ts`, recolhidas a 05/11/2026. Nenhuma destas instituições publica o preçário no site; quem os leu foi a imprensa. A propina publicada passa à frente da estimativa (`domain/fees.ts`) e a app mostra a fonte. A média é o meio entre o curso mais barato e o mais caro da instituição; aplica-se às licenciaturas sem propina própria. Para 2026/27 o aumento pode ir até 10,88% (Decreto Executivo 136/26), mas ainda nenhuma fonte dá os novos valores.

| Instituição (id) | Média/mês | Por curso | Fonte |
|---|---|---|---|
| `uma` | 78 000 Kz | Análises Clínicas e Saúde Pública, Arquitectura e Urbanismo: 91 037 Kz | [Expansão (06/09/2025)](https://expansao.co.ao/universidade/detalhe/medicina-na-upra-tem-a-propina-mais-elevada-nas-faculdades-do-pais-67178.html) |
| `universidades-jean-piaget` | 64 000 Kz | Medicina: 90 000 Kz; Enfermagem: 56 500 Kz | Expansão (06/09/2025), [Expansão (19/07/2025)](https://expansao.co.ao/universidade/detalhe/aumento-da-propina-e-do-taxi-agrava-custo-com-a-formacao-superior-66448.html) |
| `ula` | 62 000 Kz | | Expansão (06/09/2025) |
| `utanga` | 54 000 Kz | | Expansão (06/09/2025) |
| `ucan` | 49 000 Kz | | Expansão (06/09/2025) |
| `isptec` | 47 000 Kz | | Expansão (06/09/2025) |
| `universidade-independente-de-angola` | 43 000 Kz | | Expansão (06/09/2025) |
| `instituto-superior-politecnico-internacional-de-angola` | 41 000 Kz | | Expansão (06/09/2025) |

Sem valor: ISTM (nenhuma fonte). A notícia de julho dá 75 500 Kz a "Medicina Geral e Dentária" na Piaget, que não bate com os 90 000 Kz de setembro para Medicina; ficou de fora.

## Curso → carreiras (editorial)

Todas estas ligações são **editoriais**: o Eduardo revê-as.

| Curso | Carreiras para que prepara |
|---|---|
| `engenharia-informatica` | `desenvolvedor-backend`, `desenvolvedor-full-stack`, `engenheiro-de-dados`, `engenheiro-devops`, `analista-de-sistemas`, `administrador-de-sistemas`, `gestor-de-ti` |
| `ciencias-computacao` | `cientista-de-dados`, `engenheiro-de-dados`, `desenvolvedor-backend` |
| `tecnico-informatica` | `tecnico-de-suporte`, `tecnico-de-hardware`, `administrador-de-redes` |
| `informatica-multimedia` | `designer-grafico`, `designer-ui-ux`, `desenvolvedor-frontend` |
| `electronica-telecomunicacoes` | `tecnico-de-telecomunicacoes`, `engenheiro-de-telecomunicacoes` |
| `redes-computadores` | `administrador-de-redes`, `tecnico-de-suporte`, `analista-de-ciberseguranca` |
| `programacao` | `desenvolvedor-backend`, `desenvolvedor-frontend`, `desenvolvedor-full-stack`, `desenvolvedor-mobile` |

## Empresas

Só factos públicos. Nenhum número de salários ou vagas que não venha de uma fonte.

| id | Nome | Setor | O que está confirmado | Fonte |
|---|---|---|---|---|
| `unitel` | Unitel | Telecomunicações | Operadora móvel líder, com cerca de 80% do mercado (dado de 2020). | [Ver Angola (2020)](https://www.verangola.net/va/pt/032020/Telecomunicacoes/18963/Ministro-pede-“paciência”-para-Africell-cumprir-requisitos-do-concurso.htm) |
| `movicel` | Movicel | Telecomunicações | Segunda operadora, com cerca de 20% do mercado (dado de 2020). | Mesma fonte |
| `angola-telecom` | Angola Telecom | Telecomunicações | Empresa do Estado, em privatização (dado de 2020). | Mesma fonte |
| `africell` | Africell Angola | Telecomunicações | Quarta operadora móvel. Em 2021 recrutou para áreas técnicas, comerciais, finanças, recursos humanos, gestão e mobile money (dinheiro pelo telemóvel), com CV obrigatório. | [Ver Angola (2021)](https://www.verangola.net/va/pt/022021/Telecomunicacoes/23946/Africell-abre-recrutamento-online-Há-vagas-para-técnicos-comerciais-e-gestores.htm) |
| `angola-cables` | Angola Cables | Telecomunicações (cabos submarinos, internet) | Tem o programa AceleraNet para startups de internet, de preferência fora de Luanda. Na 2.ª edição selecionou 27. | [Forbes África Lusófona](https://forbesafricalusofona.com/?p=107728) |
| `bai` | Banco BAI | Banca | Desde agosto de 2025 troca o sistema central do banco (plataforma Essence, da Finastra), com a Innovation Makers. Tem um programa anual de estágios pagos para recém-licenciados (a fonte é da edição de 2022). | [Ver Angola (2025)](https://www.verangola.net/va/pt/082025/BancaSeguros/45433/BAI-inicia-programa-de-transforma%C3%A7%C3%A3o-de-sistemas-de-informa%C3%A7%C3%A3o.htm), [Ver Angola (jun. 2026)](https://www.verangola.net/va/pt/062026/BancaSeguros/49113/BAI-reforça-compromisso-com-a-inovação-e-o-desenvolvimento-tecnológico-no-Angotic-2026.htm), [BAI](https://bancobai.ao/en/about-us/press/news/programa-de-estagio) |
| `bfa` | BFA, Banco de Fomento Angola | Banca | Abertura de contas totalmente digital nos balcões. A tecnologia é um dos maiores orçamentos do banco, com investimento em cibersegurança. **Confirmar de que fonte vem.** | [BFA](https://bfa.ao/media/5265/bfa-apresentacao-institucional.pdf), [RTP África](https://rtpafrica.rtp.pt/?p=31654) |
| `innovation-makers` | Innovation Makers | Integração de sistemas | Parceira local do BAI na troca do sistema central (integração e migração de dados). | [Ver Angola (2025)](https://www.verangola.net/va/pt/082025/BancaSeguros/45433/BAI-inicia-programa-de-transforma%C3%A7%C3%A3o-de-sistemas-de-informa%C3%A7%C3%A3o.htm) |
| `inovflow` | Inovflow | Software de gestão (ERP) | Empresa portuguesa. Abriu escritório em Talatona em setembro de 2025, com 13 pessoas. É parceira da Cegid Primavera. | [Ver Angola (2025)](https://www.verangola.net/va/en/092025/Technology/45820/Portuguese-technology-company-Inovflow-enters-the-Angolan-market.htm) |
| `primavera` | Cegid Primavera | Software de gestão (ERP) | Em 2015 deu formação intensiva em Luanda a desempregados, por falta de gente qualificada no seu software. | [Ver Angola (2015)](https://www.verangola.net/va/pt/092015/Tecnologia/2268/Primavera-tecnológica-convida-desempregados-a-duas-semanas-de-formação-intensiva.htm) |
| `sonangol` | Sonangol | Petróleo e gás | Parceira na criação do ISPTEC. | [Baguete (2012)](https://baguete.com.br/public/noticias/brasileiros-implantam-instituto-tecnologico-em-angola) |
| `siemens` | Siemens | Engenharia e automação | Instalou um laboratório de automação no ISPTEC (2017). | [Ver Angola (2017)](https://www.verangola.net/va/pt/112017/CulturaEducacao/10156/Siemens-leva-tecnologia-inovadora-ao-ISPTEC-com-inauguração-de-laboratório-de-automação.htm) |

Acrescentadas a 25/10/2026. A fonte de cada uma é o próprio site, por isso só dizem o que a empresa diz de si:

| id | Nome | Setor | O que está confirmado | Fonte |
|---|---|---|---|---|
| `banco-bic` | Banco BIC | Banca | Banco comercial angolano. | [Site](https://www.bancobic.ao) |
| `standard-bank` | Standard Bank Angola | Banca | Banco do grupo sul-africano Standard Bank. | [Site](https://www.standardbank.co.ao) |
| `atlantico` | Banco Millennium Atlântico | Banca | Banco comercial angolano. | [Site](https://www.atlantico.ao) |
| `banco-sol` | Banco Sol | Banca | Banco comercial angolano. | [Site](https://www.bancosol.ao) |
| `emis` | EMIS | Tecnologia (pagamentos) | Empresa Interbancária de Serviços; gere a rede Multicaixa. | [Site](https://emis.ao) |
| `multitel` | Multitel | Telecomunicações | Internet e serviços de telecomunicações. | [Site](https://www.multitel.co.ao) |
| `paratus` | Paratus Angola | Telecomunicações | Grupo da África Austral: fibra, satélite e centros de dados. | [Site](https://paratus.africa) |
| `tv-cabo` | TV Cabo Angola | Televisão | Televisão por cabo e internet por fibra. | [Site](https://tvcabo.ao) |
| `zap` | ZAP | Televisão | TV por satélite; diz ser o maior operador do género em Angola. | [Site](https://www.zap.co.ao) |
| `taag` | TAAG Angola Airlines | Transportes | Companhia aérea; diz voar para mais de 35 destinos. | [Site](https://flytaag.com) |
| `bci` | BCI, Banco de Comércio e Indústria | Banca | Dá as Bolsas de Excelência: até 200 por ano (50 por curso) em Medicina, Economia, Direito e Agronomia, com a UPRA, a Unipiaget, a UCAN e a ULAN. | [Expansão (2024)](https://expansao.co.ao/universidade/interior/bci-atribui-bolsas-de-estudo-a-melhores-estudantes-universitarios-118622.html), [Ver Angola (2024)](https://www.verangola.net/va/pt/102024/Educacao/41929/BCI-e-Universidade-Lueji-A'nkonde-juntam-se-para-conceder-bolsas-de-estudo.htm) |
| `mca` | Grupo MCA | Energia | Grupo português de construção e energia: sete centrais solares em seis províncias e electrificação rural. Dá bolsas a alunos de engenharia do ISPTEC (2026/27) e da UAN (2024/25). | [Ver Angola (2020)](https://www.verangola.net/va/pt/112020/Energia/22753/Grupo-português-MCA-investe-mais-de-600-milhões-em-sete-centrais-solares.htm), [Ver Angola (2023)](https://www.verangola.net/va/pt/112023/Energia/37880/Grupo-português-MCA-leva-eletricidade-a-mais-de-200-mil-casas-nas-províncias.htm) |

Imagens das empresas (25/10/2026), em `apps/web/src/assets/companies/`: 17 logótipos e 13 banners.

- Dos sites oficiais (precisam de autorização antes de publicar): a maioria dos logótipos, o logótipo branco da Sonangol (mostrado sobre preto) e os banners de Africell, BFA, Banco BIC, EMIS, Multitel, Paratus, Primavera, Sonangol, Standard Bank, TAAG e TV Cabo.
- Do Wikimedia Commons, com licença livre: os logótipos da Angola Cables e da Siemens (domínio público), da Africell (Lulucylulucy, CC BY-SA 4.0) e da TAAG (CC BY-SA 4.0); as fotos do BAI (BAI, CC0), da sede da Siemens (Álvaro de la Paz Franco, CC0) e da sede do Atlântico (DiogoC300, CC BY-SA 4.0).
- Sem logótipo (aparecem as iniciais): Movicel, Angola Telecom, Standard Bank, Banco Sol e Innovation Makers. Os sites da Movicel e da Angola Telecom não respondem, e o Commons não tem nada destas cinco.
- Sem foto: Unitel, Movicel, Angola Telecom, Angola Cables, Banco Sol, Innovation Makers, Inovflow e ZAP. Quando há logótipo, o cartão mostra-o grande no lugar da foto.
- Rejeitadas: as fotos de "Banco Sol" e "Unitel" do Commons (são de empresas da Bolívia com o mesmo nome), o banner gerado por IA do Banco Sol e fotos de bancos de imagens. A foto do hero de Empresas é "Luanda Skyline - Angola 2015", de David Stanley (CC BY 2.0, Wikimedia Commons).

As profissões que cada empresa contrata são, na maior parte, a leitura do setor (`SECTOR_CAREERS` em `companies.ts`); a Africell, o BFA, o BAI e a Unitel têm fonte. A app diz qual é o caso.

Páginas de carreiras lidas a 05/11/2026:

- **BAI** ([portal de recrutamento](https://recrutamento.bancobai.ao)): nenhuma vaga aberta; candidatura espontânea e estágio profissional (pede CV e média final do curso). Os anúncios recentes (fechados) dão as profissões: [Ango Emprego (04/2026)](https://angoemprego.com/banco-bai-esta-a-recrutar-vagas-abertas-em-abril-de-2026/) (tesoureiro, gestor de clientes, técnico comercial, subgerente, gerente) e [Jobartis](https://www.jobartis.com/vagas-emprego/BAI+(Banco+Angolano+de+Investimentos)) (cibersegurança e segurança Swift 5 anos de experiência, compliance 5, capital humano 3, organização e qualidade 2, assessor da comissão executiva 8; sem data).
- **BFA** ([careers.bfa.ao](https://careers.bfa.ao)): nenhuma vaga aberta. Publica dois programas: [Futuro BFA](https://careers.bfa.ao/lp/%23Futuro%20BFA/dfd879f1e9b8e653/?locale=pt_PT) (trainee pago, ~12 meses, em regra de 2 em 2 anos; seleção: triagem, provas de conhecimentos, perfil comportamental, entrevista ou dinâmica de grupo) e o [Programa de Estágios](https://careers.bfa.ao/lp/%23PROGRAMA%20DE%20EST%C3%81GIOS/9fcca1f1acbeae67/?locale=pt_PT) (3 meses, não pago, finalistas e recém-licenciados com mais de 18 anos e sem experiência; candidaturas em janeiro–fevereiro e agosto–setembro). Falta passá-los para `internships.ts`.
- **Unitel**: o site não tem página de carreiras que responda. A candidatura espontânea (portal SuccessFactors da Unitel, vista no [beBee](https://bebee.com/ao/jobs/oportunidades-de-carreira-candidatura-espontanea-unitel-luanda--ss-ao-h4md4k), até 09/11/2026) lista 11 áreas: tecnologia, comercial e serviço ao cliente, compras, marketing e comunicação, jurídico, negócio digital, planeamento estratégico, finanças e auditoria, recursos humanos, risco, fraude e segurança.
- **Banco BIC**: o site não tem página de carreiras e não há anúncios recentes com fonte. Fica com a leitura do setor.

Requisitos reais em `domain/companyNeeds.ts` (`PUBLISHED`): os anos de experiência e a tarefa dos anúncios do BAI (cibersegurança, compliance, recursos humanos) e o processo de seleção do Futuro BFA. O resto (competências, formação) continua estimado.

Setores que contratam gente de tecnologia:

- **Banca.** Segundo o estudo PeopleBank 2025, os bancos aumentaram em cerca de 50% as contratações de TI em seis meses: 595 vagas novas. Mas muitos saíram, e o ganho real foi só de 85 lugares. Fonte: [Forbes África Lusófona](https://forbesafricalusofona.com/?p=161847).
- **Muito pedido:** cibersegurança e análise de dados. O inglês conta nas empresas internacionais. Fonte: [Rivermate (2026)](https://rivermate.com/pt/guias/angola/recrutamento), um guia comercial, por isso serve só como contexto.

### Perfis das empresas (13/11/2026)

Em `apps/web/src/data/demo/companyProfiles.ts`, por id, aplicado a todas as 252 empresas em `data/source.ts`. Notícias em `data/demo/companyNews.ts` (as Novidades têm agora `companies`). Imagens novas em `scrapers/catalog/company_images.csv`.

- **Áreas de atuação** (`activities`, com a fonte): Unitel, Angola Cables, BFA e Sonangol. **Factos com fonte:** fundação da Unitel (1998), do BAI (1996), da Sonangol (1976) e da TAAG (1938); trabalhadores do BFA (2 519 no fim de 2025).
- **Cargos** (`roles`, com o anúncio): Unitel (as 8 áreas da candidatura espontânea), BAI, Africell e Angola LNG. As outras empresas mostram um cargo por profissão, com o aviso "a nossa leitura" (ou "segundo uma fonte pública" quando `careersSourced`).
- **Pessoas** (16 empresas): só presidentes do conselho de administração, presidentes executivos e CEO, cada um com a notícia ou o documento oficial que confirma o cargo. Corrigido na pesquisa: o CEO do BAI é Juvelino Domingos (Ver Angola, 04/11/2026) e o da Azule Energy é Joe Murphy desde 01/12/2025 (site da Azule); a Chevron ficou sem pessoa (nenhuma fonte de Angola com o cargo).
- **LinkedIn:** só quando o título do resultado de pesquisa mostra o mesmo nome e a mesma empresa: Jorge Vazquez (Africell) e Miguel Carneiro (TAAG). O de Ângelo Gama não mostra a empresa no título e ficou de fora. Não há scraping do LinkedIn. Nenhuma foto de pessoa (sem licença livre): aparecem as iniciais.
- **Notícias** (15, datadas, com fonte): Unitel (2), Africell, Angola Cables, BAI, BFA, Sonangol, TAAG (2), Endiama, Catoca, TotalEnergies, Chevron, Angola LNG e ENDE. Os programas para jovens e o memorando PMI–Selenium também ficaram ligados às empresas.
- **Imagens novas** (Wikimedia Commons): logótipos da TotalEnergies, da Chevron e da Endiama (domínio público). Rejeitada outra vez uma foto "Banco Sol" do Commons (é do BancoSol de Santa Cruz, Bolívia). Sem imagem livre: Banco Sol, Standard Bank (logótipo), Movicel, Angola LNG, Azule Energy e Catoca (só imagens de radar).
- **Sem dados novos:** as restantes ~235 empresas (hospitais, ministérios, institutos, escritórios de advogados, empresas dos anúncios). Ficam com o que já tinham; a próxima ronda deve seguir a ordem das mais procuradas.

### Empresas completas e citações dos líderes (20/11/2026)

O objetivo das empresas dentro do Kayé não são os dados institucionais, são **as posições de carreira que a empresa oferece e como lá chegar**, mais o nosso estudo sobre ela. Tudo vive em `apps/web/src/data/demo/`: `companyKinds.ts` (o que cada tipo de negócio contrata e como se entra), `companyDirectory.ts` (factos com fonte e notas por empresa), `companyLinks.ts` (sites e redes lidos nas páginas oficiais). `withProfiles` junta tudo à ficha; o perfil com fonte de 13/11 ganha sempre sobre a nossa leitura.

- **Posições e percurso (as 252 empresas):** cada empresa tem 3 a 7 posições (`roles`) com os requisitos típicos, o percurso passo a passo (`path`) e a escada de progressão (`ladder`, do cargo de entrada ao topo), as carreiras ligadas e as academias de onde vêm as pessoas (`partners`). Vêm de 22 tipos de negócio (banco, telecom, petróleo, electricidade, media, minas, comércio, consultoria, saúde, seguros, transportes, portos, Estado, justiça, advocacia, educação, agricultura, ONG, tecnologia, indústria, construção, hotelaria), escolhidos pelo setor e por algumas regras por id. **Tudo `estimated: true`** (lógica, não declaração da empresa).
- **O nosso estudo** (`insights`, as 252): "Como entrar", "O que valorizam", "Dica Kayé" (estimados) e, quando há fonte, notas factuais: programa de estágios da TIS (77% de contratação em 2017–2025), pilotos cadetes da TAAG (até 70 jovens), reestruturação do Banco Sol (até 30% dos trabalhadores), Standard Bank cotado em bolsa. Os programas e as vagas anunciadas da própria ficha entram como notas com a sua fonte.
- **Imagens (21/11/2026):** as 252 empresas têm pelo menos uma imagem (121 com logótipo e capa, 58 só com capa, 73 só com logótipo). As últimas 90 vieram de uma lista do Eduardo (Google Imagens, conferida à vista; ficaram de fora os cabeçalhos genéricos "Governo de Angola" dos ministérios e logótipos de outros institutos) e, para 15 empresas sem imagem pública (só têm vagas nos sites de emprego), de um logótipo genérico do setor (balança, balão de fala, folha, saco, capelo, fábrica, camião, pasta; `status` `generated`). Antes disso (20/11/2026): 162 de 252, 90 sem nenhuma. Três vias: páginas oficiais (og:image e logótipo do cabeçalho), Wikimedia Commons com licença livre e, para o resto, o Bing Imagens no Chrome (extensão Claude in Chrome), com cada imagem conferida à vista numa folha de contactos antes de entrar. Registadas em `scrapers/catalog/company_images.csv` (`source_type` = official, wikimedia ou search). Rejeitadas: capas genéricas dos portais do Governo (e o cabeçalho "Governo de Angola" que fazem de logótipo dos ministérios; só o IDA tinha logótipo próprio), fotos de outras empresas com o mesmo nome (Prestigio, Boavida Healthcare, Pimm's), cartazes de vagas e fotos com marca de água. As imagens que não são do site oficial (sobretudo de imprensa) precisam de autorização ou substituição antes de a app ser pública.
- **Factos com fonte:** 77 empresas com site (antes 20), 46 com redes (antes 1), 19 com áreas de atuação, 13 com fundação, 14 com sede, 22 com líderes e 5 com citações (`quotes`: Banco Sol, BAI, Standard Bank, Access Bank Angola e TIS), todas copiadas das entrevistas e confirmadas no texto da página (Forbes África Lusófona e Expansão), com data, meio e ligação.
- **Líderes novos (com fonte e data):** Luís Teles (Standard Bank), Osvaldo Macaia e António André Lopes (Banco Sol), Cláudio Pinheiro Macedo (BPC, mandato 2022/2026), Ricardo Ferreira (Access Bank), Joe Murphy (Azule Energy), Pedro Afonso (PRODEL, 2023), António Sebastião Lino (RNA), Leonildo Manuel (AGT) e William de Oliveira (TIS).
- **Sem dados:** sede e fundação da maior parte das empresas (nenhuma fonte), líderes da ENDE, Angola Telecom, TPA e TV Cabo (nomeações antigas), citações verificáveis de Unitel, Sonangol, TAAG, BFA, BIC e dos outros meios pedidos (Novo Jornal, Jornal de Angola, TPA, TV Zimbo, O Telegrama).
- **Falta no servidor:** a API ainda não guarda `headquarters`, `quotes`, `insights`, `estimated`, nem `path`, `ladder` e `requirements` dos cargos (só o frontend demo os tem); a página das citações é o prompt 4.

## Empresa → carreiras

| Empresa | Carreiras | Base |
|---|---|---|
| `africell` | `tecnico-de-telecomunicacoes`, `comercial-de-ti` | fonte (áreas técnicas e comerciais, 2021) |
| `bfa` | `analista-de-ciberseguranca` | fonte (investimento em cibersegurança) |
| `bai` | `gestor-de-clientes-bancario`, `tesoureiro`, `tecnico-comercial`, `analista-de-ciberseguranca`, `tecnico-de-compliance`, `tecnico-de-recursos-humanos` | fonte (anúncios, 2026 e anteriores) |
| `bai` | `analista-de-sistemas`, `administrador-de-base-de-dados`, `gestor-de-projetos-de-ti` | editorial (projeto do sistema central) |
| `unitel` | `tecnico-de-telecomunicacoes`, `engenheiro-de-telecomunicacoes`, `gestor-comercial`, `tecnico-comercial`, `tecnico-de-compras`, `gestor-de-marketing`, `gestor-de-marketing-digital`, `assessor-de-comunicacao`, `jurista`, `analista-financeiro`, `auditor-interno`, `tecnico-de-recursos-humanos`, `analista-de-risco`, `analista-de-ciberseguranca` | fonte (áreas da candidatura espontânea, 2026) |
| `innovation-makers` | `analista-de-sistemas`, `administrador-de-base-de-dados`, `engenheiro-de-dados` | editorial (integração e migração de dados) |
| `inovflow`, `primavera` | `analista-de-sistemas`, `tecnico-de-suporte`, `formador-de-tic` | editorial (consultoria e formação em ERP) |
| `movicel`, `angola-telecom` | `engenheiro-de-telecomunicacoes`, `tecnico-de-telecomunicacoes`, `administrador-de-redes` | editorial |
| `angola-cables` | `engenheiro-de-telecomunicacoes`, `administrador-de-redes` | editorial |
| `mca` | `engenheiro-civil`, `engenheiro-electrotecnico`, `engenheiro-mecanico`, `engenheiro-de-energias-renovaveis` | editorial (bolsas de engenharia e centrais solares) |

## Parcerias (empresa ou organismo × instituição)

| De | Para | Ligação | Fonte |
|---|---|---|---|
| `sonangol` | `isptec` | Parceira na criação | [Baguete (2012)](https://baguete.com.br/public/noticias/brasileiros-implantam-instituto-tecnologico-em-angola) |
| `siemens` | `isptec` | Laboratório de automação | [Ver Angola (2017)](https://www.verangola.net/va/pt/112017/CulturaEducacao/10156/Siemens-leva-tecnologia-inovadora-ao-ISPTEC-com-inauguração-de-laboratório-de-automação.htm) |
| `inefop` | `cinfotec` | Tutela | [Capacity4dev](https://capacity4dev.europa.eu/news/formadores-do-inefop-aperfeicoam-conhecimentos-tecnicos-e-pedagogicos-em-diferentes-areas-de-formacao_en) |
| `bci` | `ucan` | Bolsas de Excelência (Economia e Direito) | [Expansão (2024)](https://expansao.co.ao/universidade/interior/bci-atribui-bolsas-de-estudo-a-melhores-estudantes-universitarios-118622.html) |
| `mca` | `isptec`, `uan` | Bolsas de engenharia | [Ver Angola (2026)](https://www.verangola.net/va/pt/052026/Educacao/48842/Alunos-de-mérito-do-ISPTEC-vão-beneficiar-de-bolsas-de-estudo-e-estágios.htm), [Ver Angola (2024)](https://www.verangola.net/va/pt/122024/Educacao/42632/MCA-tem-25-bolsas-para-alunos-da-Faculdade-de-Engenharia-da-UAN-para-ajudar-com-propinas-e-alimentação.htm) |
| `isutic` | Universidade de Luanda | Faz parte desde 2020 | [Wikipedia](https://en.wikipedia.org/wiki/University_of_Luanda) |

## Novidades (notícias com data, fonte e ligações)

| Data | Título | Fala de | Fonte |
|---|---|---|---|
| Out. 2026 | 20 jovens vão estudar mecatrónica na China (protocolo do INEFOP com uma politécnica de Wenzhou) | `inefop`, `cinfotec` | [Ver Angola](https://www.verangola.net/va/pt/102026/Educacao/50429/Angola-vai-enviar-20-jovens-para-formação-em-mecatrónica-na-China.htm), [RTP](https://www.rtp.pt/noticias/mundo/angola-vai-enviar-20-jovens-para-formacao-em-mecatronica-na-china_n1772010) |
| Out. 2026 | Semana Mundial do Espaço: 79 atividades em 17 províncias, 24 420 pessoas | — | [Ver Angola](https://www.verangola.net/va/pt/102026/Tecnologia/50415/Semana-Mundial-do-Espaço-2026-levou-ciência-e-tecnologia-a-milhares-de-angolanos-através-de-79-actividades.htm) |
| Set. 2026 | Ensino superior com menos 50 mil vagas (283 500 em 2026/27) | `uan` e todo o ensino superior | [Ver Angola](https://www.verangola.net/va/pt/092026/Educacao/50069/Ensino-superior-com-menos-50-mil-vagas-para-novo-ano-académico.htm) |
| Ago. 2026 | 774 mil empregos criados entre 2023 e 2026; programa Jovem Mais | — | [Ver Angola](https://www.verangola.net/va/pt/082026/Sociedade/49803/Mais-de-700-mil-empregos-foram-criados-em-Angola-entre-2023-e-2026.htm) |
| Jun. 2026 | BAI no ANGOTIC 2026: a troca do sistema central continua | `bai` | [Ver Angola](https://www.verangola.net/va/pt/062026/BancaSeguros/49113/BAI-reforça-compromisso-com-a-inovação-e-o-desenvolvimento-tecnológico-no-Angotic-2026.htm) |
| Jun. 2026 | Angola tem 28 milhões de utilizadores de telemóveis | `unitel`, `movicel`, `africell` | [Ver Angola](https://www.verangola.net/va/pt/062026/Telecomunicacoes/49095/Angola-tem-28-milhões-de-utilizadores-de-telemóveis-fruto-de-“ambiciosa-modernização-tecnológica”-diz-Governo.htm) |
| Mai. 2026 | O Gabão quer copiar a Escola 42 Luanda | `escola-42-luanda` | [Ver Angola](https://www.verangola.net/va/en/052026/Politics/48741/Gabon's-First-Lady-wants-to-replicate-Luanda's-School-42-in-Libreville.htm) |
| Abr. 2026 | ANGOTIC 2026 dedicado à inteligência artificial e à cibersegurança | `analista-de-ciberseguranca`, `cientista-de-dados` | [Ver Angola](https://www.verangola.net/va/pt/042026/Telecomunicacoes/48580/Angotic-regressa-em-Junho-para-impulsionar-acelera%C3%A7%C3%A3o-digital-em-%C3%81frica.htm) |
| Out. 2025 | Projeto Crescer: 37 mil empregos e 97 569 jovens em competências digitais | — | [Ver Angola](https://www.verangola.net/va/pt/102025/Sociedade/46187/Projecto-Crescer-vai-criar-mais-de-37000-empregos-para-jovens.htm) |
| Set. 2025 | Inovflow abre escritório em Talatona | `inovflow`, `primavera` | [Ver Angola](https://www.verangola.net/va/en/092025/Technology/45820/Portuguese-technology-company-Inovflow-enters-the-Angolan-market.htm) |
| Ago. 2025 | BAI começa a trocar o sistema central do banco | `bai`, `innovation-makers` | [Ver Angola](https://www.verangola.net/va/pt/082025/BancaSeguros/45433/BAI-inicia-programa-de-transforma%C3%A7%C3%A3o-de-sistemas-de-informa%C3%A7%C3%A3o.htm) |
| 2025 | Bancos contratam mais gente de TI, mas muitos saem cedo (PeopleBank) | `bai`, `bfa` e toda a banca | [Forbes África Lusófona](https://forbesafricalusofona.com/?p=161847) |

## Como cheguei aqui

Relatos curtos na página de cada carreira (`apps/web/src/data/demo/testimonials.ts`): o percurso em 2–4 frases (≤ 350 caracteres) e uma dica (≤ 140).

- **Reais**: só de entrevistas ou perfis publicados, resumidos por palavras nossas, com o nome como foi publicado e a fonte. Só entra quem tem uma dica ou opinião publicada (não se inventam conselhos de pessoas reais).
- **Sem fonte**: no máximo 1 relato "Exemplo" por carreira, sem nome (cargo, província, anos de carreira), coerente com o guia da carreira.
- Nunca relatos de menores. Nada de fotografias de pessoas.

| Pessoa | Carreira | Fonte |
|---|---|---|
| Octávio Neto | `chefe-de-cozinha` | [Forbes África Lusófona (2022)](https://forbesafricalusofona.com/?p=39511) |
| Valdemar Txicomba | `chefe-de-cozinha` | [Ver Angola (2015)](https://www.verangola.net/va/pt/062015/Gastronomia/1444/Valdemar-Txicomba-o-chef-que-quer-mostrar-Angola-ao-mundo.htm) |

Os outros 19 são "Exemplo". Candidatos vistos mas sem dica publicada (entram quando houver entrevista): Luzia da Silva, jurista ([ADCA / DLA Piper Africa](https://www.dlapiperafrica.com/pt/angola/people/team/Luzia-da-Silva)); Cláudia Xafredo, recursos humanos ([Ver Angola](https://www.verangola.net/va/pt/102020/Sociedade/22516/HR-Consulting-o-negócio-da-‘one-woman-show’-Cláudia-Xafredo-em-Portugal.htm)). Formulário para enviar relatos: roadmap 1.7.

## Bolsas de estudo

Em `apps/web/src/data/demo/scholarships.ts` (ainda sem ecrã). Verificadas a 03/11/2026. Prazo só quando foi publicado para 2026/27; idade e média só com fonte.

| Fornecedor | Bolsas | Fonte | Por confirmar |
|---|---|---|---|
| INAGBE (internas) | 2 | [Ver Angola (23/10/2026)](https://www.verangola.net/va/pt/102026/Educacao/50458/Candidaturas-às-10500-bolsas-de-estudo-internas-para-ano-lectivo-20262027-abrem-Sexta-feira.htm) | Valor do subsídio |
| INAGBE (externas: Portugal com Camões, Sérvia, Marrocos, Argélia, Brasil, China) | 6 | [Expansão (15/08/2026)](https://expansao.co.ao/universidade/detalhe/portugal-servia-marrocos-e-argelia-disponibilizam-mais-de-600-bolsas-73960.html), [Ver Angola (07/2025)](https://www.verangola.net/va/pt/072025/Educacao/45115/INAGBE-anuncia-abertura-de-candidaturas-para-bolsas-de-estudo-externas-para-licenciaturas-no-Brasil.htm), [Ver Angola (01/2021)](https://www.verangola.net/va/pt/012021/Educacao/23619/China-oferece-40-bolsas-de-estudo-a-estudantes-angolanos.htm) | Prazos e idades de 2027/28; China só tem edital de 2021 |
| Governo da Rússia (quota) | 1 | [Ver Angola (06/2025)](https://www.verangola.net/va/pt/062025/Politica/44716/Embaixador-russo-em-Angola-diz-que-futuro-de-África-é-juventude-que-deve-ser-educada-“com-base-na-verdade-histórica”.htm), [Decreto 177/13](https://lex.ao/docs/presidente-da-republica/2013/decreto-presidencial-n-o-177-13-de-05-de-novembro/) | Prazo oficial 2027/28 |
| Governo da Hungria (Stipendium Hungaricum) | 1 | [stipendiumhungaricum.hu](https://stipendiumhungaricum.hu/apply/) | Prazo 2027/28 e parceiro que nomeia em Angola |
| Governo da Turquia (Türkiye Bursları) | 1 | [turkiyeburslari.gov.tr](https://www.turkiyeburslari.gov.tr) | Calendário 2027 |
| MIREMPET e Embaixada de França | 1 | [Ver Angola (23/10/2026)](https://www.verangola.net/va/pt/102026/Educacao/50527/Abertas-inscrições-para-30-bolsas-de-estudo-em-institutos-franceses-Saiba-como-se-candidatar.htm) | O que cobre |
| DAAD e MIREMPET | 1 | [DAAD (2020)](https://www2.daad.de/der-daad/daad-aktuell/de/75756-neues-regierungsstipendienprogramm-mit-angola/) | Se ainda está activo |
| Fundação Calouste Gulbenkian | 1 | [gulbenkian.pt](https://gulbenkian.pt/en/bolsas-lista/masters-scholarships-for-students-from-palop/) | Concurso 2027 |
| Chevening (Reino Unido) | 1 | [chevening.org](https://www.chevening.org/scholarship/angola/) | — |
| Fulbright (EUA) | 1 | [Ver Angola (2021)](https://www.verangola.net/va/pt/022021/Educacao/24240/EUA-oferecem-bolsas-de-estudo-a-estudantes-angolanos-Candidaturas-já-abriram.htm) | Página da embaixada bloqueada; o que cobre |
| BCI (Bolsas de Excelência) | 1 | [Expansão (2024)](https://expansao.co.ao/universidade/interior/bci-atribui-bolsas-de-estudo-a-melhores-estudantes-universitarios-118622.html) | Edital 2026/27 |
| Grupo MCA (ISPTEC e UAN) | 2 | [Ver Angola (05/2026)](https://www.verangola.net/va/pt/052026/Educacao/48842/Alunos-de-mérito-do-ISPTEC-vão-beneficiar-de-bolsas-de-estudo-e-estágios.htm), [Ver Angola (12/2024)](https://www.verangola.net/va/pt/122024/Educacao/42632/MCA-tem-25-bolsas-para-alunos-da-Faculdade-de-Engenharia-da-UAN-para-ajudar-com-propinas-e-alimentação.htm) | Número de bolsas no ISPTEC; se a da UAN se repete |

O BCI e o Grupo MCA também estão na tabela Empresas (ligados por `companyId`).

Descartadas por falta de fonte com chamada aberta a quem não é funcionário: Sonangol (só relatórios de bolsas dadas), Unitel (curso de uma semana, não bolsa), Mastercard Foundation e União Africana (sem chamada confirmada para Angola), Erasmus Mundus e Campus France (depende de cada curso).

## Estágios e programas de trainee

Em `apps/web/src/data/demo/internships.ts` (ainda sem ecrã). Verificados a 04/11/2026. Idade, remuneração, duração e prazo só com fonte; prazo só quando foi publicado para 2026/27.

| Fornecedor | Programas | Fonte | Por confirmar |
|---|---|---|---|
| INEFOP (Jovem+, Banco Mundial) | 1 | [Ver Angola (06/2026)](https://www.verangola.net/va/pt/062026/Sociedade/49154/Governo-lança-projecto-para-beneficiar-500-mil-jovens-até-2030-que-conta-com-financiamento-de-250-milhões-do-Banco-Mundial.htm), [Forbes África Lusófona](https://forbesafricalusofona.com/?p=176318) | Valor da bolsa e duração |
| ANPG, Azule Energy e Bloco 18 (DW Angola) | 1 | [Expansão (01/2026)](https://expansao.co.ao/universidade/detalhe/dw-angola-abre-150-vagas-de-estagios-profissionais-para-universitarios-69393.html), [Ver Angola (11/2024)](https://www.verangola.net/va/pt/112024/Sociedade/42202/ANPG-candidaturas-para-estágios-arrancam-Terça-feira-e-vão-beneficiar-mais-de-100-universitários.htm) | Prazo da edição 2026/27; valor do subsídio |
| Unitel e INEFOP | 1 | [Ver Angola (04/2024)](https://www.verangola.net/va/pt/042024/Sociedade/39657/INEFOP-e-Unitel-juntos-na-oferta-de-oportunidades-de-estágio-profissional-aos-jovens.htm) | Se o memorando continua; duração e pagamento |
| TAAG (Take off with TAAG) | 2 | [Ver Angola (01/2025)](https://www.verangola.net/va/pt/012025/Transportes/42886/TAAG-promove-programa-de-estágios-e-tem-60-vagas-para-candidatos-‘levantarem-voo’.htm), [Brasilturis (03/2026)](https://brasilturis.com.br/2026/03/23/taag-e-h2air-firmam-parceria-para-formacao-tecnica-em-aviacao/) | Pagamento; como e quando candidatar |
| Africell (Caminho do Bem) | 1 | [Africell (04/2026)](https://www.africell.com/?p=3767) | Idade, pagamento, como candidatar |
| BAI | 1 | [BAI](https://bancobai.ao/en/about-us/press/news/programa-de-estagio) | Página sem data (bloqueia leitura automática); edição 2026 |
| Access Bank Angola (ELTP) | 1 | [Ver Angola (04/2026)](https://www.verangola.net/va/pt/042026/Educacao/48316/Access-Bank-lança-nova-edição-de-programa-de-formação-de-jovens-talentos-angolanos-Candidaturas-abertas-até-dia-13.htm), [Ver Angola (08/2025)](https://www.verangola.net/va/pt/082025/BancaSeguros/45547/Access-Bank-lança-programa-de-estágio-remunerado-para-recém-licenciados.htm) | Valor do subsídio |
| Sanlam Angola | 1 | [Expansão (10/2024)](https://expansao.co.ao/universidade/detalhe/sanlam-abre-programa-de-estagios-remunerados-para-universitarios-62727.html) | Se houve 2.ª edição |
| Grupo MCA (ISPTEC) | 1 | [Ver Angola (05/2026)](https://www.verangola.net/va/pt/052026/Educacao/48842/Alunos-de-mérito-do-ISPTEC-vão-beneficiar-de-bolsas-de-estudo-e-estágios.htm) | Vagas, duração, pagamento |
| TotalEnergies EP Angola (Young Graduate) | 1 | [Les Opportunités](https://www.lesopportunites.com/opportunite/angola/stages/comptabilite-audit/appel-a-candidatures-programme-de-stages-totalenergies-aucune-experience-requise/) | Anúncio oficial já fora do ar (404); data e idade |
| KPMG Angola | 1 | [KPMG Angola](https://kpmg.com/ao/pt/carreiras/recem-graduados.html) | Prazo e requisitos da edição 2027 |
| Mota-Engil (Start@ME) | 1 | [Executive Digest (07/2026)](https://executivedigest.sapo.pt/mota-engil-abre-programa-de-estagios-em-portugal-angola-brasil-e-mais-13-paises/), [Mota-Engil](https://careers.mota-engil.com/job/All-over-the-world%21-StartME-2026-ET-AA/1408153933/) | Prazo (agregadores dizem Julho, a notícia diz fim de Agosto); vagas em Angola |

Descartados: Sonangol, Chevron, ExxonMobil, Endiama, Catoca, BFA, BIC, Atlântico, Standard Bank (só 2017), Refriango, ENSA, Deloitte (só 2022), PwC e EY (nenhum programa em Angola com fonte de 2025–2026); programa Criar da AECIPA (só 2023–2024); Assembleia Nacional (anunciado para 2027); internato médico (é especialização, não estágio); hospitais e clínicas do catálogo de saúde (nenhuma chamada publicada); Imbono NextGem (fonte fora do domínio oficial).

## Apoios para trabalhar por conta própria

Em `apps/web/src/data/demo/supportPrograms.ts`; aparecem na carreira, separador "Como lá chegar", secção "Trabalhar por conta própria". Verificados a 05/11/2026. Só entram apoios com fonte de 2025–2026. A idade mínima só aparece quando a fonte a dá ou quando a lei a impõe (registar empresa ou assinar com um fundo pede 18 anos).

| Apoio | Tipo | Fonte | Por confirmar |
|---|---|---|---|
| Guiché Único da Empresa (GUE) | Registo | [Expansão (2026)](https://expansao.co.ao/empresas/detalhe/angolanos-criaram-mais-de-160-empresas-por-dia-no-i-trimestre-71554.html), [Forbes África Lusófona (2025)](https://forbesafricalusofona.com/?p=154604) | Custo actual por tipo de empresa |
| INAPEM (certificação e capacitação de MPME) | Formação | [Ver Angola (04/2025)](https://www.verangola.net/va/pt/042025/Industria/44185/Já-são-conhecidas-as-empresas-vencedoras-da-1ª-edição-do-Prémio-Nacional-às-MPME.htm), [Expansão](https://expansao.co.ao/empresas/detalhe/quase-metade-das-mpmes-certificadas-sao-do-comercio-71773.html) | Como pedir o certificado |
| Empodera Ela (INAPEM e Banco Atlântico) | Formação | [Ver Angola (03/2026)](https://www.verangola.net/va/pt/032026/Industria/48217/‘Empodera-Ela’-projecto-de-empreendedorismo-feminino-vai-capacitar-3000-empreendedoras.htm) | Como candidatar; idade |
| JOBE: kits e microcrédito (INEFOP, FUNEA) | Kit | [MAPTSS (02/2025)](https://www.maptss.gov.ao/2025/02/08/cerca-de-2-000-cidadaos-vao-beneficiar-de-kits-profissionais-microcreditos-e-estagios-profissionais/), [INEFOP](https://www.inefop.gov.ao/auth/informationDissemination-details/1bae4d71-6f74-429e-9875-b663f24a8b63) | Idade e critérios; denúncias de desvio de kits em Luanda (05/2026, por confirmar) |
| FACRA (capital de risco) | Crédito | [Ver Angola (01/2026)](https://www.verangola.net/va/pt/012026/Industria/47553/INAPEM-e-FACRA-juntam-se-para-facilitar-acesso-de-empresas-a-financiamento.htm), [Forbes África Lusófona](https://forbesafricalusofona.com/?p=168112) | Se já passou a Fundo de Capital de Risco (OGE 2025) |
| Fundo de Inovação Orange Corners (DW Angola, KixiCrédito) | Crédito | [Forbes África Lusófona (03/2026)](https://forbesafricalusofona.com/?p=169347) | Idade; prazos |
| Orange Corners Angola (Acelera Angola) | Incubadora | [Orange Corners](https://www.orangecorners.com/story-of-systematic-change/), [Concours (2025)](https://concoursn.com/?p=428902) | Prazo da próxima edição |
| Sonajovem 5.0, incubadora SPACIUM (Sonangol, ISPTEC) | Incubadora | [Forbes África Lusófona (07/2025)](https://forbesafricalusofona.com/sonangol-inaugura-incubadora-para-acelerar-talentos-empreendedores-em-angola/) | Se abre nova edição |
| PREI: Janela Única e microcrédito (Decreto Presidencial n.º 148/25) | Registo | [Ver Angola (06/2025)](https://www.verangola.net/va/pt/062025/Economia/44945/Governo-reestrutura-programa-de-reconversão-da-economia-informal.htm), [Expansão](https://expansao.co.ao/angola/detalhe/nova-roupagem-do-prei-privilegia-acesso-ao-credito-66825.html) | Onde fica a Janela Única em cada província; condições do crédito |
| Kwenda: inclusão produtiva (FAS) | Crédito | [Banco Mundial (05/2025)](https://www.worldbank.org/pt/news/feature/2025/05/22/breaking-the-cycle-of-poverty-in-angola-through-cash-transfers-afe.print), [ANGOP](https://angop.ao/en/noticias/sociedade/inclusao-produtiva-com-indicadores-positivos) | Se jovens fora das famílias do Kwenda podem entrar |
| Projecto Crescer (Banco Mundial e BAD, 15–35 anos) | Formação | [Ver Angola (10/2025)](https://www.verangola.net/va/pt/102025/Sociedade/46187/Projecto-Crescer-vai-criar-mais-de-37000-empregos-para-jovens.htm), [Forbes África Lusófona](https://forbesafricalusofona.com/?p=163792) | Províncias e como candidatar (formação a começar em 2026) |

Descartados: Balcão Único do Empreendedor como apoio à parte (nenhuma fonte de 2025–2026; o registo faz-se hoje no GUE e na Janela Única do PREI; `/sem-universidade` só o cita como origem, com o Decreto Presidencial n.º 84/14); PAPE (últimos números de 2023; os kits passaram para o JOBE); Projecto de Apoio ao Crédito (o BDA suspendeu-o em 2025, [Ecos e Factos](https://www.ecosefactos.com/bda-preve-retomar-financiamentos-ao-sector-produtivo-em-2026/)); Unitel Go (última edição com fonte em 2023); incubadoras da UAN e da UCAN (nenhuma fonte).

O conteúdo por carreira (`apps/web/src/data/demo/selfEmployment.ts`: se é comum, como se faz, custo de arranque, passos e licenças) é **estimado** pela Kayé (`estimated: true`); falta confirmá-lo com profissionais e com as ordens e licenças de cada área.

## Sem universidade: ofícios e economia informal (13/11/2026)

Página `/sem-universidade` (`apps/web/src/features/noDegree/`) e os ofícios em `apps/web/src/data/demo/tradeCareers.ts`.

| O quê | Fonte | Por confirmar |
|---|---|---|
| Pavilhão de Artes e Ofícios dos Ramiros (Belas, Luanda), INEFOP: construção civil, corte e costura, culinária e pastelaria, mecânica auto, electricidade, carpintaria, marcenaria, canalização | [Ver Angola (13/10/2026)](https://www.verangola.net/va/pt/102026/Sociedade/50392/Pavilh%C3%A3o-de-forma%C3%A7%C3%A3o-profissional-dos-Ramiros-abre-portas-para-qualificar-1000-formandos-por-ciclo.htm) | Os outros 4 dos 13 cursos; preço; datas dos ciclos |
| Centro de Formação Profissional 1.º de Maio (Uíge), INEFOP: canalização, electricidade de baixa tensão, serralharia de construção civil | [Decreto Executivo n.º 149/23 (AngoLEX)](https://angolex.com/paginas/decreto-executivo/estatuto-organico-do-centro-de-formacao-profissional-1a-de-maio-149a-23a.html) | Se os cursos continuam; duração |
| Centro de Formação Profissional Feminino (Rangel, Luanda), INEFOP: cabeleireiro e barbeiro, corte e costura, cozinha e pastelaria, massagem e estética | [Decreto Executivo n.º 186/23 (Diário da República, 31/08/2023)](https://faolex.fao.org/docs/pdf/ang221175.pdf) | Se aceita rapazes; duração |
| Passos do informal ao formal: GUE, PREI (Decreto Presidencial n.º 148/25), NIF na AGT, conta bancária, INSS (Decreto Presidencial n.º 110/22) | [GUE](https://www.gue.gov.ao), [Ver Angola (06/2025)](https://www.verangola.net/va/pt/062025/Economia/44945/Governo-reestrutura-programa-de-reconversão-da-economia-informal.htm), [Portal do Contribuinte](https://portaldocontribuinte.minfin.gov.ao), [lex.ao](https://lex.ao/docs/presidente-da-republica/2022/decreto-presidencial-n-o-110-22-de-12-de-maio/) | Custos e prazos de cada registo; o regime do INSS para quem trabalha por conta própria |
| Fotos dos 14 ofícios | Wikimedia Commons, Wiki Loves Africa (CC BY-SA 4.0), créditos em `data/demo/images.ts` | — |

**Estimado** (`estimated: true`): a procura dos 14 ofícios (os sites de emprego quase não os anunciam), a duração e o custo dos cursos curtos e o custo de arranque por conta própria. Sem salários: nenhuma tabela pública.

Não encontrado: uma lista oficial e actual dos centros do INEFOP com os cursos de cada um (o INEFOP diz ter 46 centros só em Luanda); cursos de frio e de energia solar com centro e data (uma apresentação do INEFOP cita-os como "cursos inovadores", sem centro); as regras angolanas da carta de condução profissional (só o Código da Estrada de 2008 e a plataforma online do Ministério do Interior, 2025).

## Formação online grátis

Em `apps/web/src/data/demo/freeCourses.ts` (35 cursos grátis e 10 certificações pagas), na tab "Percurso" de cada carreira: "Começa já, sem pagar" e "Certificações a preço baixo" (até 4 cartões cada). Preço em dólares só quando o fornecedor publica um preço único. Verificados a 05/11/2026 nas páginas oficiais. Horas e certificado só com fonte; `certificate: null` quando nenhuma fonte diz o que o curso dá no fim. Os cursos em português e os de certificado grátis aparecem primeiro.

| Fornecedor | Cursos | Certificado | Fonte | Por confirmar |
|---|---|---|---|---|
| Cisco Networking Academy | 7 | Badge digital grátis (Credly) em Introdução à Cibersegurança e Networking Basics | [NetAcad](https://www.netacad.com/courses/networking-basics), [Credly](https://www.credly.com/org/cisco) | Badge ou certificado dos outros 5 (páginas só com JavaScript); versões em português além da cibersegurança |
| Microsoft Learn | 6 | Nenhum: troféu no perfil (os exames AZ-900, SC-900, DP-900 são pagos) | [FAQ](https://learn.microsoft.com/pt-pt/training/support/faq) | Horas de cada percurso |
| Khan Academy (pt) | 7 | Nenhum | [Sobre](https://pt.khanacademy.org/about), [Ajuda](https://support.khanacademy.org/hc/de/community/posts/360018979011/comments/360002024411) | — |
| freeCodeCamp | 7 | Certificação verificada grátis | [freeCodeCamp (2025)](https://www.freecodecamp.org/news/freecodecamps-new-responsive-web-design-certification-is-now-live/) | Horas (a fonte só diz "centenas de horas"); exames só em inglês |
| Google Skillshop | 2 | Certificação de produto grátis (Ads, Analytics) | [Skillshop](https://skillshop.withgoogle.com/intl/pt-BR_ALL/), [Reliablesoft](https://www.reliablesoft.net/google-skillshop-review/) | Página oficial do Google que diga "grátis" |
| NAU (Portugal) | 2 | Certificado de participação grátis (política da NAU); o do IPT por confirmar | [Política de certificação](https://www.nau.edu.pt/pt/legal/politica-de-certificacao) | Se o curso do IPT tem custo |
| OpenWHO (OMS) | 1 | Nenhum (deixou de emitir) | [FAQ](https://openwho.org/faq), [OMS (05/2023)](https://www.who.int/news/item/24-05-2023-strengthening-influenza-preparedness-through-an-openwho-online-course) | Lista atual dos cursos em português |
| The Odin Project | 2 | Nenhum | [FAQ](https://www.theodinproject.com/faq) | — |
| AWS Skill Builder | 1 | Por confirmar | [AWS](https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/) | Versão em português; badge |

Certificações pagas e baratas:

| Fornecedor | Certificações | Preço (USD) | Fonte | Por confirmar |
|---|---|---|---|---|
| AWS | Cloud Practitioner, Solutions Architect Associate, DevOps Engineer Professional | 100, 150, 300 | [Preços](https://aws.amazon.com/certification/policies/before-testing/), [Cloud Practitioner](https://aws.amazon.com/certification/certified-cloud-practitioner/), [DevOps](https://aws.amazon.com/certification/certified-devops-engineer-professional/) | Línguas do Solutions Architect; câmbio |
| Microsoft | AZ-900 | 99 nos EUA (varia por país) | [Microsoft Learn](https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/), [MSCertQuiz](https://mscertquiz.com/blog/is-az-900-worth-it) | Preço para quem faz o exame a partir de Angola |
| Google Cloud | Associate Cloud Engineer | 125 | [Google Cloud](https://cloud.google.com/learn/certification/cloud-engineer) | — |
| Python Institute | PCEP | 59 | [Python Institute](https://pythoninstitute.org/pcep), [Open Exam Prep](https://open-exam-prep.com/blog/openedg-pcep-certified-entry-level-python-programmer-exam-guide-2026) | Preço na loja oficial (a página só diz que depende da moeda) |
| Udemy | Curso Web Moderno (Cod3r, pt), 100 Days of Code, AWS Cloud Practitioner (Maarek), Complete SQL Bootcamp | Varia por país e com promoções | [Udemy: preços](https://support.udemy.com/hc/en-us/articles/229606248-Udemy-Course-Pricing-Learner-FAQ) | Horas (as páginas bloqueiam leitura automática); o certificado de conclusão não é acreditado |

Descartados (pagos): ISC2 CC (o exame grátis acabou em Maio de 2026; agora 199 USD, só fontes secundárias), Cisco CCST (preço só num blogue), certificados Google/Meta no Coursera (assinatura mensal por confirmar).

Descartados: Escola Virtual da Fundação Bradesco (o registo pede CPF, o que pode bloquear quem está em Angola; não diz se o certificado é grátis); Coursera e edX (sem modo grátis confirmado com certificado); percursos do Microsoft Learn retirados (Python, web e Git para iniciantes redireccionam para o catálogo). Alvo de 40–60 cursos: faltam saúde e áreas fora da tecnologia em português.

## Acesso ao ensino superior (2026/27)

Em `apps/web/src/data/demo/admissions.ts`, mostrado em "Como entrar" (curso e academia), em `/prazos` e em `/exames-de-acesso`. Verificado a 03/11/2026, nos editais das instituições (muitos são PDF digitalizados) e nos calendários do MESCTI. Datas, vagas e taxas só com fonte. Nenhuma fonte publica a nota do último colocado, por isso `minGrade` está vazio em todos.

| Instituição | Registos | Fonte | Por confirmar |
|---|---|---|---|
| MESCTI (calendário nacional) | 1 | [Decreto Executivo 135/26](https://angolex.com/paginas/decreto-executivo/calendario-do-ano-academico-2026a2027a-das-instituicoes-de-ensino-superior-135a-26a.html), [Forbes África Lusófona (11/09/2026)](https://forbesafricalusofona.com/ensino-superior-reduz-50-mil-vagas-em-angola-no-proximo-ano-academico/) | Datas de inscrição (cada instituição marca as suas) |
| MESCTI, DNES (exames nacionais de formação de professores) | 2 | [Calendário (24/07/2026)](https://isced.edu.ao/wp-content/uploads/2026/08/CALENDARIO-DAS-PROVAS-DOS-EXAMES-DE-ACESSO-2026-2027.pdf), [Calendário excepcional (30/09/2026)](https://isced.edu.ao/wp-content/uploads/2026/10/CALENDARIO-EXCEPCIONAL-DE-EXAMES-NACIONAIS-DE-ACESSO-1-a-CHAMADA.pdf) | Que disciplinas cabem a cada curso |
| `uan` | 3 (exactas, saúde, sociais) | [Exame de Acesso 2026](https://www.uan.ao/detalhes/noticia/exame-de-acesso-2026), [cursos](https://www.uan.ao/detalhes/noticia/cursos-disponiveis-para-os-exames-de-acesso-2026), [tópicos](https://uan.ao/sobre-uan/admissao) | Vagas: 3810 (comunicado de 24/07) ou 3900 (nota de 13/08); ficou omitido. Disciplinas são por área, não por curso |
| `universidade-de-luanda` (INSTIC) | 1 | [INSTIC](https://instic.uniluanda.ao/exame-de-acesso-2/) | Cursos do INSTIC (pus os de informática e telecomunicações); se o INSTIC é o antigo ISUTIC; disciplinas; vagas |
| `isptec` (pólo de Cabinda) | 1 | [Edital (08/10/2026)](https://isptec.co.ao/public/assets/uploads/docs/edital-exame-acesso-2026-2027-polo-cabinda.pdf) | O exame de Luanda: a página do ISPTEC não abriu |
| `instituto-superior-de-ciencias-de-educacao-de-luanda` (ISCED Luanda) | 2 | [Processo de acesso](https://isced.edu.ao/2026/07/31/informacoes-sobre-o-processo-de-candidatura-para-o-ano-academico-2026-2027/), [excepcional](https://isced.edu.ao/2026/10/01/exames-nacionais-excepcionais-de-acesso-aos-cursos-de-formacao-de-educadores-de-infancia-e-de-professores-ano-academico-2026-2027/) | Taxa; vagas da chamada excepcional |
| `ucan` | 2 (informática, economia) | [Tópicos 2026](https://www.ucan.co.ao/topicos-para-os-exames-de-acesso/) | Datas, taxa e vagas: só o LinkedIn diz que as inscrições abriram; Direito e Petróleos (PDF sem disciplinas legíveis) |
| `universidade-independente-de-angola` (UnIA) | 1 | [Calendário 2026/2027](https://unia.ao/wp-content/uploads/2026/08/Calendario-Academico-2026-2027.pdf) | Disciplinas (os tópicos publicados são de 2025/26); taxa; vagas |
| `universidades-jean-piaget` | 1 | [Calendário 2026/2027](https://www.unipiaget-angola.org/upload/formularios/calendario/CALENDA%CC%81RIO%20_DO_ANO_ACADE%CC%81MICO_2026-2027.pdf) | Disciplinas, taxa, vagas |

Procuradas sem nada de 2026/27: Universidade Metodista, Lusíada, UTANGA, Óscar Ribas, Gregório Semedo, Universidade Privada de Angola, ISUTIC (site com certificado errado), Mandume ya Ndemufayo e Katyavala Bwila (só regulamentos antigos). ANGOP e Jornal de Angola não apareceram nas pesquisas.

### Banco de perguntas dos exames de acesso (15/11/2026)

Em `apps/web/src/data/demo/accessExams/`, um ficheiro por disciplina, usado em `/exames-de-acesso`. Todas as perguntas e textos são **originais**, escritos pelo Kayé ao nível do programa: nenhuma foi copiada de exames, sebentas ou livros. As perguntas estão em português (a língua do exame) e seguem o Acordo Ortográfico de 1990, como o resto da app; as de ortografia só usam palavras que se escrevem da mesma maneira antes e depois do acordo.

| Disciplina | Perguntas | Temas |
|---|---|---|
| Matemática | 126 | Álgebra, funções, equações e inequações, geometria, trigonometria, estatística e probabilidades (21 cada) |
| Língua Portuguesa | 134 | Interpretação de texto (8 textos curtos originais e figuras de estilo), gramática, ortografia, vocabulário |
| Física, Química, Biologia, História, Geografia | 0 | Aparecem como "em breve" |

Referência dos temas: os programas oficiais do II ciclo do ensino secundário geral (10.ª, 11.ª e 12.ª classes) de Matemática e de Língua Portuguesa, do INIDE/MED, e os tópicos publicados para 2026/27 pela [UAN](https://uan.ao/sobre-uan/admissao) e pela [UCAN](https://www.ucan.co.ao/topicos-para-os-exames-de-acesso/). Por fazer: confirmar tema a tema contra o PDF dos programas do INIDE e pôr aqui a ligação; escrever as outras disciplinas, uma de cada vez.

## Contexto do ensino superior (2026/27)

- 283 500 vagas, menos 50 000 que no ano anterior. As aulas começaram a 5 de outubro.
- A descida vem da avaliação e acreditação dos cursos: mais de 250 cursos foram suspensos em abril de 2025.
- A rede tem 31 instituições públicas e 75 privadas, com 1305 cursos.

Fonte: [Ver Angola](https://www.verangola.net/va/pt/092026/Educacao/50069/Ensino-superior-com-menos-50-mil-vagas-para-novo-ano-académico.htm).

Isto importa para o Kayé: antes de mostrar uma oferta real, temos de confirmar que o curso está acreditado e aberto em 2026/27.

## Educação (para o Mercado)

O Mercado compara, área a área, o que o trabalho pede com quantas pessoas se formam.

**Já no Mercado**, do [Anuário Estatístico do Ensino Superior 2023-2024](https://ine.gov.ao/Arquivos/arquivosCarregados//Carregados/Publicacao_639215989476277608.pdf) (MESCTI, publicado pelo INE em agosto de 2026), lido por `scrapers/education/anuario.py` para `apps/web/src/data/market/education.json`:

| O quê | Quadro | Confere com |
|---|---|---|
| Diplomados por instituição e curso | 2.4 a 2.6 | Total do quadro (31 503) |
| Diplomados por província, públicas e privadas somadas | 2.8 e 2.9 | 18 províncias, total 31 503 |
| Estudantes por curso | 5.7 | Total do quadro e Quadro 1.2 (340 533) |
| Candidatos e admitidos por curso, somados por área | 4.4 | 197 463 candidatos (Quadro 1.2) e 99 017 admitidos (linha de total) |
| Candidatos, matriculados pela 1.ª vez, estudantes | 1.2 | — |
| Vagas, públicas e privadas | 1.3 | 29 860 + 202 072 = 231 932 |

O anuário **não dá vagas por curso**, só o total do país. Por isso o Mercado mostra "candidatos por cada admitido" por área, não "candidatos por vaga". Atenção: o Quadro 1.2 diz "Número de Vagas 202 072", mas esse é só o das privadas (o Quadro 1.3 e o texto da página 10 dão 231 932).

**Ainda por recolher:**

| O quê | Onde procurar | Notas |
|---|---|---|
| Vagas por curso | MESCTI (editais de acesso de cada instituição) | Não estão no anuário |
| Nível de escolaridade e área de formação da população | INE (censo e inquéritos ao emprego) | Usar só números agregados, com o ano e a ligação |
| Formandos da formação profissional por curso | INEFOP | Sem relatório público com números por curso (ver abaixo) |

**INEFOP (procurado a 05/11/2026), nada por curso:**

- `inefop.gov.ao`: a página inicial não mostra secção de estatísticas nem relatórios.
- Apresentações do INEFOP na [ENAPTSS](https://enaptss.maptss.gov.ao) (29/05/2023, Manuel Mbangui e Herinelto Casimiro): totais de 2018 a 2022 (inscritos, matriculados, aptos, desistentes) e "INEFOP em números" (cerca de 1470 centros, 300 especialidades, cerca de 100 000 formados por ano), sem divisão por curso. O servidor tem um certificado inválido e não foi possível abrir os PDF.
- Notícias ([Ver Angola, 07/2024](https://www.verangola.net/va/pt/072024/Educacao/40815/País-tem-mais-de-50-mil-jovens-a-receberem-formação-profissional.htm), [02/2024](https://www.verangola.net/va/pt/022024/Sociedade/39072/INEFOP-vai-disponibilizar-mais-de-15-mil-estágios-profissionais-este-ano.htm)): só totais (mais de 50 000 formandos no 2.º ciclo de 2024; 15 557 estágios previstos para 2024).
- Projeto RETFOP (UE, [capacity4dev](https://capacity4dev.europa.eu/projects/projetoretfop/news_en)): estudo de base de 2019, sem tabelas por curso no que se consegue ler.

Próximo passo: pedir os números por curso diretamente ao INEFOP.

Cada número entra com a fonte, o ano e a ligação (tabela `education_stats` em [arquitetura.md](arquitetura.md#42-formação)).

## Salários (para as carreiras)

Cada carreira mostra o salário da tabela do Estado (Diário da República), quando há uma para ela. Quando não há, mostra o intervalo líquido mensal do inquérito WageIndicator de 2026 (início de carreira e após 5 anos), com a ligação para a página da função. Uma função sem página própria usa a mais próxima e diz isso no texto. Nenhuma fonte pública dá percentis (p25/p50/p75) para Angola, por isso o campo `market.salary` fica vazio.

Páginas lidas a 05/11/2026 (`apps/web/src/data/demo/lastAreasGuides.ts`):

| Carreira | Página WageIndicator (`wageindicator.org/pt-ao/trabalho-em-angola/trabalho-e-salario/…`) | Início (Kz) | Após 5 anos (Kz) |
|---|---|---|---|
| Gestor de empresas agrícolas | `gerentes-de-producao-agricola-e-de-silvicultura` | 221 581 – 1 563 228 | 365 165 – 2 322 648 |
| Gestor de logística | `gerentes-de-fornecimento-distribuicao-e-assuntos` | 221 581 – 1 563 228 | 365 165 – 2 322 648 |
| Gestor portuário (função mais próxima) | `gerentes-de-fornecimento-distribuicao-e-assuntos` | 221 581 – 1 563 228 | 365 165 – 2 322 648 |
| Despachante aduaneiro | `despachantes-alfandegarios` | 183 438 – 652 181 | 285 029 – 1 143 054 |
| Técnico de transportes | `funcionarios-de-transporte` | 112 644 – 408 782 | 160 739 – 716 144 |
| Gestor hoteleiro | `gerentes-de-hoteis` | 217 222 – 1 220 145 | 422 679 – 1 975 764 |
| Recepcionista de hotel | `recepcionistas-de-hoteis` | 135 095 – 381 987 | 177 515 – 601 494 |
| Técnico de turismo | `consultores-e-funcionarios-de-viagens` | 135 095 – 381 987 | 177 515 – 601 494 |
| Guia turístico | `guias-de-viagens` | 114 214 – 395 306 | 189 510 – 685 139 |
| Gestor de restauração | `gerentes-de-restaurantes` | 217 222 – 1 220 145 | 422 679 – 1 975 764 |

## O que falta para a app

1. **Rever as ligações editoriais** (curso → carreiras e empresa → carreiras).
2. **Confirmar as ofertas**: se o curso está acreditado e aberto, e a duração, o horário e o preço. A fonte certa é a instituição ou o Ministério do Ensino Superior. Já há propinas de 2025/26 para 8 privadas (ver "Propinas publicadas"); faltam as de 2026/27 e as das outras instituições.
3. **Autorização das imagens.** Das 157 instituições do catálogo (01/11/2026), 20 têm logótipo e 13 têm capa; as restantes mostram as iniciais e uma faixa escura. As imagens estão em `apps/web/src/assets/academies/`; a origem de cada uma (site oficial, Facebook, LinkedIn, Wikimedia, notícia) está em `scrapers/catalog/academy_images.csv`. Antes de a app ser pública, cada instituição tem de autorizar o uso. Contactos: 12 instituições a 13/11/2026 (ver "Contactos e identidade").
4. **Mais instituições:** as que estão em "Ainda por pesquisar".
5. **Empresas pelas páginas de carreiras:** feito para BAI, BFA e Unitel a 05/11/2026 (ver Empresas). Falta o Banco BIC (sem página de carreiras) e voltar ao BAI e ao BFA quando abrirem vagas, para ter requisitos por profissão.
6. **Trabalhar por conta própria:** confirmar custos de arranque, passos e licenças estimados em `selfEmployment.ts`.
7. **Juntar à app** os cursos novos (`informatica-multimedia`, `electronica-telecomunicacoes`, `redes-computadores`, `programacao`) e o nível mestrado.
