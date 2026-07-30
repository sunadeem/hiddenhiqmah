import Foundation
import SwiftUI
import WidgetKit

/**
 * Everything the widgets read, plus the shared look.
 *
 * The extension is its own process with its own sandbox — it cannot see the web
 * layer's localStorage and it cannot run the JS prayer-time engine. So the app
 * computes the times (src/lib/prayer-times.ts, same engine the local
 * notifications use) and pushes a JSON blob into the shared app group via the
 * WidgetBridge Capacitor plugin. This file is the decoder for that blob.
 *
 * Payload, as written by src/lib/mobile/widgets.ts:
 *   {
 *     "version": 2,
 *     "updatedAt": "2026-07-29T18:00:00.000Z",
 *     "city": "Toronto",
 *     "lat": 43.6532,
 *     "lng": -79.3832,
 *     "streak": 12,
 *     "days": [
 *       { "date": "2026-07-29", "fajr": "04:21", "dhuhr": "13:22",
 *         "asr": "17:15", "maghrib": "20:41", "isha": "22:10" },
 *       ...
 *     ]
 *   }
 *
 * A day may also nest its times under a `times` object
 * (`{ "date": …, "times": { "Fajr": "04:21", … } }`) — both shapes decode, and
 * prayer keys are matched case-insensitively, so the JS side can move between
 * them without stranding an already-installed widget on an old binary.
 *
 * `date` is the LOCAL calendar day and the times are LOCAL "HH:mm" — instants are
 * rebuilt with Calendar.current, so they land on the right wall-clock time in the
 * device's current time zone (and survive DST). Unknown keys (`version`,
 * `updatedAt`, `sunrise`, anything added later) are ignored, and a payload that
 * yields no usable instants decodes to nil rather than throwing: a JS-side change
 * can degrade a widget to "Open Hiqmah" but can never crash it.
 *
 * `lat`/`lng`/`streak` arrived with payload v2 and are decoded as OPTIONALS, on
 * purpose. A widget can outlive the write that fed it: someone who adds the Qibla
 * widget while the last blob in the app group is still v1 (app not reopened since
 * updating) gets a payload with prayers but no coordinates. Optional means that
 * case renders the widget's own placeholder — never a bearing computed from a
 * default 0°,0° (which would confidently point at the Gulf of Guinea). `version`
 * is NOT used to gate any of this; the fields' presence is the only contract.
 */

// MARK: - Prayers

enum Prayer: String, CaseIterable {
    case fajr = "Fajr"
    case dhuhr = "Dhuhr"
    case asr = "Asr"
    case maghrib = "Maghrib"
    case isha = "Isha"

    var displayName: String { rawValue }

    /// Glyph for the compact families (all available since iOS 13).
    var symbolName: String {
        switch self {
        case .fajr: return "sunrise.fill"
        case .dhuhr: return "sun.max.fill"
        case .asr: return "sun.haze.fill"
        case .maghrib: return "sunset.fill"
        case .isha: return "moon.stars.fill"
        }
    }
}

struct PrayerInstant: Identifiable, Equatable {
    let prayer: Prayer
    let date: Date

    var id: String { "\(prayer.rawValue)@\(date.timeIntervalSince1970)" }
}

// MARK: - Payload decoding

private struct WidgetPayload: Decodable {
    let city: String?
    let days: [PayloadDay]?
    /// v2+. nil on a v1 blob — see the file header.
    let lat: Double?
    let lng: Double?
    let streak: Int?
    let updatedAt: String?

    private enum CodingKeys: String, CodingKey {
        case city, days, lat, lng, streak, updatedAt
    }

    /// Hand-written rather than synthesized so that each field fails ALONE. The
    /// synthesized initialiser throws when a key is present with the wrong type
    /// (`decodeIfPresent` only tolerates absence), which would let a bad `streak`
    /// take the prayer times down with it — the one thing every widget depends on.
    /// `streak` is read as a Double first so 12 and 12.0 both land.
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        city = try? container.decodeIfPresent(String.self, forKey: .city)
        days = try? container.decodeIfPresent([PayloadDay].self, forKey: .days)
        updatedAt = try? container.decodeIfPresent(String.self, forKey: .updatedAt)
        lat = try? container.decodeIfPresent(Double.self, forKey: .lat)
        lng = try? container.decodeIfPresent(Double.self, forKey: .lng)
        if let raw = try? container.decodeIfPresent(Double.self, forKey: .streak), raw.isFinite {
            streak = Int(raw.rounded())
        } else {
            streak = nil
        }
    }
}

