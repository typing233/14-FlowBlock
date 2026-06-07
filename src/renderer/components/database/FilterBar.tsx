import { useState } from 'react'
import { Property, FilterRule, FilterOperator } from '../../types'
import { Filter, Plus, X } from 'lucide-react'

interface Props {
  properties: Property[]
  filters: FilterRule[]
  onUpdate: (filters: FilterRule[]) => void
}

const operators: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'greater_than', label: '大于' },
  { value: 'less_than', label: '小于' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' }
]

export function FilterBar({ properties, filters, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false)

  const addFilter = (propertyId: string) => {
    onUpdate([...filters, { propertyId, operator: 'equals', value: '' }])
    setShowAdd(false)
  }

  const removeFilter = (index: number) => {
    onUpdate(filters.filter((_, i) => i !== index))
  }

  const updateFilter = (index: number, updates: Partial<FilterRule>) => {
    onUpdate(filters.map((f, i) => i === index ? { ...f, ...updates } : f))
  }

  return (
    <div className="flex items-center gap-1 relative">
      {filters.map((filter, idx) => {
        const prop = properties.find(p => p.id === filter.propertyId)
        return (
          <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 rounded px-2 py-0.5 text-xs">
            <span className="font-medium">{prop?.name}</span>
            <select
              className="bg-transparent border-none text-xs outline-none"
              value={filter.operator}
              onChange={e => updateFilter(idx, { operator: e.target.value as FilterOperator })}
            >
              {operators.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
            {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
              <input
                className="w-16 bg-white border border-blue-200 rounded px-1 text-xs"
                value={filter.value ?? ''}
                onChange={e => updateFilter(idx, { value: e.target.value })}
              />
            )}
            <button onClick={() => removeFilter(idx)} className="hover:text-blue-900">
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
          <Filter size={12} />
          筛选
        </button>
        {showAdd && (
          <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
            {properties.map(prop => (
              <button
                key={prop.id}
                onClick={() => addFilter(prop.id)}
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
