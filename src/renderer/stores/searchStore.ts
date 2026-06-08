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
  open: () => void
  close: () => void
  setQuery: (query: string) => void
  search: (query: string) => Promise<void>
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: '',
  results: [],
  loading: false,

  open: () => set({ isOpen: true, query: '', results: [] }),
  close: () => set({ isOpen: false, query: '', results: [] }),

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
  }
}))
