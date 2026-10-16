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
        content: "Leitura da Bíblia em português direto, no hebraico e no grego originais, e transliterado.",
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
        href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&family=IM+Fell+English:ital@1&family=Uncial+Antiqua&family=Frank+Ruhl+Libre:wght@400;500;700&family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400;1,7..72,500&display=swap",
      },
    ],
    scripts: [
      {
        // Endereço oficial: quem abrir pelo endereço antigo (*.workers.dev) ou
        // pelo "www" vai para https://bibliaorigens.app no mesmo caminho.
        // App instalado aberto no endereço principal (ícones adicionados antes da
        // mudança): vai direto para a abertura, sem passar pela página pública.
        children: `(function(){var h=location.hostname;if(h==="www.bibliaorigens.app"||/\\.workers\\.dev$/.test(h)){location.replace("https://bibliaorigens.app"+location.pathname+location.search+location.hash);return;}var st=navigator.standalone===true||(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches);if(st&&location.pathname==="/"){location.replace("/abrir"+location.search+location.hash);}})();`,
      },
      {
        children: `(function(){try{var r=localStorage.getItem("bo-study-v1");if(!r)return;var s=JSON.parse(r);if(s.theme==="light"||s.theme==="sepia")document.documentElement.classList.add("light");if(s.theme==="sepia")document.documentElement.classList.add("sepia");if(s.fontScale)document.documentElement.dataset.scale=s.fontScale;}catch(e){}})();`,
      },
    ],
  }),
  component: Root,
});

/**
 * CSS crítico, antes de qualquer outro estilo: a página já nasce no fundo do app
 * e o conteúdo fica oculto até o CSS principal chegar (ele devolve a
 * visibilidade em styles.css). Sem isso, o celular mostrava por um instante a
 * página crua, com fundo branco e letra padrão. Se o CSS principal falhar, o
 * conteúdo aparece mesmo assim depois de 4 segundos.
 */
const CRITICAL_CSS =
  "html{background:#0d1120;color:#f1ede4;color-scheme:dark}" +
  "html.light{background:#f4f5f9;color:#141832;color-scheme:light}" +
  "html.light.sepia{background:#f3e9d4;color:#2b2112}" +
  "body{margin:0;visibility:hidden;animation:bo-reveal 0s linear 4s forwards}" +
  "@keyframes bo-reveal{to{visibility:visible}}";

function Root() {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
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
