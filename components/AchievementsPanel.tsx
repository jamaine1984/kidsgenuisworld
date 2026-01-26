import React, { useState } from 'react';
import { Trophy, Star, Lock, Sparkles, X } from 'lucide-react';
import { Achievement, ACHIEVEMENTS } from '../types';
import { speak } from '../services/audioService';

interface AchievementsPanelProps {
  unlockedAchievements: string[];
  onClose: () => void;
}

const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const RARITY_GLOW = {
  common: '',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-purple-400/50',
  legendary: 'shadow-yellow-400/50 animate-pulse',
};

const CATEGORY_TABS = [
  { id: 'all', label: 'All', icon: '🏆' },
  { id: 'math', label: 'Math', icon: '🔢' },
  { id: 'reading', label: 'Reading', icon: '📚' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'geography', label: 'Geography', icon: '🌍' },
  { id: 'coding', label: 'Coding', icon: '💻' },
  { id: 'language', label: 'Language', icon: '🗣️' },
  { id: 'general', label: 'General', icon: '⭐' },
];

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  unlockedAchievements,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const filteredAchievements = ACHIEVEMENTS.filter(
    a => selectedCategory === 'all' || a.category === selectedCategory
  );

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  const isUnlocked = (id: string) => unlockedAchievements.includes(id);

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    if (isUnlocked(achievement.id)) {
      speak(`${achievement.name}! ${achievement.description}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <Trophy size={32} className="text-yellow-200" />
            <h2 className="text-2xl font-bold">Achievements</h2>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-300 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold">{unlockedCount}/{totalCount}</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 p-2 overflow-x-auto bg-amber-100/50">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
                selectedCategory === tab.id
                  ? 'bg-amber-500 text-white shadow'
                  : 'bg-white/50 text-gray-600 hover:bg-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredAchievements.map(achievement => {
              const unlocked = isUnlocked(achievement.id);

              return (
                <button
                  key={achievement.id}
                  onClick={() => handleAchievementClick(achievement)}
                  className={`relative p-4 rounded-xl transition-all transform hover:scale-105 ${
                    unlocked
                      ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} text-white shadow-lg ${RARITY_GLOW[achievement.rarity]}`
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {/* Icon */}
                  <div className="text-4xl mb-2">
                    {unlocked ? achievement.icon : <Lock size={32} className="mx-auto opacity-50" />}
                  </div>

                  {/* Name */}
                  <h3 className={`font-bold text-sm ${unlocked ? '' : 'text-gray-500'}`}>
                    {unlocked ? achievement.name : '???'}
                  </h3>

                  {/* Rarity Badge */}
                  <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${
                    unlocked ? 'bg-white/30' : 'bg-gray-300'
                  }`}>
                    {achievement.rarity}
                  </div>

                  {/* Sparkle effect for legendary */}
                  {unlocked && achievement.rarity === 'legendary' && (
                    <Sparkles className="absolute -top-1 -right-1 text-yellow-200" size={20} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl ${
              isUnlocked(selectedAchievement.id) ? '' : ''
            }`}>
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>

              <div className="text-center">
                {/* Achievement Icon */}
                <div className={`inline-block text-6xl p-4 rounded-2xl mb-4 ${
                  isUnlocked(selectedAchievement.id)
                    ? `bg-gradient-to-br ${RARITY_COLORS[selectedAchievement.rarity]} shadow-lg`
                    : 'bg-gray-200'
                }`}>
                  {isUnlocked(selectedAchievement.id) ? selectedAchievement.icon : '🔒'}
                </div>

                {/* Name & Description */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedAchievement.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedAchievement.description}
                </p>

                {/* Progress */}
                {!isUnlocked(selectedAchievement.id) && (
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-500 mb-2">Progress</p>
                    <div className="h-2 bg-gray-300 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (selectedAchievement.currentProgress / selectedAchievement.requirement) * 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedAchievement.currentProgress} / {selectedAchievement.requirement}
                    </p>
                  </div>
                )}

                {/* Unlocked Date */}
                {isUnlocked(selectedAchievement.id) && selectedAchievement.unlockedAt && (
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    Unlocked!
                  </p>
                )}

                {/* Rarity */}
                <div className={`inline-block mt-4 px-4 py-1 rounded-full text-sm font-bold ${
                  isUnlocked(selectedAchievement.id)
                    ? `bg-gradient-to-r ${RARITY_COLORS[selectedAchievement.rarity]} text-white`
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {selectedAchievement.rarity.toUpperCase()}
                </div>
              </div>

              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full mt-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Achievement Unlock Toast/Animation
export const AchievementUnlockToast: React.FC<{
  achievement: Achievement;
  onClose: () => void;
}> = ({ achievement, onClose }) => {
  React.useEffect(() => {
    speak(`Achievement Unlocked! ${achievement.name}!`);
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className={`bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4`}>
        <div className="text-4xl animate-bounce">{achievement.icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wider opacity-80">Achievement Unlocked!</p>
          <p className="font-bold text-lg">{achievement.name}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">×</button>
      </div>
    </div>
  );
};
