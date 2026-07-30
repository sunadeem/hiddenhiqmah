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

// MARK: - Skyline

/// A mosque silhouette for the base of the large face. Deliberately low: the
/// dial's opaque inner disc is drawn on top of this, so anything tall enough to
/// reach behind the dial would be silently erased rather than layered.
private struct MosqueSkyline: Shape {
    func path(in rect: CGRect) -> Path {
        let s = rect.width / 338
        let y = rect.maxY
        var p = Path()

        p.addRect(CGRect(x: rect.minX, y: y - 26 * s, width: 44 * s, height: 26 * s))
        p.addRect(CGRect(x: rect.minX + 294 * s, y: y - 26 * s, width: 44 * s, height: 26 * s))

        for centre in [58.0, 280.0] {
            let x = rect.minX + CGFloat(centre) * s
            p.move(to: CGPoint(x: x - 6 * s, y: y))
            p.addLine(to: CGPoint(x: x - 6 * s, y: y - 74 * s))
            p.addQuadCurve(to: CGPoint(x: x, y: y - 88 * s),
                           control: CGPoint(x: x - 6 * s, y: y - 84 * s))
            p.addQuadCurve(to: CGPoint(x: x + 6 * s, y: y - 74 * s),
                           control: CGPoint(x: x + 6 * s, y: y - 84 * s))
            p.addLine(to: CGPoint(x: x + 6 * s, y: y))
            p.closeSubpath()
            p.addEllipse(in: CGRect(x: x - 3.4 * s, y: y - 97.4 * s,
                                    width: 6.8 * s, height: 6.8 * s))
        }

        for centre in [110.0, 228.0] {
            let x = rect.minX + CGFloat(centre) * s
            p.move(to: CGPoint(x: x - 22 * s, y: y))
            p.addLine(to: CGPoint(x: x - 22 * s, y: y - 38 * s))
            p.addQuadCurve(to: CGPoint(x: x, y: y - 66 * s),
                           control: CGPoint(x: x - 22 * s, y: y - 58 * s))
            p.addQuadCurve(to: CGPoint(x: x + 22 * s, y: y - 38 * s),
                           control: CGPoint(x: x + 22 * s, y: y - 58 * s))
            p.addLine(to: CGPoint(x: x + 22 * s, y: y))
            p.closeSubpath()
        }

        let cx = rect.minX + 169 * s
        p.move(to: CGPoint(x: cx - 35 * s, y: y))
        p.addLine(to: CGPoint(x: cx - 35 * s, y: y - 58 * s))
        p.addQuadCurve(to: CGPoint(x: cx, y: y - 86 * s),
                       control: CGPoint(x: cx - 35 * s, y: y - 78 * s))
        p.addQuadCurve(to: CGPoint(x: cx + 35 * s, y: y - 58 * s),
                       control: CGPoint(x: cx + 35 * s, y: y - 78 * s))
        p.addLine(to: CGPoint(x: cx + 35 * s, y: y))
        p.closeSubpath()

        return p
    }
}

// MARK: - View

