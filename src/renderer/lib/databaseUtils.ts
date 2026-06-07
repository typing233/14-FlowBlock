import { Row, Property, SortRule, FilterRule, CellValue } from '../types'

export function sortRows(rows: Row[], properties: Property[], sorts: SortRule[]): Row[] {
  if (sorts.length === 0) return rows

  return [...rows].sort((a, b) => {
    for (const sort of sorts) {
      const prop = properties.find(p => p.id === sort.propertyId)
      if (!prop) continue

      const av = a.cells[sort.propertyId]
      const bv = b.cells[sort.propertyId]
      const cmp = compareCellValues(av, bv, prop.type)
      if (cmp !== 0) return sort.direction === 'asc' ? cmp : -cmp
    }
    return 0
  })
}

export function filterRows(rows: Row[], properties: Property[], filters: FilterRule[]): Row[] {
  if (filters.length === 0) return rows

  return rows.filter(row => {
    return filters.every(filter => {
      const value = row.cells[filter.propertyId]
      return matchesFilter(value, filter)
    })
  })
}

function compareCellValues(a: CellValue, b: CellValue, type: string): number {
  if (a === null && b === null) return 0
  if (a === null) return -1
  if (b === null) return 1

  if (type === 'number') return (a as number) - (b as number)
  return String(a).localeCompare(String(b))
}

function matchesFilter(value: CellValue, filter: FilterRule): boolean {
  switch (filter.operator) {
    case 'is_empty':
      return value === null || value === ''
    case 'is_not_empty':
      return value !== null && value !== ''
    case 'equals':
      return value === filter.value
    case 'not_equals':
      return value !== filter.value
    case 'contains':
      return typeof value === 'string' && value.includes(String(filter.value ?? ''))
    case 'greater_than':
      return typeof value === 'number' && typeof filter.value === 'number' && value > filter.value
    case 'less_than':
      return typeof value === 'number' && typeof filter.value === 'number' && value < filter.value
    default:
      return true
  }
}
