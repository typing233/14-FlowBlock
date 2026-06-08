import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Type, Heading1, Heading2, Heading3, CheckSquare, Database, Image, Code, Quote, Minus, List, ListOrdered } from 'lucide-react'
import { usePageStore } from '../../stores/pageStore'
import { createParagraphBlock, createHeadingBlock, createTodoBlock, createDatabaseBlock, createImageBlock, createCodeBlock, createQuoteBlock, createDividerBlock, createBulletListBlock, createNumberedListBlock } from '../../lib/blockUtils'
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
  { id: 'bulletList', label: '无序列表', description: '圆点标记列表', icon: List, create: () => createBulletListBlock() },
  { id: 'numberedList', label: '有序列表', description: '数字标记列表', icon: ListOrdered, create: () => createNumberedListBlock() },
  { id: 'quote', label: '引用', description: '引用文本块', icon: Quote, create: () => createQuoteBlock() },
  { id: 'code', label: '代码块', description: '带语法高亮的代码', icon: Code, create: () => createCodeBlock() },
  { id: 'image', label: '图片', description: '上传或粘贴图片', icon: Image, create: () => createImageBlock() },
  { id: 'divider', label: '分割线', description: '水平分隔线', icon: Minus, create: () => createDividerBlock() },
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
      const el = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable], [data-block-id="${newBlock.id}"] textarea`) as HTMLElement
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
      className="fixed z-50 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-2 border-b border-gray-100 dark:border-gray-700">
        <input
          autoFocus
          className="w-full text-sm px-2 py-1 border border-gray-200 dark:border-gray-600 rounded outline-none focus:border-blue-400 bg-white dark:bg-gray-900 dark:text-gray-200"
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
              idx === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => executeCommand(cmd.create)}
            onMouseEnter={() => setSelectedIndex(idx)}
          >
            <cmd.icon size={18} className="text-gray-500 dark:text-gray-400 shrink-0" />
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-200">{cmd.label}</div>
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
