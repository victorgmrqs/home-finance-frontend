# Circuit Breaker Pattern

## 📋 Visão Geral

O Circuit Breaker é um padrão de design que previne que falhas em cascata afetem toda a aplicação. Ele monitora falhas na comunicação com a API e fornece mecanismos de fallback automático.

## 🎯 Objetivo

- Melhorar a resiliência da aplicação durante falhas de rede
- Fornecer fallback automático usando dados em cache
- Notificar usuários quando a API está indisponível
- Prevenir sobrecarga da API com requisições durante falhas

## 🔧 Componentes

### 1. Circuit Breaker (`src/services/circuitBreaker.ts`)

Implementação do padrão Circuit Breaker com três estados:

#### Estados do Circuit Breaker

- **CLOSED** (Fechado): Estado normal, todas as requisições são executadas
- **OPEN** (Aberto): Muitas falhas detectadas, requisições são bloqueadas imediatamente
- **HALF_OPEN** (Meio-aberto): Estado de teste após timeout, permite algumas requisições para verificar se o serviço recuperou

#### Configuração

```typescript
{
  failureThreshold: 3,        // Número de falhas para abrir o circuito
  successThreshold: 2,        // Sucessos necessários para fechar do estado HALF_OPEN
  timeout: 30000,            // Tempo (ms) antes de tentar HALF_OPEN
  monitoringPeriod: 60000    // Janela de tempo para contar falhas
}
```

#### Fluxo de Estados

```
CLOSED --[3 falhas]--> OPEN --[30s timeout]--> HALF_OPEN
                                                     |
                        [falha] <--------------------+----> [2 sucessos]
                           |                              |
                           v                              v
                         OPEN                          CLOSED
```

### 2. API Cache (`src/services/apiCache.ts`)

Sistema de cache com suporte a dados expirados para fallback:

#### Funcionalidades

- **Cache com TTL**: Dados expiram após tempo configurável (padrão: 5 minutos)
- **Stale Cache**: Permite usar dados expirados quando API está indisponível
- **Cache automático**: Requisições GET são automaticamente cacheadas
- **Geração de chaves**: Chaves consistentes baseadas em endpoint e parâmetros

#### Métodos Principais

```typescript
// Armazenar dados
apiCache.set(key, data, ttl?)

// Buscar dados válidos
apiCache.get(key) // null se expirado

// Buscar dados mesmo se expirados (fallback)
apiCache.getStale(key)

// Limpar cache
apiCache.clear()

// Estatísticas
apiCache.getStats()
```

### 3. API Service Integrado (`src/services/api.ts`)

O serviço de API foi atualizado para usar circuit breaker e cache automaticamente:

#### Comportamento

1. **Requisições normais**: Passa pelo circuit breaker e cacheia automaticamente (GET)
2. **Circuit OPEN**: Tenta usar dados em cache como fallback
3. **Cache miss**: Lança erro informando indisponibilidade

#### Novos Utilitários

```typescript
// Verificar status do circuit breaker
api.circuitBreaker.getStats()
api.circuitBreaker.isOpen()

// Resetar circuit breaker manualmente
api.circuitBreaker.reset()

// Inscrever-se para mudanças de estado
api.circuitBreaker.subscribe((stats) => {
  console.log('Estado:', stats.state)
})

// Gerenciar cache
api.cache.clear()
api.cache.getStats()
```

### 4. Banner de Status (`src/components/ApiStatusBanner.tsx`)

Componente visual que notifica usuários sobre o estado da API:

#### Comportamentos

- **Circuit OPEN**: Banner vermelho indicando API indisponível com countdown
- **Circuit HALF_OPEN**: Banner amarelo indicando tentativa de reconexão
- **Circuit CLOSED**: Banner não é exibido

#### Features

- Atualização em tempo real via subscription
- Contador regressivo para próxima tentativa
- Botão para fechar manualmente
- Posicionamento fixo no topo da página

## 📊 Fluxo de Requisição

