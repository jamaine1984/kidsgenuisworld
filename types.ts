// ============================================
// ROOM TYPES
// ============================================
export enum RoomType {
  HUB = 'HUB',
  MATH = 'MATH',
  READING = 'READING',
  PUZZLE = 'PUZZLE',
  MUSIC = 'MUSIC',
  ART = 'ART',
  // NEW ROOMS
  SCIENCE = 'SCIENCE',
  GEOGRAPHY = 'GEOGRAPHY',
  CODING = 'CODING',
  LANGUAGE = 'LANGUAGE',
  STORYBOOK = 'STORYBOOK'
}

export enum GradeLevel {
  PRE_K = "Pre-K",
  KINDERGARTEN = "Kindergarten",
  FIRST_GRADE = "1st Grade",
  SECOND_GRADE = "2nd Grade",
  THIRD_GRADE = "3rd Grade",
  FOURTH_GRADE = "4th Grade",
  FIFTH_GRADE = "5th Grade"
}

// ============================================
// ADAPTIVE LEARNING AI
// ============================================
export interface SkillMetrics {
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
  streakCurrent: number;
  streakBest: number;
  averageTimeMs: number;
  lastPracticed: number; // timestamp
  masteryLevel: number; // 0-100
}

export interface LearningProfile {
  // Math skills breakdown
  mathSkills: {
    addition: SkillMetrics;
    subtraction: SkillMetrics;
    multiplication: SkillMetrics;
    division: SkillMetrics;
  };
  // Reading skills
  readingSkills: {
    sightWords: SkillMetrics;
    phonics: SkillMetrics;
    vocabulary: SkillMetrics;
    comprehension: SkillMetrics;
  };
  // Other subjects
  scienceSkills: SkillMetrics;
  geographySkills: SkillMetrics;
  codingSkills: SkillMetrics;
  languageSkills: SkillMetrics;
  // Weak areas that need focus
  weakAreas: string[];
  // Recommended next activities
  recommendations: string[];
  // Adaptive difficulty modifier (-2 to +2)
  difficultyModifier: number;
}

// ============================================
// VIRTUAL PET & AVATAR
// ============================================
export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BUNNY = 'bunny',
  DRAGON = 'dragon',
  UNICORN = 'unicorn',
  ROBOT = 'robot'
}

export enum PetMood {
  HAPPY = 'happy',
  EXCITED = 'excited',
  SLEEPY = 'sleepy',
  HUNGRY = 'hungry',
  PROUD = 'proud'
}

export interface VirtualPet {
  type: PetType;
  name: string;
  level: number; // 1-50
  xp: number;
  mood: PetMood;
  hunger: number; // 0-100
  happiness: number; // 0-100
  lastFed: number; // timestamp
  accessories: string[]; // unlocked items
  unlockedColors: string[];
  currentColor: string;
}

export interface AvatarCustomization {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  outfit: string;
  accessories: string[];
  background: string;
}

