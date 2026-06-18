import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, FlaskConical, Lightbulb, Star, Sparkles, Volume2, X, Check } from 'lucide-react';
import { ScienceExperiment } from '../types';
import { speakCorrect, speakWrong, playSuccess, playWrongBuzzer, speakMultipleChoiceQuestion } from '../services/audioService';
import { pickDailyItem } from '../services/dailyRotation';

interface ScienceRoomProps {
  level: number; // 1-7 corresponds to grade levels
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
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
  {
    id: 'pk5', gradeLevel: 1, title: 'Sink or Float',
    question: 'Which object is most likely to float in water?',
    hypothesis: ['A leaf', 'A rock', 'A coin', 'A key'],
    correctAnswer: 0,
    explanation: 'A leaf is light and can float on top of water.',
    funFact: 'Scientists test ideas by trying them and watching carefully.',
    category: 'physics', icon: 'leaf'
  },
  {
    id: 'pk6', gradeLevel: 1, title: 'Animal Sounds',
    question: 'Which animal says moo?',
    hypothesis: ['Cow', 'Duck', 'Cat', 'Horse'],
    correctAnswer: 0,
    explanation: 'A cow says moo. Listening is one way scientists observe animals.',
    funFact: 'Animals use sounds to communicate with each other.',
    category: 'biology', icon: 'cow'
  },
  {
    id: 'k5', gradeLevel: 2, title: 'Five Senses',
    question: 'Which sense do you use to smell a flower?',
    hypothesis: ['Sight', 'Hearing', 'Smell', 'Touch'],
    correctAnswer: 2,
    explanation: 'Your nose helps you smell flowers, food, and many other things.',
    funFact: 'Smell can help people notice danger, like smoke.',
    category: 'biology', icon: 'nose'
  },
  {
    id: 'k6', gradeLevel: 2, title: 'Weather Clothes',
    question: 'What should you wear when it is rainy?',
    hypothesis: ['Raincoat', 'Swimsuit', 'Sandals only', 'Party hat'],
    correctAnswer: 0,
    explanation: 'A raincoat helps keep your body dry in wet weather.',
    funFact: 'Meteorologists study weather so people can plan ahead.',
    category: 'nature', icon: 'rain'
  },
  {
    id: '1g5', gradeLevel: 3, title: 'Plant Parts',
    question: 'Which part of a plant takes in water from soil?',
    hypothesis: ['Flower', 'Roots', 'Petals', 'Fruit'],
    correctAnswer: 1,
    explanation: 'Roots take in water and help hold the plant in the ground.',
    funFact: 'Some roots, like carrots, store food for the plant.',
    category: 'biology', icon: 'root'
  },
  {
    id: '1g6', gradeLevel: 3, title: 'Push and Pull',
    question: 'Which action is a pull?',
    hypothesis: ['Dragging a wagon toward you', 'Kicking a ball away', 'Dropping a toy', 'Watching a kite'],
    correctAnswer: 0,
    explanation: 'A pull moves something closer to you.',
    funFact: 'Pushes and pulls are forces that can change motion.',
    category: 'physics', icon: 'force'
  },
  {
    id: '2g5', gradeLevel: 4, title: 'Water Cycle',
    question: 'What happens when the sun warms water and it rises into the air?',
    hypothesis: ['Evaporation', 'Freezing', 'Melting', 'Magnetism'],
    correctAnswer: 0,
    explanation: 'Evaporation is when liquid water changes into water vapor.',
    funFact: 'The water cycle keeps moving water around Earth.',
    category: 'nature', icon: 'water'
  },
  {
    id: '2g6', gradeLevel: 4, title: 'Simple Machines',
    question: 'Which tool is a simple machine called a lever?',
    hypothesis: ['Seesaw', 'Blanket', 'Sponge', 'Balloon'],
    correctAnswer: 0,
    explanation: 'A seesaw is a lever because it turns around a fixed point.',
    funFact: 'Simple machines help people do work with less effort.',
    category: 'physics', icon: 'lever'
  },
  {
    id: '3g5', gradeLevel: 5, title: 'Food Webs',
    question: 'What starts most food chains?',
    hypothesis: ['Plants making food from sunlight', 'Rocks rolling downhill', 'Clouds making thunder', 'Fish swimming fast'],
    correctAnswer: 0,
    explanation: 'Plants use sunlight to make food, then animals get energy by eating plants or other animals.',
    funFact: 'A food web shows many connected food chains.',
    category: 'biology', icon: 'web'
  },
  {
    id: '3g6', gradeLevel: 5, title: 'Balanced Forces',
    question: 'If two teams pull a rope equally in opposite directions, what happens?',
    hypothesis: ['The rope stays mostly still', 'The rope flies away', 'The rope melts', 'The rope turns invisible'],
    correctAnswer: 0,
    explanation: 'Equal forces in opposite directions are balanced, so motion may not change.',
    funFact: 'Engineers think about balanced forces when building bridges.',
    category: 'physics', icon: 'balance'
  },
  {
    id: '4g5', gradeLevel: 6, title: 'Inherited Traits',
    question: 'Which trait can be inherited from parents?',
    hypothesis: ['Eye color', 'A favorite song', 'A learned dance', 'A new haircut'],
    correctAnswer: 0,
    explanation: 'Eye color can be inherited because genes pass traits from parents to children.',
    funFact: 'Some traits are inherited, and some are learned from experience.',
    category: 'biology', icon: 'dna'
  },
  {
    id: '4g6', gradeLevel: 6, title: 'Energy Transfer',
    question: 'What happens when a metal spoon sits in hot soup?',
    hypothesis: ['Heat moves into the spoon', 'The spoon makes snow', 'The spoon becomes a magnet', 'Nothing can happen'],
    correctAnswer: 0,
    explanation: 'Heat can transfer from hot soup into the metal spoon.',
    funFact: 'Metal conducts heat better than wood or plastic.',
    category: 'physics', icon: 'heat'
  },
  {
    id: '5g7', gradeLevel: 7, title: 'Earth Systems',
    question: 'Which system includes oceans, rivers, lakes, and ice?',
    hypothesis: ['Hydrosphere', 'Biosphere', 'Geosphere', 'Atmosphere'],
    correctAnswer: 0,
    explanation: 'The hydrosphere includes water on Earth in liquid, solid, and vapor forms.',
    funFact: 'Earth systems interact, so a change in one system can affect another.',
    category: 'nature', icon: 'earth'
  },
  {
    id: '5g8', gradeLevel: 7, title: 'Mixtures and Solutions',
    question: 'What happens when salt dissolves in water?',
    hypothesis: ['It forms a solution', 'It becomes a plant', 'It turns into glass', 'It disappears from the universe'],
    correctAnswer: 0,
    explanation: 'Salt mixes evenly with water to form a solution.',
    funFact: 'A solution can look clear even when something is dissolved in it.',
    category: 'chemistry', icon: 'solution'
  },
  { id: 'k7', gradeLevel: 2, title: 'Sink or Float Test', question: 'Which object would probably sink in water?', hypothesis: ['Metal spoon', 'Feather', 'Cork', 'Leaf'], correctAnswer: 0, explanation: 'A metal spoon is heavy for its size, so it usually sinks.', funFact: 'Scientists compare objects by testing them in the same water.', category: 'physics', icon: 'spoon' },
  { id: 'k8', gradeLevel: 2, title: 'Plant Needs', question: 'What helps a seed start growing?', hypothesis: ['Water', 'A blanket', 'A pencil', 'A shoe'], correctAnswer: 0, explanation: 'Seeds need water to begin sprouting.', funFact: 'A sprout is a young plant just starting to grow.', category: 'biology', icon: 'seed' },
  { id: 'k9', gradeLevel: 2, title: 'Animal Coverings', question: 'Which animal covering helps a bird fly?', hypothesis: ['Feathers', 'Shell', 'Scales', 'Fur'], correctAnswer: 0, explanation: 'Bird feathers help with flying and staying warm.', funFact: 'Feathers can be light, strong, and waterproof.', category: 'biology', icon: 'feather' },
  { id: 'k10', gradeLevel: 2, title: 'Shadow Clue', question: 'What makes a shadow?', hypothesis: ['An object blocking light', 'A loud sound', 'A cold snack', 'A soft pillow'], correctAnswer: 0, explanation: 'A shadow forms when something blocks light.', funFact: 'Your shadow can look longer when the sun is low.', category: 'physics', icon: 'shadow' },
  { id: 'k11', gradeLevel: 2, title: 'Weather Tool', question: 'What tool tells temperature?', hypothesis: ['Thermometer', 'Map', 'Paintbrush', 'Drum'], correctAnswer: 0, explanation: 'A thermometer measures how hot or cold something is.', funFact: 'Weather scientists use tools to collect data.', category: 'nature', icon: 'thermometer' },
  { id: 'k12', gradeLevel: 2, title: 'Day Sky', question: 'What do we usually see in the sky during the day?', hypothesis: ['Sun', 'Flashlight', 'Backpack', 'Pencil'], correctAnswer: 0, explanation: 'The sun lights the day sky.', funFact: 'The sun is the closest star to Earth.', category: 'space', icon: 'sun' },
  { id: 'k13', gradeLevel: 2, title: 'Material Match', question: 'Which material is usually soft?', hypothesis: ['Cotton', 'Brick', 'Rock', 'Coin'], correctAnswer: 0, explanation: 'Cotton is usually soft and bendable.', funFact: 'Engineers choose materials based on what they need them to do.', category: 'chemistry', icon: 'cotton' },
  { id: 'k14', gradeLevel: 2, title: 'Baby Animal', question: 'What is a baby frog called?', hypothesis: ['Tadpole', 'Cub', 'Calf', 'Chick'], correctAnswer: 0, explanation: 'A baby frog is called a tadpole.', funFact: 'Tadpoles change as they grow into frogs.', category: 'biology', icon: 'tadpole' },
  { id: 'k15', gradeLevel: 2, title: 'Healthy Body', question: 'What does your body need every day?', hypothesis: ['Water', 'Only candy', 'No sleep', 'Only toys'], correctAnswer: 0, explanation: 'Your body needs water every day to stay healthy.', funFact: 'Water helps move nutrients through your body.', category: 'biology', icon: 'water-drop' },
  { id: 'k16', gradeLevel: 2, title: 'Magnet Try', question: 'Which object might a magnet pick up?', hypothesis: ['Paper clip', 'Banana', 'Wood block', 'Rubber ball'], correctAnswer: 0, explanation: 'A paper clip is usually made of steel, and magnets attract some metals.', funFact: 'Magnets can pull without touching.', category: 'physics', icon: 'magnet' },
  { id: '1g7', gradeLevel: 3, title: 'Life Cycle', question: 'What comes after a caterpillar in the butterfly life cycle?', hypothesis: ['Chrysalis', 'Rock', 'Cloud', 'Fish'], correctAnswer: 0, explanation: 'A caterpillar forms a chrysalis before becoming a butterfly.', funFact: 'This kind of big body change is called metamorphosis.', category: 'biology', icon: 'butterfly' },
  { id: '1g8', gradeLevel: 3, title: 'Sound Vibrations', question: 'What causes sound?', hypothesis: ['Vibrations', 'Stillness', 'Darkness', 'Smell'], correctAnswer: 0, explanation: 'Sound starts when something vibrates.', funFact: 'Your vocal cords vibrate when you talk.', category: 'physics', icon: 'sound-wave' },
  { id: '1g9', gradeLevel: 3, title: 'Weather Data', question: 'If the sky is gray and drops are falling, what weather is happening?', hypothesis: ['Rain', 'Snow only', 'Sunny', 'Windless'], correctAnswer: 0, explanation: 'Gray clouds with falling drops usually mean rain.', funFact: 'Weather observations help us make predictions.', category: 'nature', icon: 'rain-cloud' },
  { id: '1g10', gradeLevel: 3, title: 'Animal Habitat', question: 'Which habitat is best for a fish?', hypothesis: ['Pond', 'Desert sand', 'Tree branch', 'Sidewalk'], correctAnswer: 0, explanation: 'A fish needs water, so a pond is a good habitat.', funFact: 'A habitat gives living things what they need to survive.', category: 'biology', icon: 'pond' },
  { id: '1g11', gradeLevel: 3, title: 'Light Source', question: 'Which object makes its own light?', hypothesis: ['Lamp', 'Mirror', 'Book', 'Chair'], correctAnswer: 0, explanation: 'A lamp is a light source because it makes light.', funFact: 'A mirror reflects light but does not make its own.', category: 'physics', icon: 'lamp' },
  { id: '1g12', gradeLevel: 3, title: 'Matter Sort', question: 'Which one is a liquid?', hypothesis: ['Juice', 'Rock', 'Pencil', 'Toy car'], correctAnswer: 0, explanation: 'Juice is a liquid because it flows and takes the shape of its container.', funFact: 'Matter can be solid, liquid, or gas.', category: 'chemistry', icon: 'juice' },
  { id: '1g13', gradeLevel: 3, title: 'Needs of Animals', question: 'What do animals need to survive?', hypothesis: ['Food, water, and shelter', 'Only games', 'Only rocks', 'Only music'], correctAnswer: 0, explanation: 'Animals need food, water, shelter, and space.', funFact: 'Different animals meet their needs in different habitats.', category: 'biology', icon: 'shelter' },
  { id: '1g14', gradeLevel: 3, title: 'Force Change', question: 'What can a push do to a ball?', hypothesis: ['Make it move', 'Make it invisible', 'Turn it into water', 'Stop time'], correctAnswer: 0, explanation: 'A push can make a ball start moving or change direction.', funFact: 'Forces can change motion.', category: 'physics', icon: 'ball' },
  { id: '1g15', gradeLevel: 3, title: 'Earth Materials', question: 'Which material comes from Earth?', hypothesis: ['Soil', 'Cartoon', 'Song', 'Number'], correctAnswer: 0, explanation: 'Soil is an Earth material made from tiny rock pieces and living matter.', funFact: 'Plants grow in soil because it can hold water and nutrients.', category: 'nature', icon: 'soil' },
  { id: '1g16', gradeLevel: 3, title: 'Body System', question: 'Which body part helps you breathe?', hypothesis: ['Lungs', 'Knee', 'Hair', 'Elbow'], correctAnswer: 0, explanation: 'Your lungs help your body take in oxygen.', funFact: 'Your chest moves when your lungs fill with air.', category: 'biology', icon: 'lungs' },
  { id: '2g7', gradeLevel: 4, title: 'Erosion', question: 'What can slowly move sand or soil from one place to another?', hypothesis: ['Wind and water', 'A quiet book', 'A pencil mark', 'A shadow'], correctAnswer: 0, explanation: 'Wind and water can move Earth materials. That is part of erosion.', funFact: 'Erosion can shape beaches, rivers, and canyons.', category: 'nature', icon: 'erosion' },
  { id: '2g8', gradeLevel: 4, title: 'Pollination', question: 'What can bees help flowers do?', hypothesis: ['Make seeds', 'Turn into rocks', 'Freeze water', 'Make thunder'], correctAnswer: 0, explanation: 'Bees can move pollen, which helps some plants make seeds.', funFact: 'Pollinators are important for many fruits and flowers.', category: 'biology', icon: 'bee' },
  { id: '2g9', gradeLevel: 4, title: 'Magnetic Poles', question: 'What can happen when two magnet poles are the same?', hypothesis: ['They push apart', 'They become water', 'They disappear', 'They make leaves'], correctAnswer: 0, explanation: 'Like poles on magnets repel, or push apart.', funFact: 'Opposite magnet poles attract each other.', category: 'physics', icon: 'poles' },
  { id: '2g10', gradeLevel: 4, title: 'Cloud Types', question: 'What are clouds made of?', hypothesis: ['Tiny water droplets or ice crystals', 'Cotton candy', 'Smoke only', 'Paper pieces'], correctAnswer: 0, explanation: 'Clouds are made of tiny drops of water or ice crystals in the air.', funFact: 'Different cloud shapes can give clues about weather.', category: 'nature', icon: 'cloud' },
  { id: '2g11', gradeLevel: 4, title: 'Food Chain', question: 'In a simple food chain, what do rabbits eat?', hypothesis: ['Plants', 'Rocks', 'Sunlight directly', 'Metal'], correctAnswer: 0, explanation: 'Rabbits eat plants, so they are plant-eating animals.', funFact: 'Energy moves through a food chain from one living thing to another.', category: 'biology', icon: 'rabbit' },
  { id: '2g12', gradeLevel: 4, title: 'Reversible Change', question: 'Which change can usually be reversed by warming?', hypothesis: ['Ice melting', 'Paper burning', 'Egg cooking', 'Wood rotting'], correctAnswer: 0, explanation: 'Ice can melt back into liquid water when it warms.', funFact: 'Some changes can be reversed, and some cannot.', category: 'chemistry', icon: 'ice' },
  { id: '2g13', gradeLevel: 4, title: 'Simple Circuit', question: 'What does a simple circuit need to light a bulb?', hypothesis: ['A complete path', 'A broken wire only', 'No battery', 'A paper cup'], correctAnswer: 0, explanation: 'Electricity needs a complete path to flow through the bulb.', funFact: 'A switch opens and closes a circuit.', category: 'physics', icon: 'circuit' },
  { id: '2g14', gradeLevel: 4, title: 'Compare Properties', question: 'Which property tells how heavy something is?', hypothesis: ['Weight', 'Color', 'Shape only', 'Sound'], correctAnswer: 0, explanation: 'Weight tells how heavy something is.', funFact: 'Scientists compare properties like size, weight, texture, and color.', category: 'chemistry', icon: 'scale' },
  { id: '2g15', gradeLevel: 4, title: 'Earth Rotation', question: 'What causes day and night?', hypothesis: ['Earth rotating', 'The moon sleeping', 'Clouds painting the sky', 'Mountains moving'], correctAnswer: 0, explanation: 'Day and night happen because Earth rotates, or spins.', funFact: 'Earth takes about 24 hours to rotate once.', category: 'space', icon: 'earth-spin' },
  { id: '2g16', gradeLevel: 4, title: 'Engineering Test', question: 'Why do engineers test a design?', hypothesis: ['To see what works and improve it', 'To avoid learning', 'To make all ideas disappear', 'To stop asking questions'], correctAnswer: 0, explanation: 'Engineers test designs so they can find problems and improve them.', funFact: 'Testing and improving is called iteration.', category: 'physics', icon: 'engineer' },
  { id: 'pk5', gradeLevel: 1, title: 'Soft and Hard', question: 'Which object is usually soft?', hypothesis: ['Pillow', 'Rock', 'Brick', 'Pan'], correctAnswer: 0, explanation: 'A pillow is soft because it can squish when you press it.', funFact: 'Scientists describe objects by properties like soft, hard, rough, and smooth.', category: 'physics', icon: '*' },
  { id: 'pk6', gradeLevel: 1, title: 'Sink or Float', question: 'Which one is more likely to float in water?', hypothesis: ['A leaf', 'A heavy rock', 'A metal key', 'A brick'], correctAnswer: 0, explanation: 'A leaf is light and can float on top of water.', funFact: 'Scientists test ideas by observing what happens.', category: 'physics', icon: '*' },
  { id: 'k17', gradeLevel: 2, title: 'Five Senses', question: 'Which body part helps you smell?', hypothesis: ['Nose', 'Knee', 'Elbow', 'Foot'], correctAnswer: 0, explanation: 'Your nose helps you smell things around you.', funFact: 'Your senses help your brain learn about the world.', category: 'biology', icon: '*' },
  { id: 'k18', gradeLevel: 2, title: 'Plant Parts', question: 'Which plant part takes in water from soil?', hypothesis: ['Roots', 'Petals', 'Fruit', 'Seeds'], correctAnswer: 0, explanation: 'Roots take in water and help hold the plant in place.', funFact: 'Some roots, like carrots, store food for the plant.', category: 'biology', icon: '*' },
  { id: '1g17', gradeLevel: 3, title: 'Push and Pull', question: 'Opening a drawer is usually what kind of force?', hypothesis: ['Pull', 'Freeze', 'Melt', 'Float'], correctAnswer: 0, explanation: 'You pull a drawer toward you to open it.', funFact: 'Forces can change how objects move.', category: 'physics', icon: '*' },
  { id: '1g18', gradeLevel: 3, title: 'Animal Coverings', question: 'What covering helps birds fly and stay warm?', hypothesis: ['Feathers', 'Scales only', 'Bark', 'Paper'], correctAnswer: 0, explanation: 'Feathers help birds fly and keep warm.', funFact: 'Bird feathers can also help with color, signals, and waterproofing.', category: 'biology', icon: '*' },
  { id: '2g17', gradeLevel: 4, title: 'Fair Test', question: 'Why should only one thing change in a fair test?', hypothesis: ['So you know what caused the result', 'So the test is faster', 'So no one writes notes', 'So the answer is always yes'], correctAnswer: 0, explanation: 'Changing one thing helps scientists know what caused the result.', funFact: 'The thing you change in an experiment is called a variable.', category: 'nature', icon: '*' },
  { id: '2g18', gradeLevel: 4, title: 'Water Cycle', question: 'What is water vapor cooling into clouds called?', hypothesis: ['Condensation', 'Multiplication', 'Magnetism', 'Digestion'], correctAnswer: 0, explanation: 'Condensation happens when water vapor cools and forms tiny droplets.', funFact: 'Clouds are made of tiny water droplets or ice crystals.', category: 'nature', icon: '*' },
  { id: '3g9', gradeLevel: 5, title: 'Inherited Traits', question: 'Which trait can be inherited from parents?', hypothesis: ['Eye color', 'Favorite song', 'A learned dance', 'A new backpack'], correctAnswer: 0, explanation: 'Eye color can be inherited because traits pass from parents to offspring.', funFact: 'Some traits are inherited, while others are learned or affected by the environment.', category: 'biology', icon: '*' },
  { id: '3g10', gradeLevel: 5, title: 'Simple Machines', question: 'Which simple machine is a ramp?', hypothesis: ['Inclined plane', 'Pulley', 'Wheel only', 'Magnet'], correctAnswer: 0, explanation: 'A ramp is an inclined plane that helps move things up or down.', funFact: 'Simple machines make work easier by changing force or direction.', category: 'physics', icon: '*' },
  { id: '4g9', gradeLevel: 6, title: 'Energy Transfer', question: 'When a metal spoon gets warm in soup, heat moved by what process?', hypothesis: ['Conduction', 'Reflection', 'Evaporation', 'Erosion'], correctAnswer: 0, explanation: 'Conduction moves heat through touching materials.', funFact: 'Metals often conduct heat well.', category: 'physics', icon: '*' },
  { id: '4g10', gradeLevel: 6, title: 'Earth Layers', question: 'Which layer is Earths outer rocky surface?', hypothesis: ['Crust', 'Core', 'Mantle only', 'Atmosphere'], correctAnswer: 0, explanation: 'The crust is the thin, rocky outer layer of Earth.', funFact: 'Earths crust is broken into large plates that move slowly.', category: 'nature', icon: '*' },
  { id: '5g9', gradeLevel: 7, title: 'Controlled Variables', question: 'In an experiment, what should stay the same to make a fair comparison?', hypothesis: ['Controlled variables', 'Random guesses', 'Unrelated stories', 'Only the title'], correctAnswer: 0, explanation: 'Controlled variables stay the same so the test compares one main change.', funFact: 'Strong experiments use controls, evidence, and repeatable steps.', category: 'chemistry', icon: '*' },
  { id: '5g10', gradeLevel: 7, title: 'Food Web Stability', question: 'What may happen if one species disappears from a food web?', hypothesis: ['Other species can be affected', 'Nothing can ever change', 'The sun turns off', 'All water freezes'], correctAnswer: 0, explanation: 'Food webs connect living things, so one change can affect many organisms.', funFact: 'Biodiversity can help ecosystems stay balanced.', category: 'biology', icon: '*' },
];

