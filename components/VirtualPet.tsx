import React, { useState, useEffect } from 'react';
import { Heart, Utensils, Sparkles, Star, Gift } from 'lucide-react';
import { VirtualPet, PetType, PetMood } from '../types';
import { speak } from '../services/audioService';

interface VirtualPetProps {
  pet: VirtualPet;
  onUpdatePet: (pet: VirtualPet) => void;
  onClose: () => void;
}

const PET_EMOJIS: { [key in PetType]: { [key in PetMood]: string } } = {
  [PetType.DOG]: {
    [PetMood.HAPPY]: '🐕',
    [PetMood.EXCITED]: '🐶',
    [PetMood.SLEEPY]: '🐕‍🦺',
    [PetMood.HUNGRY]: '🐩',
    [PetMood.PROUD]: '🦮',
  },
  [PetType.CAT]: {
    [PetMood.HAPPY]: '🐱',
    [PetMood.EXCITED]: '😺',
    [PetMood.SLEEPY]: '😿',
    [PetMood.HUNGRY]: '🙀',
    [PetMood.PROUD]: '😸',
  },
  [PetType.BUNNY]: {
    [PetMood.HAPPY]: '🐰',
    [PetMood.EXCITED]: '🐇',
    [PetMood.SLEEPY]: '🐰',
    [PetMood.HUNGRY]: '🐇',
    [PetMood.PROUD]: '🐰',
  },
  [PetType.DRAGON]: {
    [PetMood.HAPPY]: '🐲',
    [PetMood.EXCITED]: '🐉',
    [PetMood.SLEEPY]: '🐲',
    [PetMood.HUNGRY]: '🔥',
    [PetMood.PROUD]: '🐉',
  },
  [PetType.UNICORN]: {
    [PetMood.HAPPY]: '🦄',
    [PetMood.EXCITED]: '🌈',
    [PetMood.SLEEPY]: '🦄',
    [PetMood.HUNGRY]: '🦄',
    [PetMood.PROUD]: '✨',
  },
  [PetType.ROBOT]: {
    [PetMood.HAPPY]: '🤖',
    [PetMood.EXCITED]: '🤖',
    [PetMood.SLEEPY]: '💤',
    [PetMood.HUNGRY]: '🔋',
    [PetMood.PROUD]: '🤖',
  },
};

const FOOD_ITEMS = [
  { emoji: '🍎', name: 'Apple', happiness: 5, hunger: 15 },
  { emoji: '🥕', name: 'Carrot', happiness: 3, hunger: 10 },
  { emoji: '🍪', name: 'Cookie', happiness: 15, hunger: 5 },
  { emoji: '🧁', name: 'Cupcake', happiness: 20, hunger: 8 },
  { emoji: '🍌', name: 'Banana', happiness: 8, hunger: 12 },
  { emoji: '🍓', name: 'Strawberry', happiness: 10, hunger: 8 },
];

const PET_SAYINGS: { [key in PetMood]: string[] } = {
  [PetMood.HAPPY]: ["I love learning with you!", "Let's play!", "You're doing great!", "Best friends forever!"],
  [PetMood.EXCITED]: ["WOW!", "This is amazing!", "I'm so excited!", "Let's go!"],
  [PetMood.SLEEPY]: ["*yawn* I'm tired...", "Zzz...", "Need a nap...", "So sleepy..."],
  [PetMood.HUNGRY]: ["I'm hungry!", "Feed me please!", "My tummy is rumbling!", "Snack time?"],
  [PetMood.PROUD]: ["You did it!", "I'm so proud of you!", "Champion!", "You're a star!"],
};

