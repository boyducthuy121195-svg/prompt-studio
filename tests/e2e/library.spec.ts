import { expect, test } from '@playwright/test'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test('ghim prompt có biến, bấm trên thanh bên, điền rồi copy; tải lại vẫn còn ghim', async ({
  page,
}) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Ghim Gặp lỗi' }).click()
  await expect(page.getByRole('status')).toHaveText('Đã ghim lên thanh bên')

  await page.reload()
  const aside = page.getByRole('complementary')
  await aside.getByRole('button', { name: 'Điền nhanh rồi copy: Gặp lỗi' }).click()
  const dialog = page.getByRole('dialog', { name: 'Điền nhanh: Gặp lỗi' })
  await dialog.getByLabel('Thao tac').fill('bấm Lưu')
  await dialog.getByLabel('Hien tuong').fill('màn hình trắng')
  await page.keyboard.press('Control+Enter')
  await expect(page.getByRole('status')).toContainText('Đã copy "Gặp lỗi"')
  const clip = await page.evaluate(() => navigator.clipboard.readText())
  expect(clip).toContain('Khi tôi bấm Lưu thì thấy màn hình trắng. Mong muốn là [ket_qua_dung].')
})

test('lưu prompt từ bảng nhập rồi thấy trong Thư viện › Dùng chung', async ({ page }) => {
  await page.goto('/prompt/TU_DO')
  await page.getByRole('textbox', { name: /^Nhiệm vụ/ }).fill('viết README')
  await page.keyboard.press('Control+s')
  await page
    .getByRole('dialog', { name: 'Lưu vào thư viện' })
    .getByRole('button', { name: 'Lưu' })
    .click()
  await expect(page.getByRole('status')).toContainText('vào Thư viện')
  await page.goto('/library?tab=shared')
  await expect(page.getByText('Prompt tự do: viết README')).toBeVisible()
})
