import { dialog, BrowserWindow } from 'electron'
import { readFile } from 'fs/promises'
import { basename } from 'path'

interface Block {
  id: string
  type: string
  content?: string
  level?: number
  checked?: boolean
  language?: string
  createdAt: string
  updatedAt: string
}

function createId(): string {
  return Math.random().toString(36).slice(2, 12)
}

function makeBlock(type: string, props: Record<string, any> = {}): Block {
  const now = new Date().toISOString()
  return { id: createId(), type, createdAt: now, updatedAt: now, ...props }
}

export function markdownToBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || 'plaintext'
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push(makeBlock('code', { content: codeLines.join('\n'), language }))
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/)
    if (headingMatch) {
      blocks.push(makeBlock('heading', { content: headingMatch[2], level: headingMatch[1].length }))
      i++
      continue
    }

    // Divider
    if (line.match(/^---+$/)) {
      blocks.push(makeBlock('divider'))
      i++
      continue
    }

    // Todo
    const todoMatch = line.match(/^-\s*\[([ x])\]\s*(.*)/)
    if (todoMatch) {
      blocks.push(makeBlock('todo', { content: todoMatch[2], checked: todoMatch[1] === 'x' }))
      i++
      continue
    }

    // Bullet list
    const bulletMatch = line.match(/^[-*]\s+(.*)/)
    if (bulletMatch) {
      blocks.push(makeBlock('bulletList', { content: bulletMatch[1] }))
      i++
      continue
    }

    // Numbered list
    const numMatch = line.match(/^\d+\.\s+(.*)/)
    if (numMatch) {
      blocks.push(makeBlock('numberedList', { content: numMatch[1] }))
      i++
      continue
    }

    // Quote
    const quoteMatch = line.match(/^>\s*(.*)/)
    if (quoteMatch) {
      blocks.push(makeBlock('quote', { content: quoteMatch[1] }))
      i++
      continue
    }

    // Image
    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)/)
    if (imageMatch) {
      blocks.push(makeBlock('image', { caption: imageMatch[1], src: imageMatch[2] }))
      i++
      continue
    }

    // Empty line - skip
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph
    blocks.push(makeBlock('paragraph', { content: line }))
    i++
  }

  if (blocks.length === 0) {
    blocks.push(makeBlock('paragraph', { content: '' }))
  }

  return blocks
}

export async function importMarkdown(win: BrowserWindow): Promise<{ title: string; blocks: Block[] } | null> {
  const result = await dialog.showOpenDialog(win, {
    title: '导入 Markdown',
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  const content = await readFile(filePath, 'utf-8')
  const title = basename(filePath, '.md').replace(/\.markdown$/, '').replace(/\.txt$/, '')
  const blocks = markdownToBlocks(content)

  return { title, blocks }
}
