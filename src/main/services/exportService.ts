import { dialog, BrowserWindow } from 'electron'
import { writeFile } from 'fs/promises'

interface Block {
  type: string
  content?: string
  level?: number
  checked?: boolean
  language?: string
  src?: string
  caption?: string
}

interface PageData {
  meta: { title: string }
  blocks: Block[]
}

export function pageToMarkdown(page: PageData): string {
  const lines: string[] = []
  lines.push(`# ${page.meta.title}`)
  lines.push('')

  for (const block of page.blocks) {
    switch (block.type) {
      case 'paragraph':
        lines.push(block.content || '')
        lines.push('')
        break
      case 'heading':
        const prefix = '#'.repeat(block.level || 1)
        lines.push(`${prefix} ${block.content || ''}`)
        lines.push('')
        break
      case 'todo':
        const check = block.checked ? 'x' : ' '
        lines.push(`- [${check}] ${block.content || ''}`)
        break
      case 'bulletList':
        lines.push(`- ${block.content || ''}`)
        break
      case 'numberedList':
        lines.push(`1. ${block.content || ''}`)
        break
      case 'quote':
        lines.push(`> ${block.content || ''}`)
        lines.push('')
        break
      case 'code':
        lines.push('```' + (block.language || ''))
        lines.push(block.content || '')
        lines.push('```')
        lines.push('')
        break
      case 'divider':
        lines.push('---')
        lines.push('')
        break
      case 'image':
        lines.push(`![${block.caption || ''}](${block.src || ''})`)
        lines.push('')
        break
      default:
        break
    }
  }

  return lines.join('\n')
}

export async function exportToMarkdown(page: PageData, win: BrowserWindow): Promise<boolean> {
  const result = await dialog.showSaveDialog(win, {
    title: '导出为 Markdown',
    defaultPath: `${page.meta.title}.md`,
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  })

  if (result.canceled || !result.filePath) return false

  const content = pageToMarkdown(page)
  await writeFile(result.filePath, content, 'utf-8')
  return true
}

export async function exportToPdf(win: BrowserWindow, title: string): Promise<boolean> {
  const result = await dialog.showSaveDialog(win, {
    title: '导出为 PDF',
    defaultPath: `${title}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })

  if (result.canceled || !result.filePath) return false

  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
  })
  await writeFile(result.filePath, pdfData)
  return true
}