const SCIENCE_EXPANSION_TOPICS = [
  { category: 'biology' as const, icon: '*', title: 'Plant Clue', answer: 'Sunlight, water, and air' },
  { category: 'biology' as const, icon: '*', title: 'Animal Need', answer: 'Food, water, and a safe home' },
  { category: 'physics' as const, icon: '*', title: 'Force Test', answer: 'A push or pull can change motion' },
  { category: 'chemistry' as const, icon: '*', title: 'Matter Change', answer: 'Heating or cooling can change matter' },
  { category: 'nature' as const, icon: '*', title: 'Weather Watch', answer: 'Weather can change during the day' },
  { category: 'space' as const, icon: '*', title: 'Sky Pattern', answer: 'Objects in the sky follow patterns' },
  { category: 'biology' as const, icon: '*', title: 'Body System', answer: 'Body parts work together' },
  { category: 'physics' as const, icon: '*', title: 'Sound Lab', answer: 'Sound comes from vibrations' },
  { category: 'nature' as const, icon: '*', title: 'Water Cycle', answer: 'Water moves and changes form' },
  { category: 'chemistry' as const, icon: '*', title: 'Mixing Lab', answer: 'Some materials mix and some do not' },
  { category: 'space' as const, icon: '*', title: 'Sun Energy', answer: 'The sun gives light and heat' },
  { category: 'nature' as const, icon: '*', title: 'Earth Shape', answer: 'Land and water can change slowly' },
];

