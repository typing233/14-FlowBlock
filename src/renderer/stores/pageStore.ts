import { create } from 'zustand'
import { Page, Block } from '../types'
import { createParagraphBlock, createId } from '../lib/blockUtils'

interface PageState {
  page: Page | null
  isDirty: boolean
  loadPage: (spaceId: string, pageId: string) => Promise<void>
  setPage: (page: Page | null) => void
  updateBlock: (blockId: string, updates: Partial<Block>) => void
  addBlockAfter: (afterBlockId: string, block: Block) => void
  deleteBlock: (blockId: string) => string | null
  reorderBlocks: (activeId: string, overId: string) => void
  updatePageTitle: (title: string) => void
  indentBlock: (blockId: string) => void
  outdentBlock: (blockId: string) => void
  moveBlockUp: (blockId: string) => void
  moveBlockDown: (blockId: string) => void
  duplicateBlock: (blockId: string) => void
  markClean: () => void
  getPage: () => Page | null
}

export const usePageStore = create<PageState>((set, get) => ({
  page: null,
  isDirty: false,

  loadPage: async (spaceId: string, pageId: string) => {
    const page = await window.api.loadPage(spaceId, pageId)
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

  indentBlock: (blockId) => {
    const { page } = get()
    if (!page) return
    const blocks = page.blocks.map(b => {
      if (b.id === blockId) {
        const current = b.indent || 0
        if (current < 4) return { ...b, indent: current + 1, updatedAt: new Date().toISOString() } as Block
      }
      return b
    })
    set({ page: { ...page, blocks }, isDirty: true })
  },

  outdentBlock: (blockId) => {
    const { page } = get()
    if (!page) return
    const blocks = page.blocks.map(b => {
      if (b.id === blockId) {
        const current = b.indent || 0
        if (current > 0) return { ...b, indent: current - 1, updatedAt: new Date().toISOString() } as Block
      }
      return b
    })
    set({ page: { ...page, blocks }, isDirty: true })
  },

  moveBlockUp: (blockId) => {
    const { page } = get()
    if (!page) return
    const blocks = [...page.blocks]
    const index = blocks.findIndex(b => b.id === blockId)
    if (index <= 0) return
    ;[blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]
    set({ page: { ...page, blocks }, isDirty: true })
  },

  moveBlockDown: (blockId) => {
    const { page } = get()
    if (!page) return
    const blocks = [...page.blocks]
    const index = blocks.findIndex(b => b.id === blockId)
    if (index < 0 || index >= blocks.length - 1) return
    ;[blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]]
    set({ page: { ...page, blocks }, isDirty: true })
  },

  duplicateBlock: (blockId) => {
    const { page } = get()
    if (!page) return
    const block = page.blocks.find(b => b.id === blockId)
    if (!block) return
    const newBlock = { ...block, id: createId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    const index = page.blocks.findIndex(b => b.id === blockId)
    const blocks = [...page.blocks]
    blocks.splice(index + 1, 0, newBlock as Block)
    set({ page: { ...page, blocks }, isDirty: true })
  },

  markClean: () => set({ isDirty: false }),
  getPage: () => get().page
}))
