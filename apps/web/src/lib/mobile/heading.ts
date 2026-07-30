/**
 * Compass heading bridge — the app's ONLY usable heading source on iOS.
 *
 * Inside the WKWebView, `DeviceOrientationEvent` is a dead end for a compass:
 * `webkitCompassHeading` is a Safari-only extension (it is simply absent in an
 * app's web view) and `alpha` is not north-referenced there, so it can't be
 * turned into a bearing. @capacitor/motion doesn't help either — it is a pure web
 * shim over those same events, with no native code behind it. The real heading
 * has to come from CoreLocation, which is what the native HeadingBridge plugin
 * (ios/App/App/HeadingBridge.swift) wraps: CLLocationManager.startUpdatingHeading()
 * streamed to JS as "heading" events.
 *
 * Location permission is already granted for prayer times, so start() needs no
 * new consent UI. NO-OP ON WEB — the web path stays on DeviceOrientationEvent
 * (see QiblahSection.tsx), and calls here reject on a platform without the
 * plugin, which every caller must treat as "no compass" rather than an error.
 */

import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";

export type HeadingEvent = {
  /**
   * Degrees clockwise from TRUE north — declination ALREADY APPLIED by iOS.
   * NEGATIVE when CoreLocation can't compute it (no location fix yet), in which
   * case `magneticHeading` is the only usable reading and the caller must apply
   * the local magnetic declination itself.
   */
  trueHeading: number;
  /** Degrees clockwise from MAGNETIC north; negative if the reading is invalid. */
  magneticHeading: number;
  /**
   * Maximum error in degrees. NEGATIVE means the reading is invalid and the
   * magnetometer wants calibrating (figure-8 wave) — same convention as
   * webkitCompassAccuracy on the web path.
   */
  accuracy: number;
};

type HeadingBridgePlugin = {
  /** Begin heading updates. Rejects when the device has no magnetometer. */
  start(): Promise<void>;
  /** Stop heading updates (the magnetometer is a battery cost — always call it). */
  stop(): Promise<void>;
  /** Whether this device can report a heading at all. */
  isAvailable(): Promise<{ available: boolean }>;
  addListener(
    eventName: "heading",
    listener: (event: HeadingEvent) => void
  ): Promise<PluginListenerHandle>;
};

export const HeadingBridge = registerPlugin<HeadingBridgePlugin>("HeadingBridge");
