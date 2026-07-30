import SwiftUI
import WidgetKit

/// Entry point for the widget extension. Every widget the bundle lists shows up
/// in the widget gallery under "Hiqmah".
@main
struct HiqmahWidgetsBundle: WidgetBundle {
    var body: some Widget {
        NextPrayerWidget()
        HijriDateWidget()
        QiblaWidget()
        StreakWidget()
    }
}
