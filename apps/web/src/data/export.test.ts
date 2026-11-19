import { assert, describe, expect, it } from 'vitest'
import { exportFiles, manifest, serialize, sha256, type Manifest } from './export'

// The exported files as they are in the repository, read as text through Vite (the app has no Node types).
const SAVED = import.meta.glob<string>('../../../api/database/data/*.json', {
  eager: true,
  query: '?raw',
  import: 'default',
})
const saved = (name: string) => SAVED[`../../../api/database/data/${name}`]
const STALE = 'apps/api/database/data is out of date: run `npm run export:data` in apps/web'

describe('data export for the backend (ADR 0019)', () => {
  it('has a manifest that matches the data the app ships', async () => {
    assert.deepEqual(JSON.parse(saved('manifest.json') ?? '{}'), await manifest(await exportFiles()), STALE)
  })

  it('has every file as the manifest describes it, and no other', async () => {
    const entries = Object.values(JSON.parse(saved('manifest.json') ?? '{}') as Manifest).flatMap(
      Object.values,
    )
    for (const entry of entries) {
      assert.equal(await sha256(saved(entry.file) ?? ''), entry.sha256, `${entry.file}: ${STALE}`)
    }
    expect(Object.keys(SAVED)).toHaveLength(entries.length + 1)
  })

  it('notices a change in one record', async () => {
    const files = await exportFiles()
    const before = await manifest(files)
    const news = files.find((file) => file.name === 'news.pt.json')!
    news.text = news.text.replace('"title": "', '"title": "X')
    expect(await manifest(files)).not.toEqual(before)
  })

  it('sorts records by slug, keeps the app order in position and leaves lists without ids alone', () => {
    expect(JSON.parse(serialize([{ id: 'b' }, { slug: 'a' }]))).toEqual([
      { slug: 'a', position: 1 },
      { id: 'b', position: 0 },
    ])
    expect(serialize(['Luanda', 'Bengo'])).toBe('[\n  "Luanda",\n  "Bengo"\n]\n')
  })

  it('hashes like sha256sum', async () => {
    expect(await sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})
