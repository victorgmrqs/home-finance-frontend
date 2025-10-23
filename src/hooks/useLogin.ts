import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useUser } from '@/contexts/UserContext';

export function useLogin() {
  const { login } = useUser();

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await api.usuarios.getByEmail(data.email);
      return response;
    },
    onSuccess: (data) => {
      if (data) {
        login(data);
      }
    },
  });
}
