import type { LegalDoc } from './LegalDocument'

// Describes only what the app does today, and says what will change with accounts.
// Any change here is a new version: update LEGAL_VERSION (LegalDocument.tsx) and ask people to accept again.

export const PRIVACY: LegalDoc = {
  pt: {
    intro: 'Que dados o Kayé usa, para quê e o que podes fazer com eles.',
    summary: [
      'Pedimos o mínimo: o primeiro nome, o ano em que nasceste (não a data), a província e a escolaridade.',
      'Nesta fase de demonstração, tudo o que escreves fica só neste aparelho. O Kayé não o recebe.',
      'Não vendemos dados. As instituições e as empresas nunca veem a tua informação, só números de grupos com 5 ou mais pessoas.',
      'Sem publicidade e sem rastreadores de publicidade.',
      'Podes descarregar uma cópia dos teus dados e apagá-los quando quiseres, em Configurações.',
    ],
    sections: [
      {
        id: 'quem-somos',
        title: 'Quem somos',
        body: [
          'O Kayé é uma plataforma gratuita de orientação de carreira para jovens dos 14 aos 30 anos em Angola. Nesta primeira fase, o Kayé Tech, mostra as profissões e os cursos de tecnologia em Luanda.',
          'O Kayé é o responsável pelo tratamento dos teus dados pessoais, nos termos da Lei n.º 22/11, de 17 de junho, da Proteção de Dados Pessoais. Para qualquer pedido sobre os teus dados, escreve para {email}.',
        ],
      },
      {
        id: 'neste-aparelho',
        title: 'Nesta fase, tudo fica no teu aparelho',
        body: [
          'O Kayé está em demonstração e ainda não tem contas. O perfil, as respostas ao teste, as competências que marcas, as carreiras que guardas, os cursos que comparas, as pesquisas recentes, o CV, as fotos e o teu percurso na app ficam guardados apenas no armazenamento do navegador (ou da app) deste aparelho. Não são enviados para os nossos servidores.',
          'A app só contacta o nosso servidor para saber se ele está ligado, e esse pedido não leva os teus dados. Como em qualquer site, o servidor vê o endereço de internet (IP) do aparelho para lhe poder responder. Os nossos registos técnicos não guardam nomes nem e-mails e são apagados ao fim de 14 dias.',
          'Se limpares os dados do navegador ou mudares de aparelho, o teu progresso não te acompanha.',
          'Lista de espera e críticas: o email ou WhatsApp que deixas ao entrar no Kayé (ou na lista de espera da página inicial) para seres avisado do lançamento, e as críticas que nos envias, ficam guardados numa base de dados do nosso alojamento de teste (Upstash, fora de Angola), só a equipa do Kayé lê e só serve para isso. Para seres retirado da lista, escreve para {email}.',
        ],
      },
      {
        id: 'o-que-pedimos',
        title: 'O que pedimos e para quê',
        body: [
          [
            'Primeiro nome: para falarmos contigo e para o teu CV.',
            'Ano de nascimento: para sabermos se tens menos de 18 anos e te protegermos mais. Não pedimos a data completa.',
            'Província e escolaridade: para mostrarmos cursos perto de ti e o que te falta para cada profissão.',
            'Respostas ao teste vocacional e competências que marcas: para calcularmos as profissões que combinam contigo e o teu encaixe com cada uma.',
            'Carreiras guardadas, cursos que comparas, pesquisas recentes e o teu percurso na app: para retomares onde ficaste.',
            'O CV (com os contactos que decidires pôr) e as fotos que escolhes: para criares o teu CV e o teu perfil. As fotos são cortadas e reduzidas no aparelho.',
          ],
          'Tratamos estes dados com o teu consentimento, que dás ao criar o perfil. Podes retirá-lo a qualquer momento, apagando os teus dados.',
          'Não pedimos a morada, o número do bilhete de identidade, a data de nascimento completa, nem dados sobre saúde, religião ou opiniões políticas.',
        ],
      },
      {
        id: 'menores',
        title: 'Se tens menos de 18 anos',
        body: [
          'Podes criar um perfil a partir dos 14 anos. Entre os 14 e os 17, pedimos que confirmes que o teu encarregado de educação sabe que usas o Kayé.',
          'O teu perfil nunca é público e nunca te pedimos informação sobre salários.',
        ],
      },
      {
        id: 'partilha',
        title: 'Com quem partilhamos',
        body: [
          'Não vendemos nem alugamos dados pessoais.',
          'As instituições e as empresas nunca recebem dados individuais. Quando mostrarmos estatísticas (por exemplo, quantas pessoas se interessam por um curso), só usamos grupos com 5 ou mais pessoas.',
          'Não há publicidade nem rastreadores de publicidade no Kayé.',
        ],
      },
      {
        id: 'contas',
        title: 'Quando houver contas',
        body: [
          'Mais tarde vais poder entrar com a tua conta Google, para guardares o progresso e o usares noutros aparelhos. Antes disso, atualizamos esta política e pedimos-te que a aceites outra vez. O que já está previsto:',
          [
            'Do Google recebemos só o nome, o e-mail e um identificador da conta. Nunca vemos a tua palavra-passe.',
            'A sessão fica guardada num cookie protegido, que só serve para te manter dentro da conta.',
            'Os dados ficam nos servidores do nosso fornecedor de alojamento, que estão fora de Angola, e viajam sempre por uma ligação cifrada (HTTPS).',
            'As cópias de segurança são cifradas e guardadas durante 4 semanas.',
            'Registamos quando aceitaste estes textos, e que versão, como a lei exige.',
            'O serviço que nos avisa dos erros técnicos nunca recebe dados pessoais.',
          ],
        ],
      },
      {
        id: 'direitos',
        title: 'Os teus direitos',
        body: [
          'Pela Lei n.º 22/11, tens direito a saber que dados temos sobre ti, a ter uma cópia, a corrigi-los, a apagá-los e a opor-te ao seu tratamento. Na app:',
          [
            'Ver e corrigir: em Perfil, no separador «Dados pessoais».',
            'Ter uma cópia: em Configurações, com «Descarregar os meus dados».',
            'Apagar tudo: em Configurações, com «Apagar os meus dados». Não dá para desfazer.',
          ],
          'Para outros pedidos, escreve para {email}. Se achares que os teus dados não foram bem tratados, podes apresentar queixa à Agência de Proteção de Dados (APD).',
        ],
      },
      {
        id: 'armazenamento',
        title: 'Armazenamento no aparelho',
        body: [
          'Para funcionar, o Kayé guarda no aparelho o teu progresso e duas preferências: o idioma e se a barra lateral está minimizada. Apagar os teus dados remove o progresso; as preferências ficam, porque não dizem nada sobre ti.',
          'Não usamos cookies de publicidade nem de análise.',
        ],
      },
      {
        id: 'alteracoes',
        title: 'Alterações a esta política',
        body: [
          'Quando mudarmos alguma coisa importante, avisamos na app e pedimos-te que aceites outra vez. A data da versão em vigor está no topo desta página.',
        ],
      },
      {
        id: 'contacto',
        title: 'Contacto',
        body: ['Dúvidas ou pedidos sobre os teus dados: {email}.'],
      },
    ],
  },
  en: {
    intro: 'What data Kayé uses, what for, and what you can do with it.',
    summary: [
      'We ask for the minimum: your first name, the year you were born (not the date), your province and your schooling.',
      'In this demo phase, everything you enter stays on this device only. Kayé does not receive it.',
      'We do not sell data. Institutions and companies never see your information, only numbers from groups of 5 or more people.',
      'No advertising and no advertising trackers.',
      'You can download a copy of your data and delete it whenever you want, in Settings.',
    ],
    sections: [
      {
        id: 'quem-somos',
        title: 'Who we are',
        body: [
          'Kayé is a free career guidance platform for young people aged 14 to 30 in Angola. In this first phase, Kayé Tech, it covers tech careers and courses in Luanda.',
          'Kayé is the controller of your personal data under Law no. 22/11 of 17 June on Personal Data Protection. For any request about your data, write to {email}.',
        ],
      },
      {
        id: 'neste-aparelho',
        title: 'For now, everything stays on your device',
        body: [
          'Kayé is in demo mode and has no accounts yet. Your profile, test answers, the skills you mark, saved careers, the courses you compare, recent searches, your CV, photos and your history in the app are stored only in this device’s browser (or app) storage. They are not sent to our servers.',
          'The app only contacts our server to check that it is up, and that request carries none of your data. As with any website, the server sees the device’s internet address (IP) so it can reply. Our technical logs do not store names or emails and are deleted after 14 days.',
          'If you clear your browser data or switch devices, your progress does not come with you.',
          'Waiting list and critiques: the email or WhatsApp you leave when you join Kayé (or on the home page waiting list) to hear about the launch, and the critiques you send us, are kept in a database at our test host (Upstash, outside Angola), read only by the Kayé team and used only for that. To be removed from the list, write to {email}.',
        ],
      },
      {
        id: 'o-que-pedimos',
        title: 'What we ask for and why',
        body: [
          [
            'First name: to talk to you and for your CV.',
            'Year of birth: to know whether you are under 18 and protect you more. We do not ask for the full date.',
            'Province and schooling: to show courses near you and what you still need for each career.',
            'Vocational test answers and the skills you mark: to work out the careers that suit you and your fit with each one.',
            'Saved careers, the courses you compare, recent searches and your history in the app: so you can pick up where you left off.',
            'Your CV (with whatever contact details you choose to add) and the photos you pick: to build your CV and your profile. Photos are cropped and resized on the device.',
          ],
          'We process this data with your consent, which you give when you create your profile. You can withdraw it at any time by deleting your data.',
          'We do not ask for your address, ID card number, full date of birth, or data about health, religion or political opinions.',
        ],
      },
      {
        id: 'menores',
        title: 'If you are under 18',
        body: [
          'You can create a profile from age 14. Between 14 and 17, we ask you to confirm that your parent or guardian knows you use Kayé.',
          'Your profile is never public and we never ask you about salaries.',
        ],
      },
      {
        id: 'partilha',
        title: 'Who we share with',
        body: [
          'We do not sell or rent personal data.',
          'Institutions and companies never receive individual data. When we show statistics (for example, how many people are interested in a course), we only use groups of 5 or more people.',
          'There is no advertising and there are no advertising trackers on Kayé.',
        ],
      },
      {
        id: 'contas',
        title: 'When accounts arrive',
        body: [
          'Later you will be able to sign in with your Google account, to keep your progress and use it on other devices. Before that, we will update this policy and ask you to accept it again. What is already planned:',
          [
            'From Google we receive only your name, email and an account identifier. We never see your password.',
            'Your session is kept in a protected cookie that only serves to keep you signed in.',
            'Data is kept on our hosting provider’s servers, which are outside Angola, and always travels over an encrypted connection (HTTPS).',
            'Backups are encrypted and kept for 4 weeks.',
            'We record when you accepted these texts, and which version, as the law requires.',
            'The service that alerts us to technical errors never receives personal data.',
          ],
        ],
      },
      {
        id: 'direitos',
        title: 'Your rights',
        body: [
          'Under Law no. 22/11, you have the right to know what data we hold about you, to get a copy, to correct it, to delete it and to object to its processing. In the app:',
          [
            'See and correct: in Profile, on the “Personal data” tab.',
            'Get a copy: in Settings, with “Download my data”.',
            'Delete everything: in Settings, with “Delete my data”. This cannot be undone.',
          ],
          'For other requests, write to {email}. If you believe your data has not been handled properly, you can complain to the Data Protection Agency (APD).',
        ],
      },
      {
        id: 'armazenamento',
        title: 'Storage on your device',
        body: [
          'To work, Kayé keeps your progress and two preferences on the device: the language and whether the sidebar is collapsed. Deleting your data removes your progress; the preferences stay, because they say nothing about you.',
          'We do not use advertising or analytics cookies.',
        ],
      },
      {
        id: 'alteracoes',
        title: 'Changes to this policy',
        body: [
          'When we change anything important, we will tell you in the app and ask you to accept again. The date of the current version is at the top of this page.',
        ],
      },
      {
        id: 'contacto',
        title: 'Contact',
        body: ['Questions or requests about your data: {email}.'],
      },
    ],
  },
  fr: {
    intro: 'Les données que Kayé utilise, à quoi elles servent et ce que tu peux en faire.',
    summary: [
      'Nous demandons le minimum : ton prénom, ton année de naissance (pas la date), ta province et ta scolarité.',
      'Pendant cette phase de démonstration, tout ce que tu saisis reste uniquement sur cet appareil. Kayé ne le reçoit pas.',
      'Nous ne vendons pas de données. Les établissements et les entreprises ne voient jamais tes informations, seulement des chiffres de groupes de 5 personnes ou plus.',
      'Pas de publicité ni de traceurs publicitaires.',
      'Tu peux télécharger une copie de tes données et les effacer quand tu veux, dans Paramètres.',
    ],
    sections: [
      {
        id: 'quem-somos',
        title: 'Qui sommes-nous',
        body: [
          'Kayé est une plateforme gratuite d’orientation professionnelle pour les jeunes de 14 à 30 ans en Angola. Dans cette première phase, Kayé Tech présente les métiers et les formations du numérique à Luanda.',
          'Kayé est responsable du traitement de tes données personnelles, au sens de la loi n° 22/11 du 17 juin sur la protection des données personnelles. Pour toute demande concernant tes données, écris à {email}.',
        ],
      },
      {
        id: 'neste-aparelho',
        title: 'Pour l’instant, tout reste sur ton appareil',
        body: [
          'Kayé est en démonstration et n’a pas encore de comptes. Ton profil, tes réponses au test, les compétences que tu coches, les métiers que tu enregistres, les formations que tu compares, tes recherches récentes, ton CV, tes photos et ton parcours dans l’application sont stockés uniquement dans le stockage du navigateur (ou de l’application) de cet appareil. Ils ne sont pas envoyés à nos serveurs.',
          'L’application contacte notre serveur seulement pour vérifier qu’il fonctionne, et cette demande ne contient aucune de tes données. Comme pour tout site, le serveur voit l’adresse internet (IP) de l’appareil pour pouvoir lui répondre. Nos journaux techniques ne conservent ni noms ni e-mails et sont effacés au bout de 14 jours.',
          'Si tu effaces les données du navigateur ou changes d’appareil, ta progression ne te suit pas.',
          'Liste d’attente et critiques : l’e-mail ou le WhatsApp que tu laisses en entrant sur Kayé (ou sur la liste d’attente de la page d’accueil) pour être prévenu du lancement, et les critiques que tu nous envoies, sont gardés dans une base de données chez notre hébergeur de test (Upstash, hors d’Angola), lu uniquement par l’équipe Kayé et utilisé seulement pour cela. Pour être retiré de la liste, écris à {email}.',
        ],
      },
      {
        id: 'o-que-pedimos',
        title: 'Ce que nous demandons et pourquoi',
        body: [
          [
            'Prénom : pour te parler et pour ton CV.',
            'Année de naissance : pour savoir si tu as moins de 18 ans et mieux te protéger. Nous ne demandons pas la date complète.',
            'Province et scolarité : pour te montrer des formations près de chez toi et ce qu’il te manque pour chaque métier.',
            'Réponses au test d’orientation et compétences que tu coches : pour trouver les métiers qui te correspondent et ta compatibilité avec chacun.',
            'Métiers enregistrés, formations comparées, recherches récentes et ton parcours dans l’application : pour reprendre là où tu en étais.',
            'Ton CV (avec les coordonnées que tu choisis d’y mettre) et les photos que tu choisis : pour créer ton CV et ton profil. Les photos sont recadrées et réduites sur l’appareil.',
          ],
          'Nous traitons ces données avec ton consentement, que tu donnes en créant ton profil. Tu peux le retirer à tout moment en effaçant tes données.',
          'Nous ne demandons ni ton adresse, ni le numéro de ta carte d’identité, ni ta date de naissance complète, ni de données sur la santé, la religion ou les opinions politiques.',
        ],
      },
      {
        id: 'menores',
        title: 'Si tu as moins de 18 ans',
        body: [
          'Tu peux créer un profil à partir de 14 ans. Entre 14 et 17 ans, nous te demandons de confirmer que ton responsable légal sait que tu utilises Kayé.',
          'Ton profil n’est jamais public et nous ne te demandons jamais d’informations sur les salaires.',
        ],
      },
      {
        id: 'partilha',
        title: 'Avec qui nous partageons',
        body: [
          'Nous ne vendons ni ne louons de données personnelles.',
          'Les établissements et les entreprises ne reçoivent jamais de données individuelles. Quand nous montrons des statistiques (par exemple, combien de personnes s’intéressent à une formation), nous n’utilisons que des groupes de 5 personnes ou plus.',
          'Il n’y a ni publicité ni traceurs publicitaires sur Kayé.',
        ],
      },
      {
        id: 'contas',
        title: 'Quand les comptes arriveront',
        body: [
          'Plus tard, tu pourras te connecter avec ton compte Google, pour garder ta progression et l’utiliser sur d’autres appareils. Avant cela, nous mettrons à jour cette politique et te demanderons de l’accepter à nouveau. Ce qui est déjà prévu :',
          [
            'De Google, nous recevons seulement ton nom, ton e-mail et un identifiant de compte. Nous ne voyons jamais ton mot de passe.',
            'Ta session est gardée dans un cookie protégé, qui sert uniquement à maintenir ta connexion.',
            'Les données sont conservées sur les serveurs de notre hébergeur, situés hors d’Angola, et circulent toujours par une connexion chiffrée (HTTPS).',
            'Les sauvegardes sont chiffrées et conservées pendant 4 semaines.',
            'Nous enregistrons quand tu as accepté ces textes, et quelle version, comme la loi l’exige.',
            'Le service qui nous signale les erreurs techniques ne reçoit jamais de données personnelles.',
          ],
        ],
      },
      {
        id: 'direitos',
        title: 'Tes droits',
        body: [
          'Selon la loi n° 22/11, tu as le droit de savoir quelles données nous avons sur toi, d’en avoir une copie, de les corriger, de les effacer et de t’opposer à leur traitement. Dans l’application :',
          [
            'Voir et corriger : dans Profil, onglet « Données personnelles ».',
            'Obtenir une copie : dans Paramètres, avec « Télécharger mes données ».',
            'Tout effacer : dans Paramètres, avec « Effacer mes données ». C’est irréversible.',
          ],
          'Pour toute autre demande, écris à {email}. Si tu penses que tes données n’ont pas été bien traitées, tu peux porter plainte auprès de l’Agence de protection des données (APD).',
        ],
      },
      {
        id: 'armazenamento',
        title: 'Stockage sur l’appareil',
        body: [
          'Pour fonctionner, Kayé garde sur l’appareil ta progression et deux préférences : la langue et si la barre latérale est réduite. Effacer tes données supprime ta progression ; les préférences restent, car elles ne disent rien sur toi.',
          'Nous n’utilisons pas de cookies publicitaires ni de mesure d’audience.',
        ],
      },
      {
        id: 'alteracoes',
        title: 'Modifications de cette politique',
        body: [
          'Quand nous changerons quelque chose d’important, nous te préviendrons dans l’application et te demanderons d’accepter à nouveau. La date de la version en vigueur est en haut de cette page.',
        ],
      },
      {
        id: 'contacto',
        title: 'Contact',
        body: ['Questions ou demandes sur tes données : {email}.'],
      },
    ],
  },
}
