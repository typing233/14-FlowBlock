import { useState, useRef } from 'react'
import { Image, Upload } from 'lucide-react'
import { usePageStore } from '../../stores/pageStore'
import { ImageBlock as ImageBlockType } from '../../types'

interface Props {
  block: ImageBlockType
}

export function ImageBlock({ block }: Props) {
  const { updateBlock, deleteBlock } = usePageStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      updateBlock(block.id, { src: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !block.src) {
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

  if (!block.src) {
    return (
      <div
        data-block-id={block.id}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragging ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={20} className="text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">点击上传或拖放图片</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
        />
      </div>
    )
  }

  return (
    <div data-block-id={block.id} className="my-2">
      <img
        src={block.src}
        alt={block.caption}
        className="max-w-full rounded-lg"
        style={block.width ? { width: block.width } : undefined}
      />
      <input
        className="w-full text-sm text-gray-500 dark:text-gray-400 mt-1 bg-transparent outline-none placeholder-gray-400"
        placeholder="添加说明..."
        value={block.caption}
        onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
      />
    </div>
  )
}