// ============================================
// ACHIEVEMENTS & BADGES
// ============================================
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'math' | 'reading' | 'science' | 'geography' | 'coding' | 'language' | 'general';
  requirement: number;
  currentProgress: number;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Math achievements
  { id: 'math_starter', name: 'Math Explorer', description: 'Complete your first math problem', icon: '🔢', category: 'math', requirement: 1, currentProgress: 0, rarity: 'common' },
  { id: 'math_10', name: 'Number Ninja', description: 'Solve 10 math problems', icon: '🥷', category: 'math', requirement: 10, currentProgress: 0, rarity: 'common' },
  { id: 'math_50', name: 'Math Wizard', description: 'Solve 50 math problems', icon: '🧙', category: 'math', requirement: 50, currentProgress: 0, rarity: 'rare' },
  { id: 'math_100', name: 'Math Master', description: 'Solve 100 math problems', icon: '👑', category: 'math', requirement: 100, currentProgress: 0, rarity: 'epic' },
  { id: 'math_streak_5', name: 'On Fire!', description: 'Get 5 correct answers in a row', icon: '🔥', category: 'math', requirement: 5, currentProgress: 0, rarity: 'rare' },
  { id: 'math_streak_10', name: 'Unstoppable', description: 'Get 10 correct answers in a row', icon: '💫', category: 'math', requirement: 10, currentProgress: 0, rarity: 'epic' },

  // Reading achievements
  { id: 'read_starter', name: 'Bookworm Baby', description: 'Complete your first reading challenge', icon: '📖', category: 'reading', requirement: 1, currentProgress: 0, rarity: 'common' },
  { id: 'read_25', name: 'Word Collector', description: 'Learn 25 words', icon: '📚', category: 'reading', requirement: 25, currentProgress: 0, rarity: 'rare' },
  { id: 'read_100', name: 'Reading Champion', description: 'Learn 100 words', icon: '🏆', category: 'reading', requirement: 100, currentProgress: 0, rarity: 'epic' },

  // Science achievements
  { id: 'science_starter', name: 'Junior Scientist', description: 'Complete your first experiment', icon: '🔬', category: 'science', requirement: 1, currentProgress: 0, rarity: 'common' },
  { id: 'science_10', name: 'Lab Expert', description: 'Complete 10 experiments', icon: '🧪', category: 'science', requirement: 10, currentProgress: 0, rarity: 'rare' },

  // Geography achievements
  { id: 'geo_starter', name: 'World Explorer', description: 'Learn your first country', icon: '🌍', category: 'geography', requirement: 1, currentProgress: 0, rarity: 'common' },
  { id: 'geo_10', name: 'Globe Trotter', description: 'Learn 10 countries', icon: '✈️', category: 'geography', requirement: 10, currentProgress: 0, rarity: 'rare' },
  { id: 'geo_50', name: 'World Master', description: 'Learn 50 countries', icon: '🗺️', category: 'geography', requirement: 50, currentProgress: 0, rarity: 'epic' },

  // Coding achievements
  { id: 'code_starter', name: 'Code Cadet', description: 'Write your first program', icon: '💻', category: 'coding', requirement: 1, currentProgress: 0, rarity: 'common' },
  { id: 'code_10', name: 'Bug Squasher', description: 'Complete 10 coding challenges', icon: '🐛', category: 'coding', requirement: 10, currentProgress: 0, rarity: 'rare' },

  // Language achievements
  { id: 'lang_starter', name: 'Polyglot Pupil', description: 'Learn your first foreign word', icon: '🗣️', category: 'language', requirement: 1, currentProgress: 0, rarity: 'common' },
  { id: 'lang_25', name: 'Language Learner', description: 'Learn 25 foreign words', icon: '🌐', category: 'language', requirement: 25, currentProgress: 0, rarity: 'rare' },

  // Reading/Storybook achievements
  { id: 'story_starter', name: 'Story Explorer', description: 'Read your first story', icon: '📖', category: 'reading', requirement: 1, currentProgress: 0, rarity: 'common' },
  { id: 'story_10', name: 'Bookworm', description: 'Read 10 stories', icon: '📚', category: 'reading', requirement: 10, currentProgress: 0, rarity: 'rare' },
  { id: 'story_25', name: 'Story Master', description: 'Read 25 stories', icon: '🏆', category: 'reading', requirement: 25, currentProgress: 0, rarity: 'epic' },

  // General achievements
  { id: 'sticker_10', name: 'Sticker Starter', description: 'Collect 10 stickers', icon: '⭐', category: 'general', requirement: 10, currentProgress: 0, rarity: 'common' },
  { id: 'sticker_50', name: 'Sticker Collector', description: 'Collect 50 stickers', icon: '🌟', category: 'general', requirement: 50, currentProgress: 0, rarity: 'rare' },
  { id: 'sticker_100', name: 'Sticker Legend', description: 'Collect 100 stickers', icon: '💎', category: 'general', requirement: 100, currentProgress: 0, rarity: 'legendary' },
  { id: 'pet_level_10', name: 'Pet Parent', description: 'Raise your pet to level 10', icon: '🐾', category: 'general', requirement: 10, currentProgress: 0, rarity: 'rare' },
  { id: 'all_rooms', name: 'Explorer Extraordinaire', description: 'Visit all learning rooms', icon: '🗝️', category: 'general', requirement: 12, currentProgress: 0, rarity: 'epic' },
  { id: 'week_streak', name: 'Dedicated Learner', description: 'Learn 7 days in a row', icon: '📅', category: 'general', requirement: 7, currentProgress: 0, rarity: 'epic' },
];

