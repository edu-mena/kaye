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
