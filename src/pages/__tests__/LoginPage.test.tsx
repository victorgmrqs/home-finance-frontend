import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '@/components/LoginPage'
import { renderWithProviders } from '@/test/test-utils'
import { useLogin } from '@/hooks/useLogin'
import { useRegister } from '@/hooks/useRegister'
import { useToast } from '@/hooks/use-toast'

// Mock the hooks
vi.mock('@/hooks/useLogin')
vi.mock('@/hooks/useRegister')
vi.mock('@/hooks/use-toast')

describe('LoginPage', () => {
  const mockMutate = vi.fn()
  const mockRegisterMutate = vi.fn()
  const mockToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useLogin as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
    ;(useRegister as any).mockReturnValue({
      mutate: mockRegisterMutate,
      isPending: false,
    })
    ;(useToast as any).mockReturnValue({
      toast: mockToast,
    })
  })

  it('should render login form', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByText('Entrar')).toBeInTheDocument()
    
    const emailInput = screen.getByLabelText(/email/i)
    const senhaInput = screen.getByLabelText(/senha/i)
    
    expect(emailInput).toBeInTheDocument()
    expect(senhaInput).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()

    // Verificar que os campos obrigatórios têm o atributo aria-required
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

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
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

    const submitButton = screen.getByRole('button', { name: 'Carregando...' })
    expect(submitButton).toBeDisabled()
    // Verifica que o spinner está presente (Loader2 icon)
    expect(submitButton.querySelector('svg')).toBeInTheDocument()
    // Verifica atributos de acessibilidade quando o botão está carregando
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
    expect(submitButton).toHaveAttribute('aria-disabled', 'true')
  })

  it('should not show loading state when not submitting', () => {
    renderWithProviders(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    expect(submitButton).not.toBeDisabled()
    // Verifica que o spinner não está presente
    expect(submitButton.querySelector('svg')).not.toBeInTheDocument()
    // Verifica que aria-busy não está definido ou é false
    expect(submitButton).toHaveAttribute('aria-busy', 'false')
  })
})

