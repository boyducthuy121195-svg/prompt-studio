import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('hiển thị tên app', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Prompt Studio' })).toBeInTheDocument()
  })
})
