/**
 * API Status Banner Component
 * Displays a warning banner when the API is down or circuit breaker is open
 */

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { CircuitBreakerStats } from '@/services/circuitBreaker';

export const ApiStatusBanner: React.FC = () => {
  const [circuitStats, setCircuitStats] = useState<CircuitBreakerStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to circuit breaker state changes
    const unsubscribe = api.circuitBreaker.subscribe((stats) => {
      setCircuitStats(stats);
      setIsVisible(stats.state === 'OPEN' || stats.state === 'HALF_OPEN');
    });

    // Check initial state
    const initialStats = api.circuitBreaker.getStats();
    setCircuitStats(initialStats);
    setIsVisible(initialStats.state === 'OPEN' || initialStats.state === 'HALF_OPEN');

    return unsubscribe;
  }, []);

  if (!isVisible || !circuitStats) {
    return null;
  }

  const getStatusMessage = () => {
    if (circuitStats.state === 'OPEN') {
      const secondsUntilRetry = circuitStats.nextAttemptTime
        ? Math.ceil((circuitStats.nextAttemptTime - Date.now()) / 1000)
        : 0;

      return {
        title: '⚠️ API Indisponível',
        message: `O servidor está temporariamente indisponível. Tentando reconectar em ${secondsUntilRetry}s. Dados em cache estão sendo exibidos.`,
        color: 'bg-red-50 border-red-200 text-red-800',
      };
    }

    if (circuitStats.state === 'HALF_OPEN') {
      return {
        title: '🔄 Reconectando...',
        message: 'Tentando restabelecer conexão com o servidor.',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      };
    }

    return null;
  };

  const status = getStatusMessage();
  if (!status) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 border-b ${status.color} px-4 py-3 shadow-md`}
      role="alert"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold">{status.title}</p>
            <p className="text-sm">{status.message}</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-xl font-bold opacity-60 hover:opacity-100"
          aria-label="Fechar banner"
        >
          ×
        </button>
      </div>
    </div>
  );
};
