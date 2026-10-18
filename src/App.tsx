import { vi } from '@/lib/i18n/vi'

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-2xl font-bold">{vi.app.name}</h1>
      <p className="text-sm text-slate-600">{vi.app.tagline}</p>
      <p className="text-xs text-slate-500">{vi.app.scaffoldNote}</p>
    </main>
  )
}
