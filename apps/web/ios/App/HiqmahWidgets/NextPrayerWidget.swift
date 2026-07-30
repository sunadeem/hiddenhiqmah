import SwiftUI
import WidgetKit

/**
 * Next Prayer — the hero widget.
 *
 * The timeline holds one entry per prayer boundary for the next ~48 hours, so
 * "next prayer" flips to the following prayer at the exact second the current
 * one comes in — no polling, no per-minute entries. The countdown inside an
 * entry is drawn with `Text(timerInterval:)`, which the system ticks for us, so
 * a single entry stays correct for its whole span.
 *
 * With no payload in the app group (fresh install, location never granted, or
 * the cached days ran out) every family falls back to "Open Hiqmah".
 */

/// Tapping any family opens the app.
///
/// NOTE: routed by the WIDGET_ROUTES allow-list in src/lib/mobile/deeplinks.ts
/// — `prayer-times` must stay listed there, or the tap silently degrades to
/// "just open the app". Deliberately no `code` query param, so it can never be
/// mistaken for a circle invite.
private let hiqmahPrayerTimesURL = URL(string: "hiddenhiqmah://prayer-times")

// MARK: - Entry

struct NextPrayerEntry: TimelineEntry {
    let date: Date
    /// The prayer this entry is counting down to. nil = no usable data.
    let instant: PrayerInstant?
    /// The prayer AFTER `instant` — the rectangular family's third line. Comes
    /// straight from the same payload, so after Isha it is naturally tomorrow's
    /// Fajr. nil only at the very end of the cached window.
    let following: PrayerInstant?
    let city: String?
    /// The five prayers of the local day containing `date` (medium family).
    let schedule: [PrayerInstant]

    init(
        date: Date,
        instant: PrayerInstant?,
        following: PrayerInstant? = nil,
        city: String?,
        schedule: [PrayerInstant]
    ) {
        self.date = date
        self.instant = instant
        self.following = following
        self.city = city
        self.schedule = schedule
    }

    static func empty(at date: Date, city: String? = nil) -> NextPrayerEntry {
        NextPrayerEntry(date: date, instant: nil, following: nil, city: city, schedule: [])
    }
}

// MARK: - Provider

struct NextPrayerProvider: TimelineProvider {
    /// How far ahead entries are built. Two days of boundaries is ~10 entries.
    private static let horizon: TimeInterval = 48 * 60 * 60
    /// How soon to retry when there is nothing to show.
    private static let retryInterval: TimeInterval = 60 * 60

    func placeholder(in context: Context) -> NextPrayerEntry {
        NextPrayerProvider.sampleEntry(at: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (NextPrayerEntry) -> Void) {
        let now = Date()
        if let data = WidgetData.load(), let next = data.nextPrayer(after: now) {
            completion(
                NextPrayerEntry(
                    date: now,
                    instant: next,
                    following: data.nextPrayer(after: next.date),
                    city: data.city,
                    schedule: data.schedule(for: now)
                )
            )
        } else if context.isPreview {
            // The widget gallery should never show an empty card.
            completion(NextPrayerProvider.sampleEntry(at: now))
        } else {
            completion(.empty(at: now))
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NextPrayerEntry>) -> Void) {
        let now = Date()

        guard let data = WidgetData.load() else {
            let timeline = Timeline(
                entries: [NextPrayerEntry.empty(at: now)],
                policy: .after(now.addingTimeInterval(NextPrayerProvider.retryInterval))
            )
            completion(timeline)
            return
        }

        // One entry now, then one at each upcoming prayer instant: at the instant
        // itself `nextPrayer(after:)` already returns the FOLLOWING prayer, which
        // is exactly the flip we want.
        let horizonDate = now.addingTimeInterval(NextPrayerProvider.horizon)
        var boundaries: [Date] = [now]
        for instant in data.instants where instant.date > now && instant.date <= horizonDate {
            boundaries.append(instant.date)
        }
        // Also flip at each LOCAL MIDNIGHT: without this, the entry stamped at
        // Isha stays active until Fajr, so the medium family's five-times row
        // keeps showing YESTERDAY's schedule (fully dimmed) all night. A
        // midnight boundary re-resolves "today" while the headline countdown to
        // Fajr carries on unchanged. Costs at most 2 extra entries per horizon.
        let calendar = Calendar.current
        for dayOffset in 1...2 {
            if let day = calendar.date(byAdding: .day, value: dayOffset, to: now) {
                let midnight = calendar.startOfDay(for: day)
                if midnight > now && midnight <= horizonDate {
                    boundaries.append(midnight)
                }
            }
        }
        boundaries.sort()

        var entries: [NextPrayerEntry] = []
        var ranOut = false

        for boundary in boundaries {
            // Two prayers can share a timestamp at extreme latitudes; never emit
            // two entries for the same instant.
            if let last = entries.last, last.date == boundary { continue }

            guard let next = data.nextPrayer(after: boundary) else {
                entries.append(.empty(at: boundary, city: data.city))
                ranOut = true
                break
            }
            entries.append(
                NextPrayerEntry(
                    date: boundary,
                    instant: next,
                    // Resolved per entry, so the "then …" line advances in lockstep
                    // with the headline at every boundary.
                    following: data.nextPrayer(after: next.date),
                    city: data.city,
                    schedule: data.schedule(for: boundary)
                )
            )
        }

        if entries.isEmpty {
            entries = [.empty(at: now, city: data.city)]
            ranOut = true
        }

        let lastEntryDate = entries[entries.count - 1].date
        let refresh: Date = ranOut
            ? max(now.addingTimeInterval(NextPrayerProvider.retryInterval), lastEntryDate.addingTimeInterval(60))
            : lastEntryDate.addingTimeInterval(60)

        completion(Timeline(entries: entries, policy: .after(refresh)))
    }

    /// Realistic-looking data for the gallery / previews only.
    static func sampleEntry(at date: Date) -> NextPrayerEntry {
        let data = WidgetData.sample(now: date)
        let next = data.nextPrayer(after: date)
            ?? PrayerInstant(prayer: .fajr, date: date.addingTimeInterval(60 * 47))
        return NextPrayerEntry(
            date: date,
            instant: next,
            following: data.nextPrayer(after: next.date)
                // The sample covers one day only, so previewing late in the evening
                // leaves nothing after Isha. Synthesise a plausible Fajr so the
                // gallery still shows the full three-line rectangular layout.
                ?? PrayerInstant(prayer: .fajr, date: next.date.addingTimeInterval(7 * 60 * 60)),
            city: data.city,
            schedule: data.schedule(for: date)
        )
    }
}

// MARK: - View

struct NextPrayerWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: NextPrayerEntry

