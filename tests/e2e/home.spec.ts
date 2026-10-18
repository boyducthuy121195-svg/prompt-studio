import { expect, test } from '@playwright/test'

test('trang chủ hiển thị tên app', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Prompt Studio')
  await expect(page.getByRole('heading', { name: 'Prompt Studio' })).toBeVisible()
})
