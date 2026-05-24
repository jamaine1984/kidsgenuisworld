import { ACHIEVEMENTS, RoomType, type Achievement, type SkillMetrics, type UserProgress } from '../types';

export const LEARNING_ROOM_ACHIEVEMENT_ROOMS = [
  RoomType.MATH,
  RoomType.READING,
  RoomType.STORYBOOK,
  RoomType.SCIENCE,
  RoomType.GEOGRAPHY,
  RoomType.CODING,
  RoomType.LANGUAGE,
  RoomType.ART,
  RoomType.MUSIC,
  RoomType.PUZZLE,
];

const clampToRequirement = (value: number, requirement: number) => Math.min(Math.max(0, value), requirement);

const getBestStreak = (skills: SkillMetrics[]) => (
  skills.reduce((best, skill) => Math.max(best, skill.streakBest || 0, skill.streakCurrent || 0), 0)
);

const getVisitedLearningRoomCount = (progress: UserProgress) => {
  const visitedRooms = new Set<RoomType>();

  Object.values(progress.gradeRoomVisits || {}).forEach(rooms => {
    rooms.forEach(room => visitedRooms.add(room));
  });
  (progress.dailyStats || []).forEach(day => {
    day.roomsVisited.forEach(room => visitedRooms.add(room));
  });
  (progress.learningJournal || []).forEach(entry => visitedRooms.add(entry.room));

  return LEARNING_ROOM_ACHIEVEMENT_ROOMS.filter(room => visitedRooms.has(room)).length;
};

export const getAchievementProgress = (achievementId: string, progress: UserProgress): number => {
  const achievement = ACHIEVEMENTS.find(item => item.id === achievementId);
  const requirement = achievement?.requirement || 1;
  const mathStreak = getBestStreak(Object.values(progress.learningProfile.mathSkills));

  const progressByAchievement: Record<string, number> = {
    math_starter: progress.mathScore || 0,
    math_10: progress.mathScore || 0,
    math_50: progress.mathScore || 0,
    math_100: progress.mathScore || 0,
    math_streak_5: mathStreak,
    math_streak_10: mathStreak,
    read_starter: progress.readingScore || 0,
    read_25: progress.readingScore || 0,
    read_100: progress.readingScore || 0,
    science_starter: progress.scienceScore || 0,
    science_10: progress.scienceScore || 0,
    geo_starter: progress.geographyScore || 0,
    geo_10: progress.geographyScore || 0,
    geo_50: progress.geographyScore || 0,
    code_starter: progress.codingScore || 0,
    code_10: progress.codingScore || 0,
    lang_starter: progress.languageScore || 0,
    lang_25: progress.languageScore || 0,
    story_starter: progress.storybookScore || 0,
    story_10: progress.storybookScore || 0,
    story_25: progress.storybookScore || 0,
    sticker_10: progress.stickers.length,
    sticker_50: progress.stickers.length,
    sticker_100: progress.stickers.length,
    pet_level_10: progress.pet?.level || 0,
    all_rooms: getVisitedLearningRoomCount(progress),
    week_streak: progress.currentStreak || 0,
  };

  return clampToRequirement(progressByAchievement[achievementId] || 0, requirement);
};

export const getAchievementsWithProgress = (progress: UserProgress): Achievement[] => (
  ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    currentProgress: getAchievementProgress(achievement.id, progress),
  }))
);
