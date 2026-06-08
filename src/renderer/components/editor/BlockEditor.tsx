import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { usePageStore } from '../../stores/pageStore'
import { BlockWrapper } from './BlockWrapper'
import { BlockRenderer } from './BlockRenderer'
import { SlashCommandMenu } from './SlashCommandMenu'
import { Block } from '../../types'
import React from 'react'

const VIRTUALIZE_THRESHOLD = 80
const OVERSCAN = 10
const ESTIMATED_BLOCK_HEIGHT = 36

const MemoBlockRenderer = React.memo(BlockRenderer)

export function BlockEditor() {
  const { page, reorderBlocks } = usePageStore()
  const [activeBlock, setActiveBlock] = useState<Block | null>(null)
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; position: { top: number; left: number } } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(800)
  const blockHeightsRef = useRef<Map<string, number>>(new Map())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

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

  // Observe container scroll for virtualization
  useEffect(() => {
    const scrollParent = containerRef.current?.closest('main')
    if (!scrollParent) return

    const handleScroll = () => {
      setScrollTop(scrollParent.scrollTop)
    }
    const handleResize = () => {
      setContainerHeight(scrollParent.clientHeight)
    }

    handleResize()
    scrollParent.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      scrollParent.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [page])

  // Observe individual block heights
  const observeBlock = useCallback((blockId: string, el: HTMLElement | null) => {
    if (el) {
      const height = el.getBoundingClientRect().height
      if (height > 0) {
        blockHeightsRef.current.set(blockId, height)
      }
    }
  }, [])

  if (!page) return null

  const blocks = page.blocks
  const shouldVirtualize = blocks.length > VIRTUALIZE_THRESHOLD
  const blockIds = blocks.map(b => b.id)

  // Calculate visible range for virtualization
  let startIdx = 0
  let endIdx = blocks.length
  let topPadding = 0
  let bottomPadding = 0

  if (shouldVirtualize) {
    const offsets: number[] = []
    let cumHeight = 0
    for (let i = 0; i < blocks.length; i++) {
      offsets.push(cumHeight)
      cumHeight += blockHeightsRef.current.get(blocks[i].id) || ESTIMATED_BLOCK_HEIGHT
    }
    const totalHeight = cumHeight

    // Find first visible block (accounting for container offset ~128px for title area)
    const offsetAdjust = 128
    const visibleStart = Math.max(0, scrollTop - offsetAdjust)
    const visibleEnd = visibleStart + containerHeight

    startIdx = 0
    for (let i = 0; i < blocks.length; i++) {
      const blockBottom = offsets[i] + (blockHeightsRef.current.get(blocks[i].id) || ESTIMATED_BLOCK_HEIGHT)
      if (blockBottom >= visibleStart) {
        startIdx = i
        break
      }
    }

    endIdx = blocks.length
    for (let i = startIdx; i < blocks.length; i++) {
      if (offsets[i] > visibleEnd) {
        endIdx = i
        break
      }
    }

    startIdx = Math.max(0, startIdx - OVERSCAN)
    endIdx = Math.min(blocks.length, endIdx + OVERSCAN)

    topPadding = offsets[startIdx] || 0
    const lastVisibleOffset = offsets[endIdx - 1] || 0
    const lastVisibleHeight = blockHeightsRef.current.get(blocks[endIdx - 1]?.id) || ESTIMATED_BLOCK_HEIGHT
    bottomPadding = Math.max(0, totalHeight - lastVisibleOffset - lastVisibleHeight)
  }

  const visibleBlocks = shouldVirtualize ? blocks.slice(startIdx, endIdx) : blocks

  return (
    <div className="relative" ref={containerRef}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          {shouldVirtualize && topPadding > 0 && (
            <div style={{ height: topPadding }} aria-hidden />
          )}
          {visibleBlocks.map(block => (
            <MeasuredBlock
              key={block.id}
              block={block}
              blockIndex={numberedListCounters[block.id]}
              onSlashCommand={openSlashMenu}
              onMeasure={shouldVirtualize ? observeBlock : undefined}
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

interface MeasuredBlockProps {
  block: Block
  blockIndex?: number
  onSlashCommand: (blockId: string, position: { top: number; left: number }) => void
  onMeasure?: (blockId: string, el: HTMLElement | null) => void
}

const MeasuredBlock = React.memo(function MeasuredBlock({ block, blockIndex, onSlashCommand, onMeasure }: MeasuredBlockProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (onMeasure && ref.current) {
      onMeasure(block.id, ref.current)
    }
  })

  return (
    <div ref={ref}>
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
