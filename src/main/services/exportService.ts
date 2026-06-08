import { dialog, BrowserWindow } from 'electron'
import { writeFile } from 'fs/promises'

interface DatabaseProperty {
  id: string
  name: string
  type: string
}

interface DatabaseRow {
  id: string
  cells: Record<string, string | number | null>
}

interface DatabaseData {
  id: string
  title: string
  properties: DatabaseProperty[]
  rows: DatabaseRow[]
}

interface Block {
  type: string
  content?: string
  level?: number
  checked?: boolean
  language?: string
  src?: string
  caption?: string
  indent?: number
  database?: DatabaseData
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
    const indentPrefix = '  '.repeat(block.indent || 0)

    switch (block.type) {
      case 'paragraph':
        lines.push(`${indentPrefix}${block.content || ''}`)
        lines.push('')
        break
      case 'heading': {
        const prefix = '#'.repeat(block.level || 1)
        lines.push(`${indentPrefix}${prefix} ${block.content || ''}`)
        lines.push('')
        break
      }
      case 'todo': {
        const check = block.checked ? 'x' : ' '
        lines.push(`${indentPrefix}- [${check}] ${block.content || ''}`)
        break
      }
      case 'bulletList':
        lines.push(`${indentPrefix}- ${block.content || ''}`)
        break
      case 'numberedList':
        lines.push(`${indentPrefix}1. ${block.content || ''}`)
        break
      case 'quote':
        lines.push(`${indentPrefix}> ${block.content || ''}`)
        lines.push('')
        break
      case 'code':
        lines.push(`${indentPrefix}\`\`\`` + (block.language || ''))
        lines.push(`${indentPrefix}${block.content || ''}`)
        lines.push(`${indentPrefix}\`\`\``)
        lines.push('')
        break
      case 'divider':
        lines.push(`${indentPrefix}---`)
        lines.push('')
        break
      case 'image':
        lines.push(`${indentPrefix}![${block.caption || ''}](${block.src || ''})`)
        lines.push('')
        break
      case 'database': {
        const db = block.database
        if (db) {
          lines.push(`${indentPrefix}**${db.title}**`)
          lines.push('')
          if (db.properties.length > 0) {
            const header = db.properties.map(p => p.name)
            lines.push(`${indentPrefix}| ${header.join(' | ')} |`)
            lines.push(`${indentPrefix}| ${header.map(() => '---').join(' | ')} |`)
            for (const row of db.rows) {
              const cells = db.properties.map(p => String(row.cells[p.id] ?? ''))
              lines.push(`${indentPrefix}| ${cells.join(' | ')} |`)
            }
            lines.push('')
          }
        }
        break
      }
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
    const indent = block.indent || 0
    const pad = indent > 0 ? ` style="padding-left: ${indent * 24}px;"` : ''

    switch (block.type) {
      case 'paragraph':
        bodyParts.push(`<p${pad}>${escapeHtml(block.content || '')}</p>`)
        break
      case 'heading': {
        const tag = `h${Math.min(block.level || 1, 3) + 1}`
        bodyParts.push(`<${tag}${pad}>${escapeHtml(block.content || '')}</${tag}>`)
        break
      }
      case 'todo': {
        const check = block.checked ? '☑' : '☐'
        const style = block.checked
          ? `text-decoration: line-through; color: #888;${indent > 0 ? ` padding-left: ${indent * 24}px;` : ''}`
          : (indent > 0 ? `padding-left: ${indent * 24}px;` : '')
        bodyParts.push(`<p${style ? ` style="${style}"` : ''}>${check} ${escapeHtml(block.content || '')}</p>`)
        break
      }
      case 'bulletList':
        bodyParts.push(`<ul${pad}><li>${escapeHtml(block.content || '')}</li></ul>`)
        break
      case 'numberedList':
        bodyParts.push(`<ol${pad}><li>${escapeHtml(block.content || '')}</li></ol>`)
        break
      case 'quote':
        bodyParts.push(`<blockquote${pad}>${escapeHtml(block.content || '')}</blockquote>`)
        break
      case 'code':
        bodyParts.push(`<pre${pad}><code>${escapeHtml(block.content || '')}</code></pre>`)
        break
      case 'divider':
        bodyParts.push('<hr />')
        break
      case 'image':
        if (block.src) {
          bodyParts.push(`<figure${pad}><img src="${block.src}" style="max-width:100%;" />${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`)
        }
        break
      case 'database': {
        const db = block.database
        if (db) {
          bodyParts.push(`<div${pad} class="database-block">`)
          bodyParts.push(`<h4>${escapeHtml(db.title)}</h4>`)
          bodyParts.push('<table>')
          bodyParts.push('<thead><tr>')
          for (const prop of db.properties) {
            bodyParts.push(`<th>${escapeHtml(prop.name)}</th>`)
          }
          bodyParts.push('</tr></thead>')
          bodyParts.push('<tbody>')
          for (const row of db.rows) {
            bodyParts.push('<tr>')
            for (const prop of db.properties) {
              const val = row.cells[prop.id]
              bodyParts.push(`<td>${escapeHtml(String(val ?? ''))}</td>`)
            }
            bodyParts.push('</tr>')
          }
          bodyParts.push('</tbody>')
          bodyParts.push('</table>')
          bodyParts.push('</div>')
        }
        break
      }
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
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
  th, td { border: 1px solid #e0e0e0; padding: 8px 12px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  .database-block { margin: 16px 0; }
  .database-block h4 { margin: 0 0 8px 0; font-size: 15px; }
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
