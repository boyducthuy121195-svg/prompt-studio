import Markdown from 'react-markdown'

/** Xem trước Markdown giống trên GitHub. react-markdown không chạy HTML lạ nên an toàn với nội dung từ AI. */
export function MarkdownPreview({ source }: { source: string }) {
  return (
    <div className="prose-ps max-h-[60vh] overflow-auto rounded-md border border-border bg-surface p-3.5 text-[13px] leading-relaxed">
      <Markdown>{source}</Markdown>
    </div>
  )
}
