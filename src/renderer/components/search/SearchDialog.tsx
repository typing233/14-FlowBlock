import { useEffect, useRef, useState } from 'react'
import { Search, FileText, X } from 'lucide-react'
import { useSearchStore } from '../../stores/searchStore'
import { useSidebarStore } from '../../stores/sidebarStore'
import { useSpaceStore } from '../../stores/spaceStore'

export function SearchDialog() {
  const { isOpen, query, results, loading, close, setQuery, search } = useSearchStore()
  const setActivePageId = useSidebarStore(s => s.setActivePageId)
  const setActiveSpaceId = useSpaceStore(s => s.setActiveSpaceId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0)
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      search(query)
    }, 200)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleSelect = (result: typeof results[0]) => {
    setActiveSpaceId(result.spaceId)
    setActivePageId(result.pageId)
    close()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      close()
    }
  }

  if (!isOpen) return null

  const highlightQuery = (text: string) => {
    if (!query.trim()) return text
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="search-highlight">{part}</mark>
        : part
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={close}>
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            className="flex-1 text-base outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400"
            placeholder="搜索页面和内容..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={close} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">搜索中...</div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">未找到匹配结果</div>
          )}
          {!loading && results.map((result, idx) => (
            <button
              key={`${result.pageId}-${result.blockId}-${idx}`}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                idx === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <FileText size={16} className="mt-0.5 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {highlightQuery(result.pageTitle)}
                </div>
                {result.snippet && result.snippet !== result.pageTitle && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {highlightQuery(result.snippet)}
                  </div>
                )}
              </div>
            </button>
          ))}
          {!loading && !query && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">输入关键词开始搜索</div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 flex gap-4">
          <span>↑↓ 导航</span>
          <span>↵ 打开</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  )
}
