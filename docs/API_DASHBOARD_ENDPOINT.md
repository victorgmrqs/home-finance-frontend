# 📊 Endpoint de Agregação do Dashboard

## Visão Geral

Este documento descreve o novo endpoint de agregação do dashboard que elimina o padrão N+1 queries, melhorando drasticamente a performance da página inicial.

## Motivação

**Antes:** O dashboard fazia 1 chamada inicial + N chamadas adicionais (uma para cada painel), resultando em **11 API calls para 10 painéis**.

**Depois:** Com o novo endpoint, apenas **2 API calls** são necessárias (1 para o dashboard summary + 1 para painéis).

**Melhoria:** ~82% de redução nas chamadas de API (de 11 para 2).

## Endpoint

### `GET /dashboard/summary`

Retorna dados agregados do dashboard em uma única requisição.

#### Parâmetros de Query

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `mes` | string | Não | Filtro por mês no formato YYYY-MM (ex: 2024-01) |
| `usuario_id` | number | Não | Filtro por usuário específico |

#### Exemplo de Requisição

```bash
GET /api/v1/dashboard/summary?mes=2024-01
```

#### Exemplo de Resposta

```json
{
  "code": "SUCCESS",
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "total_entradas_familia": 5000.00,
    "total_saidas_familia": 3000.00,
    "saldo_familia": 2000.00,
    "gastos_por_painel": [
      {
        "painel_id": 1,
        "painel_nome": "Cartão Principal",
        "painel_descricao": "Cartão de crédito principal",
        "painel_tipo_conta": "CARTAO_CREDITO",
        "painel_usuario_id": 1,
        "total_entradas": 3000.00,
        "total_saidas": 2000.00,
        "saldo": 1000.00,
        "total_pessoal": 1500.00,
        "total_compartilhado": 500.00,
        "valor_a_pagar": 1750.00
      }
    ],
    "gastos_por_usuario": [
      {
        "usuario_id": 1,
        "usuario_nome": "João",
        "total_gasto_pessoal": 1500.00,
        "total_gasto_compartilhado": 500.00,
        "total_a_pagar": 1750.00
      }
    ],
    "quantidade_transacoes": 10,
    "quantidade_compartilhadas": 2
  }
}
```

## Estrutura de Dados

### `DashboardSummary`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `total_entradas_familia` | number | Total de entradas de toda a família |
| `total_saidas_familia` | number | Total de saídas de toda a família |
| `saldo_familia` | number | Saldo total (entradas - saídas) |
| `gastos_por_painel` | Array | Gastos detalhados por painel/cartão |
| `gastos_por_usuario` | Array | Gastos detalhados por usuário |
| `quantidade_transacoes` | number | Número total de transações |
| `quantidade_compartilhadas` | number | Número de transações compartilhadas |

### `GastoPorPainel`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `painel_id` | number | ID do painel |
| `painel_nome` | string | Nome do painel |
| `painel_descricao` | string | Descrição do painel |
| `painel_tipo_conta` | string | Tipo de conta (CARTAO_CREDITO, CONTA_BANCARIA, DINHEIRO) |
| `painel_usuario_id` | number | ID do usuário dono do painel |
| `total_entradas` | number | Total de entradas no painel |
| `total_saidas` | number | Total de saídas no painel |
| `saldo` | number | Saldo do painel |
| `total_pessoal` | number | Total de gastos pessoais |
| `total_compartilhado` | number | Total de gastos compartilhados |
| `valor_a_pagar` | number | Valor a pagar considerando divisão |

### `GastoPorUsuario`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `usuario_id` | number | ID do usuário |
| `usuario_nome` | string | Nome do usuário |
| `total_gasto_pessoal` | number | Total de gastos pessoais |
| `total_gasto_compartilhado` | number | Total de gastos compartilhados |
| `total_a_pagar` | number | Valor total a pagar (pessoal + metade dos compartilhados) |

## Implementação Backend

O backend deve implementar:

