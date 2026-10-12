import UIKit
import Capacitor

/**
 * The window scene's delegate — REQUIRED as of the iOS 27 SDK.
 *
 * An app linked against iOS 27 that has not adopted the UIScene lifecycle is
 * killed on launch: UIKit's _UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption
 * traps (EXC_BREAKPOINT) while the first scene is being created, before any of
 * our code runs. Builds 21 and 22 were the first archived with Xcode 27, and App
 * Review rejected build 22 for exactly that crash (Guideline 2.1(a), iOS 27.2,
 * 2026-10-07). Build 20 and earlier were linked against iOS 26.5 and launched
 * fine, which is why nothing in our own code had changed.
 *
 * Under the scene lifecycle UIKit routes the window and every inbound link here
 * instead of to AppDelegate:
 *
 *   - The window comes from Main.storyboard via UISceneStoryboardFile in
 *     Info.plist's UIApplicationSceneManifest; UIKit creates it and sets
 *     `window` itself, so there is nothing to build by hand.
 *   - Links (the widgets' hiddenhiqmah:// taps) arrive in willConnectTo on a
 *     cold start and in openURLContexts while running. AppDelegate's
 *     application(_:open:options:) is no longer called at all.
 *
 * Both are forwarded to Capacitor's ApplicationDelegateProxy, exactly as
 * AppDelegate used to: it records `lastURL`, which the App plugin's
 * getLaunchUrl returns, and posts the notification behind appUrlOpen.
 * lib/mobile/deeplinks.ts reads both and de-duplicates them, so it works
 * whether a cold-start link arrives through one or both.
 *
 * App state needs nothing here. UIKit still posts the UIApplication
 * didBecomeActive / willResignActive / background / foreground notifications
 * under scenes, and those are what the App plugin's appStateChange listens to.
 *
 * Expect ONE "⚡️  JS Eval error" in Debug logs at launch, which the old
 * lifecycle did not produce. Under scenes UIKit posts willEnterForeground as the
 * first scene comes up, and CapacitorBridge answers every willEnterForeground by
 * firing a document "resume" event — into a page that has not loaded yet. Nothing
 * can be listening at that point, and the app listens for appStateChange, not
 * resume, so it is harmless (A/B'd against the old lifecycle on iOS 26.5).
 */
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // Cold start from a link: the URL or activity that launched the app.
        for context in connectionOptions.urlContexts {
            forward(context)
        }
        for activity in connectionOptions.userActivities {
            forward(activity)
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            forward(context)
        }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        forward(userActivity)
    }

    /// Re-expresses the scene's URL options as the app-delegate options
    /// dictionary the proxy (and the App plugin's appUrlOpen payload) expects.
    private func forward(_ context: UIOpenURLContext) {
        var options: [UIApplication.OpenURLOptionsKey: Any] = [
            .openInPlace: context.options.openInPlace
        ]
        if let source = context.options.sourceApplication {
            options[.sourceApplication] = source
        }
        if let annotation = context.options.annotation {
            options[.annotation] = annotation
        }
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: context.url, options: options)
    }

    private func forward(_ activity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: activity) { _ in }
    }
}
