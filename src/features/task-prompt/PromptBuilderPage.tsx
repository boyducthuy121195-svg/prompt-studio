import { Copy, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { useHotkey } from '@/app/use-hotkey'
import { CheckOption } from '@/components/CheckOption'
import { Button, Kbd, PageHeader, Panel, PanelHeader, Tag } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { copyText } from '@/lib/clipboard'
import { useCurrentProject } from '@/lib/db/hooks'
import { vi } from '@/lib/i18n/vi'
import {
  buildPrompt,
  emptyForm,
  estimateTokens,
  type PastedKind,
  type PromptForm,
} from '@/lib/prompts/build-prompt'
import {
  ATTACHMENT_OPTIONS,
  DEFAULT_LANGUAGE,
  getPromptType,
  LANGUAGES,
  LENGTH_OPTIONS,
  PROMPT_GROUPS,
  ROLES,
  type LanguageCode,
} from '@/lib/prompts/prompt-types'
import { SUGGESTION_GROUPS, SUGGESTIONS, toggleSuggestion } from '@/lib/prompts/suggestions'
import { PROMPT_TYPE_CODES, type PromptTypeCode } from '@/lib/prompts/types'
import { FieldInput, inputClass } from './FieldInput'

const t = vi.builder

export interface BuilderLocationState {
  form?: PromptForm
}

const isTypeCode = (c: string | undefined): c is PromptTypeCode =>
  (PROMPT_TYPE_CODES as readonly string[]).includes(c ?? '')

/** M4 – bảng nhập (trái) + xem trước prompt (phải). */
export function PromptBuilderPage() {
  const { typeCode } = useParams()
  const location = useLocation()
  if (!isTypeCode(typeCode)) {
    return (
      <>
        <PageHeader title={vi.pages.notFound.title} desc={t.unknownType} />
        <Link to="/prompt" className="text-accent hover:underline">
          {t.breadcrumb}
        </Link>
      </>
    )
  }
  const state = location.state as BuilderLocationState | null
  const initial = state?.form?.typeCode === typeCode ? state.form : undefined
  return <PromptBuilder key={`${typeCode}-${location.key}`} typeCode={typeCode} initial={initial} />
}

export function PromptBuilder({
  typeCode,
  initial,
  language = DEFAULT_LANGUAGE,
}: {
  typeCode: PromptTypeCode
  initial?: PromptForm
  language?: LanguageCode
}) {
  const type = getPromptType(typeCode)
  const [form, setForm] = useState<PromptForm>(() => initial ?? emptyForm(typeCode, language))
  const current = useCurrentProject()
  const project = current.status === 'ready' ? current.data : null
  const toast = useToast()

  const preview = useMemo(() => buildPrompt(form, project), [form, project])
  const selected = new Set(form.selected)
  const set = <K extends keyof PromptForm>(key: K, value: PromptForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const copy = async () => toast((await copyText(preview)) ? t.copied : t.copyFailed)
  useHotkey('mod+enter', () => void copy())

  const aiSoon = () => toast(t.aiNotReady)
  const polishButton = (label: string) => (
    <Button variant="ai" size="sm" onClick={aiSoon} aria-label={t.polishLabel(label)}>
      {t.polish}
    </Button>
  )

  return (
    <>
      <div>
        <div className="text-xs text-muted">
          <Link to="/prompt" className="hover:underline">
            {t.breadcrumb}
          </Link>{' '}
          / {PROMPT_GROUPS.find((g) => g.key === type.group)?.name}
        </div>
        <PageHeader
          title={type.name}
          desc={type.desc}
          aside={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setForm(emptyForm(typeCode, form.language))
                toast(t.resetDone)
              }}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              {t.reset}
            </Button>
          }
        />
      </div>

      <div className="flex flex-wrap items-start gap-3.5">
        <Panel className="min-w-0 flex-[1_1_480px]">
          <PanelHeader>
            <h2 className="flex-1 text-sm font-semibold">{t.formTitle}</h2>
            <span className="text-xs text-muted">{t.formHint}</span>
          </PanelHeader>
          <div className="flex flex-col gap-3.5 p-3.5">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              <div>
                <label htmlFor="f-role" className="mb-1 block text-xs font-semibold">
                  {t.role}
                </label>
                <input
                  id="f-role"
                  list="role-options"
                  className={`${inputClass} h-9`}
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                />
                <datalist id="role-options">
                  {ROLES.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="f-lang" className="mb-1 block text-xs font-semibold">
                  {t.language}
                </label>
                <select
                  id="f-lang"
                  className={`${inputClass} h-9`}
                  value={form.language}
                  onChange={(e) => set('language', e.target.value as LanguageCode)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <label htmlFor="f-task" className="flex-1 text-xs font-semibold">
                  {t.task} <span className="font-normal text-muted">{t.required}</span>
                </label>
                {polishButton(t.task)}
              </div>
              <textarea
                id="f-task"
                className={`${inputClass} min-h-20 resize-y leading-normal`}
                placeholder={type.taskPlaceholder}
                value={form.task}
                onChange={(e) => set('task', e.target.value)}
              />
            </div>

            {type.fields.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
                {type.fields.map((f) => (
                  <div
                    key={f.key}
                    className={
                      f.kind === 'multiselect' || f.kind === 'textarea'
                        ? 'col-span-full'
                        : undefined
                    }
                  >
                    <FieldInput
                      field={f}
                      value={form.fields[f.key]}
                      onChange={(v) => set('fields', { ...form.fields, [f.key]: v })}
                      action={f.polish ? polishButton(f.label) : undefined}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="mb-1 flex items-center gap-2">
                <label htmlFor="f-why" className="flex-1 text-xs font-semibold">
                  {t.purpose}
                </label>
                {polishButton(t.purpose)}
              </div>
              <input
                id="f-why"
                className={`${inputClass} h-9`}
                placeholder={t.purposePlaceholder}
                value={form.purpose}
                onChange={(e) => set('purpose', e.target.value)}
              />
            </div>

            <FieldInput
              field={{
                key: 'attachments',
                label: t.attachments,
                kind: 'multiselect',
                options: ATTACHMENT_OPTIONS,
              }}
              value={form.attachments}
              onChange={(v) => set('attachments', v as string[])}
            />

            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
              <legend className="mb-1 text-xs font-semibold">{t.pasted}</legend>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
                <select
                  aria-label={t.pastedKind}
                  className={`${inputClass} h-9`}
                  value={form.pasted.kind}
                  onChange={(e) =>
                    set('pasted', { ...form.pasted, kind: e.target.value as PastedKind })
                  }
                >
                  {(Object.keys(t.pastedKinds) as PastedKind[]).map((k) => (
                    <option key={k} value={k}>
                      {t.pastedKinds[k]}
                    </option>
                  ))}
                </select>
                <input
                  aria-label={t.pastedLabel}
                  className={`${inputClass} h-9`}
                  placeholder={t.pastedLabelPlaceholder}
                  value={form.pasted.label}
                  onChange={(e) => set('pasted', { ...form.pasted, label: e.target.value })}
                />
              </div>
              <textarea
                aria-label={t.pasted}
                className={`${inputClass} min-h-16 resize-y font-mono text-xs`}
                value={form.pasted.content}
                onChange={(e) => set('pasted', { ...form.pasted, content: e.target.value })}
              />
            </fieldset>

            <div>
              <label htmlFor="f-examples" className="mb-1 block text-xs font-semibold">
                {t.examples}
              </label>
              <textarea
                id="f-examples"
                className={`${inputClass} min-h-12 resize-y`}
                placeholder={t.examplesPlaceholder}
                value={form.examples}
                onChange={(e) => set('examples', e.target.value)}
              />
            </div>

            {SUGGESTION_GROUPS.map((g) => {
              const list = SUGGESTIONS[g.key]
              const count = list.filter((s) => selected.has(s.code)).length
              return (
                <fieldset key={g.key} className="m-0 flex flex-col gap-1.5 border-0 p-0">
                  <legend className="flex w-full items-baseline gap-2 pb-1.5">
                    <span className="text-[13px] font-semibold">{g.title}</span>
                    <span className="flex-1 text-xs text-muted">{g.hint}</span>
                    <Tag>{t.selectedCount(count, list.length)}</Tag>
                  </legend>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-1.5">
                    {list.map((s) => (
                      <CheckOption
                        key={s.code}
                        checked={selected.has(s.code)}
                        onChange={() => set('selected', [...toggleSuggestion(selected, s.code)])}
                        label={s.label}
                        detail={s.text}
                      />
                    ))}
                  </div>
                </fieldset>
              )
            })}

            <div>
              <label htmlFor="f-length" className="mb-1 block text-xs font-semibold">
                {t.length}
              </label>
              <select
                id="f-length"
                className={`${inputClass} h-9 max-w-[240px]`}
                value={form.length}
                onChange={(e) => set('length', e.target.value)}
              >
                <option value="">{t.lengthAuto}</option>
                {LENGTH_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Panel>

        <Panel className="sticky top-3 min-w-0 flex-[1_1_380px]">
          <PanelHeader>
            <h2 className="flex-1 text-sm font-semibold">{t.previewTitle}</h2>
            <span className="text-xs text-muted">
              {t.stats(preview.split('\n').length, estimateTokens(preview))}
            </span>
          </PanelHeader>
          <div className="flex flex-col gap-3 p-3.5">
            <pre
              aria-label={t.previewTitle}
              className="m-0 max-h-[64vh] overflow-auto whitespace-pre-wrap break-words rounded-md bg-code-bg p-3.5 font-mono text-xs leading-relaxed text-code-ink"
            >
              {preview}
            </pre>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="ai" onClick={aiSoon}>
                {t.polishAll}
              </Button>
              <div className="flex-1" />
              <Button variant="primary" onClick={() => void copy()}>
                <Copy className="size-3.5" aria-hidden="true" />
                {t.copy}
                <Kbd className="border-current bg-transparent text-current">Ctrl+Enter</Kbd>
              </Button>
            </div>
            <p className="text-xs text-muted">{t.aiOnlyOnClick}</p>
          </div>
        </Panel>
      </div>
    </>
  )
}
