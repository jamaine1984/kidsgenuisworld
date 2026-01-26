import {
  LearningProfile,
  SkillMetrics,
  DEFAULT_SKILL_METRICS,
  UserProgress
} from '../types';

// ============================================
// ADAPTIVE LEARNING AI ENGINE
// ============================================

/**
 * Updates skill metrics after an answer attempt
 */
export const updateSkillMetrics = (
  metrics: SkillMetrics,
  correct: boolean,
  timeMs: number
): SkillMetrics => {
  const newMetrics = { ...metrics };

  newMetrics.totalAttempts++;
  newMetrics.lastPracticed = Date.now();

  if (correct) {
    newMetrics.correctAnswers++;
    newMetrics.streakCurrent++;
    newMetrics.streakBest = Math.max(newMetrics.streakBest, newMetrics.streakCurrent);
  } else {
    newMetrics.wrongAnswers++;
    newMetrics.streakCurrent = 0;
  }

  // Update average time (rolling average)
  if (newMetrics.averageTimeMs === 0) {
    newMetrics.averageTimeMs = timeMs;
  } else {
    newMetrics.averageTimeMs = Math.round(
      (newMetrics.averageTimeMs * 0.8) + (timeMs * 0.2)
    );
  }

  // Calculate mastery level (0-100)
  newMetrics.masteryLevel = calculateMastery(newMetrics);

  return newMetrics;
};

/**
 * Calculates mastery level based on accuracy, streaks, and recency
 */
const calculateMastery = (metrics: SkillMetrics): number => {
  if (metrics.totalAttempts === 0) return 0;

  // Accuracy component (40% weight)
  const accuracy = metrics.correctAnswers / metrics.totalAttempts;
  const accuracyScore = accuracy * 40;

  // Streak component (30% weight)
  const streakScore = Math.min(metrics.streakBest / 10, 1) * 30;

  // Recency component (20% weight) - practiced recently?
  const daysSinceLastPractice = (Date.now() - metrics.lastPracticed) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, (7 - daysSinceLastPractice) / 7) * 20;

  // Volume component (10% weight) - enough practice?
  const volumeScore = Math.min(metrics.totalAttempts / 20, 1) * 10;

  return Math.round(accuracyScore + streakScore + recencyScore + volumeScore);
};

/**
 * Analyzes learning profile and identifies weak areas
 */
export const analyzeWeakAreas = (profile: LearningProfile): string[] => {
  const weakAreas: string[] = [];
  const threshold = 50; // Below this mastery is considered weak

  // Check math skills
  if (profile.mathSkills.addition.masteryLevel < threshold &&
      profile.mathSkills.addition.totalAttempts > 5) {
    weakAreas.push('Math: Addition');
  }
  if (profile.mathSkills.subtraction.masteryLevel < threshold &&
      profile.mathSkills.subtraction.totalAttempts > 5) {
    weakAreas.push('Math: Subtraction');
  }
  if (profile.mathSkills.multiplication.masteryLevel < threshold &&
      profile.mathSkills.multiplication.totalAttempts > 5) {
    weakAreas.push('Math: Multiplication');
  }
  if (profile.mathSkills.division.masteryLevel < threshold &&
      profile.mathSkills.division.totalAttempts > 5) {
    weakAreas.push('Math: Division');
  }

  // Check reading skills
  if (profile.readingSkills.sightWords.masteryLevel < threshold &&
      profile.readingSkills.sightWords.totalAttempts > 5) {
    weakAreas.push('Reading: Sight Words');
  }
  if (profile.readingSkills.phonics.masteryLevel < threshold &&
      profile.readingSkills.phonics.totalAttempts > 5) {
    weakAreas.push('Reading: Phonics');
  }
  if (profile.readingSkills.vocabulary.masteryLevel < threshold &&
      profile.readingSkills.vocabulary.totalAttempts > 5) {
    weakAreas.push('Reading: Vocabulary');
  }

  // Check other subjects
  if (profile.scienceSkills.masteryLevel < threshold &&
      profile.scienceSkills.totalAttempts > 5) {
    weakAreas.push('Science');
  }
  if (profile.geographySkills.masteryLevel < threshold &&
      profile.geographySkills.totalAttempts > 5) {
    weakAreas.push('Geography');
  }
  if (profile.codingSkills.masteryLevel < threshold &&
      profile.codingSkills.totalAttempts > 5) {
    weakAreas.push('Coding');
  }
  if (profile.languageSkills.masteryLevel < threshold &&
      profile.languageSkills.totalAttempts > 5) {
    weakAreas.push('Language');
  }

  return weakAreas;
};

/**
 * Generates personalized recommendations based on profile
 */
export const generateRecommendations = (profile: LearningProfile): string[] => {
  const recommendations: string[] = [];
  const weakAreas = analyzeWeakAreas(profile);

  // Add recommendations for weak areas
  weakAreas.forEach(area => {
    recommendations.push(`Practice more ${area} to improve!`);
  });

  // Recommend least practiced skills
  const allSkills = [
    { name: 'Addition', metrics: profile.mathSkills.addition },
    { name: 'Subtraction', metrics: profile.mathSkills.subtraction },
    { name: 'Multiplication', metrics: profile.mathSkills.multiplication },
    { name: 'Division', metrics: profile.mathSkills.division },
    { name: 'Sight Words', metrics: profile.readingSkills.sightWords },
    { name: 'Vocabulary', metrics: profile.readingSkills.vocabulary },
    { name: 'Science', metrics: profile.scienceSkills },
    { name: 'Geography', metrics: profile.geographySkills },
    { name: 'Coding', metrics: profile.codingSkills },
    { name: 'Language', metrics: profile.languageSkills },
  ];

  // Find skills not practiced recently
  const now = Date.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  allSkills.forEach(skill => {
    if (skill.metrics.lastPracticed > 0 &&
        (now - skill.metrics.lastPracticed) > threeDaysMs) {
      recommendations.push(`Time to practice ${skill.name} again!`);
    }
  });

  // Celebrate strengths
  const strongSkills = allSkills.filter(s => s.metrics.masteryLevel >= 80);
  if (strongSkills.length > 0) {
    recommendations.push(`Great job at ${strongSkills[0].name}! Keep it up!`);
  }

  // Default recommendation if none
  if (recommendations.length === 0) {
    recommendations.push('Keep exploring all the learning rooms!');
  }

  return recommendations.slice(0, 5); // Max 5 recommendations
};

