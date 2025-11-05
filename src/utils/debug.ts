/**
 * Debug Utilities
 * Funções auxiliares para debugging e diagnóstico
 */

export const debug = {
  log: (component: string, message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.log(`[${component}] ${message}`, data !== undefined ? data : '');
    }
  },

  error: (component: string, message: string, error?: unknown) => {
    if (import.meta.env.DEV) {
      console.error(`[${component}] ❌ ${message}`, error !== undefined ? error : '');
    }
  },

  warn: (component: string, message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.warn(`[${component}] ⚠️ ${message}`, data !== undefined ? data : '');
    }
  },

  success: (component: string, message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.log(`[${component}] ✅ ${message}`, data !== undefined ? data : '');
    }
  },

  group: (label: string, fn: () => void) => {
    if (import.meta.env.DEV) {
      console.group(label);
      try {
        fn();
      } finally {
        console.groupEnd();
      }
    }
  },
};
