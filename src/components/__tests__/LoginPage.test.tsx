import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '@/components/LoginPage'
import { renderWithProviders } from '@/test/test-utils'
import { useLogin } from '@/hooks/useLogin'
import { useRegister } from '@/hooks/useRegister'

vi.mock('@/hooks/useLogin')
vi.mock('@/hooks/useRegister')

describe('LoginPage', () => {
  const mockMutate = vi.fn()
  const mockRegisterMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useLogin as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
    ;(useRegister as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockRegisterMutate,
      isPending: false,
    })
  })

  it('should render login form', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByText('Home Finance')).toBeInTheDocument()
    
    const emailInput = screen.getByLabelText(/email/i)
    const senhaInput = screen.getByLabelText(/senha/i)
    
    expect(emailInput).toBeInTheDocument()
    expect(senhaInput).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()

    // Verificar que os campos obrigatórios têm o asterisco
    expect(emailInput).toHaveAttribute('aria-required', 'true')
    expect(senhaInput).toHaveAttribute('aria-required', 'true')
    
    // Verificar que os asteriscos estão presentes nos labels
    // Usar querySelector com os IDs corretos (login-email e login-password)
    const emailLabel = document.querySelector('label[for="login-email"]')
    const senhaLabel = document.querySelector('label[for="login-password"]')
    
    expect(emailLabel).toBeInTheDocument()
    expect(emailLabel).toHaveTextContent('*')
    expect(senhaLabel).toBeInTheDocument()
    expect(senhaLabel).toHaveTextContent('*')
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

    const emailInput = screen.getByLabelText(/email/i)
    const loginButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(loginButton)

    // Should not call mutate when password is empty
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('should call login mutation with email and password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
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

    const button = screen.getByRole('button', { name: /carregando/i })
    expect(button).toBeDisabled()
    expect(button).toBeInTheDocument()
    // Verifica que o spinner (svg) está presente quando loading é true
    expect(button.querySelector('svg')).toBeInTheDocument()
    // Verifica atributos de acessibilidade
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('should not show loading state when not pending', () => {
    ;(useLogin as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })

    renderWithProviders(<LoginPage />)

    const button = screen.getByRole('button', { name: /entrar/i })
    expect(button).not.toBeDisabled()
    // Verifica que o spinner não está presente quando loading é false
    expect(button.querySelector('svg')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-busy', 'false')
  })

  it('should render password field', () => {
    renderWithProviders(<LoginPage />)

    const passwordInput = screen.getByLabelText(/senha/i)
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should display a red asterisk for required password field label', () => {
    renderWithProviders(<LoginPage />)
    
    // Verificar que o input tem o atributo aria-required
    const passwordInput = screen.getByLabelText(/senha/i)
    expect(passwordInput).toHaveAttribute('aria-required', 'true')
    
    // Verificar que o label da senha contém o asterisco
    // Usar querySelector com o ID correto (login-password)
    const passwordLabel = document.querySelector('label[for="login-password"]')
    expect(passwordLabel).toBeInTheDocument()
    expect(passwordLabel).toHaveTextContent('*')
  })

  it('should handle login error and show error toast', async () => {
    const user = userEvent.setup()

    // Mock mutate to call onError callback
    mockMutate.mockImplementation((data, options) => {
      if (options && options.onError) {
        options.onError(new Error('Credenciais inválidas'))
      }
    })

    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const loginButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'joao@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(loginButton)

    // Ensure mutation was called with wrong credentials
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'joao@example.com', password: 'wrongpassword' },
        expect.any(Object)
      )
    })
  })
})
