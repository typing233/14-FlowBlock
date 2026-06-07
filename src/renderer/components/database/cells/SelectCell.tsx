import { useState, useRef, useEffect } from 'react'
import { SelectOption, CellValue } from '../../../types'
import { ChevronDown } from 'lucide-react'

interface Props {
  value: string | null
  options: SelectOption[]
  onChange: (value: CellValue) => void
}

export function SelectCell({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.id === value)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1 px-1 py-0.5 rounded hover:bg-gray-100 min-h-[24px] text-left"
      >
        {selected ? (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${selected.color}`}>{selected.label}</span>
        ) : (
          <span className="text-gray-300 text-sm">选择...</span>
        )}
        <ChevronDown size={12} className="ml-auto text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1">
          <button
            onClick={() => { onChange(null); setOpen(false) }}
            className="w-full px-3 py-1.5 text-left text-sm text-gray-400 hover:bg-gray-50"
          >
            清除
          </button>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false) }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${opt.color}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
