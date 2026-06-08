import { Block } from './block'

export interface PageMeta {
  id: string
  title: string
  spaceId: string
  parentId: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface Page {
  meta: PageMeta
  blocks: Block[]
}
