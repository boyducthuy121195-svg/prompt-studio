import { expect, test } from '@playwright/test'

const TABS = [
  { link: 'Dự án', heading: 'Dự án', path: '/projects' },
  { link: 'Tạo prompt', heading: 'Tạo prompt', path: '/prompt' },
  { link: 'AGENTS.md', heading: 'AGENTS.md', path: '/agents' },
  { link: 'Cải thiện', heading: 'Cải thiện', path: '/improve' },
  { link: 'Thư viện', heading: 'Thư viện', path: '/library' },
  { link: 'Mẫu Word/Excel', heading: 'Điền mẫu Word / Excel', path: '/templates' },
  { link: 'Cài đặt', heading: 'Cài đặt', path: '/settings' },
]

test('bấm qua tất cả các tab', async ({ page }) => {
  await page.goto('/projects')
  const nav = page.getByRole('navigation', { name: 'Điều hướng chính' })
  for (const tab of TABS) {
    await nav.getByRole('link', { name: new RegExp(`^${tab.link}`) }).click()
    await expect(page).toHaveURL(new RegExp(`${tab.path}$`))
    await expect(page.getByRole('heading', { name: tab.heading, level: 1 })).toBeVisible()
  }
})

test('thu gọn thanh bên bằng nút và Ctrl+B', async ({ page }) => {
  await page.goto('/projects')
  const aside = page.getByRole('complementary')
  await page.getByRole('button', { name: 'Thu gọn thanh bên' }).click()
  await expect(aside).toHaveAttribute('data-collapsed', 'true')
  await expect(aside.getByText('Thư viện', { exact: true })).toBeHidden()
  await page.keyboard.press('Control+b')
  await expect(aside).toHaveAttribute('data-collapsed', 'false')
  await expect(aside.getByText('Thư viện', { exact: true })).toBeVisible()
})

test('chế độ tối được giữ sau khi tải lại trang', async ({ page }) => {
  await page.goto('/projects')
  await page.getByRole('button', { name: 'Chuyển sang giao diện tối' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('màn hình 360px không bị tràn ngang', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  for (const path of ['/projects', '/templates']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, `trang ${path} tràn ngang ${overflow}px`).toBeLessThanOrEqual(0)
  }
})
