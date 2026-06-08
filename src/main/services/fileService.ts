import { readdir, readFile, writeFile, unlink, mkdir } from 'fs/promises'
import { join, basename } from 'path'
import { existsSync } from 'fs'
import { getDataDir, getPagesDir, getSpacesFile, ensureSpaceDir } from './appPaths'

export interface Space {
  id: string
  name: string
  icon?: string
  createdAt: string
}

export interface PageMeta {
  id: string
  title: string
  spaceId: string
  parentId: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface PageData {
  meta: PageMeta
  blocks: unknown[]
}

// Space operations
export async function listSpaces(): Promise<Space[]> {
  const file = getSpacesFile()
  try {
    const content = await readFile(file, 'utf-8')
    return JSON.parse(content)
  } catch {
    const defaultSpace: Space = { id: 'default', name: '默认空间', createdAt: new Date().toISOString() }
    await writeFile(file, JSON.stringify([defaultSpace], null, 2), 'utf-8')
    await ensureSpaceDir('default')
    return [defaultSpace]
  }
}

export async function createSpace(space: Space): Promise<void> {
  const spaces = await listSpaces()
  spaces.push(space)
  await writeFile(getSpacesFile(), JSON.stringify(spaces, null, 2), 'utf-8')
  await ensureSpaceDir(space.id)
}

export async function renameSpace(spaceId: string, name: string): Promise<void> {
  const spaces = await listSpaces()
  const space = spaces.find(s => s.id === spaceId)
  if (space) {
    space.name = name
    await writeFile(getSpacesFile(), JSON.stringify(spaces, null, 2), 'utf-8')
  }
}

export async function deleteSpace(spaceId: string): Promise<void> {
  const spaces = await listSpaces()
  const filtered = spaces.filter(s => s.id !== spaceId)
  await writeFile(getSpacesFile(), JSON.stringify(filtered, null, 2), 'utf-8')
}

// Page operations
export async function listPages(spaceId: string): Promise<PageMeta[]> {
  const dir = getPagesDir(spaceId)
  await mkdir(dir, { recursive: true })

  try {
    const files = await readdir(dir)
    const pages: PageMeta[] = []

    for (const file of files) {
      if (!file.endsWith('.json')) continue
      try {
        const content = await readFile(join(dir, file), 'utf-8')
        const page: PageData = JSON.parse(content)
        if (!page.meta.spaceId) page.meta.spaceId = spaceId
        if (page.meta.parentId === undefined) page.meta.parentId = null
        if (page.meta.order === undefined) page.meta.order = 0
        pages.push(page.meta)
      } catch {
        // Skip corrupt files
      }
    }

    pages.sort((a, b) => a.order - b.order || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return pages
  } catch {
    return []
  }
}

export async function listAllPages(): Promise<PageMeta[]> {
  const spaces = await listSpaces()
  const allPages: PageMeta[] = []
  for (const space of spaces) {
    const pages = await listPages(space.id)
    allPages.push(...pages)
  }
  return allPages
}

export async function loadPage(spaceId: string, pageId: string): Promise<PageData | null> {
  const filePath = join(getPagesDir(spaceId), `${pageId}.json`)
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function savePage(page: PageData): Promise<void> {
  const spaceId = page.meta.spaceId || 'default'
  await ensureSpaceDir(spaceId)
  const filePath = join(getPagesDir(spaceId), `${page.meta.id}.json`)
  await writeFile(filePath, JSON.stringify(page, null, 2), 'utf-8')
}

export async function deletePage(spaceId: string, pageId: string): Promise<void> {
  const filePath = join(getPagesDir(spaceId), `${pageId}.json`)
  try {
    await unlink(filePath)
  } catch {
    // File might not exist
  }
}

export async function movePage(spaceId: string, pageId: string, parentId: string | null, order: number): Promise<void> {
  const page = await loadPage(spaceId, pageId)
  if (!page) return
  page.meta.parentId = parentId
  page.meta.order = order
  page.meta.updatedAt = new Date().toISOString()
  await savePage(page)
}

// Search across all pages
export async function searchPages(query: string, spaceId?: string): Promise<Array<{ pageId: string; pageTitle: string; spaceId: string; blockId: string; snippet: string }>> {
  const results: Array<{ pageId: string; pageTitle: string; spaceId: string; blockId: string; snippet: string }> = []
  if (!query.trim()) return results

  const lowerQuery = query.toLowerCase()
  const spaces = spaceId ? [{ id: spaceId } as Space] : await listSpaces()

  for (const space of spaces) {
    const dir = getPagesDir(space.id)
    let files: string[] = []
    try {
      files = await readdir(dir)
    } catch {
      continue
    }

    for (const file of files) {
      if (!file.endsWith('.json')) continue
      try {
        const content = await readFile(join(dir, file), 'utf-8')
        const page: PageData = JSON.parse(content)

        if (page.meta.title.toLowerCase().includes(lowerQuery)) {
          results.push({
            pageId: page.meta.id,
            pageTitle: page.meta.title,
            spaceId: space.id,
            blockId: '',
            snippet: page.meta.title
          })
        }

        for (const block of page.blocks) {
          const blockContent = (block as any).content || ''
          if (typeof blockContent === 'string' && blockContent.toLowerCase().includes(lowerQuery)) {
            const idx = blockContent.toLowerCase().indexOf(lowerQuery)
            const start = Math.max(0, idx - 20)
            const end = Math.min(blockContent.length, idx + query.length + 20)
            const snippet = (start > 0 ? '...' : '') + blockContent.slice(start, end) + (end < blockContent.length ? '...' : '')
            results.push({
              pageId: page.meta.id,
              pageTitle: page.meta.title,
              spaceId: space.id,
              blockId: (block as any).id || '',
              snippet
            })
          }
        }
      } catch {
        continue
      }
    }
  }

  return results.slice(0, 50)
}
