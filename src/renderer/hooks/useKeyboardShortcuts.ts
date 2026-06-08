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
      const shift = e.shiftKey

      // Ctrl/Cmd+K - Search
      if (mod && e.key === 'k') {
        e.preventDefault()
        openSearch()
        return
      }

      // Ctrl/Cmd+B - Toggle sidebar
      if (mod && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
        return
      }

      // Ctrl/Cmd+N - New page
      if (mod && !shift && e.key === 'n') {
        e.preventDefault()
        if (activeSpaceId) createPage(activeSpaceId)
        return
      }

      // Ctrl/Cmd+E - Export markdown
      if (mod && e.key === 'e') {
        e.preventDefault()
        const page = usePageStore.getState().page
        if (page) window.api.exportMarkdown(page)
        return
      }

      // Ctrl/Cmd+Shift+E - Export PDF
      if (mod && shift && e.key === 'E') {
        e.preventDefault()
        const page = usePageStore.getState().page
        if (page) window.api.exportPdf(page)
        return
      }

      // Ctrl/Cmd+Shift+P - New window
      if (mod && shift && e.key === 'P') {
        e.preventDefault()
        window.api.newWindow()
        return
      }

      // Block-level shortcuts (only when focus is within a block)
      const activeEl = document.activeElement
      const blockEl = activeEl?.closest('[data-block-id]')
      if (!blockEl) return
      const blockId = blockEl.getAttribute('data-block-id')
      if (!blockId) return

      const store = usePageStore.getState()

      // Ctrl/Cmd+D - Duplicate block
      if (mod && e.key === 'd') {
        e.preventDefault()
        store.duplicateBlock(blockId)
        return
      }

      // Ctrl/Cmd+Shift+Delete or Ctrl+Shift+Backspace - Delete block
      if (mod && shift && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        const focusId = store.deleteBlock(blockId)
        if (focusId) {
          setTimeout(() => {
            const el = document.querySelector(`[data-block-id="${focusId}"] [contenteditable], [data-block-id="${focusId}"] textarea`) as HTMLElement
            el?.focus()
          }, 0)
        }
        return
      }

      // Ctrl/Cmd+Shift+ArrowUp - Move block up
      if (mod && shift && e.key === 'ArrowUp') {
        e.preventDefault()
        store.moveBlockUp(blockId)
        setTimeout(() => {
          const el = document.querySelector(`[data-block-id="${blockId}"] [contenteditable], [data-block-id="${blockId}"] textarea`) as HTMLElement
          el?.focus()
        }, 0)
        return
      }

      // Ctrl/Cmd+Shift+ArrowDown - Move block down
      if (mod && shift && e.key === 'ArrowDown') {
        e.preventDefault()
        store.moveBlockDown(blockId)
        setTimeout(() => {
          const el = document.querySelector(`[data-block-id="${blockId}"] [contenteditable], [data-block-id="${blockId}"] textarea`) as HTMLElement
          el?.focus()
        }, 0)
        return
      }

      // Ctrl/Cmd+] - Indent
      if (mod && e.key === ']') {
        e.preventDefault()
        store.indentBlock(blockId)
        return
      }

      // Ctrl/Cmd+[ - Outdent
      if (mod && e.key === '[') {
        e.preventDefault()
        store.outdentBlock(blockId)
        return
      }

      // ArrowUp at start of block - move focus to previous block
      if (!mod && !shift && e.key === 'ArrowUp') {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          if (range.startOffset === 0 && range.collapsed) {
            const page = store.page
            if (!page) return
            const idx = page.blocks.findIndex(b => b.id === blockId)
            if (idx > 0) {
              e.preventDefault()
              const prevId = page.blocks[idx - 1].id
              const el = document.querySelector(`[data-block-id="${prevId}"] [contenteditable], [data-block-id="${prevId}"] textarea`) as HTMLElement
              el?.focus()
            }
          }
        }
      }

      // ArrowDown at end of block - move focus to next block
      if (!mod && !shift && e.key === 'ArrowDown') {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const container = range.startContainer
          const textLen = container.textContent?.length || 0
          if (range.startOffset >= textLen && range.collapsed) {
            const page = store.page
            if (!page) return
            const idx = page.blocks.findIndex(b => b.id === blockId)
            if (idx < page.blocks.length - 1) {
              e.preventDefault()
              const nextId = page.blocks[idx + 1].id
              const el = document.querySelector(`[data-block-id="${nextId}"] [contenteditable], [data-block-id="${nextId}"] textarea`) as HTMLElement
              el?.focus()
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openSearch, toggleSidebar, createPage, activeSpaceId])
}
