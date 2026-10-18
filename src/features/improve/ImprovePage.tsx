import { Copy, FileUp, Loader2, Square } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { DiffDialog } from '@/components/DiffDialog'
import { Button, PageHeader, Panel, PanelHeader, Tag } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { useAITask } from '@/components/use-ai-task'
import { inputClass } from '@/features/task-prompt/FieldInput'
import { SavePromptDialog } from '@/features/task-prompt/SavePromptDialog'
import { parseAgentsMd } from '@/lib/agents/parse'
import { copyText } from '@/lib/clipboard'
import { ensureAgentsDoc, saveAgentsDoc } from '@/lib/db/agents'
import { useCurrentProject, useSettings } from '@/lib/db/hooks'
import { vi } from '@/lib/i18n/vi'
import {
  ImproveRewriteSchema,
  improveRewriteRequest,
  ImproveSchema,
  improveRequest,
  SCORE_LABELS,
  type ImproveKind,
  type ImproveResult,
  type ImproveRewriteResult,
} from '@/lib/prompts/meta/improve'
import { cn } from '@/lib/utils'

const t = vi.improve
const LEVEL_TONE = {
  high: 'bg-red-bg text-red-ink',
  medium: 'bg-warn-bg text-warn-ink',
  low: 'bg-soft text-muted',
}