    var body: some View {
        content.widgetURL(hiqmahPrayerTimesURL)
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
            mediumView.hiqmahWidgetBackground()
        default:
            smallView.hiqmahWidgetBackground()
        }
    }

    // MARK: Accessory — inline

    @ViewBuilder
    private var inlineView: some View {
        if let instant = entry.instant {
            Text("\(instant.prayer.displayName) \(HiqmahFormat.clock(instant.date))")
        } else {
            Text("Open Hiqmah")
        }
    }

    // MARK: Accessory — circular

    @ViewBuilder
    private var circularView: some View {
        if let instant = entry.instant {
            VStack(spacing: 0) {
                Image(systemName: instant.prayer.symbolName)
                    .font(.system(size: 13, weight: .medium))
                Text(HiqmahFormat.compactClock(instant.date))
                    .font(.system(size: 12, weight: .semibold))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .padding(2)
        } else {
            VStack(spacing: 0) {
                Image(systemName: "moon.stars")
                    .font(.system(size: 13, weight: .medium))
                Text("—")
                    .font(.system(size: 12, weight: .semibold))
            }
            .padding(2)
        }
    }

    // MARK: Accessory — rectangular

    /// EXACTLY THREE LINES. accessoryRectangular is a fixed-height slot that clips
    /// anything past ~3 lines of these font sizes, and it clips silently — so every
    /// Text here is lineLimit(1) and the name/time pair shares one line rather than
    /// risking a wrap that would push the countdown out of view. Adding a fourth
    /// line means taking one away.
    @ViewBuilder
    private var rectangularView: some View {
        if let instant = entry.instant {
            VStack(alignment: .leading, spacing: 1) {
                // 1 — what's next, and when.
                HStack(spacing: 4) {
                    Image(systemName: instant.prayer.symbolName)
                        .font(.caption2)
                    Text("\(instant.prayer.displayName) · \(HiqmahFormat.clock(instant.date))")
                        .font(.headline)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
                // 2 — the live countdown, ticked by the system inside this entry.
                Text(
                    timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                    countsDown: true
                )
                .font(.caption.monospacedDigit())
                .lineLimit(1)
                // 3 — the one after. Omitted (not blanked) when the cached window
                // ends here, so the widget shrinks to two lines instead of lying.
                if let following = entry.following {
                    Text("then \(following.prayer.displayName) \(HiqmahFormat.clock(following.date))")
                        .font(.caption2)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        } else {
            VStack(alignment: .leading, spacing: 1) {
                Text("Prayer times")
                    .font(.headline)
                Text("Open Hiqmah")
                    .font(.caption)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
    }

    // MARK: Home screen — small

    @ViewBuilder
    private var smallView: some View {
        if let instant = entry.instant {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Image(systemName: instant.prayer.symbolName)
                        .font(.system(size: 10, weight: .semibold))
                    Text("NEXT PRAYER")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(0.6)
                }
                .foregroundColor(.hiqmahMuted)

                Text(instant.prayer.displayName)
                    .font(.system(size: 26, weight: .semibold, design: .rounded))
                    .foregroundColor(.hiqmahGold)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                Text(HiqmahFormat.clock(instant.date))
                    .font(.system(size: 17, weight: .medium))
                    .foregroundColor(.hiqmahText)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Text(
                    timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                    countsDown: true
                )
                .font(.system(size: 14, weight: .medium).monospacedDigit())
                .foregroundColor(.hiqmahGold.opacity(0.85))
                .lineLimit(1)
                .minimumScaleFactor(0.7)

                Spacer(minLength: 0)

                if let city = entry.city {
                    Text(city)
                        .font(.system(size: 11))
                        .foregroundColor(.hiqmahMuted)
                        .lineLimit(1)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        } else {
            emptyHomeView
        }
    }

    // MARK: Home screen — medium

    @ViewBuilder
    private var mediumView: some View {
        if let instant = entry.instant {
            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("NEXT PRAYER")
                            .font(.system(size: 10, weight: .semibold))
                            .tracking(0.6)
                            .foregroundColor(.hiqmahMuted)

                        HStack(spacing: 6) {
                            Image(systemName: instant.prayer.symbolName)
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(.hiqmahGold)
                            Text(instant.prayer.displayName)
                                .font(.system(size: 24, weight: .semibold, design: .rounded))
                                .foregroundColor(.hiqmahGold)
                                .lineLimit(1)
                                .minimumScaleFactor(0.7)
                        }

                        Text(HiqmahFormat.clock(instant.date))
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.hiqmahText)
                            .lineLimit(1)
                    }

                    Spacer(minLength: 8)

                    VStack(alignment: .trailing, spacing: 2) {
                        Text(
                            timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                            countsDown: true
                        )
                        .font(.system(size: 20, weight: .semibold).monospacedDigit())
                        .foregroundColor(.hiqmahText)
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)

                        Text("remaining")
                            .font(.system(size: 10))
                            .foregroundColor(.hiqmahMuted)

                        if let city = entry.city {
                            Text(city)
                                .font(.system(size: 11))
                                .foregroundColor(.hiqmahMuted)
                                .lineLimit(1)
                        }
                    }
                }

                if !entry.schedule.isEmpty {
                    Rectangle()
                        .fill(Color.hiqmahMuted.opacity(0.25))
                        .frame(height: 1)

                    HStack(spacing: 0) {
                        ForEach(entry.schedule) { item in
                            VStack(spacing: 2) {
                                Text(item.prayer.displayName)
                                    .font(.system(size: 10, weight: .medium))
                                    .lineLimit(1)
                                    .minimumScaleFactor(0.7)
                                Text(HiqmahFormat.compactClock(item.date))
                                    .font(.system(size: 13, weight: .semibold))
                                    .lineLimit(1)
                                    .minimumScaleFactor(0.7)
                            }
                            .foregroundColor(color(for: item, next: instant))
                            .opacity(item.date <= entry.date ? 0.45 : 1)
                            .frame(maxWidth: .infinity)
                        }
                    }
                }

                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        } else {
            emptyHomeView
        }
    }

    // MARK: Shared

    private var emptyHomeView: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Prayer times")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.hiqmahText)
            Text("Open Hiqmah")
                .font(.system(size: 13))
                .foregroundColor(.hiqmahGold)
            Text("Set your location once and times appear here.")
                .font(.system(size: 11))
                .foregroundColor(.hiqmahMuted)
                .lineLimit(3)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }

    /// Gold for the prayer being counted down to, plain text for the rest.
    private func color(for item: PrayerInstant, next: PrayerInstant) -> Color {
        item.prayer == next.prayer && item.date == next.date ? .hiqmahGold : .hiqmahText
    }
}

// MARK: - Widget

struct NextPrayerWidget: Widget {
    static let kind = "HiqmahNextPrayer"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: NextPrayerWidget.kind, provider: NextPrayerProvider()) { entry in
            NextPrayerWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Next Prayer")
        .description("The next prayer, its time, and a live countdown.")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .accessoryInline,
            .accessoryCircular,
            .accessoryRectangular
        ])
    }
}