struct QiblaWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    @Environment(\.colorScheme) private var colorScheme
    let entry: QiblaEntry

    private var theme: HiqmahTheme { HiqmahTheme.of(colorScheme) }

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
        case .accessoryRectangular:
            rectangularView.hiqmahClearWidgetBackground()
        case .systemMedium:
            mediumView.hiqmahCard(theme)
        case .systemLarge:
            largeView.hiqmahCard(theme)
        default:
            smallView.hiqmahCard(theme)
        }
    }

    private var readout: String {
        guard let bearing = entry.bearing else { return "—" }
        return "\(Qibla.degreesLabel(bearing)) \(Qibla.cardinal(bearing))"
    }

    // MARK: Accessory — inline

    @ViewBuilder
    private var inlineView: some View {
        if let bearing = entry.bearing {
            Text("Qiblah \(Qibla.degreesLabel(bearing)) \(Qibla.cardinal(bearing))")
        } else {
            Text("Qiblah — Open Hiqmah")
        }
    }

    // MARK: Accessory — circular

    /// Fully concentric, and the degrees are knocked OUT of the pivot disc — the
    /// place the Kaaba medallion holds on the larger faces. Nothing sits on the
    /// tick ring, so there is no vertical offset to make room for a caption.
    @ViewBuilder
    private var circularView: some View {
        if let bearing = entry.bearing {
            let label = Qibla.degreesLabel(bearing)
            CompassDial(bearing: bearing, theme: theme, showsCardinals: false, mono: true)
                .mask(
                    ZStack {
                        Rectangle()
                        Text(label)
                            .font(.system(size: label.count > 3 ? 11 : 13,
                                          weight: .bold, design: .rounded))
                            .monospacedDigit()
                            .blendMode(.destinationOut)
                    }
                    .compositingGroup()
                )
                .padding(1)
        } else {
            VStack(spacing: 1) {
                KaabaGlyph(size: 15, color: .white)
                Text("—").font(.system(size: 11, weight: .semibold))
            }
        }
    }

    // MARK: Accessory — rectangular

    @ViewBuilder
    private var rectangularView: some View {
        if let bearing = entry.bearing {
            HStack(spacing: 9) {
                HiqmahBadge(radius: 13, theme: theme, mono: true) { size, colour in
                    KaabaGlyph(size: size, color: colour)
                }
                VStack(alignment: .leading, spacing: 1) {
                    Text("QIBLAH")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(0.7)
                        .foregroundColor(.white.opacity(0.72))
                    Text(readout)
                        .font(.system(size: 19, weight: .bold, design: .rounded))
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                    Text("from true north")
                        .font(.system(size: 9.5))
                        .foregroundColor(.white.opacity(0.62))
                        .lineLimit(1)
                }
                Spacer(minLength: 0)
            }
        } else {
            Text("Qiblah — Open Hiqmah")
        }
    }

    // MARK: Home screen — small

    @ViewBuilder
    private var smallView: some View {
        if let bearing = entry.bearing {
            VStack(spacing: 0) {
                HiqmahHeader(title: "Qiblah", theme: theme) { size, colour in
                    KaabaGlyph(size: size, color: colour)
                }
                Spacer(minLength: 2)
                CompassDial(bearing: bearing, theme: theme)
                    .aspectRatio(1, contentMode: .fit)
                Spacer(minLength: 2)
                Text(readout)
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .foregroundColor(theme.goldText)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                Text("from true north")
                    .font(.system(size: 9.5))
                    .foregroundColor(theme.muted)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
        } else {
            emptyView
        }
    }

    // MARK: Home screen — medium

    @ViewBuilder
    private var mediumView: some View {
        if let bearing = entry.bearing {
            HStack(spacing: 16) {
                CompassDial(bearing: bearing, theme: theme)
                    .aspectRatio(1, contentMode: .fit)
                VStack(alignment: .leading, spacing: 3) {
                    HiqmahHeader(title: "Qiblah", theme: theme, radius: 11, fontSize: 13) { size, colour in
                        KaabaGlyph(size: size, color: colour)
                    }
                    Spacer(minLength: 2)
                    Text(readout)
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .monospacedDigit()
                        .foregroundColor(theme.goldDisplay)
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)
                    Text("from true north")
                        .font(.system(size: 12))
                        .foregroundColor(theme.muted)
                    if let city = entry.city, let km = entry.distanceKm,
                       let distance = Qibla.distanceLabel(km) {
                        Text("\(city) · \(distance)")
                            .font(.system(size: 11))
                            .monospacedDigit()
                            .foregroundColor(theme.muted)
                            .lineLimit(1)
                            .minimumScaleFactor(0.8)
                    }
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        } else {
            emptyView
        }
    }

    // MARK: Home screen — large

    @ViewBuilder
    private var largeView: some View {
        if let bearing = entry.bearing {
            ZStack(alignment: .bottom) {
                MosqueSkyline()
                    .fill(theme.sky)
                    .frame(height: 78)
                    .frame(maxWidth: .infinity, alignment: .bottom)

                VStack(spacing: 0) {
                    HStack(alignment: .top, spacing: 9) {
                        HiqmahBadge(radius: 19, theme: theme) { size, colour in
                            KaabaGlyph(size: size, color: colour)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Qiblah")
                                .font(.system(size: 21, weight: .bold))
                                .foregroundColor(theme.title)
                            Text("Makkah")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(theme.goldText)
                        }
                        Spacer(minLength: 0)
                        VStack(alignment: .trailing, spacing: 3) {
                            if let city = entry.city {
                                HStack(spacing: 5) {
                                    Circle()
                                        .fill(Color(hiqmahHex: 0x34C759))
                                        .frame(width: 7, height: 7)
                                    Text(city)
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(theme.title.opacity(0.85))
                                        .lineLimit(1)
                                }
                            }
                            if let km = entry.distanceKm, let distance = Qibla.distanceLabel(km) {
                                Text(distance)
                                    .font(.system(size: 12))
                                    .monospacedDigit()
                                    .foregroundColor(theme.muted)
                            }
                        }
                    }

                    Spacer(minLength: 6)

                    CompassDial(bearing: bearing, theme: theme)
                        .aspectRatio(1, contentMode: .fit)

                    Spacer(minLength: 6)

                    Text(Qibla.degreesLabel(bearing))
                        .font(.system(size: 38, weight: .bold, design: .rounded))
                        .monospacedDigit()
                        .foregroundColor(theme.goldDisplay)
                    Text("from true north")
                        .font(.system(size: 13))
                        .foregroundColor(theme.muted)
                }
            }
        } else {
            emptyView
        }
    }

    // MARK: Empty

    @ViewBuilder
    private var emptyView: some View {
        VStack(spacing: 0) {
            HiqmahHeader(title: "Qiblah", theme: theme) { size, colour in
                KaabaGlyph(size: size, color: colour)
            }
            Spacer(minLength: 0)
            Text("Open Hiqmah")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(theme.goldText)
            Text("Set your location once and the direction appears here.")
                .font(.system(size: 11))
                .foregroundColor(theme.muted)
                .multilineTextAlignment(.center)
                .lineLimit(3)
                .minimumScaleFactor(0.8)
            Spacer(minLength: 0)
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
        .configurationDisplayName("Qiblah")
        .description("The bearing to the Kaaba from your saved location. Open Hiqmah for the live compass.")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .systemLarge,
            .accessoryInline,
            .accessoryCircular,
            .accessoryRectangular
        ])
    }
}
