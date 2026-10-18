import { Construction } from 'lucide-react'
import { PageHeader, Panel, Tag } from '@/components/Primitives'
import { vi } from '@/lib/i18n/vi'

/** Trang tạm cho những chức năng chưa xây – mỗi trang ghi rõ task sẽ làm. */
export function PlaceholderPage({
  title,
  desc,
  soon,
}: {
  title: string
  desc: string
  soon: string
}) {
  return (
    <>
      <PageHeader title={title} desc={desc} aside={<Tag>{vi.common.comingSoonBadge}</Tag>} />
      <Panel className="flex flex-col items-center gap-2 px-4 py-12 text-center text-muted">
        <Construction className="size-6" aria-hidden="true" />
        <p>{soon}</p>
      </Panel>
    </>
  )
}
