import { expect, test } from '@playwright/test'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test('chọn "Sửa lỗi", tích/bỏ tích gợi ý, gõ nhiệm vụ rồi Copy', async ({ page }) => {
  await page.goto('/prompt')
  await page.getByRole('link', { name: 'Sửa lỗi', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Sửa lỗi', level: 1 })).toBeVisible()

  const preview = page.getByLabel('Xem trước prompt')
  const rb01 = page.getByRole('checkbox', { name: /Chỉ làm đúng yêu cầu/ })
  await expect(rb01).toBeChecked()
  await rb01.uncheck()
  await expect(preview).not.toContainText('Chỉ thay đổi những gì được yêu cầu')

  await page.getByRole('textbox', { name: /^Nhiệm vụ/ }).fill('khi bấm lưu thì màn hình trắng')
  await expect(preview).toContainText('Sửa lỗi: khi bấm lưu thì màn hình trắng')

  await page.keyboard.press('Control+Enter')
  await expect(page.getByRole('status')).toContainText('Đã copy')
  const clip = await page.evaluate(() => navigator.clipboard.readText())
  expect(clip).toContain('# Nhiệm vụ\nSửa lỗi: khi bấm lưu thì màn hình trắng')
})