// ============================================
// ACCESSIBILITY SETTINGS
// ============================================
export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  dyslexiaFont: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  speechRate: number; // 0.5 - 2.0
  autoReadQuestions: boolean;
  narrationStyle: 'gentle' | 'energetic' | 'phonics' | 'story';
}

export interface PrivacySettings {
  allowExternalVoice: boolean;
  allowGeneratedStoryCovers: boolean;
}

// ============================================
// PARENT DASHBOARD / ANALYTICS
// ============================================
export interface DailyStats {
  date: string; // YYYY-MM-DD
  timeSpentMinutes: number;
  problemsAttempted: number;
  problemsCorrect: number;
  roomsVisited: RoomType[];
  stickersEarned: number;
  achievementsUnlocked: string[];
}

export interface ParentAnalytics {
  totalTimeSpentMinutes: number;
  averageSessionMinutes: number;
  totalProblemsAttempted: number;
  totalProblemsCorrect: number;
  overallAccuracy: number;
  favoriteRoom: RoomType;
  strongestSubject: string;
  weakestSubject: string;
  currentStreak: number;
  longestStreak: number;
  dailyStats: DailyStats[];
  weeklyGoalMinutes: number;
  weeklyProgressMinutes: number;
  recommendedFocusAreas: string[];
  recentAchievements: Achievement[];
}

// ============================================
// SEASONAL CONTENT
// ============================================
export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter'
}

export enum Holiday {
  NONE = 'none',
  HALLOWEEN = 'halloween',
  THANKSGIVING = 'thanksgiving',
  CHRISTMAS = 'christmas',
  NEW_YEAR = 'new_year',
  VALENTINES = 'valentines',
  EASTER = 'easter',
  INDEPENDENCE_DAY = 'independence_day',
  BACK_TO_SCHOOL = 'back_to_school'
}

export interface SeasonalContent {
  currentSeason: Season;
  currentHoliday: Holiday;
  specialStickers: string[];
  specialChallenges: SpecialChallenge[];
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface SpecialChallenge {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  reward: string;
  progress: number;
  goal: number;
  completed: boolean;
}

// ============================================
// FAMILY / MULTIPLAYER
// ============================================
export interface FamilyMember {
  id: string;
  name: string;
  avatar: AvatarCustomization;
  isParent: boolean;
  progress: UserProgress;
  pet?: VirtualPet;
}

export interface FamilyChallenge {
  id: string;
  type: 'race' | 'team' | 'competition';
  participants: string[]; // member IDs
  subject: RoomType;
  goal: number;
  scores: { [memberId: string]: number };
  startTime: number;
  endTime?: number;
  winner?: string;
}

// ============================================
// ENHANCED USER PROGRESS
// ============================================
export interface UserProgress {
  childName?: string;
  // Basic info
  currentLevel: number; // 1 to 7
  currentGrade: GradeLevel;
  xp: number;
  totalXP: number;

  // Scores per subject
  mathScore: number;
  readingScore: number;
  musicScore: number;
  scienceScore: number;
  geographyScore: number;
  codingScore: number;
  languageScore: number;
  storybookScore: number;

  // Collections
  stickers: string[];
  achievements: string[]; // unlocked achievement IDs
  completedUnitIds: string[];
  unitPracticeCounts: { [unitId: string]: number };

  // Adaptive learning
  learningProfile: LearningProfile;

