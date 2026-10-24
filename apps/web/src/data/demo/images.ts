import type { Photo } from '../types'

// Photos from Wikimedia Commons (most from Wiki Loves Africa 2017, "people at work"), under free
// licences: CC BY-SA, CC BY or public domain. Cropped to 16:10 and saved at 800 and 1600 px as
// assets/<careers|courses>/<slug>-<width>.webp. Each page credits the author with a link to the original.
const FILES = import.meta.glob<string>(['../../assets/careers/*.webp', '../../assets/courses/*.webp'], {
  eager: true,
  import: 'default',
})

function photo(folder: 'careers' | 'courses', slug: string, alt: string, credit: Photo['credit']): Photo {
  const small = FILES[`../../assets/${folder}/${slug}-800.webp`]
  const large = FILES[`../../assets/${folder}/${slug}-1600.webp`]
  if (!small || !large) throw new Error(`Missing photo: ${folder}/${slug}`)
  return { small, large, alt, credit }
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
}
