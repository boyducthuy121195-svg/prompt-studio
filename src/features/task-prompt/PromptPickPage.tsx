import { Link, useNavigate } from 'react-router'
import { Button, PageHeader, Panel, PanelHeader } from '@/components/Primitives'
import { useCurrentProject } from '@/lib/db/hooks'
import { vi } from '@/lib/i18n/vi'
import { phaseLabel } from '@/lib/phases'
import { getPromptType, PROMPT_GROUPS, promptTypesByGroup } from '@/lib/prompts/prompt-types'
import { STANDARD_PHASES } from '@/lib/prompts/standard-process'

const t = vi.builder

/** M3 – chọn loại prompt theo 5 nhóm, kèm gợi ý loại hợp với giai đoạn hiện tại của dự án. */
export function PromptPickPage() {
  const current = useCurrentProject()
  const navigate = useNavigate()
  const project = current.status === 'ready' ? current.data : null
  const suggested = project ? STANDARD_PHASES[project.currentPhase]?.prompt?.typeCode : undefined

  return (
    <>
      <PageHeader title={vi.pages.prompt.title} desc={vi.pages.prompt.desc} />

      {project && suggested && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-accent-line bg-accent-weak px-3.5 py-2 text-accent-ink">
          <span className="flex-[1_1_300px]">
            {t.suggestTitle(
              project.name,
              phaseLabel(project.currentPhase),
              getPromptType(suggested).name,
            )}
          </span>
          <Button size="sm" variant="primary" onClick={() => navigate(`/prompt/${suggested}`)}>
            {t.useSuggested}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] items-start gap-3.5">
        {PROMPT_GROUPS.map((g) => (
          <Panel key={g.key}>
            <PanelHeader>
              <h2 className="text-sm font-semibold">{g.name}</h2>
            </PanelHeader>
            <ul>
              {promptTypesByGroup(g.key).map((type) => (
                <li
                  key={type.code}
                  className="border-b border-border px-3 py-2 last:border-b-0 hover:bg-hover"
                >
                  <Link
                    to={`/prompt/${type.code}`}
                    className="font-semibold text-accent hover:underline"
                  >
                    {type.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">{type.desc}</p>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  )
}
