import { create } from 'zustand'

interface SearchResult {
  pageId: string
  pageTitle: string
  spaceId: string
  blockId: string
  snippet: string
}

interface SearchState {
  isOpen: boolean
  query: string
  results: SearchResult[]
  loading: boolean
  highlightBlockId: string | null
  highlightQuery: string | null
  // Used by BlockEditor to force-include a block in the virtualized window
  scrollToBlockId: string | null
  open: () => void
  close: () => void
  setQuery: (query: string) => void
  search: (query: string) => Promise<void>
  setHighlight: (blockId: string | null, query: string | null) => void
  clearHighlight: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: '',
  results: [],
  loading: false,
  highlightBlockId: null,
  highlightQuery: null,
  scrollToBlockId: null,

  open: () => set({ isOpen: true, query: '', results: [] }),
  close: () => set({ isOpen: false }),

  setQuery: (query) => set({ query }),

  search: async (query: string) => {
    if (!query.trim()) {
      set({ results: [], loading: false })
      return
    }
    set({ loading: true })
    try {
      const results = await window.api.search(query)
      set({ results, loading: false })
    } catch {
      set({ results: [], loading: false })
    }
  },

  setHighlight: (blockId, query) => set({
    highlightBlockId: blockId,
    highlightQuery: query,
    scrollToBlockId: blockId
  }),
  clearHighlight: () => set({ highlightBlockId: null, highlightQuery: null, scrollToBlockId: null })
}))
