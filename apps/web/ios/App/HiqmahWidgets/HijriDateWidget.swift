import SwiftUI
import WidgetKit

/**
 * Hijri Date — today's Islamic date.
 *
 * Needs no app-group data at all: the Umm al-Qurā calendar is a pure
 * calculation, so the widget is correct on a fresh install before the app has
 * ever run. `Calendar(identifier: .islamicUmmAlQura)` is the same converter the
 * web layer reaches for through `Intl.DateTimeFormat("en-u-ca-islamic-umalqura")`
 * (MobileHomeDashboard, islamic-events.ts, storage.ts), so the widget and the app
 * never disagree — including the shared convention that the date rolls over at
 * local midnight rather than at maghrib.
 *
 * Month spellings are hard-coded rather than taken from ICU: ICU's English
 * Umm al-Qurā names are "Rabiʻ I", "Jumada II", "Dhuʻl-Hijjah" etc., while the
 * app writes "Rabi al-Awwal", "Jumada al-Akhirah", "Dhul-Hijjah".
 */

/// See the note in NextPrayerWidget.swift: deeplinks.ts only routes URLs with a
/// Routed by WIDGET_ROUTES in src/lib/mobile/deeplinks.ts (`islamic-calendar`).
private let hiqmahIslamicCalendarURL = URL(string: "hiddenhiqmah://islamic-calendar")

// MARK: - Calendar

enum HijriCalendar {
    /// Month 1...12 → the app's English spellings.
    static let monthNames = [
        "Muharram",
        "Safar",
        "Rabi al-Awwal",
        "Rabi al-Thani",
        "Jumada al-Ula",
        "Jumada al-Akhirah",
        "Rajab",
        "Shaban",
        "Ramadan",
        "Shawwal",
        "Dhul-Qadah",
        "Dhul-Hijjah"
    ]

    /// Shortened forms for the circular family, where the full name never fits.
    static let shortMonthNames = [
        "Muharram",
        "Safar",
        "Rabi I",
        "Rabi II",
        "Jumada I",
        "Jumada II",
        "Rajab",
        "Shaban",
        "Ramadan",
        "Shawwal",
        "Dhul-Qadah",
        "Dhul-Hijjah"
    ]

    static var calendar: Calendar {
        var calendar = Calendar(identifier: .islamicUmmAlQura)
        calendar.timeZone = TimeZone.current
        calendar.locale = Locale(identifier: "en_US_POSIX")
        return calendar
    }

    static func components(for date: Date) -> (day: Int, month: Int, year: Int) {
        let parts = calendar.dateComponents([.year, .month, .day], from: date)
        return (parts.day ?? 1, parts.month ?? 1, parts.year ?? 1447)
    }

    static func monthName(_ month: Int) -> String {
        guard month >= 1, month <= monthNames.count else { return "" }
        return monthNames[month - 1]
    }

    static func shortMonthName(_ month: Int) -> String {
        guard month >= 1, month <= shortMonthNames.count else { return "" }
        return shortMonthNames[month - 1]
    }
}

// MARK: - Entry

struct HijriEntry: TimelineEntry {
    let date: Date
    let day: Int
    let month: Int
    let year: Int

    /// "12 Muharram"
    var dayAndMonth: String { "\(day) \(HijriCalendar.monthName(month))" }
    /// "12 Muharram 1448"
    var fullDate: String { "\(day) \(HijriCalendar.monthName(month)) \(year)" }

    static func make(for date: Date) -> HijriEntry {
        let parts = HijriCalendar.components(for: date)
        return HijriEntry(date: date, day: parts.day, month: parts.month, year: parts.year)
    }
}

// MARK: - Provider

struct HijriProvider: TimelineProvider {
    /// Days of entries to build ahead. Each entry starts at a local midnight, so
    /// the date flips exactly on the day boundary without any polling.
    private static let daysAhead = 8

    func placeholder(in context: Context) -> HijriEntry {
        HijriEntry.make(for: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (HijriEntry) -> Void) {
        completion(HijriEntry.make(for: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HijriEntry>) -> Void) {
        let now = Date()
        let calendar = Calendar.current

        var entries: [HijriEntry] = [HijriEntry.make(for: now)]
        var cursor = calendar.startOfDay(for: now)

        for _ in 0..<HijriProvider.daysAhead {
            guard let nextDay = calendar.date(byAdding: .day, value: 1, to: cursor) else { break }
            // Re-normalise: a DST transition can move the added day off midnight.
            cursor = calendar.startOfDay(for: nextDay)
            entries.append(HijriEntry.make(for: cursor))
        }

        let lastDate = entries[entries.count - 1].date
        completion(Timeline(entries: entries, policy: .after(lastDate.addingTimeInterval(60))))
    }
}

// MARK: - View

struct HijriDateWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    @Environment(\.colorScheme) private var colorScheme
    let entry: HijriEntry

    private var theme: HiqmahTheme { HiqmahTheme.of(colorScheme) }

    /// Hijri months run 29 or 30 days and the payload carries no length, so the
    /// ring is drawn against 30. It is a sense of where the month stands, not a
    /// precise gauge, and it never overstates: a 29-day month simply ends a
    /// thirtieth short of full.
    private var monthFraction: Double {
        min(1, max(0.02, Double(entry.day) / 30.0))
    }

    var body: some View {
        content.widgetURL(URL(string: "hiddenhiqmah://islamic-calendar"))
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryInline:
            Text(entry.fullDate).hiqmahClearWidgetBackground()
        case .accessoryCircular:
            circularView.hiqmahAccessoryBackground()
        default:
            smallView.hiqmahCard(theme)
        }
    }

    // MARK: Home screen — small

    @ViewBuilder
    private var smallView: some View {
        VStack(spacing: 0) {
            HiqmahHeader(title: "Hijri", theme: theme) { size, colour in
                CrescentGlyph(size: size, color: colour)
            }

            Spacer(minLength: 2)

            ZStack {
                GaugeRing(fraction: monthFraction, theme: theme)
                Text("\(entry.day)")
                    .font(.system(size: 34, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .foregroundColor(theme.goldDisplay)
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)
            }
            .aspectRatio(1, contentMode: .fit)

            Spacer(minLength: 2)

            Text("\(HijriCalendar.monthName(entry.month)) \(entry.year)")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(theme.title)
                .lineLimit(1)
                .minimumScaleFactor(0.6)

            Text(entry.date.formatted(.dateTime.day().month(.wide).year()))
                .font(.system(size: 9.5))
                .foregroundColor(theme.muted)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
    }

    // MARK: Accessory — circular

    @ViewBuilder
    private var circularView: some View {
        ZStack {
            GaugeRing(fraction: monthFraction, theme: theme, mono: true)
            VStack(spacing: 0) {
                CrescentGlyph(size: 11, color: .white)
                Text("\(entry.day)")
                    .font(.system(size: 15, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
            }
        }
        .padding(1)
    }
}

// MARK: - Widget

struct HijriDateWidget: Widget {
    static let kind = "HiqmahHijriDate"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: HijriDateWidget.kind, provider: HijriProvider()) { entry in
            HijriDateWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Hijri Date")
        .description("Today's date in the Islamic calendar.")
        .supportedFamilies([
            .systemSmall,
            .accessoryInline,
            .accessoryCircular
        ])
    }
}
