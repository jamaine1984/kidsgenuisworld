import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FlaskConical, Lightbulb, Star, Sparkles, Volume2, X, Check } from 'lucide-react';
import { ScienceExperiment } from '../types';
import { speak, speakAsync, speakCorrect, speakWrong, speakQuestion, playSuccess, playWrongBuzzer } from '../services/audioService';

interface ScienceRoomProps {
  level: number; // 1-7 corresponds to grade levels
  onBack: () => void;
  onReward: () => void;
}

// Science experiments/questions organized by grade level
export const SCIENCE_EXPERIMENTS: (ScienceExperiment & { gradeLevel: number })[] = [
  // PRE-K (Level 1) - Very simple observations
  {
    id: 'pk1', gradeLevel: 1, title: 'Day and Night',
    question: 'When is it dark outside?',
    hypothesis: ['At night', 'In the morning', 'At lunchtime', 'After breakfast'],
    correctAnswer: 0,
    explanation: 'It gets dark at night when the sun goes down!',
    funFact: 'The sun doesn\'t actually go away - Earth just spins around!',
    category: 'nature', icon: '🌙'
  },
  {
    id: 'pk2', gradeLevel: 1, title: 'Hot and Cold',
    question: 'Which one is cold?',
    hypothesis: ['Ice cream', 'Soup', 'Pizza', 'Toast'],
    correctAnswer: 0,
    explanation: 'Ice cream is cold! That\'s why it feels good on a hot day!',
    funFact: 'Ice cream was invented over 2000 years ago in China!',
    category: 'chemistry', icon: '🍦'
  },
  {
    id: 'pk3', gradeLevel: 1, title: 'Living Things',
    question: 'Which one is alive?',
    hypothesis: ['A puppy', 'A toy car', 'A rock', 'A cup'],
    correctAnswer: 0,
    explanation: 'A puppy is alive! Living things can move, eat, and grow.',
    funFact: 'Dogs have been friends with humans for over 15,000 years!',
    category: 'biology', icon: '🐕'
  },
  {
    id: 'pk4', gradeLevel: 1, title: 'Colors',
    question: 'What color are most leaves?',
    hypothesis: ['Green', 'Blue', 'Red', 'Purple'],
    correctAnswer: 0,
    explanation: 'Most leaves are green because of something called chlorophyll!',
    funFact: 'Leaves can turn red, orange, or yellow in the fall!',
    category: 'nature', icon: '🍃'
  },

  // KINDERGARTEN (Level 2)
  {
    id: 'k1', gradeLevel: 2, title: 'Plant Growth',
    question: 'What do plants need to grow?',
    hypothesis: ['Only water', 'Sunlight, water, and soil', 'Just air', 'Only darkness'],
    correctAnswer: 1,
    explanation: 'Plants need sunlight to make food, water to drink, and soil for nutrients!',
    funFact: 'The tallest tree in the world is a redwood named Hyperion - it\'s taller than the Statue of Liberty!',
    category: 'biology', icon: '🌱'
  },
  {
    id: 'k2', gradeLevel: 2, title: 'Animal Homes',
    question: 'Where do fish live?',
    hypothesis: ['In trees', 'In water', 'In the desert', 'In caves'],
    correctAnswer: 1,
    explanation: 'Fish have gills that let them breathe underwater!',
    funFact: 'Some fish can live in both fresh water and salt water!',
    category: 'biology', icon: '🐟'
  },
  {
    id: 'k3', gradeLevel: 2, title: 'Weather',
    question: 'What falls from clouds?',
    hypothesis: ['Stars', 'Raindrops', 'Butterflies', 'Leaves'],
    correctAnswer: 1,
    explanation: 'Raindrops fall from clouds when they get too heavy!',
    funFact: 'A single cloud can weigh more than a million pounds!',
    category: 'nature', icon: '🌧️'
  },
  {
    id: 'k4', gradeLevel: 2, title: 'The Sun',
    question: 'What does the sun give us?',
    hypothesis: ['Darkness', 'Light and warmth', 'Snow', 'Nighttime'],
    correctAnswer: 1,
    explanation: 'The sun gives us light and warmth every day!',
    funFact: 'The sun is a star! It\'s so big that 1 million Earths could fit inside!',
    category: 'space', icon: '☀️'
  },

  // FIRST GRADE (Level 3)
  {
    id: '1g1', gradeLevel: 3, title: 'Body Parts',
    question: 'What organ pumps blood through your body?',
    hypothesis: ['Brain', 'Lungs', 'Heart', 'Stomach'],
    correctAnswer: 2,
    explanation: 'Your heart beats about 100,000 times every day!',
    funFact: 'Your heart is about the size of your fist!',
    category: 'biology', icon: '❤️'
  },
  {
    id: '1g2', gradeLevel: 3, title: 'Magnets',
    question: 'What do magnets attract?',
    hypothesis: ['Wood', 'Iron and steel', 'Plastic', 'Glass'],
    correctAnswer: 1,
    explanation: 'Magnets have a special force that attracts metals like iron!',
    funFact: 'Earth itself is a giant magnet - that\'s how compasses work!',
    category: 'physics', icon: '🧲'
  },
  {
    id: '1g3', gradeLevel: 3, title: 'Seasons',
    question: 'How many seasons are there in a year?',
    hypothesis: ['Two', 'Three', 'Four', 'Five'],
    correctAnswer: 2,
    explanation: 'There are four seasons: spring, summer, fall, and winter!',
    funFact: 'When it\'s summer here, it\'s winter on the other side of Earth!',
    category: 'nature', icon: '🍂'
  },
  {
    id: '1g4', gradeLevel: 3, title: 'Dinosaurs',
    question: 'Dinosaurs lived long ago. Are they still alive today?',
    hypothesis: ['Yes, they are everywhere', 'No, they are extinct', 'Yes, in zoos', 'Maybe'],
    correctAnswer: 1,
    explanation: 'Dinosaurs went extinct about 65 million years ago!',
    funFact: 'Birds are actually related to dinosaurs - they evolved from them!',
    category: 'biology', icon: '🦕'
  },

  // SECOND GRADE (Level 4)
  {
    id: '2g1', gradeLevel: 4, title: 'Gravity',
    question: 'What makes things fall down?',
    hypothesis: ['Wind', 'Gravity', 'Magnets', 'Sound'],
    correctAnswer: 1,
    explanation: 'Gravity is an invisible force that pulls everything toward Earth!',
    funFact: 'On the Moon, you would weigh 6 times less because gravity is weaker!',
    category: 'physics', icon: '🍎'
  },
  {
    id: '2g2', gradeLevel: 4, title: 'States of Matter',
    question: 'What happens to water when it freezes?',
    hypothesis: ['It stays liquid', 'It becomes solid ice', 'It becomes gas', 'It disappears'],
    correctAnswer: 1,
    explanation: 'When water gets very cold, it turns into solid ice!',
    funFact: 'Ice is less dense than water - that\'s why ice cubes float!',
    category: 'chemistry', icon: '🧊'
  },
  {
    id: '2g3', gradeLevel: 4, title: 'The Moon',
    question: 'Why does the Moon change shape?',
    hypothesis: ['It\'s magic', 'We see different parts lit by Sun', 'It actually changes', 'Clouds cover it'],
    correctAnswer: 1,
    explanation: 'The Moon doesn\'t change - we just see different parts lit up by the Sun!',
    funFact: 'Astronauts have walked on the Moon! They left footprints that are still there!',
    category: 'space', icon: '🌙'
  },
  {
    id: '2g4', gradeLevel: 4, title: 'Sound',
    question: 'How does sound travel?',
    hypothesis: ['Through light', 'Through vibrations in air', 'Through colors', 'Through smells'],
    correctAnswer: 1,
    explanation: 'Sound travels as vibrations through the air to our ears!',
    funFact: 'Sound cannot travel in space because there\'s no air!',
    category: 'physics', icon: '🔊'
  },

  // THIRD GRADE (Level 5)
  {
    id: '3g1', gradeLevel: 5, title: 'Light',
    question: 'What happens when light hits a mirror?',
    hypothesis: ['It disappears', 'It bounces back', 'It gets cold', 'It makes sound'],
    correctAnswer: 1,
    explanation: 'Light reflects off mirrors - that\'s how you see yourself!',
    funFact: 'Light travels so fast it could go around Earth 7.5 times in one second!',
    category: 'physics', icon: '🔦'
  },
  {
    id: '3g2', gradeLevel: 5, title: 'Fossils',
    question: 'What are fossils?',
    hypothesis: ['Living animals', 'Remains of ancient life preserved in rock', 'Types of plants', 'Colorful stones'],
    correctAnswer: 1,
    explanation: 'Fossils are the preserved remains or traces of ancient plants and animals!',
    funFact: 'The oldest fossils are over 3.5 billion years old!',
    category: 'biology', icon: '🦴'
  },
  {
    id: '3g3', gradeLevel: 5, title: 'Planets',
    question: 'Which planet has rings?',
    hypothesis: ['Mars', 'Earth', 'Saturn', 'Mercury'],
    correctAnswer: 2,
    explanation: 'Saturn has beautiful rings made of ice and rock!',
    funFact: 'Saturn is so light it would float if you put it in a giant bathtub!',
    category: 'space', icon: '🪐'
  },
  {
    id: '3g4', gradeLevel: 5, title: 'Volcanoes',
    question: 'What comes out of a volcano when it erupts?',
    hypothesis: ['Water', 'Lava', 'Snow', 'Sand'],
    correctAnswer: 1,
    explanation: 'Hot melted rock called lava comes out of volcanoes!',
    funFact: 'There are volcanoes on other planets too, including Mars!',
    category: 'nature', icon: '🌋'
  },

  // FOURTH GRADE (Level 6)
  {
    id: '4g1', gradeLevel: 6, title: 'Electricity',
    question: 'What do we need for electricity to flow?',
    hypothesis: ['An open circuit', 'A closed circuit', 'Magnets', 'Water'],
    correctAnswer: 1,
    explanation: 'Electricity needs a complete, closed path (circuit) to flow!',
    funFact: 'Benjamin Franklin discovered that lightning is electricity!',
    category: 'physics', icon: '⚡'
  },
  {
    id: '4g2', gradeLevel: 6, title: 'Ecosystems',
    question: 'What is a food chain?',
    hypothesis: ['A chain made of food', 'How energy passes from one living thing to another', 'A type of recipe', 'A restaurant'],
    correctAnswer: 1,
    explanation: 'A food chain shows how energy moves from plants to animals that eat them!',
    funFact: 'The sun is the source of almost all energy in food chains!',
    category: 'biology', icon: '🔗'
  },
  {
    id: '4g3', gradeLevel: 6, title: 'Stars',
    question: 'What are stars made of?',
    hypothesis: ['Rock', 'Ice', 'Hot gas', 'Diamond'],
    correctAnswer: 2,
    explanation: 'Stars are giant balls of hot, glowing gas - mostly hydrogen and helium!',
    funFact: 'There are more stars in the universe than grains of sand on Earth!',
    category: 'space', icon: '⭐'
  },
  {
    id: '4g4', gradeLevel: 6, title: 'Weathering',
    question: 'What causes rocks to break down over time?',
    hypothesis: ['Nothing', 'Wind, water, and temperature changes', 'Magic', 'Gravity only'],
    correctAnswer: 1,
    explanation: 'Weathering breaks down rocks through wind, water, ice, and temperature!',
    funFact: 'The Grand Canyon was formed by millions of years of weathering!',
    category: 'nature', icon: '🏔️'
  },

  // FIFTH GRADE (Level 7)
  {
    id: '5g1', gradeLevel: 7, title: 'Photosynthesis',
    question: 'What is photosynthesis?',
    hypothesis: ['How animals breathe', 'How plants make food using sunlight', 'A type of camera', 'How we see colors'],
    correctAnswer: 1,
    explanation: 'Photosynthesis is how plants use sunlight, water, and CO2 to make food!',
    funFact: 'Plants produce the oxygen we breathe through photosynthesis!',
    category: 'biology', icon: '🌿'
  },
  {
    id: '5g2', gradeLevel: 7, title: 'Atoms',
    question: 'What are all things made of?',
    hypothesis: ['Just water', 'Tiny particles called atoms', 'Only air', 'Magic'],
    correctAnswer: 1,
    explanation: 'Everything in the universe is made of tiny particles called atoms!',
    funFact: 'Atoms are so small that millions of them fit on the head of a pin!',
    category: 'chemistry', icon: '⚛️'
  },
  {
    id: '5g3', gradeLevel: 7, title: 'Solar System',
    question: 'What is at the center of our solar system?',
    hypothesis: ['Earth', 'The Moon', 'The Sun', 'Jupiter'],
    correctAnswer: 2,
    explanation: 'The Sun is at the center, and all planets orbit around it!',
    funFact: 'It takes light 8 minutes to travel from the Sun to Earth!',
    category: 'space', icon: '🌞'
  },
  {
    id: '5g4', gradeLevel: 7, title: 'Human Body Systems',
    question: 'Which system helps you digest food?',
    hypothesis: ['Nervous system', 'Digestive system', 'Skeletal system', 'Muscular system'],
    correctAnswer: 1,
    explanation: 'The digestive system breaks down food so your body can use it for energy!',
    funFact: 'Your digestive tract is about 30 feet long!',
    category: 'biology', icon: '🫀'
  },
  {
    id: '5g5', gradeLevel: 7, title: 'Forces',
    question: 'What happens when you push something?',
    hypothesis: ['Nothing', 'You apply a force to it', 'It gets warmer', 'It changes color'],
    correctAnswer: 1,
    explanation: 'A push or pull on an object is called a force!',
    funFact: 'Isaac Newton discovered the laws of motion over 300 years ago!',
    category: 'physics', icon: '💪'
  },
  {
    id: '5g6', gradeLevel: 7, title: 'Evolution',
    question: 'How do animals change over many generations?',
    hypothesis: ['They stay exactly the same', 'Through evolution and adaptation', 'By magic', 'They don\'t change'],
    correctAnswer: 1,
    explanation: 'Animals evolve over time, adapting to their environment!',
    funFact: 'All life on Earth shares a common ancestor from billions of years ago!',
    category: 'biology', icon: '🦎'
  },
];

