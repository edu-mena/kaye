import qrcodeGenerator from 'qrcode-generator'

/** The dark and light squares of a QR code, medium error correction: it survives a small scratch. */
export function qrModules(text: string): boolean[][] {
  const code = qrcodeGenerator(0, 'M')
  code.addData(text)
  code.make()
  const size = code.getModuleCount()
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_cell, column) => code.isDark(row, column)),
  )
}
