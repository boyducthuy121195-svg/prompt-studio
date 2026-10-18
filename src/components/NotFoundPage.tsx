import { Link } from 'react-router'
import { PageHeader } from '@/components/Primitives'
import { vi } from '@/lib/i18n/vi'

export function NotFoundPage() {
  const t = vi.pages.notFound
  return (
    <>
      <PageHeader title={t.title} desc={t.desc} />
      <Link to="/projects" className="text-accent hover:underline">
        {t.back}
      </Link>
    </>
  )
}
