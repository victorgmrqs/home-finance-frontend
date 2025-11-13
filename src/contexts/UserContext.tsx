import { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import type { Usuario } from '@/types/usuario';
import { api } from '@/services/api';
import { userStorage } from '@/services/userStorage';
import { sessionRecovery } from '@/services/sessionRecovery';

interface UserContextValue {
  currentUser: Usuario | null;
  login: (user: Usuario) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadUser();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Load user with fallback chain:
   * 1. localStorage
   * 2. IndexedDB
   * 3. Session recovery from API
   */
  const loadUser = async () => {
    try {
      if (isMountedRef.current) {
        setIsLoading(true);
        setError(null);
      }

      // Try storage (localStorage → IndexedDB)
      let user = await userStorage.loadUser();

      // If no stored user, try session recovery
      if (!user) {
        user = await sessionRecovery.recoverSession();
        if (user) {
          // Save recovered session to storage
          await userStorage.saveUser(user);
        }
      }

      if (isMountedRef.current) {
        setCurrentUser(user);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load user');
      if (isMountedRef.current) {
        setError(error);
        // Don't throw - gracefully degrade to logged out state
        setCurrentUser(null);
      }
      console.error('Error loading user:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const login = async (user: Usuario) => {
    try {
      setError(null);

      // Validate user data
      if (!userStorage.validateUser(user)) {
        throw new Error('Invalid user data');
      }

      // Save to storage first (both localStorage and IndexedDB)
      await userStorage.saveUser(user);

      // Only set current user if save succeeded
      setCurrentUser(user);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save user');
      setError(error);
      console.error('Error during login:', error);
      // Don't set currentUser if save failed
      setCurrentUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setCurrentUser(null);

      // Call backend logout to clear HttpOnly cookies
      await api.auth.logout();
    } catch (error) {
      console.error('Error during backend logout:', error);
      // Continue even if backend logout fails
    }

    try {
      // Remove from all storage
      await userStorage.removeUser();
    } catch (error) {
      console.error('Error removing user from storage:', error);
    }
  };

  const contextValue = useMemo(
    () => ({ currentUser, login, logout, isLoading, error }),
    [currentUser, isLoading, error]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};
