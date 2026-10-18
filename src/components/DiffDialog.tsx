import { diffWords } from 'diff'
import { Loader2, Square } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Dialog } from '@/components/Dialog'
import { CheckOption } from '@/components/CheckOption'
import { TextField } from '@/components/Field'
import { Button, Tag } from '@/components/Primitives'
import type { AIError } from '@/lib/ai/errors'
import { vi } from '@/lib/i18n/vi'

const t = vi.diff

/**
 * M5 – hộp so sánh trước/sau: chữ AI viết hiện dần, phần thay đổi được tô màu,
 * câu hỏi của AI cho người dùng trả lời, gợi ý bổ sung để tích chọn, Chấp nhận / Bỏ qua.
 * Mỗi nơi gọi tự đặt `hint`, `changesTitle` và `picks` cho hợp ngữ cảnh.
 */
export interface DiffPicks {
  title: string
  hint?: string
  items: { label: string; detail?: string }[]
}

export function DiffDialog({
  open,
  title,
  before,
  after,
  running,
  error,
  changes = [],
  questions = [],
  picks,
  hint,
  changesTitle,
  onStop,
  onRetry,
  onAccept,
  onClose,
}: {
  open: boolean
  title: string
  before: string
  after: string
  running: boolean
  error?: AIError | null
  changes?: string[]
  questions?: string[]
  /** Gợi ý AI đề xuất thêm theo ngữ cảnh; người dùng tích cái muốn dùng */
  picks?: DiffPicks
  hint?: string
  changesTitle?: string
  onStop: () => void
  onRetry: () => void
  onAccept: (answers: { question: string; answer: string }[], picked: number[]) => void
  onClose: () => void
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [picked, setPicked] = useState<number[]>([])
  const togglePick = (i: number) =>
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i].sort((a, b) => a - b)))
  const parts = !running && after ? diffWords(before, after) : null
  const canAccept = !running && !error && after.trim() !== ''

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={title}
      description={running ? t.running : (hint ?? t.hint)}
      wide
      footer={
        <>
          {running ? (
            <Button onClick={onStop}>
              <Square className="size-3.5" aria-hidden="true" />
              {t.stop}
            </Button>
          ) : (
            <Button onClick={onClose}>{t.skip}</Button>
          )}
          {error && error.code !== 'aborted' && (
            <Button onClick={onRetry} disabled={error.code === 'no_key'}>
              {t.retry}
            </Button>
          )}
          <Button
            variant="primary"
            disabled={!canAccept}
            onClick={() =>
              onAccept(
                questions.map((q, i) => ({ question: q, answer: answers[i] ?? '' })),
                picked,
              )
            }
          >
            {t.accept}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-ink/30 bg-red-bg px-3 py-2 text-red-ink"
          >
            {error.message}{' '}
            {(error.code === 'no_key' || error.code === 'invalid_key') && (
              <Link to="/settings" onClick={onClose} className="font-semibold underline">
                {t.goSettings}
              </Link>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-3.5">
          <section className="flex min-w-0 flex-[1_1_340px] flex-col gap-1.5">
            <h3 className="text-[13px] font-semibold text-muted">{t.before}</h3>
            <div className="max-h-[48vh] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-soft p-3 leading-relaxed">
              {parts
                ? parts.map((p, i) =>
                    p.added ? null : p.removed ? (
                      <del key={i} className="rounded-sm bg-red-bg text-red-ink">
                        {p.value}
                      </del>
                    ) : (
                      <span key={i}>{p.value}</span>
                    ),
                  )
                : before}
            </div>
          </section>
          <section className="flex min-w-0 flex-[1_1_340px] flex-col gap-1.5">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold">
              {t.after}
              {running && (
                <Loader2 className="size-3.5 animate-spin text-muted" aria-label={t.running} />
              )}
              {parts && <span className="font-normal text-muted">{t.highlight}</span>}
            </h3>
            <div
              aria-label={t.after}
              aria-live="polite"
              className="max-h-[48vh] min-h-24 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-surface p-3 leading-relaxed"
            >
              {parts
                ? parts.map((p, i) =>
                    p.removed ? null : p.added ? (
                      <mark key={i} className="rounded-sm bg-[#ffe3a1] px-0.5 text-[#3a2600]">
                        {p.value}
                      </mark>
                    ) : (
                      <span key={i}>{p.value}</span>
                    ),
                  )
                : after || (running ? '…' : '')}
            </div>
          </section>
        </div>

        {changes.length > 0 && (
          <div>
            <h3 className="mb-1 text-[13px] font-semibold">{changesTitle ?? t.changes}</h3>
            <ul className="list-disc pl-5 text-[12.5px] text-muted">
              {changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {picks && picks.items.length > 0 && (
          <section
            aria-label={picks.title}
            className="flex flex-col gap-2 rounded-lg border border-ai-line bg-ai-bg p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[13px] font-semibold text-ai-ink">{picks.title}</h3>
              <Tag>{t.optional}</Tag>
              {picks.hint && <span className="text-xs text-muted">{picks.hint}</span>}
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-1.5">
              {picks.items.map((it, i) => (
                <CheckOption
                  key={`${i}-${it.label}`}
                  checked={picked.includes(i)}
                  onChange={() => togglePick(i)}
                  label={it.label}
                  detail={it.detail}
                />
              ))}
            </div>
          </section>
        )}

        {questions.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2.5 rounded-lg border border-accent-line bg-accent-weak p-3">
            <div className="col-span-full flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-accent-ink">{t.questions}</h3>
              <Tag>{t.optional}</Tag>
            </div>
            {questions.map((q, i) => (
              <TextField
                key={q}
                id={`ai-q-${i}`}
                label={q}
                value={answers[i] ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
              />
            ))}
          </div>
        )}
      </div>
    </Dialog>
  )
}
