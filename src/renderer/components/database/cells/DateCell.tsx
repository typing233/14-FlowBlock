import { CellValue } from '../../../types'

interface Props {
  value: string | null
  onChange: (value: CellValue) => void
}

export function DateCell({ value, onChange }: Props) {
  return (
    <input
      type="date"
      className="w-full bg-transparent text-sm px-1 py-0.5 rounded border border-transparent hover:border-gray-200 focus:border-blue-300 outline-none"
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
    />
  )
}
