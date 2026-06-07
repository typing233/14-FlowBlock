import { useState, useMemo } from 'react'
import { DatabaseBlock, Database, Row, ViewConfig } from '../../types'
import { usePageStore } from '../../stores/pageStore'
import { createId } from '../../lib/blockUtils'
import { sortRows, filterRows } from '../../lib/databaseUtils'
import { TableView } from './TableView'
import { KanbanView } from './KanbanView'
import { ViewSwitcher } from './ViewSwitcher'
import { FilterBar } from './FilterBar'
import { SortBar } from './SortBar'
import { PropertyEditor } from './PropertyEditor'
import { Settings2 } from 'lucide-react'

interface Props {
  block: DatabaseBlock
}

export function DatabaseBlockComponent({ block }: Props) {
  const { updateBlock } = usePageStore()
  const [showPropertyEditor, setShowPropertyEditor] = useState(false)
  const db = block.database

  const activeView = db.views.find(v => v.id === db.activeViewId) || db.views[0]

  const displayedRows = useMemo(() => {
    let rows = db.rows
    rows = filterRows(rows, db.properties, activeView.filters)
    rows = sortRows(rows, db.properties, activeView.sorts)
    return rows
  }, [db.rows, db.properties, activeView.filters, activeView.sorts])

  const updateDatabase = (updates: Partial<Database>) => {
    updateBlock(block.id, { database: { ...db, ...updates } } as any)
  }

  const updateView = (viewUpdates: Partial<ViewConfig>) => {
    const views = db.views.map(v => v.id === activeView.id ? { ...v, ...viewUpdates } : v)
    updateDatabase({ views })
  }

  const setActiveView = (viewId: string) => {
    updateDatabase({ activeViewId: viewId })
  }

  const addRow = (prefill?: Record<string, any>) => {
    const newRow: Row = {
      id: createId(),
      cells: { ...Object.fromEntries(db.properties.map(p => [p.id, null])), ...prefill },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    updateDatabase({ rows: [...db.rows, newRow] })
  }

  const updateRow = (rowId: string, propertyId: string, value: any) => {
    const rows = db.rows.map(r =>
      r.id === rowId ? { ...r, cells: { ...r.cells, [propertyId]: value }, updatedAt: new Date().toISOString() } : r
    )
    updateDatabase({ rows })
  }

  const deleteRow = (rowId: string) => {
    updateDatabase({ rows: db.rows.filter(r => r.id !== rowId) })
  }

  return (
    <div data-block-id={block.id} className="my-4 border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <input
          className="font-semibold text-base bg-transparent outline-none"
          value={db.title}
          onChange={e => updateDatabase({ title: e.target.value })}
          placeholder="数据库标题"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPropertyEditor(!showPropertyEditor)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200"
          >
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white">
        <ViewSwitcher views={db.views} activeViewId={activeView.id} onSwitch={setActiveView} />
        <div className="ml-auto flex items-center gap-2">
          <FilterBar properties={db.properties} filters={activeView.filters} onUpdate={(filters) => updateView({ filters })} />
          <SortBar properties={db.properties} sorts={activeView.sorts} onUpdate={(sorts) => updateView({ sorts })} />
        </div>
      </div>

      {showPropertyEditor && (
        <PropertyEditor
          properties={db.properties}
          onUpdate={(properties) => updateDatabase({ properties })}
          onClose={() => setShowPropertyEditor(false)}
        />
      )}

      {activeView.type === 'table' ? (
        <TableView
          properties={db.properties}
          rows={displayedRows}
          onAddRow={() => addRow()}
          onUpdateRow={updateRow}
          onDeleteRow={deleteRow}
        />
      ) : (
        <KanbanView
          properties={db.properties}
          rows={displayedRows}
          groupByPropertyId={activeView.kanbanGroupByPropertyId}
          onAddRow={addRow}
          onUpdateRow={updateRow}
          onDeleteRow={deleteRow}
        />
      )}
    </div>
  )
}
