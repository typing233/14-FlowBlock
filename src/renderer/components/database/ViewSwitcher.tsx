import { Table2, Columns3 } from 'lucide-react'
import { ViewConfig } from '../../types'

interface Props {
  views: ViewConfig[]
  activeViewId: string
  onSwitch: (viewId: string) => void
}

export function ViewSwitcher({ views, activeViewId, onSwitch }: Props) {
  return (
    <div className="flex items-center gap-1">
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onSwitch(view.id)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            view.id === activeViewId
              ? 'bg-gray-200 text-gray-800'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {view.type === 'table' ? <Table2 size={12} /> : <Columns3 size={12} />}
          {view.name}
        </button>
      ))}
    </div>
  )
}
