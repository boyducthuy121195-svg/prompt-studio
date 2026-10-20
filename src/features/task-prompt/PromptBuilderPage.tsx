import { Copy, RotateCcw, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { useHotkey } from '@/app/use-hotkey'
import { CheckOption } from '@/components/CheckOption'
import { Button, Kbd, PageHeader, Panel, PanelHeader, Tag } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { copyText } from '@/lib/clipboard'
import { useCurrentProject, useSettings } from '@/lib/db/hooks'
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
import { completeness } from '@/lib/prompts/completeness'
import { SUGGESTION_GROUPS, SUGGESTIONS, toggleSuggestion } from '@/lib/prompts/suggestions'
import { cn } from '@/lib/utils'
import { PROMPT_TYPE_CODES, type PromptTypeCode } from '@/lib/prompts/types'
import { DiffDialog } from '@/components/DiffDialog'
import { useAITask } from '@/components/use-ai-task'
import {
  appendAnswers,
  appendLines,
  insertAdditions,
  PolishFieldSchema,
  polishFieldRequest,
  PolishPromptSchema,
  polishPromptRequest,
  type PolishFieldResult,
  type PolishPromptResult,
} from '@/lib/prompts/meta/polish'
import { FieldInput, inputClass } from './FieldInput'
import { SavePromptDialog } from './SavePromptDialog'

type PolishTarget =
  { kind: 'field'; key: string; label: string; before: string } | { kind: 'all'; before: string }

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
  return (
    <PromptBuilderWithSettings
      key={`${typeCode}-${location.key}`}
      typeCode={typeCode}
      initial={initial}
    />
  )
}

