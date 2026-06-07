import { useState } from 'react'
import { Plus, FileText, Trash2, Check, X } from 'lucide-react'
import { useSidebarStore } from '../../stores/sidebarStore'

export function Sidebar() {
  const { pages, activePageId, createPage, setActivePageId, renamePage, deletePage } = useSidebarStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleCreate = async () => {
    await createPage()
  }

  const startRename = (pageId: string, currentTitle: string) => {
    setEditingId(pageId)
    setEditTitle(currentTitle)
  }

  const confirmRename = async () => {
    if (editingId && editTitle.trim()) {
      await renamePage(editingId, editTitle.trim())
    }
    setEditingId(null)
  }

  const cancelRename = () => {
    setEditingId(null)
  }

  return (
    <aside className="w-60 h-full bg-gray-50 border-r border-gray-200 flex flex-col select-none">
      <div className="p-4 font-semibold text-sm text-gray-500 flex items-center justify-between" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <span>FlowBlock</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {pages.map(page => (
          <div
            key={page.id}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm ${
              activePageId === page.id ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActivePageId(page.id)}
            onDoubleClick={() => startRename(page.id, page.title)}
          >
            <FileText size={14} className="shrink-0 text-gray-400" />
            {editingId === page.id ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <input
                  className="flex-1 min-w-0 bg-white border border-gray-300 rounded px-1 py-0 text-sm"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') confirmRename()
                    if (e.key === 'Escape') cancelRename()
                  }}
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
                <button onClick={(e) => { e.stopPropagation(); confirmRename() }} className="text-green-600 hover:text-green-700">
                  <Check size={12} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); cancelRename() }} className="text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 truncate">{page.title}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); deletePage(page.id) }}
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-gray-200">
        <button
          onClick={handleCreate}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Plus size={14} />
          <span>新建页面</span>
        </button>
      </div>
    </aside>
  )
}
