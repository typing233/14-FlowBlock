import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Type, Heading1, Heading2, Heading3, CheckSquare, Database } from 'lucide-react'
import { usePageStore } from '../../stores/pageStore'
import { createParagraphBlock, createHeadingBlock, createTodoBlock, createDatabaseBlock } from '../../lib/blockUtils'
import { Block } from '../../types'

interface Props {
  blockId: string
  position: { top: number; left: number }
  onClose: () => void
}

const commands = [
  { id: 'paragraph', label: '正文', description: '普通文本段落', icon: Type, create: () => createParagraphBlock() },
  { id: 'h1', label: '标题 1', description: '大标题', icon: Heading1, create: () => createHeadingBlock(1) },
  { id: 'h2', label: '标题 2', description: '中标题', icon: Heading2, create: () => createHeadingBlock(2) },
  { id: 'h3', label: '标题 3', description: '小标题', icon: Heading3, create: () => createHeadingBlock(3) },
  { id: 'todo', label: '待办事项', description: '带复选框的任务', icon: CheckSquare, create: () => createTodoBlock() },
  { id: 'database', label: '数据库', description: '表格和看板视图', icon: Database, create: () => createDatabaseBlock() },
]

export function SlashCommandMenu({ blockId, position, onClose }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filter, setFilter] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const { updateBlock, addBlockAfter, deleteBlock } = usePageStore()

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
    cmd.description.toLowerCase().includes(filter.toLowerCase())
  )

  const executeCommand = (create: () => Block) => {
    const newBlock = create()
    const page = usePageStore.getState().page
    if (!page) return

    const currentBlock = page.blocks.find(b => b.id === blockId)
    if (currentBlock && currentBlock.type === 'paragraph' && (currentBlock as any).content === '') {
      // Replace empty paragraph with new block type
      if (newBlock.type === 'paragraph') {
        // Already a paragraph, just focus
      } else {
        addBlockAfter(blockId, newBlock)
        deleteBlock(blockId)
      }
    } else {
      addBlockAfter(blockId, newBlock)
    }

    onClose()
    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable]`) as HTMLElement
      el?.focus()
    }, 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex].create)
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filter])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-2 border-b border-gray-100">
        <input
          autoFocus
          className="w-full text-sm px-2 py-1 border border-gray-200 rounded outline-none focus:border-blue-400"
          placeholder="搜索块类型..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="max-h-60 overflow-y-auto p-1">
        {filtered.map((cmd, idx) => (
          <button
            key={cmd.id}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm transition-colors ${
              idx === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
            onClick={() => executeCommand(cmd.create)}
            onMouseEnter={() => setSelectedIndex(idx)}
          >
            <cmd.icon size={18} className="text-gray-500 shrink-0" />
            <div>
              <div className="font-medium text-gray-700">{cmd.label}</div>
              <div className="text-xs text-gray-400">{cmd.description}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-400 text-center">未找到匹配的块类型</div>
        )}
      </div>
    </div>
  )
}
