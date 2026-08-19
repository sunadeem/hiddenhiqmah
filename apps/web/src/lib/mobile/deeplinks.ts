import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

import { parkDeepLink } from "./deep-link-latch";

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
 * A tap is handed to its screen three ways, because no one of them covers every
 * arrival (see `go` below): the navigation itself, the URL, and a
 * `hiqmah:deep-link-nav` broadcast backed by the deep-link-latch mailbox for the
 * cold start where the broadcast outruns its listener. Screens listen for the
 * event the same way they listen for `hiqmah:push-nav` (lib/mobile/qiblah-param.ts).
 *
 * Works via the custom scheme `hiddenhiqmah://…` (registered in Info.plist); the
 * same parser handles universal links once Associated Domains + AASA are set up.
 * No-op on web.
 */
const WIDGET_ROUTES: Record<string, string> = {
  // scheme host/path → in-app route. Keep in sync with widgetURL values in
  // ios/App/HiqmahWidgets/*.swift — a key missing here silently degrades to
  // "just open the app".
  // The qibla widget lands on HOME with the compass sheet open, not the /qiblah
  // article: a widget tap means "which way do I pray right now", and the sheet is
  // one swipe from the rest of the app instead of a separate page to back out of.
  // qiblah-param.ts consumes the flag.
  qiblah: "/?qiblah=1",
  "prayer-times": "/prayer-times",
  "muslim-daily": "/muslim-daily",
  "islamic-calendar": "/islamic-calendar",
};

/**
 * sessionStorage key holding the launch URL this WebView has already acted on.
 * Survives a reload (which is the point) but not a relaunch (which is also the
 * point) — see the launch-delivery note in `routeUrl`.
 */
const LAUNCH_URL_KEY = "hiqmah:launch-url-handled";

function launchMark(): string | null {
  try {
    return window.sessionStorage.getItem(LAUNCH_URL_KEY);
  } catch {
    return null; // storage disabled — worst case the link is handled twice
  }
}

function setLaunchMark(url: string): void {
  try {
    window.sessionStorage.setItem(LAUNCH_URL_KEY, url);
  } catch {
    /* ignore */
  }
}

export function registerDeepLinkHandler(navigate: (path: string) => void): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};

  /**
   * Hand a resolved in-app route to its screen. Three deliveries, because each
   * one alone has a hole:
   *
   *   1. The navigation. Covers any route with a pathname of its own — the
   *      target screen mounts and reads the URL itself. Useless for "/?qiblah=1",
   *      a query-only change to the pathname the app already booted on: there is
   *      nothing to mount. Worse, router.push of a query-only route either does
   *      nothing at all or hard-reloads the app, because Capacitor's asset server
   *      can't serve an RSC payload for "/?qiblah=1" and the App Router falls back
   *      to an MPA navigation — booting the whole app a second time. So a
   *      same-pathname route is written straight to the URL instead; that is the
   *      App Router's supported shallow update (qiblah-param.ts and CirclesScreen
   *      already strip their params the same way).
   *   2. The URL + the latch. Covers the cold start, where the link resolves
   *      before the consuming screen exists.
   *   3. The broadcast. Covers the already-foregrounded tap, where the consumer
   *      mounted long ago and nothing is going to remount.
   */
  const go = (route: string) => {
    const target = new URL(route, window.location.href);
    // Only query-carrying routes are parked: they're the ones no navigation can
    // deliver on its own.
    if (target.search) parkDeepLink(route);
    if (target.pathname === window.location.pathname) {
      try {
        window.history.replaceState(null, "", target.pathname + target.search);
      } catch {
        /* history unavailable — the latch and the broadcast still carry it */
      }
    } else {
      navigate(route);
    }
    try {
      window.dispatchEvent(new CustomEvent("hiqmah:deep-link-nav", { detail: { url: route } }));
    } catch {
      /* ignore */
    }
  };

  // Capacitor delivers the launch link twice — getLaunchUrl, and the launch
  // intent replayed through appUrlOpen — measured ~7ms apart. Whichever lands
  // first wins; the other is a duplicate, not a second tap.
  let lastUrl = "";
  let lastAt = 0;

  const routeUrl = (url: string | null | undefined, viaLaunchApi = false) => {
    if (!url) return;
    if (viaLaunchApi) {
      // Bridge.intentUri is never cleared, so getLaunchUrl keeps returning the
      // widget URI for the whole process. Without this mark a reload (pull to
      // refresh, or that RSC fallback) re-fires the original tap and yanks the
      // user back to the widget's page long after they walked away from it.
      // Marked even when the duplicate check below is about to drop this call, so
      // a launch that came through appUrlOpen first is still recorded. ONLY the
      // launch API is marked — a live appUrlOpen is a real tap, and the user is
      // allowed to tap the same widget twice.
      const alreadyActedOn = launchMark() === url;
      setLaunchMark(url);
      if (alreadyActedOn) return;
    }
    const now = Date.now();
    if (url === lastUrl && now - lastAt < 500) return;
    lastUrl = url;
    lastAt = now;

    let parsed: URL | null = null;
    try {
      parsed = new URL(url);
    } catch {
      parsed = null;
    }
    if (!parsed) return;

    const code = parsed.searchParams.get("code");
    if (code) {
      go(`/circles?join=${encodeURIComponent(code)}`);
      return;
    }

    // For a custom scheme like hiddenhiqmah://qiblah the page name lands in the
    // HOST slot; for hiddenhiqmah:///qiblah it's the path — and for a universal
    // link (https://<domain>/qiblah) the host is the DOMAIN, so the path must be
    // consulted too. Check BOTH slots rather than short-circuiting on host.
    const hostKey = parsed.host.toLowerCase();
    const pathKey = (parsed.pathname.replace(/^\/+/, "").split("/")[0] || "").toLowerCase();
    const route = WIDGET_ROUTES[hostKey] ?? WIDGET_ROUTES[pathKey];
    if (!route) return;
    go(route);
  };

  // Cold start: the URL that launched the app.
  CapApp.getLaunchUrl()
    .then((res) => routeUrl(res?.url, true))
    .catch(() => {});

  // Running app: subsequent links — plus, on a cold start, the launch intent
  // replayed by BridgeActivity.onCreate.
  const handle = CapApp.addListener("appUrlOpen", ({ url }) => routeUrl(url));
  return () => {
    void handle.then((h) => h.remove());
  };
}
