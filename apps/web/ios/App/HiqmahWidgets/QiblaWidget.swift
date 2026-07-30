import SwiftUI
import WidgetKit

/**
 * Qibla — the direction of the Kaaba from where the user last was.
 *
 * THIS IS A STATIC BEARING, NOT A COMPASS. A widget cannot read the
 * magnetometer: extensions get no continuous sensor access, and a timeline entry
 * is a snapshot the system may render minutes or hours after it was built. So the
 * widget answers the question a compass can't be asked at a glance — "which way is
 * it from here, in degrees" — and says "from true north" out loud on the small
 * family so the arrow is never mistaken for a needle tracking the phone. Turning
 * to face it is the app's job (QiblahSection, which does have the sensors and
 * applies magnetic declination on top of this same bearing).
 *
 * The bearing is recomputed natively from the payload's lat/lng rather than
 * shipped as a precomputed number, mirroring calcQiblahBearing / haversineKm in
 * src/components/QiblahSection.tsx: initial great-circle bearing from TRUE north,
 * and a haversine distance on R = 6371 km.
 *
 * Verified against the web implementation — same formula, same constants, and the
 * two agree to two decimal places. Spot values, run through this file's own
 * `bearing`/`distanceKm` and then through the display formatters:
 *   Toronto  43.6532, -79.3832 →  54.58° → "55° NE",  10,496 km
 *   London   51.5074,  -0.1278 → 118.99° → "119° ESE", 4,794 km
 *   Jakarta  -6.2088, 106.8456 → 295.15° → "295° WNW", 7,920 km
 * All three are within a degree of the widely published qibla for those cities.
 * (The rendered label rounds, so Toronto reads 55° — expected, not drift.)
 *
 * With no coordinate in the app group — fresh install, location never granted, or
 * a payload written before v2 added lat/lng — every family falls back to
 * "Open Hiqmah", the same contract as NextPrayerWidget.
 */

/// Tapping opens the real compass, which is the whole point: the widget gives the
/// number at a glance, the app gives the live needle. That hand-off is the honest
/// answer to "this isn't a compass".
///
/// `qiblah` must stay in the WIDGET_ROUTES allow-list in
/// src/lib/mobile/deeplinks.ts; a key that isn't listed there silently degrades to
/// "just open the app", which is safe but wastes the tap.
private let hiqmahQiblahURL = URL(string: "hiddenhiqmah://qiblah")

// MARK: - Geometry

enum Qibla {
    /// The Kaaba. Same constants as QiblahSection.tsx.
    static let kaabaLatitude = 21.4225
    static let kaabaLongitude = 39.8262

    private static let earthRadiusKm = 6371.0

    private static func toRadians(_ degrees: Double) -> Double { degrees * .pi / 180 }
    private static func toDegrees(_ radians: Double) -> Double { radians * 180 / .pi }

    /// Initial great-circle bearing to the Kaaba, degrees clockwise from TRUE
    /// north, normalised to 0..<360.
    ///
    /// Note this is the *initial* bearing of the shortest path, which is the
    /// standard qibla convention — it is not a constant-heading (rhumb line)
    /// course, and the two differ by a lot at high latitudes.
    static func bearing(from origin: Coordinate) -> Double {
        let lat1 = toRadians(origin.latitude)
        let lng1 = toRadians(origin.longitude)
        let lat2 = toRadians(kaabaLatitude)
        let lng2 = toRadians(kaabaLongitude)

        let y = sin(lng2 - lng1) * cos(lat2)
        let x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(lng2 - lng1)
        return (toDegrees(atan2(y, x)) + 360).truncatingRemainder(dividingBy: 360)
    }

    /// Great-circle (haversine) distance to the Kaaba in kilometres.
    static func distanceKm(from origin: Coordinate) -> Double {
        let lat1 = toRadians(origin.latitude)
        let lat2 = toRadians(kaabaLatitude)
        let deltaLat = lat2 - lat1
        let deltaLng = toRadians(kaabaLongitude - origin.longitude)

        let a = pow(sin(deltaLat / 2), 2) + cos(lat1) * cos(lat2) * pow(sin(deltaLng / 2), 2)
        // Clamped before asin: a can exceed 1 by a rounding hair at antipodes.
        return 2 * earthRadiusKm * asin(min(1, max(0, a)).squareRoot())
    }

    private static let cardinals = [
        "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
    ]

    /// 16-point compass label, matching compassDirection() in QiblahSection.tsx.
    static func cardinal(_ degrees: Double) -> String {
        let index = Int((degrees / 22.5).rounded()) % 16
        return cardinals[(index + 16) % 16]
    }

    /// "54°" — rounded, and wrapped so a bearing of 359.7 never reads "360°".
    static func degreesLabel(_ degrees: Double) -> String {
        let whole = Int(degrees.rounded()) % 360
        return "\((whole + 360) % 360)°"
    }

    /// "10,496 km" / "812 km" / "94 km". Under 10 km the qibla is essentially
    /// "you're there", and the figure is noise next to GPS error, so it's dropped.
    static func distanceLabel(_ km: Double) -> String? {
        guard km.isFinite, km >= 10 else { return nil }
        return "\(Int(km.rounded()).formatted()) km"
    }
}

// MARK: - Entry

struct QiblaEntry: TimelineEntry {
    let date: Date
    /// nil = no usable coordinate, render "Open Hiqmah".
    let bearing: Double?
    let distanceKm: Double?
    let city: String?

    static func empty(at date: Date) -> QiblaEntry {
        QiblaEntry(date: date, bearing: nil, distanceKm: nil, city: nil)
    }

