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

  it('should call login mutation with email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const loginButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'joao@example.com')
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'joao@example.com' },
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

  it('should fill email when clicking test user', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const testUser = screen.getByText('João Silva (joao@example.com)')
    await user.click(testUser)

    expect(screen.getByLabelText('Email')).toHaveValue('joao@example.com')
  })
})
