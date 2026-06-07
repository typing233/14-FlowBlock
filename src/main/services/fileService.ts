import { readdir, readFile, writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { getDataDir } from './appPaths'

export interface PageMeta {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface PageData {
  meta: PageMeta
  blocks: unknown[]
}

export async function listPages(): Promise<PageMeta[]> {
  const dir = getDataDir()
  const files = await readdir(dir)
  const pages: PageMeta[] = []

  for (const file of files) {
    if (!file.endsWith('.json')) continue
    try {
      const content = await readFile(join(dir, file), 'utf-8')
      const page: PageData = JSON.parse(content)
      pages.push(page.meta)
    } catch {
      // Skip corrupt files
    }
  }

  pages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return pages
}

export async function loadPage(pageId: string): Promise<PageData | null> {
  const filePath = join(getDataDir(), `${pageId}.json`)
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function savePage(page: PageData): Promise<void> {
  const filePath = join(getDataDir(), `${page.meta.id}.json`)
  await writeFile(filePath, JSON.stringify(page, null, 2), 'utf-8')
}

export async function deletePage(pageId: string): Promise<void> {
  const filePath = join(getDataDir(), `${pageId}.json`)
  await unlink(filePath)
}
