import { useState } from 'react'
import { Property, SortRule } from '../../types'
import { ArrowUpDown, X } from 'lucide-react'

interface Props {
  properties: Property[]
  sorts: SortRule[]
  onUpdate: (sorts: SortRule[]) => void
}

export function SortBar({ properties, sorts, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false)

  const addSort = (propertyId: string) => {
    onUpdate([...sorts, { propertyId, direction: 'asc' }])
    setShowAdd(false)
  }

  const removeSort = (index: number) => {
    onUpdate(sorts.filter((_, i) => i !== index))
  }

  const toggleDirection = (index: number) => {
    onUpdate(sorts.map((s, i) => i === index ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' } : s))
  }

  return (
    <div className="flex items-center gap-1 relative">
      {sorts.map((sort, idx) => {
        const prop = properties.find(p => p.id === sort.propertyId)
        return (
          <div key={idx} className="flex items-center gap-1 bg-purple-50 text-purple-700 rounded px-2 py-0.5 text-xs">
            <span className="font-medium">{prop?.name}</span>
            <button onClick={() => toggleDirection(idx)} className="hover:text-purple-900">
              {sort.direction === 'asc' ? '↑' : '↓'}
            </button>
            <button onClick={() => removeSort(idx)} className="hover:text-purple-900">
              <X size={10} />
            </button>
          </div>
        )
      })}

      <div className="relative">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-100"
        >
          <ArrowUpDown size={12} />
          排序
        </button>
        {showAdd && (
          <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
            {properties.map(prop => (
              <button
                key={prop.id}
                onClick={() => addSort(prop.id)}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50"
              >
                {prop.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
