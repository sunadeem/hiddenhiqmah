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
    let entry: NextPrayerEntry

    var body: some View {
        content.widgetURL(hiqmahCountdownURL)
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryCircular:
            circularView.hiqmahAccessoryBackground()
        default:
            smallView.hiqmahWidgetBackground()
        }
    }

    // MARK: Accessory — circular

    /// The countdown, auto-scaled to whatever the tray allows, with the prayer
    /// name whispered underneath. `Text(timerInterval:)` swings between "12:34"
    /// and "10:12:34" over a night, so lineLimit(1) + a generous
    /// minimumScaleFactor is what keeps it from being clipped mid-tick;
    /// monospacedDigit stops the whole line from breathing every second.
    @ViewBuilder
    private var circularView: some View {
        if let instant = entry.instant {
            VStack(spacing: 0) {
                Text(
                    timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                    countsDown: true
                )
                .font(.system(size: 15, weight: .semibold, design: .rounded).monospacedDigit())
                .lineLimit(1)
                .minimumScaleFactor(0.4)
                Text(instant.prayer.displayName)
                    .font(.system(size: 9, weight: .medium))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .padding(2)
        } else {
            // Same empty state as Next Prayer's circular family.
            VStack(spacing: 0) {
                Image(systemName: "moon.stars")
                    .font(.system(size: 13, weight: .medium))
                Text("—")
                    .font(.system(size: 12, weight: .semibold))
            }
            .padding(2)
        }
    }

    // MARK: Home screen — small

    /// Two elements, centred: the countdown and "until <Prayer>". That is the
    /// entire widget — anyone who wants the clock time or the day's schedule has
    /// the Next Prayer widget for it.
    @ViewBuilder
    private var smallView: some View {
        if let instant = entry.instant {
            VStack(alignment: .leading, spacing: 4) {
                Spacer(minLength: 0)

                Text(
                    timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                    countsDown: true
                )
                .font(.system(size: 30, weight: .semibold, design: .rounded).monospacedDigit())
                .foregroundColor(.hiqmahGold)
                .lineLimit(1)
                .minimumScaleFactor(0.4)

                Text("until \(instant.prayer.displayName)")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.hiqmahText)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        } else {
            // Same wording as Next Prayer's empty home-screen state.
            VStack(alignment: .leading, spacing: 4) {
                Text("Prayer countdown")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.hiqmahText)
                Text("Open Hiqmah")
                    .font(.system(size: 13))
                    .foregroundColor(.hiqmahGold)
                Text("Set your location once and the countdown appears here.")
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
