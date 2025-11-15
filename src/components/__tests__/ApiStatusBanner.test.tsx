import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiStatusBanner } from '../ApiStatusBanner';
import { api } from '@/services/api';

// Mock the api service
vi.mock('@/services/api', () => ({
  api: {
    circuitBreaker: {
      subscribe: vi.fn(),
      getStats: vi.fn(),
    },
  },
}));

describe('ApiStatusBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when circuit is CLOSED', () => {
    vi.mocked(api.circuitBreaker.getStats).mockReturnValue({
      state: 'CLOSED',
      failures: 0,
      successes: 0,
      lastFailureTime: null,
      nextAttemptTime: null,
    });
    vi.mocked(api.circuitBreaker.subscribe).mockReturnValue(() => {});

    const { container } = render(<ApiStatusBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should render warning banner when circuit is OPEN', () => {
    const nextAttemptTime = Date.now() + 30000; // 30 seconds from now

    vi.mocked(api.circuitBreaker.getStats).mockReturnValue({
      state: 'OPEN',
      failures: 3,
      successes: 0,
      lastFailureTime: Date.now(),
      nextAttemptTime,
    });
    vi.mocked(api.circuitBreaker.subscribe).mockReturnValue(() => {});

    render(<ApiStatusBanner />);

    expect(screen.getByText('⚠️ API Indisponível')).toBeInTheDocument();
    expect(screen.getByText(/servidor está temporariamente indisponível/)).toBeInTheDocument();
  });

  it('should render reconnecting banner when circuit is HALF_OPEN', () => {
    vi.mocked(api.circuitBreaker.getStats).mockReturnValue({
      state: 'HALF_OPEN',
      failures: 0,
      successes: 1,
      lastFailureTime: Date.now(),
      nextAttemptTime: null,
    });
    vi.mocked(api.circuitBreaker.subscribe).mockReturnValue(() => {});

    render(<ApiStatusBanner />);

    expect(screen.getByText('🔄 Reconectando...')).toBeInTheDocument();
    expect(screen.getByText(/Tentando restabelecer conexão/)).toBeInTheDocument();
  });

  it('should close banner when close button is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(api.circuitBreaker.getStats).mockReturnValue({
      state: 'OPEN',
      failures: 3,
      successes: 0,
      lastFailureTime: Date.now(),
      nextAttemptTime: Date.now() + 30000,
    });
    vi.mocked(api.circuitBreaker.subscribe).mockReturnValue(() => {});

    render(<ApiStatusBanner />);

    const closeButton = screen.getByLabelText('Fechar banner');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('⚠️ API Indisponível')).not.toBeInTheDocument();
    });
  });

  it('should subscribe to circuit breaker state changes', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(api.circuitBreaker.subscribe).mockReturnValue(mockUnsubscribe);
    vi.mocked(api.circuitBreaker.getStats).mockReturnValue({
      state: 'CLOSED',
      failures: 0,
      successes: 0,
      lastFailureTime: null,
      nextAttemptTime: null,
    });

    const { unmount } = render(<ApiStatusBanner />);

    expect(api.circuitBreaker.subscribe).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should update banner when circuit state changes', async () => {
    let listener: ((stats: any) => void) | null = null;

    vi.mocked(api.circuitBreaker.subscribe).mockImplementation((callback) => {
      listener = callback;
      return () => {};
    });

    vi.mocked(api.circuitBreaker.getStats).mockReturnValue({
      state: 'CLOSED',
      failures: 0,
      successes: 0,
      lastFailureTime: null,
      nextAttemptTime: null,
    });

    render(<ApiStatusBanner />);

    // Initially closed, no banner
    expect(screen.queryByText('⚠️ API Indisponível')).not.toBeInTheDocument();

    // Simulate circuit opening
    if (listener) {
      act(() => {
        listener!({
          state: 'OPEN',
          failures: 3,
          successes: 0,
          lastFailureTime: Date.now(),
          nextAttemptTime: Date.now() + 30000,
        });
      });
    }

    // Banner should now appear
    await waitFor(() => {
      expect(screen.getByText('⚠️ API Indisponível')).toBeInTheDocument();
    });
  });
});
