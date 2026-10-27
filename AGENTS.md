# Diretrizes do Projeto - Jogos de Hoje

## 1. Modo de Operação Totalmente Autônomo (Autonomous Execution)

O assistente opera com autonomia total de ponta a ponta:
- **Proatividade e Tomada de Decisão**: Executar diagnósticos, edições de arquivos e comandos necessários sem interromper o fluxo para confirmações triviais. Tomar as melhores decisões arquiteturais e técnicas de acordo com o padrão do projeto.
- **Auto-recuperação e Correção de Erros**: Caso um comando, build ou validação retorne erro, analisar imediatamente os logs, identificar a causa-raiz, corrigir o código e revalidar até obter sucesso.
- **Validação de Integridade**: Sempre que realizar alterações estruturais, validar a integridade da aplicação (ex: checagem de tipos e `npm run build`) para assegurar funcionamento impecável.
- **Acabamento Profissional**: Não deixar placeholders temporários, códigos incompletos ou instruções pendentes. Entregar sempre soluções completas e prontas para uso.

## 2. Sincronização Contínua com GitHub e Lovable

1. **No início de qualquer tarefa ou sessão:**
   - Sempre executar `git pull origin main` para sincronizar o repositório local com o GitHub antes de realizar qualquer modificação no código. Isso garante que qualquer edição feita diretamente via GitHub ou pelo Lovable seja incorporada localmente.

2. **Ao finalizar ou testar modificações:**
   - Verificar o status com `git status` e `git diff`.
   - Adicionar os arquivos modificados (`git add .`).
   - Criar commit semântico e claro em português (`git commit -m "..."`).
   - Fazer o envio para o repositório remoto com `git push origin main`.
   - Como o repositório do GitHub está integrado ao Lovable, o `git push origin main` mantém tanto o GitHub quanto o Lovable perfeitamente sincronizados.
