# Automação do GitHub Projects

Este documento explica como configurar a integração automática entre branches, Pull Requests e tarefas no GitHub Projects.

## Como Funciona

O workflow `project-automation.yml` automatiza a movimentação de tarefas no GitHub Projects baseado no status dos Pull Requests:

1. **PR Criado/Aberto**: Move a tarefa para a coluna "Em revisão"
2. **PR Mergeado**: Move a tarefa para a coluna "Concluído"

## Configuração do Projeto

### Passo 1: Criar/Configurar o GitHub Project

1. Vá para o repositório no GitHub
2. Clique em **Projects** no menu superior
3. Crie um novo projeto ou selecione um existente
4. Configure as colunas do seu projeto. Exemplo:
   - 📋 Backlog
   - 🚧 Em progresso
   - 👀 Em revisão
   - ✅ Concluído

### Passo 2: Configurar Campo de Status no Projeto

1. No seu GitHub Project, você precisa ter um campo de tipo **Single Select** chamado **"Status"** (ou "Estado")
2. Configure as opções deste campo. Exemplo:
   - 📋 Backlog
   - 🚧 Em progresso
   - 👀 Em revisão
   - ✅ Concluído

**Como adicionar campo de Status:**
- No projeto, clique em **+** (Add field)
- Selecione **Single select**
- Nome do campo: `Status`
- Adicione as opções listadas acima

### Passo 3: Vincular Issues ao Projeto

1. Quando criar uma Issue ou Task, adicione-a ao projeto:
   - Na página da Issue, clique em **Projects** (menu lateral direito)
   - Selecione seu projeto
   - A issue aparecerá no projeto
   - O status inicial será o primeiro da lista ou vazio

### Passo 4: Atrelar Issues aos Pull Requests

Para que a automação funcione, você precisa referenciar a issue no Pull Request usando uma das seguintes formas:

#### Opção 1: No título do PR
```
feat: Adiciona autenticação (#123)
```

#### Opção 2: No corpo do PR
```markdown
## Descrição
Implementa sistema de autenticação

Closes #123
```

#### Palavras-chave que funcionam:
- `closes #123`
- `fixes #123`
- `resolves #123`
- `refs #123`
- Ou simplesmente `#123` no título ou corpo

### Passo 5: Personalizar Nomes dos Status

Se seus status têm nomes diferentes, edite o arquivo `.github/workflows/project-automation.yml`:

```javascript
// Linha ~97: Status quando PR é aberto
const targetStatusName = 'Em revisão';  // Altere aqui

// Linha ~334: Status quando PR é mergeado
const targetStatusName = 'Concluído';  // Altere aqui
```

**Importante**: Os nomes devem corresponder exatamente às opções do campo "Status" no seu projeto (case-insensitive).

## Fluxo de Trabalho Completo

### 1. Criar uma Tarefa
```bash
# Criar issue no GitHub com o título da tarefa
# Adicionar a issue ao projeto (será colocada em "Backlog")
```

### 2. Criar Branch de Feature
```bash
git checkout -b feature/auth-system
```

### 3. Trabalhar na Feature
```bash
# Fazer commits relacionados à issue
git commit -m "feat: adiciona login (#123)"
```

### 4. Criar Pull Request
Ao criar o PR, inclua a referência à issue:
```markdown
Título: feat: Sistema de autenticação (#123)

Descrição:
Implementa login e logout

Closes #123
```

**Ação automática**: O status da issue #123 será atualizado para "Em revisão" automaticamente.

### 5. Merge do PR
Após aprovação e merge na `development`:

**Ação automática**: O status da issue #123 será atualizado para "Concluído" automaticamente.

## Estrutura de Status Recomendada

No GitHub Projects v2, você usa um campo **Status** (Single Select) com as seguintes opções:

```
Status:
  - 📋 Backlog
  - 🚧 Em progresso
  - 👀 Em revisão
  - ✅ Concluído
```

O workflow automaticamente atualiza o campo Status quando:
- **PR aberto** → Move para "Em revisão"
- **PR mergeado** → Move para "Concluído"

## Configuração Avançada

### Especificar um Projeto Específico

Se você tem múltiplos projetos, pode modificar o workflow para usar um projeto específico:

```javascript
// No arquivo project-automation.yml, linha ~40
const { data: projects } = await github.rest.projects.listForRepo({
  owner: context.repo.owner,
  repo: context.repo.repo,
});

// Filtrar por nome do projeto
const project = projects.find(p => p.name === 'Meu Projeto');
```

### Adicionar Mais Gatilhos

Você pode adicionar mais triggers, por exemplo:

```yaml
on:
  pull_request:
    types: [opened, closed, ready_for_review, synchronize]
  issues:
    types: [opened, closed, labeled]
```

## Troubleshooting

### A issue não está sendo movida

1. **Verifique se a issue está no projeto**: A issue precisa estar adicionada ao projeto primeiro
2. **Verifique a referência no PR**: Use `#123`, `closes #123`, etc.
3. **Verifique os logs**: Vá em Actions → Verifique os logs do workflow
4. **Verifique o campo Status**: O projeto precisa ter um campo "Status" (ou "Estado") do tipo Single Select
5. **Verifique os nomes dos status**: Devem corresponder exatamente às opções do campo (case-insensitive)

### Erro de permissão

O workflow usa `GITHUB_TOKEN` que é criado automaticamente. Se necessário, você pode criar um Personal Access Token com permissões de `repo` e `write:org` e adicioná-lo como secret.

## Exemplo Prático

1. Crie a Issue #50: "Implementar dashboard"
2. Adicione a issue ao projeto (vai para "Backlog")
3. Crie branch: `feature/dashboard`
4. Trabalhe na feature
5. Crie PR: `feat: Dashboard (#50)`
   - ✅ Status da Issue #50 muda automaticamente para "Em revisão"
6. Merge o PR
   - ✅ Status da Issue #50 muda automaticamente para "Concluído"

