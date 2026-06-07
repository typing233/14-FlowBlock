import { create } from 'zustand'
import { Page, Block } from '../types'
import { createParagraphBlock } from '../lib/blockUtils'

interface PageState {
  page: Page | null
  isDirty: boolean
  loadPage: (pageId: string) => Promise<void>
  setPage: (page: Page | null) => void
  updateBlock: (blockId: string, updates: Partial<Block>) => void
  addBlockAfter: (afterBlockId: string, block: Block) => void
  deleteBlock: (blockId: string) => string | null
  reorderBlocks: (activeId: string, overId: string) => void
  updatePageTitle: (title: string) => void
  markClean: () => void
  getPage: () => Page | null
}

export const usePageStore = create<PageState>((set, get) => ({
  page: null,
  isDirty: false,

  loadPage: async (pageId: string) => {
    const page = await window.api.loadPage(pageId)
    set({ page, isDirty: false })
  },

  setPage: (page) => set({ page, isDirty: false }),

  updateBlock: (blockId, updates) => {
    const { page } = get()
    if (!page) return
    const blocks = page.blocks.map(b =>
      b.id === blockId ? { ...b, ...updates, updatedAt: new Date().toISOString() } as Block : b
    )
    set({ page: { ...page, blocks }, isDirty: true })
  },

  addBlockAfter: (afterBlockId, block) => {
    const { page } = get()
    if (!page) return
    const index = page.blocks.findIndex(b => b.id === afterBlockId)
    const blocks = [...page.blocks]
    blocks.splice(index + 1, 0, block)
    set({ page: { ...page, blocks }, isDirty: true })
  },

  deleteBlock: (blockId) => {
    const { page } = get()
    if (!page) return null
    if (page.blocks.length <= 1) return null

    const index = page.blocks.findIndex(b => b.id === blockId)
    const blocks = page.blocks.filter(b => b.id !== blockId)
    const focusId = index > 0 ? blocks[index - 1].id : blocks[0].id
    set({ page: { ...page, blocks }, isDirty: true })
    return focusId
  },

  reorderBlocks: (activeId, overId) => {
    const { page } = get()
    if (!page || activeId === overId) return
    const blocks = [...page.blocks]
    const oldIndex = blocks.findIndex(b => b.id === activeId)
    const newIndex = blocks.findIndex(b => b.id === overId)
    const [moved] = blocks.splice(oldIndex, 1)
    blocks.splice(newIndex, 0, moved)
    set({ page: { ...page, blocks }, isDirty: true })
  },

  updatePageTitle: (title) => {
    const { page } = get()
    if (!page) return
    set({
      page: { ...page, meta: { ...page.meta, title, updatedAt: new Date().toISOString() } },
      isDirty: true
    })
  },

  markClean: () => set({ isDirty: false }),
  getPage: () => get().page
}))
