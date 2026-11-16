// Writes the frontend's content to apps/api/database/data for `php artisan kaye:import` (ADR 0019).
// Run: npm run export:data (npx tsx scripts/export-data.ts). After any content change, run it again:
// src/data/export.test.ts fails while manifest.json is out of date.
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

// The shape of src/data/export.ts, declared here: importing its types would type-check the app under Node.
type ExportFile = { resource: string; locale: string; name: string; records: number; text: string }
type Export = {
  exportFiles: () => Promise<ExportFile[]>
  manifest: (files: ExportFile[]) => Promise<unknown>
}

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(web, '../api/database/data')

// Demo mode: the data must come from the bundled modules, never from a server (Vite gives process.env priority
// over a .env with VITE_DATA_SOURCE=api).
process.env.VITE_DATA_SOURCE = 'demo'
globalThis.fetch = () => Promise.reject(new Error('export-data runs without network'))
// lib/i18n (loaded by some data modules) sets the page language; there is no page here.
Object.assign(globalThis, { document: { documentElement: {} } })

// The data uses import.meta.glob and image imports, so it loads through Vite (as in the app), without the
// app's plugins: only the modules are needed.
const server = await createServer({
  root: web,
  configFile: false,
  logLevel: 'error',
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
})

try {
  const { exportFiles, manifest } = (await server.ssrLoadModule('/src/data/export.ts')) as Export
  const files = await exportFiles()

  await mkdir(out, { recursive: true })
  const old = (await readdir(out)).filter((name) => name.endsWith('.json'))
  await Promise.all(old.map((name) => rm(join(out, name))))
  await Promise.all(files.map((file) => writeFile(join(out, file.name), file.text)))
  await writeFile(join(out, 'manifest.json'), `${JSON.stringify(await manifest(files), null, 2)}\n`)

  const counts = files
    .filter(({ locale }) => locale === 'pt')
    .map((file) => `${file.resource.padEnd(24)} ${file.records}`)
  process.stdout.write(`${counts.join('\n')}\n${files.length} files in ${out}\n`)
} finally {
  await server.close()
}