export const VirtualPetPanel: React.FC<VirtualPetProps> = ({ pet, onUpdatePet, onClose }) => {
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [petMessage, setPetMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    updateMood();
    const sayings = PET_SAYINGS[pet.mood];
    setPetMessage(sayings[Math.floor(Math.random() * sayings.length)]);
  }, [pet.mood]);

  const updateMood = () => {
    let newMood = PetMood.HAPPY;

    if (pet.hunger < 30) {
      newMood = PetMood.HUNGRY;
    } else if (pet.happiness < 30) {
      newMood = PetMood.SLEEPY;
    } else if (pet.happiness > 80) {
      newMood = PetMood.EXCITED;
    }

    if (newMood !== pet.mood) {
      onUpdatePet({ ...pet, mood: newMood });
    }
  };

  const feedPet = (food: typeof FOOD_ITEMS[0]) => {
    setIsAnimating(true);
    speak(`Yummy! ${pet.name} loves ${food.name}!`);

    const newPet = {
      ...pet,
      hunger: Math.min(100, pet.hunger + food.hunger),
      happiness: Math.min(100, pet.happiness + food.happiness),
      xp: pet.xp + 10,
    };

    // Check for level up
    const xpNeeded = newPet.level * 100;
    if (newPet.xp >= xpNeeded) {
      newPet.level = Math.min(50, newPet.level + 1);
      newPet.xp = newPet.xp - xpNeeded;
      speak(`${pet.name} grew to level ${newPet.level}!`);
    }

    onUpdatePet(newPet);
    setShowFoodMenu(false);

    setTimeout(() => setIsAnimating(false), 500);
  };

  const playWithPet = () => {
    setIsAnimating(true);
    speak(`${pet.name} is having so much fun!`);

    const newPet = {
      ...pet,
      happiness: Math.min(100, pet.happiness + 15),
      hunger: Math.max(0, pet.hunger - 5),
      xp: pet.xp + 5,
    };

    onUpdatePet(newPet);
    setPetMessage("Wheee! That was fun!");

    setTimeout(() => setIsAnimating(false), 500);
  };

  const getXPProgress = () => {
    const xpNeeded = pet.level * 100;
    return (pet.xp / xpNeeded) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-100 to-pink-100 rounded-3xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>

        {/* Pet Info */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-purple-800">{pet.name}</h2>
          <p className="text-purple-600">Level {pet.level} {pet.type}</p>
        </div>

        {/* Pet Display */}
        <div className="relative mb-6">
          {/* Pet Avatar */}
          <div className={`text-9xl text-center transition-transform ${isAnimating ? 'animate-bounce' : 'animate-float'}`}>
            {PET_EMOJIS[pet.type][pet.mood]}
          </div>

          {/* Speech Bubble */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg max-w-[200px]">
            <p className="text-sm text-gray-700 text-center">{petMessage}</p>
          </div>

          {/* Floating hearts when happy */}
          {pet.mood === PetMood.EXCITED && (
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-0 left-1/4 text-2xl animate-float-up">💖</span>
              <span className="absolute top-0 right-1/4 text-2xl animate-float-up animation-delay-300">💕</span>
              <span className="absolute top-0 left-1/2 text-2xl animate-float-up animation-delay-600">✨</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          {/* Happiness */}
          <div className="flex items-center gap-3">
            <Heart className="text-pink-500" size={24} />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-red-500 rounded-full transition-all"
                  style={{ width: `${pet.happiness}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-gray-600">{pet.happiness}%</span>
          </div>

          {/* Hunger */}
          <div className="flex items-center gap-3">
            <Utensils className="text-orange-500" size={24} />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full transition-all"
                  style={{ width: `${pet.hunger}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-gray-600">{pet.hunger}%</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-3">
            <Star className="text-yellow-500 fill-yellow-500" size={24} />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
                  style={{ width: `${getXPProgress()}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-gray-600">{pet.xp}/{pet.level * 100}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {showFoodMenu ? (
          <div className="space-y-3">
            <p className="text-center font-semibold text-gray-700 mb-2">Choose food:</p>
            <div className="grid grid-cols-3 gap-2">
              {FOOD_ITEMS.map(food => (
                <button
                  key={food.name}
                  onClick={() => feedPet(food)}
                  className="p-3 bg-white rounded-xl shadow hover:shadow-lg transition-all transform hover:scale-105 flex flex-col items-center"
                >
                  <span className="text-3xl">{food.emoji}</span>
                  <span className="text-xs text-gray-600">{food.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFoodMenu(false)}
              className="w-full py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setShowFoodMenu(true)}
              className="flex-1 py-4 bg-gradient-to-r from-orange-400 to-yellow-500 text-white font-bold rounded-xl shadow-lg hover:from-orange-500 hover:to-yellow-600 transition flex items-center justify-center gap-2"
            >
              <Utensils size={20} />
              Feed
            </button>
            <button
              onClick={playWithPet}
              className="flex-1 py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-500 hover:to-pink-600 transition flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              Play
            </button>
          </div>
        )}

        {/* Accessories/Customization hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🎁 Keep learning to unlock accessories for {pet.name}!
          </p>
        </div>
      </div>
    </div>
  );
};

// Pet Selection Component for new players
export const PetSelection: React.FC<{ onSelect: (pet: VirtualPet) => void }> = ({ onSelect }) => {
  const [selectedType, setSelectedType] = useState<PetType | null>(null);
  const [petName, setPetName] = useState('');

  const petTypes = [
    { type: PetType.DOG, emoji: '🐶', name: 'Puppy', desc: 'Loyal and playful!' },
    { type: PetType.CAT, emoji: '🐱', name: 'Kitty', desc: 'Clever and curious!' },
    { type: PetType.BUNNY, emoji: '🐰', name: 'Bunny', desc: 'Soft and sweet!' },
    { type: PetType.DRAGON, emoji: '🐲', name: 'Dragon', desc: 'Brave and magical!' },
    { type: PetType.UNICORN, emoji: '🦄', name: 'Unicorn', desc: 'Magical and sparkly!' },
    { type: PetType.ROBOT, emoji: '🤖', name: 'Robot', desc: 'Smart and helpful!' },
  ];

  const createPet = () => {
    if (!selectedType || !petName.trim()) return;

    const newPet: VirtualPet = {
      type: selectedType,
      name: petName.trim(),
      level: 1,
      xp: 0,
      mood: PetMood.HAPPY,
      hunger: 80,
      happiness: 80,
      lastFed: Date.now(),
      accessories: [],
      unlockedColors: ['default'],
      currentColor: 'default',
    };

    speak(`Welcome, ${petName}! Let's learn and play together!`);
    onSelect(newPet);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-500 to-pink-600 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-2">
          Choose Your Learning Buddy! 🌟
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Your pet will grow as you learn!
        </p>

        {/* Pet Selection Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {petTypes.map(p => (
            <button
              key={p.type}
              onClick={() => setSelectedType(p.type)}
              className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                selectedType === p.type
                  ? 'bg-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 hover:bg-purple-100'
              }`}
            >
              <span className="text-4xl block mb-1">{p.emoji}</span>
              <span className="font-bold text-sm">{p.name}</span>
              <span className={`text-xs block ${selectedType === p.type ? 'text-purple-200' : 'text-gray-500'}`}>
                {p.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Name Input */}
        {selectedType && (
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Name your {selectedType}:
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Enter a name..."
              maxLength={12}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
            />
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={createPet}
          disabled={!selectedType || !petName.trim()}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Gift className="inline mr-2" size={24} />
          Let's Go!
        </button>
      </div>
    </div>
  );
};
