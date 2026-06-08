import { useRef, useCallback, KeyboardEvent } from 'react'
import { usePageStore } from '../../stores/pageStore'
import { createNumberedListBlock, createParagraphBlock } from '../../lib/blockUtils'
import { NumberedListBlock as NumberedListBlockType } from '../../types'

interface Props {
  block: NumberedListBlockType
  index: number
  onSlashCommand: (blockId: string, position: { top: number; left: number }) => void
}

export function NumberedListBlock({ block, index, onSlashCommand }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { updateBlock, addBlockAfter, deleteBlock } = usePageStore()

  const handleInput = useCallback(() => {
    if (ref.current) {
      updateBlock(block.id, { content: ref.current.textContent || '' })
    }
  }, [block.id, updateBlock])

  const handleKeyDown = (e: KeyboardEvent) => {
    const text = ref.current?.textContent || ''

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text === '') {
        const newBlock = createParagraphBlock()
        addBlockAfter(block.id, newBlock)
        deleteBlock(block.id)
        setTimeout(() => {
          const el = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable]`) as HTMLElement
          el?.focus()
        }, 0)
      } else {
        const newBlock = createNumberedListBlock()
        addBlockAfter(block.id, newBlock)
        setTimeout(() => {
          const el = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable]`) as HTMLElement
          el?.focus()
        }, 0)
      }
    }

    if (e.key === 'Backspace' && text === '') {
      e.preventDefault()
      const focusId = deleteBlock(block.id)
      if (focusId) {
        setTimeout(() => {
          const el = document.querySelector(`[data-block-id="${focusId}"] [contenteditable]`) as HTMLElement
          el?.focus()
        }, 0)
      }
    }

    if (e.key === '/' && text === '') {
      e.preventDefault()
      const rect = ref.current!.getBoundingClientRect()
      onSlashCommand(block.id, { top: rect.bottom + 4, left: rect.left })
    }
  }

  return (
    <div data-block-id={block.id} className="flex items-start gap-2">
      <span className="mt-1 text-sm text-gray-500 dark:text-gray-400 shrink-0 w-5 text-right">{index}.</span>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="outline-none py-1 flex-1 min-h-[1.5em] text-base leading-relaxed"
        data-placeholder="列表项"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  )
}
