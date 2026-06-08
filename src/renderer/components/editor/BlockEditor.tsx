import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { usePageStore } from '../../stores/pageStore'
import { useSearchStore } from '../../stores/searchStore'
import { BlockWrapper } from './BlockWrapper'
import { BlockRenderer } from './BlockRenderer'
import { SlashCommandMenu } from './SlashCommandMenu'
import { Block } from '../../types'
import React from 'react'

const VIRTUALIZE_THRESHOLD = 80
const OVERSCAN = 10
const DEFAULT_BLOCK_HEIGHT = 36

const MemoBlockRenderer = React.memo(BlockRenderer)

export function BlockEditor() {
  const { page, reorderBlocks } = usePageStore()
  const scrollToBlockId = useSearchStore(s => s.scrollToBlockId)
  const [activeBlock, setActiveBlock] = useState<Block | null>(null)
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; position: { top: number; left: number } } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollParentRef = useRef<HTMLElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(800)
  const [, forceUpdate] = useState(0)

  // Stable map of blockId -> measured height
  const heightsRef = useRef<Map<string, number>>(new Map())
  // ResizeObserver for tracking block dimension changes
  const observerRef = useRef<ResizeObserver | null>(null)
  const observedEls = useRef<Map<string, HTMLElement>>(new Map())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Set up ResizeObserver once
  useEffect(() => {
    observerRef.current = new ResizeObserver((entries) => {
      let changed = false
      for (const entry of entries) {
        const el = entry.target as HTMLElement
        const blockId = el.dataset.virtualBlockId
        if (blockId) {
          const h = entry.borderBoxSize?.[0]?.blockSize ?? el.getBoundingClientRect().height
          if (h > 0 && heightsRef.current.get(blockId) !== h) {
            heightsRef.current.set(blockId, h)
            changed = true
          }
        }
      }
      if (changed) {
        forceUpdate(c => c + 1)
      }
    })
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  // Track scroll parent
  useEffect(() => {
    const scrollParent = containerRef.current?.closest('main') as HTMLElement | null
    if (!scrollParent) return
    scrollParentRef.current = scrollParent

    const handleScroll = () => setScrollTop(scrollParent.scrollTop)
    const handleResize = () => setContainerHeight(scrollParent.clientHeight)

    handleResize()
    scrollParent.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      scrollParent.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [page])

  // Ref callback for observed blocks
  const measureRef = useCallback((blockId: string, el: HTMLElement | null) => {
    const observer = observerRef.current
    if (!observer) return
    const prev = observedEls.current.get(blockId)
    if (prev && prev !== el) {
      observer.unobserve(prev)
      observedEls.current.delete(blockId)
    }
    if (el) {
      el.dataset.virtualBlockId = blockId
      observer.observe(el)
      observedEls.current.set(blockId, el)
      // Immediate measure
      const h = el.getBoundingClientRect().height
      if (h > 0) heightsRef.current.set(blockId, h)
    }
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const block = page?.blocks.find(b => b.id === event.active.id)
    setActiveBlock(block || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveBlock(null)
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string)
    }
  }

  const openSlashMenu = useCallback((blockId: string, position: { top: number; left: number }) => {
    setSlashMenu({ blockId, position })
  }, [])

  const closeSlashMenu = useCallback(() => {
    setSlashMenu(null)
  }, [])

  const numberedListCounters = useMemo(() => {
    if (!page) return {}
    const counters: Record<string, number> = {}
    let count = 0
    for (const block of page.blocks) {
      if (block.type === 'numberedList') {
        count++
        counters[block.id] = count
      } else {
        count = 0
      }
    }
    return counters
  }, [page])

  if (!page) return null

  const blocks = page.blocks
  const shouldVirtualize = blocks.length > VIRTUALIZE_THRESHOLD
  const blockIds = blocks.map(b => b.id)

  // Compute cumulative offsets
  const offsets: number[] = []
  let totalHeight = 0
  for (let i = 0; i < blocks.length; i++) {
    offsets.push(totalHeight)
    totalHeight += heightsRef.current.get(blocks[i].id) || DEFAULT_BLOCK_HEIGHT
  }

  let startIdx = 0
  let endIdx = blocks.length
  let topPadding = 0
  let bottomPadding = 0

  if (shouldVirtualize) {
    // The container top within the scroll parent (title area offset)
    const containerTop = containerRef.current?.offsetTop || 0
    const visibleStart = Math.max(0, scrollTop - containerTop)
    const visibleEnd = visibleStart + containerHeight

    // Binary search for first visible block
    let lo = 0, hi = blocks.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      const blockBottom = offsets[mid] + (heightsRef.current.get(blocks[mid].id) || DEFAULT_BLOCK_HEIGHT)
      if (blockBottom < visibleStart) lo = mid + 1
      else hi = mid
    }
    startIdx = lo

    // Binary search for last visible block
    lo = startIdx
    hi = blocks.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (offsets[mid] > visibleEnd) hi = mid - 1
      else lo = mid
    }
    endIdx = lo + 1

    // Apply overscan
    startIdx = Math.max(0, startIdx - OVERSCAN)
    endIdx = Math.min(blocks.length, endIdx + OVERSCAN)

    // Force-include scrollToBlockId if not in range
    if (scrollToBlockId) {
      const targetIdx = blocks.findIndex(b => b.id === scrollToBlockId)
      if (targetIdx >= 0) {
        if (targetIdx < startIdx) startIdx = targetIdx
        if (targetIdx >= endIdx) endIdx = targetIdx + 1
      }
    }

    topPadding = offsets[startIdx] || 0
    const lastIdx = endIdx - 1
    const lastBlockBottom = (offsets[lastIdx] || 0) + (heightsRef.current.get(blocks[lastIdx]?.id) || DEFAULT_BLOCK_HEIGHT)
    bottomPadding = Math.max(0, totalHeight - lastBlockBottom)
  }

  const visibleBlocks = shouldVirtualize ? blocks.slice(startIdx, endIdx) : blocks

  return (
    <div className="relative" ref={containerRef} style={shouldVirtualize ? { minHeight: totalHeight } : undefined}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          {shouldVirtualize && topPadding > 0 && (
            <div style={{ height: topPadding }} aria-hidden />
          )}
          {visibleBlocks.map(block => (
            <VirtualBlock
              key={block.id}
              block={block}
              blockIndex={numberedListCounters[block.id]}
              onSlashCommand={openSlashMenu}
              measureRef={shouldVirtualize ? measureRef : undefined}
            />
          ))}
          {shouldVirtualize && bottomPadding > 0 && (
            <div style={{ height: bottomPadding }} aria-hidden />
          )}
        </SortableContext>
        <DragOverlay>
          {activeBlock && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 opacity-90 border border-gray-200 dark:border-gray-700">
              <BlockRenderer block={activeBlock} onSlashCommand={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {slashMenu && (
        <SlashCommandMenu
          blockId={slashMenu.blockId}
          position={slashMenu.position}
          onClose={closeSlashMenu}
        />
      )}
    </div>
  )
}

interface VirtualBlockProps {
  block: Block
  blockIndex?: number
  onSlashCommand: (blockId: string, position: { top: number; left: number }) => void
  measureRef?: (blockId: string, el: HTMLElement | null) => void
}

const VirtualBlock = React.memo(function VirtualBlock({ block, blockIndex, onSlashCommand, measureRef }: VirtualBlockProps) {
  const elRef = useRef<HTMLDivElement | null>(null)

  const setRef = useCallback((node: HTMLDivElement | null) => {
    elRef.current = node
    if (measureRef) measureRef(block.id, node)
  }, [block.id, measureRef])

  return (
    <div ref={setRef}>
      <BlockWrapper block={block}>
        <MemoBlockRenderer
          block={block}
          blockIndex={blockIndex}
          onSlashCommand={onSlashCommand}
        />
      </BlockWrapper>
    </div>
  )
})
