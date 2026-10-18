import { expect, test } from '@playwright/test'

test('nhập API key, tải lại vẫn còn; header hiện AI đang dùng', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.getByText('AI: chưa cài đặt')).toBeVisible()
  const key = page.getByLabel('API key Claude (Anthropic)')
  await key.pressSequentially('sk-ant-thu-nghiem-123')
  await expect(page.getByText('AI: Claude · opus-5-5')).toBeVisible()
  await page.getByLabel('Model Claude').selectOption('claude-haiku-5-5')
  await page.reload()
  await expect(page.getByLabel('API key Claude (Anthropic)')).toHaveValue('sk-ant-thu-nghiem-123')
  await expect(page.getByLabel('API key Claude (Anthropic)')).toHaveAttribute('type', 'password')
  await expect(page.getByText('AI: Claude · haiku-5-5')).toBeVisible()
})
