import { Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useUiPrefs } from '@/app/ui-prefs-context'
import { Button, Kbd, PageHeader, Panel, PanelHeader } from '@/components/Primitives'
import { inputClass } from '@/features/task-prompt/FieldInput'
import { getProvider } from '@/lib/ai'
import { toAIError } from '@/lib/ai/errors'
import { CLAUDE_MODELS, pickGeminiModel } from '@/lib/ai/models'
import type { ProviderId } from '@/lib/ai/types'
import { useSettings } from '@/lib/db/hooks'
import { getSettings, updateSettings } from '@/lib/db/settings'
import { vi } from '@/lib/i18n/vi'
import { LANGUAGES, type LanguageCode } from '@/lib/prompts/prompt-types'
import { cn } from '@/lib/utils'
import type { Settings } from '@/types/models'

const t = vi.settings
const th =
  'whitespace-nowrap border-b border-border bg-soft px-3 py-2 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted'

/** M10 – Cài đặt: AI và API key, giao diện, phím tắt; sao lưu ở task 12 (`backupSlot`). */
export function SettingsPage({ backupSlot }: { backupSlot?: ReactNode }) {
  const settings = useSettings()
  if (settings.status !== 'ready') return <p className="text-muted">{vi.common.loading}</p>
  return <SettingsForm s={settings.data} backupSlot={backupSlot} />
}

function SettingsForm({ s, backupSlot }: { s: Settings; backupSlot?: ReactNode }) {
  const { theme, toggleTheme } = useUiPrefs()
  const [geminiNote, setGeminiNote] = useState<string | null>(null)

  return (
    <>
      <PageHeader title={vi.pages.settings.title} desc={vi.pages.settings.desc} />
      <div className="flex flex-wrap items-start gap-3.5">
        <Panel className="min-w-0 flex-[1_1_460px]">
          <PanelHeader>
            <h2 className="flex-1 text-sm font-semibold">{t.aiTitle}</h2>
            <span className="text-xs text-muted">{t.aiHint}</span>
          </PanelHeader>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5 p-3.5">
            <KeyField
              provider="claude"
              label={t.claudeKey}
              placeholder="sk-ant-..."
              help={t.getKeyClaude}
              value={s.claudeKey}
              onChange={(v) => void updateSettings({ claudeKey: v })}
            />
            <KeyField
              provider="gemini"
              label={t.geminiKey}
              placeholder="AIza..."
              help={t.getKeyGemini}
              value={s.geminiKey}
              onChange={(v) => void updateSettings({ geminiKey: v })}
              onModels={async (ids) => {
                const pick = pickGeminiModel(ids)
                const current = (await getSettings()).geminiModel
                const keep = current && ids.includes(current)
                await updateSettings({
                  geminiModels: ids,
                  geminiModel: keep ? current : (pick?.id ?? ''),
                })
                if (!keep && pick)
                  setGeminiNote(pick.exact ? t.geminiExact : t.geminiFallback(pick.id))
              }}
            />
            <SelectField
              id="s-provider"
              label={t.defaultProvider}
              value={s.defaultProvider}
              onChange={(v) => void updateSettings({ defaultProvider: v as ProviderId })}
              options={[
                ['claude', 'Claude'],
                ['gemini', 'Gemini'],
              ]}
            />
            <SelectField
              id="s-claude-model"
              label={t.claudeModel}
              value={s.claudeModel}
              onChange={(v) => void updateSettings({ claudeModel: v })}
              options={CLAUDE_MODELS.map((m) => [m.id, m.label])}
            />
            <div>
              {s.geminiModels.length > 0 ? (
                <SelectField
                  id="s-gemini-model"
                  label={t.geminiModel}
                  value={s.geminiModel}
                  onChange={(v) => void updateSettings({ geminiModel: v })}
                  options={s.geminiModels.map((m) => [m, m])}
                />
              ) : (
                <>
                  <span className="mb-1 block text-xs font-semibold">{t.geminiModel}</span>
                  <p className="text-xs text-muted">{t.geminiNeedCheck}</p>
                </>
              )}
              {geminiNote && <p className="mt-1 text-xs text-accent-ink">{geminiNote}</p>}
            </div>
            <SelectField
              id="s-lang"
              label={t.language}
              value={s.language}
              onChange={(v) => void updateSettings({ language: v as LanguageCode })}
              options={LANGUAGES.map((l) => [l.value, l.label])}
            />
          </div>
        </Panel>

        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5">
          <Panel>
            <PanelHeader>
              <h2 className="text-sm font-semibold">{t.uiTitle}</h2>
            </PanelHeader>
            <div className="flex flex-col gap-3 p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex-1">{t.themeLabel}</span>
                <div role="group" aria-label={t.themeLabel} className="flex">
                  {(['light', 'dark'] as const).map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={theme === m}
                      onClick={() => theme !== m && toggleTheme()}
                      className={cn(
                        'h-8 cursor-pointer border px-3 text-[12.5px]',
                        i === 0 ? 'rounded-l-md' : 'rounded-r-md border-l-0',
                        theme === m
                          ? 'border-accent bg-accent text-on-accent'
                          : 'border-border bg-surface',
                      )}
                    >
                      {m === 'light' ? t.light : t.dark}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted">{t.shortcutsNote}</p>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full border-collapse">
                  <caption className="sr-only">{t.shortcutsTitle}</caption>
                  <thead>
                    <tr>
                      {t.shortcutCols.map((c) => (
                        <th key={c} className={th}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.shortcuts.map(([k, d]) => (
                      <tr key={k} className="border-b border-border last:border-b-0">
                        <td className="px-3 py-1.5">
                          <Kbd>{k}</Kbd>
                        </td>
                        <td className="px-3 py-1.5">{d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>
          {backupSlot}
        </div>
      </div>
    </>
  )
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly (readonly [string, string])[]
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">
        {label}
      </label>
      <select
        id={id}
        className={`${inputClass} h-9`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  )
}

function KeyField({
  provider,
  label,
  placeholder,
  help,
  value,
  onChange,
  onModels,
}: {
  provider: ProviderId
  label: string
  placeholder: string
  help: string
  value: string
  onChange: (v: string) => void
  onModels?: (ids: string[]) => Promise<void>
}) {
  // Giữ chữ đang gõ ở đây để không mất ký tự khi việc lưu xuống IndexedDB chạy sau
  const [text, setText] = useState(value)
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [checking, setChecking] = useState(false)
  const id = `k-${provider}`

  const check = async () => {
    setChecking(true)
    setStatus(null)
    try {
      const ids = await getProvider(await getSettings(), provider).testKey()
      await onModels?.(ids)
      setStatus({ ok: true, text: t.keyOk(ids.length) })
    } catch (err) {
      setStatus({ ok: false, text: toAIError(err, provider).message })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">
        {label}
      </label>
      <div className="flex gap-1.5">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete="off"
          spellCheck={false}
          className={`${inputClass} h-9 font-mono`}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            onChange(e.target.value.trim())
            setStatus(null)
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t.hide : t.show}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </Button>
        <Button onClick={() => void check()} disabled={checking || !text.trim()}>
          {checking ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
          {checking ? t.checking : t.check}
        </Button>
      </div>
      <p
        role="status"
        className={cn(
          'mt-1 text-xs',
          status ? (status.ok ? 'text-green-ink' : 'text-red-ink') : 'text-muted',
        )}
      >
        {status ? (
          <>
            {status.ok && <Check className="mr-1 inline size-3" aria-hidden="true" />}
            {status.text}
          </>
        ) : text ? null : (
          help
        )}
      </p>
    </div>
  )
}
