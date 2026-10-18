import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { strFromU8, unzipSync } from 'fflate'

test('soạn AGENTS.md bằng CodeMirror, lưu, tải lại vẫn còn; tải gói .zip đủ 3 file', async ({
  page,
}) => {
  await page.goto('/projects')
  await page.getByRole('button', { name: 'Dự án mới' }).first().click()
  await page.getByRole('dialog').getByLabel('Tên dự án').fill('Web bán hàng')
  await page.getByRole('dialog').getByRole('button', { name: 'Tạo dự án' }).click()
  await expect(page.getByRole('heading', { name: 'Web bán hàng', level: 1 })).toBeVisible()

  await page
    .getByRole('navigation', { name: 'Điều hướng chính' })
    .getByRole('link', { name: 'AGENTS.md' })
    .click()
  await expect(page.getByText('10/10 đang bật')).toBeVisible()

  const editor = page.locator('.cm-content')
  await editor.click()
  await page.keyboard.press('Control+a')
  await page.keyboard.type('Trang bán hàng nhỏ cho cửa hàng gia đình.')
  await page.getByRole('checkbox', { name: 'Tắt mục Bẫy thường gặp' }).uncheck()
  await page.keyboard.press('Control+s')
  await expect(page.getByRole('status')).toHaveText('Đã lưu AGENTS.md')

  await page.reload()
  await expect(page.locator('.cm-content')).toContainText(
    'Trang bán hàng nhỏ cho cửa hàng gia đình.',
  )
  await expect(page.getByText('9/10 đang bật')).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Tải gói .zip/ }).click()
  const download = await downloadPromise
  const files = unzipSync(new Uint8Array(readFileSync(await download.path())))
  expect(Object.keys(files).sort()).toEqual(['.gemini/settings.json', 'AGENTS.md', 'CLAUDE.md'])
  const md = strFromU8(files['AGENTS.md'])
  expect(md).toContain('# AGENTS.md – Web bán hàng')
  expect(md).toContain('Trang bán hàng nhỏ cho cửa hàng gia đình.')
  expect(md).not.toContain('Bẫy thường gặp')
})