  // Virtual pet
  pet?: VirtualPet;

  // Avatar
  avatar: AvatarCustomization;

  // Time tracking
  totalPlayTimeMinutes: number;
  sessionsCompleted: number;
  currentStreak: number;
  lastPlayedDate: string;
  dailyStats: DailyStats[];
  gradeRoomVisits: { [level: string]: RoomType[] };
  weeklyGoalMinutes: number;
  dailySessionLimitMinutes: number;

  // Accessibility
  accessibility: AccessibilitySettings;

  // Privacy controls
  privacy: PrivacySettings;

  // Family
  familyId?: string;
  memberId?: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  grade: GradeLevel;
  createdAt: number;
  lastActiveAt: number;
}

// ============================================
// PROBLEM TYPES
// ============================================
export interface MathProblem {
  question: string;
  answer: number;
  options: number[];
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'money' | 'time' | 'fraction' | 'geometry';
  difficulty: number;
  explanation?: string;
  subject?: string;
  context?: 'equation' | 'word-problem' | 'money' | 'time' | 'fraction' | 'geometry';
}

export interface ReadingChallenge {
  word: string;
  emoji: string;
  options: string[];
  category: 'sightWords' | 'phonics' | 'vocabulary';
}

export interface ScienceExperiment {
  id: string;
  title: string;
  question: string;
  hypothesis: string[];
  correctAnswer: number;
  explanation: string;
  funFact: string;
  category: 'biology' | 'physics' | 'chemistry' | 'nature' | 'space';
  icon: string;
}

export interface GeographyQuestion {
  type: 'country' | 'capital' | 'flag' | 'continent' | 'landmark' | 'nature' | 'map' | 'climate';
  question: string;
  answer: string;
  options: string[];
  image?: string;
  funFact: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  blocks: CodeBlock[];
  solution: string[];
  hints: string[];
  difficulty: number;
}

export interface CodeBlock {
  id: string;
  type: 'move' | 'turn' | 'repeat' | 'if' | 'action';
  label: string;
  icon: string;
  color: string;
}

export interface LanguageWord {
  english: string;
  translation: string;
  pronunciation: string;
  language: 'spanish' | 'french' | 'mandarin' | 'japanese';
  category: 'greetings' | 'numbers' | 'colors' | 'animals' | 'food' | 'family' | 'school' | 'places' | 'phrases';
  gradeLevel?: number;
  audio?: string;
}

// ============================================
// STICKER COLLECTIONS
// ============================================
export const STICKER_COLLECTION = [
  // Animals
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆',
  '🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦗','🕷️','🦂','🐢','🐍','🦎','🦖',
  // Food
  '🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🍍','🥥','🥝','🍅','🥑','🍆','🥔','🥕','🌽',
  '🌶️','🥒','🥦','🍄','🥜','🌰','🍞','🥐','🥖','🥨','🥞','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭',
  // Space & Weather
  '☀️','🌝','🌚','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌙','🌍','🌎','🌏','💫','⭐','🌟','✨','⚡',
  // Activities
  '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🎱','🏓','🏸','🥅','🏒','🏑','🏏','⛳','🏹','🎣','🥊','🥋'
];

export const SEASONAL_STICKERS: { [key in Holiday]: string[] } = {
  [Holiday.NONE]: [],
  [Holiday.HALLOWEEN]: ['🎃','👻','🦇','🕷️','🕸️','💀','🧙','🧛','🐺','🌙','🦴','🍬','🍭','🧟','😈'],
  [Holiday.THANKSGIVING]: ['🦃','🍂','🍁','🌽','🥧','🍗','🌾','🥕','🎃','🍎','🥜','🌻','🏠','👨‍👩‍👧‍👦','🙏'],
  [Holiday.CHRISTMAS]: ['🎄','🎅','🤶','🎁','⛄','❄️','🦌','🔔','⭐','🎿','🛷','🧦','🍪','🥛','✨'],
  [Holiday.NEW_YEAR]: ['🎆','🎇','🎉','🎊','🥳','🍾','🥂','🎈','⏰','🌟','✨','🎵','🎶','💃','🕺'],
  [Holiday.VALENTINES]: ['❤️','💕','💖','💝','💘','💌','🌹','🍫','🧸','💑','😍','🥰','💏','💐','🎀'],
  [Holiday.EASTER]: ['🐰','🥚','🐣','🌷','🌸','🦋','🐝','🌼','🧺','🍬','🎀','🐑','🌈','☀️','🌱'],
  [Holiday.INDEPENDENCE_DAY]: ['🇺🇸','🎆','🎇','🗽','🦅','⭐','🔴','⚪','🔵','🎉','🌭','🍔','🎵','🥁','🎺'],
  [Holiday.BACK_TO_SCHOOL]: ['📚','✏️','🎒','📝','🍎','🔬','🎨','🎵','📐','📏','🖍️','✂️','📎','🔔','🏫']
};

// ============================================
// DEFAULT VALUES
// ============================================
export const DEFAULT_SKILL_METRICS: SkillMetrics = {
  totalAttempts: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  streakCurrent: 0,
  streakBest: 0,
  averageTimeMs: 0,
  lastPracticed: 0,
  masteryLevel: 0
};

export const DEFAULT_LEARNING_PROFILE: LearningProfile = {
  mathSkills: {
    addition: { ...DEFAULT_SKILL_METRICS },
    subtraction: { ...DEFAULT_SKILL_METRICS },
    multiplication: { ...DEFAULT_SKILL_METRICS },
    division: { ...DEFAULT_SKILL_METRICS }
  },
  readingSkills: {
    sightWords: { ...DEFAULT_SKILL_METRICS },
    phonics: { ...DEFAULT_SKILL_METRICS },
    vocabulary: { ...DEFAULT_SKILL_METRICS },
    comprehension: { ...DEFAULT_SKILL_METRICS }
  },
  scienceSkills: { ...DEFAULT_SKILL_METRICS },
  geographySkills: { ...DEFAULT_SKILL_METRICS },
  codingSkills: { ...DEFAULT_SKILL_METRICS },
  languageSkills: { ...DEFAULT_SKILL_METRICS },
  weakAreas: [],
  recommendations: [],
  difficultyModifier: 0
};

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  dyslexiaFont: false,
  reduceMotion: false,
  screenReaderOptimized: false,
  colorBlindMode: 'none',
  speechRate: 1.0,
  autoReadQuestions: false,
  narrationStyle: 'gentle'
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  allowExternalVoice: false,
  allowGeneratedStoryCovers: false,
};

