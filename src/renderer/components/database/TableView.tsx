import { Property, Row, CellValue } from '../../types'
import { Plus, Trash2 } from 'lucide-react'
import { TextCell } from './cells/TextCell'
import { NumberCell } from './cells/NumberCell'
import { DateCell } from './cells/DateCell'
import { SelectCell } from './cells/SelectCell'

interface Props {
  properties: Property[]
  rows: Row[]
  onAddRow: () => void
  onUpdateRow: (rowId: string, propertyId: string, value: CellValue) => void
  onDeleteRow: (rowId: string) => void
}

export function TableView({ properties, rows, onAddRow, onUpdateRow, onDeleteRow }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {properties.map(prop => (
              <th key={prop.id} className="px-3 py-2 text-left font-medium text-gray-500 min-w-[120px]">
                {prop.name}
              </th>
            ))}
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="group border-b border-gray-100 hover:bg-gray-50">
              {properties.map(prop => (
                <td key={prop.id} className="px-3 py-1.5">
                  <CellRenderer
                    property={prop}
                    value={row.cells[prop.id]}
                    onChange={(value) => onUpdateRow(row.id, prop.id, value)}
                  />
                </td>
              ))}
              <td className="px-2">
                <button
                  onClick={() => onDeleteRow(row.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={onAddRow}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
      >
        <Plus size={14} />
        <span>新增行</span>
      </button>
    </div>
  )
}

function CellRenderer({ property, value, onChange }: { property: Property; value: CellValue; onChange: (v: CellValue) => void }) {
  switch (property.type) {
    case 'text':
      return <TextCell value={value as string} onChange={onChange} />
    case 'number':
      return <NumberCell value={value as number | null} onChange={onChange} />
    case 'date':
      return <DateCell value={value as string | null} onChange={onChange} />
    case 'select':
      return <SelectCell value={value as string | null} options={property.options} onChange={onChange} />
    default:
      return null
  }
}
