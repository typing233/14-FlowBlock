export type PropertyType = 'text' | 'number' | 'date' | 'select'
export type ViewType = 'table' | 'kanban'

export interface SelectOption {
  id: string
  label: string
  color: string
}

export interface PropertyBase {
  id: string
  name: string
  type: PropertyType
}

export interface TextProperty extends PropertyBase {
  type: 'text'
}

export interface NumberProperty extends PropertyBase {
  type: 'number'
}

export interface DateProperty extends PropertyBase {
  type: 'date'
}

export interface SelectProperty extends PropertyBase {
  type: 'select'
  options: SelectOption[]
}

export type Property = TextProperty | NumberProperty | DateProperty | SelectProperty

export interface Row {
  id: string
  cells: Record<string, CellValue>
  createdAt: string
  updatedAt: string
}

export type CellValue = string | number | null

export interface SortRule {
  propertyId: string
  direction: 'asc' | 'desc'
}

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'

export interface FilterRule {
  propertyId: string
  operator: FilterOperator
  value: string | number | null
}

export interface ViewConfig {
  id: string
  type: ViewType
  name: string
  sorts: SortRule[]
  filters: FilterRule[]
  kanbanGroupByPropertyId?: string
}

export interface Database {
  id: string
  title: string
  properties: Property[]
  rows: Row[]
  views: ViewConfig[]
  activeViewId: string
}
