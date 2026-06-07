import { Block } from './block'

export interface PageMeta {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Page {
  meta: PageMeta
  blocks: Block[]
}
