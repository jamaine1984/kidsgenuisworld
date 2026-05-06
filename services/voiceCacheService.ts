import { STORIES } from '../components/StoryBook';
import { READING_PASSAGES, VOCABULARY as READING_VOCABULARY } from '../components/ReadingRoom';
import { VOCABULARY as LANGUAGE_VOCABULARY, LANGUAGE_INFO } from '../components/LanguageRoom';
import { SCIENCE_EXPERIMENTS } from '../components/ScienceRoom';
import { GEOGRAPHY_QUESTIONS } from '../components/GeographyRoom';
import { CHALLENGES } from '../components/CodingRoom';
import { AccessibilitySettings } from '../types';
import { getStaticVoiceManifestUrl } from './mediaApi';

interface VoiceWarmupResult {
  requested: number;
  hits: number;
  misses: number;
  errors: number;
  skipped?: number;
  errorSamples?: Array<{
    status?: number;
    message: string;
  }>;
}

const ROOM_INTROS = [
  'Welcome to the Math Lab. Count and picture the groups.',
  'Welcome to the Math Lab. Look for the operation clue.',
  'Welcome to the Math Lab. Use fact families and patterns.',
  'Welcome to the Math Lab. Estimate first, then solve carefully.',
  'Welcome to the Reading Library. Look at the word, then find the picture that fits.',
  'Welcome to the Reading Library. Say each letter as you build the word.',
  'Welcome to the Reading Library. Listen for the ending sound.',
  'Welcome to the Reading Library. Tap each sound block slowly, then blend them.',
  'Welcome to the Science Lab. Look at the choices and think about the real world.',
  'Welcome to the Science Lab. Use what you have seen in nature, school, or home.',
  'Welcome to the Science Lab. Read carefully, then use the clue in the experiment title.',
  'Welcome to Geography Globe. Use pictures, flags, and what feels familiar.',
  'Welcome to Geography Globe. Look for clues in landmarks, capitals, and continents.',
  'Welcome to Geography Globe. Pause, compare the options, and eliminate what does not fit.',
  'Welcome to the Language Lab. Listen, say it, then notice the pronunciation pattern.',
  'Welcome to the Language Lab. Think of the sound first, then choose the translation.',
  'Welcome to Coding Corner. Build the path one step at a time.',
  'Welcome to Coding Corner. Watch the robot direction before you add a turn.',
  'Welcome to Coding Corner. Plan the path first, then use repeat blocks to stay efficient.',
];

const GENERAL_FEEDBACK = [
  'Welcome back to Kid Genius World!',
  'Welcome to Kid Genius World!',
  'Learning is an adventure!',
  'Great! You are in Pre-K. Let us learn together!',
  'Great! You are in Kindergarten. Let us learn together!',
  'Great! You are in 1st Grade. Let us learn together!',
  'Great! You are in 2nd Grade. Let us learn together!',
  'Great! You are in 3rd Grade. Let us learn together!',
  'Great! You are in 4th Grade. Let us learn together!',
  'Great! You are in 5th Grade. Let us learn together!',
  'Congratulations! You are now in Pre-K!',
  'Congratulations! You are now in Kindergarten!',
  'Congratulations! You are now in 1st Grade!',
  'Congratulations! You are now in 2nd Grade!',
  'Congratulations! You are now in 3rd Grade!',
  'Congratulations! You are now in 4th Grade!',
  'Congratulations! You are now in 5th Grade!',
  'Great job!',
  'Awesome!',
  'You are so smart!',
  'Fantastic!',
  'Way to go!',
  'You got it!',
  'Perfect!',
  'Excellent!',
  'Amazing work!',
  'Super star!',
  'You are a genius!',
  'Brilliant!',
  'That is right!',
  'Wonderful!',
  'Keep it up!',
  'Oops!',
  'Not quite.',
  'Good try!',
  'Almost!',
  'Do not worry.',
  'Nice try!',
];

const normalizeSpeechText = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();

const sanitizeGeographyPrompt = (text: string) =>
  text.replace(/🇺🇸|🇬🇧|🇯🇵|🇫🇷|🇧🇷|🇨🇦|🇦🇺|🇮🇹|🇲🇽|🇨🇳|🇮🇳|🇪🇸|🇷🇺|🇰🇷|🇿🇦|🌍|☀️|🌊/g, '').trim();

const uniqueTexts = (texts: string[]) =>
  Array.from(new Set(texts.map(normalizeSpeechText).filter(Boolean)));