    static func make(at date: Date, from data: WidgetData) -> QiblaEntry {
        guard let coordinate = data.coordinate else { return .empty(at: date) }
        return QiblaEntry(
            date: date,
            bearing: Qibla.bearing(from: coordinate),
            distanceKm: Qibla.distanceKm(from: coordinate),
            city: data.city
        )
    }
}

// MARK: - Provider

struct QiblaProvider: TimelineProvider {
    /// Belt and braces for the empty state only — see getTimeline.
    private static let retryInterval: TimeInterval = 6 * 60 * 60

    func placeholder(in context: Context) -> QiblaEntry {
        QiblaEntry.make(at: Date(), from: WidgetData.sample())
    }

    func getSnapshot(in context: Context, completion: @escaping (QiblaEntry) -> Void) {
        let now = Date()
        if let data = WidgetData.loadAny(), data.coordinate != nil {
            completion(QiblaEntry.make(at: now, from: data))
        } else if context.isPreview {
            // The widget gallery should never show an empty card.
            completion(QiblaEntry.make(at: now, from: WidgetData.sample()))
        } else {
            completion(.empty(at: now))
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QiblaEntry>) -> Void) {
        let now = Date()

        // `loadAny`, not `load`: the bearing doesn't care whether the payload's
        // 30-day prayer window has run out. Someone who hasn't opened Hiqmah in
        // six weeks still gets a correct qibla.
        guard let data = WidgetData.loadAny(), data.coordinate != nil else {
            // The only thing that can populate this is the app writing a payload,
            // and WidgetBridge reloads all timelines when it does — so in theory
            // .never is right here too. An hourly-ish retry is cheap insurance
            // against a write whose reload didn't land, which would otherwise
            // strand the widget on "Open Hiqmah" until the next reinstall.
            completion(
                Timeline(
                    entries: [QiblaEntry.empty(at: now)],
                    policy: .after(now.addingTimeInterval(QiblaProvider.retryInterval))
                )
            )
            return
        }

        // ONE entry, then never: unlike prayer times, nothing about this expires
        // with the clock. It changes only when the user's location does, and that
        // arrives as a fresh payload plus a WidgetCenter reload — so scheduling
        // any refresh here would just burn budget redrawing the same arrow.
        completion(Timeline(entries: [QiblaEntry.make(at: now, from: data)], policy: .never))
    }
}

// MARK: - View

struct QiblaWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: QiblaEntry

    var body: some View {
        content.widgetURL(hiqmahQiblahURL)
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryInline:
            inlineView.hiqmahClearWidgetBackground()
        case .accessoryCircular:
            circularView.hiqmahAccessoryBackground()
        default:
            smallView.hiqmahWidgetBackground()
        }
    }

    // MARK: Accessory — inline

    @ViewBuilder
    private var inlineView: some View {
        if let bearing = entry.bearing {
            // The inline family is a single line of system-styled text next to the
            // clock; no glyph, because it would eat a third of the width.
            Text("Qibla \(Qibla.degreesLabel(bearing)) \(Qibla.cardinal(bearing))")
        } else {
            Text("Qibla — Open Hiqmah")
        }
    }

    // MARK: Accessory — circular

    @ViewBuilder
    private var circularView: some View {
        if let bearing = entry.bearing {
            VStack(spacing: 0) {
                Image(systemName: "location.north.fill")
                    .font(.system(size: 15, weight: .semibold))
                    // Up is north. The arrow points along the bearing, so the
                    // whole face reads like a fixed map rather than a needle.
                    .rotationEffect(.degrees(bearing))
                Text(Qibla.degreesLabel(bearing))
                    .font(.system(size: 11, weight: .semibold))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .padding(2)
        } else {
            VStack(spacing: 0) {
                Image(systemName: "location.north")
                    .font(.system(size: 15, weight: .semibold))
                Text("—")
                    .font(.system(size: 11, weight: .semibold))
            }
            .padding(2)
        }
    }

    // MARK: Home screen — small

    @ViewBuilder
    private var smallView: some View {
        if let bearing = entry.bearing {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Image(systemName: "location.north.fill")
                        .font(.system(size: 10, weight: .semibold))
                        .rotationEffect(.degrees(bearing))
                    Text("QIBLA")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(0.6)
                }
                .foregroundColor(.hiqmahMuted)

                Text("\(Qibla.degreesLabel(bearing)) \(Qibla.cardinal(bearing))")
                    .font(.system(size: 26, weight: .semibold, design: .rounded))
                    .foregroundColor(.hiqmahGold)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)

                Text("from true north")
                    .font(.system(size: 10))
                    .foregroundColor(.hiqmahMuted)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Spacer(minLength: 0)

                if let km = entry.distanceKm, let distance = Qibla.distanceLabel(km) {
                    Text(distance)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.hiqmahText)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }

                if let city = entry.city {
                    Text(city)
                        .font(.system(size: 11))
                        .foregroundColor(.hiqmahMuted)
                        .lineLimit(1)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        } else {
            VStack(alignment: .leading, spacing: 4) {
                Text("Qibla")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.hiqmahText)
                Text("Open Hiqmah")
                    .font(.system(size: 13))
                    .foregroundColor(.hiqmahGold)
                Text("Set your location once and the direction appears here.")
                    .font(.system(size: 11))
                    .foregroundColor(.hiqmahMuted)
                    .lineLimit(3)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
    }
}

// MARK: - Widget

struct QiblaWidget: Widget {
    static let kind = "HiqmahQibla"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: QiblaWidget.kind, provider: QiblaProvider()) { entry in
            QiblaWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Qibla")
        .description("The bearing to the Kaaba from your saved location. Open Hiqmah for the live compass.")
        .supportedFamilies([
            .systemSmall,
            .accessoryInline,
            .accessoryCircular
        ])
    }
}
