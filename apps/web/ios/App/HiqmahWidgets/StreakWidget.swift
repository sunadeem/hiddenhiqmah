import SwiftUI
import WidgetKit

/**
 * Streak — consecutive days the user has opened Hiqmah.
 *
 * The count is computed by the web layer (recordVisit / getVisitStats in
 * packages/ui/lib/storage.ts) and rides along in the widget payload, because the
 * extension can neither run that bookkeeping nor reach the localStorage it lives
 * in. So the number is only ever as fresh as the last app open — which is fine,
 * since opening the app is precisely the thing that changes it. The awkward case
 * is the lapsed user, whose stored count is not stale but *wrong*; that's what
 * `WidgetData.liveStreak` filters, so this widget shows its placeholder rather
 * than a number the user has already lost.
 *
 * Nothing here counts DOWN or nags. A streak widget that shames someone into
 * opening an Islamic app would be the wrong instinct for this product — it states
 * the number, warmly, and stops.
 */

/// Tapping opens the daily checklist — the page whose habit the streak actually
/// measures, and the useful next action for someone who just glanced at the count.
///
/// `muslim-daily` must stay in the WIDGET_ROUTES allow-list in
/// src/lib/mobile/deeplinks.ts; a key that isn't listed there silently degrades to
/// "just open the app", which is safe but wastes the tap.
private let hiqmahStreakURL = URL(string: "hiddenhiqmah://muslim-daily")

// MARK: - Entry

struct StreakEntry: TimelineEntry {
    let date: Date
    /// nil = nothing trustworthy to show, render the placeholder.
    let streak: Int?

    static func empty(at date: Date) -> StreakEntry {
        StreakEntry(date: date, streak: nil)
    }
}

// MARK: - Provider

struct StreakProvider: TimelineProvider {
    /// Belt and braces for the empty state only — see getTimeline.
    private static let retryInterval: TimeInterval = 6 * 60 * 60

    func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(date: Date(), streak: WidgetData.sample().streak)
    }

    func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> Void) {
        let now = Date()
        if let streak = WidgetData.loadAny()?.liveStreak {
            completion(StreakEntry(date: now, streak: streak))
        } else if context.isPreview {
            // The widget gallery should never show an empty card.
            completion(StreakEntry(date: now, streak: WidgetData.sample().streak))
        } else {
            completion(.empty(at: now))
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> Void) {
        let now = Date()

        // `loadAny`, not `load`: the streak is independent of whether the payload
        // still holds future prayer times.
        let data = WidgetData.loadAny()
        guard let streak = data?.liveStreak else {
            // Cheap insurance against a payload write whose WidgetCenter reload
            // didn't land — otherwise .never would strand this on the placeholder.
            completion(
                Timeline(
                    entries: [StreakEntry.empty(at: now)],
                    policy: .after(now.addingTimeInterval(StreakProvider.retryInterval))
                )
            )
            return
        }

        // The count itself can only change when the user opens the app (which
        // writes a fresh payload and reloads every timeline) — but the count's
        // VALIDITY expires on its own. liveStreak suppresses a number written 2+
        // calendar days ago, yet with a single .never entry that check would only
        // re-run on the next app open — i.e. exactly when the streak is fresh
        // again, never when it lapses. So schedule the blanking ourselves: a
        // second entry at the instant the number stops being trustworthy
        // (start-of-day of updatedAt + 2 days, the same boundary liveStreak
        // uses). A v1-era blob has no timestamp; liveStreak trusts it forever,
        // so no lapse entry is scheduled — consistent by design.
        var entries = [StreakEntry(date: now, streak: streak)]
        if let updatedAt = data?.updatedAt {
            let calendar = Calendar.current
            if let lapse = calendar.date(
                byAdding: .day, value: 2, to: calendar.startOfDay(for: updatedAt)
            ), lapse > now {
                entries.append(.empty(at: lapse))
            }
        }
        completion(Timeline(entries: entries, policy: .never))
    }
}

// MARK: - View

struct StreakWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: StreakEntry

    var body: some View {
        content.widgetURL(hiqmahStreakURL)
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

    @ViewBuilder
    private var circularView: some View {
        if let streak = entry.streak {
            VStack(spacing: 0) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 13, weight: .medium))
                Text("\(streak)")
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
            }
            .padding(2)
        } else {
            VStack(spacing: 0) {
                Image(systemName: "flame")
                    .font(.system(size: 13, weight: .medium))
                Text("—")
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
            }
            .padding(2)
        }
    }

    // MARK: Home screen — small

    @ViewBuilder
    private var smallView: some View {
        if let streak = entry.streak {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 10, weight: .semibold))
                    Text("STREAK")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(0.6)
                }
                .foregroundColor(.hiqmahGold.opacity(0.85))

                Spacer(minLength: 0)

                Text("\(streak)")
                    .font(.system(size: 44, weight: .semibold, design: .rounded))
                    .foregroundColor(.hiqmahGold)
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)

                // Invariant "day": reads as the compound "12 day streak", which is
                // correct for every count including 1.
                Text("day streak")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.hiqmahText)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        } else {
            VStack(alignment: .leading, spacing: 4) {
                Text("Streak")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.hiqmahText)
                Text("Open Hiqmah")
                    .font(.system(size: 13))
                    .foregroundColor(.hiqmahGold)
                Text("Visit each day and your streak appears here.")
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

struct StreakWidget: Widget {
    static let kind = "HiqmahStreak"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: StreakWidget.kind, provider: StreakProvider()) { entry in
            StreakWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Streak")
        .description("Consecutive days you've opened Hiqmah. Updates when you open the app.")
        .supportedFamilies([
            .systemSmall,
            .accessoryCircular
        ])
    }
}
