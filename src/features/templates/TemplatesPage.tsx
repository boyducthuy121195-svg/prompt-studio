import { Button, PageHeader, Panel, PanelHeader, Tag } from '@/components/Primitives'
import { vi } from '@/lib/i18n/vi'

const t = vi.templates

/** M11 – trang giữ chỗ cho module Điền mẫu Word/Excel (giai đoạn 2). Các nút chưa hoạt động. */
export function TemplatesPage() {
  return (
    <>
      <PageHeader title={t.title} desc={t.desc} aside={<Tag tone="warn">{t.badge}</Tag>} />

      <div className="rounded-lg border border-accent-line bg-accent-weak px-3.5 py-2 text-accent-ink">
        {t.notice}
      </div>

      <Panel>
        <PanelHeader>
          <h2 className="text-sm font-semibold">{t.stepsTitle}</h2>
        </PanelHeader>
        <ol className="grid grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))]">
          {t.steps.map((step, i) => (
            <li
              key={step.title}
              className="flex flex-col gap-1 border-r border-border px-3.5 py-3 last:border-r-0"
            >
              <span className="flex size-[22px] items-center justify-center rounded-full border border-accent-line bg-accent-weak text-[11.5px] font-bold text-accent-ink">
                {i + 1}
              </span>
              <span className="font-semibold">{step.title}</span>
              <span className="text-xs leading-relaxed text-muted">{step.desc}</span>
            </li>
          ))}
        </ol>
      </Panel>

      <div className="flex flex-wrap items-start gap-3.5">
        <Panel className="min-w-0 flex-[1_1_320px]">
          <PanelHeader>
            <h2 className="text-sm font-semibold">{t.uploadTitle}</h2>
          </PanelHeader>
          <div className="flex flex-col gap-3 p-3.5">
            <div className="rounded-lg border-[1.5px] border-dashed border-border px-4 py-7 text-center leading-relaxed text-muted">
              {t.uploadHint}
              <br />
              {t.uploadPrivacy}
            </div>
            <Button disabled className="self-start">
              {t.chooseFile}
            </Button>
          </div>
        </Panel>

        <Panel className="min-w-0 flex-[2_1_460px]">
          <PanelHeader>
            <h2 className="flex-1 text-sm font-semibold">{t.varsTitle}</h2>
            <Tag>{t.example}</Tag>
            <Button variant="ai" size="sm" disabled>
              {t.aiFind}
            </Button>
          </PanelHeader>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {t.varsCols.map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap border-b border-border bg-soft px-3 py-2 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.vars.map((v) => (
                  <tr key={v.name} className="border-b border-border last:border-b-0">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{v.name}</td>
                    <td className="px-3 py-2 text-muted">{v.where}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <Tag>{v.kind}</Tag>
                    </td>
                    <td className="px-3 py-2">{v.sample}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader>
          <h2 className="flex-1 text-sm font-semibold">{t.savedTitle}</h2>
          <Button variant="primary" size="sm" disabled>
            {t.newTemplate}
          </Button>
        </PanelHeader>
        <p className="p-6 text-center text-muted">{t.noSaved}</p>
      </Panel>
    </>
  )
}
