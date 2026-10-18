/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, strictPort: true },
  // Chuẩn bị sẵn thư viện lớn khi khởi động, tránh việc Vite tự tải lại trang lần đầu mở một màn hình
  optimizeDeps: {
    include: [
      '@uiw/react-codemirror',
      '@codemirror/lang-markdown',
      'react-markdown',
      'diff',
      'fflate',
      'dexie',
      'zod',
      '@anthropic-ai/sdk',
      '@anthropic-ai/sdk/helpers/beta/zod',
      '@google/genai',
      '@radix-ui/react-dialog',
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
