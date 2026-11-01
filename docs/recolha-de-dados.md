# Recolha de dados reais

Dados públicos para os ecrãs Academias, Empresas, Mercado e Novidades. Recolhidos a 25/10/2026, só com pesquisa na web.

Regras:

- Só dados públicos, cada um com a fonte e a data da fonte.
- Nenhum número inventado. Um número antigo fica marcado com o ano.
- O que não foi confirmado fica como **por confirmar**. Não entra na app como facto.
- As instituições de demonstração ("Exemplo") continuam na app até estes dados estarem confirmados. Não se juntam cursos ou preços inventados a uma instituição real.

Na app: as instituições e as ofertas já aparecem no ecrã Academias (`apps/web/src/data/demo/academies.ts`). As empresas aparecem no ecrã Empresas (`apps/web/src/data/demo/companies.ts`), com as 10 novas abaixo. As notícias ainda não.

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

Ainda por pesquisar: Universidade Jean Piaget, Universidade Óscar Ribas, Universidade Gregório Semedo, IMIL (Instituto Médio Industrial de Luanda) e os institutos médios politécnicos de Luanda.

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

Nenhuma oferta tem ainda duração, horário ou preço confirmados. O ISUTIC não tem nenhuma oferta confirmada.

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

Imagens das empresas (25/10/2026), em `apps/web/src/assets/companies/`: 17 logótipos e 13 banners.

- Dos sites oficiais (precisam de autorização antes de publicar): a maioria dos logótipos, o logótipo branco da Sonangol (mostrado sobre preto) e os banners de Africell, BFA, Banco BIC, EMIS, Multitel, Paratus, Primavera, Sonangol, Standard Bank, TAAG e TV Cabo.
- Do Wikimedia Commons, com licença livre: os logótipos da Angola Cables e da Siemens (domínio público), da Africell (Lulucylulucy, CC BY-SA 4.0) e da TAAG (CC BY-SA 4.0); as fotos do BAI (BAI, CC0), da sede da Siemens (Álvaro de la Paz Franco, CC0) e da sede do Atlântico (DiogoC300, CC BY-SA 4.0).
- Sem logótipo (aparecem as iniciais): Movicel, Angola Telecom, Standard Bank, Banco Sol e Innovation Makers. Os sites da Movicel e da Angola Telecom não respondem, e o Commons não tem nada destas cinco.
- Sem foto: Unitel, Movicel, Angola Telecom, Angola Cables, Banco Sol, Innovation Makers, Inovflow e ZAP. Quando há logótipo, o cartão mostra-o grande no lugar da foto.
- Rejeitadas: as fotos de "Banco Sol" e "Unitel" do Commons (são de empresas da Bolívia com o mesmo nome), o banner gerado por IA do Banco Sol e fotos de bancos de imagens. A foto do hero de Empresas é "Luanda Skyline - Angola 2015", de David Stanley (CC BY 2.0, Wikimedia Commons).

As profissões que cada empresa contrata são, na maior parte, a leitura do setor (`SECTOR_CAREERS` em `companies.ts`); só a Africell e o BFA têm fonte. A app diz qual é o caso.

Setores que contratam gente de tecnologia:

