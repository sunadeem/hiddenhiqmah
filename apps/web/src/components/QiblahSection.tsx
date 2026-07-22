"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Capacitor } from "@capacitor/core";
import { Motion } from "@capacitor/motion";
import { Compass } from "lucide-react";
import { hapticSuccess } from "@/lib/mobile/haptics";
import { model as geomagneticModel } from "geomagnetism";
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

// Magnetic declination (degrees, east-positive) at a location, from the World
// Magnetic Model. Device compasses (webkitCompassHeading / absolute alpha) are
// referenced to MAGNETIC north, while the qiblah bearing is from TRUE north —
// without this correction the needle is off by the local declination
// (~10.5°W in Virginia, for example).
function calcMagneticDeclination(lat: number, lng: number): number | null {
  try {
    return geomagneticModel().point([lat, lng]).decl;
  } catch {
    return null;
  }
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
  // Magnetic declination at the user's location (east-positive). Kept in a ref
  // so the high-frequency orientation handler reads the latest value without
  // re-attaching listeners; mirrored in state for the caption.
  const declinationRef = useRef(0);
  const [declination, setDeclination] = useState<number | null>(null);
  // Alignment state with hysteresis (enter ≤4°, exit ≥8°) so the "facing" state
  // doesn't flicker at the boundary; the haptic fires once on entry.
  const [aligned, setAligned] = useState(false);
  const alignedRef = useRef(false);
  // Sensor-trust hints, bucketed so the 60Hz handler only re-renders on change.
  const [calibrationPoor, setCalibrationPoor] = useState(false);
  const calibrationPoorRef = useRef(false);
  const [tilted, setTilted] = useState(false);
  const tiltedRef = useRef(false);

  const applyHeading = useCallback((magneticHeading: number) => {
    // Device heading is relative to magnetic north; shift it to true north so
    // it matches the true-north qiblah bearing.
    const newHeading = (((magneticHeading + declinationRef.current) % 360) + 360) % 360;
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

  // Recompute magnetic declination whenever the location changes.
  useEffect(() => {
    if (!loc) return;
    const decl = calcMagneticDeclination(loc.lat, loc.lng);
    declinationRef.current = decl ?? 0;
    setDeclination(decl);
  }, [loc]);

  // Shared handler for every orientation source: heading, plus the two trust
  // signals iOS delivers on the same event — webkitCompassAccuracy (max error
  // in degrees; negative = sensor needs calibration) and beta/gamma tilt
  // (compass readings degrade when the phone isn't reasonably flat).
  const processOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      const ev = e as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
        webkitCompassAccuracy?: number;
      };
      if (typeof ev.webkitCompassHeading === "number") {
        applyHeading(ev.webkitCompassHeading);
      } else if (typeof e.alpha === "number") {
        applyHeading((360 - e.alpha) % 360);
      }

      if (typeof ev.webkitCompassAccuracy === "number") {
        const poor = ev.webkitCompassAccuracy < 0 || ev.webkitCompassAccuracy > 25;
        if (poor !== calibrationPoorRef.current) {
          calibrationPoorRef.current = poor;
          setCalibrationPoor(poor);
        }
      }

      if (typeof e.beta === "number" && typeof e.gamma === "number") {
        const tilt = Math.max(Math.abs(e.beta), Math.abs(e.gamma));
        if (!tiltedRef.current && tilt > 55) {
          tiltedRef.current = true;
          setTilted(true);
        } else if (tiltedRef.current && tilt < 40) {
          tiltedRef.current = false;
          setTilted(false);
        }
      }
    },
    [applyHeading]
  );

  // Device orientation (compass) — sets up listener and handles iOS permission
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    const DeviceOrientationEventCls = (window as unknown as { DeviceOrientationEvent?: DeviceOrientationEventWithPermission })
      .DeviceOrientationEvent;

    const handler = processOrientation;

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
            processOrientation(e as unknown as DeviceOrientationEvent);
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
  }, [processOrientation]);

  const requestCompassPermission = async () => {
    const DeviceOrientationEventCls = (window as unknown as { DeviceOrientationEvent?: DeviceOrientationEventWithPermission })
      .DeviceOrientationEvent;
    if (!DeviceOrientationEventCls?.requestPermission) return;
    const res = await DeviceOrientationEventCls.requestPermission();
    if (res === "granted") {
      setNeedsPermission(false);
      window.addEventListener("deviceorientation", processOrientation);
    }
  };

  const qiblahBearing = loc ? calcQiblahBearing(loc.lat, loc.lng) : null;
  const distanceKm = loc ? haversineKm(loc.lat, loc.lng, KAABA_LAT, KAABA_LNG) : null;
  // Signed shortest turn from current facing to the qiblah: positive = turn right.
  const turnDelta =
    heading !== null && qiblahBearing !== null
      ? ((qiblahBearing - heading + 540) % 360) - 180
      : null;

  // Enter/exit the aligned state with hysteresis; buzz once on entry.
  useEffect(() => {
    if (turnDelta === null) {
      if (alignedRef.current) {
        alignedRef.current = false;
        setAligned(false);
      }
      return;
    }
    const off = Math.abs(turnDelta);
    // Never celebrate off a reading the sensor itself reports as invalid.
    if (!alignedRef.current && off <= 4 && !calibrationPoorRef.current) {
      alignedRef.current = true;
      setAligned(true);
      hapticSuccess();
    } else if (alignedRef.current && off >= 8) {
      alignedRef.current = false;
      setAligned(false);
    }
  }, [turnDelta]);

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
            <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
            <div className="relative aspect-square w-full max-w-96 md:w-96">
              {/* Rotating dial — the arrow stays fixed pointing up; N/E/S/W cardinals and the
                  Ka'bah marker rotate to match the real-world bearing relative to where you're
                  facing. When the Ka'bah marker arrives at the top, you're facing the qiblah. */}
              <div
                className={`absolute inset-0 rounded-full border-2 bg-gold/[0.03] transition-[border-color,box-shadow] duration-300 ${
                  aligned
                    ? "border-gold shadow-[0_0_28px_rgba(212,168,67,0.35)]"
                    : "border-gold/30"
                }`}
              >
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
                        className={`text-sm font-semibold mt-1.5 ${color ?? "text-themed-muted"}`}
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
                        <div className="w-6 h-6 rounded-sm bg-gold border border-gold/60 shadow-[0_0_10px_rgba(212,168,67,0.6)]" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gold mt-1">Ka&apos;bah</span>
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
                    width="88"
                    height="88"
                    viewBox="0 0 24 24"
                    className={
                      aligned
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
                    <p className="text-3xl font-semibold text-gold font-mono">{Math.round(qiblahBearing)}°</p>
                    <p className="text-[10px] uppercase tracking-wider text-themed-muted">
                      {compassDirection(qiblahBearing)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Live status — the celebration when aligned, turn guidance when not. */}
            {heading !== null && turnDelta !== null && (
              <div className="mt-4 text-center min-h-[28px]">
                {aligned ? (
                  <p className="text-gold font-semibold text-lg">Facing the Qiblah ✓</p>
                ) : (
                  <p className="text-themed text-base">
                    Turn {turnDelta > 0 ? "right" : "left"}{" "}
                    <span className="text-gold font-mono font-semibold">
                      {Math.round(Math.abs(turnDelta))}°
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Sensor-trust hints — most "wrong qibla" reports are an
                uncalibrated or steeply tilted compass; say so. */}
            {heading !== null && calibrationPoor && (
              <p className="text-[11px] text-gold/80 mt-2 text-center">
                Compass accuracy is low — wave your phone in a figure-8 to recalibrate.
              </p>
            )}
            {heading !== null && !calibrationPoor && tilted && (
              <p className="text-[11px] text-gold/80 mt-2 text-center">
                Hold your phone flat for an accurate reading.
              </p>
            )}

            {/* Declination caption — shown while the live compass is active and
                the magnetic→true correction is being applied. */}
            {heading !== null && declination !== null && Math.abs(declination) >= 0.05 && (
              <p className="text-[10px] text-themed-muted mt-2 text-center">
                Compass corrected for magnetic declination ({Math.abs(declination).toFixed(1)}°{declination >= 0 ? "E" : "W"})
              </p>
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
              {compact && (
                <Link
                  href="/qiblah"
                  className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Why do we face the Ka&apos;bah? →
                </Link>
              )}
            </div>
          </div>
        )}
      </ContentCard>

      {/* Why the Ka'bah — and the "do Muslims worship it?" misconception */}
      {!compact && <ContentCard delay={0.11}>
        <h3 className="text-gold font-semibold text-lg mb-3">Why the Ka&apos;bah — and do Muslims worship it?</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          The <span className="text-gold">Ka&apos;bah</span> is not an idol and Muslims do not worship it. It is a direction, not a deity — a single point the whole ummah turns toward so that worship is united and ordered. Worship itself is for <span className="text-gold">Allah alone</span>.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          The Qur&apos;an calls it the first house of worship ever set up for humanity:
        </p>
        <div className="my-3">
          <p className="text-themed-muted text-sm leading-relaxed italic">
            &ldquo;The first House [of worship] established for mankind was the one at Bakkah…&rdquo;
          </p>
          <p className="text-xs text-gold/80 mt-1"><HadithRefText text="Quran 3:96" className="inline" /></p>
        </div>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          Its foundations were raised by the Prophet <span className="text-gold">Ibrahim</span> and his son <span className="text-gold">Isma&apos;il</span> — <span className="italic">&ldquo;…Abraham was raising the foundations of the House and Ishmael…&rdquo;</span> (<HadithRefText text="Quran 2:127" className="inline" />) — and the Prophet ﷺ named it the first mosque ever built on earth. When Abu Dharr asked <span className="italic">&ldquo;Which mosque was first built on the surface of the earth?&rdquo;</span> he answered that it was the Sacred Mosque (al-Masjid al-Haram), built forty years before al-Aqsa (<HadithRefText text="Bukhari 60:40" className="inline" />).
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          That the direction is obedience — not stone-veneration — is captured by <span className="text-gold">Umar ibn al-Khattab</span>, who kissed the Black Stone of the Ka&apos;bah and said: <span className="italic">&ldquo;you are a stone and can neither benefit anyone nor harm anyone&rdquo;</span> — he did so only in following the Prophet ﷺ, not because the stone itself holds any power (<HadithRefText text="Bukhari 25:83" className="inline" />).
        </p>
      </ContentCard>}

      {/* The day the qiblah changed */}
      {!compact && <ContentCard delay={0.14}>
        <h3 className="text-gold font-semibold text-lg mb-3">The day the qiblah changed</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          Al-Bara&apos; ibn &apos;Azib remembered it vividly. The Prophet ﷺ prayed toward Jerusalem <span className="italic">&ldquo;…for sixteen or seventeen months, but he wished that he could pray facing the Ka&apos;ba…&rdquo;</span> The command came during an &apos;Asr prayer, and word spread quickly (<HadithRefText text="Bukhari 2:33" className="inline" />).
        </p>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          The next morning the congregation at the <span className="text-gold">Quba mosque</span> was mid-prayer when a passer-by announced the revelation; they pivoted from Jerusalem toward the Ka&apos;bah without breaking their prayer (<HadithRefText text="Bukhari 65:15" className="inline" />; <HadithRefText text="Bukhari 65:17" className="inline" />; <HadithRefText text="Bukhari 65:18" className="inline" />). The mosque in Madinah where an earlier turn is remembered is still called <span className="text-gold">Masjid al-Qiblatayn</span> — &ldquo;the Mosque of the Two Qiblahs.&rdquo;
        </p>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          Allah foretold the objection and answered it: <span className="italic">&ldquo;To Allah belong the east and west…&rdquo;</span> (<HadithRefText text="Quran 2:142" className="inline" />), and the change was <span className="italic">&ldquo;…except to distinguish those who would follow the Messenger from those who would turn back on their heels…&rdquo;</span> (<HadithRefText text="Quran 2:143" className="inline" />).
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          Some believers had died while still facing Jerusalem, and people worried about their prayers — so Allah reassured them that <span className="italic">&ldquo;…Allah would never let your [acts of] faith go to waste…&rdquo;</span> (<HadithRefText text="Quran 2:143" className="inline" />). A prayer offered in sincere obedience is never lost.
        </p>
      </ContentCard>}

      {/* If you're not sure */}
      {!compact && <ContentCard delay={0.17}>
        <h3 className="text-gold font-semibold text-lg mb-3">What if I&apos;m not sure which way to face?</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          Do your best. If you genuinely tried to determine the qiblah and prayed in good faith, your prayer is valid even if you later discover you were facing the wrong direction. The Prophet ﷺ said:
        </p>
        <div className="my-3">
          <p className="text-themed-muted text-sm leading-relaxed italic">
            &ldquo;What is between the east and the west is Qiblah.&rdquo;
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

      {/* Mistakes & tolerances FAQ */}
      {!compact && <ContentCard delay={0.20}>
        <h3 className="text-gold font-semibold text-lg mb-3">Mistakes and tolerances</h3>
        <div className="space-y-4 text-sm leading-relaxed">
          <div>
            <p className="text-themed font-medium mb-1">Someone corrected me mid-prayer — do I start over?</p>
            <p className="text-themed-muted">
              No. Turn to the correct direction and continue — exactly what the congregation at Quba did when the qiblah changed while they were praying (<HadithRefText text="Bukhari 65:15" className="inline" />). Your prayer is not broken.
            </p>
          </div>
          <div>
            <p className="text-themed font-medium mb-1">I found out afterward that I was facing the wrong way.</p>
            <p className="text-themed-muted">
              If you tried your best to work out the direction and prayed in good faith, your prayer stands — you are not required to repeat it. Allah reassured the early Muslims that faith offered sincerely is never wasted (<HadithRefText text="Quran 2:143" className="inline" />).
            </p>
          </div>
          <div>
            <p className="text-themed font-medium mb-1">How exact do I have to be? My compass reads a degree or two off.</p>
            <p className="text-themed-muted">
              At a distance, facing the <span className="text-gold">general direction</span> of the Ka&apos;bah is what is required — scholars call this facing <span className="italic">jihat al-Ka&apos;bah</span> (its direction) rather than its exact point. The Prophet ﷺ told the people of Madinah, <span className="italic">&ldquo;What is between the east and the west is Qiblah&rdquo;</span> (<HadithRefText text="Tirmidhi 2:194" className="inline" />). A small margin of compass error will not affect the validity of your prayer.
            </p>
          </div>
        </div>
      </ContentCard>}

      {/* Praying in a car, plane, train, or on a mount */}
      {!compact && <ContentCard delay={0.23}>
        <h3 className="text-gold font-semibold text-lg mb-3">Praying in a car, plane, train, or on a mount</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          The Prophet ﷺ drew a clear line between voluntary and obligatory prayer while travelling. For <span className="text-gold">voluntary (nafl) prayer</span> he prayed on his mount whichever way it happened to face — Ibn &apos;Umar reported he prayed <span className="italic">&ldquo;…facing its direction by signals, but not the compulsory prayer…&rdquo;</span> (<HadithRefText text="Bukhari 14:11" className="inline" />), and another companion saw him <span className="italic">&ldquo;…offering the prayer on his mount (Rahila) whatever direction it took…&rdquo;</span> (<HadithRefText text="Bukhari 18:13" className="inline" />). For the <span className="text-gold">obligatory prayer</span> he would dismount and face the qiblah.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          In practice, for a <span className="text-gold">fard</span> prayer on a plane or train: face the qiblah at the opening takbir if you can (an in-flight qiblah screen or this compass on the ground before boarding helps), then pray in the direction of travel if the vehicle turns. Pray standing if you are able; sit if standing is genuinely not possible, and pray by gesture — Allah <span className="italic">&ldquo;does not burden any soul greater than it can bear&rdquo;</span> (<HadithRefText text="Quran 2:286" className="inline" />).
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          Whether an obligatory prayer prayed this way should be repeated once you can stand and face the qiblah is a point the schools of fiqh differ on. If you regularly pray while travelling, ask a trusted local scholar which position to follow.
        </p>
      </ContentCard>}

      {/* Finding the qiblah without your phone */}
      {!compact && <ContentCard delay={0.26}>
        <h3 className="text-gold font-semibold text-lg mb-3">Finding the qiblah without your phone</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          A dead battery or a device with no compass is never an obstacle to prayer. The Prophet ﷺ said the whole earth has been made a place of worship: <span className="italic">&ldquo;…whenever the time of prayer comes for any one of you he should pray whenever he is…&rdquo;</span> (<HadithRefText text="Muslim 5:3" className="inline" />), and <span className="italic">&ldquo;To Allah belong the east and the west; wherever you turn, there is the Face of Allah…&rdquo;</span> (<HadithRefText text="Quran 2:115" className="inline" />).
        </p>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          To estimate the direction without a device, scholars and travellers rely on natural signs:
        </p>
        <ul className="text-themed-muted text-sm leading-relaxed space-y-1.5 list-disc pl-5 mb-3">
          <li>The <span className="text-gold">sun</span> rises roughly in the east and sets roughly in the west, giving you an east–west line to orient from.</li>
          <li>At <span className="text-gold">solar noon</span> the sun is at its highest and shadows are shortest, pointing along the north–south line.</li>
          <li>At night the <span className="text-gold">Pole Star (Polaris)</span> marks true north in the northern hemisphere.</li>
          <li>A nearby <span className="text-gold">mosque&apos;s orientation</span>, or the qiblah arrow marked on many hotel-room ceilings or drawers, gives the local direction directly.</li>
        </ul>
        <p className="text-themed-muted text-sm leading-relaxed">
          Do your honest best with what you have — a sincere estimate is exactly what is asked of you.
        </p>
      </ContentCard>}

      {/* The qiblah beyond salah */}
      {!compact && <ContentCard delay={0.29}>
        <h3 className="text-gold font-semibold text-lg mb-3">The qiblah beyond salah</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          Facing the qiblah is loved in more than the prayer. It is recommended when making <span className="text-gold">du&apos;a</span> and <span className="text-gold">dhikr</span>, and when slaughtering an animal. The deceased are laid in the grave <span className="text-gold">facing the qiblah</span> on their right side — see the burial guidance on the{" "}
          <Link href="/death-rites?tab=burial" className="text-gold hover:text-gold/80 underline underline-offset-2">Death &amp; Janazah</Link> page.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          There is also an etiquette of <span className="text-gold">not</span> facing or turning your back to the qiblah when relieving oneself in open ground. The Prophet ﷺ said one should <span className="italic">&ldquo;neither face nor turn his back towards the Qibla; he should either face the east or the west&rdquo;</span> (<HadithRefText text="Bukhari 4:10" className="inline" />). Ibn &apos;Umar noted from seeing the Prophet ﷺ on a rooftop that within the shelter of walls this is eased (<HadithRefText text="Bukhari 4:11" className="inline" />); the scholars discuss the indoor case in detail.
        </p>
      </ContentCard>}

      {!compact && <SourcesCard className="mt-6" sources={[
        { ref: "Quran 2:142-145", desc: "The change of qiblah from Jerusalem to the Ka'bah" },
        { ref: "Quran 2:144", desc: "Turn your face toward al-Masjid al-Haram" },
        { ref: "Quran 2:127", desc: "Ibrahim and Isma'il raising the foundations of the House" },
        { ref: "Quran 3:96", desc: "The first House established for mankind, at Bakkah" },
        { ref: "Quran 2:115", desc: "To Allah belong the east and the west" },
        { ref: "Bukhari 60:40", desc: "Al-Masjid al-Haram, the first mosque built on earth" },
        { ref: "Bukhari 25:83", desc: "Umar at the Black Stone: 'a stone that can neither benefit nor harm'" },
        { ref: "Bukhari 2:33", desc: "Al-Bara': sixteen or seventeen months facing Jerusalem" },
        { ref: "Bukhari 65:15", desc: "The Quba congregation turning toward the Ka'bah mid-prayer" },
        { ref: "Bukhari 14:11", desc: "Voluntary prayer on his mount, but not the obligatory prayer" },
        { ref: "Bukhari 18:13", desc: "Praying on his mount whatever direction it took" },
        { ref: "Muslim 5:3", desc: "The earth made a mosque; pray wherever the time comes" },
        { ref: "Bukhari 4:10", desc: "Not facing or backing the qiblah when relieving oneself" },
        { ref: "Tirmidhi 2:194", desc: "What is between east and west is qiblah" },
        { ref: "Quran 2:286", desc: "Allah does not burden a soul beyond its capacity" },
      ]} />}
    </div>
  );
}

export default QiblahSection;