private struct PayloadDay: Decodable {
    let date: String
    /// Prayer name → "HH:mm", merged from both supported day shapes: the flat
    /// one widgets.ts writes today, and a nested `times` object.
    let times: [String: String]

    private struct DynamicKey: CodingKey {
        let stringValue: String
        var intValue: Int? { nil }
        init?(stringValue: String) { self.stringValue = stringValue }
        init?(intValue: Int) { return nil }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: DynamicKey.self)

        guard let dateKey = DynamicKey(stringValue: "date"),
              let date = try? container.decode(String.self, forKey: dateKey) else {
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "A widget day needs a \"date\""
                )
            )
        }
        self.date = date

        var merged: [String: String] = [:]
        for key in container.allKeys where key.stringValue != "date" {
            if let value = try? container.decode(String.self, forKey: key) {
                // Flat: "fajr": "04:21"
                merged[key.stringValue] = value
            } else if let nested = try? container.decode([String: String].self, forKey: key) {
                // Nested: "times": { "Fajr": "04:21", … }
                for (nestedKey, nestedValue) in nested {
                    merged[nestedKey] = nestedValue
                }
            }
            // Anything else (numbers, arrays, objects of other shapes) is ignored.
        }
        self.times = merged
    }
}

/// "20:41", "8:41", "20:41 (EDT)" → (20, 41). nil when unparseable.
private func parseClock(_ raw: String) -> (hour: Int, minute: Int)? {
    var text = raw
    if let paren = text.firstIndex(of: "(") {
        text = String(text[text.startIndex..<paren])
    }
    text = text.trimmingCharacters(in: .whitespacesAndNewlines)

    let parts = text.split(separator: ":")
    guard parts.count >= 2,
          let hour = Int(parts[0]),
          let minute = Int(parts[1].prefix(2)),
          (0...23).contains(hour),
          (0...59).contains(minute)
    else { return nil }
    return (hour, minute)
}

/// "2026-07-29" → y/m/d components. Tolerates a trailing time ("2026-07-29T00:00").
private func parseDay(_ raw: String) -> DateComponents? {
    let parts = raw.split(separator: "-")
    guard parts.count >= 3,
          let year = Int(parts[0]),
          let month = Int(parts[1]),
          let day = Int(parts[2].prefix(2))
    else { return nil }

    var components = DateComponents()
    components.year = year
    components.month = month
    components.day = day
    return components
}

/// "2026-07-29T18:00:00.000Z" → Date. JS `toISOString()` always emits fractional
/// seconds, but the plain form is accepted too so a hand-written or future payload
/// doesn't silently lose its timestamp.
private func parseTimestamp(_ raw: String?) -> Date? {
    guard let raw, !raw.isEmpty else { return nil }
    let withFraction = ISO8601DateFormatter()
    withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let date = withFraction.date(from: raw) { return date }
    return ISO8601DateFormatter().date(from: raw)
}

/// Case-insensitive lookup so "Fajr"/"fajr"/"FAJR" all work.
private func timeString(_ times: [String: String], for prayer: Prayer) -> String? {
    if let exact = times[prayer.rawValue] { return exact }
    let wanted = prayer.rawValue.lowercased()
    for (key, value) in times where key.lowercased() == wanted { return value }
    return nil
}

// MARK: - Location

/// A validated coordinate from the payload.
///
/// Failable on purpose, and strict about 0,0: "Null Island" is what a dropped or
/// zero-initialised fix looks like, and the Qibla widget would render it as a
/// perfectly confident 21° bearing rather than admitting it has no location. The
/// half-degree window around it costs us the Gulf of Guinea and nothing else.
struct Coordinate: Equatable {
    let latitude: Double
    let longitude: Double

    init?(latitude: Double?, longitude: Double?) {
        guard let latitude, let longitude,
              latitude.isFinite, longitude.isFinite,
              (-90.0...90.0).contains(latitude),
              (-180.0...180.0).contains(longitude),
              !(abs(latitude) < 0.5 && abs(longitude) < 0.5)
        else { return nil }
        self.latitude = latitude
        self.longitude = longitude
    }
}

// MARK: - Widget data

struct WidgetData {
    /// Where the times were computed for, e.g. "Toronto". nil when the app never
    /// resolved a place name.
    let city: String?
    /// Every prayer instant in the payload, ascending, spanning several days.
    let instants: [PrayerInstant]
    /// The coordinates the times were computed for. nil on a v1 payload — the
    /// Qibla widget must show its placeholder rather than guess.
    let coordinate: Coordinate?
    /// Consecutive-day visit streak as of the last app open. nil on a v1 payload.
    let streak: Int?
    /// When the app last published. nil when the payload carried no parseable
    /// timestamp. Only the streak cares — prayer instants carry their own dates.
    let updatedAt: Date?