export const ScienceRoom: React.FC<ScienceRoomProps> = ({ level, onBack, onReward }) => {
  // Filter experiments by grade level
  const availableExperiments = SCIENCE_EXPERIMENTS.filter(e => e.gradeLevel <= level);

  const [experiment, setExperiment] = useState<typeof SCIENCE_EXPERIMENTS[0] | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFunFact, setShowFunFact] = useState(false);
  const [score, setScore] = useState(0);
  const [coachTip, setCoachTip] = useState('');

  const scienceTip = useMemo(() => {
    if (level <= 2) return 'Look at the choices and think about the real world.';
    if (level <= 4) return 'Use what you have seen in nature, school, or home.';
    return 'Read carefully, then use the clue in the experiment title.';
  }, [level]);

  const teacherIntro = useMemo(() => {
    if (level <= 2) return 'Teacher says: Look at the choices and think about the world around you.';
    if (level <= 4) return 'Teacher says: Use what you have noticed in nature, home, and school.';
    return 'Teacher says: Read the science clue carefully, then choose the best answer.';
  }, [level]);

  const getNewExperiment = () => {
    const randomExp = availableExperiments[Math.floor(Math.random() * availableExperiments.length)];
    setExperiment(randomExp);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowFunFact(false);
    setCoachTip(scienceTip);

    void (async () => {
      await speakAsync(teacherIntro, 0.88, 1.03);
      await speakAsync(`${scienceTip} ${randomExp.question}`, 0.86, 1.02);
    })();
  };

  useEffect(() => {
    const startLesson = async () => {
      await speakAsync(`Welcome to the Science Lab. ${scienceTip}`);
      getNewExperiment();
    };
    void startLesson();
  }, [scienceTip]);

  const readQuestionAloud = () => {
    if (experiment) {
      speakQuestion(experiment.question);
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult || !experiment) return;

    setSelectedAnswer(index);
    const correct = index === experiment.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSuccess();
      setScore(s => s + 1);
      void speakCorrect(`That is right. ${experiment.explanation}`);
      setTimeout(() => {
        onReward();
        setShowFunFact(true);
      }, 2500);
    } else {
      playWrongBuzzer();
      void speakWrong(`Let us learn it together. ${experiment.explanation}`);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'biology': return 'from-green-400 to-emerald-500';
      case 'physics': return 'from-blue-400 to-indigo-500';
      case 'chemistry': return 'from-purple-400 to-pink-500';
      case 'nature': return 'from-yellow-400 to-orange-500';
      case 'space': return 'from-indigo-400 to-purple-600';
      default: return 'from-teal-400 to-cyan-500';
    }
  };

  if (!experiment) return null;

  return (
    <div className="w-full h-full bg-gradient-to-b from-emerald-400 via-teal-500 to-cyan-600 flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm">
        <button onClick={onBack} className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
          <ArrowLeft className="text-white" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <FlaskConical className="text-white" size={28} />
          <span className="text-2xl font-bold text-white drop-shadow">Science Lab</span>
        </div>
        <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full">
          <Star className="text-yellow-300 fill-yellow-300" size={20} />
          <span className="text-white font-bold">{score}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full">
          {/* Experiment Icon & Category */}
          <div className="text-center mb-4">
            <div className={`inline-block text-6xl p-4 rounded-2xl bg-gradient-to-br ${getCategoryColor(experiment.category)} shadow-lg animate-bounce`}>
              {experiment.icon}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(experiment.category)} text-white`}>
                {experiment.category}
              </span>
              <button
                onClick={readQuestionAloud}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                <Volume2 className="text-gray-600" size={16} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            {experiment.title}
          </h2>

          {/* Question */}
          <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl p-4 mb-4">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-teal-500 mb-2">Science Coach</div>
            <p className="text-sm font-semibold text-teal-900 mb-3">{coachTip}</p>
            <div className="flex items-start gap-2">
              <Lightbulb className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
              <p className="text-lg font-semibold text-gray-700">{experiment.question}</p>
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            {experiment.hypothesis.map((option, index) => {
              let buttonClass = 'bg-gray-100 hover:bg-gray-200 text-gray-700';

              if (showResult) {
                if (index === experiment.correctAnswer) {
                  buttonClass = 'bg-green-500 text-white';
                } else if (index === selectedAnswer) {
                  buttonClass = 'bg-red-400 text-white';
                } else {
                  buttonClass = 'bg-gray-200 text-gray-500';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`p-4 rounded-xl font-semibold transition-all transform hover:scale-102 flex items-center gap-3 ${buttonClass}`}
                >
                  <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Result Message */}
          {showResult && (
            <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-orange-100'} mb-4 flex items-start gap-3`}>
              {isCorrect ? (
                <Check className="text-green-600 flex-shrink-0" size={24} />
              ) : (
                <X className="text-orange-600 flex-shrink-0" size={24} />
              )}
              <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                {experiment.explanation}
              </p>
            </div>
          )}

          {/* Fun Fact */}
          {showFunFact && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl mb-4 animate-fade-in">
              <div className="flex items-start gap-2">
                <Sparkles className="text-purple-500 flex-shrink-0" size={20} />
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase mb-1">Fun Fact!</p>
                  <p className="text-gray-700">{experiment.funFact}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button
              onClick={getNewExperiment}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all transform hover:scale-105"
            >
              {isCorrect ? 'Next Experiment! 🔬' : 'Try Another! 🧪'}
            </button>
          )}

          {/* Progress indicator */}
          <div className="mt-4 text-center text-sm text-gray-500">
            {availableExperiments.length} experiments available for your grade level
          </div>
        </div>
      </div>
    </div>
  );
};
