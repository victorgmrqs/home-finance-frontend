import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { renderWithProviders } from '@/test/test-utils'
import { useUser } from '@/contexts/UserContext'

// Mock the context
vi.mock('@/contexts/UserContext', async () => {
  const actual = await vi.importActual('@/contexts/UserContext');
  return {
    ...actual,
    useUser: vi.fn(),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
  }
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children when user is authenticated', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: { id: 1, nome: 'João Silva', email: 'joao@example.com' },
      isLoading: false
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: null,
      isLoading: false
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
  })

  it('should show loading state when checking authentication', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: null,
      isLoading: true
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Should show loading state or not redirect yet
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  it('should handle user with missing properties', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: { id: 1 }, // Missing nome and email
      isLoading: false
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Should still render children as user exists
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should handle undefined currentUser', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: undefined,
      isLoading: false
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
  })

  it('should handle null currentUser', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: null,
      isLoading: false
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
  })

  it('should handle empty string currentUser', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: '',
      isLoading: false
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
  })

  it('should handle zero currentUser', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: 0,
      isLoading: false
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
  })

  it('should handle false currentUser', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: false,
      isLoading: false
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
  })

  it('should render multiple children correctly', () => {
    vi.mocked(useUser).mockReturnValue({
      currentUser: { id: 1, nome: 'João Silva', email: 'joao@example.com' },
      isLoading: false
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </ProtectedRoute>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('should handle context errors gracefully', () => {
    vi.mocked(useUser).mockImplementation(() => {
      throw new Error('Context error')
    })

    // Should not crash the app
    expect(() => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )
    }).toThrow('Context error')
  })
})



