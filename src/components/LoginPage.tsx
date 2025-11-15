import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RequiredIndicator } from '@/components/ui/required-indicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLogin } from '@/hooks/useLogin';
import { useRegister } from '@/hooks/useRegister';

export const LoginPage = () => {
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações client-side
    if (registerName.trim().length < 2) {
      toast({
        title: 'Erro',
        description: 'Nome deve ter pelo menos 2 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      toast({
        title: 'Erro',
        description: 'Email inválido',
        variant: 'destructive',
      });
      return;
    }

    if (registerPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'Senha deve ter pelo menos 8 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    register(
      {
        email: registerEmail,
        password: registerPassword,
        name: registerName
      },
      {
        onSuccess: (data) => {
          toast({
            title: 'Sucesso!',
            description: `Bem-vindo, ${data.user.nome}!`,
          });
          navigate('/dashboard');
        },
        onError: (error: any) => {
          // Tratamento específico por status
          const message = error.status === 409
            ? 'Este email já está cadastrado'
            : error.message || 'Erro ao criar conta. Tente novamente.';

          toast({
            title: 'Erro no cadastro',
            description: message,
            variant: 'destructive',
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Home Finance</CardTitle>
          <CardDescription className="text-center">
            Gerencie suas finanças de forma simples e eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email <RequiredIndicator /></Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoginPending}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha <RequiredIndicator /></Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoginPending}
                    required
                    aria-required="true"
                  />
                </div>
                <Button type="submit" className="w-full" loading={isLoginPending}>
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome <RequiredIndicator /></Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={isRegisterPending}
                    required
                    aria-required="true"
                    minLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email <RequiredIndicator /></Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={isRegisterPending}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha <RequiredIndicator /></Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={isRegisterPending}
                    required
                    aria-required="true"
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmar Senha <RequiredIndicator /></Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    disabled={isRegisterPending}
                    required
                    aria-required="true"
                  />
                </div>
                <Button type="submit" className="w-full" loading={isRegisterPending}>
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
