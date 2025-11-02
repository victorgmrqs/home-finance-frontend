# Configuração com Branch Ruleset (Avançado)

Este documento explica como configurar proteção de branches usando **Branch Ruleset** (opção moderna do GitHub).

## Quando Usar Branch Ruleset

Use **Branch Ruleset** se você precisa de:
- Regras condicionais complexas
- Múltiplas regras para o mesmo padrão
- Integração com GitHub Apps e ferramentas avançadas
- Gerenciamento mais granular de permissões

Para projetos pessoais e simples, use **Classic Branch Protection** (mais fácil).

## Como Configurar com Branch Ruleset

### Passo 1: Criar Ruleset para `main`

1. Em **Settings → Branches**, clique em **Add branch ruleset**
2. Configure:

**Nome do Ruleset:** `Protect main branch`

**Branch name pattern:** `main`

**Target branches:** `All branches matching this name pattern`

**Regras a adicionar:**

1. **Restrict deletions**
   - ✅ Ativar
   
2. **Restrict force pushes**
   - ✅ Ativar

3. **Require pull request**
   - ✅ Ativar
   - **Required approvals:** 1
   - ✅ Require last push approval
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from code owners (se tiver CODEOWNERS)

4. **Require status checks**
   - ✅ Ativar
   - **Required status checks:**
     - `lint`
     - `type-check`
     - `test`
     - `build`
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging

5. **Restrict merges**
   - ✅ Permitir apenas: **Squash and merge** ou **Rebase and merge** (sua escolha)
   - Não permitir: **Merge commit**

6. **Require linear history** (Opcional)
   - ✅ Ativar se quiser histórico linear

7. **Lock branch** (Opcional - apenas se necessário)
   - Deixe desativado normalmente

**Bypass list:** Deixe vazio (ou adicione admins específicos se necessário)

3. Clique em **Create**

### Passo 2: Criar Ruleset para `development`

1. Clique em **Add branch ruleset** novamente
2. Configure:

**Nome do Ruleset:** `Protect development branch`

**Branch name pattern:** `development`

**Target branches:** `All branches matching this name pattern`

**Regras a adicionar:** (Mesmas configurações da branch `main`)

1. **Restrict deletions** ✅
2. **Restrict force pushes** ✅
3. **Require pull request** ✅
   - Required approvals: 1
4. **Require status checks** ✅
   - Mesmos checks: `lint`, `type-check`, `test`, `build`
5. **Restrict merges** ✅
   - Permitir apenas Squash/Rebase merge

3. Clique em **Create**

## Diferenças Principais: Ruleset vs Classic

| Recurso | Branch Ruleset | Classic Protection |
|---------|---------------|-------------------|
| Interface | Mais complexa | Mais simples |
| Múltiplas regras | ✅ Sim | ❌ Não |
| Regras condicionais | ✅ Sim | ❌ Não |
| Bypass granular | ✅ Sim | ✅ Sim |
| Status checks | ✅ Sim | ✅ Sim |
| Require PR | ✅ Sim | ✅ Sim |
| Adequado para | Projetos grandes/orgs | Projetos pessoais/pequenos |

## Recomendação

Para este projeto, **use Classic Branch Protection** (mais simples). Use Ruleset apenas se:
- Trabalha em uma organização grande
- Precisa de regras muito complexas
- Precisa de múltiplas camadas de proteção

