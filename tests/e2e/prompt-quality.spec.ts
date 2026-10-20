import { expect, test } from '@playwright/test'

test('task 16: thanh độ hoàn thiện, ô "Khi trống / lỗi / đang tải", prompt có cổng duyệt và báo cáo trung thực', async ({
  page,
}) => {
  await page.goto('/prompt/TINH_NANG')
  await expect(page.getByRole('heading', { name: 'Xây tính năng mới', level: 1 })).toBeVisible()

  const meter = page.getByRole('progressbar', { name: 'Độ hoàn thiện' })
  await expect(meter).toHaveAttribute('aria-valuenow', '0')
  await expect(page.getByText(/Còn thiếu: Nhiệm vụ, .*Khi trống \/ lỗi \/ đang tải/)).toBeVisible()

  await page.getByRole('textbox', { name: /^Nhiệm vụ/ }).fill('Thêm nút xuất file CSV')
  await page
    .getByRole('textbox', { name: /Khi trống \/ lỗi \/ đang tải/ })
    .fill('Chưa có dữ liệu thì nút bị mờ và có chú thích')
  await expect(meter).not.toHaveAttribute('aria-valuenow', '0')
  await expect(page.getByText(/Còn thiếu:/)).not.toContainText('Nhiệm vụ,')

  const preview = page.getByLabel('Xem trước prompt')
  await expect(preview).toContainText('Chưa có dữ liệu thì nút bị mờ')
  await expect(preview).toContainText('Dừng lại chờ tôi trả lời "Đồng ý"')
  await expect(preview).toContainText('không giả vờ đã đọc')
})