1. **Agregação SQL com GROUP BY** para calcular totais por painel e por usuário
2. **Cálculos de divisão no servidor** para gastos compartilhados
3. **Otimização com joins** para evitar múltiplas queries

### Exemplo de Query SQL

```sql
-- Totais por painel
SELECT
  p.id as painel_id,
  p.nome as painel_nome,
  p.descricao as painel_descricao,
  p.tipo_conta as painel_tipo_conta,
  p.usuario_id as painel_usuario_id,
  SUM(CASE WHEN t.tipo = 'ENTRADA' THEN t.valor ELSE 0 END) as total_entradas,
  SUM(CASE WHEN t.tipo = 'SAIDA' THEN t.valor ELSE 0 END) as total_saidas,
  SUM(CASE WHEN t.tipo = 'ENTRADA' THEN t.valor ELSE -t.valor END) as saldo,
  SUM(CASE WHEN t.tipo_divisao = 'PESSOAL' OR t.tipo_divisao IS NULL THEN t.valor ELSE 0 END) as total_pessoal,
  SUM(CASE WHEN t.tipo_divisao <> 'PESSOAL' AND t.tipo_divisao IS NOT NULL THEN t.valor ELSE 0 END) as total_compartilhado,
  SUM(
    CASE
      WHEN t.tipo_divisao = 'PESSOAL' OR t.tipo_divisao IS NULL THEN t.valor
      ELSE COALESCE(t.valor_por_pessoa, t.valor / 2)
    END
  ) as valor_a_pagar
FROM paineis p
LEFT JOIN transactions t ON t.painel_id = p.id
WHERE (t.data >= ? OR t.data IS NULL)
  AND (t.data < ? OR t.data IS NULL)
GROUP BY p.id, p.nome, p.descricao, p.tipo_conta, p.usuario_id
```

## Uso no Frontend

```typescript
import { useDashboardData } from '@/hooks/useDashboardData';

function Dashboard() {
  const { data, isLoading } = useDashboardData({ mes: '2024-01' });

  if (isLoading) return <Loading />;

  return (
    <div>
      <h1>Total Família: R$ {data.saldo_familia.toFixed(2)}</h1>

      {data.gastos_por_painel.map(gasto => (
        <Card key={gasto.painel.id}>
          <h2>{gasto.painel.nome}</h2>
          <p>Saldo: R$ {gasto.saldo.toFixed(2)}</p>
        </Card>
      ))}
    </div>
  );
}
```

## Impacto de Performance

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| API Calls | 11 | 2 | 82% ↓ |
| Tempo de carregamento* | ~2s | ~0.2s | 90% ↓ |
| Dados trafegados* | ~500KB | ~100KB | 80% ↓ |

*Valores estimados baseados em 10 painéis com ~50 transações cada.

## Testes

### Testes Unitários

```bash
npm test -- src/hooks/__tests__/useDashboardData.test.tsx
```

### Testes de Integração

Verificar:
- [ ] Endpoint retorna dados agregados corretos
- [ ] Cálculos de divisão estão corretos
- [ ] Filtros por mês funcionam
- [ ] Filtros por usuário funcionam
- [ ] Performance é melhor que a abordagem N+1

## Checklist de Implementação Backend

- [ ] Criar rota `GET /dashboard/summary`
- [ ] Implementar agregação SQL com GROUP BY
- [ ] Implementar cálculos de divisão no servidor
- [ ] Adicionar suporte a filtros (mes, usuario_id)
- [ ] Criar testes unitários para o controller
- [ ] Criar testes de integração para o endpoint
- [ ] Adicionar documentação no Swagger/OpenAPI
- [ ] Testar performance com dados reais
- [ ] Validar cálculos de divisão compartilhada

## Referências

- [Issue #5 - Eliminar N+1 queries no dashboard](../tasks/sprint-01/task-005.md)
- [Backend Gaps Analysis](./frontend-deep-discovery/04-coupling/backend-gaps-2025-11-07-09:48:13.md)
