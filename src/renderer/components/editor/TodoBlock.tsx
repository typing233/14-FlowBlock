import { useRef, useCallback, KeyboardEvent } from 'react'
import { usePageStore } from '../../stores/pageStore'
import { createTodoBlock } from '../../lib/blockUtils'
import { TodoBlock as TodoBlockType } from '../../types'

interface Props {
  block: TodoBlockType
  onSlashCommand: (blockId: string, position: { top: number; left: number }) => void
}

export function TodoBlock({ block, onSlashCommand }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { updateBlock, addBlockAfter, deleteBlock } = usePageStore()

  const handleInput = useCallback(() => {
    if (ref.current) {
      updateBlock(block.id, { content: ref.current.textContent || '' })
    }
  }, [block.id, updateBlock])

  const toggleChecked = () => {
    updateBlock(block.id, { checked: !block.checked })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const text = ref.current?.textContent || ''

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const newBlock = createTodoBlock()
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
    <div data-block-id={block.id} className="flex items-start gap-2">
      <input
        type="checkbox"
        checked={block.checked}
        onChange={toggleChecked}
        className="mt-1.5 w-4 h-4 rounded border-gray-300 cursor-pointer accent-blue-600"
      />
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={`outline-none py-1 flex-1 min-h-[1.5em] text-base leading-relaxed ${block.checked ? 'line-through text-gray-400' : ''}`}
        data-placeholder="待办事项"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  )
}
