/**
 * Retry Helper
 * Utilities for retry logic with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/**
 * Calcula o delay para o próximo retry usando exponential backoff
 */
export function calculateRetryDelay(attempt: number, baseDelay = 1000, maxDelay = 30000): number {
  const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
  // Adiciona jitter (variação aleatória) para evitar thundering herd
  const jitter = Math.random() * 0.3 * delay; // 30% de variação
  return delay + jitter;
}

/**
 * Determina se um erro deve ser retried
 */
export function shouldRetryError(error: unknown): boolean {
  // Retry em erros de rede
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Retry em timeouts
  if (error instanceof Error && error.message.includes('timeout')) {
    return true;
  }

  // Retry em erros baseados em status HTTP
  if (error && typeof error === 'object' && 'status' in error) {
    const { status } = error as { status: number };

    // Retry em erros 5xx (server errors)
    if (status >= 500 && status < 600) {
      return true;
    }

    // Retry em erros 408 (Request Timeout) e 429 (Too Many Requests)
    if (status === 408 || status === 429) {
      return true;
    }
  }

  return false;
}

/**
 * Executa uma função com retry automático
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = shouldRetryError,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Se é a última tentativa ou não deve fazer retry, lança o erro
      if (attempt === maxRetries - 1 || !shouldRetry(error, attempt)) {
        throw error;
      }

      // Calcula o delay e aguarda antes de retry
      const delay = calculateRetryDelay(attempt, baseDelay, maxDelay);
      if (import.meta.env.DEV) {
        console.warn(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`,
          error
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Verifica se o navegador está online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Aguarda o navegador ficar online
 */
export function waitForOnline(timeout = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timer = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timer);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };

    window.addEventListener('online', onlineHandler);
  });
}
