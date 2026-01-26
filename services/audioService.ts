let audioContext: AudioContext | null = null;

export const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  }
  return audioContext;
};

export const resumeAudioContext = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

// ============================================
// FREE TEXT-TO-SPEECH USING WEB SPEECH API
// Works offline, no API costs, kid-friendly
// ============================================

// Check if running in iOS native wrapper
const isIOSNative = (): boolean => {
  return typeof (window as any).webkit?.messageHandlers?.iosHandler !== 'undefined';
};

// Check if Web Speech API is available
const hasWebSpeech = (): boolean => {
  return 'speechSynthesis' in window;
};

// ============================================
// SPEECH QUEUE SYSTEM - Prevents overlapping
// ============================================
interface SpeechItem {
  text: string;
  rate: number;
  pitch: number;
  resolve: () => void;
}

let speechQueue: SpeechItem[] = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || speechQueue.length === 0) return;

  isProcessingQueue = true;

  while (speechQueue.length > 0) {
    const item = speechQueue.shift();
    if (!item) break;

    await speakAndWait(item.text, item.rate, item.pitch);
    item.resolve();

    // Small pause between sentences for natural flow
    await new Promise(r => setTimeout(r, 200));
  }

  isProcessingQueue = false;
};

// Internal function that actually speaks and waits for completion
const speakAndWait = (text: string, rate: number, pitch: number): Promise<void> => {
  return new Promise((resolve) => {
    if (isIOSNative()) {
      // Use iOS native AVSpeechSynthesizer
      (window as any).webkit.messageHandlers.iosHandler.postMessage({
        type: 'speak',
        text: text,
        rate: rate * 0.5,
        pitch: pitch
      });
      // Estimate duration based on text length
      const estimatedDuration = Math.max(1000, text.length * 80);
      setTimeout(resolve, estimatedDuration);
    } else if (hasWebSpeech()) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      // Try to use a friendly voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Google US English') ||
        (v.lang.startsWith('en') && !v.name.includes('Male'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } else {
      resolve();
    }
  });
};

// Queue speech - adds to queue and processes in order
export const queueSpeak = (text: string, rate: number = 0.9, pitch: number = 1.1): Promise<void> => {
  return new Promise((resolve) => {
    speechQueue.push({ text, rate, pitch, resolve });
    processQueue();
  });
};

// Speak immediately (clears queue) - use for urgent messages
export const speak = (text: string, rate: number = 0.9, pitch: number = 1.1): void => {
  // Clear the queue and stop current speech
  speechQueue = [];
  stopSpeaking();

  // Small delay to ensure previous speech is stopped
  setTimeout(() => {
    speakAndWait(text, rate, pitch);
  }, 50);
};

// Speak and wait for completion (blocking)
export const speakAsync = async (text: string, rate: number = 0.9, pitch: number = 1.1): Promise<void> => {
  speechQueue = [];
  stopSpeaking();
  await new Promise(r => setTimeout(r, 50));
  await speakAndWait(text, rate, pitch);
};

// Stop speaking and clear queue
export const stopSpeaking = (): void => {
  speechQueue = [];
  if (isIOSNative()) {
    (window as any).webkit.messageHandlers.iosHandler.postMessage({
      type: 'stopSpeaking'
    });
  } else if (hasWebSpeech()) {
    window.speechSynthesis.cancel();
  }
};

// Check if currently speaking
export const isSpeaking = (): boolean => {
  if (hasWebSpeech()) {
    return window.speechSynthesis.speaking || speechQueue.length > 0;
  }
  return speechQueue.length > 0;
};

export const playNote = (freq: number = 440, type: OscillatorType = 'sine', duration: number = 0.3) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  };

  export const playSuccess = () => {
    playNote(523.25, 'triangle', 0.1); // C5
    setTimeout(() => playNote(659.25, 'triangle', 0.1), 100); // E5
    setTimeout(() => playNote(783.99, 'triangle', 0.2), 200); // G5
  };

  export const playError = () => {
    playNote(200, 'sawtooth', 0.2);
    setTimeout(() => playNote(150, 'sawtooth', 0.2), 150);
  };

  export const playPop = () => {
    playNote(800, 'sine', 0.05);
  }

  // Wrong answer buzzer sound - kid-friendly but clear
  export const playWrongBuzzer = () => {
    playNote(150, 'square', 0.15);
    setTimeout(() => playNote(120, 'square', 0.2), 100);
  };

  // ============================================
  // ENCOURAGING VOICE FEEDBACK (QUEUED)
  // Random encouraging phrases for correct answers
  // ============================================
  const CORRECT_PHRASES = [
    "Great job!",
    "Awesome!",
    "You're so smart!",
    "Fantastic!",
    "Way to go!",
    "You got it!",
    "Perfect!",
    "Excellent!",
    "Amazing work!",
    "Super star!",
    "You're a genius!",
    "Brilliant!",
    "That's right!",
    "Wonderful!",
    "Keep it up!",
  ];

  const WRONG_PHRASES = [
    "Oops!",
    "Not quite.",
    "Good try!",
    "Almost!",
    "Don't worry.",
    "Nice try!",
  ];

  // Speak encouragement for correct answer - queued to not overlap
  export const speakCorrect = async (additionalInfo?: string): Promise<void> => {
    const phrase = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)];
    await speakAsync(phrase);
    if (additionalInfo) {
      await speakAsync(additionalInfo, 0.85, 1.0);
    }
  };

  // Speak explanation for wrong answer - queued to not overlap
  export const speakWrong = async (explanation: string): Promise<void> => {
    const phrase = WRONG_PHRASES[Math.floor(Math.random() * WRONG_PHRASES.length)];
    await speakAsync(phrase);
    await speakAsync(explanation, 0.85, 1.0);
  };

  // Read a question aloud
  export const speakQuestion = (question: string): void => {
    speak(question, 0.85, 1.1); // Slightly slower for clarity
  };

  // Welcome messages for rooms
  export const speakWelcome = (roomName: string): void => {
    const greetings = [
      `Welcome to the ${roomName}!`,
      `Let's learn in the ${roomName}!`,
      `Time for fun in the ${roomName}!`,
      `Ready to explore the ${roomName}?`,
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    speak(greeting);
  };

  // ============================================
  // PHONICS - Sound out individual sounds
  // ============================================
  export const speakPhonics = async (sound: string): Promise<void> => {
    // Speak phonetic sounds clearly and slowly
    await speakAsync(sound, 0.7, 1.0);
  };

  // Play raw PCM data from Gemini TTS
  export const playPCM = async (base64: string): Promise<void> => {
    try {
        await resumeAudioContext();
        const ctx = getAudioContext();

        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert int16 to float32
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < dataInt16.length; i++) {
             channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);

        return new Promise((resolve) => {
            source.onended = () => resolve();
        });
    } catch (e) {
        console.error("Error playing PCM", e);
    }
};
