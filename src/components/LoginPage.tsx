import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLogin } from '@/hooks/useLogin';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um email',
        variant: 'destructive',
      });
      return;
    }

    login({ email }, {
      onSuccess: (data) => {
        toast({
          title: 'Sucesso!',
          description: `Bem-vindo, ${data.nome}!`,
        });
        navigate('/dashboard');
      },
      onError: (error) => {
        toast({
          title: 'Erro no login',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Home Finance</CardTitle>
          <CardDescription className="text-center">
            Entre com seu email para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Usuários de teste:</p>
            <ul className="mt-2 space-y-1">
              <li className="cursor-pointer hover:text-foreground" onClick={() => setEmail('joao@example.com')}>
                João Silva (joao@example.com)
              </li>
              <li className="cursor-pointer hover:text-foreground" onClick={() => setEmail('maria@example.com')}>
                Maria Silva (maria@example.com)
              </li>
              <li className="cursor-pointer hover:text-foreground" onClick={() => setEmail('carlos@example.com')}>
                Carlos Souza (carlos@example.com)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
