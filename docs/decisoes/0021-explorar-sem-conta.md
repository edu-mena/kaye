# 0021. Explorar sem conta; o registo só aparece quando a pessoa guarda, comenta ou faz o plano

18 de novembro de 2026 · Estado: Aceite

## Contexto

- A [0012](0012-conta-obrigatoria-e-onboarding-adaptativo.md) pôs a conta à entrada: sem conta só se via a landing, os termos e a privacidade.
- Com o Kayé a sair do aparelho para um servidor real, essa porta fechada afasta quem só quer ver, e quem já tem conta tinha de repetir a conversa do onboarding antes de entrar.
- O Eduardo pediu: "Entrar" na landing e no cabeçalho (quem já tem conta entra direto com o Google e salta o onboarding), exploração livre, e o registo só quando há algo a guardar.

## Decisão

- **Explorar é livre.** Carreiras, cursos, Kursos, academias, empresas, mercado, novidades, oportunidades, testes, pesquisa e perfil abrem sem conta, com a barra e o menu da app.
- **O registo aparece ao guardar.** Guardar uma carreira, academia ou empresa, escolher o destino e pedir o lembrete de um prazo abre um quadro "Guarda no Kayé" (`state/accountGate.ts`, `components/AccountPrompt.tsx`): "Já tenho conta" (Google) ou "Criar o meu perfil" (onboarding). Nada fica guardado até lá. O mesmo `needsAccount` serve os comentários (prompt 5).
- **Páginas só para quem tem perfil:** o plano, os prazos, as notificações, as configurações e o editor do CV. Sem perfil, vão para a landing com "Entra para ver isto" e voltam depois do login.
- **"Entrar"** (landing e cabeçalho) vai direto ao Google. A conta traz o perfil, e o onboarding não se repete. Uma conta nova (sem perfil) segue para o onboarding, que já não volta ao Google. Sem contas (site de demonstração do Vercel), "Entrar" abre o onboarding.
- O tour guiado continua só para quem tem perfil.

## Consequências

- Os motores de busca e as pré-visualizações do WhatsApp podem ver as páginas do catálogo (a 0012 limitava isto às páginas públicas da Fase 2).
- O que a pessoa explora sem conta (visitas, pesquisas, progresso nos Kursos) fica só no aparelho, como antes do login; ao entrar junta-se à conta, sem perder nada ([ADR 0019](0019-backend-e-migracao-dos-dados.md)).
- Substitui, na 0012, a regra "conta obrigatória"; o resto (onboarding adaptativo, guia) mantém-se.
