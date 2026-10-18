import { Loader2, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { CheckOption } from '@/components/CheckOption'
import { DiffDialog } from '@/components/DiffDialog'
import { Button, Panel, PanelHeader, Tag } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { useAITask } from '@/components/use-ai-task'
import { inputClass } from '@/features/task-prompt/FieldInput'
import { applyAiSections, renderAgentsMd } from '@/lib/agents/doc'
import type { AIError } from '@/lib/ai/errors'
import { useSettings } from '@/lib/db/hooks'
import { vi } from '@/lib/i18n/vi'
import { AGENTS_SECTIONS, getAgentsSection } from '@/lib/prompts/agents-skeleton'
import {
  agentsCheckRequest,
  AgentsCheckSchema,
  agentsClassifyRequest,
  AgentsClassifySchema,
  agentsGenerateRequest,
  agentsRewriteRequest,
  AgentsRewriteSchema,
  AgentsSectionsSchema,
  type AgentsCheckResult,
  type AgentsClassifyResult,
  type AgentsRewriteResult,
  type AgentsSectionsResult,
  type RewriteMode,
  type WizardAnswer,
} from '@/lib/prompts/meta/agents'
import { appendLines } from '@/lib/prompts/meta/polish'
import { cn } from '@/lib/utils'
import { AgentsPage, type AgentsAiSlots, type AgentsSlotContext } from './AgentsPage'

const t = vi.agents

function useLanguage() {
  const s = useSettings()
  return s.status === 'ready' ? s.data.language : 'vi-en'
}

function AiError({ error, onRetry }: { error: AIError; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-red-ink/30 bg-red-bg px-3 py-2 text-red-ink"
    >
      {error.message}{' '}
      {error.code === 'no_key' || error.code === 'invalid_key' ? (
        <Link to="/settings" className="font-semibold underline">
          {vi.diff.goSettings}
        </Link>
      ) : error.code !== 'aborted' ? (
        <button type="button" className="cursor-pointer font-semibold underline" onClick={onRetry}>
          {vi.diff.retry}
        </button>
      ) : null}
    </div>
  )
}

/** Chế độ Hỏi đáp: đi qua 10 câu rồi để AI viết AGENTS.md. */
function WizardPanel({ ctx }: { ctx: AgentsSlotContext }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { options: string[]; free: string }>>({})
  const ai = useAITask<AgentsSectionsResult>()
  const toast = useToast()
  const language = useLanguage()
  const def = AGENTS_SECTIONS[step]
  const a = answers[def.key] ?? { options: [], free: '' }
  const last = step === AGENTS_SECTIONS.length - 1
  const running = ai.state.status === 'running'

  const setA = (patch: Partial<typeof a>) =>
    setAnswers((s) => ({ ...s, [def.key]: { ...a, ...patch } }))

  const generate = async () => {
    const list: WizardAnswer[] = AGENTS_SECTIONS.map((d) => ({
      key: d.key,
      question: d.question,
      options: answers[d.key]?.options ?? [],
      free: answers[d.key]?.free ?? '',
    }))
    await ai.start({
      kind: 'json',
      run: (p, signal) =>
        p.generateJson(
          agentsGenerateRequest({ project: ctx.project, answers: list, language }),
          AgentsSectionsSchema,
          signal,
        ),
    })
  }

  // Ghép kết quả sau khi vẽ xong (không cập nhật trạng thái của component cha trong lúc vẽ)
  useEffect(() => {
    if (ai.state.status === 'done' && ai.state.data) {
      const data = ai.state.data
      ai.reset()
      ctx.replaceSections(applyAiSections(ctx.sections, data.sections))
      toast(t.generated)
    }
  }, [ai, ctx, toast])

  return (
    <Panel className="max-w-[760px]">
      <PanelHeader>
        <Tag tone="accent">{t.wizardStep(step + 1, AGENTS_SECTIONS.length)}</Tag>
        <h2 className="flex-1 text-sm font-semibold">{def.title}</h2>
      </PanelHeader>
      <div className="flex flex-col gap-3 p-3.5">
        <div className="h-1.5 overflow-hidden rounded bg-hover" aria-hidden="true">
          <div
            className="h-full bg-accent"
            style={{ width: `${((step + 1) / AGENTS_SECTIONS.length) * 100}%` }}
          />
        </div>
        <h3 className="text-base font-semibold">{def.question}</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-1.5">
          {def.quickOptions.map((o) => (
            <CheckOption
              key={o}
              checked={a.options.includes(o)}
              onChange={() =>
                setA({
                  options: a.options.includes(o)
                    ? a.options.filter((x) => x !== o)
                    : [...a.options, o],
                })
              }
              label={o}
              className="font-normal"
            />
          ))}
        </div>
        <div>
          <label htmlFor="wiz-free" className="mb-1 block text-xs font-semibold">
            {t.wizardFree}
          </label>
          <textarea
            id="wiz-free"
            className={`${inputClass} min-h-16`}
            placeholder={t.wizardFreePlaceholder}
            value={a.free}
            onChange={(e) => setA({ free: e.target.value })}
          />
        </div>
        {ai.state.status === 'error' && <AiError error={ai.state.error} onRetry={ai.retry} />}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || running}
          >
            {t.back}
          </Button>
          {!last && (
            <Button variant="ghost" onClick={() => setStep((s) => s + 1)}>
              {t.skip}
            </Button>
          )}
          <div className="flex-1" />
          {running && (
            <>
              <span className="flex items-center gap-1.5 text-muted">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                {t.generating}
              </span>
              <Button onClick={ai.stop}>
                <Square className="size-3.5" aria-hidden="true" />
                {t.stop}
              </Button>
            </>
          )}
          {last ? (
            <Button variant="primary" onClick={() => void generate()} disabled={running}>
              {t.generate}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              {t.next}
            </Button>
          )}
        </div>
      </div>
    </Panel>
  )
}

