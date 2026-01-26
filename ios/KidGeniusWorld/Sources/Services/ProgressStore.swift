import Foundation

/// Local-only progress storage using UserDefaults
/// No network calls, no identifiers, fully privacy-safe
class ProgressStore {
    private let defaults = UserDefaults.standard
    private let progressKey = "kidGeniusWorld.gameProgress"
    private let settingsKey = "kidGeniusWorld.settings"

    // MARK: - Progress

    /// Save game progress locally
    func save(_ data: Any) {
        if let jsonData = try? JSONSerialization.data(withJSONObject: data),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            defaults.set(jsonString, forKey: progressKey)
        }
    }

    /// Load saved game progress
    func load() -> String? {
        return defaults.string(forKey: progressKey)
    }

    /// Clear all progress
    func clearProgress() {
        defaults.removeObject(forKey: progressKey)
    }

    // MARK: - Settings

    struct GameSettings: Codable {
        var musicEnabled: Bool = true
        var soundEffectsEnabled: Bool = true
        var speechEnabled: Bool = true
        var speechRate: Float = 0.5
    }

    func saveSettings(_ settings: GameSettings) {
        if let encoded = try? JSONEncoder().encode(settings) {
            defaults.set(encoded, forKey: settingsKey)
        }
    }

    func loadSettings() -> GameSettings {
        if let data = defaults.data(forKey: settingsKey),
           let settings = try? JSONDecoder().decode(GameSettings.self, from: data) {
            return settings
        }
        return GameSettings()
    }

    // MARK: - Full Reset

    /// Clear all app data (for parent use)
    func resetAllData() {
        defaults.removeObject(forKey: progressKey)
        defaults.removeObject(forKey: settingsKey)
    }
}
