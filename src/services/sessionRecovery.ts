/**
 * Session Recovery Service
 * Attempts to recover user session from backend using HttpOnly cookies
 */

import { api } from './api';
import type { Usuario } from '@/types/usuario';

export const sessionRecovery = {
  /**
   * Attempt to recover session from backend
   * Uses HttpOnly cookie for authentication
   */
  async recoverSession(): Promise<Usuario | null> {
    try {
      // Try to fetch current user from backend
      // This will work if we have a valid HttpOnly cookie
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Include HttpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // 401 means no valid session
        if (response.status === 401) {
          return null;
        }
        throw new Error(`Failed to recover session: ${response.status}`);
      }

      const result = await response.json();
      const user = result.data as Usuario;

      // Validate user data
      if (!user || !user.id || !user.nome) {
        console.warn('Invalid user data from session recovery');
        return null;
      }

      return user;
    } catch (error) {
      console.warn('Session recovery failed:', error);
      return null;
    }
  },

  /**
   * Check if session is still valid
   */
  async validateSession(): Promise<boolean> {
    try {
      const user = await this.recoverSession();
      return user !== null;
    } catch (error) {
      return false;
    }
  },
};
