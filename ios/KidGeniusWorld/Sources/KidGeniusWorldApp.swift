import SwiftUI

@main
struct KidGeniusWorldApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .preferredColorScheme(.light) // Kids apps work better with consistent light mode
        }
    }
}

/// Global app state for managing parent gate and navigation
class AppState: ObservableObject {
    @Published var isParentGateUnlocked: Bool = false
    @Published var parentGateUnlockTime: Date? = nil

    // Parent gate auto-locks after 5 minutes of inactivity
    private let parentGateDuration: TimeInterval = 300

    func unlockParentGate() {
        isParentGateUnlocked = true
        parentGateUnlockTime = Date()

        // Auto-lock after duration
        DispatchQueue.main.asyncAfter(deadline: .now() + parentGateDuration) { [weak self] in
            self?.lockParentGate()
        }
    }

    func lockParentGate() {
        isParentGateUnlocked = false
        parentGateUnlockTime = nil
    }

    func checkParentGateStatus() -> Bool {
        guard let unlockTime = parentGateUnlockTime else { return false }
        let elapsed = Date().timeIntervalSince(unlockTime)
        if elapsed > parentGateDuration {
            lockParentGate()
            return false
        }
        return isParentGateUnlocked
    }
}
