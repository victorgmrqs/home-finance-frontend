import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sessionRecovery } from '../sessionRecovery';
import type { Usuario } from '@/types/usuario';

const mockUser: Usuario = {
  id: 1,
  nome: 'Test User',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock fetch
global.fetch = vi.fn();

describe('sessionRecovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recoverSession', () => {
    it('should recover session successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUser }),
      } as Response);

      const result = await sessionRecovery.recoverSession();

      expect(result).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('should return null on 401 Unauthorized', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      const result = await sessionRecovery.recoverSession();

      expect(result).toBeNull();
    });

    it('should return null on other HTTP errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await sessionRecovery.recoverSession();

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await sessionRecovery.recoverSession();

      expect(result).toBeNull();
    });

    it('should return null for invalid user data', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 0, nome: '' } }),
      } as Response);

      const result = await sessionRecovery.recoverSession();

      expect(result).toBeNull();
    });

    it('should return null when user data is missing', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      } as Response);

      const result = await sessionRecovery.recoverSession();

      expect(result).toBeNull();
    });
  });

  describe('validateSession', () => {
    it('should return true for valid session', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUser }),
      } as Response);

      const result = await sessionRecovery.validateSession();

      expect(result).toBe(true);
    });

    it('should return false for invalid session', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      const result = await sessionRecovery.validateSession();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await sessionRecovery.validateSession();

      expect(result).toBe(false);
    });
  });
});
