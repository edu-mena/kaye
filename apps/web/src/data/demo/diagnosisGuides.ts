import type { Career } from '../types'
import { graduate, technician, therapyGuide as guide } from './diagnosisTherapyCareer'
import { degree, SECONDARY } from './healthGuideParts'

// The full guides of the diagnosis careers (the Diagnóstico group), all in the diagnosis and therapy career
// (diagnosisTherapyCareer.ts). The students of each degree: MESCTI, Anuário Estatístico do Ensino Superior 2023-2024;
// the technical courses: Decreto Executivo Conjunto n.º 97/11, Análises Clínicas suspended (Decreto Executivo n.º 01/25).

export const DIAGNOSIS_GUIDES: Career[] = [
  guide({
    slug: 'tecnico-analises-clinicas',
    demand: 'media',
    description:
      'Faz as análises ao sangue, à urina, às fezes e a outras amostras que ajudam o médico a chegar ao diagnóstico, da gota espessa para a malária à bioquímica, à hematologia e à microbiologia. Trabalha nos laboratórios dos hospitais, dos centros de saúde e das clínicas. É o curso de saúde com mais alunos a seguir à Enfermagem: no ano lectivo 2023/24 havia 13 243 estudantes nas licenciaturas de Análises Clínicas.',
    dayToDay: [
      'Colher sangue e receber as amostras',
      'Fazer testes de malária, VIH e outras infecções',
      'Pôr as amostras nos aparelhos de bioquímica e hematologia',
      'Observar lâminas e culturas ao microscópio',
      'Validar os resultados e entregá-los aos médicos',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Laboratórios de hospitais, centros de saúde e clínicas' },
      { label: 'Horário', value: '34 horas por semana no Estado, com urgências' },
      { label: 'Equipa', value: 'Médicos, enfermeiros e outros técnicos de laboratório' },
      { label: 'Segurança', value: 'Trabalho com sangue e amostras infecciosas, com protecção' },
    ],
    workStyles: [
      'Rigor e atenção ao detalhe',
      'Paciência',
      'Organização',
      'Gosto por ciência',
      'Seguir regras de segurança',
    ],
    skills: [
      { id: 'colheita-amostras', name: 'Colheita de sangue e de amostras', importance: 'essencial' },
      { id: 'microscopia', name: 'Microscopia', importance: 'essencial' },
      { id: 'hematologia-bioquimica', name: 'Hematologia e bioquímica', importance: 'essencial' },
      { id: 'microbiologia', name: 'Microbiologia e parasitologia', importance: 'essencial' },
      { id: 'biosseguranca', name: 'Biossegurança', importance: 'essencial' },
      { id: 'controlo-qualidade', name: 'Controlo de qualidade', importance: 'essencial' },
      { id: 'ingles-cientifico', name: 'Inglês científico', importance: 'opcional' },
    ],
    pathways: [graduate('Análises Clínicas'), technician('Análises Clínicas', true)],
  }),
  guide({
    slug: 'tecnico-radiologia',
    demand: 'media',
    description:
      'Faz os exames de imagem que o médico pede, como radiografias, TACs, mamografias e ressonâncias: posiciona o doente, escolhe a dose de radiação e protege o doente e a si próprio. O médico radiologista lê os exames. Trabalha nos serviços de imagiologia dos hospitais e em clínicas de diagnóstico. Há poucos a formar-se: no ano lectivo 2023/24 havia 551 estudantes nas licenciaturas de Radiologia, e 40 acabaram o curso.',
    dayToDay: [
      'Preparar e posicionar o doente para o exame',
      'Fazer radiografias, TACs e mamografias',
      'Escolher a dose certa de radiação',
      'Ver se a imagem tem qualidade e enviá-la ao radiologista',
      'Cuidar dos aparelhos e da protecção contra as radiações',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Serviços de imagiologia de hospitais e clínicas' },
      { label: 'Horário', value: '34 horas por semana no Estado, com urgências' },
      { label: 'Equipa', value: 'Médicos radiologistas, enfermeiros e técnicos' },
      { label: 'Segurança', value: 'Trabalho com radiação, com protecção e controlo da dose' },
    ],
    workStyles: [
      'Atenção ao detalhe',
      'Gosto por tecnologia',
      'Calma com doentes ansiosos',
      'Seguir regras de segurança',
      'Trabalhar em equipa',
    ],
    skills: [
      { id: 'radiologia-convencional', name: 'Radiologia convencional', importance: 'essencial' },
      { id: 'tac-rm', name: 'TAC e ressonância magnética', importance: 'essencial' },
      { id: 'posicionamento', name: 'Posicionamento do doente', importance: 'essencial' },
      { id: 'proteccao-radiologica', name: 'Protecção contra radiações', importance: 'essencial' },
      { id: 'mamografia', name: 'Mamografia', importance: 'opcional' },
      { id: 'ecografia', name: 'Ecografia', importance: 'opcional' },
      { id: 'ingles-cientifico', name: 'Inglês científico', importance: 'opcional' },
    ],
    pathways: [graduate('Radiologia'), technician('Radiologia')],
  }),
  guide({
    slug: 'tecnico-anatomia-patologica',
    demand: 'baixa',
    level: 'technician',
    description:
      'Prepara os tecidos e as células tirados aos doentes, em biópsias, cirurgias e citologias, para o médico patologista os ver ao microscópio e dizer, por exemplo, se há cancro. Também ajuda nas autópsias. Trabalha nos serviços de anatomia patológica dos hospitais centrais, no Instituto de Anatomia Patológica, no Instituto Angolano de Controlo do Câncer e em laboratórios privados. Forma-se no curso médio: o anuário do ensino superior de 2023/24 não tem uma licenciatura própria.',
    dayToDay: [
      'Receber e registar as peças e as amostras',
      'Fixar, cortar e corar os tecidos',
      'Preparar lâminas de citologia, como as do colo do útero',
      'Arquivar os blocos e as lâminas',
      'Ajudar o patologista nas autópsias',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Laboratório de anatomia patológica' },
      { label: 'Horário', value: '34 horas por semana no Estado, sobretudo de dia' },
      { label: 'Equipa', value: 'Médicos patologistas e outros técnicos' },
      { label: 'Segurança', value: 'Trabalho com químicos, como o formol, com protecção' },
    ],
    workStyles: [
      'Paciência e minúcia',
      'Mãos firmes',
      'Organização',
      'Seguir regras de segurança',
      'Concentração longa',
    ],
    skills: [
      { id: 'processamento-tecidos', name: 'Processamento e inclusão de tecidos', importance: 'essencial' },
      { id: 'microtomia', name: 'Corte ao micrótomo', importance: 'essencial' },
      { id: 'coloracoes', name: 'Colorações', importance: 'essencial' },
      { id: 'citologia', name: 'Técnicas de citologia', importance: 'essencial' },
      { id: 'biosseguranca', name: 'Biossegurança', importance: 'essencial' },
      { id: 'imuno-histoquimica', name: 'Imuno-histoquímica', importance: 'opcional' },
      { id: 'ingles-cientifico', name: 'Inglês científico', importance: 'opcional' },
    ],
    pathways: [technician('Anatomia Patológica')],
  }),
  guide({
    slug: 'cardiopneumologista',
    demand: 'media',
    description:
      'Faz os exames que estudam o coração, os vasos e os pulmões, como electrocardiogramas, holters, provas de esforço e provas de função respiratória, e apoia os médicos nos ecocardiogramas, nos cateterismos e nos pacemakers. Trabalha com cardiologistas e pneumologistas, em hospitais e clínicas. No ano lectivo 2023/24 havia 1 688 estudantes na licenciatura de Cardiopneumologia.',
    dayToDay: [
      'Fazer electrocardiogramas e explicar o exame ao doente',
      'Pôr holters e medidores da tensão de 24 horas',
      'Fazer provas de esforço e de função respiratória',
      'Apoiar o cardiologista nos ecocardiogramas e cateterismos',
      'Verificar o funcionamento dos pacemakers',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Laboratórios de cardiologia e de pneumologia' },
      { label: 'Horário', value: '34 horas por semana no Estado, com urgências' },
      { label: 'Equipa', value: 'Cardiologistas, pneumologistas e enfermeiros' },
      { label: 'Tecnologia', value: 'Electrocardiógrafos, holters e espirómetros' },
    ],
    workStyles: [
      'Atenção ao detalhe',
      'Gosto por tecnologia',
      'Calma com os doentes',
      'Rigor',
      'Trabalhar em equipa',
    ],
    skills: [
      { id: 'electrocardiograma', name: 'Electrocardiograma', importance: 'essencial' },
      { id: 'holter-mapa', name: 'Holter e MAPA', importance: 'essencial' },
      { id: 'provas-esforco', name: 'Provas de esforço', importance: 'essencial' },
      { id: 'espirometria', name: 'Provas de função respiratória', importance: 'essencial' },
      { id: 'ecocardiografia', name: 'Ecocardiografia', importance: 'opcional' },
      { id: 'ingles-cientifico', name: 'Inglês científico', importance: 'opcional' },
    ],
    pathways: [graduate('Cardiopneumologia'), technician('Cardiopneumologia')],
  }),
  guide({
    slug: 'tecnico-electromedicina',
    demand: 'media',
    description:
      'Instala, verifica e repara os equipamentos dos hospitais, dos monitores e ventiladores aos aparelhos de raios-X e de laboratório, para estarem seguros e a funcionar quando o doente precisa. Trabalha nos serviços de manutenção dos hospitais e em empresas que vendem e reparam equipamento hospitalar. É uma das profissões da carreira de diagnóstico e terapêutica; no ano lectivo 2023/24 havia 160 estudantes na licenciatura de Electromedicina.',
    dayToDay: [
      'Fazer a manutenção preventiva dos equipamentos',
      'Encontrar e reparar avarias',
      'Testar a segurança eléctrica dos aparelhos',
      'Instalar equipamento novo e ensinar a equipa a usá-lo',
      'Registar cada intervenção e pedir as peças',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Oficinas e serviços dos hospitais' },
      { label: 'Horário', value: 'De dia, com chamadas para avarias urgentes' },
      { label: 'Equipa', value: 'Engenheiros, técnicos e os serviços clínicos' },
      { label: 'Tecnologia', value: 'Electrónica, software e manuais em inglês' },
    ],
    workStyles: [
      'Gosto por electrónica',
      'Resolver problemas',
      'Rigor',
      'Calma quando um aparelho pára',
      'Vontade de aprender sempre',
    ],
    skills: [
      { id: 'electronica', name: 'Electrónica', importance: 'essencial' },
      { id: 'manutencao-preventiva', name: 'Manutenção preventiva', importance: 'essencial' },
      {
        id: 'seguranca-electrica',
        name: 'Segurança eléctrica de equipamentos médicos',
        importance: 'essencial',
      },
      { id: 'diagnostico-avarias', name: 'Diagnóstico de avarias', importance: 'essencial' },
      { id: 'ingles-tecnico', name: 'Inglês técnico', importance: 'essencial' },
    ],
    pathways: [
      graduate('Electromedicina'),
      {
        id: 'empresa',
        name: 'Licenciatura e emprego numa empresa',
        summary: 'Com a licenciatura, trabalhas para quem vende e repara o equipamento dos hospitais.',
        steps: [
          SECONDARY,
          degree('Electromedicina'),
          {
            kind: 'experiencia',
            title: 'Emprego numa empresa de equipamento hospitalar',
            need: 'essencial',
            description: 'Estas empresas contratam pelos sites de emprego, para a manutenção e a venda.',
            months: null,
          },
        ],
        totalCost: null,
      },
    ],
    hiring: [
      'Hospitais públicos',
      'Clínicas e hospitais privados',
      'Empresas de venda e manutenção de equipamento hospitalar',
      'Laboratórios e centros de diagnóstico',
    ],
  }),
]
