import React, { useState } from 'react';
import {
  ArrowLeft, BarChart3, Clock, Target, TrendingUp,
  Star, Award, Brain, Calendar, ChevronRight, Lock,
  Settings, Shield, Volume2, Eye, Type
} from 'lucide-react';
import { UserProgress, RoomType, AccessibilitySettings } from '../types';

interface ParentDashboardProps {
  progress: UserProgress;
  onBack: () => void;
  onUpdateAccessibility: (settings: AccessibilitySettings) => void;
  requireParentGate?: boolean;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  progress,
  onBack,
  onUpdateAccessibility,
  requireParentGate = true,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'settings'>('overview');

  // Calculate stats
  const totalProblems = progress.mathScore + progress.readingScore + progress.scienceScore +
                        progress.geographyScore + progress.codingScore + progress.languageScore;

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSubjectData = () => {
    return [
      { name: 'Math', score: progress.mathScore, icon: '🔢', color: 'bg-blue-500' },
      { name: 'Reading', score: progress.readingScore, icon: '📚', color: 'bg-green-500' },
      { name: 'Science', score: progress.scienceScore, icon: '🔬', color: 'bg-purple-500' },
      { name: 'Geography', score: progress.geographyScore, icon: '🌍', color: 'bg-cyan-500' },
      { name: 'Coding', score: progress.codingScore, icon: '💻', color: 'bg-indigo-500' },
      { name: 'Language', score: progress.languageScore, icon: '🗣️', color: 'bg-pink-500' },
    ].sort((a, b) => b.score - a.score);
  };

  const maxScore = Math.max(...getSubjectData().map(s => s.score), 1);

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden" style={{ maxHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield size={24} />
            Parent Dashboard
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{progress.currentLevel}</p>
            <p className="text-xs opacity-80">Level</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{totalProblems}</p>
            <p className="text-xs opacity-80">Problems Solved</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{progress.stickers.length}</p>
            <p className="text-xs opacity-80">Stickers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
          { id: 'skills', label: 'Skills', icon: <Brain size={18} /> },
          { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold transition ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Grade */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Award size={20} className="text-indigo-500" />
                Current Progress
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{progress.currentGrade}</p>
                  <p className="text-sm text-gray-500">Grade Level</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{progress.currentStreak}</p>
                  <p className="text-sm text-gray-500">Day Streak</p>
                </div>
              </div>
            </div>

            {/* Subject Performance */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-500" />
                Subject Performance
              </h3>
              <div className="space-y-3">
                {getSubjectData().map(subject => (
                  <div key={subject.name} className="flex items-center gap-3">
                    <span className="text-2xl w-8">{subject.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{subject.name}</span>
                        <span className="text-gray-500">{subject.score} correct</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${subject.color} rounded-full transition-all`}
                          style={{ width: `${(subject.score / maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Target size={20} className="text-orange-500" />
                Recommendations
              </h3>
              <div className="space-y-2">
                {progress.learningProfile.recommendations.length > 0 ? (
                  progress.learningProfile.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <ChevronRight size={16} className="text-orange-500" />
                      {rec}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Keep exploring all the learning rooms!</p>
                )}
              </div>
            </div>

            {/* Time Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" />
                Time Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{progress.totalPlayTimeMinutes}</p>
                  <p className="text-xs text-gray-500">Total Minutes</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{progress.sessionsCompleted}</p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
              </div>
            </div>

            {/* Achievements Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star size={20} className="text-yellow-500" />
                Achievements
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-yellow-600">
                  {progress.achievements.length}
                </p>
                <p className="text-gray-500">badges earned</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            {/* Math Skills */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">🔢 Math Skills</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(progress.learningProfile.mathSkills).map(([skill, metrics]) => (
                  <div key={skill} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium capitalize text-sm">{skill}</p>
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <p className="text-xl font-bold text-indigo-600">{metrics.masteryLevel}%</p>
                        <p className="text-xs text-gray-500">mastery</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          {metrics.correctAnswers}/{metrics.totalAttempts}
                        </p>
                        <p className="text-xs text-gray-500">correct</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${metrics.masteryLevel}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Skills */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">📚 Reading Skills</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(progress.learningProfile.readingSkills).map(([skill, metrics]) => (
                  <div key={skill} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium capitalize text-sm">{skill.replace(/([A-Z])/g, ' $1')}</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-xl font-bold text-green-600">{metrics.masteryLevel}%</p>
                      <p className="text-sm text-gray-500">{metrics.totalAttempts} attempts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas */}
            {progress.learningProfile.weakAreas.length > 0 && (
              <div className="bg-orange-50 rounded-xl p-4">
                <h3 className="font-semibold text-orange-700 mb-3">⚠️ Areas Needing Practice</h3>
                <div className="space-y-2">
                  {progress.learningProfile.weakAreas.map((area, i) => (
                    <div key={i} className="flex items-center gap-2 text-orange-600">
                      <Target size={16} />
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Accessibility Settings */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Eye size={20} className="text-indigo-500" />
                Accessibility
              </h3>

              {/* Font Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <Type size={16} className="inline mr-2" />
                  Text Size
                </label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large', 'xlarge'].map(size => (
                    <button
                      key={size}
                      onClick={() => onUpdateAccessibility({
                        ...progress.accessibility,
                        fontSize: size as any
                      })}
                      className={`flex-1 py-2 rounded-lg font-medium transition ${
                        progress.accessibility.fontSize === size
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-3">
                {[
                  { key: 'highContrast', label: 'High Contrast Mode', desc: 'Increases color contrast for visibility' },
                  { key: 'dyslexiaFont', label: 'Dyslexia-Friendly Font', desc: 'Uses OpenDyslexic font' },
                  { key: 'reduceMotion', label: 'Reduce Motion', desc: 'Minimizes animations' },
                  { key: 'autoReadQuestions', label: 'Auto-Read Questions', desc: 'Automatically reads questions aloud' },
                ].map(option => (
                  <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-700">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                    <button
                      onClick={() => onUpdateAccessibility({
                        ...progress.accessibility,
                        [option.key]: !progress.accessibility[option.key as keyof AccessibilitySettings]
                      })}
                      className={`w-12 h-6 rounded-full transition ${
                        progress.accessibility[option.key as keyof AccessibilitySettings]
                          ? 'bg-indigo-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        progress.accessibility[option.key as keyof AccessibilitySettings]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Speech Rate */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <Volume2 size={16} className="inline mr-2" />
                  Speech Rate: {progress.accessibility.speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={progress.accessibility.speechRate}
                  onChange={(e) => onUpdateAccessibility({
                    ...progress.accessibility,
                    speechRate: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Lock size={20} className="text-green-500" />
                Privacy & Data
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                All data is stored locally on this device only. No information is sent to external servers.
              </p>
              <button className="w-full py-3 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition">
                Reset All Progress
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
