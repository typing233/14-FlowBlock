import { useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { MainContent } from './components/layout/MainContent'
import { SearchDialog } from './components/search/SearchDialog'
import { useAutoSave } from './hooks/useAutoSave'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { initTheme } from './stores/themeStore'

initTheme()

export default function App() {
  useAutoSave()
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-gray-950">
      <Sidebar />
      <MainContent />
      <SearchDialog />
    </div>
  )
}
