import { useEffect, useRef } from 'react'
import { usePageStore } from '../stores/pageStore'

export function useAutoSave() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirty = usePageStore(s => s.isDirty)
  const getPage = usePageStore(s => s.getPage)
  const markClean = usePageStore(s => s.markClean)

  useEffect(() => {
    if (!isDirty) return

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const page = getPage()
      if (page) {
        await window.api.savePage(page)
        markClean()
      }
    }, 800)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [isDirty, getPage, markClean])
}
