import { expect, test, type Page } from '@playwright/test'

async function createProject(page: Page, name: string, description = '') {
  await page.goto('/projects')
  await page.getByRole('button', { name: 'Dự án mới' }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Tạo dự án mới' })
  await dialog.getByLabel('Tên dự án').fill(name)
  if (description) await dialog.getByLabel('Mô tả ngắn').fill(description)
  await dialog.getByRole('button', { name: 'Tạo dự án' }).click()
  await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible()
}

test('tạo 2 dự án, sửa hồ sơ, tải lại trang dữ liệu vẫn còn', async ({ page }) => {
  await createProject(page, 'Prompt Studio', 'App tạo prompt')
  await page.getByLabel('Công nghệ (tech stack)').fill('React 19 + Vite')
  await page.getByRole('button', { name: /Lưu hồ sơ/ }).click()
  await expect(page.getByRole('status')).toHaveText('Đã lưu hồ sơ dự án')
  await page.getByRole('button', { name: /Kế hoạch/ }).click()
  await expect(page.getByRole('status')).toHaveText('Đã chuyển sang giai đoạn 5 · Kế hoạch')

  await createProject(page, 'Web bán hàng')

  await page.reload()
  await page.goto('/projects')
  const table = page.getByRole('table')
  await expect(table.getByRole('link', { name: 'Prompt Studio', exact: true })).toBeVisible()
  await expect(table.getByRole('link', { name: 'Web bán hàng', exact: true })).toBeVisible()
  await expect(table.getByText('5 · Kế hoạch')).toBeVisible()

  await table.getByRole('link', { name: 'Prompt Studio', exact: true }).click()
  await expect(page.getByLabel('Công nghệ (tech stack)')).toHaveValue('React 19 + Vite')
  await expect(page.locator('#project-select option:checked')).toHaveText('Prompt Studio')
})

test('nhân bản rồi xóa bản nhân bản', async ({ page }) => {
  await createProject(page, 'Gốc')
  await page.getByRole('button', { name: 'Nhân bản' }).click()
  await expect(page.getByRole('heading', { name: 'Gốc (bản sao)', level: 1 })).toBeVisible()

  await page.getByRole('button', { name: 'Xóa' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa vĩnh viễn' }).click()
  await expect(page).toHaveURL(/\/projects$/)
  const table = page.getByRole('table')
  await expect(table.getByRole('link', { name: 'Gốc', exact: true })).toBeVisible()
  await expect(table.getByRole('link', { name: 'Gốc (bản sao)' })).toHaveCount(0)
})
