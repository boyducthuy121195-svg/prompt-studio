import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { strFromU8, unzipSync } from 'fflate'
import { fakeClaude, setFakeKey } from './fake-claude.ts'

// 3 luồng chính trong docs/05-MAN-HINH-VA-LUONG.md mục 3. AI được giả lập, không gọi API thật.

test('Luồng 1 – dự án mới → điền hồ sơ → AGENTS.md bằng Hỏi đáp → tải về', async ({ page }) => {
  const sent = await fakeClaude(page, [
    {
      sections: [
        { key: 'overview', content: 'Trang bán hàng nhỏ cho cửa hàng gia đình.' },
        { key: 'commands', content: '- Chạy: `npm run dev`\n- Test: `npm test`' },
      ],
    },
  ])
  await setFakeKey(page)

  await page.goto('/projects')
  await page.getByRole('button', { name: 'Dự án mới' }).first().click()
  await page.getByRole('dialog').getByLabel('Tên dự án').fill('Web bán hàng')
  await page.getByRole('dialog').getByRole('button', { name: 'Tạo dự án' }).click()
  await expect(page.getByRole('heading', { name: 'Web bán hàng', level: 1 })).toBeVisible()
  await page.getByLabel('Công nghệ (tech stack)').fill('Next.js')
  await page.getByRole('button', { name: /Lưu hồ sơ/ }).click()
  await expect(page.getByRole('status')).toHaveText('Đã lưu hồ sơ dự án')

  await page
    .getByRole('navigation', { name: 'Điều hướng chính' })
    .getByRole('link', { name: 'AGENTS.md' })
    .click()
  await page.getByRole('button', { name: 'Hỏi đáp' }).click()
  await page.getByRole('checkbox', { name: 'MVP' }).check()
  for (let i = 0; i < 9; i++) await page.getByRole('button', { name: 'Tiếp' }).click()
  await page.getByRole('button', { name: '✨ Tạo AGENTS.md bằng AI' }).click()
  await expect(page.getByRole('status')).toContainText('AI đã viết xong AGENTS.md')
  await expect(page.locator('.cm-content')).toContainText('Trang bán hàng nhỏ')
  expect(sent[0].prompt).toContain('Tech stack: Next.js')

  await page.keyboard.press('Control+s')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Tải gói .zip/ }).click()
  const files = unzipSync(new Uint8Array(readFileSync(await (await downloadPromise).path())))
  const md = strFromU8(files['AGENTS.md'])
  expect(md).toContain('# AGENTS.md – Web bán hàng')
  expect(md).toContain('- Test: `npm test`')
})

test('Luồng 2 – chọn "Sửa lỗi" → điền → ✨ Trau chuốt → Chấp nhận → Copy', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const sent = await fakeClaude(page, [
    {
      improved:
        '# Vai trò\nBạn là Senior Full-stack Developer.\n\n# Nhiệm vụ\nSửa lỗi blank screen khi bấm Lưu.',
      changes: ['Chuẩn hóa thuật ngữ "màn hình trắng" → blank screen'],
      questions: [],
      additions: [
        {
          block: 'Tiêu chí hoàn thành',
          text: 'Viết test tái hiện lỗi trước khi sửa',
          reason: 'Đúng quy trình sửa lỗi',
        },
      ],
    },
  ])
  await setFakeKey(page)
  await page.goto('/prompt')
  await page
    .getByRole('link', { name: /Sửa lỗi/ })
    .first()
    .click()
  await page.getByRole('textbox', { name: /^Nhiệm vụ/ }).fill('bấm Lưu thì màn hình trắng')
  await page.getByRole('button', { name: '✨ Trau chuốt toàn bộ' }).click()

  const dialog = page.getByRole('dialog', { name: '✨ Trau chuốt toàn bộ prompt' })
  await expect(dialog.getByText('Chuẩn hóa thuật ngữ')).toBeVisible()
  await dialog.getByRole('checkbox', { name: /Viết test tái hiện lỗi/ }).check()
  await dialog.getByRole('button', { name: 'Chấp nhận thay đổi' }).click()
  expect(sent[0].prompt).toContain('<loai_prompt>\nLoại: Sửa lỗi')

  const preview = page.getByLabel('Xem trước prompt')
  await expect(preview).toContainText('Sửa lỗi blank screen khi bấm Lưu.')
  await expect(preview).toContainText('- [ ] Viết test tái hiện lỗi trước khi sửa')
  await expect(dialog).toBeHidden()
  await page.keyboard.press('Control+Enter')
  await expect(page.getByRole('status')).toHaveText('Đã copy. Dán vào công cụ lập trình của bạn.')
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toContain('Sửa lỗi blank screen khi bấm Lưu.')
})
