import { PageMeta, Page } from '../renderer/types'

export interface IElectronAPI {
  listPages(): Promise<PageMeta[]>
  loadPage(pageId: string): Promise<Page | null>
  savePage(page: Page): Promise<void>
  deletePage(pageId: string): Promise<void>
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
