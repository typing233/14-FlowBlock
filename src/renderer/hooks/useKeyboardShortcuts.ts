import { useEffect } from 'react'
import { useSearchStore } from '../stores/searchStore'
import { useSidebarStore } from '../stores/sidebarStore'
import { useSpaceStore } from '../stores/spaceStore'
import { usePageStore } from '../stores/pageStore'

export function useKeyboardShortcuts() {
  const openSearch = useSearchStore(s => s.open)
  const toggleSidebar = useSidebarStore(s => s.toggleSidebar)
  const createPage = useSidebarStore(s => s.createPage)
  const activeSpaceId = useSpaceStore(s => s.activeSpaceId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      // Ctrl/Cmd+K - Search
      if (mod && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }

      // Ctrl/Cmd+B - Toggle sidebar
      if (mod && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }

      // Ctrl/Cmd+N - New page
      if (mod && !e.shiftKey && e.key === 'n') {
        e.preventDefault()
        if (activeSpaceId) createPage(activeSpaceId)
      }

      // Ctrl/Cmd+E - Export markdown
      if (mod && e.key === 'e') {
        e.preventDefault()
        const page = usePageStore.getState().page
        if (page) window.api.exportMarkdown(page)
      }

      // Ctrl/Cmd+Shift+P - New window
      if (mod && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        window.api.newWindow()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openSearch, toggleSidebar, createPage, activeSpaceId])
}
