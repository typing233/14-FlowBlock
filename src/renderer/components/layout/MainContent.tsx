import { useEffect } from 'react'
import { useSidebarStore } from '../../stores/sidebarStore'
import { usePageStore } from '../../stores/pageStore'
import { BlockEditor } from '../editor/BlockEditor'

export function MainContent() {
  const activePageId = useSidebarStore(s => s.activePageId)
  const { page, loadPage, updatePageTitle } = usePageStore()

  useEffect(() => {
    if (activePageId) {
      loadPage(activePageId)
    } else {
      usePageStore.getState().setPage(null)
    }
  }, [activePageId, loadPage])

  if (!page) {
    return (
      <main className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg">选择或创建一个页面开始编辑</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-12 py-16">
        <input
          className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 mb-8"
          value={page.meta.title}
          onChange={e => updatePageTitle(e.target.value)}
          placeholder="未命名页面"
        />
        <BlockEditor />
      </div>
    </main>
  )
}