```
User Request
    ↓
Circuit Breaker Check
    ↓
├─ CLOSED/HALF_OPEN → Execute Request
│                          ↓
│                     ┌─ Success → Cache (GET) → Return Data
│                     └─ Failure → Check Cache → Return Cached or Error
│
└─ OPEN → Check Cache
           ↓
      ┌─ Has Cache → Return Stale Data
      └─ No Cache → Error
```

## 🧪 Testes

### Circuit Breaker Tests

- ✅ Transições de estado (CLOSED → OPEN → HALF_OPEN → CLOSED)
- ✅ Contagem de falhas e threshold
- ✅ Timeout e recuperação automática
- ✅ Sistema de subscriptions
- ✅ Reset manual

### API Cache Tests

- ✅ Armazenamento e recuperação
- ✅ Expiração de cache (TTL)
- ✅ Stale cache fallback
- ✅ Geração de chaves consistentes
- ✅ Estatísticas e limpeza

### Banner Tests

- ✅ Renderização condicional baseada no estado
- ✅ Atualizações em tempo real
- ✅ Interação com botão de fechar
- ✅ Mensagens apropriadas por estado

## 🚀 Como Usar

### Uso Básico (Automático)

O circuit breaker funciona automaticamente para todas as chamadas via `api.*`:

```typescript
// Automaticamente protegido por circuit breaker e cache
const transactions = await api.transactions.list()
```

### Monitoramento de Estado

```typescript
import { api } from '@/services/api'

// Verificar estado atual
const stats = api.circuitBreaker.getStats()
console.log('Estado:', stats.state)
console.log('Falhas:', stats.failures)

// Inscrever-se para mudanças
const unsubscribe = api.circuitBreaker.subscribe((stats) => {
  if (stats.state === 'OPEN') {
    console.log('API está indisponível!')
  }
})

// Cancelar inscrição quando necessário
unsubscribe()
```

### Gerenciamento Manual de Cache

```typescript
// Limpar todo o cache
api.cache.clear()

// Ver estatísticas
const cacheStats = api.cache.getStats()
console.log('Tamanho do cache:', cacheStats.size)
console.log('Chaves:', cacheStats.keys)
```

### Reset Manual

```typescript
// Resetar circuit breaker (força estado CLOSED)
api.circuitBreaker.reset()
```

## 📈 Benefícios

1. **Resiliência**: Aplicação continua funcionando com dados em cache durante falhas
2. **UX Melhorada**: Usuários são notificados sobre problemas de conectividade
3. **Proteção da API**: Evita sobrecarga com requisições durante indisponibilidade
4. **Recuperação Automática**: Tenta reconectar automaticamente após timeout
5. **Monitoramento**: Facilita debugging com estatísticas detalhadas

## 🔍 Debugging

### Logs no Console

O sistema registra automaticamente:
- Warnings quando usa cache stale: `"Using stale cache for /endpoint due to circuit breaker or network error"`

### Inspecionar Estado

```typescript
// No console do navegador
api.circuitBreaker.getStats()
api.cache.getStats()
```

### Forçar Falhas (Desenvolvimento)

```typescript
// Simular falha do backend para testar circuit breaker
// (desligar backend ou usar Network Throttling no DevTools)
```

## 🛠️ Configuração Avançada

### Ajustar Parâmetros do Circuit Breaker

Edite `src/services/circuitBreaker.ts`:

```typescript
export const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,      // Mais tolerante a falhas
  successThreshold: 3,      // Requer mais sucessos
  timeout: 60000,          // 1 minuto antes de retry
  monitoringPeriod: 120000 // Janela de 2 minutos
})
```

### Ajustar TTL do Cache

Edite `src/services/apiCache.ts`:

```typescript
private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10 minutos
```

### Desabilitar Cache para Endpoints Específicos

```typescript
// Em api.ts, adicione opção useCache: false
return fetchApi<T>('/endpoint', options, { useCache: false })
```

## 📚 Referências

- [Circuit Breaker Pattern - Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Resilience Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