const EXPANDED_SCIENCE_EXPERIMENTS: (ScienceExperiment & { gradeLevel: number })[] = SCIENCE_EXPANSION_TOPICS.flatMap((topic, topicIndex) =>
  Array.from({ length: 7 }, (_, gradeIndex) => Array.from({ length: 8 }, (_, variantIndex) => {
    const gradeLevel = gradeIndex + 1;
    return {
      id: `science-expanded-${topicIndex + 1}-g${gradeLevel}-v${variantIndex + 1}`,
      gradeLevel,
      title: `${topic.title} ${gradeLevel}.${variantIndex + 1}`,
      question: gradeLevel <= 2
        ? `What should a young scientist notice in ${topic.title.toLowerCase()} example ${variantIndex + 1}?`
        : gradeLevel <= 4
          ? `Which explanation best fits the ${topic.title.toLowerCase()} evidence set ${variantIndex + 1}?`
          : `Which claim is best supported by observations from the ${topic.title.toLowerCase()} investigation ${variantIndex + 1}?`,
      hypothesis: [
        topic.answer,
        gradeLevel <= 2 ? 'It happens by magic' : 'It happens without any cause',
        gradeLevel <= 3 ? 'Only color matters' : 'The answer never changes',
        gradeLevel <= 4 ? 'It is not something scientists observe' : 'It cannot be tested with evidence',
      ],
      correctAnswer: 0,
      explanation: `${topic.answer}. Scientists use observations and evidence before they choose an answer.`,
      funFact: 'Scientists often repeat a test so they can see whether the same pattern happens again.',
      category: topic.category,
      icon: topic.icon,
    };
  })).flat()
);

