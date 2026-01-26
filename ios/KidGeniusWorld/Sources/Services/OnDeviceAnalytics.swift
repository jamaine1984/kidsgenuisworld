import Foundation

/// Privacy-safe, on-device only analytics
/// NO network calls, NO identifiers, NO tracking
/// Just local counters for understanding usage patterns
class OnDeviceAnalytics {
    static let shared = OnDeviceAnalytics()

    private let defaults = UserDefaults.standard
    private let analyticsKey = "kidGeniusWorld.localAnalytics"

    private var eventCounts: [String: Int] = [:]
    private var sessionEvents: [(event: String, timestamp: Date)] = []

    private init() {
        loadFromDisk()
    }

    // MARK: - Event Logging

    /// Log an event locally (no network)
    func logEvent(_ eventName: String, params: [String: Any]? = nil) {
        // Increment counter
        eventCounts[eventName, default: 0] += 1

        // Track in session (limited to prevent memory issues)
        if sessionEvents.count < 1000 {
            sessionEvents.append((event: eventName, timestamp: Date()))
        }

        // Persist periodically
        saveToDisk()

        #if DEBUG
        print("[Analytics] \(eventName) - count: \(eventCounts[eventName] ?? 0)")
        #endif
    }

    // MARK: - Aggregated Data (for parent dashboard only)

    /// Get total plays per room (aggregated, no PII)
    func getRoomPlayCounts() -> [String: Int] {
        return eventCounts.filter { $0.key.hasPrefix("room_") }
    }

    /// Get total correct answers
    func getTotalCorrectAnswers() -> Int {
        return eventCounts["answer_correct"] ?? 0
    }

    /// Get total stickers earned
    func getTotalStickersEarned() -> Int {
        return eventCounts["sticker_earned"] ?? 0
    }

    /// Get session count
    func getSessionCount() -> Int {
        return eventCounts["session_start"] ?? 0
    }

    // MARK: - Persistence

    private func saveToDisk() {
        if let encoded = try? JSONEncoder().encode(eventCounts) {
            defaults.set(encoded, forKey: analyticsKey)
        }
    }

    private func loadFromDisk() {
        if let data = defaults.data(forKey: analyticsKey),
           let decoded = try? JSONDecoder().decode([String: Int].self, from: data) {
            eventCounts = decoded
        }
    }

    /// Clear all analytics (for privacy reset)
    func clearAll() {
        eventCounts = [:]
        sessionEvents = []
        defaults.removeObject(forKey: analyticsKey)
    }

    // MARK: - Standard Events

    enum StandardEvent {
        static let sessionStart = "session_start"
        static let roomEnter = "room_enter"
        static let roomMath = "room_math"
        static let roomReading = "room_reading"
        static let roomArt = "room_art"
        static let roomMusic = "room_music"
        static let roomPuzzle = "room_puzzle"
        static let roomPlayground = "room_playground"
        static let answerCorrect = "answer_correct"
        static let answerIncorrect = "answer_incorrect"
        static let stickerEarned = "sticker_earned"
        static let levelUp = "level_up"
        static let gradeUp = "grade_up"
    }
}
