import { useState } from 'react'
import { CellValue } from '../../../types'

interface Props {
  value: number | null
  onChange: (value: CellValue) => void
}

export function NumberCell({ value, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value !== null ? String(value) : '')

  const commit = () => {
    const num = text === '' ? null : Number(text)
    onChange(isNaN(num as number) ? null : num)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
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
      onClick={() => { setText(value !== null ? String(value) : ''); setEditing(true) }}
    >
      {value !== null ? value : <span className="text-gray-300">空</span>}
    </div>
  )
}
