import { expect, test } from '@playwright/test'

test('trang chủ chuyển tới trang Dự án', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Prompt Studio')
  await expect(page).toHaveURL(/\/projects$/)
  await expect(page.getByRole('heading', { name: 'Dự án', level: 1 })).toBeVisible()
})
