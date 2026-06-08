import { Block } from '../../types'
import { ParagraphBlock } from './ParagraphBlock'
import { HeadingBlock } from './HeadingBlock'
import { TodoBlock } from './TodoBlock'
import { ImageBlock } from './ImageBlock'
import { CodeBlock } from './CodeBlock'
import { QuoteBlock } from './QuoteBlock'
import { DividerBlock } from './DividerBlock'
import { BulletListBlock } from './BulletListBlock'
import { NumberedListBlock } from './NumberedListBlock'
import { DatabaseBlockComponent } from '../database/DatabaseBlock'

interface Props {
  block: Block
  blockIndex?: number
  onSlashCommand: (blockId: string, position: { top: number; left: number }) => void
}

export function BlockRenderer({ block, blockIndex, onSlashCommand }: Props) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock block={block} onSlashCommand={onSlashCommand} />
    case 'heading':
      return <HeadingBlock block={block} onSlashCommand={onSlashCommand} />
    case 'todo':
      return <TodoBlock block={block} onSlashCommand={onSlashCommand} />
    case 'image':
      return <ImageBlock block={block} />
    case 'code':
      return <CodeBlock block={block} />
    case 'quote':
      return <QuoteBlock block={block} onSlashCommand={onSlashCommand} />
    case 'divider':
      return <DividerBlock block={block} />
    case 'bulletList':
      return <BulletListBlock block={block} onSlashCommand={onSlashCommand} />
    case 'numberedList':
      return <NumberedListBlock block={block} index={blockIndex ?? 1} onSlashCommand={onSlashCommand} />
    case 'database':
      return <DatabaseBlockComponent block={block} />
    default:
      return null
  }
}
