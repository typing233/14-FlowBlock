import { Property, Row, SelectProperty, CellValue } from '../../types'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  properties: Property[]
  rows: Row[]
  groupByPropertyId?: string
  onAddRow: (prefill?: Record<string, any>) => void
  onUpdateRow: (rowId: string, propertyId: string, value: CellValue) => void
  onDeleteRow: (rowId: string) => void
}

export function KanbanView({ properties, rows, groupByPropertyId, onAddRow, onUpdateRow, onDeleteRow }: Props) {
  const groupProp = properties.find(p => p.id === groupByPropertyId && p.type === 'select') as SelectProperty | undefined

  if (!groupProp) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm">
        看板视图需要一个「选择」类型的属性进行分组
      </div>
    )
  }

  const columns = [
    ...groupProp.options.map(opt => ({
      id: opt.id,
      label: opt.label,
      color: opt.color,
      rows: rows.filter(r => r.cells[groupProp.id] === opt.id)
    })),
    {
      id: '__none__',
      label: '未分类',
      color: 'bg-gray-100 text-gray-600',
      rows: rows.filter(r => !r.cells[groupProp.id])
    }
  ]

  const titleProp = properties.find(p => p.type === 'text')

  return (
    <div className="flex gap-3 p-4 overflow-x-auto min-h-[300px]">
      {columns.map(col => (
        <div key={col.id} className="flex-shrink-0 w-64 bg-gray-50 rounded-lg p-2">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${col.color}`}>{col.label}</span>
            <span className="text-xs text-gray-400 ml-auto">{col.rows.length}</span>
          </div>

          <div className="space-y-2">
            {col.rows.map(row => (
              <div
                key={row.id}
                className="group bg-white border border-gray-200 rounded-md p-3 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-gray-700 flex-1">
                    {titleProp ? (row.cells[titleProp.id] as string) || '未命名' : '未命名'}
                  </div>
                  <button
                    onClick={() => onDeleteRow(row.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {properties.filter(p => p.id !== groupProp.id && p.id !== titleProp?.id).slice(0, 2).map(prop => {
                    const cellVal = row.cells[prop.id]
                    if (cellVal === null || cellVal === '') return null
                    return (
                      <span key={prop.id} className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {prop.name}: {String(cellVal)}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onAddRow(col.id !== '__none__' ? { [groupProp.id]: col.id } : undefined)}
            className="w-full mt-2 flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <Plus size={12} />
            新增
          </button>
        </div>
      ))}
    </div>
  )
}
