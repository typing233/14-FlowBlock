import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, FileText, Trash2, Check, X, ChevronRight, ChevronDown, FolderOpen, Moon, Sun, Monitor, Import } from 'lucide-react'
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors, DragOverEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSidebarStore } from '../../stores/sidebarStore'
import { useSpaceStore } from '../../stores/spaceStore'
import { useThemeStore } from '../../stores/themeStore'
import { createId } from '../../lib/blockUtils'
import { PageMeta } from '../../types'

interface TreeNode {
  page: PageMeta
  children: TreeNode[]
  expanded: boolean
}

interface FlatItem {
  page: PageMeta
  depth: number
  hasChildren: boolean
  expanded: boolean
}

function flattenTree(nodes: TreeNode[], depth = 0): FlatItem[] {
  const result: FlatItem[] = []
  for (const node of nodes) {
    result.push({
      page: node.page,
      depth,
      hasChildren: node.children.length > 0,
      expanded: node.expanded
    })
    if (node.expanded) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}

export function Sidebar() {
  const { pages, activePageId, fetchPages, createPage, setActivePageId, renamePage, deletePage, toggleExpanded, getTree, sidebarVisible, movePageToParent } = useSidebarStore()
  const { spaces, activeSpaceId, fetchSpaces, createSpace, setActiveSpaceId } = useSpaceStore()
  const { theme, setTheme } = useThemeStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [showSpaceMenu, setShowSpaceMenu] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropIndicator, setDropIndicator] = useState<{ id: string; position: 'before' | 'after' | 'inside' } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    fetchSpaces()
  }, [])

  useEffect(() => {
    if (activeSpaceId) {
      fetchPages(activeSpaceId)
    }
  }, [activeSpaceId])

  const tree = getTree()
  const flatItems = useMemo(() => flattenTree(tree), [tree])
  const flatIds = useMemo(() => flatItems.map(item => item.page.id), [flatItems])

  if (!sidebarVisible) return null

  const handleCreate = async (parentId: string | null = null) => {
    if (activeSpaceId) {
      await createPage(activeSpaceId, parentId)
    }
  }

  const handleImport = async () => {
    const result = await window.api.importMarkdown()
    if (result && activeSpaceId) {
      const id = createId()
      const now = new Date().toISOString()
      const page = {
        meta: { id, title: result.title, spaceId: activeSpaceId, parentId: null, order: Date.now(), createdAt: now, updatedAt: now },
        blocks: result.blocks
      }
      await window.api.savePage(page)
      await fetchPages(activeSpaceId)
      setActivePageId(id)
    }
  }

  const startRename = (pageId: string, currentTitle: string) => {
    setEditingId(pageId)
    setEditTitle(currentTitle)
  }

  const confirmRename = async () => {
    if (editingId && editTitle.trim() && activeSpaceId) {
      await renamePage(activeSpaceId, editingId, editTitle.trim())
    }
    setEditingId(null)
  }

  const cancelRename = () => {
    setEditingId(null)
  }

  const handleCreateSpace = async () => {
    const name = prompt('输入空间名称')
    if (name?.trim()) {
      await createSpace(name.trim())
    }
    setShowSpaceMenu(false)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setDragId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      setDropIndicator(null)
      return
    }

    const overRect = (over as any).rect?.current?.translated
    const overElement = document.querySelector(`[data-page-tree-id="${over.id}"]`)
    if (!overElement) {
      setDropIndicator({ id: over.id as string, position: 'after' })
      return
    }

    const rect = overElement.getBoundingClientRect()
    const y = (event.activatorEvent as MouseEvent).clientY + (event.delta?.y || 0)
    const relativeY = y - rect.top
    const height = rect.height

    if (relativeY < height * 0.25) {
      setDropIndicator({ id: over.id as string, position: 'before' })
    } else if (relativeY > height * 0.75) {
      setDropIndicator({ id: over.id as string, position: 'after' })
    } else {
      setDropIndicator({ id: over.id as string, position: 'inside' })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDragId(null)
    setDropIndicator(null)

    if (!over || active.id === over.id || !activeSpaceId) return

    const draggedId = active.id as string
    const overId = over.id as string
    const overItem = flatItems.find(item => item.page.id === overId)
    if (!overItem) return

    const indicator = dropIndicator || { id: overId, position: 'after' as const }

    if (indicator.position === 'inside') {
      // Reparent: make draggedId a child of overId
      await movePageToParent(activeSpaceId, draggedId, overId, null)
    } else if (indicator.position === 'before') {
      // Insert before overItem: same parent as overItem
      const parentId = overItem.page.parentId || null
      // Find previous sibling
      const siblings = pages
        .filter(p => (p.parentId || null) === parentId)
        .sort((a, b) => a.order - b.order)
      const overIdx = siblings.findIndex(s => s.id === overId)
      const afterPageId = overIdx > 0 ? siblings[overIdx - 1].id : null
      await movePageToParent(activeSpaceId, draggedId, parentId, afterPageId)
    } else {
      // Insert after overItem: same parent as overItem
      const parentId = overItem.page.parentId || null
      await movePageToParent(activeSpaceId, draggedId, parentId, overId)
    }
  }

  const activeSpace = spaces.find(s => s.id === activeSpaceId)

  const themeIcons = { light: Sun, dark: Moon, system: Monitor }
  const nextTheme: Record<string, 'light' | 'dark' | 'system'> = { light: 'dark', dark: 'system', system: 'light' }
  const ThemeIcon = themeIcons[theme]

  return (
    <aside className="w-60 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col select-none">
      {/* Space switcher */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div
          className="relative flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => setShowSpaceMenu(!showSpaceMenu)}
        >
          <FolderOpen size={14} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate flex-1">
            {activeSpace?.name || 'FlowBlock'}
          </span>
          <ChevronDown size={12} className="text-gray-400" />
        </div>

        {showSpaceMenu && (
          <div className="absolute z-40 mt-1 left-3 right-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {spaces.map(space => (
              <button
                key={space.id}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  space.id === activeSpaceId
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => { setActiveSpaceId(space.id); setShowSpaceMenu(false) }}
              >
                {space.name}
              </button>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-700">
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={handleCreateSpace}
              >
                <Plus size={12} className="inline mr-1" />新建空间
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Page tree with DnD */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={flatIds} strategy={verticalListSortingStrategy}>
            {flatItems.map(item => (
              <SortableTreeItem
                key={item.page.id}
                item={item}
                activePageId={activePageId}
                editingId={editingId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                isDragging={dragId === item.page.id}
                dropIndicator={dropIndicator?.id === item.page.id ? dropIndicator.position : null}
                onSelect={setActivePageId}
                onDoubleClick={startRename}
                onToggle={toggleExpanded}
                onDelete={(id) => activeSpaceId && deletePage(activeSpaceId, id)}
                onCreateChild={(parentId) => handleCreate(parentId)}
                onConfirmRename={confirmRename}
                onCancelRename={cancelRename}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {dragId && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 opacity-90">
                {pages.find(p => p.id === dragId)?.title || ''}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Bottom actions */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <button
          onClick={() => handleCreate(null)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <Plus size={14} />
          <span>新建页面</span>
        </button>
        <button
          onClick={handleImport}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <Import size={14} />
          <span>导入 Markdown</span>
        </button>
        <button
          onClick={() => setTheme(nextTheme[theme])}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <ThemeIcon size={14} />
          <span>{theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}</span>
        </button>
      </div>
    </aside>
  )
}

interface SortableTreeItemProps {
  item: FlatItem
  activePageId: string | null
  editingId: string | null
  editTitle: string
  setEditTitle: (v: string) => void
  isDragging: boolean
  dropIndicator: 'before' | 'after' | 'inside' | null
  onSelect: (id: string) => void
  onDoubleClick: (id: string, title: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onCreateChild: (parentId: string) => void
  onConfirmRename: () => void
  onCancelRename: () => void
}

function SortableTreeItem({ item, activePageId, editingId, editTitle, setEditTitle, isDragging, dropIndicator, onSelect, onDoubleClick, onToggle, onDelete, onCreateChild, onConfirmRename, onCancelRename }: SortableTreeItemProps) {
  const { page, depth, hasChildren, expanded } = item
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  return (
    <div ref={setNodeRef} style={style} data-page-tree-id={page.id} className="relative">
      {/* Drop indicators */}
      {dropIndicator === 'before' && (
        <div className="absolute top-0 left-4 right-2 h-0.5 bg-blue-500 rounded" />
      )}
      {dropIndicator === 'after' && (
        <div className="absolute bottom-0 left-4 right-2 h-0.5 bg-blue-500 rounded" />
      )}

      <div
        className={`group flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer text-sm ${
          dropIndicator === 'inside'
            ? 'bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-400'
            : activePageId === page.id
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={() => onSelect(page.id)}
        onDoubleClick={() => onDoubleClick(page.id, page.title)}
      >
        {/* Drag handle area */}
        <span {...attributes} {...listeners} className="shrink-0 cursor-grab active:cursor-grabbing">
          <button
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={(e) => { e.stopPropagation(); onToggle(page.id) }}
          >
            {hasChildren ? (
              expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            ) : <span className="w-3" />}
          </button>
        </span>
        <FileText size={13} className="shrink-0 text-gray-400" />

        {editingId === page.id ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              className="flex-1 min-w-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 py-0 text-sm"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onConfirmRename()
                if (e.key === 'Escape') onCancelRename()
              }}
              autoFocus
              onClick={e => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); onConfirmRename() }} className="text-green-600 hover:text-green-700">
              <Check size={12} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onCancelRename() }} className="text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1 truncate">{page.title}</span>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
              <button
                className="text-gray-400 hover:text-blue-500"
                onClick={(e) => { e.stopPropagation(); onCreateChild(page.id) }}
                title="添加子页面"
              >
                <Plus size={12} />
              </button>
              <button
                className="text-gray-400 hover:text-red-500"
                onClick={(e) => { e.stopPropagation(); onDelete(page.id) }}
                title="删除"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
