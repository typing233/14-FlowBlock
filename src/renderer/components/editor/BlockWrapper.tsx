import { ReactNode, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal } from 'lucide-react'
import { Block } from '../../types'
import { BlockActionMenu } from './BlockActionMenu'

interface Props {
  block: Block
  children: ReactNode
}

export function BlockWrapper({ block, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  const indent = block.indent || 0
  const paddingLeft = indent * 24

  const handleMenuClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMenuPosition({ top: rect.bottom + 4, left: rect.left })
    setShowMenu(true)
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative flex items-start gap-1 py-0.5">
      <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleMenuClick}
          className="mt-1.5 text-gray-300 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <MoreHorizontal size={16} />
        </button>
        <button
          {...attributes}
          {...listeners}
          className="mt-1.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 shrink-0"
        >
          <GripVertical size={16} />
        </button>
      </div>
      <div className="flex-1 min-w-0" style={{ paddingLeft }}>
        {children}
      </div>

      {showMenu && (
        <BlockActionMenu
          block={block}
          position={menuPosition}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
