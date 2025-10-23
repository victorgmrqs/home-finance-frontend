import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, CreditCard } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { getTipoContaIcon } from '@/components/TipoContaIcon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Navigation } from './Navigation';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [mes, setMes] = useState(format(new Date(), 'yyyy-MM'));

  const { data: dashboardData, isLoading } = useDashboardData({ mes });

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-header-bg shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-header-text">Home Finance</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Navigation />
          <Skeleton className="h-96 w-full mt-8" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-header-bg shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-header-text">Home Finance</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Navigation />

        <div className="space-y-6 mt-8">
          {/* Header com filtro de período */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Dashboard Familiar</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Visão consolidada de todos os cartões e gastos
              </p>
            </div>
            <Input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-[150px]"
            />
          </div>

          {/* Cards de resumo familiar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">Entradas Totais</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  R$ {dashboardData.total_entradas_familia.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Toda a família
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">Saídas Totais</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  R$ {dashboardData.total_saidas_familia.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.quantidade_transacoes} transações
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">Saldo Familiar</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${dashboardData.saldo_familia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {dashboardData.saldo_familia.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.quantidade_compartilhadas} gastos compartilhados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gastos por usuário */}
          {dashboardData.gastos_por_usuario.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gastos por Pessoa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.gastos_por_usuario.map(usuario => (
                  <Card key={usuario.usuario_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{usuario.usuario_nome}</CardTitle>
                      <CardDescription>Total a pagar neste período</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gastos pessoais:</span>
                        <span className="font-medium">R$ {usuario.total_gasto_pessoal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Compartilhados:</span>
                        <span className="font-medium">R$ {usuario.total_gasto_compartilhado.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">Você paga:</span>
                          <span className="text-xl font-bold text-primary">
                            R$ {usuario.total_a_pagar.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Gastos por cartão */}
          {dashboardData.gastos_por_painel.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Gastos por Cartão
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.gastos_por_painel.map(({ painel, total_entradas, total_saidas, saldo, total_pessoal, total_compartilhado, valor_a_pagar }) => (
                  <Card key={painel.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">{getTipoContaIcon(painel.tipo_conta)}</span>
                        {painel.nome}
                      </CardTitle>
                      <CardDescription>{painel.descricao || 'Sem descrição'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Entradas:</span>
                        <span className="font-medium text-green-600">+R$ {total_entradas.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Saídas:</span>
                        <span className="font-medium text-red-600">-R$ {total_saidas.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pessoal:</span>
                        <span>R$ {total_pessoal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Compartilhado:</span>
                        <span>R$ {total_compartilhado.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">Saldo:</span>
                          <span className={`text-lg font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {saldo.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Botão para ver todas as transações */}
          <div className="flex justify-center mt-8">
            <Button onClick={() => navigate('/')} size="lg">
              Ver Todas as Transações
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
