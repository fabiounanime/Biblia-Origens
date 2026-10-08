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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "Leitura do Tanakh em português direto, hebraico e transliterado.",
      },
      { name: "theme-color", content: "#140e0a" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Frank+Ruhl+Libre:wght@500;700&display=swap",
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
