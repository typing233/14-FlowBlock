import { app } from 'electron'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export function getDataDir(): string {
  return join(app.getPath('userData'), 'pages')
}

export async function ensureDataDir(): Promise<void> {
  await mkdir(getDataDir(), { recursive: true })
}
