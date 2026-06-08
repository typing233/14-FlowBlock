import { create } from 'zustand'
import { PageMeta } from '../types'
import { createId, createParagraphBlock } from '../lib/blockUtils'

interface TreeNode {
  page: PageMeta
  children: TreeNode[]
  expanded: boolean
}

interface SidebarState {
  pages: PageMeta[]
  activePageId: string | null
  expandedIds: Set<string>
  loading: boolean
  sidebarVisible: boolean
  fetchPages: (spaceId: string) => Promise<void>
  createPage: (spaceId: string, parentId?: string | null) => Promise<string>
  renamePage: (spaceId: string, pageId: string, title: string) => Promise<void>
  deletePage: (spaceId: string, pageId: string) => Promise<void>
  setActivePageId: (pageId: string | null) => void
  toggleExpanded: (pageId: string) => void
  toggleSidebar: () => void
  getTree: () => TreeNode[]
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  pages: [],
  activePageId: null,
  expandedIds: new Set<string>(),
  loading: false,
  sidebarVisible: true,

  fetchPages: async (spaceId: string) => {
    set({ loading: true })
    const pages = await window.api.listPages(spaceId)
    set({ pages, loading: false })
  },

  createPage: async (spaceId: string, parentId: string | null = null) => {
    const id = createId()
    const now = new Date().toISOString()
    const page = {
      meta: { id, title: '未命名页面', spaceId, parentId, order: Date.now(), createdAt: now, updatedAt: now },
      blocks: [createParagraphBlock()]
    }
    await window.api.savePage(page)
    if (parentId) {
      const { expandedIds } = get()
      expandedIds.add(parentId)
      set({ expandedIds: new Set(expandedIds) })
    }
    await get().fetchPages(spaceId)
    set({ activePageId: id })
    return id
  },

  renamePage: async (spaceId: string, pageId: string, title: string) => {
    const page = await window.api.loadPage(spaceId, pageId)
    if (!page) return
    page.meta.title = title
    page.meta.updatedAt = new Date().toISOString()
    await window.api.savePage(page)
    await get().fetchPages(spaceId)
  },

  deletePage: async (spaceId: string, pageId: string) => {
    await window.api.deletePage(spaceId, pageId)
    const { activePageId } = get()
    if (activePageId === pageId) set({ activePageId: null })
    await get().fetchPages(spaceId)
  },

  setActivePageId: (pageId) => set({ activePageId: pageId }),

  toggleExpanded: (pageId: string) => {
    const { expandedIds } = get()
    const next = new Set(expandedIds)
    if (next.has(pageId)) next.delete(pageId)
    else next.add(pageId)
    set({ expandedIds: next })
  },

  toggleSidebar: () => set(s => ({ sidebarVisible: !s.sidebarVisible })),

  getTree: () => {
    const { pages, expandedIds } = get()
    const map = new Map<string | null, PageMeta[]>()
    for (const page of pages) {
      const parent = page.parentId || null
      if (!map.has(parent)) map.set(parent, [])
      map.get(parent)!.push(page)
    }

    function buildTree(parentId: string | null): TreeNode[] {
      const children = map.get(parentId) || []
      return children.map(page => ({
        page,
        children: buildTree(page.id),
        expanded: expandedIds.has(page.id)
      }))
    }

    return buildTree(null)
  }
}))
