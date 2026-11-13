import type { Photo } from '../types'

// Photos from Wikimedia Commons (most from Wiki Loves Africa 2017, "people at work"), under free
// licences: CC BY-SA, CC BY or public domain. Cropped to 16:10 and saved at 400 (cards), 800 and
// 1600 px as assets/<careers|courses>/<slug>-<width>.webp. For now they stay local, so no page shows the credits;
// they are kept here because publishing the photos means showing them again (CC BY / CC BY-SA).
const FILES = import.meta.glob<string>(['../../assets/careers/*.webp', '../../assets/courses/*.webp'], {
  eager: true,
  import: 'default',
})

function photo(folder: 'careers' | 'courses', slug: string, alt: string, credit: Photo['credit']): Photo {
  const thumb = FILES[`../../assets/${folder}/${slug}-400.webp`]
  const small = FILES[`../../assets/${folder}/${slug}-800.webp`]
  const large = FILES[`../../assets/${folder}/${slug}-1600.webp`]
  if (!thumb || !small || !large) throw new Error(`Missing photo: ${folder}/${slug}`)
  return { thumb, small, large, alt, credit }
}

export const CAREER_IMAGES: Partial<Record<string, Photo>> = {
  canalizador: photo('careers', 'canalizador', 'Canalizador a instalar tubos num prédio', {
    author: 'Gatien TITCHO SEUMO',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Cameroon_male_plumbier_at_work_01.jpg',
  }),
  serralheiro: photo('careers', 'serralheiro', 'Serralheiro a soldar numa oficina', {
    author: 'ABDULIUMAR',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_welder_man.jpg',
  }),
  pedreiro: photo('careers', 'pedreiro', 'Pedreiro a assentar blocos numa obra', {
    author: 'Okhaifo',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Bricklayer_at_work.jpg',
  }),
  carpinteiro: photo('careers', 'carpinteiro', 'Carpinteiro a fazer uma cadeira na oficina', {
    author: 'Fquasie',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Carpenter_Ghana.jpg',
  }),
  'tecnico-de-frio': photo('careers', 'tecnico-de-frio', 'Técnico a reparar um frigorífico', {
    author: 'Gkbediako',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_Ghanaian_Fridge_Repairer.jpg',
  }),
  'tecnico-de-paineis-solares': photo(
    'careers',
    'tecnico-de-paineis-solares',
    'Técnico a instalar painéis solares',
    {
      author: 'SAgbley',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Solar_installation_technician.jpg',
    },
  ),
  'mecanico-auto': photo('careers', 'mecanico-auto', 'Mecânico a reparar um carro', {
    author: 'Minette Lontsie',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Mechanic_at_work.jpg',
  }),
  'motorista-profissional': photo('careers', 'motorista-profissional', 'Motorista ao volante de um camião', {
    author: 'Jamie Tubers',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_truck_driver_in_Ilorin.jpg',
  }),
  costureiro: photo('careers', 'costureiro', 'Alfaiate a coser à máquina', {
    author: 'Masako Kato',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Male_tailor.jpg',
  }),
  cabeleireiro: photo('careers', 'cabeleireiro', 'Cabeleireira a fazer um penteado', {
    author: 'Melchisedek ABAKA',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_hairdresser_at_work_in_Ivory_Coast.jpg',
  }),
  esteticista: photo('careers', 'esteticista', 'Esteticista a tratar uma cliente', {
    author: 'SAgbley',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Beautician.jpg',
  }),
  cozinheiro: photo('careers', 'cozinheiro', 'Cozinheiro a preparar um prato', {
    author: 'Pixelcrea.bejaia',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Chef_cuisinier.jpg',
  }),
  pasteleiro: photo('careers', 'pasteleiro', 'Pasteleira a preparar a massa de bolos', {
    author: 'Gkbediako',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_Ghanaian_Baker.jpg',
  }),
  'agricultor-e-criador': photo('careers', 'agricultor-e-criador', 'Agricultor no seu campo de tomate', {
    author: 'AmyAbroad',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Tomato_farmer_in_his_field.jpg',
  }),
  'desenvolvedor-frontend': photo(
    'careers',
    'desenvolvedor-frontend',
    'Programador a sorrir, ao portátil, num escritório de tecnologia',
    {
      author: 'Daudi Mukiibi',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Software_Developer_at_work_03.jpg',
    },
  ),
  'analista-de-dados': photo(
    'careers',
    'analista-de-dados',
    'Analista com auscultadores a trabalhar no portátil, ao lado de dois monitores',
    {
      author: 'Daudi Mukiibi',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Software_developer_at_work_02.jpg',
    },
  ),
  'designer-ui-ux': photo('careers', 'designer-ui-ux', 'Designer a sorrir enquanto trabalha no portátil', {
    author: 'Ngwedi Mokgoro',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Graphic_designer_5.jpg',
  }),
  'desenvolvedor-backend': photo(
    'careers',
    'desenvolvedor-backend',
    'Programador com auscultadores a trabalhar no portátil',
    {
      author: 'Daudi Mukiibi',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Software_Developer_at_work_01.jpg',
    },
  ),
  'desenvolvedor-full-stack': photo(
    'careers',
    'desenvolvedor-full-stack',
    'Programadora a sorrir junto ao portátil, com colegas a trabalhar ao fundo',
    {
      author: 'Deo photographer',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Computer_engineer.jpg',
    },
  ),
  'desenvolvedor-mobile': photo(
    'careers',
    'desenvolvedor-mobile',
    'Jovens a ver juntos o ecrã de um telemóvel',
    {
      author: 'The Wot-If? Trust',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:The_Wot-If_Trust,_South_Africa_11.jpg',
    },
  ),
  'engenheiro-de-qa': photo(
    'careers',
    'engenheiro-de-qa',
    'Técnico concentrado a analisar o ecrã do computador',
    {
      author: 'Moritz Poll',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Kenya_Office_Work.jpg',
    },
  ),
  'analista-de-bi': photo(
    'careers',
    'analista-de-bi',
    'Analista a tomar notas ao lado do portátil, num escritório',
    {
      author: 'Mweufika',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Young_%26_Dedicated_Accountant_at_Work.jpg',
    },
  ),
  'cientista-de-dados': photo(
    'careers',
    'cientista-de-dados',
    'Profissional ao computador, com vários monitores na secretária',
    {
      author: 'Don Leitch',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Video_Producer_in_Cape_Town.jpg',
    },
  ),
  'engenheiro-de-dados': photo(
    'careers',
    'engenheiro-de-dados',
    'Filas de servidores iluminados num centro de dados',
    {
      author: 'BalticServers.com',
      license: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:BalticServers_data_center.jpg',
    },
  ),
  'administrador-de-base-de-dados': photo(
    'careers',
    'administrador-de-base-de-dados',
    'Técnico de serviço ao computador, com o portátil aberto ao lado',
    {
      author: 'Emmanuel masetera',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Technician_on_duty.jpg',
    },
  ),
  'administrador-de-sistemas': photo(
    'careers',
    'administrador-de-sistemas',
    'Dois administradores de sistemas a verificar um bastidor de servidores',
    {
      author: 'Rick Naystatt, US Navy',
      license: 'Domínio público',
      url: 'https://commons.wikimedia.org/wiki/File:System_Administrators_Burnside_Franswells_Acceptance_Testing.jpg',
    },
  ),
  'administrador-de-redes': photo(
    'careers',
    'administrador-de-redes',
    'Cabos de rede ligados a um switch, num bastidor',
    {
      author: 'J.smith',
      license: 'CC BY-SA 2.5',
      url: 'https://commons.wikimedia.org/wiki/File:Switch-and-nest.jpg',
    },
  ),
  'engenheiro-devops': photo(
    'careers',
    'engenheiro-devops',
    'Sala de controlo com muitos monitores e ecrãs de acompanhamento',
    {
      author: 'NASA Armstrong Flight Research Center / Lauren Hughes',
      license: 'Domínio público',
      url: 'https://commons.wikimedia.org/wiki/File:NASA_Armstrong%E2%80%99s_Mission_Control_Center,_or_MCC,_is_where_culmination_of_all_data-gathering_occurs_(AFRC2017-0076-1).jpg',
    },
  ),
  'tecnico-de-suporte': photo(
    'careers',
    'tecnico-de-suporte',
    'Técnico de informática a sorrir ao lado do computador',
    {
      author: 'DavidMakai 254',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:InformationTechnologyWork_10.jpg',
    },
  ),
  'tecnico-de-hardware': photo(
    'careers',
    'tecnico-de-hardware',
    'Jovens a reparar um computador portátil aberto',
    {
      author: 'Kristungati',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Computer_Repairing_Lilongwe_Malawi.jpg',
    },
  ),
  'analista-de-ciberseguranca': photo(
    'careers',
    'analista-de-ciberseguranca',
    'Mãos a escrever no portátil, num ambiente escuro',
    {
      author: 'Rasheedhrasheed',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Work_hard_anywhere.jpg',
    },
  ),
  'tecnico-de-telecomunicacoes': photo(
    'careers',
    'tecnico-de-telecomunicacoes',
    'Técnico a trabalhar no topo de um poste de telecomunicações',
    {
      author: 'Neil Theasby',
      license: 'CC BY-SA 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Telecommunications_engineer_-_geograph.org.uk_-_8092160.jpg',
    },
  ),
  'engenheiro-de-telecomunicacoes': photo(
    'careers',
    'engenheiro-de-telecomunicacoes',
    'Técnico de capacete azul a sorrir, com um colega a instalar equipamento',
    {
      author: 'DavidMakai 254',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:InformationTechnologyWork_01.jpg',
    },
  ),
  'designer-grafico': photo(
    'careers',
    'designer-grafico',
    'Designer a trabalhar num cartaz no ecrã do computador',
    {
      author: 'Amuzujoe',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Graphic_Designer.jpg',
    },
  ),
  'analista-de-sistemas': photo(
    'careers',
    'analista-de-sistemas',
    'Dois colegas a analisar documentos ao lado do portátil',
    {
      author: 'Alex Ndongmo',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:R%C3%A9union_Intelligentsia_2.jpg',
    },
  ),
  'gestor-de-projetos-de-ti': photo(
    'careers',
    'gestor-de-projetos-de-ti',
    'Reunião técnica numa sala com mesas em U',
    {
      author: 'Tom Cat King',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Technical_meeting.jpg',
    },
  ),
  'product-manager': photo(
    'careers',
    'product-manager',
    'Equipa de jovens profissionais num encontro de trabalho',
    {
      author: 'Trssuretm',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Africa_Operations_Management_Conference_2017.jpg',
    },
  ),
  'gestor-de-ti': photo(
    'careers',
    'gestor-de-ti',
    'Gestor ao portátil no escritório, com um colega a ajudar',
    {
      author: 'Jordanmwesiga',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:DSC_0127_edited.jpg',
    },
  ),
  'comercial-de-ti': photo(
    'careers',
    'comercial-de-ti',
    'Profissional a sorrir durante uma chamada ao telemóvel',
    {
      author: 'Nebiyu.s',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Women_on_a_phone_meeting.jpg',
    },
  ),
  'formador-de-tic': photo('careers', 'formador-de-tic', 'Professor a ensinar um aluno ao computador', {
    author: 'Nduati.githae',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Teacher_teaches_computers.jpg',
  }),
  'gestor-de-marketing-digital': photo(
    'careers',
    'gestor-de-marketing-digital',
    'Profissional ao portátil, numa secretária com revistas',
    {
      author: 'Aristidek5maya',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Assistante_de_direction.jpg',
    },
  ),
  // The medical careers (ADR 0010).
  'medico-clinica-geral': photo(
    'careers',
    'medico-clinica-geral',
    'Médica de bata branca a sorrir numa consulta, num centro de saúde na Etiópia',
    {
      author: 'Bedanmwathi',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Sanitising_hands_in_Ethiopia.png',
    },
  ),
  'medico-pediatra': photo(
    'careers',
    'medico-pediatra',
    'Enfermeiras e um enfermeiro à volta de um bebé num serviço de neonatologia',
    {
      author: 'Happi Raphael',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:A_group_of_nurses_attending_to_a_baby.jpg',
    },
  ),
  'medico-ginecologista-obstetra': photo(
    'careers',
    'medico-ginecologista-obstetra',
    'Profissional de saúde a fazer uma ecografia a uma grávida',
    {
      author: 'Alagboso Chibuike',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Health_worker_pregnant_woman_in_IDP.jpg',
    },
  ),
  'medico-internista': photo(
    'careers',
    'medico-internista',
    'Médica com estetoscópio e processos clínicos numa enfermaria, no Gana',
    {
      author: 'U.S. Army photo by Cpl. Clara Soria',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:U_S_Army_and_Air_Force_and_Ghanan_Armed_Forces_medical_staff_participate_in_MEDREX_AL24_(8408876).jpg',
    },
  ),
  'cirurgiao-geral': photo(
    'careers',
    'cirurgiao-geral',
    'Cirurgiões a vestir as batas para entrar no bloco operatório, no Burundi',
    {
      author: 'U.S. Army photo by 1st Lt. Katherine Sibilla',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:US_Army,_Burundian_surgeons_work_together_in_operating_room_(8558525).jpg',
    },
  ),
  'medico-intensivista': photo(
    'careers',
    'medico-intensivista',
    'Médicos e enfermeiros levam um doente numa maca, num exercício de emergência em Angola',
    {
      author: 'U.S. Army photo by Capt. Jordan Beagle',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:US,_Angola_conduct_trauma_activation_simulation_(9918680).jpg',
    },
  ),
  'medico-ortopedista': photo(
    'careers',
    'medico-ortopedista',
    'Cirurgiões ortopedistas a operar sob as luzes do bloco, no Burundi',
    {
      author: 'U.S. Army photo by 1st Lt. Katherine Sibilla',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:US_Army,_Burundian_orthopedic_surgeons_work_together_in_the_operating_room_(8558543).jpg',
    },
  ),
  'medico-radiologista': photo(
    'careers',
    'medico-radiologista',
    'Médico a fazer uma ecografia a uma criança deitada na marquesa',
    {
      author: 'Aneesa Hendricks',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Ultrasound_on_Adrenal_gland.jpg',
    },
  ),
  'medico-anestesista': photo(
    'careers',
    'medico-anestesista',
    'Equipa de cirurgia, com o monitor e a máquina de anestesia ao fundo',
    {
      author: 'U.S. Army photo by 1st Lt. Katherine Sibilla',
      license: 'Public domain',
      url: "https://commons.wikimedia.org/wiki/File:US,_Ghana_surgeons_work_together_to_save_child's_life_during_African_Lion_2025_(9069633).jpg",
    },
  ),
  'medico-cardiologista': photo(
    'careers',
    'medico-cardiologista',
    'Ecografia a uma criança, com o ecógrafo ao lado da marquesa',
    {
      author: 'Aneesa Hendricks',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Ultrasound_on_Adrenal_glands.jpg',
    },
  ),
  'medico-oftalmologista': photo(
    'careers',
    'medico-oftalmologista',
    'Oftalmologista a examinar os olhos de um doente com a lâmpada de fenda, no Quénia',
    {
      author: 'Mwangiw',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Dr_Hillary_Rono_examining_a_patient_a_patient_at_the_Kitale_eye_clinic.png',
    },
  ),
  'medico-psiquiatra': photo(
    'careers',
    'medico-psiquiatra',
    'Profissional de saúde a conversar com um rapaz numa aldeia',
    {
      author: 'Safari Doctors',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Connecting_with_the_youth_(Credit_Neil_Thomas).jpg',
    },
  ),
  'medico-neurologista': photo(
    'careers',
    'medico-neurologista',
    'Médica a escrever processos clínicos à secretária, num hospital dos Camarões',
    {
      author: 'Happi Raphael',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Ophthalmologist_Hospital_Cameroon_06.jpg',
    },
  ),
  'medico-urologista': photo(
    'careers',
    'medico-urologista',
    'Cirurgiões a operar no bloco operatório, no Gana',
    {
      author: 'U.S. Army photo by 1st Lt. Katherine Sibilla',
      license: 'Public domain',
      url: "https://commons.wikimedia.org/wiki/File:US,_Ghana_surgeons_work_together_to_save_child's_life_during_African_Lion_2025_(9069635).jpg",
    },
  ),
  'medico-otorrinolaringologista': photo(
    'careers',
    'medico-otorrinolaringologista',
    'Duas profissionais de saúde de touca e máscara, num hospital de Douala',
    {
      author: 'Destiny Deffo',
      license: 'CC BY-SA 4.0',
      url: "https://commons.wikimedia.org/wiki/File:Infirmières_A_l'hôpital_Laquintinie_de_Douala_21.jpg",
    },
  ),
  'medico-dermatologista': photo(
    'careers',
    'medico-dermatologista',
    'Equipa de saúde recebe uma doente numa sala de exames de um hospital de Douala',
    {
      author: 'Max MBAKOP',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Hopital_Laquintini-4993_10.jpg',
    },
  ),
  // The nursing careers (ADR 0010).
  enfermeiro: photo(
    'careers',
    'enfermeiro',
    'Enfermeira mede a tensão arterial a uma doente deitada na enfermaria',
    {
      author: 'Countvictor',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Nurse.jpg',
    },
  ),
  'tecnico-medio-enfermagem': photo(
    'careers',
    'tecnico-medio-enfermagem',
    'Enfermeira regista a história clínica de uma aluna, numa acção de saúde do governo em Harare, no Zimbabué',
    {
      author: 'Cecil Dzwowa',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Nurse_attendding_to_a_sick_school_girl.jpg',
    },
  ),
  parteira: photo(
    'careers',
    'parteira',
    'Uma parteira examina um recém-nascido na maternidade de um hospital em Acra, no Gana',
    {
      author: 'U.S. Army photo by 1st Lt. Katherine Sibilla',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:US,_Ghana_midwives_team_up_in_maternity_ward_at_African_Lion_2025_(9047751).jpg',
    },
  ),
  'enfermeiro-cuidados-intensivos': photo(
    'careers',
    'enfermeiro-cuidados-intensivos',
    'Enfermeira de cuidados intensivos junto à cama de um doente, num hospital em Acra, no Gana',
    {
      author: 'U.S. Army photo by Staff Sgt. Catessa Palone',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:US,_Ghana_work_together_in_ICU_care_during_AL26_MEDREX_(9669667).jpg',
    },
  ),
  'instrumentista-cirurgico': photo(
    'careers',
    'instrumentista-cirurgico',
    'Equipa de bloco operatório junto à mesa de operações, no Hospital Militar Principal, em Luanda',
    {
      author: 'U.S. Army photo by 1st Lt. Tucker Chase',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:US,_Angola_conduct_joint_medical_subject_matter_expert_exchange_on_trauma_surgery_techniques_(9350401).jpg',
    },
  ),
  // The diagnosis careers (ADR 0010).
  'tecnico-analises-clinicas': photo(
    'careers',
    'tecnico-analises-clinicas',
    'Cientista de laboratório, com o bebé às costas, observa uma lâmina numa formação em microscopia da malária, na Nigéria',
    {
      author: 'Ozavogu Abdulsalam Khalid uploaded by eHealth Africa EHA Clinics',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Malaria_microscopy_training_in_Nigeria.jpg',
    },
  ),
  'tecnico-radiologia': photo(
    'careers',
    'tecnico-radiologia',
    'Equipa prepara um doente com a perna imobilizada para uma radiografia, nas urgências de um hospital de Douala',
    {
      author: 'Happi Raphael',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Radiographie_Jambes_aux_Urgences_Hôpital_Laquintinie_Douala_10.jpg',
    },
  ),
  'tecnico-anatomia-patologica': photo(
    'careers',
    'tecnico-anatomia-patologica',
    'Técnica de laboratório trabalha com amostras numa câmara de segurança, num instituto de investigação médica no Quénia',
    {
      author: 'US Army Africa from Vicenza, Italy',
      license: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:U.S._Army_research_unit_marks_four_decades_in_Kenya,_Africa_-_USAMRU-K_(4074611339).jpg',
    },
  ),
  cardiopneumologista: photo(
    'careers',
    'cardiopneumologista',
    'Profissionais de saúde angolanos aprendem a usar um electrocardiógrafo, numa formação em Luanda',
    {
      author: 'U.S. Army photo by 1st Lt. Katherine Sibilla',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:US_Army_Reserve_medical_team_trains_Angolan_counterparts_on_electrocardiogram_use_(8543650).jpg',
    },
  ),
  'tecnico-electromedicina': photo(
    'careers',
    'tecnico-electromedicina',
    'Técnicos aprendem a reparar um monitor de sinais vitais, numa formação em Bujumbura, no Burundi',
    {
      author: 'U.S. Army photo by 1st Lt. Katherine Sibilla',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:US_Army_biomedical_equipment_technician_trains_Burundian_counterparts_during_medical_exercise_(8550288).jpg',
    },
  ),
  // The pharmacy careers (ADR 0010).
  farmaceutico: photo(
    'careers',
    'farmaceutico',
    'Farmacêutico sorri na sua farmácia, em Selebi-Phikwe, no Botswana',
    {
      author: 'Gamu Ndawana',
      license: 'CC BY-SA 4.0',
      url: "https://commons.wikimedia.org/wiki/File:Phikwe's_only_Private_Pharmacist.jpg",
    },
  ),
  'tecnico-farmacia': photo(
    'careers',
    'tecnico-farmacia',
    'Profissional de farmácia faz um teste rápido a uma doente, na Gâmbia',
    {
      author: 'Haddy Sowe',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Point_of_Care_Testing.jpg',
    },
  ),
  'delegado-informacao-medica': photo(
    'careers',
    'delegado-informacao-medica',
    'Farmacêutico mostra dois produtos numa farmácia, no Botswana',
    {
      author: 'Gamu Ndawana',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Pharmacist_in_Selebi_Phikwe.jpg',
    },
  ),
  // The rehabilitation careers (ADR 0010).
  fisioterapeuta: photo(
    'careers',
    'fisioterapeuta',
    'Sessão de reabilitação no serviço de fisioterapia de um hospital de Douala, nos Camarões',
    {
      author: 'Happi Raphael',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Séance_de_Rééducation_-_Hopital_Douala_Cameroun_01.jpg',
    },
  ),
  nutricionista: photo(
    'careers',
    'nutricionista',
    'Nutricionista aconselha a mãe de uma criança desnutrida, num hospital de Jinja, no Uganda',
    {
      author: 'USAID in Africa',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:Uganda_Nutrition_(26941720597).jpg',
    },
  ),
  ortoprotesico: photo(
    'careers',
    'ortoprotesico',
    'Técnico ortoprotésico prova uma prótese da perna a um doente, numa oficina com várias próteses, na Indonésia',
    {
      author: 'Arie Basuki',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Pembuat_Kaki_Palsu.jpg',
    },
  ),
  ortoptista: photo(
    'careers',
    'ortoptista',
    'Profissional de saúde põe gotas nos olhos de um doente antes de uma cirurgia, num hospital de Lilongwe, no Malawi',
    {
      author: 'US Army Africa from Vicenza, Italy',
      license: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Optometry_Care_at_the_Kamuzu_Central_Hospital_2011.jpg',
    },
  ),
  // The oral health careers (ADR 0010).
  'medico-dentista': photo('careers', 'medico-dentista', 'Dentista trata um doente numa clínica dentária', {
    author: 'Jameswasswa',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Precision_and_Care,_A_Dental_Procedure_in_Progress.jpg',
  }),
  'tecnico-estomatologia': photo(
    'careers',
    'tecnico-estomatologia',
    'Profissionais de saúde oral atendem um doente numa clínica dentária',
    {
      author: 'Jameswasswa',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Modern_Dentistry_in_Practice.jpg',
    },
  ),
  // The public health careers (ADR 0010).
  'medico-saude-publica': photo(
    'careers',
    'medico-saude-publica',
    'Equipa de resposta à cólera, com as caixas térmicas, no estado do Nilo Azul, no Sudão',
    {
      author: 'Wd adil',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Blue_nile_state_2.jpg',
    },
  ),
  'tecnico-saude-ambiental': photo(
    'careers',
    'tecnico-saude-ambiental',
    'Técnico de água e saneamento testa a qualidade da água num campo de deslocados',
    {
      author: 'Oxfam East Africa',
      license: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Ensuring_water_quality_(7831355868).jpg',
    },
  ),
  'tecnico-saude-publica': photo(
    'careers',
    'tecnico-saude-publica',
    'Duas agentes de saúde comunitária, de bata branca, na Etiópia',
    {
      author: 'USAID Africa Bureau',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:Community_Health_Workers_(5762479865).jpg',
    },
  ),
  // The mental health careers (ADR 0010).
  'psicologo-clinico': photo(
    'careers',
    'psicologo-clinico',
    'Trabalhadoras de apoio psicossocial conversam com mulheres de uma comunidade, no Kivu do Sul, na República Democrática do Congo',
    {
      author: 'USAID Africa Bureau',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:Psychosocial_workers_help_rape_survivors_(5686874987).jpg',
    },
  ),
  // The business careers (ADR 0010): chosen from the file names and licences.
  contabilista: photo('careers', 'contabilista', 'Jovem contabilista a trabalhar', {
    author: 'Mweufika',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Young_%26_Dedicated_Accountant_at_Work.jpg',
  }),
  'tecnico-de-contabilidade': photo(
    'careers',
    'tecnico-de-contabilidade',
    'Jovens contabilistas a trabalhar',
    {
      author: 'Chimeremnma',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Young_accountants.jpg',
    },
  ),
  auditor: photo('careers', 'auditor', 'Profissionais de administração a trabalhar', {
    author: 'Mairabt',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Administradores.jpg',
  }),
  'auditor-interno': photo(
    'careers',
    'auditor-interno',
    'Trabalho com documentos no arquivo de uma câmara municipal',
    {
      author: 'Papischou',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Archives_de_la_Mairie_de_Ferk%C3%A9_1.jpg',
    },
  ),
  'tecnico-de-impostos': photo('careers', 'tecnico-de-impostos', 'Trabalho num escritório', {
    author: 'ThomasMoore1',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Office_work1.jpg',
  }),
  'analista-financeiro': photo(
    'careers',
    'analista-financeiro',
    'Profissional africano num escritório, com um portátil',
    {
      author: 'Minette Lontsie',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:African_in_a_office_with_a_laptop.jpg',
    },
  ),
  'controller-de-gestao': photo('careers', 'controller-de-gestao', 'Mulher a fazer uma apresentação', {
    author: 'Nebiyu.s',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Woman_doing_Presentation.jpg',
  }),
  tesoureiro: photo('careers', 'tesoureiro', 'Cambista a trabalhar com dinheiro', {
    author: 'Karoline.Piegdon',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Money_Changer.jpg',
  }),
  'analista-de-investimentos': photo(
    'careers',
    'analista-de-investimentos',
    'Homem de negócios a trabalhar',
    {
      author: 'George D Manta',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Business_Man.jpg',
    },
  ),
  'tecnico-de-cobrancas': photo('careers', 'tecnico-de-cobrancas', 'Mulheres ao telefone', {
    author: 'Nebiyu.s',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Women_on_a_phone.jpg',
  }),
  'gestor-de-clientes-bancario': photo(
    'careers',
    'gestor-de-clientes-bancario',
    'Trabalho num banco no Quénia',
    {
      author: 'Berbeture',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Family_bank.jpg',
    },
  ),
  'operador-de-caixa-bancario': photo(
    'careers',
    'operador-de-caixa-bancario',
    'Caixa de um banco a atender um cliente',
    {
      author: 'AMISOM Public Information',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:2014_11_16_International_Somali_Banking_09_(15640555109).jpg',
    },
  ),
  'analista-de-credito': photo('careers', 'analista-de-credito', 'Reunião de microcrédito na África do Sul', {
    author: 'GiveWell',
    license: 'CC BY 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Small_Enterprise_Foundation_-_microfinance_meeting.jpg',
  }),
  'analista-de-risco': photo('careers', 'analista-de-risco', 'Trabalho num escritório', {
    author: 'Dflis',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Office_place.jpg',
  }),
  'tecnico-de-compliance': photo(
    'careers',
    'tecnico-de-compliance',
    'Verificação de documentos num arquivo',
    {
      author: 'Mouahé',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Archives_de_la_Mairie_de_Ferk%C3%A9_2.jpg',
    },
  ),
  actuario: photo('careers', 'actuario', 'Sessão de apresentação', {
    author: 'Linhuh',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Une_s%C3%A9ance_de_pr%C3%A9sentation.jpg',
  }),
  'tecnico-de-seguros': photo('careers', 'tecnico-de-seguros', 'Funcionária a introduzir dados', {
    author: 'Aristidek5maya',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:R%C3%A9ceptionniste_de_saisie_4.jpg',
  }),
  'mediador-de-seguros': photo('careers', 'mediador-de-seguros', 'Mulher de negócios a assinar contratos', {
    author: 'Melchisedek ABAKA',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_businesswoman_signing_contracts.jpg',
  }),
  'gestor-de-empresas': photo('careers', 'gestor-de-empresas', 'Mulher de negócios a trabalhar', {
    author: 'Emily Onyango',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Business_woman.jpg',
  }),
  'consultor-de-gestao': photo('careers', 'consultor-de-gestao', 'Formação de jovens empresários', {
    author: 'Ejay273',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Training_young_Business_people.jpg',
  }),
  'assistente-administrativo': photo('careers', 'assistente-administrativo', 'Recepcionista a trabalhar', {
    author: 'Adeolu Paul',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Receptionist_at_work.jpg',
  }),
  'secretario-executivo': photo('careers', 'secretario-executivo', 'Trabalho de escritório no Quénia', {
    author: 'Moritz Poll',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Kenya_Office_Work.jpg',
  }),
  'tecnico-de-compras': photo(
    'careers',
    'tecnico-de-compras',
    'Responsável de armazém e agente verificam uma carga de arroz, em Dacar',
    {
      author: 'Lemonblind',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Warehouse_manager_and_survey_agent_supervise_rice_cargo_in_a_Dakar_warehouse.jpg',
    },
  ),
  'tecnico-de-recursos-humanos': photo(
    'careers',
    'tecnico-de-recursos-humanos',
    'Mulher a trabalhar num escritório',
    {
      author: 'Moussa Kalapo',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Une_femme_travaillant.jpg',
    },
  ),
  'gestor-de-recursos-humanos': photo('careers', 'gestor-de-recursos-humanos', 'Fórum de empresas', {
    author: 'Gabriel Rockwell',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Resilient_Business_forum.jpg',
  }),
  'tecnico-de-recrutamento': photo('careers', 'tecnico-de-recrutamento', 'Feira de emprego no Egipto', {
    author: 'Aimty17',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Places_for_jobs.jpg',
  }),
  'tecnico-de-salarios': photo(
    'careers',
    'tecnico-de-salarios',
    'Funcionário de registos e arquivos no Gana',
    {
      author: 'Joy Agyepong',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:PRAAD_Records_Officer.jpg',
    },
  ),
  'tecnico-comercial': photo('careers', 'tecnico-comercial', 'Assistente de vendas a trabalhar', {
    author: 'Loisescobar',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Sales_assistent.jpg',
  }),
  'gestor-comercial': photo('careers', 'gestor-comercial', 'Chefe de uma agência de telecomunicações', {
    author: 'Marnel fr',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Chef_agence_Moov.jpg',
  }),
  'gestor-de-marketing': photo('careers', 'gestor-de-marketing', 'Jovens donos de negócios', {
    author: 'Ejay273',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Young_business_owners.jpg',
  }),
  'gestor-de-loja': photo('careers', 'gestor-de-loja', 'Trabalhador de um supermercado', {
    author: 'Muzungupeter',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Supermarket_worker.jpg',
  }),
  'tecnico-de-comercio-internacional': photo(
    'careers',
    'tecnico-de-comercio-internacional',
    'Navios de contentores no porto de Lomé, no Togo',
    {
      author: 'Brendertogo',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Container_ships_at_Lome_port_(cropped).jpg',
    },
  ),
  economista: photo('careers', 'economista', 'Cimeira de jovens africanos numa universidade do Gana', {
    author: 'Totibill2017',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Young_African_Summit_at_Ashesi_University.jpg',
  }),
  'analista-de-estudos-economicos': photo(
    'careers',
    'analista-de-estudos-economicos',
    'Reunião de trabalho',
    {
      author: 'Alex Ndongmo',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:R%C3%A9union_Intelligentsia-1.jpg',
    },
  ),
  'gestor-de-projectos': photo('careers', 'gestor-de-projectos', 'Engenheiros numa obra', {
    author: 'Manu4ster',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Engineers_at_the_Construction_Site_13.jpg',
  }),
  'coordenador-de-projectos': photo('careers', 'coordenador-de-projectos', 'Mulher engenheira a trabalhar', {
    author: 'ADAMBITA',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Une_femme_ing%C3%A9nieur.jpg',
  }),
  'planeador-de-projectos': photo('careers', 'planeador-de-projectos', 'Arquitecta urbanista no Togo', {
    author: 'gabedem',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:-1_Femme_Architecte_urbaniste_TOGO.jpg',
  }),
  'gestor-de-programas-e-portfolio': photo(
    'careers',
    'gestor-de-programas-e-portfolio',
    'Reunião informal de trabalho',
    {
      author: 'Nebiyu.s',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Informal_Meeting.jpg',
    },
  ),
  'scrum-master': photo('careers', 'scrum-master', 'Reunião diária de uma equipa junto ao quadro Scrum', {
    author: 'Nghungdo',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:H%E1%BB%8Dp_Scrum_h%C3%A0ng_ng%C3%A0y_.jpg',
  }),
  // The oil and mining careers (ADR 0010): chosen from the file names and licences.
  'engenheiro-de-petroleos': photo('careers', 'engenheiro-de-petroleos', 'Trabalho num campo de petróleo', {
    author: 'Xoref',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Work_in_petroleum_field.jpg',
  }),
  'engenheiro-de-perfuracao': photo(
    'careers',
    'engenheiro-de-perfuracao',
    'Local de um poço, com o equipamento de uma sonda de perfuração',
    {
      author: 'Houanjeen’aih',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Platform_for_unloading_a_vehicle,_Well_Sa-55_Site.jpg',
    },
  ),
  'engenheiro-de-processos-de-refinacao': photo(
    'careers',
    'engenheiro-de-processos-de-refinacao',
    'Refinaria na Cidade do Cabo, na África do Sul',
    {
      author: 'Discott',
      license: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Chevron_Oil_Refinery_017.JPG',
    },
  ),
  'operador-de-producao-petrolifera': photo(
    'careers',
    'operador-de-producao-petrolifera',
    'Transferência de pessoal entre uma plataforma de petróleo e um navio de apoio',
    {
      author: 'GuavaTrain',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:Oil_Platform_Crew_Transfer.jpg',
    },
  ),
  'engenheiro-de-minas': photo('careers', 'engenheiro-de-minas', 'Equipa numa mina subterrânea', {
    author: 'Shahir Chundra',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Underground_Mining_team.jpg',
  }),
  geologo: photo('careers', 'geologo', 'Procura de tanzanite perto do Kilimanjaro, na Tanzânia', {
    author: 'Africraigs',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Searching_for_Tanzanite_beneath_Mt_Kilimanjaro.jpg',
  }),
  geofisico: photo('careers', 'geofisico', 'Navio de pesquisa sísmica', {
    author: 'Veedar at English Wikipedia',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:MV_Polar_Princess_1999.jpg',
  }),
  'engenheiro-metalurgico': photo('careers', 'engenheiro-metalurgico', 'Fundição de metal', {
    author: 'Samson iron',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Metal_casting.jpg',
  }),
  'tecnico-de-manutencao-mecanica': photo(
    'careers',
    'tecnico-de-manutencao-mecanica',
    'Mulher a trabalhar numa oficina de metal',
    {
      author: 'Natnael Tadele',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Mechanic_at_metal_workshop_2.jpg',
    },
  ),
  'mecanico-de-sonda': photo('careers', 'mecanico-de-sonda', 'Mecânico nigeriano a trabalhar', {
    author: 'Jamie Tubers',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Nigerian_Mechanic_at_work2.jpg',
  }),
  // The oil and mining careers (ADR 0010): chosen from the file names and licences.
  // The oil and mining careers (ADR 0010): chosen from the file names and licences.
  'soldador-industrial': photo('careers', 'soldador-industrial', 'Grupo de soldadores a trabalhar', {
    author: 'Minette Lontsie',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_group_of_welders_at_work.jpg',
  }),
  'rigger-e-operador-de-grua': photo('careers', 'rigger-e-operador-de-grua', 'Gruas de um porto', {
    author: 'Bob Adams from Amanzimtoti, South Africa',
    license: 'CC BY-SA 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Cranes_on_The_Bluff_(40597852504).jpg',
  }),
  'operador-de-maquinas-pesadas': photo('careers', 'operador-de-maquinas-pesadas', 'Escavadora a trabalhar', {
    author: 'Johnkekam',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Pelleteuse4.jpg',
  }),
  'tecnico-de-instrumentacao': photo('careers', 'tecnico-de-instrumentacao', 'Técnico em serviço', {
    author: 'Emmanuel masetera',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Technician_on_duty.jpg',
  }),
  'tecnico-de-procurement': photo('careers', 'tecnico-de-procurement', 'Formação em manuseamento de cargas', {
    author: 'Mathube',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Manual_handling_training.jpg',
  }),
  // The oil and mining careers (ADR 0010): chosen from the file names and licences.
  'engenheiro-civil': photo(
    'careers',
    'engenheiro-civil',
    'Construção de salas de aula em Mbengwi, nos Camarões',
    {
      author: 'EzekielFokam',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Construction_of_classrooms_by_Mbengwi_council.jpg',
    },
  ),
  'tecnico-de-obras': photo('careers', 'tecnico-de-obras', 'Trabalhadores numa obra na Etiópia', {
    author: 'Yamlakkassa',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Construction_site_workers_in_Ethiopia.jpg',
  }),
  'medidor-orcamentista': photo('careers', 'medidor-orcamentista', 'Arquitecta urbanista no Togo', {
    author: 'gabedem',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:-3_Femme_Architecte_urbaniste_TOGO.jpg',
  }),
  topografo: photo('careers', 'topografo', 'Topógrafo numa obra', {
    author: 'Sammya Nig Ltd',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Surveyor_on_site.jpg',
  }),
  'engenheiro-hidraulico': photo('careers', 'engenheiro-hidraulico', 'Construção de uma barragem', {
    author: 'Shahir Chundra',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Dam_construction.jpg',
  }),
  arquitecto: photo('careers', 'arquitecto', 'Arquitecta urbanista no Togo', {
    author: 'gabedem',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:-2_Femme_Architecte_urbaniste_TOGO.jpg',
  }),
  urbanista: photo('careers', 'urbanista', 'Construção de uma estrada à noite', {
    author: 'Deo photographer',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Road_Construction_at_night.jpg',
  }),
  'desenhador-projectista': photo('careers', 'desenhador-projectista', 'Desenhador a lápis', {
    author: 'SAgbley',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Pencil_Sketch_artist.jpg',
  }),
  'engenheiro-mecanico': photo('careers', 'engenheiro-mecanico', 'Jovem engenheiro e empreendedor', {
    author: 'Mwaoch',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_young_entreprenuer_and_engineer.jpg',
  }),
  'engenheiro-de-manutencao': photo(
    'careers',
    'engenheiro-de-manutencao',
    'Trabalhos de manutenção numa refinaria',
    {
      author: 'Okane nyatoh daniel',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Maintenance_work_in_the_refinery.jpg',
    },
  ),
  'engenheiro-de-producao-industrial': photo(
    'careers',
    'engenheiro-de-producao-industrial',
    'Instalação de tubagens numa central eléctrica',
    {
      author: 'Nicolás Adamo',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Piping_Installation_in_a_Power_Plant.jpg',
    },
  ),
  'engenheiro-mecatronico': photo('careers', 'engenheiro-mecatronico', 'Mulher mecânica a trabalhar', {
    author: 'Photokadaffi',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Femme_mecanicienne8.jpg',
  }),
  'engenheiro-quimico': photo('careers', 'engenheiro-quimico', 'Técnico de laboratório', {
    author: 'Isaiah Maghanga',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Lab_Technician.jpg',
  }),
  'tecnico-de-seguranca-no-trabalho': photo(
    'careers',
    'tecnico-de-seguranca-no-trabalho',
    'Homens a trabalhar numa obra',
    {
      author: 'KelvinJM',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Men_working_at_building_site.jpg',
    },
  ),
  'engenheiro-electrotecnico': photo(
    'careers',
    'engenheiro-electrotecnico',
    'Trabalhadores da electricidade',
    {
      author: 'Unique koncept',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Electricity_workers.jpg',
    },
  ),
  'tecnico-electricista': photo('careers', 'tecnico-electricista', 'Electricista a trabalhar', {
    author: 'Happi Raphael',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Electrician_03.jpg',
  }),
  'engenheiro-de-energias-renovaveis': photo(
    'careers',
    'engenheiro-de-energias-renovaveis',
    'Instalação de um sistema solar no Quénia',
    {
      author: 'PowerAfricaSolar',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:3.6_Kw_Solar_System_Installation_In_Kenya.jpg',
    },
  ),
  // The oil and mining careers (ADR 0010): chosen from the file names and licences.
  'educador-de-infancia': photo(
    'careers',
    'educador-de-infancia',
    'Iniciação à língua inglesa com crianças pequenas',
    {
      author: 'Totibill2017',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:English_language_Initiation.jpg',
    },
  ),
  'professor-do-ensino-primario': photo(
    'careers',
    'professor-do-ensino-primario',
    'Professora do ensino primário',
    {
      author: 'Minette Lontsie',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Primary_School_Teacher_2.jpg',
    },
  ),
  'professor-de-educacao-especial': photo(
    'careers',
    'professor-de-educacao-especial',
    'Professora do ensino primário',
    {
      author: 'Minette Lontsie',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Primary_School_Teacher.jpg',
    },
  ),
  'professor-de-matematica': photo(
    'careers',
    'professor-de-matematica',
    'Professora com traje africano na sala de aula',
    {
      author: 'Ngozi Stella Udechukwu',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Teacher_with_African_attire_in_the_class.jpg',
    },
  ),
  'professor-de-lingua-portuguesa': photo(
    'careers',
    'professor-de-lingua-portuguesa',
    'Professor a dar aula ao ar livre',
    {
      author: 'Masako Kato',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Outside_teacher.jpg',
    },
  ),
  'professor-de-linguas-estrangeiras': photo(
    'careers',
    'professor-de-linguas-estrangeiras',
    'Professor a mostrar algo aos alunos num telemóvel',
    {
      author: 'Kwameghana(Bright Kwame Ayisi)',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:A_teacher_showing_some_students_something_on_a_phone.jpg',
    },
  ),
  'professor-de-biologia': photo('careers', 'professor-de-biologia', 'Trabalho de laboratório', {
    author: 'Hope2018',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Essential_Lab_Work.jpg',
  }),
  'professor-de-quimica': photo('careers', 'professor-de-quimica', 'Jovem cientista a trabalhar', {
    author: 'Mistaiyke',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Young_and_Upcoming_Scientist_02.jpg',
  }),
  'professor-de-fisica': photo('careers', 'professor-de-fisica', 'Professor de Física', {
    author: 'Oni Idowu',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_physics_teacher.jpg',
  }),
  'professor-de-historia': photo('careers', 'professor-de-historia', 'Escola debaixo das árvores no Gana', {
    author: 'A.Kauffeld from USAID in Africa',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Ghana_school_under_the_trees.jpg',
  }),
  'professor-de-geografia': photo('careers', 'professor-de-geografia', 'Aula na África Oriental em 1975', {
    author: 'Aart Rietveld',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:ASC_Leiden_-_Rietveld_Collection_-_East_Africa_1975_-_05_-_029A_-_050_-_Black_school_boys_in_white_shirts_and_a_female_black_teacher_in_a_blue_dress_in_a_dark_classroom_-_Zambia_or_Zimbabwe.jpg',
  }),
  'professor-de-filosofia': photo(
    'careers',
    'professor-de-filosofia',
    'Reabertura da Universidade Nacional da Somália',
    {
      author: 'AMISOM Public Information',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:2014_10_23_Somali_National_University_Re-opens_(15612309441).jpg',
    },
  ),
  'professor-de-informatica': photo(
    'careers',
    'professor-de-informatica',
    'Professor a ensinar informática',
    {
      author: 'Nduati.githae',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Teacher_teaches_computers.jpg',
    },
  ),
  'professor-do-ensino-tecnico': photo(
    'careers',
    'professor-do-ensino-tecnico',
    'Aula de mecânica auto num centro de jovens, na Zâmbia',
    {
      author: 'IICD from The Hague, The Netherlands',
      license: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Auto_mechanics_class_at_Chawama_Youth_Resource_Centre_(5348624275).jpg',
    },
  ),
  pedagogo: photo('careers', 'pedagogo', 'Reunião de professores primários em Narok, no Quénia', {
    author: 'Sam chepkilot',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Primary_school_teachers_staff_meeting_in_Maasai_land,_Narok.jpg',
  }),
  'especialista-de-administracao-da-educacao': photo(
    'careers',
    'especialista-de-administracao-da-educacao',
    'Visita a uma escola primária na Tanzânia',
    {
      author: 'USAID in Africa',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:Mission_Director_visits_primary_school,_Tanzania_(25856084078).jpg',
    },
  ),
  'director-escolar': photo('careers', 'director-escolar', 'Educação na África do Sul', {
    author: 'USAID in Africa',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Education_in_South_Africa_(8329322789).jpg',
  }),
  'docente-do-ensino-superior': photo(
    'careers',
    'docente-do-ensino-superior',
    'Docente universitário a trabalhar',
    {
      author: 'Flixtey',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Lecturer_at_Work.jpg',
    },
  ),
  'formador-profissional': photo('careers', 'formador-profissional', 'Formação de formadores', {
    author: 'International Maritime Organization',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:GloMEEP_Global_train-the-trainer_(27250687156).jpg',
  }),
  'tecnico-de-emprego-e-formacao': photo('careers', 'tecnico-de-emprego-e-formacao', 'Mulheres a trabalhar', {
    author: 'Architect',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Wiki_loves_Africa_-_women_at_work.jpg',
  }),
  'professor-de-educacao-fisica': photo(
    'careers',
    'professor-de-educacao-fisica',
    'Aquecimento para andebol numa universidade da Nigéria',
    {
      author: 'Godstime Elijah',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Handball_warmup_session_at_unilorin_20.jpg',
    },
  ),
  'treinador-desportivo': photo('careers', 'treinador-desportivo', 'Estádio de futebol', {
    author: 'Bryn Pinzgauer',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Football_stadium_(6178263468).jpg',
  }),
  'preparador-fisico': photo('careers', 'preparador-fisico', 'Sessão de aeróbica', {
    author: 'Godstime Elijah',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Aerobics_session_by_dettol_cool_8.jpg',
  }),
  'gestor-desportivo': photo('careers', 'gestor-desportivo', 'Estádio 11 de Novembro, em Luanda', {
    author: 'L.Willms',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Estadio-11Nov-Luanda_03_linke-Seite-Bogen_LWS-2011-08-NC_0991.jpg',
  }),
  // The law careers (ADR 0010): chosen from the file names and licences.
  advogado: photo(
    'careers',
    'advogado',
    'Estudantes de Direito a alegar num tribunal simulado, na ronda africana de uma competição',
    {
      author: 'ELSA International from Belgium',
      license: 'CC BY-SA 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:15th_EMC2_-_African_Regional_Round_(34233956221).jpg',
    },
  ),
  jurista: photo('careers', 'jurista', 'Contrato a ser assinado com uma caneta', {
    author: 'Blogtrepreneur',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Legal_Contract_%26_Signature_-_Warm_Tones.jpg',
  }),
  'mediador-de-conflitos': photo(
    'careers',
    'mediador-de-conflitos',
    'Formação em negociação e mediação, na Somália',
    {
      author: 'AMISOM Public Information',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:2017_06_Mediation_Training-3_(33244914656).jpg',
    },
  ),
  juiz: photo(
    'careers',
    'juiz',
    'Sala de audiências do Tribunal Constitucional da África do Sul, vista da bancada dos juízes',
    {
      author: 'Ijon',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Constitutional_Court_of_South_Africa_judges_view.jpg',
    },
  ),
  procurador: photo(
    'careers',
    'procurador',
    'Sessão de tribunal simulado na ronda africana de uma competição de Direito',
    {
      author: 'ELSA International from Belgium',
      license: 'CC BY-SA 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:15th_EMC2_-_African_Regional_Round_(34364701695).jpg',
    },
  ),
  'oficial-de-justica': photo('careers', 'oficial-de-justica', 'Complexo de tribunais no Gana', {
    author: 'Fquasie',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Law_Court_Complex_in_Ghana.jpg',
  }),
  'conservador-dos-registos': photo('careers', 'conservador-dos-registos', 'Livro de registos antigo', {
    author: 'Land Information New Zealand (LINZ), Dunedin Processing Centre Land an',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Southland_Register_of_Surveyors%27_Field_Books_1_to_329.jpg',
  }),
  notario: photo('careers', 'notario', 'Carimbo sobre uma almofada de tinta', {
    author: 'Dvortygirl',
    license: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Rubber_stamp_IMG_20190427_113849721_HDR.jpg',
  }),
  // The public administration careers (ADR 0010): chosen from the file names and licences.
  'tecnico-superior-de-administracao-publica': photo(
    'careers',
    'tecnico-superior-de-administracao-publica',
    'Trabalho de escritório no Quénia',
    {
      author: 'Moritz Poll',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Kenya_Office_Work.jpg',
    },
  ),
  'tecnico-de-contratacao-publica': photo(
    'careers',
    'tecnico-de-contratacao-publica',
    'Mulher a assinar contratos',
    {
      author: 'Melchisedek ABAKA',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:A_businesswoman_signing_contracts.jpg',
    },
  ),
  diplomata: photo('careers', 'diplomata', 'Embaixada de Angola em Washington', {
    author: 'AgnosticPreachersKid',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Embassy_of_Angola_2.jpg',
  }),
  'tecnico-de-cooperacao-internacional': photo(
    'careers',
    'tecnico-de-cooperacao-internacional',
    'Reunião entre a Comissão Europeia e a União Africana',
    {
      author: 'Europäische Kommission - Audiovisueller Dienst, Simon Maina, CE - Serv',
      license: 'CC BY 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:6th_EU-African_Union_Commission_meeting,_26-04-2013_(P-022985-00-07).jpg',
    },
  ),
  'analista-politico': photo(
    'careers',
    'analista-politico',
    'Formação de observadores eleitorais na Somália',
    {
      author: 'AMISOM Public Information',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:Somali_domestic_election_observers_receive_training_on_objective_election_assessment.jpg',
    },
  ),
  'investigador-criminal': photo(
    'careers',
    'investigador-criminal',
    'Mulheres polícias em formação de investigação criminal, na Somália',
    {
      author: 'AMISOM Public Information',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:AMISOM_Humanitarian_Mission_03_(8111814100).jpg',
    },
  ),
  'oficial-de-policia': photo('careers', 'oficial-de-policia', 'Agente da polícia a coordenar o trânsito', {
    author: 'Timmylegend',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_police_officer_coordinating_traffic.jpg',
  }),
  'perito-criminalista': photo(
    'careers',
    'perito-criminalista',
    'Trabalho num laboratório forense, em Bizerte, na Tunísia',
    {
      author: 'U.S. Army SETAF-AF by Lt. Col. Dale Barnes',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:US,_Tunisia_conduct_forensic_training_at_African_Lion_2025_(9009525).jpg',
    },
  ),
  // The sciences and humanities careers (ADR 0010): chosen from the file names and licences.
  'psicologo-do-trabalho': photo('careers', 'psicologo-do-trabalho', 'Entrevista de emprego num banco', {
    author: 'Aderogba Arimoro',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:The_Banking_Interview.jpg',
  }),
  'psicologo-escolar': photo(
    'careers',
    'psicologo-escolar',
    'Sessão de aconselhamento numa universidade da Nigéria',
    {
      author: 'Onwuka Glory',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Health_Counselling_Session_at_University_of_Nigeria_Nsukka.jpg',
    },
  ),
  'psicologo-forense': photo('careers', 'psicologo-forense', 'Psicólogo de aconselhamento a trabalhar', {
    author: 'Healme24',
    license: 'CC0',
    url: 'https://commons.wikimedia.org/wiki/File:Psychologist_at_work.jpg',
  }),
  sociologo: photo('careers', 'sociologo', 'Entrevista debaixo da árvore da palavra', {
    author: 'Oubaidallah',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Interview_sous_l%27arbre_%C3%A0_palabres.jpg',
  }),
  'tecnico-de-salvaguardas-sociais': photo(
    'careers',
    'tecnico-de-salvaguardas-sociais',
    'Encontro com a comunidade em Pehunco, no Benim',
    {
      author: 'U.S. Army Corps of Engineers from USA',
      license: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Pehunco_Health_Clinic_opens_(10602149933).jpg',
    },
  ),
  'assistente-social': photo(
    'careers',
    'assistente-social',
    'Assistente social num bairro de Katwe, no Uganda',
    {
      author: 'Muzungupeter',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Social_worker_in_Katwe_slum.jpg',
    },
  ),
  antropologo: photo('careers', 'antropologo', 'Museu Nacional de Antropologia, em Luanda', {
    author: 'Fabio Vanin',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Museu_antropologia_Luanda.JPG',
  }),
  demografo: photo('careers', 'demografo', 'Recenseadores do Censo de 2022 na África do Sul', {
    author: 'Discott',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:South_African_Census_workers_2022.jpg',
  }),
  'investigador-em-ciencias-sociais': photo(
    'careers',
    'investigador-em-ciencias-sociais',
    'Bibliotecários e investigadores no Ruanda',
    {
      author: 'Gerard van de Bruinhorst',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:ASC_Leiden_-_Rwanda_2021_-_082_-_A_Dutch_librarian_with_a_librarian_and_researcher_at_Kigali_Independent_University_-_Kigali.jpg',
    },
  ),
  historiador: photo('careers', 'historiador', 'Gravura antiga de Mbanza Kongo, capital do Reino do Kongo', {
    author: 'Thomas Astley',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:The_Bansa,_or_residence_of_the_King_of_Kongo,_called_St._Salvador_(M%27Banza_Kongo),_Astley_1745.jpg',
  }),
  arquivista: photo('careers', 'arquivista', 'Arquivista a classificar documentos', {
    author: '(c) Laurent Vella',
    license: 'CC0',
    url: 'https://commons.wikimedia.org/wiki/File:Classement_aux_Archives_municipales_de_Lyon.jpg',
  }),
  'tecnico-de-patrimonio-cultural': photo(
    'careers',
    'tecnico-de-patrimonio-cultural',
    'Museu Nacional da Escravatura, em Luanda',
    {
      author: 'João Sousa',
      license: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Museu_da_Escravatura_(Luanda,_Angola).jpg',
    },
  ),
  biologo: photo('careers', 'biologo', 'Pausa durante o trabalho de campo', {
    author: 'Martin Nielsen, M.Nielsen Photo',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Taking_a_break_from_fieldwork.jpg',
  }),
  biotecnologo: photo('careers', 'biotecnologo', 'Cientista biomédico a trabalhar no laboratório', {
    author: 'Distilledwalex (Alabi Olawale)',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:BIOMEDICAL_SCIENTIST_03.jpg',
  }),
  oceanografo: photo('careers', 'oceanografo', 'Cientista de peixes no laboratório', {
    author: 'Bruno ashimwe winks',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Fish_scientist_in_a_laboratory.jpg',
  }),
  meteorologista: photo(
    'careers',
    'meteorologista',
    'Estação meteorológica num centro de formação agrícola',
    {
      author: 'Gilbert Mwangi',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Weather_Monitoring.jpg',
    },
  ),
  'tecnico-de-conservacao-da-natureza': photo(
    'careers',
    'tecnico-de-conservacao-da-natureza',
    'Guarda no Parque Nacional de Bwindi, no Uganda',
    {
      author: 'Sal Roux',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Ranger_in_Bwindi_Impenetrable_National_Park.jpg',
    },
  ),
  'tecnico-de-qualidade-alimentar': photo(
    'careers',
    'tecnico-de-qualidade-alimentar',
    'Teste à pureza da água, na Nigéria',
    {
      author: 'Obedmakolo',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Borehole_drilling_testing_the_purity_of_the_water.jpg',
    },
  ),
  'tecnico-de-recursos-hidricos': photo(
    'careers',
    'tecnico-de-recursos-hidricos',
    'Abertura de um furo de água na Nigéria',
    {
      author: 'Ransome Telli',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Borehole_drilling_in_Luvu_Madaki,_Nassarawa_state.jpg',
    },
  ),
  'oficial-da-marinha-mercante': photo(
    'careers',
    'oficial-da-marinha-mercante',
    'Oficial na ponte de comando de um navio',
    {
      author: 'Julian Lupyan',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:Officer_in_the_Bridge_of_a_Cruise_Ship,_2025.jpg',
    },
  ),
  quimico: photo('careers', 'quimico', 'Aula de laboratório de química numa universidade da Namíbia', {
    author: 'Checamj04',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Labpractice.jpg',
  }),
  fisico: photo('careers', 'fisico', 'Física a trabalhar', {
    author: 'Kesego Kgaswane',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Lady_Physicist.jpg',
  }),
  matematico: photo('careers', 'matematico', 'Aula de matemática numa universidade', {
    author: 'Tungsten',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Mathematics_lecture_at_the_Helsinki_University_of_Technology.jpg',
  }),
  estatistico: photo('careers', 'estatistico', 'Analista de dados a trabalhar no Quénia', {
    author: 'Dwalsh3',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Solar_Data_Analyst_at_Work_in_Kenya.jpg',
  }),
  'investigador-cientifico': photo('careers', 'investigador-cientifico', 'Investigadores num laboratório', {
    author: 'Rhoda Baer (Photographer)',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Researchers_in_laboratory.jpg',
  }),
  // The communication, languages and arts careers (ADR 0010): chosen from the file names and licences.
  jornalista: photo('careers', 'jornalista', 'Jornalista do Gana a entrevistar um artesão', {
    author: 'Fquasie',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Journalist_interviewing.jpg',
  }),
  'editor-de-video': photo('careers', 'editor-de-video', 'Assistente de câmara numa gravação', {
    author: 'FridayFilmboy',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Female_2nd_cameraman.jpg',
  }),
  'tecnico-de-relacoes-publicas': photo(
    'careers',
    'tecnico-de-relacoes-publicas',
    'Conferência de imprensa',
    {
      author: 'Nekisvincent',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Conference_presse_Can4.jpg',
    },
  ),
  'gestor-de-redes-sociais': photo(
    'careers',
    'gestor-de-redes-sociais',
    'Mulheres a trabalhar em computadores',
    {
      author: 'Minette Lontsie',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:African_Women_working_on_computers.jpg',
    },
  ),
  'assessor-de-comunicacao': photo(
    'careers',
    'assessor-de-comunicacao',
    'Conferência de imprensa em Mogadíscio',
    {
      author: 'AMISOM Public Information',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:2014_08_11-AMISOM_press_Briefing-4_(14698144697).jpg',
    },
  ),
  tradutor: photo('careers', 'tradutor', 'Página de um dicionário antigo', {
    author: 'Ferdinand Schulthess',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Dictionary_typography_symbols.jpg',
  }),
  interprete: photo('careers', 'interprete', 'Intérprete de língua gestual', {
    author: 'Myblueberet',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Sign_language_communicator.jpg',
  }),
  'revisor-de-textos': photo(
    'careers',
    'revisor-de-textos',
    'Formação sobre transcrição e revisão de manuscritos',
    {
      author: 'Filipinayzd',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Wikisource_Loves_Manuscripts_Philippines_Training_Program_06.jpg',
    },
  ),
  linguista: photo('careers', 'linguista', 'Professor a escrever no quadro', {
    author: 'Oni Idowu',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_teacher_writing_on_the_board.jpg',
  }),
  realizador: photo('careers', 'realizador', 'Equipa de filmagem na Tanzânia', {
    author: 'Thukuk',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_film_crew_in_Tanzania.jpg',
  }),
  actor: photo('careers', 'actor', 'Edifício do Elinga Teatro, em Luanda', {
    author: 'Fabio Vanin',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Elinga_teatro_Luanda_02.JPG',
  }),
  musico: photo('careers', 'musico', 'Guitarra artesanal feita em Kinshasa', {
    author: 'Jeanne Vu Van',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Artisanal_guitar_made_in_Kinshasa,_Democratic_Republic_of_Congo.jpg',
  }),
  'artista-plastico': photo('careers', 'artista-plastico', 'Artista a pintar', {
    author: 'Amuzujoe',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Artist_02.jpg',
  }),
  'designer-de-moda': photo('careers', 'designer-de-moda', 'Designer de moda no seu atelier, na Tanzânia', {
    author: 'Thukuk',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_fashion_designer_working_in_her_office_in_Tanzania.jpg',
  }),
  'gestor-cultural': photo('careers', 'gestor-cultural', 'Concerto num festival no Senegal', {
    author: 'M.GADJ!',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Concert_lors_du_Dialaw_Festival_%C3%A0_Toubab_Dialaw.jpg',
  }),
  // The agriculture, logistics and tourism careers (ADR 0010): chosen from the file names and licences.
  'engenheiro-agronomo': photo('careers', 'engenheiro-agronomo', 'Inspecção de arrozais em Apac, no Uganda', {
    author: 'Bram Jacobs',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Inspection_of_rice_fields_in_Apac,_Uganda.jpg',
  }),
  'tecnico-agropecuario': photo('careers', 'tecnico-agropecuario', 'Técnico de extensão rural', {
    author: 'Samuel Macharia',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Farm_Extension_Worker.jpg',
  }),
  'engenheiro-florestal': photo(
    'careers',
    'engenheiro-florestal',
    'Imbondeiro, a árvore nacional de Angola',
    {
      author: 'Alfred Weidinger from Vienna, Austria',
      license: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Imbondeiro_Tree.jpg',
    },
  ),
  'gestor-de-empresas-agricolas': photo(
    'careers',
    'gestor-de-empresas-agricolas',
    'Mecanização agrícola em Oromia, na Etiópia',
    {
      author: 'Lucy Shaw',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Farm_mechanization_in_Oromia.jpg',
    },
  ),
  'engenheiro-agroalimentar': photo(
    'careers',
    'engenheiro-agroalimentar',
    'Mulheres a produzir garri, derivado da mandioca',
    {
      author: 'Ei’eke',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Women_making_garri.jpg',
    },
  ),
  'medico-veterinario': photo('careers', 'medico-veterinario', 'Médica veterinária', {
    author: 'Barispearl',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Female,_Veterinarian,_Proud.jpg',
  }),
  zootecnico: photo('careers', 'zootecnico', 'Gado na área de pasto', {
    author: 'Ester Gasper Kimario',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Livestock_at_the_grazing_area.jpg',
  }),
  'tecnico-de-aquicultura': photo('careers', 'tecnico-de-aquicultura', 'Criação de peixe em tanques', {
    author: 'TChukwuemeka',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Fish_farming_in_ponds.jpg',
  }),
  'biologo-marinho': photo('careers', 'biologo-marinho', 'Trabalho de investigação pesqueira', {
    author: 'NASA',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Fis00523_19592006359_o.jpg',
  }),
  'tecnico-de-pescas': photo('careers', 'tecnico-de-pescas', 'Pescadores em Angola', {
    author: 'Paulo César Santos',
    license: 'CC0',
    url: 'https://commons.wikimedia.org/wiki/File:Fishermen_in_Angola.JPG',
  }),
  'engenheiro-do-ambiente': photo(
    'careers',
    'engenheiro-do-ambiente',
    'Garrafas de plástico para tratamento',
    {
      author: 'Lanrupacoco',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Waste_Plastic_Bottles.jpg',
    },
  ),
  'tecnico-de-ambiente': photo('careers', 'tecnico-de-ambiente', 'Trabalho de reciclagem', {
    author: 'Andrew Kartende',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Recycler.jpg',
  }),
  'gestor-de-logistica': photo(
    'careers',
    'gestor-de-logistica',
    'Chefe de armazém a verificar carga de arroz em Dakar',
    {
      author: 'Lemonblind',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Warehouse_manager_and_survey_agent_supervise_rice_cargo_in_a_Dakar_warehouse.jpg',
    },
  ),
  'tecnico-de-logistica': photo('careers', 'tecnico-de-logistica', 'Formação em movimentação de cargas', {
    author: 'Mathube',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Manual_handling_training.jpg',
  }),
  'despachante-aduaneiro': photo(
    'careers',
    'despachante-aduaneiro',
    'Movimentação de contentores num porto',
    {
      author: 'houaito affo daniel',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:D%C3%A9placement_de_containers_maritimes.jpg',
    },
  ),
  'tecnico-de-transportes': photo(
    'careers',
    'tecnico-de-transportes',
    'Locomotiva do Caminho de Ferro de Benguela em 1973',
    {
      author: 'Sokfikis',
      license: 'CC BY 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Locomotiva_do_CFB_em_1973.jpg',
    },
  ),
  'engenheiro-de-transportes': photo(
    'careers',
    'engenheiro-de-transportes',
    'Estação da Catumbela, no Caminho de Ferro de Benguela',
    {
      author: 'Claus Bunks aka Afrobrasil on flickr',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:Catumbela_station.jpg',
    },
  ),
  'gestor-portuario': photo('careers', 'gestor-portuario', 'Zona do Porto de Luanda', {
    author: 'Paulo César Santos',
    license: 'CC0',
    url: 'https://commons.wikimedia.org/wiki/File:Zona_do_porto_de_Luanda.JPG',
  }),
  'inspector-de-aviacao-civil': photo('careers', 'inspector-de-aviacao-civil', 'Inspecção de um avião', {
    author: 'U.S. Navy photo by Petty Officer 2nd Class Jacquelin Frost',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Grey_Knights_and_Totems_Conduct_Aircraft_Inspection_(8994492).jpg',
  }),
  'gestor-hoteleiro': photo('careers', 'gestor-hoteleiro', 'Formação de funcionários de hotel na Guiné', {
    author: 'CDC Global',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Training_hotel_employees_in_Guinea_(2).jpg',
  }),
  'recepcionista-de-hotel': photo('careers', 'recepcionista-de-hotel', 'Recepcionista de hotel', {
    author: 'Appreciating Beauty Photography',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Female_Hotel_Receptionist.jpg',
  }),
  'tecnico-de-turismo': photo('careers', 'tecnico-de-turismo', 'Parque Nacional do Iona, em Angola', {
    author: 'Edward Middleton',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Parque_Nacional_do_lona_10.jpg',
  }),
  'guia-turistico': photo('careers', 'guia-turistico', 'Guia turística', {
    author: 'Lilian Maina',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Lady_tour_guide.jpg',
  }),
  'chefe-de-cozinha': photo('careers', 'chefe-de-cozinha', 'Chefe de cozinha a trabalhar', {
    author: 'Jokromberg',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Chef_in_the_kitchen.jpg',
  }),
  'gestor-de-restauracao': photo('careers', 'gestor-de-restauracao', 'Empregado de mesa', {
    author: 'Hnkamwa',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Serveur.jpg',
  }),
}

