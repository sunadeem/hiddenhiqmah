import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

/**
 * Route inbound deep links into the app. Handles both a running app (appUrlOpen)
 * and a cold start (getLaunchUrl — appUrlOpen does NOT fire for the launch that
 * opened the app). Today the only payload is a circle invite: any link carrying a
 * `code` query param is sent to the join flow (/circles?join=CODE), where the
 * screen consumes it once the user is signed in.
 *
 * Works now via the custom scheme `hiddenhiqmah://join?code=XXXXXX` (registered in
 * Info.plist). The same parser also handles a universal link
 * `https://<domain>/join?code=XXXXXX` once Associated Domains + an AASA file are
 * set up (needs the Apple Developer account). No-op on web.
 */
export function registerDeepLinkHandler(navigate: (path: string) => void): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};

  const routeUrl = (url: string | null | undefined) => {
    if (!url) return;
    let code: string | null = null;
    try {
      code = new URL(url).searchParams.get("code");
    } catch {
      code = null;
    }
    if (code) navigate(`/circles?join=${encodeURIComponent(code)}`);
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
