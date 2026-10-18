import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('mở trang Dự án khi vào địa chỉ gốc', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Dự án', level: 1 })).toBeInTheDocument()
  })
})
