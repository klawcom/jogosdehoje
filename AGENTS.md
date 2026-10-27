# Diretrizes do Projeto - Jogos de Hoje

## Sincronização Contínua com GitHub e Lovable

1. **No início de qualquer tarefa ou sessão:**
   - Sempre executar `git pull origin main` para sincronizar o repositório local com o GitHub antes de realizar qualquer modificação no código. Isso garante que qualquer edição feita diretamente via GitHub ou pelo Lovable seja incorporada localmente.

2. **Ao finalizar ou testar modificações:**
   - Sempre verificar o status com `git status` e `git diff`.
   - Adicionar os arquivos modificados (`git add .`).
   - Criar commit semântico e claro em português (`git commit -m "..."`).
   - Fazer o envio para o repositório remoto com `git push origin main`.
   - Como o repositório do GitHub está integrado ao Lovable, o `git push origin main` mantém tanto o GitHub quanto o Lovable perfeitamente sincronizados.
