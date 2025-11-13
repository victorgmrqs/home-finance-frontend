# UserContext Fallback e Recuperação

## 📋 Visão Geral

Implementação de mecanismos de fallback e recuperação no UserContext para melhorar a resiliência da autenticação da aplicação. O sistema agora é tolerante a falhas de armazenamento e corrupção de dados.

## 🎯 Objetivo

- Eliminar single point of failure no UserContext
- Recuperação automática de sessão em caso de corrupção
- Múltiplos layers de armazenamento com fallback automático
- Tratamento gracioso de erros sem quebrar a aplicação

## 🔧 Componentes

### 1. User Storage Service (`src/services/userStorage.ts`)

Gerencia armazenamento de dados do usuário com fallback entre localStorage e IndexedDB.

#### Funcionalidades

- **Validação de Integridade**: Valida dados do usuário antes de salvar/carregar
- **Dual Storage**: Salva em localStorage E IndexedDB simultaneamente
- **Fallback Chain**: localStorage → IndexedDB → null
- **Auto-recovery**: Dados corrompidos são automaticamente limpos

#### Métodos

```typescript
// Salvar usuário (localStorage + IndexedDB)
await userStorage.saveUser(user)

// Carregar usuário com fallback
const user = await userStorage.loadUser()

// Remover de todos os storages
await userStorage.removeUser()

// Validar dados do usuário
const isValid = userStorage.validateUser(userData)
```

#### Validação de Dados

Valida campos obrigatórios:
- `id`: número válido (> 0)
- `nome`: string não vazia
- `email`: opcional, mas se presente deve ser string

### 2. Session Recovery Service (`src/services/sessionRecovery.ts`)

Recupera sessão do usuário do backend usando HttpOnly cookies.

#### Funcionalidades

- **Sessão do Backend**: Tenta recuperar dados do `/auth/me`
- **Cookie Authentication**: Usa HttpOnly cookies para autenticação
- **Graceful Degradation**: Retorna null se não houver sessão válida

#### Métodos

```typescript
// Tentar recuperar sessão
const user = await sessionRecovery.recoverSession()

// Validar sessão
const isValid = await sessionRecovery.validateSession()
```

### 3. UserContext Atualizado (`src/contexts/UserContext.tsx`)

Contexto de usuário com fallback e recuperação automática.

#### Fluxo de Carregamento

```
App Mount
    ↓
loadUser()
    ↓
1. userStorage.loadUser()
    ├─ localStorage (success) → Return user
    ├─ localStorage (fail) → IndexedDB
    │   ├─ IndexedDB (success) → Restore to localStorage → Return user
    │   └─ IndexedDB (fail) → Session Recovery
    │
2. sessionRecovery.recoverSession()
    ├─ API /auth/me (success) → Save to storage → Return user
    └─ API /auth/me (fail) → Return null
```

#### Fluxo de Login

```
login(user)
    ↓
1. Validate user data
    ├─ Invalid → Throw error
    └─ Valid → Continue
    ↓
2. Save to storage
    ├─ Success → Set currentUser
    └─ Fail → setCurrentUser(null) + Throw error
```

#### Novo Estado

```typescript
interface UserContextValue {
  currentUser: Usuario | null
  login: (user: Usuario) => Promise<void>  // Agora assíncrono!
  logout: () => Promise<void>
  isLoading: boolean
  error: Error | null  // Novo campo de erro
}
```

### 4. User Error Boundary (`src/components/UserErrorBoundary.tsx`)

Error Boundary específico para capturar e tratar erros do UserContext.

#### Funcionalidades

- **Erro Counter**: Conta erros consecutivos
- **UI de Recuperação**: Interface amigável para recuperação
- **Auto-reset**: Após 3 erros, limpa dados e força reload
- **Opções de Recuperação**:
  - Tentar novamente
  - Limpar dados e fazer login novamente
  - Resetar aplicação (após 2+ erros)

#### Integração

