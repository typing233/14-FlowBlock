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
      case 'heading': {
        const prefix = '#'.repeat(block.level || 1)
        lines.push(`${prefix} ${block.content || ''}`)
        lines.push('')
        break
      }
      case 'todo': {
        const check = block.checked ? 'x' : ' '
        lines.push(`- [${check}] ${block.content || ''}`)
        break
      }
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pageToHtml(page: PageData): string {
  const bodyParts: string[] = []

  bodyParts.push(`<h1>${escapeHtml(page.meta.title)}</h1>`)

  for (const block of page.blocks) {
    switch (block.type) {
      case 'paragraph':
        bodyParts.push(`<p>${escapeHtml(block.content || '')}</p>`)
        break
      case 'heading': {
        const tag = `h${Math.min(block.level || 1, 3) + 1}`
        bodyParts.push(`<${tag}>${escapeHtml(block.content || '')}</${tag}>`)
        break
      }
      case 'todo': {
        const check = block.checked ? '☑' : '☐'
        const style = block.checked ? 'text-decoration: line-through; color: #888;' : ''
        bodyParts.push(`<p style="${style}">${check} ${escapeHtml(block.content || '')}</p>`)
        break
      }
      case 'bulletList':
        bodyParts.push(`<ul><li>${escapeHtml(block.content || '')}</li></ul>`)
        break
      case 'numberedList':
        bodyParts.push(`<ol><li>${escapeHtml(block.content || '')}</li></ol>`)
        break
      case 'quote':
        bodyParts.push(`<blockquote>${escapeHtml(block.content || '')}</blockquote>`)
        break
      case 'code':
        bodyParts.push(`<pre><code>${escapeHtml(block.content || '')}</code></pre>`)
        break
      case 'divider':
        bodyParts.push('<hr />')
        break
      case 'image':
        if (block.src) {
          bodyParts.push(`<figure><img src="${block.src}" style="max-width:100%;" />${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`)
        }
        break
      default:
        break
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 700px;
    margin: 40px auto;
    padding: 0 20px;
    color: #1a1a1a;
    line-height: 1.7;
    font-size: 14px;
  }
  h1 { font-size: 28px; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 12px; }
  h2 { font-size: 22px; margin-top: 28px; }
  h3 { font-size: 18px; margin-top: 24px; }
  h4 { font-size: 16px; margin-top: 20px; }
  p { margin: 8px 0; }
  blockquote {
    border-left: 4px solid #ddd;
    padding-left: 16px;
    margin: 12px 0;
    color: #555;
    font-style: italic;
  }
  pre {
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 12px 16px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
  }
  code { font-family: 'SF Mono', Menlo, Monaco, monospace; }
  hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
  ul, ol { padding-left: 24px; margin: 8px 0; }
  li { margin: 4px 0; }
  figure { margin: 16px 0; }
  figcaption { font-size: 12px; color: #666; margin-top: 4px; text-align: center; }
  img { border-radius: 4px; }
</style>
</head>
<body>
${bodyParts.join('\n')}
</body>
</html>`
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

export async function exportToPdf(page: PageData, win: BrowserWindow): Promise<boolean> {
  const result = await dialog.showSaveDialog(win, {
    title: '导出为 PDF',
    defaultPath: `${page.meta.title}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })

  if (result.canceled || !result.filePath) return false

  // Create a hidden window to render only the page content
  const pdfWin = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: { offscreen: true }
  })

  const html = pageToHtml(page)
  await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

  // Wait a moment for images to load
  await new Promise(resolve => setTimeout(resolve, 500))

  const pdfData = await pdfWin.webContents.printToPDF({
    printBackground: true,
    margins: { top: 0.6, bottom: 0.6, left: 0.6, right: 0.6 }
  })

  pdfWin.destroy()

  await writeFile(result.filePath, pdfData)
  return true
}
