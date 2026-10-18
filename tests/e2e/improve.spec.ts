import { expect, test } from '@playwright/test'

test('Cải thiện: tải file lên, chưa có key thì được hướng dẫn vào Cài đặt', async ({ page }) => {
  await page.goto('/improve')
  await page.getByLabel('Tải file lên (.md, .txt)').setInputFiles({
    name: 'AGENTS.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# Quy tắc\nViết code sạch.'),
  })
  await expect(page.getByLabel('Nội dung', { exact: true })).toHaveValue(
    '# Quy tắc\nViết code sạch.',
  )
  await expect(page.getByLabel('Loại nội dung')).toHaveValue('agents')
  await page.getByRole('button', { name: '✨ Phân tích bằng AI' }).click()
  await page
    .getByRole('alert')
    .getByRole('link', { name: /Cài đặt/ })
    .click()
  await expect(page).toHaveURL(/\/settings$/)
})