export const DEFAULT_AVATAR: AvatarCustomization = {
  skinTone: '#FFD5B4',
  hairStyle: 'short',
  hairColor: '#4A3728',
  outfit: 'casual',
  accessories: [],
  background: 'blue'
};

export const createDefaultProgress = (childName = 'Learner'): UserProgress => ({
  childName,
  currentLevel: 1,
  currentGrade: GradeLevel.KINDERGARTEN,
  xp: 0,
  totalXP: 0,
  mathScore: 0,
  readingScore: 0,
  musicScore: 0,
  scienceScore: 0,
  geographyScore: 0,
  codingScore: 0,
  languageScore: 0,
  storybookScore: 0,
  stickers: [],
  achievements: [],
  completedUnitIds: [],
  unitPracticeCounts: {},
  learningProfile: { ...DEFAULT_LEARNING_PROFILE },
  avatar: { ...DEFAULT_AVATAR },
  totalPlayTimeMinutes: 0,
  sessionsCompleted: 0,
  currentStreak: 0,
  lastPlayedDate: '',
  dailyStats: [],
  gradeRoomVisits: {},
  weeklyGoalMinutes: 60,
  dailySessionLimitMinutes: 20,
  accessibility: { ...DEFAULT_ACCESSIBILITY },
  privacy: { ...DEFAULT_PRIVACY_SETTINGS }
});
