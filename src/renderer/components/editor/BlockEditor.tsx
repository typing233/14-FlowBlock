import { useState, useCallback, useMemo } from 'react'
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { usePageStore } from '../../stores/pageStore'
import { BlockWrapper } from './BlockWrapper'
import { BlockRenderer } from './BlockRenderer'
import { SlashCommandMenu } from './SlashCommandMenu'
import { Block } from '../../types'
import React from 'react'

const MemoBlockRenderer = React.memo(BlockRenderer)

export function BlockEditor() {
  const { page, reorderBlocks } = usePageStore()
  const [activeBlock, setActiveBlock] = useState<Block | null>(null)
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; position: { top: number; left: number } } | null>(null)

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

  if (!page) return null

  const blockIds = page.blocks.map(b => b.id)

  return (
    <div className="relative">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          {page.blocks.map(block => (
            <BlockWrapper key={block.id} block={block}>
              <MemoBlockRenderer
                block={block}
                blockIndex={numberedListCounters[block.id]}
                onSlashCommand={openSlashMenu}
              />
            </BlockWrapper>
          ))}
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
