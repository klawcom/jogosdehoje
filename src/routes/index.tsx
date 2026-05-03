import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, Tv, Bell, Send, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Jogos de Hoje — Futebol do dia no Telegram" },
      { name: "description", content: "Receba os jogos de futebol do dia, horários e onde assistir, automaticamente no Telegram." },
      { property: "og:title", content: "Jogos de Hoje" },
      { property: "og:description", content: "Saiba horários e onde assistir aos jogos do dia, direto no Telegram." },
    ],
  }),
});

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
        <Trophy className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold tracking-tight">
        Jogos<span className="text-primary">deHoje</span>
      </span>
    </div>
  );
}

const features = [
  { icon: Calendar, title: "Jogos do dia", desc: "Lista completa de partidas dos principais campeonatos." },
  { icon: Clock, title: "Horários", desc: "Tudo no seu fuso, sem precisar conferir em vários sites." },
  { icon: Tv, title: "Onde assistir", desc: "Saiba o canal ou streaming de cada jogo." },
  { icon: Bell, title: "Alertas automáticos", desc: "Receba antes do apito inicial, direto no Telegram." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <a
          href="#cta"
          className="hidden rounded-full border border-border bg-card/40 px-4 py-2 text-sm backdrop-blur transition hover:border-primary/60 sm:inline-block"
        >
          Entrar no canal
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="flex flex-col items-center pt-16 pb-24 text-center sm:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Atualizado todos os dias às 7h
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Receba os jogos do dia{" "}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              no Telegram
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Saiba horários e onde assistir aos jogos automaticamente.
          </p>
          <a
            id="cta"
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-action)] px-8 py-4 text-base font-semibold text-[color:var(--action-foreground)] shadow-[var(--shadow-action)] transition hover:bg-[color:var(--action-hover)] hover:scale-[1.03] active:scale-100"
          >
            <Send className="h-5 w-5" />
            Quero Receber
          </a>
          <p className="mt-3 text-xs text-muted-foreground">Grátis · Sem cadastro · Cancela quando quiser</p>

          {/* Mock telegram card */}
          <div className="relative mt-16 w-full max-w-md">
            <div className="rounded-2xl border border-border bg-card p-5 text-left shadow-[var(--shadow-card)]">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[image:var(--gradient-primary)]">
                  <Trophy className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Jogos de Hoje</p>
                  <p className="text-[10px] text-muted-foreground">bot · agora</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">⚽ Jogos de hoje</p>
                <div className="rounded-lg bg-background/60 p-2.5">
                  <p className="text-xs text-muted-foreground">16:00 · Brasileirão</p>
                  <p>Flamengo × Palmeiras</p>
                  <p className="text-xs text-primary">📺 Globo, Premiere</p>
                </div>
                <div className="rounded-lg bg-background/60 p-2.5">
                  <p className="text-xs text-muted-foreground">21:30 · Libertadores</p>
                  <p>Boca Juniors × Fluminense</p>
                  <p className="text-xs text-primary">📺 ESPN, Paramount+</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pb-24">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que você precisa, em um lugar
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Chega de pular entre apps e sites para descobrir onde passa o jogo.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary/50"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:bg-[image:var(--gradient-primary)] group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-24">
          <div className="rounded-2xl border border-border bg-card p-10 text-center sm:p-16">
            <h2 className="relative text-3xl font-bold sm:text-4xl">Pronto para nunca mais perder um jogo?</h2>
            <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
              Entre no canal e receba os jogos do dia automaticamente.
            </p>
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-action)] px-8 py-4 font-semibold text-[color:var(--action-foreground)] shadow-[var(--shadow-action)] transition hover:bg-[color:var(--action-hover)] hover:scale-[1.03]"
            >
              <Send className="h-5 w-5" />
              Quero Receber
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Jogos de Hoje · Feito para apaixonados por futebol
      </footer>
    </div>
  );
}
