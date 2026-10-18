import { useState, type ReactNode } from 'react'
import { CheckOption } from '@/components/CheckOption'
import { vi } from '@/lib/i18n/vi'
import type { FieldDef } from '@/lib/prompts/types'

const t = vi.builder
const OTHER = '__other__'
export const inputClass =
  'w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-ink placeholder:text-muted focus:outline-2 focus:outline-accent focus:-outline-offset-1'

/** Một trường riêng của loại prompt: text, textarea, select (có "Khác…") hoặc multiselect (ô tích + "Khác…"). */
export function FieldInput({
  field,
  value,
  onChange,
  action,
}: {
  field: FieldDef
  value: string | string[] | undefined
  onChange: (v: string | string[]) => void
  action?: ReactNode
}) {
  const id = `fld-${field.key}`
  const label = (
    <div className="mb-1 flex items-center gap-2">
      {field.kind === 'multiselect' ? (
        <span className="flex-1 text-xs font-semibold">{field.label}</span>
      ) : (
        <label htmlFor={id} className="flex-1 text-xs font-semibold">
          {field.label}
        </label>
      )}
      {action}
    </div>
  )

  if (field.kind === 'multiselect') {
    const list = Array.isArray(value) ? value : []
    const options = field.options ?? []
    const custom = list.filter((v) => !options.includes(v))
    const toggle = (o: string) =>
      onChange(list.includes(o) ? list.filter((x) => x !== o) : [...list, o])
    return (
      <fieldset className="m-0 border-0 p-0">
        <legend className="sr-only">{field.label}</legend>
        {label}
        <div className="flex flex-wrap gap-1.5">
          {options.map((o) => (
            <CheckOption
              key={o}
              checked={list.includes(o)}
              onChange={() => toggle(o)}
              label={o}
              className="font-normal"
            />
          ))}
          <input
            aria-label={`${field.label} – ${t.other}`}
            className={`${inputClass} h-8 w-auto min-w-[160px] flex-1`}
            placeholder={t.other}
            value={custom.join(', ')}
            onChange={(e) => {
              const extra = e.target.value.split(',').map((x) => x.trimStart())
              onChange([
                ...list.filter((v) => options.includes(v)),
                ...extra.filter((x, i) => x || i === extra.length - 1),
              ])
            }}
          />
        </div>
      </fieldset>
    )
  }

  if (field.kind === 'select')
    return <SelectWithOther id={id} field={field} value={value} onChange={onChange} label={label} />

  const str = typeof value === 'string' ? value : ''
  return (
    <div>
      {label}
      {field.kind === 'textarea' ? (
        <textarea
          id={id}
          className={`${inputClass} min-h-16 resize-y leading-normal`}
          placeholder={field.placeholder}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type={field.kind === 'number' ? 'number' : 'text'}
          className={`${inputClass} h-9`}
          placeholder={field.placeholder}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

function SelectWithOther({
  id,
  field,
  value,
  onChange,
  label,
}: {
  id: string
  field: FieldDef
  value: string | string[] | undefined
  onChange: (v: string) => void
  label: ReactNode
}) {
  const str = typeof value === 'string' ? value : ''
  const options = field.options ?? []
  const [otherMode, setOtherMode] = useState(str !== '' && !options.includes(str))
  return (
    <div>
      {label}
      <select
        id={id}
        className={`${inputClass} h-9`}
        value={otherMode ? OTHER : str}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setOtherMode(true)
            onChange('')
          } else {
            setOtherMode(false)
            onChange(e.target.value)
          }
        }}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={OTHER}>{t.other}</option>
      </select>
      {otherMode && (
        <input
          aria-label={`${field.label} – ${t.other}`}
          className={`${inputClass} mt-1.5 h-9`}
          placeholder={t.otherPlaceholder}
          value={str}
          autoFocus
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}
