import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE_NAME} | ${SITE_TAGLINE}` },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "theme-color", content: "#7B00A6" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: `${SITE_NAME} | ${SITE_TAGLINE}` },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://job.jayatalent.com/og.png" },
      { property: "og:image:secure_url", content: "https://job.jayatalent.com/og.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Jaya Talent — Your Web3 Recruitment Partner" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@JayaTalent" },
      { name: "twitter:title", content: `${SITE_NAME} | ${SITE_TAGLINE}` },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: "https://job.jayatalent.com/og.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "shortcut icon", type: "image/png", href: "/favicon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700..900;1,700..900&family=Outfit:wght@400..800&family=Plus+Jakarta+Sans:wght@400..800&family=Wix+Madefor+Display:wght@400..800&family=Wix+Madefor+Text:ital,wght@0,400..800;1,400..800&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg text-ink">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