    init(
        city: String?,
        instants: [PrayerInstant],
        coordinate: Coordinate? = nil,
        streak: Int? = nil,
        updatedAt: Date? = nil
    ) {
        self.city = city
        self.instants = instants
        self.coordinate = coordinate
        self.streak = streak
        self.updatedAt = updatedAt
    }

    /// The streak, but only when it can still be true.
    ///
    /// A visit streak is maintained by OPENING the app, and every open publishes a
    /// payload (the 6-hour throttle is far tighter than a day). So a blob whose
    /// last write was two calendar days ago is proof the streak has since been
    /// broken — the stored number is not merely stale, it is wrong. Showing "12
    /// days" to someone who lapsed last Tuesday is worse than showing nothing, so
    /// this returns nil and the widget falls back to its placeholder.
    ///
    /// Two days rather than one deliberately: one day of slack absorbs travel
    /// across time zones and a late-night/early-morning pair of opens, and the app
    /// gets the whole of "today" to publish before the widget doubts it.
    var liveStreak: Int? {
        guard let streak, streak > 0 else { return nil }
        guard let updatedAt else {
            // No timestamp to judge by (v1-era blob): trust the number rather than
            // suppress a streak that is probably fine.
            return streak
        }
        let calendar = Calendar.current
        let writtenDay = calendar.startOfDay(for: updatedAt)
        let today = calendar.startOfDay(for: Date())
        guard let elapsed = calendar.dateComponents([.day], from: writtenDay, to: today).day else {
            return streak
        }
        // Negative = written "in the future" (clock or time-zone shift). Harmless
        // and certainly not lapsed, so allow it.
        return elapsed <= 1 ? streak : nil
    }

    /// Must match App/WidgetBridge.swift and both .entitlements files.
    static let appGroupIdentifier = "group.com.hiddenhiqmah.app"
    static let widgetDataKey = "widgetData"

    /// Read + decode the app group blob. nil when the app has never written one
    /// (fresh install, or the user never granted location) — callers render the
    /// "Open Hiqmah" state.
    ///
    /// Also nil when the payload carries no usable prayer instants, which keeps
    /// the prayer widgets' contract exactly as it was. Widgets that don't need
    /// prayer times use `loadAny()`.
    static func load() -> WidgetData? {
        guard let data = loadAny(), !data.instants.isEmpty else { return nil }
        return data
    }

    /// Like `load()`, but tolerates a payload with no usable prayer instants.
    ///
    /// This is the loader for the Qibla and Streak widgets, and the distinction is
    /// not academic: the app publishes a rolling 30-day window, so a phone that
    /// hasn't opened Hiqmah in a month has a blob whose `days` are all in the past.
    /// The prayer widgets genuinely have nothing to draw then — but the qibla
    /// bearing is still exactly right (it only moves when the user does) and the
    /// last-known streak is still the most honest number available. Sharing
    /// `load()` would blank all three at once for no reason.
    static func loadAny() -> WidgetData? {
        guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else { return nil }

        var payloadData: Data?
        if let text = defaults.string(forKey: widgetDataKey) {
            payloadData = text.data(using: .utf8)
        } else {
            payloadData = defaults.data(forKey: widgetDataKey)
        }
        guard let data = payloadData, !data.isEmpty else { return nil }
        guard let payload = try? JSONDecoder().decode(WidgetPayload.self, from: data) else { return nil }

        let calendar = Calendar.current
        var instants: [PrayerInstant] = []
        var seen = Set<String>()

        for day in payload.days ?? [] {
            guard let dayComponents = parseDay(day.date) else { continue }
            for prayer in Prayer.allCases {
                guard let raw = timeString(day.times, for: prayer),
                      let clock = parseClock(raw) else { continue }

                var components = dayComponents
                components.hour = clock.hour
                components.minute = clock.minute
                components.second = 0
                guard let date = calendar.date(from: components) else { continue }

                let instant = PrayerInstant(prayer: prayer, date: date)
                if seen.insert(instant.id).inserted {
                    instants.append(instant)
                }
            }
        }

        instants.sort { $0.date < $1.date }
        let city = payload.city?.trimmingCharacters(in: .whitespacesAndNewlines)
        return WidgetData(
            city: (city?.isEmpty == false) ? city : nil,
            instants: instants,
            coordinate: Coordinate(latitude: payload.lat, longitude: payload.lng),
            // A streak is only worth showing from 1 up; 0 and any negative are
            // "nothing to say", which is the placeholder's job, not a "0" tile.
            streak: (payload.streak ?? 0) > 0 ? payload.streak : nil,
            updatedAt: parseTimestamp(payload.updatedAt)
        )
    }

