import { useEffect } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { PwaInstallBanner } from "../components/pwa-install-banner";
import { registerServiceWorker } from "../lib/push-notifications";
import { useSiteSettings } from "../lib/settings";
import { Sparkles, Megaphone } from "lucide-react";

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
            Voltar aos Jogos ao Vivo
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
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Jogos ao Vivo" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "application-name", content: "Jogos ao Vivo" },
      { title: "Jogos ao Vivo — Futebol na TV, Streaming, Placar e Gols em Tempo Real" },
      {
        name: "description",
        content:
          "Não perca nenhum lance! Acompanhe jogos de futebol ao vivo hoje, onde assistir na TV e Streaming, placar e gols em tempo real, escalações oficiais e alertas no celular.",
      },
      {
        name: "keywords",
        content:
          "jogos ao vivo, futebol ao vivo hoje, onde assistir futebol ao vivo, placar ao vivo, jogos na tv, escalacao oficial, gols ao vivo, campeonato brasileiro ao vivo, champions league ao vivo, libertadores ao vivo, futebol online grátis",
      },
      { property: "og:title", content: "Jogos ao Vivo — Futebol na TV, Streaming, Placar e Gols em Tempo Real" },
      {
        property: "og:description",
        content:
          "Não perca nenhum lance! Acompanhe jogos de futebol ao vivo hoje, onde assistir na TV e Streaming, placar e gols em tempo real e alertas no celular.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/logo.png?v=6" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Jogos ao Vivo — Futebol na TV e Streaming" },
      {
        name: "twitter:description",
        content: "Acompanhe jogos de futebol ao vivo hoje, placar em tempo real e onde assistir na TV e streaming.",
      },
      { name: "twitter:image", content: "/logo.png?v=6" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico?v=6" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png?v=6" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png?v=6" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png?v=6" },
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
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
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
  const { settings } = useSiteSettings();

  // Inicialização do Service Worker para PWA e Push Notifications
  useEffect(() => {
    registerServiceWorker();
  }, []);

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

  return (
    <>
      {/* Banner de Aviso Global configurado pelo Gestor no Painel */}
      {settings.announcement_enabled && settings.announcement_text && (
        <div className="relative z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-2 text-white shadow-md">
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center text-xs font-bold sm:text-sm">
            <Megaphone className="h-4 w-4 shrink-0 animate-bounce" />
            <span>{settings.announcement_text}</span>
            {settings.whatsapp_group_url && (
              <a
                href={settings.whatsapp_group_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-extrabold hover:bg-white/30 transition-colors"
              >
                Participe agora →
              </a>
            )}
          </div>
        </div>
      )}
      <Outlet />
      <PwaInstallBanner />
    </>
  );
}
