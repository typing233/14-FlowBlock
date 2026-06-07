import { useState } from 'react'
import { CellValue } from '../../../types'

interface Props {
  value: string | null
  onChange: (value: CellValue) => void
}

export function TextCell({ value, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value || '')

  const commit = () => {
    onChange(text || null)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        className="w-full bg-transparent border border-blue-300 rounded px-1 py-0.5 text-sm outline-none"
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
      />
    )
  }

  return (
    <div
      className="min-h-[24px] cursor-text px-1 py-0.5 rounded hover:bg-gray-100"
      onClick={() => { setText(value || ''); setEditing(true) }}
    >
      {value || <span className="text-gray-300">空</span>}
    </div>
  )
}
