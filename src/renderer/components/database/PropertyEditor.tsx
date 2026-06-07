import { useState } from 'react'
import { Property, PropertyType, SelectOption } from '../../types'
import { createId } from '../../lib/blockUtils'
import { Plus, Trash2, X } from 'lucide-react'

interface Props {
  properties: Property[]
  onUpdate: (properties: Property[]) => void
  onClose: () => void
}

const typeLabels: Record<PropertyType, string> = {
  text: '文本',
  number: '数字',
  date: '日期',
  select: '选择'
}

const defaultColors = [
  'bg-gray-200 text-gray-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-red-100 text-red-700',
  'bg-purple-100 text-purple-700'
]

export function PropertyEditor({ properties, onUpdate, onClose }: Props) {
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<PropertyType>('text')

  const addProperty = () => {
    if (!newName.trim()) return
    const prop: Property = newType === 'select'
      ? { id: createId(), name: newName.trim(), type: 'select', options: [] }
      : { id: createId(), name: newName.trim(), type: newType } as Property
    onUpdate([...properties, prop])
    setNewName('')
  }

  const removeProperty = (propId: string) => {
    onUpdate(properties.filter(p => p.id !== propId))
  }

  const renameProperty = (propId: string, name: string) => {
    onUpdate(properties.map(p => p.id === propId ? { ...p, name } : p))
  }

  const addSelectOption = (propId: string) => {
    onUpdate(properties.map(p => {
      if (p.id !== propId || p.type !== 'select') return p
      const color = defaultColors[p.options.length % defaultColors.length]
      const option: SelectOption = { id: createId(), label: '选项 ' + (p.options.length + 1), color }
      return { ...p, options: [...p.options, option] }
    }))
  }

  const updateSelectOption = (propId: string, optId: string, label: string) => {
    onUpdate(properties.map(p => {
      if (p.id !== propId || p.type !== 'select') return p
      return { ...p, options: p.options.map(o => o.id === optId ? { ...o, label } : o) }
    }))
  }

  const removeSelectOption = (propId: string, optId: string) => {
    onUpdate(properties.map(p => {
      if (p.id !== propId || p.type !== 'select') return p
      return { ...p, options: p.options.filter(o => o.id !== optId) }
    }))
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">属性管理</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {properties.map(prop => (
          <div key={prop.id} className="bg-white rounded border border-gray-200 p-2">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 text-sm border border-gray-200 rounded px-2 py-0.5 outline-none focus:border-blue-300"
                value={prop.name}
                onChange={e => renameProperty(prop.id, e.target.value)}
              />
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{typeLabels[prop.type]}</span>
              <button onClick={() => removeProperty(prop.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
            {prop.type === 'select' && (
              <div className="mt-2 pl-2 space-y-1">
                {prop.options.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${opt.color.split(' ')[0]}`}></span>
                    <input
                      className="flex-1 text-xs border border-gray-100 rounded px-1.5 py-0.5 outline-none focus:border-blue-200"
                      value={opt.label}
                      onChange={e => updateSelectOption(prop.id, opt.id, e.target.value)}
                    />
                    <button onClick={() => removeSelectOption(prop.id, opt.id)} className="text-gray-300 hover:text-red-400">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addSelectOption(prop.id)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  <Plus size={10} /> 添加选项
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-300"
          placeholder="属性名称"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addProperty() }}
        />
        <select
          className="text-sm border border-gray-200 rounded px-2 py-1 outline-none"
          value={newType}
          onChange={e => setNewType(e.target.value as PropertyType)}
        >
          {Object.entries(typeLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button
          onClick={addProperty}
          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          <Plus size={14} /> 添加
        </button>
      </div>
    </div>
  )
}