// Course photos, as an institution would publish them. Same licence rules as above.
export const PROGRAM_IMAGES: Partial<Record<string, Photo>> = {
  'eng-informatica': photo(
    'courses',
    'eng-informatica',
    'Apresentação numa sala com portáteis e um projetor',
    {
      author: 'HedegoNegash',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Software_as_a_service_pilot_presentation.jpg',
    },
  ),
  'ciencias-computacao': photo(
    'courses',
    'ciencias-computacao',
    'Anfiteatro universitário com estudantes numa aula',
    {
      author: 'Silverly 07',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Learning_at_FUTO.jpg',
    },
  ),
  'tecnico-informatica': photo(
    'courses',
    'tecnico-informatica',
    'Alunos ao computador numa aula prática, com o professor',
    {
      author: 'Chichriso',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:My_CorelDraw_practical_class_with_my_school_pupil_in_September,_2016.jpg',
    },
  ),
  'web-react': photo('courses', 'web-react', 'Formação com participantes a trabalhar nos portáteis', {
    author: 'Markku Liukkonen',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Mr._Peik_Johansson_conducting_an_Misa_Tanzania_training_at_Dar_es_Salaam,_Tanzania.jpg',
  }),
  'web-centro': photo('courses', 'web-centro', 'Sessão de formação com computadores numa sala', {
    author: 'Jamie Tubers',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:WLA_2017_Workshop_-_25th_November_2017_11.jpg',
  }),
  'bootcamp-frontend': photo('courses', 'bootcamp-frontend', 'Estudante a ler no ecrã do portátil', {
    author: 'Jaokov',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_student_reading_from_a_laptop.jpg',
  }),
  'analise-dados': photo(
    'courses',
    'analise-dados',
    'Estudante ao computador, com notas ao lado do teclado',
    {
      author: 'Minette Lontsie',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:A_Lady_on_a_computer.jpg',
    },
  ),
  estatistica: photo('courses', 'estatistica', 'Sala de seminário com projetor e participantes', {
    author: 'Mauryndinar',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Pact_Inc,_Kenya_Staff.jpg',
  }),
  'ui-ux': photo('courses', 'ui-ux', 'Esboços de logótipos ao lado de um monitor com uma paleta de cores', {
    author: 'Claireneon',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Logo_design_sketching.jpg',
  }),
  'lic-design': photo('courses', 'lic-design', 'Designer a desenhar logótipos a caneta', {
    author: 'Claireneon',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Logo_designer_using_pen_and_paper.jpg',
  }),
  'figma-benguela': photo('courses', 'figma-benguela', 'Escolha de tipos de letra num tablet, com caneta', {
    author: 'Claireneon',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Font_selection_for_logo_design.jpg',
  }),
  'eng-informatica-publica': photo(
    'courses',
    'eng-informatica-publica',
    'Laboratório de informática universitário, com filas de computadores',
    {
      author: 'UndueMarmot',
      license: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:De_La_Salle_University_%E2%80%93_Dasmari%C3%B1as_(DLSU%E2%80%93D)_Information_and_Communications_Technology_Center_(ICTC)_laboratory_room_203_(ICT203)_%E2%80%94_normal_view.jpg',
    },
  ),
  'analise-dados-centro': photo(
    'courses',
    'analise-dados-centro',
    'Equipa a trabalhar em portáteis numa sala de formação',
    {
      author: 'Ismizotz',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:ZoomTanzania%27s_Workplace.jpg',
    },
  ),
}
