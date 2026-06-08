import { app } from 'electron'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export function getDataDir(): string {
  return join(app.getPath('userData'), 'data')
}

export function getPagesDir(spaceId: string): string {
  return join(getDataDir(), 'spaces', spaceId, 'pages')
}

export function getSpacesFile(): string {
  return join(getDataDir(), 'spaces.json')
}

export async function ensureDataDir(): Promise<void> {
  await mkdir(getDataDir(), { recursive: true })
  await mkdir(join(getDataDir(), 'spaces'), { recursive: true })
}

export async function ensureSpaceDir(spaceId: string): Promise<void> {
  await mkdir(getPagesDir(spaceId), { recursive: true })
}
