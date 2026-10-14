import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ThemeBinder } from "@/components/theme-binder";
import appCss from "../styles.css?url";

const APP_NAME = "Bíblia Origens";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      {
        name: "description",
        content: "Leitura do Tanakh em português direto, hebraico e transliterado.",
      },
      { name: "theme-color", content: "#0d1120" },
      // Nome do ícone na Tela de Início (iPhone) e no Android.
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "application-name", content: APP_NAME },
    ],
    links: [
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32.png" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "stylesheet", href: appCss },
      // Manifesto e ícone próprios do app. Ficam antes dos que a camada do Grok
      // acrescenta no fim do <head>: o navegador usa o primeiro manifesto, e o
      // iPhone escolhe o ícone com sizes="180x180" (sem sizes conta como 60x60).
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Frank+Ruhl+Libre:wght@400;500;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400;1,7..72,500&display=swap",
      },
    ],
    scripts: [
      {
        children: `(function(){try{var r=localStorage.getItem("bo-study-v1");if(!r)return;var s=JSON.parse(r);if(s.theme==="light")document.documentElement.classList.add("light");if(s.fontScale)document.documentElement.dataset.scale=s.fontScale;}catch(e){}})();`,
      },
    ],
  }),
  component: Root,
});

function Root() {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <PreviewHostBridge />
        <ThemeBinder />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
