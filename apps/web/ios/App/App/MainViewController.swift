import UIKit
import Capacitor

/**
 * The app's bridge view controller (wired up in Main.storyboard).
 *
 * Capacitor auto-registers plugins that ship as CocoaPods/SPM packages; a plugin
 * written directly inside the app target has to be handed to the bridge by hand,
 * which is what `capacitorDidLoad()` is for. Registering here (rather than in
 * AppDelegate) guarantees the bridge exists and that the plugin is available
 * before the web layer's first JS call.
 */
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(WidgetBridge())
        bridge?.registerPluginInstance(HeadingBridge())
    }
}