    /// The first prayer strictly after `reference`. Rolls over the day boundary
    /// on its own (after Isha the next instant IS tomorrow's Fajr, because the
    /// payload carries several days). Returns nil once the payload is exhausted,
    /// which is the caller's cue to show "Open Hiqmah".
    func nextPrayer(after reference: Date) -> PrayerInstant? {
        instants.first { $0.date > reference }
    }

    /// The five prayers of the local day containing `reference` — the row the
    /// medium family draws. Empty when that day isn't in the payload.
    func schedule(for reference: Date) -> [PrayerInstant] {
        let calendar = Calendar.current
        return instants.filter { calendar.isDate($0.date, inSameDayAs: reference) }
    }

    /// Plausible times for placeholder/preview rendering — never shown as real data.
    static func sample(now: Date = Date()) -> WidgetData {
        let calendar = Calendar.current
        let start = calendar.startOfDay(for: now)
        let offsets: [(Prayer, Int)] = [
            (.fajr, 5 * 60 + 12),
            (.dhuhr, 13 * 60 + 22),
            (.asr, 17 * 60 + 5),
            (.maghrib, 20 * 60 + 41),
            (.isha, 22 * 60 + 10)
        ]
        let instants = offsets.map { prayer, minutes in
            PrayerInstant(prayer: prayer, date: start.addingTimeInterval(TimeInterval(minutes * 60)))
        }
        return WidgetData(
            city: "Toronto",
            instants: instants,
            // Toronto — the qibla gallery preview reads "55° NE" off these.
            coordinate: Coordinate(latitude: 43.6532, longitude: -79.3832),
            streak: 12,
            updatedAt: now
        )
    }
}

// MARK: - Formatting

enum HiqmahFormat {
    /// "8:41 PM" — or "20:41" where the device prefers a 24-hour clock.
    static func clock(_ date: Date) -> String {
        date.formatted(date: .omitted, time: .shortened)
    }

    /// True when the device is set to a 24-hour clock.
    static var uses24HourClock: Bool {
        let template = DateFormatter.dateFormat(fromTemplate: "j", options: 0, locale: Locale.current) ?? "h a"
        return !template.contains("a")
    }

    /// "8:41" / "20:41" — AM/PM dropped so it fits the circular family.
    static func compactClock(_ date: Date) -> String {
        let components = Calendar.current.dateComponents([.hour, .minute], from: date)
        let hour24 = components.hour ?? 0
        let minute = components.minute ?? 0
        let hour = uses24HourClock ? hour24 : (hour24 % 12 == 0 ? 12 : hour24 % 12)
        return String(format: "%d:%02d", hour, minute)
    }

    /// A safe range for `Text(timerInterval:)` — an empty or inverted range traps
    /// at runtime, so the end is always pushed at least a second past the start.
    static func countdownRange(from start: Date, to end: Date) -> ClosedRange<Date> {
        let safeEnd = max(end, start.addingTimeInterval(1))
        return start...safeEnd
    }
}

// MARK: - Theme

extension Color {
    /// The app's canvas (#0a0a0c) — see apps/web/src/app/globals.css.
    static let hiqmahBackground = Color(red: 10.0 / 255.0, green: 10.0 / 255.0, blue: 12.0 / 255.0)
    /// The app's gold accent (#d4a843).
    static let hiqmahGold = Color(red: 212.0 / 255.0, green: 168.0 / 255.0, blue: 67.0 / 255.0)
    /// Muted body text (#8d887c).
    static let hiqmahMuted = Color(red: 141.0 / 255.0, green: 136.0 / 255.0, blue: 124.0 / 255.0)
    /// Primary text (#f1ece0).
    static let hiqmahText = Color(red: 241.0 / 255.0, green: 236.0 / 255.0, blue: 224.0 / 255.0)
}

extension View {
    /// Home-screen families: the app's dark canvas. `containerBackground` is
    /// iOS 17+ (and required there for the widget to fill its container), so
    /// iOS 16 falls back to painting the colour behind the content — and to
    /// adding its own padding, since automatic content margins only arrived
    /// with iOS 17.
    @ViewBuilder
    func hiqmahWidgetBackground() -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(Color.hiqmahBackground, for: .widget)
        } else {
            ZStack {
                Color.hiqmahBackground
                self.padding(14)
            }
        }
    }

    /// Circular accessory family: the system's vibrant tray behind the glyph.
    @ViewBuilder
    func hiqmahAccessoryBackground() -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(for: .widget) { AccessoryWidgetBackground() }
        } else {
            ZStack {
                AccessoryWidgetBackground()
                self
            }
        }
    }

    /// Inline / rectangular accessory families: no background of our own, but
    /// iOS 17+ still wants an explicit container declaration.
    @ViewBuilder
    func hiqmahClearWidgetBackground() -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(.clear, for: .widget)
        } else {
            self
        }
    }
}

