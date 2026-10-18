import { expect, test } from '@playwright/test'

test('chỉ dùng bàn phím: Ctrl+K tìm prompt → Enter → điền biến → Ctrl+Enter copy', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/projects')
  await expect(page.getByRole('heading', { name: 'Dự án', level: 1 })).toBeVisible()
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('combobox', { name: 'Từ khóa tìm kiếm' })).toBeFocused()
  await page.keyboard.type('sua loi')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/prompt\/SUA_LOI$/)

  await page.keyboard.press('Control+k')
  await page.keyboard.type('ket thuc phien')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toContainText('Đã copy "Kết thúc phiên làm việc"')
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toContain('cập nhật PLAN.md và commit')
})
