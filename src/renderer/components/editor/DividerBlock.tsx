import { usePageStore } from '../../stores/pageStore'
import { DividerBlock as DividerBlockType } from '../../types'

interface Props {
  block: DividerBlockType
}

export function DividerBlock({ block }: Props) {
  const { deleteBlock } = usePageStore()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      const focusId = deleteBlock(block.id)
      if (focusId) {
        setTimeout(() => {
          const el = document.querySelector(`[data-block-id="${focusId}"] [contenteditable]`) as HTMLElement
          el?.focus()
        }, 0)
      }
    }
  }

  return (
    <div data-block-id={block.id} tabIndex={0} onKeyDown={handleKeyDown} className="py-3 outline-none">
      <hr className="border-gray-200 dark:border-gray-700" />
    </div>
  )
}
