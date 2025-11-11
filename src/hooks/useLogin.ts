import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useUser } from '@/contexts/UserContext';

export function useLogin() {
  const { login } = useUser();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.auth.login({
        email: data.email,
        password: data.password,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data?.user) {
        login(data.user);
      }
    },
  });
}