function PromptBuilderWithSettings(props: { typeCode: PromptTypeCode; initial?: PromptForm }) {
  const settings = useSettings()
  if (settings.status === 'loading') return <p className="text-muted">{vi.common.loading}</p>
  const language = settings.status === 'ready' ? settings.data.language : DEFAULT_LANGUAGE
  return <PromptBuilder {...props} language={language} />
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

  const built = useMemo(() => buildPrompt(form, project), [form, project])
  const done = completeness(form, type, { task: t.task, purpose: t.purpose })
  // Bản đã trau chuốt bằng AI (✨ Trau chuốt toàn bộ); sửa bảng nhập thì bỏ bản này
  const [polished, setPolished] = useState<string | null>(null)
  const preview = polished ?? built
  const selected = new Set(form.selected)
  const set = <K extends keyof PromptForm>(key: K, value: PromptForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setPolished(null)
  }

  const copy = async () => toast((await copyText(preview)) ? t.copied : t.copyFailed)
  useHotkey('mod+enter', () => void copy())
  const [saving, setSaving] = useState(false)
  useHotkey('mod+s', () => setSaving(true))
  const defaultTitle = form.task.trim()
    ? `${type.name}: ${form.task.trim().slice(0, 60)}`
    : type.name

  const fieldAi = useAITask<PolishFieldResult>()
  const allAi = useAITask<PolishPromptResult>()
  const [polishing, setPolishing] = useState<PolishTarget | null>(null)

  const fieldText = (key: string) => {
    if (key === 'task') return form.task
    if (key === 'purpose') return form.purpose
    const v = form.fields[key]
    return typeof v === 'string' ? v : ''
  }
  const setFieldText = (key: string, value: string) => {
    if (key === 'task' || key === 'purpose') set(key, value)
    else set('fields', { ...form.fields, [key]: value })
  }
  const fieldDef = (key: string, label: string) =>
    type.fields.find((f) => f.key === key) ?? {
      key,
      label,
      placeholder: key === 'task' ? type.taskPlaceholder : undefined,
    }

  const polishField = (key: string, label: string) => {
    const text = fieldText(key)
    if (!text.trim()) return toast(t.emptyToPolish)
    setPolishing({ kind: 'field', key, label, before: text })
    void fieldAi.start({
      kind: 'json',
      run: (p, signal) =>
        p.generateJson(
          polishFieldRequest({
            field: fieldDef(key, label),
            text,
            type,
            form,
            project,
            language: form.language,
          }),
          PolishFieldSchema,
          signal,
        ),
    })
  }

  const polishAll = () => {
    setPolishing({ kind: 'all', before: preview })
    void allAi.start({
      kind: 'json',
      run: (p, signal) =>
        p.generateJson(
          polishPromptRequest({ prompt: preview, type, form, project, language: form.language }),
          PolishPromptSchema,
          signal,
        ),
    })
  }

  const closePolish = () => {
    fieldAi.reset()
    allAi.reset()
    setPolishing(null)
  }
  const fieldResult = fieldAi.state.status === 'done' ? fieldAi.state.data : undefined
  const allResult = allAi.state.status === 'done' ? allAi.state.data : undefined
  const accept = (answers: { question: string; answer: string }[], picked: number[]) => {
    if (!polishing) return
    if (polishing.kind === 'field' && fieldResult) {
      const extra = picked.map((i) => fieldResult.suggestions[i])
      setFieldText(polishing.key, appendLines(fieldResult.rewritten.trim(), extra))
    } else if (polishing.kind === 'all' && allResult) {
      const withAdds = insertAdditions(
        allResult.improved,
        picked.map((i) => allResult.additions[i]),
      )
      setPolished(appendAnswers(withAdds, answers))
    }
    toast(vi.diff.accepted)
    closePolish()
  }
  const active = polishing?.kind === 'field' ? fieldAi : allAi
  const after =
    polishing?.kind === 'field' ? (fieldResult?.rewritten ?? '') : (allResult?.improved ?? '')
  const picks =
    polishing?.kind === 'field'
      ? fieldResult && {
          title: t.fieldPicksTitle,
          hint: t.fieldPicksHint,
          items: fieldResult.suggestions.map((label) => ({ label })),
        }
      : allResult && {
          title: t.allPicksTitle,
          hint: t.allPicksHint,
          items: allResult.additions.map((a) => ({
            label: t.pickLabel(a.block, a.text),
            detail: a.reason,
          })),
        }

  const polishButton = (key: string, label: string) => (
    <Button
      variant="ai"
      size="sm"
      onClick={() => polishField(key, label)}
      aria-label={t.polishLabel(label)}
    >
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
                setPolished(null)
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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] gap-3">
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
                {polishButton('task', t.task)}
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
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-3">
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
                      action={f.polish ? polishButton(f.key, f.label) : undefined}
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
                {polishButton('purpose', t.purpose)}
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
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-2">
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
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-1.5">
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
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs">
                <span className="flex-1 font-semibold">{t.completeness}</span>
                <span className="font-semibold">{done.percent}%</span>
              </div>
              <div
                role="progressbar"
                aria-label={t.completeness}
                aria-valuenow={done.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 overflow-hidden rounded-full bg-soft"
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-[width]',
                    done.percent === 100 ? 'bg-green-ink' : 'bg-accent',
                  )}
                  style={{ width: `${done.percent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">
                {done.missing.length
                  ? t.completenessMissing(done.missing.join(', '))
                  : t.completenessDone}
              </p>
            </div>
            {polished && (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-ai-line bg-ai-bg px-3 py-1.5 text-xs text-ai-ink">
                <span className="flex-1">{t.polishedBanner}</span>
                <Button size="sm" variant="ghost" onClick={() => setPolished(null)}>
                  {t.discardPolished}
                </Button>
              </div>
            )}
            <pre
              aria-label={t.previewTitle}
              className="m-0 max-h-[64vh] overflow-auto whitespace-pre-wrap break-words rounded-md bg-code-bg p-3.5 font-mono text-xs leading-relaxed text-code-ink"
            >
              {preview}
            </pre>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="ai" onClick={polishAll}>
                {t.polishAll}
              </Button>
              <Button onClick={() => setSaving(true)}>
                <Save className="size-3.5" aria-hidden="true" />
                {t.save}
                <Kbd>Ctrl+S</Kbd>
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

      {polishing && (
        <DiffDialog
          open
          title={polishing.kind === 'field' ? t.polishTitle(polishing.label) : t.polishAllTitle}
          before={polishing.before}
          hint={
            polishing.kind === 'field' ? t.polishFieldHint(type.name) : t.polishAllHint(type.name)
          }
          after={after}
          running={active.state.status === 'running'}
          error={active.state.status === 'error' ? active.state.error : null}
          changes={polishing.kind === 'all' ? allResult?.changes : undefined}
          questions={polishing.kind === 'all' ? allResult?.questions : undefined}
          picks={picks}
          onStop={active.stop}
          onRetry={active.retry}
          onAccept={accept}
          onClose={closePolish}
        />
      )}

      {saving && (
        <SavePromptDialog
          open
          onOpenChange={setSaving}
          defaultTitle={defaultTitle}
          typeCode={typeCode}
          body={preview}
          formState={form}
          project={project}
        />
      )}
    </>
  )
}
