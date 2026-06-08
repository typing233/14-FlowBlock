import { useRef, useCallback, KeyboardEvent } from 'react'
import { usePageStore } from '../../stores/pageStore'
import { createParagraphBlock } from '../../lib/blockUtils'
import { QuoteBlock as QuoteBlockType } from '../../types'

interface Props {
  block: QuoteBlockType
  onSlashCommand: (blockId: string, position: { top: number; left: number }) => void
}

export function QuoteBlock({ block, onSlashCommand }: Props) {
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
      const newBlock = createParagraphBlock()
      addBlockAfter(block.id, newBlock)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable]`) as HTMLElement
        el?.focus()
      }, 0)
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
    <div data-block-id={block.id} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-1">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="outline-none py-1 text-base leading-relaxed min-h-[1.5em] text-gray-600 dark:text-gray-300 italic"
        data-placeholder="引用内容..."
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  )
}