/** M7 – Cải thiện prompt hoặc file quy tắc có sẵn. */
export function ImprovePage() {
  const [kind, setKind] = useState<ImproveKind>('prompt')
  const [content, setContent] = useState('')
  const [showProposal, setShowProposal] = useState(false)
  const [applied, setApplied] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const ai = useAITask<ImproveResult>()
  const rewriteAi = useAITask<ImproveRewriteResult>()
  // Chỉ số các vấn đề người dùng chọn để AI sửa (mặc định: mức Cao và TB)
  const [picked, setPicked] = useState<number[]>([])
  const settings = useSettings()
  const current = useCurrentProject()
  const project = current.status === 'ready' ? current.data : null
  const toast = useToast()
  const navigate = useNavigate()
  const language = settings.status === 'ready' ? settings.data.language : 'vi-en'
  const result = ai.state.status === 'done' ? ai.state.data : undefined
  const running = ai.state.status === 'running'

  const analyze = async () => {
    setApplied(false)
    setPicked([])
    await ai.start({
      kind: 'json',
      run: async (p, signal) => {
        const r = await p.generateJson(
          improveRequest({ kind, content, project, language }),
          ImproveSchema,
          signal,
        )
        setPicked(r.issues.flatMap((is, i) => (is.level === 'low' ? [] : [i])))
        return r
      },
    })
  }

  const togglePick = (i: number) =>
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i].sort((a, b) => a - b)))

  const rewrite = () => {
    if (!result || !picked.length) return
    const issues = picked.map((i) => result.issues[i])
    setShowProposal(true)
    void rewriteAi.start({
      kind: 'json',
      run: (p, signal) =>
        p.generateJson(
          improveRewriteRequest({ kind, content, issues, project, language }),
          ImproveRewriteSchema,
          signal,
        ),
    })
  }
  const closeProposal = () => {
    rewriteAi.reset()
    setShowProposal(false)
  }
  const proposal = rewriteAi.state.status === 'done' ? rewriteAi.state.data : undefined

  const readFile = async (file: File | undefined) => {
    if (!file) return
    try {
      setContent(await file.text())
      if (/agents|claude|gemini/i.test(file.name)) setKind('agents')
      toast(t.uploaded(file.name))
    } catch {
      toast(t.uploadError)
    }
  }

  const applyAsAgents = async () => {
    if (!project) return
    const doc = await ensureAgentsDoc(project.id)
    await saveAgentsDoc(doc, parseAgentsMd(content), project.name)
    toast(t.agentsSaved)
    navigate('/agents')
  }

  return (
    <>
      <PageHeader title={vi.pages.improve.title} desc={vi.pages.improve.desc} />
      <div className="flex flex-wrap items-start gap-3.5">
        <Panel className="min-w-0 flex-[1_1_420px]">
          <PanelHeader>
            <h2 className="flex-1 text-sm font-semibold">{t.inputTitle}</h2>
            <label htmlFor="imp-kind" className="sr-only">
              {t.kind}
            </label>
            <select
              id="imp-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as ImproveKind)}
              className={`${inputClass} h-8 w-auto`}
            >
              {(Object.keys(t.kinds) as ImproveKind[]).map((k) => (
                <option key={k} value={k}>
                  {t.kinds[k]}
                </option>
              ))}
            </select>
          </PanelHeader>
          <div className="flex flex-col gap-3 p-3.5">
            <textarea
              aria-label={t.content}
              className={`${inputClass} min-h-[260px] resize-y font-mono text-xs`}
              placeholder={t.placeholder}
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setApplied(false)
              }}
            />
            <div className="flex flex-wrap gap-1.5">
              <input
                ref={fileRef}
                type="file"
                accept=".md,.txt,.markdown,text/plain,text/markdown"
                className="sr-only"
                aria-label={t.upload}
                onChange={(e) => {
                  void readFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <Button onClick={() => fileRef.current?.click()}>
                <FileUp className="size-3.5" aria-hidden="true" />
                {t.upload}
              </Button>
              <Button
                variant="ai"
                onClick={() => void analyze()}
                disabled={!content.trim() || running}
              >
                {running ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
                {running ? t.analyzing : t.analyze}
              </Button>
              {running && (
                <Button onClick={ai.stop}>
                  <Square className="size-3.5" aria-hidden="true" />
                  {vi.agents.stop}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted">
              {project ? t.contextNote(project.name) : t.noContextNote}
            </p>
            {applied && (
              <div className="flex flex-col gap-2 rounded-md border border-accent-line bg-accent-weak p-3">
                <span className="text-[13px] font-semibold text-accent-ink">{t.afterTitle}</span>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={async () =>
                      toast((await copyText(content)) ? vi.builder.copied : vi.builder.copyFailed)
                    }
                  >
                    <Copy className="size-3.5" aria-hidden="true" />
                    {t.copy}
                  </Button>
                  <Button size="sm" onClick={() => setSaving(true)}>
                    {t.saveLibrary}
                  </Button>
                  {kind === 'agents' && project && (
                    <Button size="sm" onClick={() => void applyAsAgents()}>
                      {t.useAsAgents(project.name)}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Panel>

        <Panel className="min-w-0 flex-[1_1_380px]">
          <PanelHeader>
            <h2 className="flex-1 text-sm font-semibold">{t.resultTitle}</h2>
          </PanelHeader>
          {ai.state.status === 'error' && (
            <div
              role="alert"
              className="m-3.5 rounded-md border border-red-ink/30 bg-red-bg px-3 py-2 text-red-ink"
            >
              {ai.state.error.message}{' '}
              {ai.state.error.code === 'no_key' || ai.state.error.code === 'invalid_key' ? (
                <Link to="/settings" className="font-semibold underline">
                  {vi.diff.goSettings}
                </Link>
              ) : (
                <button
                  type="button"
                  className="cursor-pointer font-semibold underline"
                  onClick={ai.retry}
                >
                  {vi.diff.retry}
                </button>
              )}
            </div>
          )}
          {!result && ai.state.status !== 'error' && (
            <p className="p-6 text-center text-muted">{t.empty}</p>
          )}
          {result && (
            <>
              <ul aria-label={t.resultTitle} className="flex flex-col gap-2.5 p-3.5">
                {(Object.keys(SCORE_LABELS) as (keyof typeof SCORE_LABELS)[]).map((k) => (
                  <li
                    key={k}
                    className="grid grid-cols-[130px_1fr_40px] items-center gap-2.5 text-[12.5px]"
                  >
                    <span>{SCORE_LABELS[k]}</span>
                    <div className="h-1.5 overflow-hidden rounded bg-hover" aria-hidden="true">
                      <div
                        className="h-full rounded bg-accent"
                        style={{ width: `${result.scores[k] * 10}%` }}
                      />
                    </div>
                    <span className="text-right text-muted">{result.scores[k]}/10</span>
                  </li>
                ))}
              </ul>
              <div className="overflow-x-auto border-t border-border">
                <table className="w-full border-collapse">
                  <caption className="sr-only">{t.issuesTitle}</caption>
                  <thead>
                    <tr>
                      <th className="w-8 border-b border-border bg-soft px-3 py-2">
                        <span className="sr-only">
                          {t.pickedCount(picked.length, result.issues.length)}
                        </span>
                      </th>
                      {[t.levelCol, t.issueCol, t.fixCol].map((c) => (
                        <th
                          key={c}
                          className="border-b border-border bg-soft px-3 py-2 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.issues.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-muted">
                          {t.noIssues}
                        </td>
                      </tr>
                    )}
                    {result.issues.map((is, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="px-3 py-2 align-top">
                          <input
                            type="checkbox"
                            checked={picked.includes(i)}
                            onChange={() => togglePick(i)}
                            aria-label={t.pickIssue(is.text)}
                            className="mt-0.5 size-[15px] accent-accent"
                          />
                        </td>
                        <td className="w-16 px-3 py-2 align-top">
                          <Tag className={cn('border-transparent', LEVEL_TONE[is.level])}>
                            {t.levels[is.level]}
                          </Tag>
                        </td>
                        <td className="px-3 py-2 align-top leading-snug">{is.text}</td>
                        <td className="px-3 py-2 align-top leading-snug text-muted">{is.fix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 border-t border-border p-3.5">
                <Button variant="ai" onClick={rewrite} disabled={!picked.length}>
                  {t.rewrite(picked.length)}
                </Button>
                <span className="text-xs text-muted">
                  {picked.length ? t.pickedCount(picked.length, result.issues.length) : t.pickSome}
                </span>
              </div>
            </>
          )}
        </Panel>
      </div>

      {showProposal && (
        <DiffDialog
          open
          title={t.proposalTitle(picked.length)}
          hint={t.proposalHint}
          changesTitle={t.changesTitle}
          before={content}
          after={proposal?.proposal ?? ''}
          changes={proposal?.changes}
          running={rewriteAi.state.status === 'running'}
          error={rewriteAi.state.status === 'error' ? rewriteAi.state.error : null}
          onStop={rewriteAi.stop}
          onRetry={rewriteAi.retry}
          onClose={closeProposal}
          onAccept={() => {
            if (proposal) setContent(proposal.proposal)
            setApplied(true)
            closeProposal()
            toast(t.applied)
          }}
        />
      )}
      {saving && (
        <SavePromptDialog
          open
          onOpenChange={setSaving}
          defaultTitle={
            t.savedTitle +
            (content
              .split('\n')
              .find((l) => l.trim() && !l.startsWith('#'))
              ?.slice(0, 50) ?? '')
          }
          typeCode="TU_DO"
          body={content}
          project={project}
        />
      )}
    </>
  )
}