export const ALL_SCIENCE_EXPERIMENTS = [...SCIENCE_EXPERIMENTS, ...EXPANDED_SCIENCE_EXPERIMENTS];

export const ScienceRoom: React.FC<ScienceRoomProps> = ({ level, onBack, onReward }) => {
  // Filter experiments by grade level
  const availableExperiments = ALL_SCIENCE_EXPERIMENTS.filter(e => e.gradeLevel <= level);

  const [experiment, setExperiment] = useState<typeof ALL_SCIENCE_EXPERIMENTS[0] | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFunFact, setShowFunFact] = useState(false);
  const [score, setScore] = useState(0);
  const [coachTip, setCoachTip] = useState('');
  const recentExperimentIds = useRef<string[]>([]);
  const lessonStep = useRef(0);

  const scienceTip = useMemo(() => {
    if (level <= 2) return 'Look at the choices and think about the real world.';
    if (level <= 4) return 'Use what you have seen in nature, school, or home.';
    return 'Read carefully, then use the clue in the experiment title.';
  }, [level]);

  const getNewExperiment = () => {
    const freshPool = availableExperiments.filter(exp => !recentExperimentIds.current.includes(exp.id));
    const pool = freshPool.length > 0 ? freshPool : availableExperiments;
    const step = lessonStep.current;
    lessonStep.current += 1;
    const randomExp = pickDailyItem(pool, `science-grade-${level}`, step);
    recentExperimentIds.current = [randomExp.id, ...recentExperimentIds.current].slice(0, Math.min(8, availableExperiments.length - 1));
    setExperiment(randomExp);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowFunFact(false);
    setCoachTip(scienceTip);

    void speakMultipleChoiceQuestion(randomExp.question, randomExp.hypothesis);
  };

  useEffect(() => {
    getNewExperiment();
  }, [scienceTip]);

  const readQuestionAloud = () => {
    if (experiment) {
      void speakMultipleChoiceQuestion(experiment.question, experiment.hypothesis);
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
        onReward({
          questionId: experiment.id,
          skill: experiment.category,
          prompt: experiment.question,
          selectedAnswer: experiment.hypothesis[index],
          correctAnswer: experiment.hypothesis[experiment.correctAnswer],
        });
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
    <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,#bef264_0,#14b8a6_32%,#0891b2_68%,#0f766e_100%)] flex flex-col overflow-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm">
        <button onClick={onBack} aria-label="Back to world map" className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
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

      <div className="pointer-events-none absolute left-4 top-24 h-24 w-24 rounded-full bg-lime-200/30 blur-sm" />
      <div className="pointer-events-none absolute right-10 top-36 h-16 w-16 rounded-full bg-cyan-100/40 blur-sm" />
      <div className="pointer-events-none absolute bottom-20 left-16 h-20 w-20 rounded-full bg-white/20 blur-sm" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 max-w-2xl w-full relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-teal-100/70" />
          <div className="absolute -left-10 bottom-20 h-28 w-28 rounded-full bg-lime-100/80" />
          {/* Experiment Icon & Category */}
          <div className="text-center mb-4 relative">
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

          <div className="relative mb-4 overflow-hidden rounded-2xl border-2 border-teal-100 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white p-4 shadow-inner">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-teal-600">Junior Lab Bench</div>
                <div className="text-lg font-black text-slate-800">Try the scientist steps</div>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-teal-700 shadow-sm">
                Grade {level}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['Observe', 'Notice the clue'],
                ['Predict', 'Pick what fits'],
                ['Explain', 'Learn why'],
              ].map(([title, copy], index) => (
                <div key={title} className="rounded-xl bg-white/90 p-3 text-center shadow-sm ring-1 ring-teal-100">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <div className="text-sm font-black text-slate-800">{title}</div>
                  <div className="text-xs font-semibold text-slate-500">{copy}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl p-4 mb-4 relative">
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
            <div className={`mb-4 rounded-2xl border-2 p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
              <div className="mb-3 flex items-center gap-3">
                {isCorrect ? (
                  <Check className="text-green-600 flex-shrink-0" size={24} />
                ) : (
                  <X className="text-orange-600 flex-shrink-0" size={24} />
                )}
                <div>
                  <div className={`text-xs font-black uppercase tracking-[0.18em] ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
                    Teacher Check
                  </div>
                  <div className={`text-lg font-black ${isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                    {isCorrect ? 'Correct prediction.' : 'Good try. Let us fix it.'}
                  </div>
                </div>
              </div>
              <div className="grid gap-2 text-sm font-bold sm:grid-cols-2">
                <div className="rounded-xl bg-white/85 p-3 text-slate-700 shadow-sm">
                  Your answer: {selectedAnswer !== null ? experiment.hypothesis[selectedAnswer] : 'Not selected'}
                </div>
                <div className="rounded-xl bg-white/85 p-3 text-slate-700 shadow-sm">
                  Correct answer: {experiment.hypothesis[experiment.correctAnswer]}
                </div>
              </div>
              <p className={`mt-3 font-semibold ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
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
              {isCorrect ? 'Next Experiment' : 'Try Another'}
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
