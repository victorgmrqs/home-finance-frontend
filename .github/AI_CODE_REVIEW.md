# Automação de Code Review

Este projeto possui automação de code review e **auto-fix** configurada para PRs.

## ✨ Auto-Fix Automático

### 🔄 Auto-Fix em Todo PR (Opção 1)
**Workflow:** `.github/workflows/auto-fix.yml`

**Como funciona:**
- Ao abrir ou atualizar um PR, roda `eslint --fix` automaticamente
- Se houver correções, faz commit automático no PR
- Corrige: indentação, aspas, ponto-vírgula, imports não usados, etc.

⚠️ **Atenção:** Pode criar muitos commits automáticos

---

### 💬 Auto-Fix sob Comando (Opção 2 - Recomendado)
**Workflow:** `.github/workflows/auto-fix-advanced.yml`

**Como funciona:**
1. Abra um PR normalmente
2. Quando quiser corrigir, comente: `/fix`
3. O bot vai:
   - Executar `eslint --fix`
   - Fazer commit das correções
   - Comentar o resultado

✅ **Vantagem:** Você controla quando corrigir

**Exemplo:**
```
Comentário no PR:
"/fix"

Resposta do bot:
✅ Auto-fix completed!
- ESLint corrections applied and committed
```

---

## 🤖 Ferramentas Configuradas

### 1. **Lint PR Review** (Gratuito)
Workflow: `.github/workflows/lint-pr-review.yml`

**O que faz:**
- Executa ESLint em arquivos modificados
- Adiciona anotações inline no PR apontando erros
- Executa verificação de tipos TypeScript
- Comenta diretamente nas linhas problemáticas

**Ativação:** Automática em todos os PRs

---

### 2. **AI Code Review** (Requer API Key)
Workflow: `.github/workflows/ai-code-review.yml`

**O que faz:**
- Review inteligente usando GPT
- Identifica bugs potenciais
- Sugere melhorias de performance
- Detecta código duplicado
- Comenta boas práticas

**Configuração necessária:**
1. Obter API key da OpenAI: https://platform.openai.com/api-keys
2. Adicionar secret no GitHub:
   - Ir em: Settings → Secrets and variables → Actions
   - Criar novo secret: `OPENAI_API_KEY`
   - Colar sua API key

**Alternativas gratuitas:**
- **Sourcery**: https://sourcery.ai (gratuito para projetos open-source)
- **CodeRabbit**: https://coderabbit.ai (gratuito com limite)
- **Qodo (ex-CodiumAI)**: https://qodo.ai

---

## 🔧 Hooks Locais (Git)

### Pre-commit Hook
**Arquivo:** `.husky/pre-commit`

**O que faz:**
- Executa ESLint com auto-fix nos arquivos staged
- Bloqueia commit se houver erros não corrigíveis

### Pre-push Hook
**Arquivo:** `.husky/pre-push`

**O que faz:**
- Executa todos os testes
- Bloqueia push se algum teste falhar

---

## 📝 Como Usar

### Opção 1: Usar AI Review (CodeRabbit - Recomendado)

CodeRabbit é gratuito e não requer configuração de API keys!

1. Acesse: https://coderabbit.ai
2. Faça login com sua conta GitHub
3. Ative o repositório `home-finance-frontend`
4. Remova o workflow `ai-code-review.yml` (não será necessário)
5. CodeRabbit vai comentar automaticamente em todos os PRs

### Opção 2: Usar OpenAI GPT

1. Criar conta na OpenAI
2. Adicionar créditos (mínimo $5)
3. Gerar API key
4. Adicionar secret `OPENAI_API_KEY` no GitHub
5. O workflow `ai-code-review.yml` vai funcionar automaticamente

### Opção 3: Usar apenas ESLint automatizado (Gratuito)

Já está funcionando! O workflow `lint-pr-review.yml` vai:
- Adicionar comentários inline com erros de lint
- Marcar check como failed se houver erros
- Não requer configuração adicional

---

## 🚀 Testando

### Testar Auto-Fix
1. Criar uma branch: `git checkout -b test/auto-fix`
2. Fazer alteração com erro corrigível:
   ```typescript
   const x = "teste"  // sem ponto-vírgula
   import {useState} from 'react' // sem espaços
   ```
3. Commit e push: `git add . && git commit -m "test" && git push`
4. Abrir um PR
5. **Opção A:** Aguardar auto-fix automático (se workflow `auto-fix.yml` habilitado)
6. **Opção B:** Comentar `/fix` no PR (se workflow `auto-fix-advanced.yml` habilitado)
7. Ver commit automático com correções!

### Testar Code Review
1. Criar uma branch: `git checkout -b test/code-review`
2. Fazer alteração com erro:
   ```typescript
   const x: any = "teste"; // ESLint vai reclamar
   ```
3. Commit e push: `git add . && git commit -m "test" && git push`
4. Abrir um PR
5. Aguardar checks
6. Ver comentários automáticos

---

## 🛠️ Customização

### Desabilitar AI Review
Deletar ou renomear: `.github/workflows/ai-code-review.yml`

### Customizar regras de lint review
Editar: `.github/workflows/lint-pr-review.yml`

### Adicionar mais verificações
Adicionar novos jobs nos workflows existentes

---

## 📚 Referências

- [CodeRabbit](https://coderabbit.ai)
- [Sourcery](https://sourcery.ai)
- [ESLint Annotate Action](https://github.com/ataylorme/eslint-annotate-action)
- [Reviewdog TypeScript](https://github.com/EPMatt/reviewdog-action-tsc)
