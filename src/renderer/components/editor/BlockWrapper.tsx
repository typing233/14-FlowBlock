import { ReactNode, useState, useEffect, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal } from 'lucide-react'
import { Block } from '../../types'
import { BlockActionMenu } from './BlockActionMenu'
import { useSearchStore } from '../../stores/searchStore'

interface Props {
  block: Block
  children: ReactNode
}

function highlightTextInElement(root: HTMLElement, query: string) {
  if (!query) return
  const lowerQuery = query.toLowerCase()

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node)
  }

  for (const textNode of textNodes) {
    const text = textNode.textContent || ''
    const lowerText = text.toLowerCase()
    const idx = lowerText.indexOf(lowerQuery)
    if (idx === -1) continue

    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + query.length)
    const after = text.slice(idx + query.length)

    const mark = document.createElement('mark')
    mark.className = 'search-highlight'
    mark.textContent = match

    const parent = textNode.parentNode!
    if (before) parent.insertBefore(document.createTextNode(before), textNode)
    parent.insertBefore(mark, textNode)
    if (after) parent.insertBefore(document.createTextNode(after), textNode)
    parent.removeChild(textNode)
  }
}

function clearHighlightMarks(root: HTMLElement) {
  const marks = root.querySelectorAll('mark.search-highlight')
  marks.forEach(mark => {
    const parent = mark.parentNode
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark)
      parent.normalize()
    }
  })
}

export function BlockWrapper({ block, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const highlightBlockId = useSearchStore(s => s.highlightBlockId)
  const highlightQuery = useSearchStore(s => s.highlightQuery)
  const clearHighlight = useSearchStore(s => s.clearHighlight)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const highlightApplied = useRef(false)

  useEffect(() => {
    if (highlightBlockId === block.id && highlightQuery && wrapperRef.current) {
      // Wait for the block to be in the DOM (after virtualization forces it into view)
      const applyHighlight = () => {
        const el = wrapperRef.current
        if (!el) return
        // Scroll into view first
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add flash animation class
        el.classList.add('block-highlight-flash')
        // Inject inline keyword marks
        highlightTextInElement(el, highlightQuery)
        highlightApplied.current = true
      }

      // Small delay to ensure virtualized block is rendered
      const timer1 = setTimeout(applyHighlight, 80)

      // Clear marks and animation after a few seconds
      const timer2 = setTimeout(() => {
        if (wrapperRef.current) {
          clearHighlightMarks(wrapperRef.current)
          wrapperRef.current.classList.remove('block-highlight-flash')
        }
        highlightApplied.current = false
        clearHighlight()
      }, 3500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        if (highlightApplied.current && wrapperRef.current) {
          clearHighlightMarks(wrapperRef.current)
          wrapperRef.current.classList.remove('block-highlight-flash')
        }
      }
    }
  }, [highlightBlockId, highlightQuery, block.id, clearHighlight])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  const indent = block.indent || 0
  const paddingLeft = indent * 24

  const handleMenuClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMenuPosition({ top: rect.bottom + 4, left: rect.left })
    setShowMenu(true)
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        ;(wrapperRef as any).current = node
      }}
      style={style}
      className="group relative flex items-start gap-1 py-0.5 rounded"
    >
      <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleMenuClick}
          className="mt-1.5 text-gray-300 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <MoreHorizontal size={16} />
        </button>
        <button
          {...attributes}
          {...listeners}
          className="mt-1.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 shrink-0"
        >
          <GripVertical size={16} />
        </button>
      </div>
      <div className="flex-1 min-w-0" style={{ paddingLeft }}>
        {children}
      </div>

      {showMenu && (
        <BlockActionMenu
          block={block}
          position={menuPosition}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
