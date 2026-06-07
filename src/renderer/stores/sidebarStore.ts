import { create } from 'zustand'
import { PageMeta } from '../types'
import { createId, createParagraphBlock } from '../lib/blockUtils'

interface SidebarState {
  pages: PageMeta[]
  activePageId: string | null
  loading: boolean
  fetchPages: () => Promise<void>
  createPage: () => Promise<string>
  renamePage: (pageId: string, title: string) => Promise<void>
  deletePage: (pageId: string) => Promise<void>
  setActivePageId: (pageId: string | null) => void
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  pages: [],
  activePageId: null,
  loading: false,

  fetchPages: async () => {
    set({ loading: true })
    const pages = await window.api.listPages()
    set({ pages, loading: false })
  },

  createPage: async () => {
    const id = createId()
    const now = new Date().toISOString()
    const page = {
      meta: { id, title: '未命名页面', createdAt: now, updatedAt: now },
      blocks: [createParagraphBlock()]
    }
    await window.api.savePage(page)
    await get().fetchPages()
    set({ activePageId: id })
    return id
  },

  renamePage: async (pageId: string, title: string) => {
    const page = await window.api.loadPage(pageId)
    if (!page) return
    page.meta.title = title
    page.meta.updatedAt = new Date().toISOString()
    await window.api.savePage(page)
    await get().fetchPages()
  },

  deletePage: async (pageId: string) => {
    await window.api.deletePage(pageId)
    const { activePageId } = get()
    if (activePageId === pageId) set({ activePageId: null })
    await get().fetchPages()
  },

  setActivePageId: (pageId) => set({ activePageId: pageId })
}))
