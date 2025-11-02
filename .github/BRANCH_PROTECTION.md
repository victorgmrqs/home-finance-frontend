# Configuração de Proteção de Branches

Este documento explica como configurar a proteção de branches no GitHub para implementar o fluxo de trabalho Git Flow.

## Estrutura de Branches

- **`main`**: Branch de produção (protegida)
- **`development`**: Branch de desenvolvimento (protegida)
- **`feature/*`**: Branches de features criadas a partir de `development`

## Fluxo de Trabalho

1. Criar uma branch `feature/nome-da-feature` a partir de `development`
2. Trabalhar na feature e fazer commits na branch
3. Abrir Pull Request de `feature/*` → `development`
4. Após merge em `development`, abrir Pull Request de `development` → `main`

## Como Configurar Branch Protection no GitHub

### Passo 1: Acessar as Configurações

1. Vá para o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Branches**

### Escolha: Qual Opção Usar?

Ao clicar em **Branches**, você verá duas opções:

1. **"Add branch ruleset"** (Novo - Avançado)
   - ✅ Mais moderno e flexível
   - ✅ Permite regras mais complexas e condicionais
   - ✅ Melhor para organizações e workflows avançados
   - ⚠️ Interface mais complexa
   - 📖 Veja `.github/BRANCH_RULESET.md` para instruções detalhadas

2. **"Add classic branch protection rule"** (Clássico - Simples)
   - ✅ Mais simples e direto
   - ✅ Ideal para projetos pequenos/médios
   - ✅ Todas as funcionalidades essenciais
   - ✅ Recomendado para começar

**Recomendação:** Use **"Add classic branch protection rule"** para projetos pessoais/pequenos. É mais simples e tem todas as funcionalidades necessárias para o seu caso de uso.

### Passo 2: Proteger a Branch `main`

**Se escolheu "Classic branch protection rule":**

1. Clique em **Add classic branch protection rule**
2. Em **Branch name pattern**, digite: `main`
3. Configure as seguintes opções:

   ✅ **Require a pull request before merging** (Exigir PR antes de fazer merge)
   - ✅ **Require approvals**: 1 (ou mais, conforme necessário)
   - ✅ **Dismiss stale pull request approvals when new commits are pushed**

   ✅ **Require status checks to pass before merging** (Exigir que os checks passem)
   - ✅ **Require branches to be up to date before merging**
   - Marque os jobs necessários:
     - `lint`
     - `type-check`
     - `test`
     - `build`

   ✅ **Require conversation resolution before merging** (Exigir resolução de conversas)

   ✅ **Do not allow bypassing the above settings** (Não permitir contornar essas configurações)

   ✅ **Restrict pushes that create files larger than 100 MB** (Opcional, mas recomendado)

4. Clique em **Create** (Criar)

### Passo 3: Proteger a Branch `development`

1. Clique em **Add branch protection rule** novamente
2. Em **Branch name pattern**, digite: `development`
3. Configure as mesmas opções da branch `main`
4. Clique em **Create** (Criar)

### Passo 4: (Opcional) Configurar Merge Restrictions

Para garantir que apenas `development` possa ser mergeada em `main`:

1. Na regra de proteção da branch `main`
2. Adicione uma regra em **Rules allowed to be merged**:
   - Escolha apenas **Squash and merge** ou **Rebase and merge** (conforme preferência)
   - Ou configure **Restrict who can push to matching branches** para limitar a quem pode fazer merge

## Workflow Recomendado

### Criando uma Nova Feature

```bash
# Atualizar development local
git checkout development
git pull origin development

# Criar branch de feature
git checkout -b feature/minha-feature

# Trabalhar e fazer commits
git add .
git commit -m "feat: adiciona nova funcionalidade"

# Push da branch
git push origin feature/minha-feature
```

### Fazendo Merge em Development

1. Criar Pull Request no GitHub: `feature/minha-feature` → `development`
2. Aguardar aprovação e todos os checks passarem
3. Fazer merge após aprovação

### Fazendo Merge em Main

1. Criar Pull Request no GitHub: `development` → `main`
2. Aguardar aprovação e todos os checks passarem
3. Fazer merge após aprovação

## Notas Importantes

- Push direto para `main` e `development` estará bloqueado após configurar as proteções
- Todos os PRs devem passar pelos checks do CI antes de serem mergeados
- A branch `development` serve como buffer entre features e produção
- Sempre crie branches de feature a partir da branch `development` atualizada