// MARK: - Design system
//
// One visual language for every widget in the bundle. The rule that makes the
// five read as a family: same card, same badge-and-title header, same gold
// tokens, and — for the four that measure something — a circular instrument
// struck at the same centre and radius, with a gold readout and a quiet caption
// beneath. Next Prayer is the deliberate exception (a stacked name/time/countdown
// face) and is tied back in by the shared badge, type scale and progress rail.
//
// Colour is fully tokenised PER THEME rather than one palette on a flipped
// ground: a single gold cannot clear contrast at both 46pt and 9pt on both
// grounds, so gold exists three times over (display numerals, small text,
// hairlines). Light-mode values were chosen against the *bottom* of the card
// gradient, which is the worst case.

extension Color {
    init(hiqmahHex hex: UInt32, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255.0,
            green: Double((hex >> 8) & 0xFF) / 255.0,
            blue: Double(hex & 0xFF) / 255.0,
            opacity: alpha
        )
    }
}

struct HiqmahTheme {
    let cardA: Color
    let cardB: Color
    let inner: Color
    let innerEdge: Color
    let title: Color
    let muted: Color
    let cardinal: Color
    let sky: Color
    let hair: Color
    let sheenOpacity: Double
    let track: Color
    /// Numerals 24pt and up.
    let goldDisplay: Color
    /// Any gold text below 18pt — darker on light, or it fails contrast.
    let goldText: Color
    /// Ticks, rules, watermark.
    let goldLine: Color
    let arcA: Color
    let arcB: Color
    /// Badges and medallions sit on a dark disc in BOTH themes, so their gold
    /// never changes — that constancy is what keeps the family recognisable.
    let onDark: Color
    let watermarkOpacity: Double

    static let dark = HiqmahTheme(
        cardA: Color(hiqmahHex: 0x232327),
        cardB: Color(hiqmahHex: 0x131316),
        inner: Color(hiqmahHex: 0x26262B),
        innerEdge: Color(hiqmahHex: 0xD9B45F, alpha: 0.10),
        title: .white,
        muted: Color(hiqmahHex: 0x93939A),
        cardinal: Color(hiqmahHex: 0xEAE6DB),
        sky: Color(hiqmahHex: 0x08080A),
        hair: Color(hiqmahHex: 0xD9B45F, alpha: 0.13),
        sheenOpacity: 0.055,
        track: Color.white.opacity(0.30),
        goldDisplay: Color(hiqmahHex: 0xD9B45F),
        goldText: Color(hiqmahHex: 0xD9B45F),
        goldLine: Color(hiqmahHex: 0xD9B45F),
        arcA: Color(hiqmahHex: 0xF6E3AE),
        arcB: Color(hiqmahHex: 0xA9843A),
        onDark: Color(hiqmahHex: 0xD9B45F),
        watermarkOpacity: 0.07
    )

    static let light = HiqmahTheme(
        cardA: Color(hiqmahHex: 0xFCF8EF),
        cardB: Color(hiqmahHex: 0xEFE8D8),
        inner: Color(hiqmahHex: 0xFFFFFF),
        innerEdge: Color(hiqmahHex: 0xA9843A, alpha: 0.16),
        title: Color(hiqmahHex: 0x1B1915),
        muted: Color(hiqmahHex: 0x6D695E),
        cardinal: Color(hiqmahHex: 0x3C382E),
        sky: Color(hiqmahHex: 0xD8CCB0),
        hair: Color(hiqmahHex: 0x8A6B24, alpha: 0.22),
        sheenOpacity: 0.75,
        track: Color(hiqmahHex: 0x3C3220, alpha: 0.50),
        goldDisplay: Color(hiqmahHex: 0xA4802F),
        goldText: Color(hiqmahHex: 0x806525),
        goldLine: Color(hiqmahHex: 0x8A6B24),
        arcA: Color(hiqmahHex: 0xB9922F),
        arcB: Color(hiqmahHex: 0x7E611E),
        onDark: Color(hiqmahHex: 0xD9B45F),
        watermarkOpacity: 0.16
    )

    static func of(_ scheme: ColorScheme) -> HiqmahTheme {
        scheme == .light ? .light : .dark
    }
}

