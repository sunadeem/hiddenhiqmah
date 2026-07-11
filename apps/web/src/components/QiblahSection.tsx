"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Motion } from "@capacitor/motion";
import { Compass } from "lucide-react";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import { formatLocation, reverseGeocode } from "@hidden-hiqmah/ui/lib/location";
import {
  getFreshCachedLocation,
  setCachedLocation,
  getLocationState,
  setLocationState,
} from "@hidden-hiqmah/ui/lib/location-cache";

/* ───────────────────────── Qiblah section ───────────────────────── */

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calcQiblahBearing(lat: number, lng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const lat2 = toRad(KAABA_LAT);
  const lng2 = toRad(KAABA_LNG);
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return bearing;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function compassDirection(degrees: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(degrees / 22.5) % 16];
}

type QiblahState = {
  lat: number;
  lng: number;
  city: string;
};

interface DeviceOrientationEventWithPermission {
  requestPermission?: () => Promise<"granted" | "denied">;
}

export function QiblahSection({ compact = false }: { compact?: boolean } = {}) {
  const [loc, setLoc] = useState<QiblahState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  // Continuous rotation value that never wraps (e.g. can be 720°), so CSS rotation
  // always takes the shortest path and doesn't spin backwards when 359° → 1°.
  const [displayHeading, setDisplayHeading] = useState<number | null>(null);
  const continuousHeadingRef = useRef<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  const applyHeading = useCallback((newHeading: number) => {
    setHeading(newHeading);
    if (continuousHeadingRef.current === null) {
      continuousHeadingRef.current = newHeading;
      setDisplayHeading(newHeading);
      return;
    }
    const current = continuousHeadingRef.current;
    const wrappedCurrent = ((current % 360) + 360) % 360;
    let delta = newHeading - wrappedCurrent;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const next = current + delta;
    continuousHeadingRef.current = next;
    setDisplayHeading(next);
  }, []);

  const fetchLocation = useCallback(() => {
    // Prefer a recently-cached location set by NextPrayerCard or a prior visit.
    const fresh = getFreshCachedLocation();
    if (fresh) {
      setLoc({ lat: fresh.lat, lng: fresh.lng, city: fresh.display });
      setLoading(false);
      setError(null);
      return;
    }

    // Honor a previous "denied" — don't auto-trigger another prompt.
    if (getLocationState() === "denied") {
      setError("Location access is off. Enable it in Settings to use the compass.");
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation.");
      setLoading(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let city = "Your location";
        const geo = await reverseGeocode(latitude, longitude);
        if (geo) city = formatLocation(geo) || "Unknown";
        setLoc({ lat: latitude, lng: longitude, city });
        setLoading(false);
        setError(null);
        setLocationState("granted");
        setCachedLocation({
          lat: latitude,
          lng: longitude,
          city: geo?.city || "Your location",
          country: geo?.countryName || "",
          display: city,
        });
      },
      () => {
        setError("Couldn't get your location. Allow location access and try again.");
        setLoading(false);
        setLocationState("denied");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Device orientation (compass) — sets up listener and handles iOS permission
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    const DeviceOrientationEventCls = (window as unknown as { DeviceOrientationEvent?: DeviceOrientationEventWithPermission })
      .DeviceOrientationEvent;

    const handler = (e: DeviceOrientationEvent) => {
      const webkitHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === "number") {
        applyHeading(webkitHeading);
      } else if (typeof e.alpha === "number") {
        applyHeading((360 - e.alpha) % 360);
      }
    };

    const attach = () => {
      window.addEventListener("deviceorientationabsolute", handler as EventListener);
      window.addEventListener("deviceorientation", handler);
    };

    // ── Native app: auto-start the compass, no permission button ──
    if (isNative) {
      let motionRemove: (() => void) | undefined;
      (async () => {
        // In the WKWebView the Safari-style requestPermission gesture isn't
        // required; attach the orientation listener directly (delivers
        // webkitCompassHeading on iOS). Also start @capacitor/motion as a
        // native fallback source.
        try {
          if (typeof DeviceOrientationEventCls?.requestPermission === "function") {
            await DeviceOrientationEventCls.requestPermission().catch(() => {});
          }
        } catch {
          /* ignore */
        }
        attach();
        try {
          const l = await Motion.addListener("orientation", (e) => {
            const wk = (e as { webkitCompassHeading?: number }).webkitCompassHeading;
            if (typeof wk === "number") applyHeading(wk);
            else if (typeof e.alpha === "number") applyHeading((360 - e.alpha) % 360);
          });
          motionRemove = () => l.remove();
        } catch {
          /* motion unavailable */
        }
      })();
      return () => {
        window.removeEventListener("deviceorientationabsolute", handler as EventListener);
        window.removeEventListener("deviceorientation", handler);
        motionRemove?.();
      };
    }

    // ── Web ──
    if (!DeviceOrientationEventCls) return;
    if (typeof DeviceOrientationEventCls.requestPermission === "function") {
      // iOS Safari requires a user gesture → show the enable button.
      setNeedsPermission(true);
      return;
    }
    attach();
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler as EventListener);
      window.removeEventListener("deviceorientation", handler);
    };
  }, [applyHeading]);

  const requestCompassPermission = async () => {
    const DeviceOrientationEventCls = (window as unknown as { DeviceOrientationEvent?: DeviceOrientationEventWithPermission })
      .DeviceOrientationEvent;
    if (!DeviceOrientationEventCls?.requestPermission) return;
    const res = await DeviceOrientationEventCls.requestPermission();
    if (res === "granted") {
      setNeedsPermission(false);
      const handler = (e: DeviceOrientationEvent) => {
        const webkitHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
        if (typeof webkitHeading === "number") {
          applyHeading(webkitHeading);
        } else if (typeof e.alpha === "number") {
          applyHeading((360 - e.alpha) % 360);
        }
      };
      window.addEventListener("deviceorientation", handler);
    }
  };

  const qiblahBearing = loc ? calcQiblahBearing(loc.lat, loc.lng) : null;
  const distanceKm = loc ? haversineKm(loc.lat, loc.lng, KAABA_LAT, KAABA_LNG) : null;
  // If we have a live device heading, the arrow rotates relative to it

  return (
    <div className="space-y-6">
      {/* Intro */}
      {!compact && <ContentCard delay={0.05}>
        <h3 className="text-gold font-semibold text-lg mb-3">What is the Qiblah?</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          The <span className="text-gold">qiblah</span> is the direction Muslims face during salah — toward the <span className="text-gold">Ka&apos;bah</span> in Makkah. It unites the entire ummah: at any moment of day or night, somewhere on earth a Muslim is praying, and they are all facing the same point.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          For the first 16-17 months in Madinah, the Prophet ﷺ and the believers faced <span className="text-gold">Jerusalem</span> during prayer. Then Allah revealed:
        </p>
        <div className="my-3">
          <p className="font-arabic text-gold text-lg leading-loose mb-1">
            فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ۚ وَحَيْثُ مَا كُنتُمْ فَوَلُّوا وُجُوهَكُمْ شَطْرَهُ
          </p>
          <p className="text-themed text-sm leading-relaxed mb-1">Fawalli wajhaka shatra al-masjidi al-haram, wa haythu ma kuntum fawallu wujuhakum shatrah</p>
          <p className="text-themed-muted text-sm leading-relaxed italic">&ldquo;Turn your face toward al-Masjid al-Haram. And wherever you are, turn your faces toward it.&rdquo;</p>
          <p className="text-xs text-gold/80 mt-1">Quran 2:144</p>
        </div>
        <p className="text-themed-muted text-sm leading-relaxed">
          From that moment, every Muslim has faced Makkah in prayer.
        </p>
      </ContentCard>}

      {/* Compass */}
      <ContentCard delay={0.08}>
        <h3 className="text-gold font-semibold text-lg mb-3 flex items-center gap-2">
          <Compass size={18} /> Qiblah Direction From Your Location
        </h3>

        {loading && <p className="text-themed-muted text-sm">Detecting your location…</p>}

        {error && (
          <div>
            <p className="text-themed-muted text-sm mb-3">{error}</p>
            <button
              onClick={fetchLocation}
              className="px-4 py-2 rounded-lg card-bg border sidebar-border text-themed hover:border-gold/40 hover:text-gold transition-colors text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {loc && qiblahBearing !== null && (
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Compass visual — dial is fixed (N stays at top, Ka'bah stays at qibla bearing);
                only the "you are facing" arrow rotates with device heading. */}
            <div className="relative w-56 h-56 shrink-0">
              {/* Rotating dial — the arrow stays fixed pointing up; N/E/S/W cardinals and the
                  Ka'bah marker rotate to match the real-world bearing relative to where you're
                  facing. When the Ka'bah marker arrives at the top, you're facing the qiblah. */}
              <div className="absolute inset-0 rounded-full border-2 border-gold/30 bg-gold/[0.03]">
                {/* Cardinal markers — positioned at (cardinal - displayHeading) */}
                {[
                  { label: "N", deg: 0, color: "text-gold" },
                  { label: "E", deg: 90 },
                  { label: "S", deg: 180 },
                  { label: "W", deg: 270 },
                ].map(({ label, deg, color }) => {
                  const screenAngle = deg - (displayHeading ?? 0);
                  return (
                    <div
                      key={label}
                      className="absolute inset-0 flex items-start justify-center"
                      style={{
                        transform: `rotate(${screenAngle}deg)`,
                        transition: "transform 80ms linear",
                      }}
                    >
                      <span
                        className={`text-xs font-semibold mt-1 ${color ?? "text-themed-muted"}`}
                        style={{
                          transform: `rotate(${-screenAngle}deg)`,
                          transition: "transform 80ms linear",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}

                {/* Tick marks — rotate with the dial */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const screenAngle = i * 15 - (displayHeading ?? 0);
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-0 h-2 w-px bg-themed-muted/30"
                      style={{
                        transform: `translateX(-50%) rotate(${screenAngle}deg)`,
                        transformOrigin: "bottom center",
                        top: 6,
                        transition: "transform 80ms linear",
                      }}
                    />
                  );
                })}

                {/* Ka'bah marker — positioned at (qiblahBearing - displayHeading) */}
                {(() => {
                  const screenAngle = qiblahBearing - (displayHeading ?? 0);
                  return (
                    <div
                      className="absolute inset-0 flex items-start justify-center"
                      style={{
                        transform: `rotate(${screenAngle}deg)`,
                        transition: "transform 80ms linear",
                      }}
                    >
                      <div
                        className="flex flex-col items-center"
                        style={{
                          marginTop: "12px",
                          transform: `rotate(${-screenAngle}deg)`,
                          transition: "transform 80ms linear",
                        }}
                      >
                        <div className="w-5 h-5 rounded-sm bg-gold border border-gold/60 shadow-[0_0_10px_rgba(212,168,67,0.6)]" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-gold mt-1">Ka&apos;bah</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Fixed user-facing arrow — only shown when a device compass is available.
                  Centered inside the dial, always points straight up. When the Ka'bah marker
                  rotates so it sits at the top, the user is facing the qiblah. */}
              {heading !== null && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 24 24"
                    className={
                      Math.abs(((heading - qiblahBearing + 540) % 360) - 180) < 5
                        ? "text-gold drop-shadow-[0_0_12px_rgba(212,168,67,0.9)]"
                        : "text-themed drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"
                    }
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1"
                  >
                    {/* Dart/arrow pointing straight up: tip at top-center, notch at bottom-center */}
                    <path d="M12 2 L20 21 L12 17 L4 21 Z" />
                  </svg>
                </div>
              )}

              {/* Center bearing label — only shown when the arrow isn't (desktop / no sensor) */}
              {heading === null && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gold font-mono">{Math.round(qiblahBearing)}°</p>
                    <p className="text-[10px] uppercase tracking-wider text-themed-muted">
                      {compassDirection(qiblahBearing)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-2 text-sm">
              <p className="text-themed-muted">From <span className="text-themed">{loc.city}</span></p>
              <p className="text-themed-muted">
                Bearing: <span className="text-gold font-mono">{qiblahBearing.toFixed(1)}°</span> from true North ({compassDirection(qiblahBearing)})
              </p>
              {distanceKm && (
                <p className="text-themed-muted">
                  Distance to Ka&apos;bah: <span className="text-themed font-mono">{Math.round(distanceKm).toLocaleString()} km</span> <span className="text-themed-muted">/</span> <span className="text-themed font-mono">{Math.round(distanceKm * 0.621371).toLocaleString()} mi</span>
                </p>
              )}
              {needsPermission && (
                <button
                  onClick={requestCompassPermission}
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 transition-colors text-sm font-medium"
                >
                  <Compass size={16} /> Enable live compass
                </button>
              )}
              {heading === null && !needsPermission && (
                <>
                  <p className="text-xs text-themed-muted mt-3">
                    Hold a compass (or use a compass app) and align it so the needle points to <span className="text-gold font-mono">{Math.round(qiblahBearing)}°</span>. That direction is the qiblah from where you are standing.
                  </p>
                  <p className="text-xs text-gold/80 mt-2">
                    Tip: Visit this page on your phone for a live qiblah direction using its built-in compass.
                  </p>
                </>
              )}
              {heading !== null && (
                <p className="text-xs text-themed-muted mt-3">
                  The dial rotates as you turn — keep turning until the Ka&apos;bah marker arrives at the top, right under the arrow. That direction is the qiblah. Hold your phone flat for the most accurate reading.
                </p>
              )}
            </div>
          </div>
        )}
      </ContentCard>

      {/* If you're not sure */}
      {!compact && <ContentCard delay={0.11}>
        <h3 className="text-gold font-semibold text-lg mb-3">What if I&apos;m not sure which way to face?</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          Do your best. If you genuinely tried to determine the qiblah and prayed in good faith, your prayer is valid even if you later discover you were facing the wrong direction. The Prophet ﷺ said:
        </p>
        <div className="my-3">
          <p className="text-themed-muted text-sm leading-relaxed italic">
            &ldquo;What is between the east and the west is qiblah.&rdquo;
          </p>
          <p className="text-xs text-gold/80 mt-1">
            <HadithRefText text="Tirmidhi 2:194" className="inline" />
          </p>
        </div>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          This was the Prophet&apos;s ﷺ guidance for the people of Madinah (north of Makkah), meaning the entire southern arc was acceptable when precise direction was unknown. The principle generalizes: when in doubt, face the most likely direction with sincerity. If you can use a compass or compass app, do so. If not, ask a Muslim local or use the sun.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          For travelers on planes, trains, or in cars where exact direction is impossible, face whatever direction you can and pray — Allah does not burden a soul beyond its capacity (Quran 2:286).
        </p>
      </ContentCard>}

      {!compact && <SourcesCard className="mt-6" sources={[
        { ref: "Quran 2:142-145", desc: "The change of qiblah from Jerusalem to the Ka'bah" },
        { ref: "Quran 2:144", desc: "Turn your face toward al-Masjid al-Haram" },
        { ref: "Tirmidhi 2:194", desc: "What is between east and west is qiblah" },
        { ref: "Quran 2:286", desc: "Allah does not burden a soul beyond its capacity" },
      ]} />}
    </div>
  );
}

export default QiblahSection;