/** Chế độ Nhập tự do: dán nội dung, AI xếp vào 10 mục. */
function FreePanel({ ctx }: { ctx: AgentsSlotContext }) {
  const [raw, setRaw] = useState('')
  const ai = useAITask<AgentsClassifyResult>()
  const toast = useToast()
  const language = useLanguage()
  const running = ai.state.status === 'running'

  useEffect(() => {
    if (ai.state.status === 'done' && ai.state.data) {
      const data = ai.state.data
      ai.reset()
      ctx.replaceSections(applyAiSections(ctx.sections, data.sections))
      toast(t.classified(data.missing.map((k) => getAgentsSection(k)?.title ?? k).join(', ')))
    }
  }, [ai, ctx, toast])

  return (
    <Panel className="max-w-[860px]">
      <PanelHeader>
        <h2 className="text-sm font-semibold">{t.freeLabel}</h2>
      </PanelHeader>
      <div className="flex flex-col gap-3 p-3.5">
        <textarea
          aria-label={t.freeLabel}
          className={`${inputClass} min-h-[240px]`}
          placeholder={t.freePlaceholder}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        {ai.state.status === 'error' && <AiError error={ai.state.error} onRetry={ai.retry} />}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ai"
            disabled={!raw.trim() || running}
            onClick={() =>
              void ai.start({
                kind: 'json',
                run: (p, signal) =>
                  p.generateJson(
                    agentsClassifyRequest({ raw, language }),
                    AgentsClassifySchema,
                    signal,
                  ),
              })
            }
          >
            {running ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            {running ? t.classifying : t.classify}
          </Button>
          {running && (
            <Button onClick={ai.stop}>
              <Square className="size-3.5" aria-hidden="true" />
              {t.stop}
            </Button>
          )}
          <span className="text-xs text-muted">{t.classifyHint}</span>
        </div>
      </div>
    </Panel>
  )
}

const MODES: { mode: RewriteMode; label: string }[] = [
  { mode: 'rewrite', label: t.rewrite },
  { mode: 'shorter', label: t.shorter },
  { mode: 'examples', label: t.examples },
]

/** Nút ✨ Viết lại / Ngắn gọn hơn / Thêm ví dụ cho mục đang mở. */
function SectionActions({
  ctx,
  section,
}: {
  ctx: AgentsSlotContext
  section: AgentsSlotContext['sections'][number]
}) {
  const ai = useAITask<AgentsRewriteResult>()
  const language = useLanguage()
  const toast = useToast()
  const [open, setOpen] = useState<{ label: string; before: string; key: string } | null>(null)

  const run = (mode: RewriteMode, label: string) => {
    setOpen({ label, before: section.content, key: section.key })
    const others = ctx.sections
      .filter((s) => s.enabled && s.key !== section.key)
      .map((s) => ({ title: s.title, content: s.content }))
    void ai.start({
      kind: 'json',
      run: (p, signal) =>
        p.generateJson(
          agentsRewriteRequest({
            sectionKey: section.key,
            sectionTitle: section.title,
            content: section.content,
            mode,
            project: ctx.project,
            others,
            language,
          }),
          AgentsRewriteSchema,
          signal,
        ),
    })
  }
  const close = () => {
    ai.reset()
    setOpen(null)
  }
  const result = ai.state.status === 'done' ? ai.state.data : undefined

  return (
    <>
      {MODES.map((m) => (
        <Button key={m.mode} variant="ai" size="sm" onClick={() => run(m.mode, m.label)}>
          {m.label}
        </Button>
      ))}
      {open && (
        <DiffDialog
          open
          title={t.rewriteTitle(open.label, section.title)}
          hint={t.rewriteHint(section.title)}
          before={open.before}
          after={result?.content ?? ''}
          picks={
            result && {
              title: t.rewritePicksTitle(section.title),
              hint: t.rewritePicksHint,
              items: result.suggestions.map((label) => ({ label })),
            }
          }
          running={ai.state.status === 'running'}
          error={ai.state.status === 'error' ? ai.state.error : null}
          onStop={ai.stop}
          onRetry={ai.retry}
          onClose={close}
          onAccept={(_answers, picked) => {
            if (result)
              ctx.setSectionContent(
                open.key,
                appendLines(
                  result.content.trim(),
                  picked.map((i) => result.suggestions[i]),
                ),
              )
            toast(vi.diff.accepted)
            close()
          }}
        />
      )}
    </>
  )
}

/** ✨ Kiểm tra lại bằng AI – nhận xét hiện ngay dưới các kiểm tra cục bộ. */
function AiCheck({ ctx }: { ctx: AgentsSlotContext }) {
  const ai = useAITask<AgentsCheckResult>()
  const language = useLanguage()
  const running = ai.state.status === 'running'
  const data = ai.state.status === 'done' ? ai.state.data : undefined

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ai"
        size="sm"
        disabled={running}
        onClick={() =>
          void ai.start({
            kind: 'json',
            run: (p, signal) =>
              p.generateJson(
                agentsCheckRequest({
                  md: renderAgentsMd(ctx.project.name, ctx.sections),
                  language,
                }),
                AgentsCheckSchema,
                signal,
              ),
          })
        }
      >
        {running ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
        {running ? t.aiChecking : t.aiCheck}
      </Button>
      {ai.state.status === 'error' && <AiError error={ai.state.error} onRetry={ai.retry} />}
      {data && (
        <div>
          <h3 className="mb-1 text-xs font-semibold">{t.aiChecksTitle}</h3>
          <ul aria-label={t.aiChecksTitle} className="flex flex-col gap-1.5">
            {data.checks.map((c, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-snug">
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-3.5 shrink-0 font-bold',
                    c.level === 'ok'
                      ? 'text-green-ink'
                      : c.level === 'warn'
                        ? 'text-warn-ink'
                        : 'text-red-ink',
                  )}
                >
                  {c.level === 'ok' ? '✓' : '!'}
                </span>
                <span>
                  {c.section && <b>{c.section}: </b>}
                  {c.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const slots: AgentsAiSlots = {
  wizard: (ctx) => <WizardPanel ctx={ctx} />,
  free: (ctx) => <FreePanel ctx={ctx} />,
  sectionActions: (ctx) => <SectionActions key={ctx.section.key} ctx={ctx} section={ctx.section} />,
  checkActions: (ctx) => <AiCheck ctx={ctx} />,
}

/** Trang AGENTS.md đầy đủ: chế độ Hỏi đáp, Nhập tự do và các nút ✨ dùng AI. */
export function AgentsPageWithAi() {
  return <AgentsPage slots={slots} />
}