// MARK: Glyphs

/// The Kaaba: outlined cube, hizām band, door. Scales cleanly from 11pt to 60pt.
struct KaabaGlyph: View {
    var size: CGFloat
    var color: Color

    var body: some View {
        let w = size * 0.80
        let h = size * 0.74
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.055, style: .continuous)
                .strokeBorder(color, lineWidth: max(0.8, size * 0.070))
                .frame(width: w, height: h)
            Rectangle()
                .fill(color)
                .frame(width: w, height: h * 0.155)
                .offset(y: -h * 0.1825)
            RoundedRectangle(cornerRadius: size * 0.018, style: .continuous)
                .fill(color)
                .frame(width: w * 0.23, height: h * 0.40)
                .offset(y: h * 0.30)
        }
        .frame(width: size, height: size)
    }
}

struct CrescentGlyph: View {
    var size: CGFloat
    var color: Color

    var body: some View {
        Circle()
            .fill(color)
            .frame(width: size * 0.92, height: size * 0.92)
            .mask(
                ZStack {
                    Circle()
                        .frame(width: size * 0.92, height: size * 0.92)
                    Circle()
                        .frame(width: size * 0.80, height: size * 0.80)
                        .offset(x: size * 0.26, y: -size * 0.06)
                        .blendMode(.destinationOut)
                }
                .compositingGroup()
            )
            .frame(width: size, height: size)
    }
}

/// A flame, NOT a waterdrop. A symmetric point-on-top/round-on-bottom teardrop is
/// a waterdrop; what reads as fire is asymmetry — a main tip leaning right, a
/// shorter tongue licking up on the left, and a notch cut between the two. The
/// notch is deliberately deep so it survives at the 11pt badge size.
struct FlameShape: Shape {
    func path(in rect: CGRect) -> Path {
        let s = min(rect.width, rect.height)
        let cx = rect.midX
        let cy = rect.midY
        func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint {
            CGPoint(x: cx + x * s, y: cy + y * s)
        }
        var path = Path()
        path.move(to: p(0.04, -0.50))
        path.addCurve(to: p(0.32, -0.04), control1: p(0.08, -0.32), control2: p(0.26, -0.22))
        path.addCurve(to: p(0.14, 0.40), control1: p(0.38, 0.14), control2: p(0.30, 0.32))
        path.addCurve(to: p(-0.32, 0.30), control1: p(-0.02, 0.48), control2: p(-0.22, 0.44))
        path.addCurve(to: p(-0.30, -0.14), control1: p(-0.42, 0.16), control2: p(-0.40, -0.02))
        path.addCurve(to: p(-0.24, -0.32), control1: p(-0.26, -0.20), control2: p(-0.25, -0.26))
        path.addCurve(to: p(0.0, -0.18), control1: p(-0.16, -0.26), control2: p(-0.06, -0.22))
        path.addCurve(to: p(0.04, -0.50), control1: p(0.02, -0.30), control2: p(0.02, -0.40))
        path.closeSubpath()
        return path
    }
}

struct FlameGlyph: View {
    var size: CGFloat
    var color: Color

    var body: some View {
        FlameShape().fill(color).frame(width: size, height: size)
    }
}

struct HourglassGlyph: View {
    var size: CGFloat
    var color: Color

    var body: some View {
        let s = size
        ZStack {
            Path { p in
                p.move(to: CGPoint(x: -s * 0.28, y: -s * 0.40))
                p.addLine(to: CGPoint(x: s * 0.28, y: -s * 0.40))
                p.move(to: CGPoint(x: -s * 0.28, y: s * 0.40))
                p.addLine(to: CGPoint(x: s * 0.28, y: s * 0.40))
                p.move(to: CGPoint(x: -s * 0.24, y: -s * 0.40))
                p.addLine(to: CGPoint(x: s * 0.24, y: s * 0.40))
                p.move(to: CGPoint(x: s * 0.24, y: -s * 0.40))
                p.addLine(to: CGPoint(x: -s * 0.24, y: s * 0.40))
            }
            .stroke(color, style: StrokeStyle(lineWidth: max(0.9, s * 0.09), lineCap: .round, lineJoin: .round))
            Path { p in
                p.move(to: CGPoint(x: -s * 0.17, y: s * 0.36))
                p.addLine(to: CGPoint(x: s * 0.17, y: s * 0.36))
                p.addLine(to: CGPoint(x: 0, y: s * 0.06))
                p.closeSubpath()
            }
            .fill(color)
        }
        .frame(width: size, height: size)
    }
}

// MARK: Card, badge, header

struct RubWatermark: View {
    var theme: HiqmahTheme

