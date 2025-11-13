/**
 * User Error Boundary
 * Catches errors in UserContext and provides recovery mechanisms
 */

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class UserErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorCount: 0, // Reset errorCount after recovery or retry
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('User context error:', error, errorInfo);

    // Increment error count
    this.setState(prev => ({
      errorCount: prev.errorCount + 1,
    }));

    // If too many errors, clear all user data and force reload
    if (this.state.errorCount >= 3) {
      this.handleCriticalError();
    }
  }

  handleCriticalError = () => {
    console.error('Critical error in user context, clearing all data');

    // Clear all storage
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }

    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }

    // Reload page
    window.location.href = '/login';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleClearAndRetry = () => {
    // Clear user data
    try {
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }

    this.setState({
      hasError: false,
      error: null,
      errorCount: 0,
    });

    // Redirect to login
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Erro no Sistema de Autenticação
              </h1>
              <p className="text-gray-600 mb-6">
                Ocorreu um erro ao carregar suas informações de usuário.
              </p>

              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-left">
                  <p className="text-sm font-mono text-red-800">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  Tentar Novamente
                </Button>

                <Button
                  onClick={this.handleClearAndRetry}
                  className="w-full"
                  variant="outline"
                >
                  Limpar Dados e Fazer Login Novamente
                </Button>

                {this.state.errorCount >= 2 && (
                  <Button
                    onClick={this.handleCriticalError}
                    className="w-full"
                    variant="destructive"
                  >
                    Resetar Aplicação
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-6">
                Tentativa {this.state.errorCount} de 3
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
