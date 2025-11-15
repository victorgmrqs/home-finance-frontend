import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useUser } from '@/contexts/UserContext';

export function useRegister() {
  const { login } = useUser();

  return useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      return await api.auth.register({
        email: data.email,
        password: data.password,
        name: data.name,
      });
    },
    onSuccess: async (data) => {
      if (data?.user) {
        await login(data.user);
      }
    },
  });
}
