import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '@/components/LoginPage'
import { renderWithProviders } from '@/test/test-utils'
import { useLogin } from '@/hooks/useLogin'

vi.mock('@/hooks/useLogin')

describe('LoginPage', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useLogin as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  it('should render login form', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByText('Home Finance')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('should not call mutation with empty email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const loginButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(loginButton)

    // Should not call mutate when email is empty
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('should not call mutation with empty password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const loginButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(loginButton)

    // Should not call mutate when password is empty
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('should call login mutation with email and password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Senha')
    const loginButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'joao@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'joao@example.com', password: 'password123' },
        expect.any(Object)
      )
    })
  })

  it('should show loading state', () => {
    ;(useLogin as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    })

    renderWithProviders(<LoginPage />)

    expect(screen.getByText('Entrando...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
  })

  it('should render password field', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })
})
