import { create } from 'zustand'
import { Space } from '../types'
import { createId } from '../lib/blockUtils'

interface SpaceState {
  spaces: Space[]
  activeSpaceId: string | null
  loading: boolean
  fetchSpaces: () => Promise<void>
  createSpace: (name: string) => Promise<string>
  renameSpace: (spaceId: string, name: string) => Promise<void>
  deleteSpace: (spaceId: string) => Promise<void>
  setActiveSpaceId: (id: string) => void
}

export const useSpaceStore = create<SpaceState>((set, get) => ({
  spaces: [],
  activeSpaceId: null,
  loading: false,

  fetchSpaces: async () => {
    set({ loading: true })
    const spaces = await window.api.listSpaces()
    const { activeSpaceId } = get()
    set({
      spaces,
      loading: false,
      activeSpaceId: activeSpaceId || spaces[0]?.id || null
    })
  },

  createSpace: async (name: string) => {
    const id = createId()
    const space: Space = { id, name, createdAt: new Date().toISOString() }
    await window.api.createSpace(space)
    await get().fetchSpaces()
    set({ activeSpaceId: id })
    return id
  },

  renameSpace: async (spaceId: string, name: string) => {
    await window.api.renameSpace(spaceId, name)
    await get().fetchSpaces()
  },

  deleteSpace: async (spaceId: string) => {
    await window.api.deleteSpace(spaceId)
    const { activeSpaceId } = get()
    if (activeSpaceId === spaceId) {
      const spaces = get().spaces.filter(s => s.id !== spaceId)
      set({ activeSpaceId: spaces[0]?.id || null })
    }
    await get().fetchSpaces()
  },

  setActiveSpaceId: (id) => set({ activeSpaceId: id })
}))
