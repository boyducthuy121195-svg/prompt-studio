import { Copy } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'
import { useHotkey } from '@/app/use-hotkey'
import { Dialog } from '@/components/Dialog'
import { TextField } from '@/components/Field'
import { Button, Kbd } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { copyText } from '@/lib/clipboard'
import { vi } from '@/lib/i18n/vi'
import type { LibraryItem } from '@/lib/library'
import { fillVariables, parseVariables, variableLabel } from '@/lib/prompts/variables'
import { UsePromptContext, type UsePrompt } from './use-prompt-context'

const t = vi.fill

/** M9 – hộp "Điền nhanh" dùng chung cho Thư viện và mục "Đã ghim" trên thanh bên. */
export function UsePromptProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<LibraryItem | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const toast = useToast()

  const use = useCallback<UsePrompt>(
    (it) => {
      if (parseVariables(it.body).length === 0) {
        void copyText(it.body).then((ok) =>
          toast(ok ? t.copiedNamed(it.title) : vi.builder.copyFailed),
        )
        return
      }
      setValues({})
      setItem(it)
    },
    [toast],
  )

  const vars = item ? parseVariables(item.body) : []
  const result = item ? fillVariables(item.body, values) : ''

  const copy = async () => {
    if (!item) return
    const ok = await copyText(result)
    toast(ok ? t.copiedNamed(item.title) : vi.builder.copyFailed)
    if (ok) setItem(null)
  }
  useHotkey(
    'mod+enter',
    () => {
      if (item) void copy()
    },
    { inDialog: true },
  )

  return (
    <UsePromptContext value={use}>
      {children}
      <Dialog
        open={item !== null}
        onOpenChange={(o) => !o && setItem(null)}
        title={item ? t.title(item.title) : ''}
        description={t.desc}
        wide
        footer={
          <>
            <Button onClick={() => setItem(null)}>{vi.common.close}</Button>
            <Button variant="primary" onClick={() => void copy()}>
              <Copy className="size-3.5" aria-hidden="true" />
              {t.copy}
              <Kbd className="border-current bg-transparent text-current">Ctrl+Enter</Kbd>
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-3.5">
          <div className="flex flex-[1_1_260px] flex-col gap-2.5">
            {vars.map((v, i) => (
              <TextField
                key={v.name}
                id={`fill-${v.name}`}
                label={variableLabel(v.name)}
                placeholder={v.defaultValue || v.name}
                value={values[v.name] ?? ''}
                autoFocus={i === 0}
                onChange={(e) => setValues((s) => ({ ...s, [v.name]: e.target.value }))}
              />
            ))}
          </div>
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1.5">
            <span className="text-xs font-semibold">{t.preview}</span>
            <pre
              aria-label={t.preview}
              className="m-0 max-h-[50vh] overflow-auto whitespace-pre-wrap break-words rounded-md bg-code-bg p-3 font-mono text-xs leading-relaxed text-code-ink"
            >
              {result}
            </pre>
          </div>
        </div>
      </Dialog>
    </UsePromptContext>
  )
}
