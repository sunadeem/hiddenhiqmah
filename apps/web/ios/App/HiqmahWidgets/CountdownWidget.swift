import SwiftUI
import WidgetKit

/**
 * Prayer Countdown — the compact, countdown-only face of Next Prayer.
 *
 * Next Prayer answers "what, when, and how long"; this one answers only "how
 * long". No clock time, no city, no five-times row, no "then …" line. It exists
 * because a home screen or Lock Screen already crowded with information is the
 * place where a single ticking number does the most work — the whole point is
 * what has been left out, so resist adding a fourth thing to either family.
 *
 * DATA + TIMELINE ARE NOT REIMPLEMENTED. This widget renders
 * `NextPrayerProvider`'s entries verbatim: one entry now, one at every upcoming
 * prayer instant, plus the local-midnight boundaries, with the same
 * placeholder/preview sample and the same "Open Hiqmah" empty state. WidgetKit
 * gives every widget KIND its own provider instance and its own stored
 * timeline, so sharing the provider type costs nothing and keeps the two
 * widgets flipping to the next prayer at the exact same instant — a divergence
 * here would be visible on a screen showing both. The unused `following` /
 * `schedule` fields on the entry are simply not drawn.
 *
 * The number itself is drawn by `Text(timerInterval:)`, which the system ticks
 * for us, so one entry stays live for its whole span with no polling.
 */

/// Tapping opens the full prayer-times page — same destination as Next Prayer,
/// which is the natural follow-up to "how long is left?".
///
/// NOTE: routed by the WIDGET_ROUTES allow-list in src/lib/mobile/deeplinks.ts
/// — `prayer-times` must stay listed there, or the tap silently degrades to
/// "just open the app". Deliberately no `code` query param, so it can never be
/// mistaken for a circle invite.
private let hiqmahCountdownURL = URL(string: "hiddenhiqmah://prayer-times")

// MARK: - View

struct CountdownWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    @Environment(\.colorScheme) private var colorScheme
    let entry: NextPrayerEntry

    private var theme: HiqmahTheme { HiqmahTheme.of(colorScheme) }

    var body: some View {
        content.widgetURL(URL(string: "hiddenhiqmah://prayer-times"))
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryCircular:
            circularView.hiqmahAccessoryBackground()
        default:
            smallView.hiqmahCard(theme)
        }
    }

    /// Start of the interval being counted through, for the progress rail: the
    /// scheduled prayer immediately before the target, falling back to when this
    /// entry was made. Clamped so the range can never be empty or inverted —
    /// ProgressView(timerInterval:) traps on both.
    private func interval(to instant: PrayerInstant) -> ClosedRange<Date> {
        // priorDate first — see NextPrayerWidget.interval(to:): the single-day
        // schedule loses the prior prayer across local midnight and the ring
        // would refill to 100% at 00:00.
        let prior = entry.priorDate
            ?? entry.schedule
                .filter { $0.date < instant.date }
                .max(by: { $0.date < $1.date })?.date
            ?? entry.date
        let end = max(instant.date, prior.addingTimeInterval(60))
        return min(prior, end.addingTimeInterval(-60))...end
    }

    // MARK: Home screen — small

    /// Centred on both axes. This face exists to show one number, and a leading
    /// alignment let the width that Text(timerInterval:) reserves for its widest
    /// possible string drag the digits visibly off-axis.
    @ViewBuilder
    private var smallView: some View {
        if let instant = entry.instant {
            VStack(spacing: 0) {
                HiqmahHeader(title: "Countdown", theme: theme) { size, colour in
                    HourglassGlyph(size: size, color: colour)
                }

                Spacer(minLength: 0)

                Text(
                    timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                    countsDown: true
                )
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .monospacedDigit()
                .foregroundColor(theme.goldDisplay)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
                .lineLimit(1)
                .minimumScaleFactor(0.4)

                Text("until \(instant.prayer.displayName)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(theme.title)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                Spacer(minLength: 0)

                // A live rail rather than a ring: a trimmed circle would be frozen
                // at render time and disagree with the ticking digits above it.
                ProgressView(
                    timerInterval: interval(to: instant),
                    countsDown: true,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .progressViewStyle(.linear)
                .tint(theme.goldDisplay)
                .frame(height: 4)
            }
        } else {
            VStack(spacing: 0) {
                HiqmahHeader(title: "Countdown", theme: theme) { size, colour in
                    HourglassGlyph(size: size, color: colour)
                }
                Spacer(minLength: 0)
                Text("Open Hiqmah")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(theme.goldText)
                Text("Set your location once and the countdown appears here.")
                    .font(.system(size: 11))
                    .foregroundColor(theme.muted)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                    .minimumScaleFactor(0.8)
                Spacer(minLength: 0)
            }
        }
    }

    // MARK: Accessory — circular

    @ViewBuilder
    private var circularView: some View {
        if let instant = entry.instant {
            // No ring. It cost ~4pt of radius on every side and shrank the one
            // thing this face exists to show; the frosted disc alone is the
            // container. Timer spans the full equator, name sits beneath.
            VStack(spacing: 0) {
                Text(
                    timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                    countsDown: true
                )
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.4)
                .multilineTextAlignment(.center)
                // 36, not the full equator: the digit row sits above centre, and
                // at 44 wide its corners left the disc (√(22² + 9.6²) = 24 > the
                // 22.5 radius; 3pt outside on an SE). 36 clears every canvas.
                .frame(maxWidth: 36)

                Text(instant.prayer.displayName)
                    .font(.system(size: 10, weight: .semibold))
                    .opacity(0.85)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                    .frame(maxWidth: 40)
            }
        } else {
            VStack(spacing: 1) {
                HourglassGlyph(size: 15, color: .white)
                Text("—").font(.system(size: 11, weight: .semibold))
            }
        }
    }
}

