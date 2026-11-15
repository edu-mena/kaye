# Mentores

Profissionais voluntários que aceitam conversar com jovens sobre a sua carreira. Por agora é tudo à mão (Fase 4 do [roadmap](roadmap.md) começada com 5 a 10 pessoas): a app mostra os mentores aprovados em `/mentores` e o pedido de conversa chega ao Kayé por WhatsApp ou email. O Kayé fala com o mentor, marca e acompanha. A app não guarda nada.

Enquanto a lista estiver vazia, `/mentores` diz "em breve", o menu não mostra o item e a página da carreira não mostra o link "Mentores desta carreira".

## Como funciona na app

- Cartões com nome, cargo, empresa (se autorizada), carreiras, uma bio curta, línguas e disponibilidade; filtro por área e por carreira.
- "Pedir conversa" abre um formulário curto (o que procuras, a carreira e a disponibilidade) que monta uma mensagem para o WhatsApp do Kayé (`VITE_KAYE_WHATSAPP`) ou um email (`VITE_KAYE_EMAIL`). Sem nenhuma das duas variáveis, o botão não aparece (ver [infraestrutura.md](infraestrutura.md)).
- O pedido vai sempre para o Kayé, nunca diretamente para o mentor: o contacto do mentor não aparece na app.
- **Menores (14–17):** só veem mentores com `availability: 'grupo'` e o pedido diz "sessão em grupo". Sem ano de nascimento, conta como menor.

## Regras para os mentores

1. **É grátis.** Nunca pedes dinheiro, presentes, favores, nem vendes cursos, serviços ou produtos nas conversas.
2. **O Kayé está sempre no meio.** As conversas são marcadas pelo Kayé, por videochamada num grupo do Kayé ou num sítio público. Não trocas contactos pessoais com quem tem menos de 18 anos.
3. **Menores só em grupo**, com pelo menos três participantes ou alguém do Kayé presente, e com os pais ou encarregados informados.
4. **Privacidade.** Não pedes fotografias, moradas, notas nem dados pessoais. Não publicas nada sobre quem falou contigo.
5. **Honestidade.** Falas da tua experiência; não prometes empregos, estágios nem vagas.
6. **Respeito.** Sem assédio, discriminação, conversa política ou religiosa.
7. Se alguma regra for quebrada, o mentor sai da lista no mesmo dia.

## Processo de aprovação

1. **Convite ou candidatura** por email ou WhatsApp ao Kayé.
2. **Verificação:** BI, cargo confirmado (LinkedIn, carta da empresa ou uma fonte pública), 18 anos ou mais, pelo menos 2 anos na profissão.
3. **Conversa de 20 minutos** com o Eduardo: as regras acima, porque quer ajudar, disponibilidade.
4. **Referência:** um contacto que confirme quem é (colega ou chefia).
5. **Consentimento assinado** (modelo abaixo).
6. **Entra na lista** (ver "Como acrescentar") e é revisto ao fim de 3 meses, com o que disseram os jovens.

Denúncias: pelo Suporte da app (`/suporte`), pelo WhatsApp ou email do Kayé. O mentor sai da lista enquanto se verifica; se se confirmar, sai de vez.

## Modelo de consentimento

> Eu, ______________________ (nome), portador(a) do BI n.º ______________, aceito ser mentor(a) voluntário(a) do Kayé e autorizo que a app mostre o meu nome, cargo, ______________ (empresa: sim / não), fotografia (sim / não), carreiras, línguas e esta bio:
> "______________________________________________".
>
> Declaro que tenho 18 anos ou mais, que li e aceito as regras para os mentores, e que não recebo nem peço dinheiro. Sei que com menores só faço sessões em grupo, marcadas pelo Kayé.
>
> Disponibilidade: só em grupo / individual ou em grupo.
>
> Posso sair a qualquer momento, por email ou WhatsApp para o Kayé; os meus dados saem da app em 7 dias.
>
> Assinatura: ______________________  Data: ___/___/______  Contacto: ______________

Guarda a folha digitalizada numa pasta privada, nunca no repositório.

## Como acrescentar

1. Se houver fotografia, quadrada, em WebP com até 40 KB: `apps/web/src/assets/mentors/<id>.webp`.
2. Acrescenta uma linha em `apps/web/src/data/demo/mentors.ts`:

```ts
{
  id: 'joao-engenheiro-civil',
  name: 'João Manuel',
  role: 'Engenheiro civil',
  company: 'Mota-Engil Angola', // só se autorizou
  careers: ['engenheiro-civil'], // slugs, como em /carreiras/<slug>
  bio: 'Trabalho em obra há 8 anos, entre Luanda e Benguela. Posso falar de estágios, do ISPTEC e da Ordem.',
  languages: ['pt', 'en'],
  photo: 'joao-engenheiro-civil.webp',
  consentAt: '2026-12-01',
  availability: 'grupo', // 'grupo' | 'individual'
},
```

3. Publica (deploy). O item "Mentores" aparece no menu e o link aparece nas páginas das carreiras dele.
