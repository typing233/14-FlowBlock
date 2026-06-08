import { PageMeta, Page, Space } from '../renderer/types'

export interface SearchResult {
  pageId: string
  pageTitle: string
  spaceId: string
  blockId: string
  snippet: string
}

export interface IElectronAPI {
  // Spaces
  listSpaces(): Promise<Space[]>
  createSpace(space: Space): Promise<void>
  renameSpace(spaceId: string, name: string): Promise<void>
  deleteSpace(spaceId: string): Promise<void>

  // Pages
  listPages(spaceId: string): Promise<PageMeta[]>
  loadPage(spaceId: string, pageId: string): Promise<Page | null>
  savePage(page: Page): Promise<void>
  deletePage(spaceId: string, pageId: string): Promise<void>
  movePage(spaceId: string, pageId: string, parentId: string | null, order: number): Promise<void>

  // Search
  search(query: string, spaceId?: string): Promise<SearchResult[]>

  // Export
  exportMarkdown(page: Page): Promise<boolean>
  exportPdf(title: string): Promise<boolean>

  // Import
  importMarkdown(): Promise<{ title: string; blocks: any[] } | null>

  // Window
  newWindow(): Promise<void>
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
