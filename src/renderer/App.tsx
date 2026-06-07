import { useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { MainContent } from './components/layout/MainContent'
import { useSidebarStore } from './stores/sidebarStore'
import { useAutoSave } from './hooks/useAutoSave'

export default function App() {
  const fetchPages = useSidebarStore(s => s.fetchPages)
  useAutoSave()

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <MainContent />
    </div>
  )
}
