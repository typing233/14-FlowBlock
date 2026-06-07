import { Block } from '../../types'
import { ParagraphBlock } from './ParagraphBlock'
import { HeadingBlock } from './HeadingBlock'
import { TodoBlock } from './TodoBlock'
import { DatabaseBlockComponent } from '../database/DatabaseBlock'

interface Props {
  block: Block
  onSlashCommand: (blockId: string, position: { top: number; left: number }) => void
}

export function BlockRenderer({ block, onSlashCommand }: Props) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock block={block} onSlashCommand={onSlashCommand} />
    case 'heading':
      return <HeadingBlock block={block} onSlashCommand={onSlashCommand} />
    case 'todo':
      return <TodoBlock block={block} onSlashCommand={onSlashCommand} />
    case 'database':
      return <DatabaseBlockComponent block={block} />
    default:
      return null
  }
}
