import { useEffect } from 'react'
import { Download, FileDown } from 'lucide-react'
import { useSidebarStore } from '../../stores/sidebarStore'
import { useSpaceStore } from '../../stores/spaceStore'
import { usePageStore } from '../../stores/pageStore'
import { BlockEditor } from '../editor/BlockEditor'

export function MainContent() {
  const activePageId = useSidebarStore(s => s.activePageId)
  const activeSpaceId = useSpaceStore(s => s.activeSpaceId)
  const { page, loadPage, updatePageTitle } = usePageStore()

  useEffect(() => {
    if (activePageId && activeSpaceId) {
      loadPage(activeSpaceId, activePageId)
    } else {
      usePageStore.getState().setPage(null)
    }
  }, [activePageId, activeSpaceId, loadPage])

  const handleExportMarkdown = async () => {
    if (!page) return
    await window.api.exportMarkdown(page)
  }

  const handleExportPdf = async () => {
    if (!page) return
    await window.api.exportPdf(page)
  }

  if (!page) {
    return (
      <main className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-950">
        <div className="text-center">
          <p className="text-lg">选择或创建一个页面开始编辑</p>
          <p className="text-sm mt-2">使用 Ctrl+K 搜索页面</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-12 py-16">
        <div className="flex items-center gap-2 mb-8">
          <input
            className="flex-1 text-4xl font-bold border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 bg-transparent text-gray-900 dark:text-gray-100"
            value={page.meta.title}
            onChange={e => updatePageTitle(e.target.value)}
            placeholder="未命名页面"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleExportMarkdown}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="导出 Markdown"
            >
              <FileDown size={16} />
            </button>
            <button
              onClick={handleExportPdf}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="导出 PDF"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
        <BlockEditor />
      </div>
    </main>
  )
}
