import type { Page } from '@playwright/test'

/**
 * Chặn mọi yêu cầu gửi tới api.anthropic.com và trả lời bằng dữ liệu giả, theo thứ tự.
 * Không bao giờ gọi API thật khi kiểm thử (AGENTS.md mục 6). Trả về danh sách nội dung đã gửi đi.
 */
export async function fakeClaude(page: Page, replies: unknown[]) {
  const sent: { system: string; prompt: string }[] = []
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'POST, GET, OPTIONS',
  }
  await page.route('https://api.anthropic.com/**', async (route) => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    const body = req.postDataJSON() as { system?: string; messages?: { content: string }[] }
    sent.push({ system: body.system ?? '', prompt: body.messages?.[0]?.content ?? '' })
    const reply = replies[Math.min(sent.length - 1, replies.length - 1)]
    await route.fulfill({
      status: 200,
      headers: { ...cors, 'content-type': 'application/json' },
      body: JSON.stringify({
        id: `msg_fake_${sent.length}`,
        type: 'message',
        role: 'assistant',
        model: 'claude-opus-5-5',
        content: [{ type: 'text', text: JSON.stringify(reply) }],
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 10 },
      }),
    })
  })
  return sent
}

/** Nhập một API key giả (không phải key thật) để app cho phép bấm ✨. */
export async function setFakeKey(page: Page) {
  await page.goto('/settings')
  await page.getByLabel('API key Claude (Anthropic)').pressSequentially('sk-ant-gia-lap')
  await page.getByText('AI: Claude · opus-5-5').waitFor()
}
