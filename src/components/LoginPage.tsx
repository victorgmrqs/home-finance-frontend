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
  const [password, setPassword] = useState('');
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

    if (!password) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma senha',
        variant: 'destructive',
      });
      return;
    }

    login({ email, password }, {
      onSuccess: (data) => {
        toast({
          title: 'Sucesso!',
          description: `Bem-vindo, ${data.user.nome}!`,
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
            Entre com seu email e senha para acessar o sistema
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
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};
