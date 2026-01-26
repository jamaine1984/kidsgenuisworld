import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var showParentGate = false
    @State private var pendingAction: ParentGateAction? = nil

    var body: some View {
        ZStack {
            // Main game WebView
            GameWebView(
                onExternalLinkRequested: { url in
                    pendingAction = .openURL(url)
                    showParentGate = true
                },
                onPurchaseRequested: {
                    pendingAction = .purchase
                    showParentGate = true
                },
                onSettingsRequested: {
                    pendingAction = .settings
                    showParentGate = true
                }
            )
            .edgesIgnoringSafeArea(.all)

            // Parent Gate overlay
            if showParentGate {
                ParentGateView(
                    isPresented: $showParentGate,
                    onSuccess: {
                        appState.unlockParentGate()
                        handlePendingAction()
                    }
                )
            }
        }
        .statusBar(hidden: true)
    }

    private func handlePendingAction() {
        guard let action = pendingAction else { return }

        switch action {
        case .openURL(let url):
            // Open in Safari (external)
            UIApplication.shared.open(url)
        case .purchase:
            // Handle IAP flow
            NotificationCenter.default.post(name: .showPurchaseScreen, object: nil)
        case .settings:
            // Show settings
            NotificationCenter.default.post(name: .showSettings, object: nil)
        }

        pendingAction = nil
    }
}

enum ParentGateAction {
    case openURL(URL)
    case purchase
    case settings
}

extension Notification.Name {
    static let showPurchaseScreen = Notification.Name("showPurchaseScreen")
    static let showSettings = Notification.Name("showSettings")
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
