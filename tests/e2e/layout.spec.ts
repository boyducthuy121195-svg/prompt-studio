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

const ALL_PAGES = [
  '/projects',
  '/prompt',
  '/prompt/SUA_LOI',
  '/agents',
  '/improve',
  '/library',
  '/templates',
  '/settings',
]

for (const width of [360, 1440]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`mọi trang ở ${width}px, giao diện ${theme === 'dark' ? 'tối' : 'sáng'}: không tràn ngang`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/projects')
      if (theme === 'dark') {
        await page.getByRole('button', { name: 'Chuyển sang giao diện tối' }).click()
        await expect(page.locator('html')).toHaveClass(/dark/)
      }
      // Có một dự án để các trang AGENTS.md / chi tiết dự án có nội dung thật
      await page.getByRole('button', { name: 'Dự án mới' }).first().click()
      await page
        .getByRole('dialog')
        .getByLabel('Tên dự án')
        .fill('Dự án có tên rất dài để thử xuống dòng')
      await page.getByRole('dialog').getByRole('button', { name: 'Tạo dự án' }).click()
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      for (const path of [...ALL_PAGES, page.url().replace(/^.*localhost:5173/, '')]) {
        await page.goto(path)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, `trang ${path} tràn ngang ${overflow}px`).toBeLessThanOrEqual(0)
      }
    })
  }
}

test('bảo mật: trình duyệt chặn kết nối tới máy chủ lạ, chỉ cho Anthropic và Google', async ({
  page,
}) => {
  await page.goto('/projects')
  const blocked = await page.evaluate(async () => {
    try {
      await fetch('https://example.com/thu-gui-du-lieu', { method: 'POST', body: 'x' })
      return false
    } catch {
      return true
    }
  })
  expect(blocked).toBe(true)
  const csp = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute('content')
  expect(csp).toContain('connect-src')
  expect(csp).toContain('https://api.anthropic.com')
  expect(csp).toContain('https://generativelanguage.googleapis.com')
})
