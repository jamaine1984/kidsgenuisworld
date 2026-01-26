import SwiftUI

/// Child-resistant parent gate that requires solving a math problem
/// This meets Apple's requirements for Kids Category apps
struct ParentGateView: View {
    @Binding var isPresented: Bool
    var onSuccess: () -> Void

    @State private var challenge: MathChallenge = MathChallenge.generate()
    @State private var selectedAnswer: Int? = nil
    @State private var attempts: Int = 0
    @State private var showError: Bool = false
    @State private var isLocked: Bool = false
    @State private var lockTimeRemaining: Int = 0

    private let maxAttempts = 3
    private let lockDuration = 30 // seconds

    var body: some View {
        ZStack {
            // Dimmed background
            Color.black.opacity(0.7)
                .edgesIgnoringSafeArea(.all)
                .onTapGesture {
                    // Don't dismiss on background tap
                }

            // Gate card
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.blue)

                    Text("Parent Verification")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Please solve this problem to continue")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }

                if isLocked {
                    // Locked state
                    VStack(spacing: 16) {
                        Image(systemName: "clock.fill")
                            .font(.system(size: 36))
                            .foregroundColor(.orange)

                        Text("Too many attempts")
                            .font(.headline)

                        Text("Please wait \(lockTimeRemaining) seconds")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 20)
                } else {
                    // Math challenge
                    VStack(spacing: 20) {
                        // Question
                        Text(challenge.question)
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(12)

                        // Answer options (shuffled)
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                            ForEach(challenge.options, id: \.self) { option in
                                Button(action: {
                                    checkAnswer(option)
                                }) {
                                    Text("\(option)")
                                        .font(.system(size: 24, weight: .semibold, design: .rounded))
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 16)
                                        .background(
                                            selectedAnswer == option
                                                ? (option == challenge.answer ? Color.green : Color.red)
                                                : Color.blue
                                        )
                                        .foregroundColor(.white)
                                        .cornerRadius(12)
                                }
                                .disabled(selectedAnswer != nil)
                            }
                        }

                        if showError {
                            Text("Incorrect. Try again. (\(maxAttempts - attempts) attempts left)")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }
                }

                // Cancel button
                Button(action: {
                    isPresented = false
                }) {
                    Text("Cancel")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 12)
                }
            }
            .padding(32)
            .background(Color(.systemBackground))
            .cornerRadius(24)
            .shadow(radius: 20)
            .padding(24)
        }
    }

    private func checkAnswer(_ answer: Int) {
        selectedAnswer = answer

        if answer == challenge.answer {
            // Correct! Unlock parent gate
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                onSuccess()
                isPresented = false
            }
        } else {
            // Wrong answer
            attempts += 1
            showError = true

            if attempts >= maxAttempts {
                // Lock out for duration
                startLockout()
            } else {
                // Reset for new attempt after delay
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    challenge = MathChallenge.generate()
                    selectedAnswer = nil
                }
            }
        }
    }

    private func startLockout() {
        isLocked = true
        lockTimeRemaining = lockDuration

        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { timer in
            if lockTimeRemaining > 0 {
                lockTimeRemaining -= 1
            } else {
                timer.invalidate()
                isLocked = false
                attempts = 0
                showError = false
                challenge = MathChallenge.generate()
                selectedAnswer = nil
            }
        }
    }
}

/// Generates age-appropriate math challenges that kids wouldn't easily solve
struct MathChallenge {
    let question: String
    let answer: Int
    let options: [Int]

    /// Generate a multiplication or division problem
    static func generate() -> MathChallenge {
        let operations: [(String, (Int, Int) -> Int, String)] = [
            ("×", { $0 * $1 }, "times"),
            ("÷", { $0 / $1 }, "divided by"),
            ("+", { $0 + $1 }, "plus"),
            ("−", { $0 - $1 }, "minus")
        ]

        let opIndex = Int.random(in: 0..<operations.count)
        let op = operations[opIndex]

        var num1: Int
        var num2: Int
        var answer: Int

        switch opIndex {
        case 0: // Multiplication
            num1 = Int.random(in: 6...12)
            num2 = Int.random(in: 6...12)
            answer = num1 * num2

        case 1: // Division (ensure clean division)
            num2 = Int.random(in: 3...9)
            answer = Int.random(in: 4...12)
            num1 = num2 * answer

        case 2: // Addition (larger numbers)
            num1 = Int.random(in: 25...75)
            num2 = Int.random(in: 25...75)
            answer = num1 + num2

        case 3: // Subtraction (larger numbers)
            num1 = Int.random(in: 50...100)
            num2 = Int.random(in: 10...num1 - 10)
            answer = num1 - num2

        default:
            num1 = 7
            num2 = 8
            answer = 56
        }

        let question = "\(num1) \(op.0) \(num2) = ?"

        // Generate wrong answers that are plausible
        var options = Set<Int>()
        options.insert(answer)

        while options.count < 4 {
            let offset = Int.random(in: 1...10) * (Bool.random() ? 1 : -1)
            let wrong = answer + offset
            if wrong > 0 && wrong != answer {
                options.insert(wrong)
            }
        }

        return MathChallenge(
            question: question,
            answer: answer,
            options: Array(options).shuffled()
        )
    }
}

#Preview {
    ParentGateView(isPresented: .constant(true), onSuccess: {})
}