- **Banca.** Segundo o estudo PeopleBank 2025, os bancos aumentaram em cerca de 50% as contratações de TI em seis meses: 595 vagas novas. Mas muitos saíram, e o ganho real foi só de 85 lugares. Fonte: [Forbes África Lusófona](https://forbesafricalusofona.com/?p=161847).
- **Muito pedido:** cibersegurança e análise de dados. O inglês conta nas empresas internacionais. Fonte: [Rivermate (2026)](https://rivermate.com/pt/guias/angola/recrutamento), um guia comercial, por isso serve só como contexto.

## Empresa → carreiras

| Empresa | Carreiras | Base |
|---|---|---|
| `africell` | `tecnico-de-telecomunicacoes`, `comercial-de-ti` | fonte (áreas técnicas e comerciais, 2021) |
| `bfa` | `analista-de-ciberseguranca` | fonte (investimento em cibersegurança) |
| `bai` | `analista-de-sistemas`, `administrador-de-base-de-dados`, `gestor-de-projetos-de-ti` | editorial (projeto do sistema central) |
| `innovation-makers` | `analista-de-sistemas`, `administrador-de-base-de-dados`, `engenheiro-de-dados` | editorial (integração e migração de dados) |
| `inovflow`, `primavera` | `analista-de-sistemas`, `tecnico-de-suporte`, `formador-de-tic` | editorial (consultoria e formação em ERP) |
| `unitel`, `movicel`, `angola-telecom` | `engenheiro-de-telecomunicacoes`, `tecnico-de-telecomunicacoes`, `administrador-de-redes` | editorial |
| `angola-cables` | `engenheiro-de-telecomunicacoes`, `administrador-de-redes` | editorial |

## Parcerias (empresa ou organismo × instituição)

| De | Para | Ligação | Fonte |
|---|---|---|---|
| `sonangol` | `isptec` | Parceira na criação | [Baguete (2012)](https://baguete.com.br/public/noticias/brasileiros-implantam-instituto-tecnologico-em-angola) |
| `siemens` | `isptec` | Laboratório de automação | [Ver Angola (2017)](https://www.verangola.net/va/pt/112017/CulturaEducacao/10156/Siemens-leva-tecnologia-inovadora-ao-ISPTEC-com-inauguração-de-laboratório-de-automação.htm) |
| `inefop` | `cinfotec` | Tutela | [Capacity4dev](https://capacity4dev.europa.eu/news/formadores-do-inefop-aperfeicoam-conhecimentos-tecnicos-e-pedagogicos-em-diferentes-areas-de-formacao_en) |
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

## Contexto do ensino superior (2026/27)

- 283 500 vagas, menos 50 000 que no ano anterior. As aulas começaram a 5 de outubro.
- A descida vem da avaliação e acreditação dos cursos: mais de 250 cursos foram suspensos em abril de 2025.
- A rede tem 31 instituições públicas e 75 privadas, com 1305 cursos.

Fonte: [Ver Angola](https://www.verangola.net/va/pt/092026/Educacao/50069/Ensino-superior-com-menos-50-mil-vagas-para-novo-ano-académico.htm).

Isto importa para o Kayé: antes de mostrar uma oferta real, temos de confirmar que o curso está acreditado e aberto em 2026/27.

## Educação (para o Mercado)

O Mercado vai comparar, área a área, o que o trabalho pede com quantas pessoas se formam. Para isso faltam números oficiais, **ainda por recolher**:

| O quê | Onde procurar | Notas |
|---|---|---|
| Inscritos e diplomados por curso e instituição do ensino superior | Anuário Estatístico do Ensino Superior (MESCTI) | O mais recente é o de 2023-2024 (publicado pelo INE em agosto de 2026): os diplomados por instituição e curso (Quadros 2.4 a 2.6) já estão no Mercado; tem também diplomados por província (Quadros 2.8 e 2.9), vagas, candidatos e inscritos |
| Nível de escolaridade e área de formação da população | INE (censo e inquéritos ao emprego) | Usar só números agregados, com o ano e a ligação |
| Formandos da formação profissional por curso | INEFOP | Para os cursos técnicos e de curta duração |

Cada número entra com a fonte, o ano e a ligação (tabela `education_stats` em [arquitetura.md](arquitetura.md#42-formação)).

## O que falta para a app

1. **Rever as ligações editoriais** (curso → carreiras e empresa → carreiras).
2. **Confirmar as ofertas**: se o curso está acreditado e aberto, e a duração, o horário e o preço. A fonte certa é a instituição ou o Ministério do Ensino Superior.
3. **Autorização das imagens.** Das 157 instituições do catálogo (01/11/2026), 20 têm logótipo e 13 têm capa; as restantes mostram as iniciais e uma faixa escura. As imagens estão em `apps/web/src/assets/academies/`; a origem de cada uma (site oficial, Facebook, LinkedIn, Wikimedia, notícia) está em `scrapers/catalog/academy_images.csv`. Antes de a app ser pública, cada instituição tem de autorizar o uso. Faltam também os contactos.
4. **Mais instituições:** as que estão em "Ainda por pesquisar".
5. **Empresas pelas páginas de carreiras** (BAI, BFA, BIC, Unitel), para saber que profissões procuram hoje.
6. **Juntar à app** os cursos novos (`informatica-multimedia`, `electronica-telecomunicacoes`, `redes-computadores`, `programacao`) e o nível mestrado.
