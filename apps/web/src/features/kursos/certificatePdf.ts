import { saveFile } from '../../lib/saveFile'

// The course certificate, made on the device like the CV PDF (docs/decisoes/0006): A4 landscape,
// with a diagonal watermark. Test version: it has no validity (docs/decisoes/0016). jsPDF loads
// only when someone downloads.

export type CertificateData = {
  name: string
  course: string
  level: string
  date: string
  /** 0 to 1. */
  score: number
  hours: number
  code: string
  file: string
}

const NIGHT: [number, number, number] = [17, 17, 17]
const GOLD: [number, number, number] = [214, 168, 43]
const MUTED: [number, number, number] = [110, 110, 110]

export async function downloadCertificate(data: CertificateData) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  const center = width / 2

  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1.2)
  doc.rect(10, 10, width - 20, height - 20)
  doc.setLineWidth(0.3)
  doc.rect(14, 14, width - 28, height - 28)

  // The watermark goes first, so the text sits on top of it.
  const mark = 'SEM VALIDADE'
  const angle = 24
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(72)
  doc.setTextColor(236, 236, 236)
  const markWidth = doc.getTextWidth(mark)
  const radians = (angle * Math.PI) / 180
  doc.text(
    mark,
    center - (Math.cos(radians) * markWidth) / 2,
    height / 2 + (Math.sin(radians) * markWidth) / 2 + 10,
    {
      angle,
    },
  )

  doc.setTextColor(...GOLD)
  doc.setFontSize(12)
  doc.text('KAYÉ · KURSOS', center, 34, { align: 'center' })
  doc.setTextColor(...NIGHT)
  doc.setFontSize(30)
  doc.text('Certificado de conclusão', center, 52, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(...MUTED)
  doc.text('Certifica-se que', center, 70, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(...NIGHT)
  doc.text(data.name, center, 86, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(...MUTED)
  doc.text('concluiu o curso', center, 100, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...NIGHT)
  doc.text(`${data.course} · nível ${data.level}`, center, 114, { align: 'center' })

  const facts = [
    ['Data', data.date],
    ['Nota do exame', `${Math.round(data.score * 100)}%`],
    ['Horas de estudo', `${data.hours.toLocaleString('pt-PT', { maximumFractionDigits: 1 })} h`],
    ['Código', data.code],
  ]
  const column = (width - 60) / facts.length
  facts.forEach(([label, value], index) => {
    const x = 30 + column * index + column / 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text(label ?? '', x, 138, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...NIGHT)
    doc.text(value ?? '', x, 146, { align: 'center' })
  })

  doc.setDrawColor(...GOLD)
  doc.line(30, 168, width - 30, 168)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NIGHT)
  doc.text(
    'SEM VALIDADE: versão de teste do Kayé. Formação livre, não confere grau académico.',
    center,
    178,
    {
      align: 'center',
    },
  )

  saveFile(doc.output('blob'), data.file)
}
