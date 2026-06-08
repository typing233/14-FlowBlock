import { nanoid } from 'nanoid'
import { Block, ParagraphBlock, HeadingBlock, TodoBlock, HeadingLevel, DatabaseBlock, Database, Property, ViewConfig, ImageBlock, CodeBlock, QuoteBlock, DividerBlock, BulletListBlock, NumberedListBlock } from '../types'

export function createId(): string {
  return nanoid(10)
}

function now(): string {
  return new Date().toISOString()
}

export function createParagraphBlock(content = ''): ParagraphBlock {
  return { id: createId(), type: 'paragraph', content, createdAt: now(), updatedAt: now() }
}

export function createHeadingBlock(level: HeadingLevel = 1, content = ''): HeadingBlock {
  return { id: createId(), type: 'heading', level, content, createdAt: now(), updatedAt: now() }
}

export function createTodoBlock(content = '', checked = false): TodoBlock {
  return { id: createId(), type: 'todo', content, checked, createdAt: now(), updatedAt: now() }
}

export function createImageBlock(src = '', caption = ''): ImageBlock {
  return { id: createId(), type: 'image', src, caption, createdAt: now(), updatedAt: now() }
}

export function createCodeBlock(content = '', language = 'plaintext'): CodeBlock {
  return { id: createId(), type: 'code', content, language, createdAt: now(), updatedAt: now() }
}

export function createQuoteBlock(content = ''): QuoteBlock {
  return { id: createId(), type: 'quote', content, createdAt: now(), updatedAt: now() }
}

export function createDividerBlock(): DividerBlock {
  return { id: createId(), type: 'divider', createdAt: now(), updatedAt: now() }
}

export function createBulletListBlock(content = ''): BulletListBlock {
  return { id: createId(), type: 'bulletList', content, createdAt: now(), updatedAt: now() }
}

export function createNumberedListBlock(content = ''): NumberedListBlock {
  return { id: createId(), type: 'numberedList', content, createdAt: now(), updatedAt: now() }
}

export function createDatabaseBlock(): DatabaseBlock {
  const titleProp: Property = { id: createId(), name: '名称', type: 'text' }
  const statusProp: Property = {
    id: createId(),
    name: '状态',
    type: 'select',
    options: [
      { id: createId(), label: '未开始', color: 'bg-gray-200 text-gray-700' },
      { id: createId(), label: '进行中', color: 'bg-blue-100 text-blue-700' },
      { id: createId(), label: '已完成', color: 'bg-green-100 text-green-700' }
    ]
  }

  const tableView: ViewConfig = { id: createId(), type: 'table', name: '表格视图', sorts: [], filters: [] }
  const kanbanView: ViewConfig = { id: createId(), type: 'kanban', name: '看板视图', sorts: [], filters: [], kanbanGroupByPropertyId: statusProp.id }

  const database: Database = {
    id: createId(),
    title: '数据库',
    properties: [titleProp, statusProp],
    rows: [],
    views: [tableView, kanbanView],
    activeViewId: tableView.id
  }

  return { id: createId(), type: 'database', database, createdAt: now(), updatedAt: now() }
}

export function getBlockContent(block: Block): string {
  if (block.type === 'database' || block.type === 'divider' || block.type === 'image') return ''
  return block.content
}
