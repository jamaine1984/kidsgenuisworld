import React, { useState, useEffect } from 'react';
import { WorldMap } from './components/WorldMap';
import { Guide } from './components/Guide';
import { MathRoom } from './components/MathRoom';
import { ArtRoom } from './components/ArtRoom';
import { MusicRoom } from './components/MusicRoom';
import { ReadingRoom } from './components/ReadingRoom';
import { PuzzleRoom } from './components/PuzzleRoom';
import { Playground } from './components/Playground';
import { Dashboard } from './components/Dashboard';
import { ScienceRoom } from './components/ScienceRoom';
import { GeographyRoom } from './components/GeographyRoom';
import { CodingRoom } from './components/CodingRoom';
import { LanguageRoom } from './components/LanguageRoom';
import { StoryBook } from './components/StoryBook';
import { VirtualPetPanel, PetSelection } from './components/VirtualPet';
import { AchievementsPanel, AchievementUnlockToast } from './components/AchievementsPanel';
import { ParentDashboard } from './components/ParentDashboard';
import {
  RoomType,
  UserProgress,
  GradeLevel,
  STICKER_COLLECTION,
  SEASONAL_STICKERS,
  Holiday,
  VirtualPet,
  Achievement,
  ACHIEVEMENTS,
  AccessibilitySettings,
  createDefaultProgress,
  DEFAULT_LEARNING_PROFILE,
  DEFAULT_ACCESSIBILITY
} from './types';
import { resumeAudioContext, playSuccess, speak, speakWelcome } from './services/audioService';
import { updateSkillMetrics, updateLearningProfile, getEncouragingMessage } from './services/adaptiveLearning';
import { Play, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [showGradeSelection, setShowGradeSelection] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomType>(RoomType.HUB);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPet, setShowPet] = useState(false);
  const [showPetSelection, setShowPetSelection] = useState(false);
  const [guideTrigger, setGuideTrigger] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Global Progression State with all new features
  const [progress, setProgress] = useState<UserProgress>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('kidGeniusProgress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return createDefaultProgress();
      }
    }
    return createDefaultProgress();
  });

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('kidGeniusProgress', JSON.stringify(progress));
  }, [progress]);

  // Check for achievements
  const checkAchievements = (newProgress: UserProgress) => {
    const unlockedIds = newProgress.achievements || [];

    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedIds.includes(achievement.id)) return; // Already unlocked

      let shouldUnlock = false;
      let currentProgress = 0;

      switch (achievement.id) {
        case 'math_starter':
          currentProgress = newProgress.mathScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'math_10':
          currentProgress = newProgress.mathScore;
          shouldUnlock = currentProgress >= 10;
          break;
        case 'math_50':
          currentProgress = newProgress.mathScore;
          shouldUnlock = currentProgress >= 50;
          break;
        case 'math_100':
          currentProgress = newProgress.mathScore;
          shouldUnlock = currentProgress >= 100;
          break;
        case 'read_starter':
          currentProgress = newProgress.readingScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'read_25':
          currentProgress = newProgress.readingScore;
          shouldUnlock = currentProgress >= 25;
          break;
        case 'sticker_10':
          currentProgress = newProgress.stickers.length;
          shouldUnlock = currentProgress >= 10;
          break;
        case 'sticker_50':
          currentProgress = newProgress.stickers.length;
          shouldUnlock = currentProgress >= 50;
          break;
        case 'science_starter':
          currentProgress = newProgress.scienceScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'geo_starter':
          currentProgress = newProgress.geographyScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'code_starter':
          currentProgress = newProgress.codingScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'lang_starter':
          currentProgress = newProgress.languageScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'story_starter':
          currentProgress = newProgress.storybookScore || 0;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'story_10':
          currentProgress = newProgress.storybookScore || 0;
          shouldUnlock = currentProgress >= 10;
          break;
        case 'story_25':
          currentProgress = newProgress.storybookScore || 0;
          shouldUnlock = currentProgress >= 25;
          break;
      }

      if (shouldUnlock) {
        newProgress.achievements = [...(newProgress.achievements || []), achievement.id];
        setNewAchievement({ ...achievement, unlockedAt: Date.now() });
      }
    });

    return newProgress;
  };

  // Start Screen to unlock AudioContext
  const handleStart = async () => {
    await resumeAudioContext();
    setHasStarted(true);

    // Check if this is a new player who needs to select grade and pet
    const isNewPlayer = !progress.pet || progress.currentGrade === GradeLevel.KINDERGARTEN && progress.totalXP === 0;

    if (isNewPlayer) {
      setShowGradeSelection(true);
    } else {
      speak("Welcome back to Kid Genius World!");
    }
  };

  // Handle grade selection
  const handleGradeSelected = (grade: GradeLevel) => {
    const gradeToLevel: { [key in GradeLevel]: number } = {
      [GradeLevel.PRE_K]: 1,
      [GradeLevel.KINDERGARTEN]: 2,
      [GradeLevel.FIRST_GRADE]: 3,
      [GradeLevel.SECOND_GRADE]: 4,
      [GradeLevel.THIRD_GRADE]: 5,
      [GradeLevel.FOURTH_GRADE]: 6,
      [GradeLevel.FIFTH_GRADE]: 7,
    };

    setProgress(prev => ({
      ...prev,
      currentGrade: grade,
      currentLevel: gradeToLevel[grade],
    }));

    speak(`Great! You're in ${grade}. Let's learn together!`);
    setShowGradeSelection(false);

    // If no pet, show pet selection next
    if (!progress.pet) {
      setShowPetSelection(true);
    }
  };

  const handlePetSelected = (pet: VirtualPet) => {
    setProgress(prev => ({ ...prev, pet }));
    setShowPetSelection(false);
    speak(`Welcome to Kid Genius World! ${pet.name} is excited to learn with you!`);
  };

  const handleEnterRoom = (room: RoomType) => {
    setCurrentRoom(room);
    setGuideTrigger(p => p + 1);
  };

  const handleBack = () => {
    setCurrentRoom(RoomType.HUB);
    setShowDashboard(false);
    setShowParentDashboard(false);
    setGuideTrigger(p => p + 1);
  };

  const getCurrentHoliday = (): Holiday => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    if (month === 9 && day >= 25) return Holiday.HALLOWEEN;
    if (month === 10 && day >= 20 && day <= 30) return Holiday.THANKSGIVING;
    if (month === 11 && day >= 15) return Holiday.CHRISTMAS;
    if (month === 0 && day <= 7) return Holiday.NEW_YEAR;
    if (month === 1 && day >= 10 && day <= 14) return Holiday.VALENTINES;
    if (month === 3 && day >= 1 && day <= 21) return Holiday.EASTER;
    if (month === 6 && day >= 1 && day <= 7) return Holiday.INDEPENDENCE_DAY;
    if (month === 7 && day >= 15) return Holiday.BACK_TO_SCHOOL;
    return Holiday.NONE;
  };

  const addSticker = (subject?: string) => {
    playSuccess();

    const holiday = getCurrentHoliday();
    const seasonalStickers = SEASONAL_STICKERS[holiday];
    const availableStickers = [...STICKER_COLLECTION, ...seasonalStickers];

    // Find a sticker we don't have yet, prefer new ones
    const uncollected = availableStickers.filter(s => !progress.stickers.includes(s));
    let nextSticker = '';

    if (uncollected.length > 0 && Math.random() > 0.2) {
      nextSticker = uncollected[Math.floor(Math.random() * uncollected.length)];
    } else {
      nextSticker = availableStickers[Math.floor(Math.random() * availableStickers.length)];
    }

    const stickersNeeded = progress.currentLevel * 5;
    let newLevel = progress.currentLevel;
    let newGrade = progress.currentGrade;
    const newStickers = [...progress.stickers];

    // Add if not duplicate
    if (!newStickers.includes(nextSticker)) {
      newStickers.push(nextSticker);
    }

    // Level up check
    if (newStickers.length >= stickersNeeded && progress.currentLevel < 7) {
      newLevel = Math.min(progress.currentLevel + 1, 7);
      const grades = [
        GradeLevel.PRE_K, GradeLevel.KINDERGARTEN, GradeLevel.FIRST_GRADE,
        GradeLevel.SECOND_GRADE, GradeLevel.THIRD_GRADE, GradeLevel.FOURTH_GRADE, GradeLevel.FIFTH_GRADE
      ];
      newGrade = grades[newLevel - 1] || GradeLevel.FIFTH_GRADE;
      speak(`Congratulations! You are now in ${newGrade}!`);
    }

    // Update pet XP
    let updatedPet = progress.pet;
    if (updatedPet) {
      updatedPet = {
        ...updatedPet,
        xp: updatedPet.xp + 15,
        happiness: Math.min(100, updatedPet.happiness + 5),
      };

      // Pet level up
      const petXpNeeded = updatedPet.level * 100;
      if (updatedPet.xp >= petXpNeeded) {
        updatedPet.level = Math.min(50, updatedPet.level + 1);
        updatedPet.xp = updatedPet.xp - petXpNeeded;
      }
    }

    let newProgress: UserProgress = {
      ...progress,
      stickers: newStickers,
      currentLevel: newLevel,
      currentGrade: newGrade,
      xp: progress.xp + 10,
      totalXP: (progress.totalXP || 0) + 10,
      pet: updatedPet,
    };

    // Check for new achievements
    newProgress = checkAchievements(newProgress);

    setProgress(newProgress);
  };

  const handleMathReward = () => {
    setProgress(p => {
      const newProgress = { ...p, mathScore: p.mathScore + 1 };
      return checkAchievements(newProgress);
    });
    addSticker('math');
  };

  const handleReadingReward = () => {
    setProgress(p => {
      const newProgress = { ...p, readingScore: p.readingScore + 1 };
      return checkAchievements(newProgress);
    });
    addSticker('reading');
  };

  const handleScienceReward = () => {
    setProgress(p => {
      const newProgress = { ...p, scienceScore: (p.scienceScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    addSticker('science');
  };

  const handleGeographyReward = () => {
    setProgress(p => {
      const newProgress = { ...p, geographyScore: (p.geographyScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    addSticker('geography');
  };

  const handleCodingReward = () => {
    setProgress(p => {
      const newProgress = { ...p, codingScore: (p.codingScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    addSticker('coding');
  };

  const handleLanguageReward = () => {
    setProgress(p => {
      const newProgress = { ...p, languageScore: (p.languageScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    addSticker('language');
  };

  const handleStorybookReward = () => {
    setProgress(p => {
      const newProgress = { ...p, storybookScore: (p.storybookScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    addSticker('reading');
  };

  const handleUpdatePet = (pet: VirtualPet) => {
    setProgress(p => ({ ...p, pet }));
  };

  const handleUpdateAccessibility = (settings: AccessibilitySettings) => {
    setProgress(p => ({ ...p, accessibility: settings }));
  };

  // Apply accessibility styles
  const getAccessibilityClasses = () => {
    const classes: string[] = [];
    const a = progress.accessibility || DEFAULT_ACCESSIBILITY;

    if (a.fontSize === 'large') classes.push('text-lg');
    if (a.fontSize === 'xlarge') classes.push('text-xl');
    if (a.highContrast) classes.push('high-contrast');
    if (a.dyslexiaFont) classes.push('font-dyslexia');
    if (a.reduceMotion) classes.push('reduce-motion');

    return classes.join(' ');
  };

  // Start Screen
  if (!hasStarted) {
    return (
      <div className="w-screen h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-300 flex items-center justify-center flex-col gap-8 overflow-hidden relative">

        {/* ============ SKY LAYER ============ */}

        {/* Giant Sun with Rays */}
        <div className="absolute top-[-20px] right-[-20px] w-48 h-48 z-0">
          {/* Sun rays - rotating */}
          <div className="absolute inset-0 sun-rays">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-32 bg-gradient-to-t from-yellow-400 to-transparent sun-ray rounded-full"
                style={{
                  transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                  transformOrigin: 'center bottom',
                  animationDelay: `${i * 0.15}s`,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
          {/* Sun core */}
          <div className="absolute inset-4 text-9xl sun-glow flex items-center justify-center">
            ☀️
          </div>
        </div>

        {/* Clouds - Multiple layers drifting */}
        <div className="absolute top-8 left-0 text-7xl animate-cloud-drift opacity-70" style={{ animationDelay: '0s' }}>☁️</div>
        <div className="absolute top-20 left-0 text-8xl animate-cloud-drift-slow opacity-50" style={{ animationDelay: '5s' }}>☁️</div>
        <div className="absolute top-32 left-0 text-6xl animate-cloud-drift-fast opacity-60" style={{ animationDelay: '10s' }}>☁️</div>
        <div className="absolute top-16 left-0 text-5xl animate-cloud-drift opacity-40" style={{ animationDelay: '15s' }}>☁️</div>
        <div className="absolute top-40 left-0 text-7xl animate-cloud-drift-slow opacity-55" style={{ animationDelay: '8s' }}>⛅</div>

        {/* Rainbow */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 text-8xl animate-rainbow">🌈</div>

        {/* Flying birds */}
        <div className="absolute top-28 left-0 text-3xl animate-bird" style={{ animationDelay: '0s' }}>🕊️</div>
        <div className="absolute top-36 left-0 text-2xl animate-bird" style={{ animationDelay: '3s' }}>🐦</div>

        {/* ============ INSECTS LAYER ============ */}

        {/* Bees flying in patterns */}
        <div className="absolute top-[30%] left-[15%] text-4xl animate-bee z-10">🐝</div>
        <div className="absolute top-[45%] right-[20%] text-3xl animate-bee-2 z-10">🐝</div>
        <div className="absolute top-[25%] right-[35%] text-4xl animate-bee-3 z-10">🐝</div>
        <div className="absolute bottom-[40%] left-[25%] text-3xl animate-bee z-10" style={{ animationDelay: '2s' }}>🐝</div>

        {/* Butterflies fluttering */}
        <div className="absolute top-[35%] left-[10%] text-5xl animate-butterfly z-10">🦋</div>
        <div className="absolute top-[50%] right-[15%] text-4xl animate-butterfly-2 z-10">🦋</div>
        <div className="absolute top-[20%] left-[40%] text-5xl animate-butterfly-3 z-10">🦋</div>
        <div className="absolute bottom-[35%] right-[30%] text-4xl animate-butterfly z-10" style={{ animationDelay: '4s' }}>🦋</div>

        {/* Ladybugs */}
        <div className="absolute bottom-[25%] left-[8%] text-3xl animate-float z-10">🐞</div>
        <div className="absolute bottom-[30%] right-[12%] text-2xl animate-float-delayed z-10">🐞</div>

        {/* Sparkles scattered around */}
        <div className="absolute top-[20%] left-[30%] text-2xl animate-sparkle">✨</div>
        <div className="absolute top-[40%] right-[25%] text-3xl animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-[60%] left-[20%] text-2xl animate-sparkle" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute top-[30%] right-[40%] text-2xl animate-sparkle" style={{ animationDelay: '1.5s' }}>💫</div>
        <div className="absolute bottom-[45%] left-[45%] text-3xl animate-sparkle" style={{ animationDelay: '0.3s' }}>✨</div>

        {/* ============ GROUND LAYER ============ */}

        {/* Grass gradient at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-500 via-green-400 to-transparent z-0" />

        {/* Flowers swaying */}
        <div className="absolute bottom-4 left-[5%] text-5xl animate-sway z-10">🌸</div>
        <div className="absolute bottom-6 left-[15%] text-4xl animate-sway z-10" style={{ animationDelay: '0.3s' }}>🌷</div>
        <div className="absolute bottom-4 left-[25%] text-5xl animate-sway z-10" style={{ animationDelay: '0.6s' }}>🌻</div>
        <div className="absolute bottom-8 left-[35%] text-4xl animate-sway z-10" style={{ animationDelay: '0.9s' }}>🌺</div>
        <div className="absolute bottom-4 right-[35%] text-5xl animate-sway z-10" style={{ animationDelay: '0.2s' }}>🌼</div>
        <div className="absolute bottom-6 right-[25%] text-4xl animate-sway z-10" style={{ animationDelay: '0.5s' }}>🌸</div>
        <div className="absolute bottom-4 right-[15%] text-5xl animate-sway z-10" style={{ animationDelay: '0.8s' }}>🌷</div>
        <div className="absolute bottom-8 right-[5%] text-4xl animate-sway z-10" style={{ animationDelay: '1.1s' }}>🌻</div>

        {/* Little creatures in grass */}
        <div className="absolute bottom-16 left-[10%] text-3xl animate-float z-10">🐌</div>
        <div className="absolute bottom-20 right-[18%] text-2xl animate-float-delayed z-10">🐛</div>
        <div className="absolute bottom-14 left-[45%] text-3xl animate-float z-10">🦗</div>

        {/* Trees on sides */}
        <div className="absolute bottom-0 left-2 text-8xl z-5">🌳</div>
        <div className="absolute bottom-0 right-2 text-8xl z-5">🌲</div>

        {/* ============ CONTENT LAYER ============ */}

        {/* Title */}
        <div className="text-center z-20">
          <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] animate-title-bounce">
            Kid Genius World
          </h1>
          <p className="text-2xl text-white/95 mt-4 font-semibold drop-shadow-lg flex items-center justify-center gap-2">
            <span className="animate-sparkle">✨</span>
            Learning is an Adventure!
            <span className="animate-sparkle" style={{ animationDelay: '0.7s' }}>✨</span>
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="z-20 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 hover:from-yellow-300 hover:via-orange-300 hover:to-yellow-300 text-yellow-900 px-14 py-7 rounded-full text-3xl font-bold shadow-[0_10px_0_rgb(161,98,7),0_15px_30px_rgba(0,0,0,0.3)] active:translate-y-2 active:shadow-[0_5px_0_rgb(161,98,7)] transition-all flex items-center gap-4 hover:scale-105"
        >
          <Play size={44} fill="currentColor" />
          Start Adventure!
          <Sparkles size={36} className="animate-pulse" />
        </button>

        {/* Features */}
        <div className="z-20 flex gap-3 mt-4 flex-wrap justify-center px-4">
          {[
            { emoji: '🔢', label: 'Math' },
            { emoji: '📚', label: 'Reading' },
            { emoji: '📖', label: 'Stories' },
            { emoji: '🔬', label: 'Science' },
            { emoji: '🌍', label: 'Geography' },
            { emoji: '💻', label: 'Coding' },
            { emoji: '🗣️', label: 'Languages' }
          ].map((item, i) => (
            <span
              key={item.label}
              className="bg-white/90 px-5 py-2 rounded-full text-gray-700 font-semibold shadow-lg hover:scale-110 hover:bg-white transition-all cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {item.emoji} {item.label}
            </span>
          ))}
        </div>

        {/* Cute mascot hint */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-white/80 text-sm animate-float">
          <span className="text-2xl">🎓</span>
          Choose your learning buddy inside!
          <span className="text-2xl">🐾</span>
        </div>
      </div>
    );
  }

  // Grade Selection Screen
  if (showGradeSelection) {
    const grades = [
      { grade: GradeLevel.PRE_K, emoji: '🌱', age: 'Age 3-4', color: 'from-pink-400 to-rose-500' },
      { grade: GradeLevel.KINDERGARTEN, emoji: '🌸', age: 'Age 5-6', color: 'from-purple-400 to-indigo-500' },
      { grade: GradeLevel.FIRST_GRADE, emoji: '🌻', age: 'Age 6-7', color: 'from-yellow-400 to-orange-500' },
      { grade: GradeLevel.SECOND_GRADE, emoji: '🌈', age: 'Age 7-8', color: 'from-green-400 to-teal-500' },
      { grade: GradeLevel.THIRD_GRADE, emoji: '🚀', age: 'Age 8-9', color: 'from-blue-400 to-cyan-500' },
      { grade: GradeLevel.FOURTH_GRADE, emoji: '⭐', age: 'Age 9-10', color: 'from-indigo-400 to-purple-500' },
      { grade: GradeLevel.FIFTH_GRADE, emoji: '🏆', age: 'Age 10-11', color: 'from-amber-400 to-red-500' },
    ];

    return (
      <div className="w-screen h-screen bg-gradient-to-b from-sky-400 via-purple-400 to-pink-400 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🎒</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
            What grade are you in?
          </h1>
          <p className="text-white/90 text-lg">This helps us pick the right challenges for you!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
          {grades.map(({ grade, emoji, age, color }) => (
            <button
              key={grade}
              onClick={() => handleGradeSelected(grade)}
              className={`bg-gradient-to-br ${color} p-6 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-2 border-4 border-white/30`}
            >
              <span className="text-5xl">{emoji}</span>
              <span className="text-xl font-bold text-white drop-shadow">{grade}</span>
              <span className="text-sm text-white/80">{age}</span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-white/70 text-sm">
          Don't worry - you can change this later in settings!
        </p>
      </div>
    );
  }

  // Pet Selection Screen
  if (showPetSelection) {
    return <PetSelection onSelect={handlePetSelected} />;
  }

  // Dashboard Views
  if (showDashboard) {
    return <Dashboard progress={progress} onBack={handleBack} />;
  }

  if (showParentDashboard) {
    return (
      <ParentDashboard
        progress={progress}
        onBack={handleBack}
        onUpdateAccessibility={handleUpdateAccessibility}
      />
    );
  }

  // Main Game View
  const renderView = () => {
    switch (currentRoom) {
      case RoomType.MATH:
        return <MathRoom level={progress.currentLevel} onBack={handleBack} onReward={handleMathReward} />;
      case RoomType.READING:
        return <ReadingRoom level={progress.currentLevel} onBack={handleBack} onReward={handleReadingReward} />;
      case RoomType.SCIENCE:
        return <ScienceRoom level={progress.currentLevel} onBack={handleBack} onReward={handleScienceReward} />;
      case RoomType.GEOGRAPHY:
        return <GeographyRoom level={progress.currentLevel} onBack={handleBack} onReward={handleGeographyReward} />;
      case RoomType.CODING:
        return <CodingRoom level={progress.currentLevel} onBack={handleBack} onReward={handleCodingReward} />;
      case RoomType.LANGUAGE:
        return <LanguageRoom level={progress.currentLevel} onBack={handleBack} onReward={handleLanguageReward} />;
      case RoomType.STORYBOOK:
        return <StoryBook level={progress.currentLevel} onBack={handleBack} onReward={handleStorybookReward} />;
      case RoomType.ART:
        return <ArtRoom onBack={handleBack} />;
      case RoomType.MUSIC:
        return <MusicRoom onBack={handleBack} />;
      case RoomType.PUZZLE:
        return <PuzzleRoom onBack={handleBack} onReward={addSticker} />;
      case RoomType.PLAYGROUND:
        return <Playground onBack={handleBack} />;
      case RoomType.HUB:
      default:
        return (
          <WorldMap
            onEnterRoom={handleEnterRoom}
            onOpenDashboard={() => setShowDashboard(true)}
            onOpenAchievements={() => setShowAchievements(true)}
            onOpenPet={() => setShowPet(true)}
            onOpenSettings={() => setShowParentDashboard(true)}
            progress={progress}
          />
        );
    }
  };

  return (
    <div className={`w-screen h-screen overflow-hidden bg-sky-100 relative ${getAccessibilityClasses()}`}>
      {renderView()}
      <Guide room={currentRoom} trigger={guideTrigger} />

      {/* Modals */}
      {showAchievements && (
        <AchievementsPanel
          unlockedAchievements={progress.achievements || []}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showPet && progress.pet && (
        <VirtualPetPanel
          pet={progress.pet}
          onUpdatePet={handleUpdatePet}
          onClose={() => setShowPet(false)}
        />
      )}

      {/* Achievement Unlock Toast */}
      {newAchievement && (
        <AchievementUnlockToast
          achievement={newAchievement}
          onClose={() => setNewAchievement(null)}
        />
      )}
    </div>
  );
};

export default App;