    var body: some View {
        GeometryReader { geo in
            // Keyed to the SHORT side, so the motif keeps its silhouette at every
            // aspect ratio instead of stretching on the wide families.
            let r = min(geo.size.width, geo.size.height) * 0.40
            let stroke = theme.goldLine.opacity(theme.watermarkOpacity)
            ZStack {
                RoundedRectangle(cornerRadius: r * 0.10, style: .continuous)
                    .stroke(stroke, lineWidth: max(1, r * 0.028))
                    .frame(width: r * 2, height: r * 2)
                RoundedRectangle(cornerRadius: r * 0.10, style: .continuous)
                    .stroke(stroke, lineWidth: max(1, r * 0.028))
                    .frame(width: r * 2, height: r * 2)
                    .rotationEffect(.degrees(45))
            }
            .position(x: geo.size.width - r * 0.25, y: geo.size.height - r * 0.20)
        }
    }
}

struct HiqmahCardBackground: View {
    var theme: HiqmahTheme

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [theme.cardA, theme.cardB],
                startPoint: .topLeading,
                endPoint: .bottom
            )
            RubWatermark(theme: theme)
            RadialGradient(
                colors: [Color.white.opacity(theme.sheenOpacity), Color.white.opacity(0)],
                center: UnitPoint(x: 0.20, y: 0.06),
                startRadius: 0,
                endRadius: 200
            )
        }
    }
}

struct HiqmahBadge<Glyph: View>: View {
    var radius: CGFloat
    var theme: HiqmahTheme
    var mono: Bool = false
    @ViewBuilder var glyph: (CGFloat, Color) -> Glyph

    var body: some View {
        let tint = mono ? Color.white.opacity(0.95) : theme.onDark
        ZStack {
            Circle().fill(mono ? Color.white.opacity(0.16) : Color(hiqmahHex: 0x141416))
            Circle().strokeBorder(tint.opacity(mono ? 0.95 : 0.85), lineWidth: max(1, radius * 0.085))
            glyph(radius * 1.05, tint)
        }
        .frame(width: radius * 2, height: radius * 2)
    }
}

/// Badge + title. Identical on every face — this is the single strongest cue
/// that the widgets belong to one another.
struct HiqmahHeader<Glyph: View>: View {
    var title: String
    var theme: HiqmahTheme
    var radius: CGFloat = 10.5
    var fontSize: CGFloat = 11.5
    @ViewBuilder var glyph: (CGFloat, Color) -> Glyph

    var body: some View {
        HStack(spacing: 6) {
            HiqmahBadge(radius: radius, theme: theme, glyph: glyph)
            Text(title)
                .font(.system(size: fontSize, weight: .bold))
                .foregroundColor(theme.title)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Spacer(minLength: 0)
        }
    }
}

// MARK: Instruments

/// Track plus a gold arc from twelve o'clock. `fraction` is what REMAINS, so the
/// gauge depletes as an event approaches — the same direction on every family.
struct GaugeRing: View {
    var fraction: Double
    var theme: HiqmahTheme
    var mono: Bool = false

    var body: some View {
        GeometryReader { geo in
            let side = min(geo.size.width, geo.size.height)
            let lw = side * 0.058
            let f = max(0.004, min(1, fraction))
            ZStack {
                Circle()
                    .strokeBorder(mono ? Color.white.opacity(0.28) : theme.track, lineWidth: lw)
                if mono {
                    Circle()
                        .trim(from: 0, to: f)
                        .stroke(Color.white.opacity(0.95),
                                style: StrokeStyle(lineWidth: lw, lineCap: .round))
                        .padding(lw / 2)
                        .rotationEffect(.degrees(-90))
                } else {
                    Circle()
                        .trim(from: 0, to: f)
                        .stroke(
                            LinearGradient(colors: [theme.arcA, theme.arcB],
                                           startPoint: .topLeading, endPoint: .bottomTrailing),
                            style: StrokeStyle(lineWidth: lw, lineCap: .round)
                        )
                        .padding(lw / 2)
                        .rotationEffect(.degrees(-90))
                }
            }
            .frame(width: side, height: side)
        }
    }
}