```typescript
<UserErrorBoundary>
  <UserProvider>
    <App />
  </UserProvider>
</UserErrorBoundary>
```

## 📊 Matriz de Fallback

| Cenário | localStorage | IndexedDB | Session API | Result |
|---------|--------------|-----------|-------------|--------|
| ✅ Dados válidos em localStorage | ✅ | - | - | User carregado |
| ❌ localStorage corrompido | ❌ | ✅ | - | User de IndexedDB |
| ❌ Ambos corrompidos | ❌ | ❌ | ✅ | User da API |
| ❌ Todos falharam | ❌ | ❌ | ❌ | null (logged out) |

## 🧪 Testes

### User Storage Tests
- ✅ Validação de dados (9 testes)
- ✅ Save/Load com fallback (4 testes)
- ✅ Remoção de dados (2 testes)
- ✅ Tratamento de erros (3 testes)

### Session Recovery Tests
- ✅ Recuperação bem-sucedida (1 teste)
- ✅ Tratamento de erros (5 testes)

### UserContext Tests
- ✅ Estados e loading (3 testes)
- ✅ Login/Logout (2 testes)
- ✅ Tratamento de erros (5 testes)

**Total: 30 novos testes**

## 🚀 Como Usar

### Uso Básico (Não Muda)

```typescript
function MyComponent() {
  const { currentUser, login, logout, isLoading, error } = useUser()

  const handleLogin = async (userData: Usuario) => {
    try {
      await login(userData)  // Agora é assíncrono!
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return currentUser ? (
    <div>Welcome {currentUser.nome}</div>
  ) : (
    <LoginForm onSubmit={handleLogin} />
  )
}
```

### Monitoramento de Erros

```typescript
function App() {
  const { error } = useUser()

  useEffect(() => {
    if (error) {
      // Log para sistema de monitoramento
      logError('UserContext Error', error)
    }
  }, [error])

  return <YourApp />
}
```

## 🔍 Debugging

### Inspecionar Storage

```javascript
// No console do navegador

// Ver dados em localStorage
localStorage.getItem('currentUser')

// Ver dados em IndexedDB
indexedDB.databases().then(dbs => console.log(dbs))

// Ver sessão do backend
fetch('/api/v1/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

### Logs Automáticos

O sistema já loga automaticamente:
- ⚠️ Dados inválidos removidos
- ⚠️ Falhas de armazenamento
- ⚠️ Erros de sessão
- ⚠️ Erros de login/logout

Procure por prefixos:
- `"Invalid user data in localStorage"`
- `"Failed to load from IndexedDB"`
- `"Session recovery failed"`
- `"Error during login"`

## 📈 Benefícios

1. **Resiliência**: Aplicação não quebra com dados corrompidos
2. **Recuperação Automática**: Sessão é recuperada automaticamente
3. **Múltiplos Backups**: 3 camadas de armazenamento
4. **UX Melhorada**: Usuário vê interface de erro em vez de crash
5. **Debugging**: Logs detalhados facilitam investigação

## 🛡️ Segurança

- ✅ Validação de integridade antes de usar dados
- ✅ Limpeza automática de dados corrompidos
- ✅ HttpOnly cookies para tokens (gerenciados pelo backend)
- ✅ Não armazena dados sensíveis em localStorage
- ✅ Error boundary previne exposição de stack traces

## 🔄 Migração

### Breaking Changes

**A função `login` agora é assíncrona!**

Antes:
```typescript
const { login } = useUser()
login(user)  // Síncrono
```

Depois:
```typescript
const { login } = useUser()
await login(user)  // Assíncrono!
```

### Componentes Afetados

- ✅ `LoginPage.tsx` - Atualizado
- ✅ `useLogin.ts` - Atualizado
- ✅ Todos os testes - Atualizados

## 📚 Referências

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Error Boundaries - React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [HttpOnly Cookies](https://owasp.org/www-community/HttpOnly)
