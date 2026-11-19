# 0007. Sem a faixa "Demonstração" no topo dos ecrãs

27 de outubro de 2026 · Estado: Aceite (substitui uma parte da [0005](0005-frontend-primeiro-com-dados-de-demonstracao.md))

## Contexto

- A [0005](0005-frontend-primeiro-com-dados-de-demonstracao.md) pôs uma faixa "Demonstração" no topo de todos os ecrãs (`DemoBanner`), a dizer que os números são exemplos e que o progresso fica no aparelho.
- A faixa ocupava cerca de 60 px em cada ecrã. No telemóvel, empurrava para baixo o que importa: na Pesquisa, os resultados ficavam abaixo do meio do ecrã.
- O Eduardo pediu para a tirar (27/10/2026).

## Decisão

- A faixa sai de todos os ecrãs. O componente `DemoBanner`, o texto `common.demo` e a opção `hideDemoBanner` das rotas foram apagados.
- A constante `DATA_SOURCE` de `src/data/source.ts` só servia a faixa e também saiu. Ligar à API continua a mudar só esse ficheiro.
- Os dados continuam a dizer que são de demonstração, sem a faixa:
  - as instituições fictícias chamam-se "Exemplo …" e os CVs modelo são de pessoas inventadas;
  - os Termos de uso (`/termos`) dizem que, nesta fase, muitas carreiras, cursos e números são ilustrativos;
  - Configurações, o Perfil e a Política de privacidade dizem que tudo fica só no aparelho.

## Consequências

- Mais espaço útil em todos os ecrãs, sobretudo no telemóvel.
- Quem chega a um número (salário, procura, preço) sem ler os Termos pode tomá-lo por real. Se isto se notar com os primeiros utilizadores, volta um aviso mais discreto junto dos próprios números, em vez de uma faixa em todos os ecrãs.
- Quando a app passar a ler a API, já não há faixa para desligar (a 0005 previa esse passo).
