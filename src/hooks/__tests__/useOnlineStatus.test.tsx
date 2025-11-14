import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../useOnlineStatus';

// Mock do useToast
const mockToast = vi.fn();
vi.mock('../use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset navigator.onLine para true
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('should return online status initially', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);
  });

  it('should show toast when going offline', () => {
    const { rerender } = renderHook(() => useOnlineStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    rerender();

    expect(mockToast).toHaveBeenCalledWith({
      title: '⚠️ Sem conexão',
      description: 'Você está offline. Algumas funcionalidades podem não funcionar.',
      variant: 'destructive',
    });
  });

  it('should show toast when coming back online', () => {
    // Começar offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { rerender } = renderHook(() => useOnlineStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    rerender();

    expect(mockToast).toHaveBeenCalledWith({
      title: '✅ Conexão restaurada',
      description: 'Você está online novamente',
    });
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});
