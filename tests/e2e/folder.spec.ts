import { expect, test, type Page } from '@playwright/test'

/**
 * Hộp chọn thư mục của Windows không tự động hóa được. Thay bằng "thư mục riêng của trang" (OPFS) của Chromium:
 * cũng là FileSystemDirectoryHandle thật, cất được vào IndexedDB, ghi file thật.
 * Thư mục sẽ được "chọn" lấy theo `window.__pick`.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __pick: string
      showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>
    }
    w.__pick = 'du-lieu'
    w.showDirectoryPicker = async () =>
      (await navigator.storage.getDirectory()).getDirectoryHandle(w.__pick, { create: true })
  })
})

const pickNext = (page: Page, name: string) =>
  page.evaluate((n) => void ((window as unknown as { __pick: string }).__pick = n), name)

/** Mọi file trong một thư mục OPFS: { "du-an/x/ho-so.md": "…" }. */
function readFolder(page: Page, name: string): Promise<Record<string, string>> {
  return page.evaluate(async (folder) => {
    type Dir = FileSystemDirectoryHandle & {
      entries(): AsyncIterable<[string, FileSystemHandle]>
    }
    const out: Record<string, string> = {}
    const walk = async (dir: Dir, prefix: string) => {
      for await (const [n, h] of dir.entries()) {
        if (h.kind === 'file')
          out[prefix + n] = await (await (h as FileSystemFileHandle).getFile()).text()
        else await walk(h as Dir, `${prefix}${n}/`)
      }
    }
    const root = await navigator.storage.getDirectory()
    await walk((await root.getDirectoryHandle(folder, { create: true })) as Dir, '')
    return out
  }, name)
}

async function newProject(page: Page, name: string) {
  await page.goto('/projects')
  await page.getByRole('button', { name: 'Dự án mới' }).first().click()
  await page.getByRole('dialog').getByLabel('Tên dự án').fill(name)
  await page.getByRole('dialog').getByRole('button', { name: 'Tạo dự án' }).click()
  await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible()
}

test('chọn thư mục: tự ghi sau mỗi lần sửa, không có API key, tải lại vẫn nhớ thư mục', async ({
  page,
}) => {
  await newProject(page, 'Web bán hàng')
  await page.goto('/settings')
  await page.getByLabel('API key Claude (Anthropic)').fill('sk-ant-khong-duoc-ghi')
  await page.getByRole('button', { name: 'Chọn thư mục lưu dữ liệu…' }).click()
  await expect(page.getByText('Thư mục: du-lieu')).toBeVisible()
  await expect(page.getByText(/Đã ghi tự động/)).toBeVisible()

  let files = await readFolder(page, 'du-lieu')
  expect(Object.keys(files)).toEqual(
    expect.arrayContaining([
      'README.md',
      'du-lieu-prompt-studio.json',
      'du-an/web-ban-hang/ho-so.md',
    ]),
  )
  expect(JSON.stringify(files)).not.toContain('sk-ant-khong-duoc-ghi')

  // Sửa hồ sơ → file ho-so.md được ghi lại
  await page.goto('/projects')
  await page.getByRole('link', { name: 'Web bán hàng', exact: true }).click()
  await page.getByLabel('Mục tiêu').fill('Bán hàng cho cửa hàng gia đình')
  await page.keyboard.press('Control+s')
  await expect
    .poll(async () => (await readFolder(page, 'du-lieu'))['du-an/web-ban-hang/ho-so.md'])
    .toContain('Bán hàng cho cửa hàng gia đình')

  await page.reload()
  await page.goto('/settings')
  await expect(page.getByText('Thư mục: du-lieu')).toBeVisible()
  files = await readFolder(page, 'du-lieu')
  expect(files['du-lieu-prompt-studio.json']).toContain('Web bán hàng')
})

test('xóa toàn bộ thì ngừng ghi; đổi máy thì "Nạp từ thư mục" lấy lại dữ liệu', async ({
  page,
}) => {
  await newProject(page, 'Dự án máy cũ')
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Chọn thư mục lưu dữ liệu…' }).click()
  await expect(page.getByText(/Đã ghi tự động/)).toBeVisible()

  await page.getByRole('button', { name: 'Xóa toàn bộ dữ liệu' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Tiếp tục' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa vĩnh viễn' }).click()
  await expect(page.getByRole('button', { name: 'Chọn thư mục lưu dữ liệu…' })).toBeVisible()
  // Thư mục vẫn giữ dữ liệu cũ
  expect((await readFolder(page, 'du-lieu'))['du-an/du-an-may-cu/ho-so.md']).toBeDefined()

  await page.getByRole('button', { name: 'Nạp từ thư mục…' }).click()
  const dialog = page.getByRole('dialog', { name: 'Nạp dữ liệu từ thư mục?' })
  await expect(dialog).toContainText('1 dự án · 0 prompt')
  await dialog.getByRole('button', { name: 'Nạp dữ liệu' }).click()
  await expect(page.getByText('Thư mục: du-lieu')).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Điều hướng chính' })
    .getByRole('link', { name: 'Dự án' })
    .click()
  await expect(page.getByRole('link', { name: 'Dự án máy cũ', exact: true })).toBeVisible()
})

test('thư mục code: ghi AGENTS.md + CLAUDE.md, giữ bản cũ thành AGENTS.backup-<ngày>.md', async ({
  page,
}) => {
  await newProject(page, 'Web bán hàng')
  // Thư mục code đã có AGENTS.md viết tay
  await page.evaluate(async () => {
    const dir = await (
      await navigator.storage.getDirectory()
    ).getDirectoryHandle('code', {
      create: true,
    })
    const w = await (await dir.getFileHandle('AGENTS.md', { create: true })).createWritable()
    await w.write('# Quy tắc viết tay\n')
    await w.close()
  })
  await pickNext(page, 'code')
  await page.getByRole('button', { name: 'Chọn thư mục code…' }).click()
  await expect(page.getByText('Thư mục: code')).toBeVisible()
  await expect(page.getByText(/Dự án chưa có AGENTS.md/)).toBeVisible()

  // Mở trang AGENTS.md (app tạo AGENTS.md từ khung chuẩn) → app tự ghi vào thư mục code
  await page
    .getByRole('navigation', { name: 'Điều hướng chính' })
    .getByRole('link', { name: 'AGENTS.md' })
    .click()
  await expect(page.getByText('10/10 đang bật')).toBeVisible()
  await expect
    .poll(async () => Object.keys(await readFolder(page, 'code')).sort())
    .toEqual(['AGENTS.backup-' + today() + '.md', 'AGENTS.md', 'CLAUDE.md'])
  const files = await readFolder(page, 'code')
  expect(files['AGENTS.md']).toContain('# AGENTS.md – Web bán hàng')
  expect(files['CLAUDE.md']).toBe('@AGENTS.md\n')
  expect(files[`AGENTS.backup-${today()}.md`]).toBe('# Quy tắc viết tay\n')
})

function today() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