/// The qibla blade: slender, with the sides leaving the apex almost vertically so
/// the tip reads as a fine point rather than a rounded cone.
struct QiblaNeedle: Shape {
    func path(in rect: CGRect) -> Path {
        let r = min(rect.width, rect.height) / 2
        let l = r * 0.635
        let w = r * 0.165
        let cx = rect.midX
        let cy = rect.midY
        func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: cx + x, y: cy + y) }
        var path = Path()
        path.move(to: p(0, -l))
        path.addCurve(to: p(0.84 * w, -0.14 * l),
                      control1: p(0.07 * w, -0.84 * l), control2: p(0.55 * w, -0.52 * l))
        path.addCurve(to: p(0, 0.30 * l),
                      control1: p(0.99 * w, 0.08 * l), control2: p(0.58 * w, 0.30 * l))
        path.addCurve(to: p(-0.84 * w, -0.14 * l),
                      control1: p(-0.58 * w, 0.30 * l), control2: p(-0.99 * w, 0.08 * l))
        path.addCurve(to: p(0, -l),
                      control1: p(-0.55 * w, -0.52 * l), control2: p(-0.07 * w, -0.84 * l))
        path.closeSubpath()
        return path
    }
}

/// Tick ring, cardinals, blade, and the Kaaba struck at the pivot. The medallion
/// is FIXED and the blade radiates from behind it, so the two can never collide
/// whichever way the qibla points.
struct CompassDial: View {
    var bearing: Double
    var theme: HiqmahTheme
    var showsCardinals: Bool = true
    var mono: Bool = false

    private func tickLength(_ i: Int, _ r: CGFloat) -> CGFloat {
        if i % 18 == 0 { return r * 0.125 }
        if i % 9 == 0 { return r * 0.098 }
        return r * 0.068
    }

    private func tickOpacity(_ i: Int) -> Double {
        if i % 18 == 0 { return 0.95 }
        if i % 9 == 0 { return 0.68 }
        return 0.45
    }

    private func cardinalOffset(_ index: Int, _ r: CGFloat) -> CGSize {
        let rr = r * 0.735
        switch index {
        case 0: return CGSize(width: 0, height: -rr)
        case 1: return CGSize(width: rr, height: 0)
        case 2: return CGSize(width: 0, height: rr)
        default: return CGSize(width: -rr, height: 0)
        }
    }

    var body: some View {
        GeometryReader { geo in
            let side = min(geo.size.width, geo.size.height)
            let r = side / 2
            let tint = mono ? Color.white : theme.goldLine
            ZStack {
                if !mono {
                    Circle()
                        .fill(theme.inner)
                        .frame(width: r * 1.71, height: r * 1.71)
                    Circle()
                        .strokeBorder(theme.innerEdge, lineWidth: 1)
                        .frame(width: r * 1.71, height: r * 1.71)
                }

                ForEach(0..<72, id: \.self) { i in
                    Capsule()
                        .fill(tint.opacity(tickOpacity(i)))
                        .frame(width: i % 18 == 0 ? r * 0.020 : r * 0.0135,
                               height: tickLength(i, r))
                        .offset(y: -(r - tickLength(i, r) / 2))
                        .rotationEffect(.degrees(Double(i) * 5))
                }

                if showsCardinals && !mono {
                    ForEach(0..<4, id: \.self) { i in
                        Text(["N", "E", "S", "W"][i])
                            .font(.system(size: r * 0.135, weight: i == 0 ? .bold : .medium))
                            .foregroundColor(theme.cardinal.opacity(i == 0 ? 0.95 : 0.62))
                            .offset(cardinalOffset(i, r))
                    }
                }

                Group {
                    if mono {
                        QiblaNeedle().fill(Color.white.opacity(0.95))
                    } else {
                        QiblaNeedle().fill(
                            LinearGradient(colors: [theme.arcA, theme.arcB],
                                           startPoint: .topLeading, endPoint: .bottomTrailing)
                        )
                    }
                }
                .frame(width: side, height: side)
                .rotationEffect(.degrees(bearing))

                if mono {
                    Circle()
                        .fill(Color.white.opacity(0.95))
                        .frame(width: r * 0.29, height: r * 0.29)
                } else {
                    ZStack {
                        Circle().fill(Color(hiqmahHex: 0x141416))
                        Circle().strokeBorder(theme.onDark.opacity(0.85), lineWidth: max(1, r * 0.0225))
                        KaabaGlyph(size: r * 0.57, color: theme.onDark)
                    }
                    .frame(width: r * 0.53, height: r * 0.53)
                }
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}

// MARK: Card application

extension View {
    /// The family card. On iOS 17+ this is the widget's container background; on
    /// 16 it is painted behind the content, which also has to supply its own
    /// margins since automatic content margins arrived with 17.
    @ViewBuilder
    func hiqmahCard(_ theme: HiqmahTheme) -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(for: .widget) { HiqmahCardBackground(theme: theme) }
        } else {
            ZStack {
                HiqmahCardBackground(theme: theme)
                self.padding(14)
            }
        }
    }
}
