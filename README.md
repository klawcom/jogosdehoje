# Futebol na TV ⚽📺

App web moderno, mobile-first e em modo escuro para consultar a programação completa dos jogos de futebol do dia no horário de Brasília, com canais de transmissão (TV Aberta, TV Fechada e Streaming).

**Live App**: [https://jogosdehoje.lovable.app](https://jogosdehoje.lovable.app)

---

## 🌟 Funcionalidades

- 📅 **Navegação por Datas**: Abre direto no dia de hoje com setas e abas rápidas para navegar entre os dias disponíveis (Hoje, Amanhã, etc.).
- 🏆 **Agrupamento por Campeonato**: Partidas organizadas por competição e ordenadas cronologicamente por horário de Brasília (UTC-3).
- 🏷️ **Canais em Selos Coloridos**:
  - 🟢 **TV Aberta**: Globo, SBT, Band, Record, TV Brasil, TV Cultura.
  - 🔵 **TV Fechada**: SporTV, ESPN, Premiere, TNT, BandSports.
  - 🟣 **Streaming**: Disney+, Max, Prime Video, CazéTV, Globoplay, Paramount+, YouTube.
- 🔍 **Busca em Tempo Real**: Encontre partidas digitando o nome do time.
- 🎛️ **Filtros Avançados**: Filtre por campeonato ou por tipo de transmissão com um clique.
- ⭐ **Times Favoritos Fixados no Topo**: Favorite seus clubes e acompanhe seus jogos em destaque no topo da tela (`localStorage`).
- 📲 **Compartilhar no WhatsApp**: Botão flutuante que gera e envia o resumo formatado das partidas do dia com emojis.
- 🔄 **Sincronização Agendada (7h e 12h de Brasília)**: Raspador automatizado que consome a programação oficial do Goal.com e atualiza o banco de dados.

---

## 🗄️ Banco de Dados (Supabase)

O script completo para recriar as tabelas está localizado em [`supabase/schema.sql`](supabase/schema.sql):

- **`matches`**: Partidas com data, campeonato, times, horário e canais normalizados.
- **`sync_logs`**: Histórico das sincronizações com status e total de jogos.

### Agendamento automático via pg_cron:
- 07:00 Brasília (10:00 UTC): `0 10 * * *`
- 12:00 Brasília (15:00 UTC): `0 15 * * *`

---

## 🚀 Como Rodar Localmente

```bash
# Instalar dependências
bun install # ou npm install

# Rodar servidor de desenvolvimento
bun run dev # ou npm run dev

# Build de produção
bun run build # ou npm run build
```

---

Built with [Lovable](https://lovable.dev) & TanStack Start.
