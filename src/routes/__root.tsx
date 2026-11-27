import { useEffect } from "react";
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
            Voltar aos Jogos de Hoje
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
      { name: "theme-color", content: "#061c12" },
      { title: "Jogos de Hoje — Futebol na TV e Streaming" },
      { name: "description", content: "Confira todos os jogos de futebol de hoje com horários de Brasília e onde assistir na TV aberta, TV fechada e streaming." },
      { property: "og:title", content: "Jogos de Hoje — Futebol na TV e Streaming" },
      { property: "og:description", content: "Programação completa dos jogos de hoje no horário de Brasília com canais de transmissão." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Jogos de Hoje" },
      { name: "twitter:description", content: "Horários e onde assistir aos jogos de futebol de hoje." },
      { name: "twitter:image", content: "/logo.png" },
    ],
    links: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico?v=2" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png?v=2" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png?v=2" },
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
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('jogosdehoje_theme');
                  var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
                  if (stored === 'light' || (!stored && prefersLight)) {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <HeadContent />
      </head>
      <body className="min-h-screen font-['Plus_Jakarta_Sans',sans-serif] text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <div className="pitch-field-lines" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Hide the "Edit with Lovable" badge if injected dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hideLovable = () => {
      // Find elements with lovable text or links
      const allElements = document.querySelectorAll("a, button, div, span");
      allElements.forEach((el) => {
        const text = el.textContent || "";
        const href = el.getAttribute("href") || "";
        if (text.includes("Edit with Lovable") || href.includes("lovable.dev") || href.includes("lovable.app/projects")) {
          const container = el.closest('div[style*="position: fixed"]') || el;
          (container as HTMLElement).style.setProperty("display", "none", "important");
          (container as HTMLElement).style.setProperty("visibility", "hidden", "important");
        }
      });
    };

    hideLovable();
    const observer = new MutationObserver(hideLovable);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return <Outlet />;
}
