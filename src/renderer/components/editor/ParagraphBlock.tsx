import { useRef, useCallback, KeyboardEvent } from 'react'
import { usePageStore } from '../../stores/pageStore'
import { createParagraphBlock, createHeadingBlock, createQuoteBlock, createCodeBlock, createTodoBlock, createBulletListBlock, createNumberedListBlock, createDividerBlock } from '../../lib/blockUtils'
import { ParagraphBlock as ParagraphBlockType } from '../../types'

interface Props {
  block: ParagraphBlockType
  onSlashCommand: (blockId: string, position: { top: number; left: number }) => void
}

export function ParagraphBlock({ block, onSlashCommand }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { updateBlock, addBlockAfter, deleteBlock, indentBlock, outdentBlock } = usePageStore()

  const tryMarkdownShortcut = (text: string): boolean => {
    if (text === '# ') {
      updateBlock(block.id, { type: 'heading', content: '', level: 1 } as any)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${block.id}"] [contenteditable]`) as HTMLElement
        if (el) { el.textContent = ''; el.focus() }
      }, 0)
      return true
    }
    if (text === '## ') {
      updateBlock(block.id, { type: 'heading', content: '', level: 2 } as any)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${block.id}"] [contenteditable]`) as HTMLElement
        if (el) { el.textContent = ''; el.focus() }
      }, 0)
      return true
    }
    if (text === '### ') {
      updateBlock(block.id, { type: 'heading', content: '', level: 3 } as any)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${block.id}"] [contenteditable]`) as HTMLElement
        if (el) { el.textContent = ''; el.focus() }
      }, 0)
      return true
    }
    if (text === '> ') {
      updateBlock(block.id, { type: 'quote', content: '' } as any)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${block.id}"] [contenteditable]`) as HTMLElement
        if (el) { el.textContent = ''; el.focus() }
      }, 0)
      return true
    }
    if (text === '```') {
      updateBlock(block.id, { type: 'code', content: '', language: 'plaintext' } as any)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${block.id}"] textarea`) as HTMLElement
        el?.focus()
      }, 0)
      return true
    }
    if (text === '- [ ] ' || text === '[] ') {
      updateBlock(block.id, { type: 'todo', content: '', checked: false } as any)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${block.id}"] [contenteditable]`) as HTMLElement
        if (el) { el.textContent = ''; el.focus() }
      }, 0)
      return true
    }
    if (text === '- ' || text === '* ') {
      updateBlock(block.id, { type: 'bulletList', content: '' } as any)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${block.id}"] [contenteditable]`) as HTMLElement
        if (el) { el.textContent = ''; el.focus() }
      }, 0)
      return true
    }
    if (text === '1. ') {
      updateBlock(block.id, { type: 'numberedList', content: '' } as any)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${block.id}"] [contenteditable]`) as HTMLElement
        if (el) { el.textContent = ''; el.focus() }
      }, 0)
      return true
    }
    if (text === '---') {
      updateBlock(block.id, { type: 'divider' } as any)
      const newBlock = createParagraphBlock()
      addBlockAfter(block.id, newBlock)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable]`) as HTMLElement
        el?.focus()
      }, 0)
      return true
    }
    return false
  }

  const handleInput = useCallback(() => {
    if (ref.current) {
      const text = ref.current.textContent || ''
      if (!tryMarkdownShortcut(text)) {
        updateBlock(block.id, { content: text })
      }
    }
  }, [block.id, updateBlock])

  const handleKeyDown = (e: KeyboardEvent) => {
    const text = ref.current?.textContent || ''

    if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        outdentBlock(block.id)
      } else {
        indentBlock(block.id)
      }
      return
    }

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
    <div data-block-id={block.id}>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="outline-none py-1 text-base leading-relaxed min-h-[1.5em] text-gray-900 dark:text-gray-100"
        data-placeholder="输入文字，或输入 '/' 插入块"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  )
}
