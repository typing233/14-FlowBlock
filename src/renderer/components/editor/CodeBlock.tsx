import { useRef, useEffect, useState } from 'react'
import hljs from 'highlight.js'
import { usePageStore } from '../../stores/pageStore'
import { createParagraphBlock } from '../../lib/blockUtils'
import { CodeBlock as CodeBlockType } from '../../types'

interface Props {
  block: CodeBlockType
}

const languages = [
  'plaintext', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp',
  'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html',
  'css', 'sql', 'bash', 'json', 'yaml', 'markdown', 'xml'
]

export function CodeBlock({ block }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const { updateBlock, addBlockAfter, deleteBlock } = usePageStore()
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (preRef.current && block.content) {
      const lang = block.language || 'plaintext'
      try {
        const result = hljs.highlight(block.content, { language: lang })
        preRef.current.innerHTML = result.value
      } catch {
        preRef.current.textContent = block.content
      }
    }
  }, [block.content, block.language])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, { content: e.target.value })
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      updateBlock(block.id, { content: newValue })
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault()
      const focusId = deleteBlock(block.id)
      if (focusId) {
        setTimeout(() => {
          const el = document.querySelector(`[data-block-id="${focusId}"] [contenteditable], [data-block-id="${focusId}"] textarea`) as HTMLElement
          el?.focus()
        }, 0)
      }
    }
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      const newBlock = createParagraphBlock()
      addBlockAfter(block.id, newBlock)
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable]`) as HTMLElement
        el?.focus()
      }, 0)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [block.content])

  return (
    <div data-block-id={block.id} className="my-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between px-3 py-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <select
          className="text-xs bg-transparent outline-none text-gray-600 dark:text-gray-300 cursor-pointer"
          value={block.language}
          onChange={(e) => updateBlock(block.id, { language: e.target.value })}
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <div className="relative font-mono text-sm p-3">
        {focused ? (
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent outline-none resize-none text-gray-800 dark:text-gray-200 leading-relaxed"
            value={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setFocused(false)}
            autoFocus
            placeholder="输入代码..."
            spellCheck={false}
          />
        ) : (
          <pre
            ref={preRef}
            className="whitespace-pre-wrap cursor-text text-gray-800 dark:text-gray-200 leading-relaxed min-h-[1.5em]"
            onClick={() => setFocused(true)}
          >
            {block.content || <span className="text-gray-400">输入代码...</span>}
          </pre>
        )}
      </div>
    </div>
  )
}
