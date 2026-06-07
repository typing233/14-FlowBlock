export type BlockType = 'paragraph' | 'heading' | 'todo' | 'database'
export type HeadingLevel = 1 | 2 | 3

export interface BlockBase {
  id: string
  type: BlockType
  createdAt: string
  updatedAt: string
}

export interface ParagraphBlock extends BlockBase {
  type: 'paragraph'
  content: string
}

export interface HeadingBlock extends BlockBase {
  type: 'heading'
  content: string
  level: HeadingLevel
}

export interface TodoBlock extends BlockBase {
  type: 'todo'
  content: string
  checked: boolean
}

export interface DatabaseBlock extends BlockBase {
  type: 'database'
  database: import('./database').Database
}

export type Block = ParagraphBlock | HeadingBlock | TodoBlock | DatabaseBlock
