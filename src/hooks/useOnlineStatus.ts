/**
 * useOnlineStatus Hook
 * Monitora o status de conexão e exibe toast quando offline
 */

import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const { toast } = useToast();

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      toast({
        title: '✅ Conexão restaurada',
        description: 'Você está online novamente',
      });
    }

    function handleOffline() {
      setIsOnline(false);
      toast({
        title: '⚠️ Sem conexão',
        description: 'Você está offline. Algumas funcionalidades podem não funcionar.',
        variant: 'destructive',
      });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return isOnline;
}
