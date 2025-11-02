/**
 * PainelContext
 * Context for managing painéis (panels) state
 * Currently a simple provider wrapper for compatibility with tests
 */

import React, { createContext, useContext, ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type PainelContextType = Record<string, never>;

const PainelContext = createContext<PainelContextType | undefined>(undefined);

export function PainelProvider({ children }: { children: ReactNode }) {
  // For now, just provide an empty context value
  // This can be expanded later if needed
  const value: PainelContextType = {} as PainelContextType;

  return (
    <PainelContext.Provider value={value}>
      {children}
    </PainelContext.Provider>
  );
}

export function usePainelContext() {
  const context = useContext(PainelContext);
  if (context === undefined) {
    throw new Error('usePainelContext must be used within a PainelProvider');
  }
  return context;
}

