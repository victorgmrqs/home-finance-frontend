import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario } from '@/types/usuario';

interface UserContextValue {
  currentUser: Usuario | null;
  login: (user: Usuario) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Carregar usuário salvo do localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          localStorage.removeItem('currentUser');
        }
      }
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
    }
    setIsLoading(false);
  }, []);

  const login = (user: Usuario) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar usuário no localStorage:', error);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Erro ao remover usuário do localStorage:', error);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, isLoading }}>
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
