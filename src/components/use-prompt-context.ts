import { createContext, useContext } from 'react'
import type { LibraryItem } from '@/lib/library'

/** Dùng một prompt: không có biến thì copy ngay, có biến thì mở hộp "Điền nhanh". */
export type UsePrompt = (item: LibraryItem) => void

export const UsePromptContext = createContext<UsePrompt | null>(null)

export function useUsePrompt(): UsePrompt {
  const ctx = useContext(UsePromptContext)
  if (!ctx) throw new Error('useUsePrompt phải nằm trong UsePromptProvider')
  return ctx
}
