import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

test('sao lưu, xóa toàn bộ, khôi phục: dữ liệu quay lại đủ', async ({ page }) => {
  await page.goto('/projects')
  await page.getByRole('button', { name: 'Dự án mới' }).first().click()
  await page.getByRole('dialog').getByLabel('Tên dự án').fill('Web bán hàng')
  await page.getByRole('dialog').getByRole('button', { name: 'Tạo dự án' }).click()
  await expect(page.getByRole('heading', { name: 'Web bán hàng', level: 1 })).toBeVisible()

  await page.goto('/settings')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Tải file sao lưu/ }).click()
  const download = await downloadPromise
  const text = readFileSync(await download.path(), 'utf8')
  expect(JSON.parse(text).data.projects).toHaveLength(1)
  await expect(page.getByText(/Lần sao lưu gần nhất: Vừa xong/)).toBeVisible()

  await page.getByRole('button', { name: 'Xóa toàn bộ dữ liệu' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Tiếp tục' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa vĩnh viễn' }).click()
  await expect(page.getByText('Đã xóa toàn bộ dữ liệu')).toBeVisible()

  await page.getByLabel('Chọn file sao lưu').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(text),
  })
  await expect(page.getByRole('dialog')).toContainText('1 dự án · 0 prompt')
  await page.getByRole('dialog').getByRole('button', { name: 'Khôi phục' }).click()
  await page
    .getByRole('navigation', { name: 'Điều hướng chính' })
    .getByRole('link', { name: 'Dự án' })
    .click()
  await expect(page.getByRole('link', { name: 'Web bán hàng', exact: true })).toBeVisible()
})

test('nhập file hỏng thì thấy thông báo lỗi dễ hiểu', async ({ page }) => {
  await page.goto('/settings')
  await page.getByLabel('Chọn file sao lưu').setInputFiles({
    name: 'hong.json',
    mimeType: 'application/json',
    buffer: Buffer.from('không phải json'),
  })
  await expect(page.getByRole('alert')).toContainText('không phải file sao lưu')
})