// MARK: - Widget

struct CountdownWidget: Widget {
    static let kind = "HiqmahCountdown"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: CountdownWidget.kind, provider: NextPrayerProvider()) { entry in
            CountdownWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prayer Countdown")
        .description("Just the time left until the next prayer — the compact, countdown-only face.")
        .supportedFamilies([
            .systemSmall,
            .accessoryCircular
        ])
    }
}

// MARK: - Next Prayer Compact (accessoryCircular only)

/// The build-11 rectangular stack — icon + prayer, its time, the countdown —
/// reborn as a circular. That content half-fills the rectangular slot and wastes
/// the rest; the circle carries the identical three lines with no dead space.
/// Row widths follow the circle: the middle line gets the equator, the top and
/// bottom rows get the narrower chords they sit on.
struct NextPrayerCompactWidgetEntryView: View {
    let entry: NextPrayerEntry

    var body: some View {
        content.widgetURL(URL(string: "hiddenhiqmah://prayer-times"))
    }

    @ViewBuilder
    private var content: some View {
        Group {
            if let instant = entry.instant {
                VStack(spacing: 0) {
                    HStack(spacing: 2) {
                        Image(systemName: instant.prayer.symbolName)
                            .font(.system(size: 7.5, weight: .semibold))
                        Text(instant.prayer.displayName)
                            .font(.system(size: 8.5, weight: .bold))
                    }
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                    // 36: at 32 "Maghrib" needed a 0.619 scale against a 0.6
                    // floor — a 3% margin from truncating to an ellipsis. The
                    // chord at this row's height allows ~37.
                    .frame(maxWidth: 36)

                    Text(HiqmahFormat.clock(instant.date))
                        .font(.system(size: 9.5, weight: .medium))
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                        .frame(maxWidth: 40)

                    Text(
                        timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                        countsDown: true
                    )
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.4)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: 34)
                }
            } else {
                VStack(spacing: 1) {
                    Image(systemName: "moon.stars")
                        .font(.system(size: 13, weight: .medium))
                    Text("—").font(.system(size: 11, weight: .semibold))
                }
            }
        }
        .hiqmahAccessoryBackground()
    }
}

struct NextPrayerCompactWidget: Widget {
    static let kind = "HiqmahNextPrayerCompact"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: NextPrayerCompactWidget.kind, provider: NextPrayerProvider()) { entry in
            NextPrayerCompactWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Next Prayer Compact")
        .description("Prayer, time and countdown — the whole glance in one circle.")
        .supportedFamilies([.accessoryCircular])
    }
}
