export type BlockType = 'paragraph' | 'heading' | 'todo' | 'database' | 'image' | 'code' | 'quote' | 'divider' | 'bulletList' | 'numberedList'
export type HeadingLevel = 1 | 2 | 3

export interface BlockBase {
  id: string
  type: BlockType
  indent?: number
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

export interface ImageBlock extends BlockBase {
  type: 'image'
  src: string
  caption: string
  width?: number
}

export interface CodeBlock extends BlockBase {
  type: 'code'
  content: string
  language: string
}

export interface QuoteBlock extends BlockBase {
  type: 'quote'
  content: string
}

export interface DividerBlock extends BlockBase {
  type: 'divider'
}

export interface BulletListBlock extends BlockBase {
  type: 'bulletList'
  content: string
}

export interface NumberedListBlock extends BlockBase {
  type: 'numberedList'
  content: string
}

export type Block = ParagraphBlock | HeadingBlock | TodoBlock | DatabaseBlock | ImageBlock | CodeBlock | QuoteBlock | DividerBlock | BulletListBlock | NumberedListBlock
