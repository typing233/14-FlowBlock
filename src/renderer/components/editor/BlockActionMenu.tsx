import { useState, useRef, useEffect } from 'react'
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Trash2, Copy, ArrowUp, ArrowDown, Indent, Outdent } from 'lucide-react'
import { usePageStore } from '../../stores/pageStore'
import { createHeadingBlock, createParagraphBlock, createQuoteBlock, createBulletListBlock, createNumberedListBlock } from '../../lib/blockUtils'
import { Block } from '../../types'

interface Props {
  block: Block
  onClose: () => void
  position: { top: number; left: number }
}

export function BlockActionMenu({ block, onClose, position }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const { updateBlock, deleteBlock, duplicateBlock, moveBlockUp, moveBlockDown, indentBlock, outdentBlock, addBlockAfter } = usePageStore()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const convertTo = (type: string) => {
    const content = (block as any).content || ''
    switch (type) {
      case 'paragraph':
        updateBlock(block.id, { type: 'paragraph', content } as any)
        break
      case 'h1':
        updateBlock(block.id, { type: 'heading', content, level: 1 } as any)
        break
      case 'h2':
        updateBlock(block.id, { type: 'heading', content, level: 2 } as any)
        break
      case 'h3':
        updateBlock(block.id, { type: 'heading', content, level: 3 } as any)
        break
      case 'quote':
        updateBlock(block.id, { type: 'quote', content } as any)
        break
      case 'bulletList':
        updateBlock(block.id, { type: 'bulletList', content } as any)
        break
      case 'numberedList':
        updateBlock(block.id, { type: 'numberedList', content } as any)
        break
    }
    onClose()
  }

  const handleDelete = () => {
    deleteBlock(block.id)
    onClose()
  }

  const handleDuplicate = () => {
    duplicateBlock(block.id)
    onClose()
  }

  const handleMoveUp = () => {
    moveBlockUp(block.id)
    onClose()
  }

  const handleMoveDown = () => {
    moveBlockDown(block.id)
    onClose()
  }

  const handleIndent = () => {
    indentBlock(block.id)
    onClose()
  }

  const handleOutdent = () => {
    outdentBlock(block.id)
    onClose()
  }

  const canConvert = block.type !== 'database' && block.type !== 'image' && block.type !== 'divider' && block.type !== 'code'

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-1 max-h-80 overflow-y-auto">
        {canConvert && (
          <>
            <div className="px-2 py-1 text-xs text-gray-400 font-medium">转换为</div>
            <MenuItem icon={Type} label="正文" onClick={() => convertTo('paragraph')} />
            <MenuItem icon={Heading1} label="标题 1" onClick={() => convertTo('h1')} />
            <MenuItem icon={Heading2} label="标题 2" onClick={() => convertTo('h2')} />
            <MenuItem icon={Heading3} label="标题 3" onClick={() => convertTo('h3')} />
            <MenuItem icon={Quote} label="引用" onClick={() => convertTo('quote')} />
            <MenuItem icon={List} label="无序列表" onClick={() => convertTo('bulletList')} />
            <MenuItem icon={ListOrdered} label="有序列表" onClick={() => convertTo('numberedList')} />
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          </>
        )}
        <div className="px-2 py-1 text-xs text-gray-400 font-medium">操作</div>
        <MenuItem icon={Copy} label="复制" onClick={handleDuplicate} />
        <MenuItem icon={ArrowUp} label="上移" onClick={handleMoveUp} />
        <MenuItem icon={ArrowDown} label="下移" onClick={handleMoveDown} />
        <MenuItem icon={Indent} label="增加缩进" onClick={handleIndent} />
        <MenuItem icon={Outdent} label="减少缩进" onClick={handleOutdent} />
        <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
        <MenuItem icon={Trash2} label="删除" onClick={handleDelete} danger />
      </div>
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={onClick}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  )
}
