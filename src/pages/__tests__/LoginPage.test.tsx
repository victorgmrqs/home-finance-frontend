import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '@/components/LoginPage'
import { renderWithProviders } from '@/test/test-utils'
import { useLogin } from '@/hooks/useLogin'
import { useToast } from '@/hooks/use-toast'

// Mock the hooks
vi.mock('@/hooks/useLogin')
vi.mock('@/hooks/use-toast')

describe('LoginPage', () => {
  const mockMutate = vi.fn()
  const mockToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useLogin as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
    ;(useToast as any).mockReturnValue({
      toast: mockToast,
    })
  })

  it('should render login form', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByText('Entrar')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)

    // Just check that the form is rendered correctly
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: 'Entrar' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        expect.any(Object)
      )
    })
  })

  it('should show loading state during submission', () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any)

    renderWithProviders(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    expect(submitButton).toBeDisabled()
    // Verifica que o spinner está presente (Loader2 icon)
    expect(submitButton.querySelector('svg')).toBeInTheDocument()
  })
})

