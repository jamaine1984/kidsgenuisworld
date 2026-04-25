let audioContext: AudioContext | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
let currentNarrationContext = 'general';
let speechRunId = 0;

type NarrationStyle = 'gentle' | 'energetic' | 'phonics' | 'story';

interface SpeechPreferences {
  speechRate: number;
  narrationStyle: NarrationStyle;
  ageGroup: 'early' | 'elementary' | 'older';
}

let speechPreferences: SpeechPreferences = {
  speechRate: 1.0,
  narrationStyle: 'gentle',
  ageGroup: 'elementary',
};

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
// TEXT-TO-SPEECH
// ElevenLabs via local proxy with local server-side caching.
// Browser speech is intentionally not used for lessons so kid-facing voices stay human.
// ============================================

// Check if running in iOS native wrapper
const isIOSNative = (): boolean => {
  return typeof (window as any).webkit?.messageHandlers?.iosHandler !== 'undefined';
};

// Check if Web Speech API is available
const hasWebSpeech = (): boolean => {
  return 'speechSynthesis' in window;
};

const allowsExternalVoice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem('kidGeniusAllowExternalVoice') === 'true';
};

const hasElevenLabsProxy = (): boolean => {
  return allowsExternalVoice();
};

const buildVoiceSettings = () => {
  const styleMap: Record<NarrationStyle, { stability: number; similarity_boost: number; style: number; speed: number; }> = {
    gentle: { stability: 0.72, similarity_boost: 0.82, style: 0.2, speed: 0.94 },
    energetic: { stability: 0.45, similarity_boost: 0.88, style: 0.65, speed: 1.02 },
    phonics: { stability: 0.86, similarity_boost: 0.8, style: 0.05, speed: 0.82 },
    story: { stability: 0.58, similarity_boost: 0.9, style: 0.78, speed: 0.96 },
  };

  const ageRateMap = {
    early: 0.88,
    elementary: 0.96,
    older: 1.0,
  };

  const selected = styleMap[speechPreferences.narrationStyle];
  const effectiveSpeed = Math.max(0.7, Math.min(1.15, selected.speed * speechPreferences.speechRate * ageRateMap[speechPreferences.ageGroup]));

  return {
    stability: selected.stability,
    similarity_boost: selected.similarity_boost,
    style: selected.style,
    use_speaker_boost: true,
    speed: effectiveSpeed,
  };
};

export const setSpeechPreferences = (preferences: Partial<SpeechPreferences>) => {
  speechPreferences = {
    ...speechPreferences,
    ...preferences,
  };
};

export const setNarrationContext = (context: string) => {
  currentNarrationContext = context;
};

const playElevenLabsSpeech = async (text: string): Promise<void> => {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      context: currentNarrationContext,
      voice_settings: buildVoiceSettings(),
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS proxy failed with status ${response.status}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  stopActiveSpeechPlayback();
  currentAudio = audio;
  currentAudioUrl = audioUrl;

  return new Promise((resolve) => {
    const cleanup = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      if (currentAudioUrl === audioUrl) {
        URL.revokeObjectURL(audioUrl);
        currentAudioUrl = null;
      }
      resolve();
    };

    audio.onended = cleanup;
    audio.onerror = cleanup;
    void audio.play().catch(() => cleanup());
  });
};

// ============================================
// SPEECH QUEUE SYSTEM - Prevents overlapping
// ============================================
interface SpeechItem {
  text: string;
  rate: number;
  pitch: number;
  resolve: () => void;
  style?: NarrationStyle;
}

let speechQueue: SpeechItem[] = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || speechQueue.length === 0) return;

  isProcessingQueue = true;
  const queueRunId = ++speechRunId;

  while (speechQueue.length > 0 && queueRunId === speechRunId) {
    const item = speechQueue.shift();
    if (!item) break;

    const previousStyle = speechPreferences.narrationStyle;
    if (item.style) {
      setSpeechPreferences({ narrationStyle: item.style });
    }

    await speakAndWait(item.text, item.rate, item.pitch, queueRunId);

    if (item.style) {
      setSpeechPreferences({ narrationStyle: previousStyle });
    }
    item.resolve();

    // Small pause between sentences for natural flow
    await new Promise(r => setTimeout(r, 200));
  }

  isProcessingQueue = false;
};

const stopActiveSpeechPlayback = (): void => {
  if (isIOSNative()) {
    (window as any).webkit.messageHandlers.iosHandler.postMessage({
      type: 'stopSpeaking'
    });
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }

  if (hasWebSpeech()) {
    window.speechSynthesis.cancel();
  }
};

// Internal function that actually speaks and waits for completion
const speakAndWait = (text: string, rate: number, pitch: number, runId: number): Promise<void> => {
  return new Promise((resolve) => {
    if (runId !== speechRunId) {
      resolve();
      return;
    }

    stopActiveSpeechPlayback();

    if (hasElevenLabsProxy()) {
      playElevenLabsSpeech(text)
        .then(resolve)
        .catch(resolve);
    } else {
      resolve();
    }
  });
};

// Queue speech - adds to queue and processes in order
export const queueSpeak = (text: string, rate: number = 0.9, pitch: number = 1.1, style?: NarrationStyle): Promise<void> => {
  return new Promise((resolve) => {
    speechQueue.push({ text, rate, pitch, resolve, style });
    processQueue();
  });
};

// Speak immediately (clears queue) - use for urgent messages
export const speak = (text: string, rate: number = 0.9, pitch: number = 1.1): void => {
  // Clear the queue and stop current speech
  speechQueue = [];
  const runId = ++speechRunId;
  stopActiveSpeechPlayback();

  // Small delay to ensure previous speech is stopped
  setTimeout(() => {
    void speakAndWait(text, rate, pitch, runId);
  }, 50);
};

// Speak and wait for completion (blocking)
export const speakAsync = async (text: string, rate: number = 0.9, pitch: number = 1.1): Promise<void> => {
  speechQueue = [];
  const runId = ++speechRunId;
  stopActiveSpeechPlayback();
  await new Promise(r => setTimeout(r, 50));
  await speakAndWait(text, rate, pitch, runId);
};

// Stop speaking and clear queue
export const stopSpeaking = (): void => {
  speechQueue = [];
  speechRunId += 1;
  isProcessingQueue = false;
  stopActiveSpeechPlayback();
};

// Check if currently speaking
export const isSpeaking = (): boolean => {
  if (currentAudio && !currentAudio.paused) {
    return true;
  }
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
    const questionStyle = speechPreferences.ageGroup === 'early' ? 'phonics' : speechPreferences.narrationStyle;
    void queueSpeak(question, 0.85, 1.1, questionStyle);
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

