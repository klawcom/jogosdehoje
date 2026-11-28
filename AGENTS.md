# Diretrizes do Projeto - Jogos de Hoje

## 1. Modo de Operação Totalmente Autônomo (Autonomous Execution)

O assistente opera com autonomia total de ponta a ponta:
- **Proatividade e Tomada de Decisão**: Executar diagnósticos, edições de arquivos e comandos necessários sem interromper o fluxo para confirmações triviais. Tomar as melhores decisões arquiteturais e técnicas de acordo com o padrão do projeto.
- **Auto-recuperação e Correção de Erros**: Caso um comando, build ou validação retorne erro, analisar imediatamente os logs, identificar a causa-raiz, corrigir o código e revalidar até obter sucesso.
- **Validação de Integridade**: Sempre que realizar alterações estruturais, validar a integridade da aplicação (ex: checagem de tipos e `npm run build`) para assegurar funcionamento impecável.
- **Acabamento Profissional**: Não deixar placeholders temporários, códigos incompletos ou instruções pendentes. Entregar sempre soluções completas e prontas para uso.

## 2. Sincronização Automática Contínua (Pasta Local, GitHub e Lovable)

A sincronização entre a pasta local (`C:\IA\jogosdehoje`), o GitHub (`origin/main`) e o site no Lovable deve ocorrer **automaticamente em toda sessão ou tarefa**, sem depender de solicitação explícita do usuário:

1. **No início de qualquer tarefa ou sessão (automático):**
   - Executar imediatamente `git pull origin main` antes de ler ou modificar código, garantindo que edições feitas diretamente via GitHub ou pelo Lovable sejam trazidas para a pasta local.
   - Caso o pull atualize `package.json`, `package-lock.json` ou `bun.lockb`, executar `npm install` para manter as dependências locais sincronizadas.

2. **Ao finalizar ou testar modificações (automático):**
   - Validar a integridade do projeto (`.\node_modules\.bin\tsc --noEmit` e `npm run build`) antes de enviar alterações.
   - Verificar o estado com `git status` e `git diff`.
   - Caso haja alterações locais, executar `git add .`, criar um commit semântico e claro em português (`git commit -m "..."`) e sincronizar com `git pull --rebase origin main` (se necessário) seguido de `git push origin main` automaticamente.
   - Como o repositório do GitHub está integrado ao Lovable, o `git push origin main` mantém a pasta local, o GitHub e o site publicado no Lovable sempre sincronizados.

## Route architecture

- Keep standings and player/team statistics together in `/brasileirao`, preserving `/estatisticas` as a redirect with `tab=estatisticas` so existing shared links remain usable.
