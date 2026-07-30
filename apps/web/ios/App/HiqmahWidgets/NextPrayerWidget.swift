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
    /// The prayer immediately BEFORE `instant`, resolved from the full multi-day
    /// instant list. The progress rails measure the prior→next interval, and
    /// looking the prior up in the single-day `schedule` loses it across local
    /// midnight — an Isha→Fajr rail would visibly refill to 100% at 00:00.
    let priorDate: Date?

    init(
        date: Date,
        instant: PrayerInstant?,
        following: PrayerInstant? = nil,
        city: String?,
        schedule: [PrayerInstant],
        priorDate: Date? = nil
    ) {
        self.date = date
        self.instant = instant
        self.following = following
        self.city = city
        self.schedule = schedule
        self.priorDate = priorDate
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
                    schedule: data.schedule(for: now),
                    priorDate: data.instants.last(where: { $0.date <= now })?.date
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
                    schedule: data.schedule(for: boundary),
                    priorDate: data.instants.last(where: { $0.date <= boundary })?.date
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
    @Environment(\.colorScheme) private var colorScheme
    let entry: NextPrayerEntry

    private var theme: HiqmahTheme { HiqmahTheme.of(colorScheme) }

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
            mediumView.hiqmahCard(theme)
        default:
            smallView.hiqmahCard(theme)
        }
    }

    /// The interval the countdown is crossing, for the progress rail. Clamped so
    /// the range can never be empty or inverted — ProgressView traps on both.
    /// `priorDate` first: the single-day schedule loses the prior prayer across
    /// local midnight and the rail would refill to 100% at 00:00.
    private func interval(to instant: PrayerInstant) -> ClosedRange<Date> {
        let prior = entry.priorDate
            ?? entry.schedule
                .filter { $0.date < instant.date }
                .max(by: { $0.date < $1.date })?.date
            ?? entry.date
        let end = max(instant.date, prior.addingTimeInterval(60))
        return min(prior, end.addingTimeInterval(-60))...end
    }

    @ViewBuilder
    private func rail(to instant: PrayerInstant, tint: Color) -> some View {
        ProgressView(
            timerInterval: interval(to: instant),
            countsDown: true,
            label: { EmptyView() },
            currentValueLabel: { EmptyView() }
        )
        .progressViewStyle(.linear)
        .tint(tint)
        .frame(height: 4)
    }

    // MARK: Accessory — inline

    @ViewBuilder
    private var inlineView: some View {
        if let instant = entry.instant {
            Text("\(instant.prayer.displayName) \(HiqmahFormat.clock(instant.date))")
        } else {
            Text("Hiqmah — Open app")
        }
    }

    // MARK: Accessory — circular

    @ViewBuilder
    private var circularView: some View {
        if let instant = entry.instant {
            // Ring and label as separate layers (see CountdownWidget for why),
            // and the prayer's NAME rather than its icon — at a glance "ʿAṣr
            // 5:08" answers the question; a sun glyph doesn't.
            ZStack {
                ProgressView(
                    timerInterval: interval(to: instant),
                    countsDown: true,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .progressViewStyle(.circular)

                VStack(spacing: 0) {
                    Text(instant.prayer.displayName)
                        .font(.system(size: 8, weight: .semibold))
                        .opacity(0.85)
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                        .frame(maxWidth: 38)
                    // compactClock, not clock: "10:11 PM" is 57pt at this size and
                    // would scale to ~7pt — smaller than the caption above it.
                    // "10:11" fits at full size.
                    Text(HiqmahFormat.compactClock(instant.date))
                        .font(.system(size: 11.5, weight: .bold, design: .rounded))
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.4)
                        .frame(maxWidth: 36)
                }
            }
        } else {
            VStack(spacing: 1) {
                Image(systemName: "moon.stars")
                    .font(.system(size: 13, weight: .medium))
                Text("—").font(.system(size: 11, weight: .semibold))
            }
        }
    }

    // MARK: Accessory — rectangular

    @ViewBuilder
    private var rectangularView: some View {
        if let instant = entry.instant {
            HStack(spacing: 9) {
                HiqmahBadge(radius: 13, theme: theme, mono: true) { size, colour in
                    Image(systemName: instant.prayer.symbolName)
                        .font(.system(size: size * 0.58, weight: .semibold))
                        .foregroundColor(colour)
                }
                VStack(alignment: .leading, spacing: 1) {
                    HStack(spacing: 6) {
                        Text(instant.prayer.displayName)
                            .font(.system(size: 13, weight: .bold))
                            .lineLimit(1)
                        Spacer(minLength: 0)
                        Text(HiqmahFormat.clock(instant.date))
                            .font(.system(size: 13, weight: .medium))
                            .monospacedDigit()
                            .foregroundColor(.white.opacity(0.85))
                            .lineLimit(1)
                    }
                    Text(
                        timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                        countsDown: true
                    )
                    .font(.system(size: 19, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    // Pin to leading: the timer lays out at its widest possible
                    // string and centres the current one inside that box, so as
                    // the glyph count drops ("2:58:38" → "59:59") the digits
                    // would otherwise drift right of the rows above and below.
                    .multilineTextAlignment(.leading)
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)
                    if let following = entry.following {
                        Text("then \(following.prayer.displayName) · \(HiqmahFormat.clock(following.date))")
                            .font(.system(size: 9.5))
                            .foregroundColor(.white.opacity(0.65))
                            .lineLimit(1)
                            .minimumScaleFactor(0.8)
                    }
                }
            }
        } else {
            Text("Hiqmah — Open app")
        }
    }

    // MARK: Home screen — small

    /// The stacked face: name, time, then countdown, centred — with the prayer's
    /// own icon riding in the badge, where it changes through the day rather than
    /// sitting inert beside the name.
    @ViewBuilder
    private var smallView: some View {
        if let instant = entry.instant {
            VStack(spacing: 0) {
                HiqmahHeader(title: "Next Prayer", theme: theme) { size, colour in
                    Image(systemName: instant.prayer.symbolName)
                        .font(.system(size: size * 0.55, weight: .semibold))
                        .foregroundColor(colour)
                }

                Spacer(minLength: 0)

                Text(instant.prayer.displayName)
                    .font(.system(size: 25, weight: .bold, design: .rounded))
                    .foregroundColor(theme.goldDisplay)
                    .frame(maxWidth: .infinity)
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)

                Text(HiqmahFormat.clock(instant.date))
                    .font(.system(size: 17, weight: .medium))
                    .monospacedDigit()
                    .foregroundColor(theme.title)
                    .frame(maxWidth: .infinity)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                Text(
                    timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                    countsDown: true
                )
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .monospacedDigit()
                .foregroundColor(theme.goldText)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
                .lineLimit(1)
                .minimumScaleFactor(0.5)

                Spacer(minLength: 0)

                rail(to: instant, tint: theme.goldDisplay)
            }
        } else {
            emptyHomeView
        }
    }

    // MARK: Home screen — medium

    @ViewBuilder
    private var mediumView: some View {
        if let instant = entry.instant {
            HStack(spacing: 14) {
                VStack(alignment: .leading, spacing: 2) {
                    HiqmahHeader(title: "Next Prayer", theme: theme, radius: 11, fontSize: 12) { size, colour in
                        Image(systemName: instant.prayer.symbolName)
                            .font(.system(size: size * 0.55, weight: .semibold))
                            .foregroundColor(colour)
                    }

                    Spacer(minLength: 2)

                    Text(instant.prayer.displayName)
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(theme.goldDisplay)
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)

                    Text(HiqmahFormat.clock(instant.date))
                        .font(.system(size: 16, weight: .medium))
                        .monospacedDigit()
                        .foregroundColor(theme.title)
                        .lineLimit(1)

                    Text(
                        timerInterval: HiqmahFormat.countdownRange(from: entry.date, to: instant.date),
                        countsDown: true
                    )
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .foregroundColor(theme.goldText)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)

                    Spacer(minLength: 2)

                    rail(to: instant, tint: theme.goldDisplay)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                Rectangle()
                    .fill(theme.hair)
                    .frame(width: 1)

                VStack(spacing: 3) {
                    ForEach(entry.schedule, id: \.date) { item in
                        let isNext = item.date == instant.date
                        HStack(spacing: 6) {
                            Text(item.prayer.displayName)
                                .font(.system(size: isNext ? 13 : 12, weight: isNext ? .bold : .medium))
                                .lineLimit(1)
                            Spacer(minLength: 4)
                            Text(HiqmahFormat.clock(item.date))
                                .font(.system(size: isNext ? 13 : 12, weight: isNext ? .bold : .medium))
                                .monospacedDigit()
                                .lineLimit(1)
                        }
                        .foregroundColor(isNext ? theme.goldText : theme.muted)
                    }
                }
                .frame(maxWidth: .infinity)
            }
        } else {
            emptyHomeView
        }
    }

    // MARK: Empty

    @ViewBuilder
    private var emptyHomeView: some View {
        VStack(spacing: 0) {
            HiqmahHeader(title: "Next Prayer", theme: theme) { size, colour in
                Image(systemName: "moon.stars.fill")
                    .font(.system(size: size * 0.55, weight: .semibold))
                    .foregroundColor(colour)
            }
            Spacer(minLength: 0)
            Text("Open Hiqmah")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(theme.goldText)
            Text("Set your location once and prayer times appear here.")
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
