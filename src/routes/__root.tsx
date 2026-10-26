import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço que você tentou acessar não existe ou foi modificado.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            Voltar aos Jogos
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0f1520" },
      { title: "Futebol na TV — Jogos de Hoje, Horários e Onde Assistir" },
      { name: "description", content: "Programação completa dos jogos de futebol de hoje no horário de Brasília com canais de TV aberta, TV por assinatura e streaming." },
      { property: "og:title", content: "Futebol na TV — Jogos de Hoje" },
      { property: "og:description", content: "Saiba quais jogos passam hoje na TV Aberta, Fechada e Streaming no horário de Brasília." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Futebol na TV — Guia de Jogos" },
      { name: "twitter:description", content: "Horários e canais de transmissão de futebol no Brasil." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-['Plus_Jakarta_Sans',sans-serif] text-foreground antialiased selection:bg-primary/30 selection:text-primary">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
