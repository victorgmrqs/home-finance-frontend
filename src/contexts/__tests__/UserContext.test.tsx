import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserProvider, useUser } from '@/contexts/UserContext'
import type { Usuario } from '@/types/usuario'
import { api } from '@/services/api'

// Mock userStorage
vi.mock('@/services/userStorage', () => ({
  userStorage: {
    loadUser: vi.fn().mockResolvedValue(null),
    saveUser: vi.fn().mockResolvedValue(undefined),
    removeUser: vi.fn().mockResolvedValue(undefined),
    validateUser: vi.fn().mockReturnValue(true),
  },
}))

// Mock sessionRecovery
vi.mock('@/services/sessionRecovery', () => ({
  sessionRecovery: {
    recoverSession: vi.fn().mockResolvedValue(null),
    validateSession: vi.fn().mockResolvedValue(false),
  },
}))

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
  const { currentUser, login, logout, isLoading, error } = useUser()

  const handleLogin = async () => {
    try {
      await login(mockUser)
    } catch (error) {
      // Error is logged in context
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div>
      <div data-testid="user">{currentUser ? currentUser.nome : 'No user'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{error ? error.message : 'No error'}</div>
      <button onClick={handleLogin}>Login</button>
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

  it('should provide initial state', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })
    expect(screen.getByTestId('user')).toHaveTextContent('No user')
  })

  it('should load user from storage on mount', async () => {
    const { userStorage } = await import('@/services/userStorage')
    vi.mocked(userStorage.loadUser).mockResolvedValueOnce(mockUser)

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    })
  })

  it('should login user', async () => {
    const { userStorage } = await import('@/services/userStorage')
    const user = userEvent.setup()

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })

    const loginButton = screen.getByText('Login')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    })

    expect(userStorage.saveUser).toHaveBeenCalledWith(mockUser)
  })

  it('should logout user', async () => {
    const { userStorage } = await import('@/services/userStorage')
    const user = userEvent.setup()

    vi.mocked(userStorage.loadUser).mockResolvedValueOnce(mockUser)

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    })

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })

    expect(api.auth.logout).toHaveBeenCalled()
    expect(userStorage.removeUser).toHaveBeenCalled()
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

  it('should persist user data across page reloads', async () => {
    const { userStorage } = await import('@/services/userStorage')
    vi.mocked(userStorage.loadUser).mockResolvedValueOnce(mockUser)

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    })

    expect(userStorage.loadUser).toHaveBeenCalled()
  })

  it('should handle storage errors gracefully', async () => {
    const { userStorage } = await import('@/services/userStorage')
    vi.mocked(userStorage.loadUser).mockRejectedValueOnce(new Error('Storage error'))

    // Should not throw error
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })
  })

  it('should handle save errors during login', async () => {
    const { userStorage } = await import('@/services/userStorage')
    const user = userEvent.setup()

    vi.mocked(userStorage.saveUser).mockRejectedValueOnce(new Error('Save error'))

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })

    const loginButton = screen.getByText('Login')

    // Click should trigger error but not crash
    await user.click(loginButton)

    // Wait for error state to be set
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Save error')
    })

    // User should still be "No user" because save failed
    expect(screen.getByTestId('user')).toHaveTextContent('No user')
  })

  it('should handle remove errors during logout', async () => {
    const { userStorage } = await import('@/services/userStorage')
    const user = userEvent.setup()

    vi.mocked(userStorage.loadUser).mockResolvedValueOnce(mockUser)
    vi.mocked(userStorage.removeUser).mockRejectedValueOnce(new Error('Remove error'))

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    })

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    // Should still logout user even if storage removal fails
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })

    // Note: logout does not set error state - it logs to console but continues gracefully
  })

  it('should handle backend logout errors gracefully', async () => {
    const { userStorage } = await import('@/services/userStorage')
    const user = userEvent.setup()

    vi.mocked(userStorage.loadUser).mockResolvedValueOnce(mockUser)
    vi.mocked(api.auth.logout).mockRejectedValueOnce(new Error('Backend logout failed'))

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.nome)
    })

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })

    expect(userStorage.removeUser).toHaveBeenCalled()
    expect(api.auth.logout).toHaveBeenCalled()
  })
})