/**
 * Calculates adaptive difficulty modifier based on recent performance
 */
export const calculateDifficultyModifier = (profile: LearningProfile): number => {
  // Get average of recent performance across all math skills
  const mathSkills = [
    profile.mathSkills.addition,
    profile.mathSkills.subtraction,
    profile.mathSkills.multiplication,
    profile.mathSkills.division
  ];

  // Only consider skills that have been practiced
  const practicedSkills = mathSkills.filter(s => s.totalAttempts > 0);

  if (practicedSkills.length === 0) return 0;

  // Calculate average accuracy
  const totalCorrect = practicedSkills.reduce((sum, s) => sum + s.correctAnswers, 0);
  const totalAttempts = practicedSkills.reduce((sum, s) => sum + s.totalAttempts, 0);
  const accuracy = totalCorrect / totalAttempts;

  // Calculate average current streak
  const avgStreak = practicedSkills.reduce((sum, s) => sum + s.streakCurrent, 0) / practicedSkills.length;

  // Adjust difficulty based on performance
  // Positive = increase difficulty, Negative = decrease difficulty
  let modifier = 0;

  if (accuracy >= 0.9 && avgStreak >= 5) {
    modifier = 2; // Doing great, increase difficulty significantly
  } else if (accuracy >= 0.8 && avgStreak >= 3) {
    modifier = 1; // Doing well, increase difficulty slightly
  } else if (accuracy < 0.5) {
    modifier = -2; // Struggling, decrease difficulty significantly
  } else if (accuracy < 0.7) {
    modifier = -1; // Having trouble, decrease difficulty slightly
  }

  return modifier;
};

/**
 * Gets the next best skill to practice based on learning profile
 */
export const getNextSkillToPractice = (profile: LearningProfile): string => {
  const allSkills = [
    { name: 'addition', metrics: profile.mathSkills.addition, room: 'Math' },
    { name: 'subtraction', metrics: profile.mathSkills.subtraction, room: 'Math' },
    { name: 'multiplication', metrics: profile.mathSkills.multiplication, room: 'Math' },
    { name: 'division', metrics: profile.mathSkills.division, room: 'Math' },
    { name: 'sightWords', metrics: profile.readingSkills.sightWords, room: 'Reading' },
    { name: 'vocabulary', metrics: profile.readingSkills.vocabulary, room: 'Reading' },
    { name: 'science', metrics: profile.scienceSkills, room: 'Science' },
    { name: 'geography', metrics: profile.geographySkills, room: 'Geography' },
    { name: 'coding', metrics: profile.codingSkills, room: 'Coding' },
    { name: 'language', metrics: profile.languageSkills, room: 'Language' },
  ];

  // Score each skill based on priority factors
  const scored = allSkills.map(skill => {
    let score = 0;

    // Priority 1: Low mastery skills (need practice)
    score += (100 - skill.metrics.masteryLevel) * 2;

    // Priority 2: Not practiced recently
    const daysSince = (Date.now() - skill.metrics.lastPracticed) / (1000 * 60 * 60 * 24);
    score += Math.min(daysSince * 10, 50);

    // Priority 3: Skills with low attempts (new skills)
    if (skill.metrics.totalAttempts < 10) {
      score += 30;
    }

    // Priority 4: Skills where kid was on a streak (momentum)
    if (skill.metrics.streakCurrent > 0) {
      score += skill.metrics.streakCurrent * 5;
    }

    return { ...skill, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored[0].room;
};

/**
 * Updates the full learning profile and returns updated version
 */
export const updateLearningProfile = (
  profile: LearningProfile
): LearningProfile => {
  const updatedProfile = { ...profile };

  // Update weak areas
  updatedProfile.weakAreas = analyzeWeakAreas(updatedProfile);

  // Update recommendations
  updatedProfile.recommendations = generateRecommendations(updatedProfile);

  // Update difficulty modifier
  updatedProfile.difficultyModifier = calculateDifficultyModifier(updatedProfile);

  return updatedProfile;
};

/**
 * Generates an encouraging message based on performance
 */
export const getEncouragingMessage = (
  correct: boolean,
  streak: number,
  masteryLevel: number
): string => {
  if (correct) {
    if (streak >= 10) {
      return "INCREDIBLE! You're on fire! 🔥🔥🔥";
    } else if (streak >= 5) {
      return "WOW! Amazing streak! Keep going! ⭐";
    } else if (streak >= 3) {
      return "Great job! You're doing awesome! 🎉";
    } else if (masteryLevel >= 80) {
      return "You're a superstar at this! 🌟";
    } else {
      const messages = [
        "Correct! Great work! 👍",
        "You got it! 🎯",
        "Awesome! Keep it up! 💪",
        "Perfect! 🌈",
        "Brilliant! ✨"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  } else {
    const messages = [
      "Not quite, but you're learning! 💙",
      "Good try! Let's try another one! 🌟",
      "Keep going, you've got this! 💪",
      "Almost! You're getting better! 📈",
      "That's okay! Practice makes perfect! 🎯"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
};