export const getVoiceCacheTexts = (level: number): string[] => {
  const clampedLevel = Math.min(Math.max(level, 1), 7);

  const readingTexts = READING_VOCABULARY
    .filter(word => word.level <= clampedLevel)
    .flatMap(word => [
      word.word,
      word.sentence,
      `Find the ${word.word}`,
      `Spell the word ${word.word}`,
      `What rhymes with ${word.word}?`,
      `Let's sound out the word ${word.word}`,
      `The word is ${word.word}. ${word.sentence}`,
      `Say the word ${word.word}!`,
      `You spelled ${word.word}! ${word.sentence}`,
      `${word.rhyme} does not rhyme with ${word.word}. The answer is ${word.rhyme}!`,
      ...word.segments.map(segment => `The sound is... ${segment}`),
    ]);

  const readingPassageTexts = READING_PASSAGES
    .filter(passage => passage.level <= clampedLevel)
    .flatMap(passage => [
      passage.title,
      passage.passage,
      passage.question,
      `Teacher says: Read the passage first. Listen for the important details.`,
      `Great reading. The text evidence is: ${passage.answer}.`,
      `Look back at the passage. The best answer is ${passage.answer}.`,
    ]);

  const scienceTexts = SCIENCE_EXPERIMENTS
    .filter(experiment => experiment.gradeLevel <= clampedLevel)
    .flatMap(experiment => [
      experiment.title,
      experiment.question,
      experiment.explanation,
      experiment.funFact,
      `${experiment.explanation} ${experiment.funFact}`,
    ]);

  const geographyTexts = GEOGRAPHY_QUESTIONS
    .filter(question => question.gradeLevel <= clampedLevel)
    .flatMap(question => [
      sanitizeGeographyPrompt(question.question),
      question.funFact,
      `The answer is ${question.answer}. ${question.funFact}`,
    ]);

  const languageTexts = Object.entries(LANGUAGE_VOCABULARY).flatMap(([language, words]) =>
    words.flatMap(word => [
      `How do you say ${word.english} in ${LANGUAGE_INFO[language as keyof typeof LANGUAGE_INFO].name}?`,
      `In ${LANGUAGE_INFO[language as keyof typeof LANGUAGE_INFO].name}, ${word.english} is ${word.translation}.`,
      `${word.translation}. It sounds like: ${word.pronunciation}`,
      `${word.translation} means ${word.english}! Great job learning ${LANGUAGE_INFO[language as keyof typeof LANGUAGE_INFO].name}!`,
      `The answer is ${word.translation}. It sounds like ${word.pronunciation}.`,
    ])
  );

  const codingTexts = CHALLENGES
    .filter(challenge => challenge.gradeLevel <= clampedLevel)
    .flatMap(challenge => [challenge.story, challenge.hint]);

  const storyTexts = STORIES
    .filter(story => story.gradeLevel <= clampedLevel)
    .flatMap(story => [
      `${story.title}. By ${story.author}.`,
      ...story.pages,
      ...(story.moral ? [`The moral of the story is: ${story.moral}`, story.moral] : []),
    ]);

  return uniqueTexts([
    ...ROOM_INTROS,
    ...GENERAL_FEEDBACK,
    ...readingTexts,
    ...readingPassageTexts,
    ...scienceTexts,
    ...geographyTexts,
    ...languageTexts,
    ...codingTexts,
    ...storyTexts,
  ]);
};

export const warmVoiceCache = async (
  level: number,
  accessibility: AccessibilitySettings
): Promise<VoiceWarmupResult> => {
  const texts = getVoiceCacheTexts(level);
  if (typeof window !== 'undefined' && window.localStorage.getItem('kidGeniusAllowExternalVoice') !== 'true') {
    return {
      requested: texts.length,
      hits: 0,
      misses: 0,
      errors: 0,
    };
  }

  void accessibility;
  const response = await fetch(getStaticVoiceManifestUrl(), { cache: 'force-cache' });
  if (!response.ok) {
    return {
      requested: texts.length,
      hits: 0,
      misses: texts.length,
      errors: 0,
      skipped: texts.length,
    };
  }

  const manifest = await response.json() as { files?: string[] };
  const hits = Array.isArray(manifest.files) ? manifest.files.length : 0;
  return {
    requested: texts.length,
    hits,
    misses: Math.max(0, texts.length - hits),
    errors: 0,
    skipped: 0,
  };
};
