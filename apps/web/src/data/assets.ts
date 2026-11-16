// The photos and logos are part of the app's build, with a hash in each file name. The content refers to them by
// their place in the code (`/src/assets/careers/actor-400.webp`, as the export to the backend wrote them), so the
// answers of /api/v1 are turned into the build's URLs here. Anything else (a full URL, a data: logo) stays as it
// is: when the photos move to the server, the API sends their real URLs and nothing here changes.

const PREFIX = '/src/assets/'

const BUILT = import.meta.glob<string>('../assets/**/*.{webp,svg,png}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const URLS = new Map(Object.entries(BUILT).map(([file, url]) => [file.replace('../assets/', PREFIX), url]))

/**
 * The folders of public/ the content points to (the events' photos). They sit under the build's base: /spa/ in the
 * build Laravel serves. Only these: other paths that start with "/" are the app's own pages (`to: '/plano'`).
 */
const PUBLIC_FOLDERS = ['/eventos/']

function builtUrl(path: string, urls: ReadonlyMap<string, string>, base: string) {
  if (path.startsWith(PREFIX)) return urls.get(path) ?? path
  return PUBLIC_FOLDERS.some((folder) => path.startsWith(folder)) ? `${base}${path.slice(1)}` : path
}

/** The data with each `/src/assets/…` and public file path replaced by the URL of that file in this build. */
export function withBuiltAssets<T>(
  data: T,
  urls: ReadonlyMap<string, string> = URLS,
  base: string = import.meta.env.BASE_URL,
): T {
  if (typeof data === 'string') return builtUrl(data, urls, base) as T
  if (Array.isArray(data)) return data.map((item: unknown) => withBuiltAssets(item, urls, base)) as T
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, withBuiltAssets(value, urls, base)]),
    ) as T
  }
  return data
}
