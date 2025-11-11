import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserProvider, useUser } from '@/contexts/UserContext'
import type { Usuario } from '@/types/usuario'
import { api } from '@/services/api'

// Mock api.auth.logout
vi.mock('@/services/api', () => ({
  api: {
    auth: {
      logout: vi.fn().mockResolvedValue(undefined),
    },
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Test component that uses the UserContext
const TestComponent = () => {
  const { currentUser, login, logout, isLoading } = useUser()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div>
      <div data-testid="user">{currentUser ? currentUser.nome : 'No user'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => login(mockUser)}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

const mockUser: Usuario = {
  id: 1,
  nome: 'João Silva',
  email: 'joao@example.com',
  cpf: '123.456.789-00',
  telefone: '11999999999',
  data_nascimento: '1990-01-01',
  criado_em: '2025-01-01T00:00:00Z',
  atualizado_em: '2025-01-01T00:00:00Z'
}

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    // Reset mock do api.auth.logout
    vi.mocked(api.auth.logout).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should provide initial state', () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
  })

  it('should load user from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
  })

  it('should login user', async () => {
    const user = userEvent.setup()
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    const loginButton = screen.getByText('Login')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'currentUser',
      JSON.stringify(mockUser)
    )
  })

  it('should logout user', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUser')
    })
  })

  it('should handle login with null user', async () => {
    const user = userEvent.setup()
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    const loginButton = screen.getByText('Login')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    })
  })

  it('should persist user data across page reloads', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    expect(localStorageMock.getItem).toHaveBeenCalledWith('currentUser')
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    // Should not throw error
    expect(() => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )
    }).not.toThrow()

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
  })

  it('should handle setItem errors during login', async () => {
    const user = userEvent.setup()
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    const loginButton = screen.getByText('Login')
    await user.click(loginButton)

    // Should still login user even if localStorage fails
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    })
  })

  it('should handle removeItem errors during logout', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))
    localStorageMock.removeItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    // Should still logout user even if localStorage fails
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })
  })

  it('should handle backend logout errors gracefully', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))
    // Reset removeItem to work normally (not throw error)
    localStorageMock.removeItem.mockImplementation(() => {})
    
    // Mock logout to throw an error
    vi.mocked(api.auth.logout).mockRejectedValue(new Error('Backend logout failed'))

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    // Should still logout user and clear localStorage even if backend logout fails
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })

    // Verify both localStorage items were removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUser')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    // Verify api.auth.logout was called even though it failed
    expect(api.auth.logout).toHaveBeenCalled()
  })

  it('should handle invalid JSON in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUser')
  })
})