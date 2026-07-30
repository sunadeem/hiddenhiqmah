import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

/**
 * Route inbound deep links into the app. Handles both a running app (appUrlOpen)
 * and a cold start (getLaunchUrl — appUrlOpen does NOT fire for the launch that
 * opened the app). Two payload shapes:
 *
 *   1. Circle invites — any link carrying a `code` query param goes to the join
 *      flow (/circles?join=CODE), consumed once the user is signed in.
 *   2. Widget taps — `hiddenhiqmah://<page>` routes to that page for a small
 *      allow-list. A widget is a static snapshot (no sensors, no live compass),
 *      so the tap-through IS the widget's live mode: the qibla widget lands
 *      directly on the real compass. Unknown paths deliberately no-op — the app
 *      just opens — so an old binary receiving a newer widget's URL never breaks.
 *
 * Works via the custom scheme `hiddenhiqmah://…` (registered in Info.plist); the
 * same parser handles universal links once Associated Domains + AASA are set up.
 * No-op on web.
 */
const WIDGET_ROUTES: Record<string, string> = {
  // scheme host/path → in-app route. Keep in sync with widgetURL values in
  // ios/App/HiqmahWidgets/*.swift — a key missing here silently degrades to
  // "just open the app".
  qiblah: "/qiblah",
  "prayer-times": "/prayer-times",
  "muslim-daily": "/muslim-daily",
  "islamic-calendar": "/islamic-calendar",
};

export function registerDeepLinkHandler(navigate: (path: string) => void): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};

  const routeUrl = (url: string | null | undefined) => {
    if (!url) return;
    let parsed: URL | null = null;
    try {
      parsed = new URL(url);
    } catch {
      parsed = null;
    }
    if (!parsed) return;

    const code = parsed.searchParams.get("code");
    if (code) {
      navigate(`/circles?join=${encodeURIComponent(code)}`);
      return;
    }

    // For a custom scheme like hiddenhiqmah://qiblah the page name lands in the
    // HOST slot; for hiddenhiqmah:///qiblah it's the path — and for a universal
    // link (https://<domain>/qiblah) the host is the DOMAIN, so the path must be
    // consulted too. Check BOTH slots rather than short-circuiting on host.
    const hostKey = parsed.host.toLowerCase();
    const pathKey = (parsed.pathname.replace(/^\/+/, "").split("/")[0] || "").toLowerCase();
    const route = WIDGET_ROUTES[hostKey] ?? WIDGET_ROUTES[pathKey];
    if (route) navigate(route);
  };

  // Cold start: the URL that launched the app.
  CapApp.getLaunchUrl()
    .then((res) => routeUrl(res?.url))
    .catch(() => {});

  // Running app: subsequent links.
  const handle = CapApp.addListener("appUrlOpen", ({ url }) => routeUrl(url));
  return () => {
    void handle.then((h) => h.remove());
  };
}
