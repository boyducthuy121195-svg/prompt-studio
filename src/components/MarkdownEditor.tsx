import { markdown } from '@codemirror/lang-markdown'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { useUiPrefs } from '@/app/ui-prefs-context'

const extensions = [markdown(), EditorView.lineWrapping]

/** Trình soạn Markdown (CodeMirror 6) có tô màu cú pháp, theo chế độ sáng/tối của app. */
export function MarkdownEditor({
  value,
  onChange,
  label,
  minHeight = '260px',
}: {
  value: string
  onChange: (v: string) => void
  label: string
  minHeight?: string
}) {
  const { theme } = useUiPrefs()
  return (
    <div className="overflow-hidden rounded-md border border-border text-[12.5px]">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={theme}
        extensions={extensions}
        minHeight={minHeight}
        maxHeight="60vh"
        basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }}
        aria-label={label}
      />
    </div>
  )
}
