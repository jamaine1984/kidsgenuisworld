import AVFoundation

/// Native text-to-speech service using AVSpeechSynthesizer
/// No network calls, fully offline, privacy-safe
class SpeechService: NSObject, AVSpeechSynthesizerDelegate {
    private let synthesizer = AVSpeechSynthesizer()
    private var isConfigured = false

    override init() {
        super.init()
        synthesizer.delegate = self
        configureAudioSession()
    }

    private func configureAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
            try session.setActive(true)
            isConfigured = true
        } catch {
            print("Failed to configure audio session: \(error)")
        }
    }

    /// Speak text with kid-friendly voice settings
    /// - Parameters:
    ///   - text: Text to speak
    ///   - rate: Speech rate (0.0-1.0, default 0.5 is normal)
    ///   - pitch: Voice pitch multiplier (0.5-2.0, default 1.0)
    func speak(_ text: String, rate: Float = 0.5, pitch: Float = 1.1) {
        // Stop any current speech
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }

        let utterance = AVSpeechUtterance(string: text)

        // Use a clear, friendly voice
        // Prefer Samantha (US English) or similar high-quality voice
        if let voice = AVSpeechSynthesisVoice(identifier: "com.apple.ttsbundle.Samantha-compact") {
            utterance.voice = voice
        } else if let voice = AVSpeechSynthesisVoice(language: "en-US") {
            utterance.voice = voice
        }

        // Kid-friendly settings
        utterance.rate = min(max(rate, AVSpeechUtteranceMinimumSpeechRate), AVSpeechUtteranceMaximumSpeechRate)
        utterance.pitchMultiplier = min(max(pitch, 0.5), 2.0)
        utterance.volume = 1.0

        // Add slight pauses for better comprehension
        utterance.preUtteranceDelay = 0.1
        utterance.postUtteranceDelay = 0.2

        synthesizer.speak(utterance)
    }

    /// Stop speaking immediately
    func stop() {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
    }

    /// Check if currently speaking
    var isSpeaking: Bool {
        return synthesizer.isSpeaking
    }

    // MARK: - AVSpeechSynthesizerDelegate

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        // Could notify JS that speech finished
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        // Speech was cancelled
    }
}
