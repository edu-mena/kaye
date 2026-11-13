import logo from '../../assets/kaye-logo.png'

// The psychotechnical result as a 1080×1920 image for Instagram, WhatsApp and TikTok stories:
// white, the person's name, the overall score, one bar per skill in its own block, and where to
// practise in a dark footer. Everything has a fixed place, so nothing can overlap.

const WIDTH = 1080
const HEIGHT = 1920
const PAD = 90
const INNER = WIDTH - PAD * 2
const WHITE = '#ffffff'
const NIGHT = '#16171b'
const BLUE = '#021d6d'
const GOLD = '#ffc000'
const GOLD_INK = '#8a6400'
const ASH = '#efede9'
const TRACK = '#e6e0d4'
const MUTED = '#66625b'
const FONT = "'Bricolage Grotesque Variable', system-ui, sans-serif"

export type StoryResult = {
  /** The person's first names; empty leaves the line out. */
  name: string
  kicker: string
  score: string
  summary: string
  skills: { label: string; value: number; valueLabel: string }[]
  cta: string
  url: string
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image), { once: true })
    image.addEventListener('error', () => resolve(null), { once: true })
    image.src = src
  })
}

function box(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, Math.min(radius, height / 2, width / 2))
  context.fill()
}

/** Writes on one line, shrinking the font until the text fits the width. */
function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  weight: number,
  size: number,
) {
  let current = size
  do {
    context.font = `${weight} ${current}px ${FONT}`
    current -= 4
  } while (context.measureText(text).width > INNER && current > 24)
  context.fillText(text, x, y)
}

export async function storyImage(result: StoryResult): Promise<Blob | null> {
  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (!context) return null
  context.textBaseline = 'alphabetic'

  context.fillStyle = WHITE
  context.fillRect(0, 0, WIDTH, HEIGHT)
  // The brand's gold, as a circle bleeding off the top corner.
  context.fillStyle = GOLD
  context.beginPath()
  context.arc(WIDTH - 20, 120, 230, 0, Math.PI * 2)
  context.fill()

  const mark = await loadImage(logo)
  if (mark) {
    const height = 104
    context.drawImage(mark, PAD, 110, (mark.width / mark.height) * height, height)
  }

  // Who and what.
  context.fillStyle = GOLD_INK
  context.font = `700 38px ${FONT}`
  context.fillText(result.kicker.toUpperCase(), PAD, 400)
  let y = 400
  if (result.name) {
    context.fillStyle = NIGHT
    fitText(context, result.name, PAD, 490, 700, 76)
    y = 490
  }

  // The score, with a gold underline.
  context.fillStyle = BLUE
  context.font = `800 250px ${FONT}`
  context.fillText(result.score, PAD - 10, y + 250)
  context.fillStyle = GOLD
  box(context, PAD, y + 285, 180, 14, 7)
  context.fillStyle = MUTED
  fitText(context, result.summary, PAD, y + 370, 400, 40)

  // One block with a row per skill.
  const top = y + 430
  const row = 112
  const blockHeight = 50 + result.skills.length * row
  context.fillStyle = ASH
  box(context, PAD - 30, top, INNER + 60, blockHeight, 40)
  let line = top + 80
  for (const skill of result.skills) {
    context.fillStyle = NIGHT
    context.font = `600 40px ${FONT}`
    context.fillText(skill.label, PAD + 10, line)
    context.textAlign = 'right'
    context.fillStyle = MUTED
    context.font = `500 38px ${FONT}`
    context.fillText(skill.valueLabel, WIDTH - PAD - 10, line)
    context.textAlign = 'left'
    context.fillStyle = TRACK
    box(context, PAD + 10, line + 22, INNER - 20, 16, 8)
    context.fillStyle = BLUE
    box(context, PAD + 10, line + 22, Math.max(16, (INNER - 20) * skill.value), 16, 8)
    line += row
  }

  // Where to practise, in a dark footer.
  const footer = HEIGHT - 250
  context.fillStyle = NIGHT
  box(context, PAD - 30, footer, INNER + 60, 170, 40)
  context.fillStyle = WHITE
  fitText(context, result.cta, PAD + 20, footer + 75, 700, 48)
  context.fillStyle = GOLD
  context.font = `500 38px ${FONT}`
  context.fillText(result.url, PAD + 20, footer + 130)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
