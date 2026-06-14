import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Globe2, MapPin, Star, Plane, Volume2 } from 'lucide-react';
import { GeographyQuestion } from '../types';
import { speakAsync, speakCorrect, speakWrong, playSuccess, playWrongBuzzer, speakMultipleChoiceQuestion } from '../services/audioService';

interface GeographyRoomProps {
  level: number; // 1-7 corresponds to grade levels
  onBack: () => void;
  onReward: () => void;
}

// Geography questions organized by grade level
export const GEOGRAPHY_QUESTIONS: (GeographyQuestion & { gradeLevel: number })[] = [
  // PRE-K (Level 1): places, land, water, and familiar map ideas
  { gradeLevel: 1, type: 'country', question: 'Do people live on planet Earth?', answer: 'Yes', options: ['Yes', 'No', 'Only fish', 'Only birds'], funFact: 'Earth is our home planet, and people live in many places on it.' },
  { gradeLevel: 1, type: 'nature', question: 'What do we call the very big blue water on Earth?', answer: 'Ocean', options: ['Ocean', 'Road', 'Mountain', 'House'], funFact: 'Oceans cover most of Earth, so Earth can look blue from space.' },
  { gradeLevel: 1, type: 'nature', question: 'Which place is tall and rocky?', answer: 'Mountain', options: ['Mountain', 'Puddle', 'Chair', 'Cloud'], funFact: 'Mountains rise high above the land around them.' },
  { gradeLevel: 1, type: 'map', question: 'What picture can help us find places?', answer: 'Map', options: ['Map', 'Spoon', 'Shoe', 'Blanket'], funFact: 'A map is a picture that shows where places are.' },
  { gradeLevel: 1, type: 'nature', question: 'Where would you see lots of trees together?', answer: 'Forest', options: ['Forest', 'Desert', 'Kitchen', 'Sidewalk'], funFact: 'A forest is an area with many trees growing together.' },
  { gradeLevel: 1, type: 'nature', question: 'What place has lots of sand and very little rain?', answer: 'Desert', options: ['Desert', 'Ocean', 'River', 'Farm'], funFact: 'Deserts are very dry places, and some are hot while others are cold.' },
  { gradeLevel: 1, type: 'map', question: 'Which direction is usually at the top of a map?', answer: 'North', options: ['North', 'Snack', 'Circle', 'Music'], funFact: 'Many maps place north at the top to help people read directions.' },
  { gradeLevel: 1, type: 'country', question: 'What do we call a place where people live together with streets and buildings?', answer: 'City', options: ['City', 'Ocean', 'Cloud', 'Cave'], funFact: 'Cities often have many homes, stores, schools, and roads close together.' },

  // KINDERGARTEN (Level 2): continents, simple countries, and symbols
  { gradeLevel: 2, type: 'flag', question: 'What symbol can represent a country?', answer: 'Flag', options: ['Flag', 'Pencil', 'Lunchbox', 'Pillow'], funFact: 'Countries use flags as symbols with special colors and shapes.' },
  { gradeLevel: 2, type: 'continent', question: 'Which continent includes the United States, Canada, and Mexico?', answer: 'North America', options: ['North America', 'Asia', 'Australia', 'Antarctica'], funFact: 'North America has countries, mountains, forests, deserts, and coastlines.' },
  { gradeLevel: 2, type: 'country', question: 'Which country has kangaroos living in the wild?', answer: 'Australia', options: ['Australia', 'Canada', 'France', 'Egypt'], funFact: 'Australia is known for kangaroos, koalas, and the Great Barrier Reef.' },
  { gradeLevel: 2, type: 'landmark', question: 'Where is the Statue of Liberty?', answer: 'United States', options: ['United States', 'France', 'Italy', 'Japan'], funFact: 'The Statue of Liberty stands in New York Harbor.' },
  { gradeLevel: 2, type: 'nature', question: 'What do we call water that flows across land?', answer: 'River', options: ['River', 'Mountain', 'Desert', 'Flag'], funFact: 'Rivers move water from higher land toward lakes, seas, or oceans.' },
  { gradeLevel: 2, type: 'map', question: 'What map tool shows north, south, east, and west?', answer: 'Compass rose', options: ['Compass rose', 'Thermometer', 'Ruler', 'Clock'], funFact: 'A compass rose helps map readers know directions.' },
  { gradeLevel: 2, type: 'continent', question: 'Which continent is covered in ice and has penguins nearby?', answer: 'Antarctica', options: ['Antarctica', 'Europe', 'Africa', 'South America'], funFact: 'Antarctica is the coldest continent on Earth.' },
  { gradeLevel: 2, type: 'country', question: 'Which country is directly north of the United States?', answer: 'Canada', options: ['Canada', 'Brazil', 'Spain', 'India'], funFact: 'Canada and the United States share one of the longest borders in the world.' },

  // FIRST GRADE (Level 3): landmarks, continents, and map reading
  { gradeLevel: 3, type: 'continent', question: 'Which is the largest continent?', answer: 'Asia', options: ['Asia', 'Africa', 'Europe', 'Australia'], funFact: 'Asia has the largest land area and the most people of any continent.' },
  { gradeLevel: 3, type: 'landmark', question: 'Where is the Eiffel Tower?', answer: 'France', options: ['France', 'Spain', 'Italy', 'Germany'], funFact: 'The Eiffel Tower is a famous landmark in Paris, France.' },
  { gradeLevel: 3, type: 'country', question: 'Which country is shaped like a boot?', answer: 'Italy', options: ['Italy', 'Greece', 'Spain', 'Norway'], funFact: 'Italy is a peninsula, which means water surrounds it on three sides.' },
  { gradeLevel: 3, type: 'map', question: 'What does a map key explain?', answer: 'Map symbols', options: ['Map symbols', 'Lunch choices', 'Song words', 'Animal sounds'], funFact: 'A map key tells what symbols and colors mean on a map.' },
  { gradeLevel: 3, type: 'nature', question: 'What do we call land with water on all sides?', answer: 'Island', options: ['Island', 'Valley', 'Hill', 'Road'], funFact: 'An island is land surrounded by water.' },
  { gradeLevel: 3, type: 'country', question: 'Which country is known as the Land of the Rising Sun?', answer: 'Japan', options: ['Japan', 'Egypt', 'Brazil', 'Canada'], funFact: 'Japan is an island country in East Asia.' },
  { gradeLevel: 3, type: 'continent', question: 'Which continent has the Sahara Desert?', answer: 'Africa', options: ['Africa', 'Europe', 'Australia', 'Antarctica'], funFact: 'The Sahara is the largest hot desert in the world.' },
  { gradeLevel: 3, type: 'landmark', question: 'Where are the pyramids of Giza?', answer: 'Egypt', options: ['Egypt', 'Mexico', 'Peru', 'China'], funFact: 'The pyramids of Giza were built thousands of years ago.' },

  // SECOND GRADE (Level 4): capitals, landforms, climate, and regions
  { gradeLevel: 4, type: 'capital', question: 'What is the capital of the United States?', answer: 'Washington D.C.', options: ['Washington D.C.', 'New York', 'Los Angeles', 'Chicago'], funFact: 'Washington D.C. is the capital city and is not part of any state.' },
  { gradeLevel: 4, type: 'capital', question: 'What is the capital of France?', answer: 'Paris', options: ['Paris', 'Lyon', 'Nice', 'Marseille'], funFact: 'Paris is a major city on the Seine River.' },
  { gradeLevel: 4, type: 'landmark', question: 'Where is the Great Wall?', answer: 'China', options: ['China', 'Japan', 'India', 'South Korea'], funFact: 'The Great Wall is one of the longest structures ever built.' },
  { gradeLevel: 4, type: 'country', question: 'Which country is the largest in South America?', answer: 'Brazil', options: ['Brazil', 'Argentina', 'Chile', 'Peru'], funFact: 'Brazil includes much of the Amazon rainforest.' },
  { gradeLevel: 4, type: 'map', question: 'Which line divides Earth into Northern and Southern Hemispheres?', answer: 'Equator', options: ['Equator', 'Prime Meridian', 'Border', 'Trail'], funFact: 'The Equator is an imaginary line around the middle of Earth.' },
  { gradeLevel: 4, type: 'climate', question: 'Which climate word means very dry?', answer: 'Arid', options: ['Arid', 'Humid', 'Rainy', 'Frozen'], funFact: 'Arid places get very little rain.' },
  { gradeLevel: 4, type: 'nature', question: 'What do we call a low area between mountains?', answer: 'Valley', options: ['Valley', 'Island', 'Ocean', 'Capital'], funFact: 'Many rivers flow through valleys.' },
  { gradeLevel: 4, type: 'continent', question: 'Which continent has the Amazon rainforest?', answer: 'South America', options: ['South America', 'Europe', 'Antarctica', 'Australia'], funFact: 'The Amazon rainforest spreads across several countries in South America.' },

  // THIRD GRADE (Level 5): stronger world knowledge
  { gradeLevel: 5, type: 'capital', question: 'What is the capital of Japan?', answer: 'Tokyo', options: ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo'], funFact: 'Tokyo is one of the largest metropolitan areas in the world.' },
  { gradeLevel: 5, type: 'capital', question: 'What is the capital of the United Kingdom?', answer: 'London', options: ['London', 'Manchester', 'Edinburgh', 'Liverpool'], funFact: 'London grew along the River Thames.' },
  { gradeLevel: 5, type: 'continent', question: 'Which continent has the most countries?', answer: 'Africa', options: ['Africa', 'Asia', 'Europe', 'South America'], funFact: 'Africa has 54 internationally recognized countries.' },
  { gradeLevel: 5, type: 'country', question: 'Which country introduced chocolate to the world through cacao?', answer: 'Mexico', options: ['Mexico', 'Italy', 'Spain', 'Brazil'], funFact: 'Cacao was important to ancient cultures in Mexico and Central America.' },
  { gradeLevel: 5, type: 'landmark', question: 'Where is the Colosseum?', answer: 'Italy', options: ['Italy', 'Greece', 'France', 'Turkey'], funFact: 'The Colosseum is an ancient Roman amphitheater in Rome.' },
  { gradeLevel: 5, type: 'map', question: 'Which imaginary line passes through Greenwich, England?', answer: 'Prime Meridian', options: ['Prime Meridian', 'Equator', 'Arctic Circle', 'Tropic of Cancer'], funFact: 'The Prime Meridian helps measure longitude.' },
  { gradeLevel: 5, type: 'nature', question: 'What is a chain of mountains called?', answer: 'Mountain range', options: ['Mountain range', 'Peninsula', 'Harbor', 'Capital'], funFact: 'The Andes are a long mountain range in South America.' },
  { gradeLevel: 5, type: 'climate', question: 'Which climate has warm temperatures and heavy rain for much of the year?', answer: 'Tropical', options: ['Tropical', 'Polar', 'Arid', 'Temperate'], funFact: 'Tropical climates are often found near the Equator.' },

  // FOURTH GRADE (Level 6): capitals, population, regions, and map skills
  { gradeLevel: 6, type: 'capital', question: 'What is the capital of Australia?', answer: 'Canberra', options: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'], funFact: 'Canberra was planned as the capital between Sydney and Melbourne.' },
  { gradeLevel: 6, type: 'country', question: 'Which country has the largest population?', answer: 'India', options: ['India', 'China', 'United States', 'Brazil'], funFact: 'India became the world population leader in the 2020s.' },
  { gradeLevel: 6, type: 'continent', question: 'Which continent is also a country?', answer: 'Australia', options: ['Australia', 'Antarctica', 'Europe', 'Africa'], funFact: 'Australia is both a country and the name of a continent.' },
  { gradeLevel: 6, type: 'landmark', question: 'Where is Big Ben located?', answer: 'United Kingdom', options: ['United Kingdom', 'France', 'Germany', 'United States'], funFact: 'Big Ben is the nickname for the bell inside the clock tower.' },
  { gradeLevel: 6, type: 'map', question: 'Which direction is opposite of east?', answer: 'West', options: ['West', 'North', 'South', 'Northeast'], funFact: 'Cardinal directions help people describe location and movement.' },
  { gradeLevel: 6, type: 'climate', question: 'Which region is known for very cold polar climate?', answer: 'Arctic', options: ['Arctic', 'Amazon', 'Sahara', 'Caribbean'], funFact: 'The Arctic is around the North Pole.' },
  { gradeLevel: 6, type: 'country', question: 'Which country is famous for the cities Madrid and Barcelona?', answer: 'Spain', options: ['Spain', 'Portugal', 'Italy', 'Colombia'], funFact: 'Spain is on the Iberian Peninsula in Europe.' },
  { gradeLevel: 6, type: 'nature', question: 'What do we call a piece of land almost surrounded by water?', answer: 'Peninsula', options: ['Peninsula', 'Island', 'Valley', 'Plateau'], funFact: 'Florida and Italy are examples of peninsulas.' },

  // FIFTH GRADE (Level 7): advanced landmarks, capitals, regions, and reasoning
  { gradeLevel: 7, type: 'country', question: 'Which country is the largest by land area?', answer: 'Russia', options: ['Russia', 'Canada', 'China', 'Brazil'], funFact: 'Russia stretches across parts of Europe and Asia.' },
  { gradeLevel: 7, type: 'capital', question: 'What is the capital of Germany?', answer: 'Berlin', options: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'], funFact: 'Berlin is Germanys capital and largest city.' },
  { gradeLevel: 7, type: 'capital', question: 'What is the capital of Italy?', answer: 'Rome', options: ['Rome', 'Milan', 'Venice', 'Florence'], funFact: 'Rome was the center of the ancient Roman Empire.' },
  { gradeLevel: 7, type: 'capital', question: 'What is the capital of China?', answer: 'Beijing', options: ['Beijing', 'Shanghai', 'Hong Kong', 'Guangzhou'], funFact: 'Beijing is the capital of China.' },
  { gradeLevel: 7, type: 'landmark', question: 'Where is the Taj Mahal?', answer: 'India', options: ['India', 'Pakistan', 'Bangladesh', 'Nepal'], funFact: 'The Taj Mahal is a marble mausoleum in Agra, India.' },
  { gradeLevel: 7, type: 'landmark', question: 'Where is Machu Picchu?', answer: 'Peru', options: ['Peru', 'Mexico', 'Chile', 'Colombia'], funFact: 'Machu Picchu was built by the Inca civilization in the Andes Mountains.' },
  { gradeLevel: 7, type: 'map', question: 'Which map measurement tells how far east or west a place is from the Prime Meridian?', answer: 'Longitude', options: ['Longitude', 'Latitude', 'Elevation', 'Population'], funFact: 'Longitude lines run from the North Pole to the South Pole.' },
  { gradeLevel: 7, type: 'climate', question: 'Which word describes the usual weather pattern of a place over many years?', answer: 'Climate', options: ['Climate', 'Address', 'Border', 'Landmark'], funFact: 'Climate is different from daily weather because it describes long-term patterns.' },
  { gradeLevel: 2, type: 'map', question: 'What does a blue area usually show on a map?', answer: 'Water', options: ['Water', 'Fire', 'A school desk', 'A shoe'], funFact: 'Maps often use blue for oceans, lakes, and rivers.' },
  { gradeLevel: 2, type: 'nature', question: 'What landform is higher than a hill?', answer: 'Mountain', options: ['Mountain', 'Beach', 'River', 'Island'], funFact: 'Mountains can be snowy, rocky, forested, or volcanic.' },
  { gradeLevel: 2, type: 'map', question: 'Which direction is opposite of north?', answer: 'South', options: ['South', 'Circle', 'Lunch', 'Purple'], funFact: 'North, south, east, and west are cardinal directions.' },
  { gradeLevel: 2, type: 'country', question: 'What do we call the place where you live?', answer: 'Home', options: ['Home', 'Ocean', 'Moon', 'Cloud'], funFact: 'Geography starts with familiar places like home, school, and neighborhood.' },
  { gradeLevel: 2, type: 'nature', question: 'Where does a river usually flow?', answer: 'Across land toward lower places', options: ['Across land toward lower places', 'Inside a backpack', 'Up into a lunchbox', 'Only in the sky'], funFact: 'Water flows downhill because of gravity.' },
  { gradeLevel: 2, type: 'flag', question: 'What can flags use to show meaning?', answer: 'Colors and symbols', options: ['Colors and symbols', 'Only smells', 'Only sounds', 'Only snacks'], funFact: 'Flag colors and symbols often connect to a country history or values.' },
  { gradeLevel: 2, type: 'continent', question: 'What is a continent?', answer: 'A very large area of land', options: ['A very large area of land', 'A tiny toy', 'A kind of lunch', 'A weather tool'], funFact: 'Earth has seven continents.' },
  { gradeLevel: 2, type: 'landmark', question: 'What is a landmark?', answer: 'A place people can recognize', options: ['A place people can recognize', 'A hidden pencil', 'A quiet sound', 'A small snack'], funFact: 'Landmarks can help people describe where they are.' },
  { gradeLevel: 2, type: 'nature', question: 'Which place is next to the ocean and often has sand?', answer: 'Beach', options: ['Beach', 'Mountain peak', 'Cave wall', 'City roof'], funFact: 'Beaches can be sandy, rocky, or covered in shells.' },
  { gradeLevel: 2, type: 'map', question: 'What can a dotted line on a map show?', answer: 'A path or route', options: ['A path or route', 'A sandwich', 'A song', 'A pencil case'], funFact: 'Map symbols help readers understand places quickly.' },
  { gradeLevel: 3, type: 'map', question: 'What does a scale on a map help you figure out?', answer: 'Distance', options: ['Distance', 'Taste', 'Volume of music', 'Temperature of soup'], funFact: 'A map scale connects map distance to real distance.' },
  { gradeLevel: 3, type: 'country', question: 'Which country is south of the United States?', answer: 'Mexico', options: ['Mexico', 'Canada', 'Iceland', 'Norway'], funFact: 'Mexico is part of North America.' },
  { gradeLevel: 3, type: 'nature', question: 'What is a valley?', answer: 'Low land between hills or mountains', options: ['Low land between hills or mountains', 'Water around all sides', 'A flag symbol', 'A capital city'], funFact: 'Rivers often run through valleys.' },
  { gradeLevel: 3, type: 'continent', question: 'Which continent is south of Europe and across the Mediterranean Sea?', answer: 'Africa', options: ['Africa', 'Australia', 'Antarctica', 'North America'], funFact: 'Africa has deserts, rainforests, savannas, mountains, and many countries.' },
  { gradeLevel: 3, type: 'landmark', question: 'Where is Mount Rushmore?', answer: 'United States', options: ['United States', 'Japan', 'Brazil', 'France'], funFact: 'Mount Rushmore is in South Dakota.' },
  { gradeLevel: 3, type: 'map', question: 'What does east mean on many maps?', answer: 'Toward the right side', options: ['Toward the right side', 'Always underwater', 'A kind of food', 'A mountain color'], funFact: 'On many maps, north is up and east is right.' },
  { gradeLevel: 3, type: 'climate', question: 'What climate word means wet or having lots of moisture in the air?', answer: 'Humid', options: ['Humid', 'Arid', 'Frozen', 'Rocky'], funFact: 'Humid air can feel sticky because it has lots of water vapor.' },
  { gradeLevel: 3, type: 'nature', question: 'What is a lake?', answer: 'Water surrounded by land', options: ['Water surrounded by land', 'Land surrounded by water', 'A city street', 'A flag color'], funFact: 'Lakes can be tiny or very large.' },
  { gradeLevel: 3, type: 'flag', question: 'What country has a maple leaf on its flag?', answer: 'Canada', options: ['Canada', 'Italy', 'Egypt', 'India'], funFact: 'The maple leaf is a well-known symbol of Canada.' },
  { gradeLevel: 3, type: 'country', question: 'Which country is famous for the Amazon rainforest?', answer: 'Brazil', options: ['Brazil', 'Canada', 'Germany', 'Japan'], funFact: 'The Amazon rainforest spreads across several South American countries.' },
  { gradeLevel: 4, type: 'capital', question: 'What is the capital of Canada?', answer: 'Ottawa', options: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'], funFact: 'Ottawa is in the province of Ontario.' },
  { gradeLevel: 4, type: 'capital', question: 'What is the capital of Mexico?', answer: 'Mexico City', options: ['Mexico City', 'Cancun', 'Tijuana', 'Monterrey'], funFact: 'Mexico City is one of the largest cities in North America.' },
  { gradeLevel: 4, type: 'map', question: 'Which line divides Earth into Eastern and Western Hemispheres?', answer: 'Prime Meridian', options: ['Prime Meridian', 'Equator', 'Coastline', 'Trail'], funFact: 'The Prime Meridian is used to measure longitude.' },
  { gradeLevel: 4, type: 'nature', question: 'What is a peninsula?', answer: 'Land almost surrounded by water', options: ['Land almost surrounded by water', 'Water surrounded by land', 'A mountain chain', 'A capital city'], funFact: 'Florida is a peninsula.' },
  { gradeLevel: 4, type: 'climate', question: 'Which climate word means mild, not too hot or too cold?', answer: 'Temperate', options: ['Temperate', 'Arid', 'Polar', 'Tropical'], funFact: 'Temperate places often have four seasons.' },
  { gradeLevel: 4, type: 'continent', question: 'Which continent is mostly around the South Pole?', answer: 'Antarctica', options: ['Antarctica', 'Asia', 'Europe', 'Africa'], funFact: 'Antarctica is very cold and covered by ice.' },
  { gradeLevel: 4, type: 'landmark', question: 'Where is Chichen Itza?', answer: 'Mexico', options: ['Mexico', 'Canada', 'Spain', 'China'], funFact: 'Chichen Itza is an ancient Maya site.' },
  { gradeLevel: 4, type: 'country', question: 'Which country has the city Toronto?', answer: 'Canada', options: ['Canada', 'Brazil', 'France', 'Egypt'], funFact: 'Toronto is one of Canada largest cities.' },
  { gradeLevel: 4, type: 'nature', question: 'What is an archipelago?', answer: 'A group of islands', options: ['A group of islands', 'A single mountain', 'A city road', 'A desert storm'], funFact: 'Japan and Indonesia are island countries with many islands.' },
  { gradeLevel: 4, type: 'map', question: 'What do latitude lines measure?', answer: 'How far north or south a place is', options: ['How far north or south a place is', 'How heavy a rock is', 'How loud a city is', 'How old a flag is'], funFact: 'Latitude lines run east and west around Earth.' },
];

export const GeographyRoom: React.FC<GeographyRoomProps> = ({ level, onBack, onReward }) => {
  // Filter questions by grade level
  const availableQuestions = GEOGRAPHY_QUESTIONS.filter(q => q.gradeLevel <= level);

  const [question, setQuestion] = useState<typeof GEOGRAPHY_QUESTIONS[0] | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [countriesLearned, setCountriesLearned] = useState<Set<string>>(new Set());
  const [coachTip, setCoachTip] = useState('');
  const recentQuestionKeys = useRef<string[]>([]);

  const geographyTip = useMemo(() => {
    if (level <= 2) return 'Use pictures, flags, and what feels familiar.';
    if (level <= 4) return 'Look for clues in landmarks, capitals, and continents.';
    return 'Pause, compare the options, and eliminate what does not fit.';
  }, [level]);

  const teacherIntro = useMemo(() => {
    if (level <= 2) return 'Teacher says: Let us look for the biggest clue first.';
    if (level <= 4) return 'Teacher says: Think about landmarks, flags, and map clues.';
    return 'Teacher says: Compare the choices and rule out what does not fit.';
  }, [level]);

  const getNewQuestion = () => {
    const freshPool = availableQuestions.filter(item => !recentQuestionKeys.current.includes(item.question));
    const pool = freshPool.length > 0 ? freshPool : availableQuestions;
    const randomQ = pool[Math.floor(Math.random() * pool.length)];
    recentQuestionKeys.current = [randomQ.question, ...recentQuestionKeys.current].slice(0, Math.min(8, availableQuestions.length - 1));
    const shuffledOptions = [...randomQ.options].sort(() => Math.random() - 0.5);
    const cleanQuestion = randomQ.question;
    setQuestion({ ...randomQ, options: shuffledOptions });
    setSelectedAnswer(null);
    setShowResult(false);
    setCoachTip(geographyTip);

    void (async () => {
      await speakAsync(teacherIntro, 0.88, 1.03);
      await speakMultipleChoiceQuestion(cleanQuestion, shuffledOptions, `${geographyTip} Ms. Nova will read the choices.`);
    })();
  };

  useEffect(() => {
    const startLesson = async () => {
      await speakAsync(`Welcome to Geography Globe. ${geographyTip}`);
      getNewQuestion();
    };
    void startLesson();
  }, [geographyTip]);

  const readQuestionAloud = () => {
    if (question) {
      void speakMultipleChoiceQuestion(question.question, question.options, 'Listen again.');
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult || !question) return;

    setSelectedAnswer(answer);
    const correct = answer === question.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSuccess();
      setScore(s => s + 1);
      setCountriesLearned(prev => new Set(prev).add(question.answer));
      void speakCorrect(`Correct. ${question.funFact}`);
      setTimeout(() => onReward(), 2000);
    } else {
      playWrongBuzzer();
      void speakWrong(`The answer is ${question.answer}. ${question.funFact}`);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'flag': return 'Flag Clue';
      case 'continent': return 'Continent';
      case 'capital': return 'Capital City';
      case 'landmark': return 'Landmark';
      case 'country': return 'Country';
      case 'nature': return 'Land and Water';
      case 'map': return 'Map Skill';
      case 'climate': return 'Climate';
      default: return 'World Skill';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flag': return 'from-red-400 to-blue-500';
      case 'continent': return 'from-green-400 to-teal-500';
      case 'capital': return 'from-purple-400 to-indigo-500';
      case 'landmark': return 'from-yellow-400 to-orange-500';
      case 'country': return 'from-pink-400 to-rose-500';
      case 'nature': return 'from-cyan-400 to-blue-500';
      case 'map': return 'from-amber-400 to-lime-500';
      case 'climate': return 'from-orange-400 to-sky-500';
      default: return 'from-cyan-400 to-blue-500';
    }
  };

  if (!question) return null;

  return (
    <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,#fef08a_0,#38bdf8_28%,#14b8a6_62%,#2563eb_100%)] flex flex-col overflow-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm">
        <button onClick={onBack} aria-label="Back to world map" className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
          <ArrowLeft className="text-white" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Globe2 className="text-white" size={28} />
          <span className="text-2xl font-bold text-white drop-shadow">Geography Globe</span>
        </div>
        <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full">
          <MapPin className="text-red-300" size={20} />
          <span className="text-white font-bold">{countriesLearned.size}</span>
        </div>
      </div>

      {/* Floating decorations */}
      <div className="absolute top-20 left-10 h-14 w-14 animate-float rounded-full border-4 border-white/40 bg-sky-300/40 opacity-60" />
      <div className="absolute top-40 right-10 h-16 w-16 animate-float-delayed rounded-full border-4 border-emerald-200/50 bg-emerald-400/30 opacity-60" />
      <div className="absolute bottom-40 left-20 h-12 w-20 animate-float rounded-2xl border-4 border-white/40 bg-amber-200/50 opacity-60 rotate-12" />
      <div className="absolute bottom-20 right-20 h-16 w-16 animate-float-delayed rounded-full border-4 border-yellow-200/60 bg-blue-500/20 opacity-60" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 max-w-2xl w-full relative overflow-hidden">
          {/* Decorative globe background */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[18px] border-sky-200/50 bg-emerald-100/40 opacity-70 rotate-12" />

          {/* Type Badge */}
          <div className="text-center mb-4 flex items-center justify-center gap-2">
            <span className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-gradient-to-r ${getTypeColor(question.type)} text-white shadow-lg`}>
              {getTypeLabel(question.type)}
            </span>
            <button
              onClick={readQuestionAloud}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <Volume2 className="text-gray-600" size={16} />
            </button>
          </div>

          <div className="relative mb-5 overflow-hidden rounded-2xl border-2 border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 shadow-inner">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-sky-600">Travel Passport</div>
                <div className="text-lg font-black text-slate-800">Stamp the route with map thinking</div>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-sky-700 shadow-sm">
                {countriesLearned.size} stamps
              </div>
            </div>
            <div className="relative grid grid-cols-3 gap-2">
              <div className="absolute left-[16%] right-[16%] top-5 h-1 rounded-full bg-sky-200" />
              {[
                ['Map clue', 'Read the question'],
                ['Compare', 'Check each place'],
                ['Remember', 'Save the fact'],
              ].map(([title, copy], index) => (
                <div key={title} className="relative rounded-xl bg-white/95 p-3 text-center shadow-sm ring-1 ring-sky-100">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <div className="text-sm font-black text-slate-800">{title}</div>
                  <div className="text-xs font-semibold text-slate-500">{copy}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 mb-6 relative">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Travel Tip</div>
            <p className="text-sm font-semibold text-blue-900 mb-3">{coachTip}</p>
            <p className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {question.options.map((option, index) => {
              let buttonClass = 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-cyan-100 text-gray-700 border-2 border-gray-200';

              if (showResult) {
                if (option === question.answer) {
                  buttonClass = 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-2 border-green-400';
                } else if (option === selectedAnswer) {
                  buttonClass = 'bg-gradient-to-r from-red-400 to-rose-500 text-white border-2 border-red-400';
                } else {
                  buttonClass = 'bg-gray-100 text-gray-400 border-2 border-gray-200';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-md ${buttonClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Result & Fun Fact */}
          {showResult && (
            <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-100' : 'bg-orange-100'}`}>
              <div className="flex items-start gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black uppercase tracking-wide text-slate-700">
                  {isCorrect ? 'Nice' : 'Learn'}
                </span>
                <div>
                  <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                    {isCorrect ? 'Correct!' : `The answer is ${question.answer}`}
                  </p>
                  <p className="text-gray-600 mt-1">{question.funFact}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button
              onClick={getNewQuestion}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plane size={20} />
              Explore More!
            </button>
          )}

          {/* Score Display */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-400 px-3 py-1 rounded-full shadow">
            <Star className="text-white fill-white" size={16} />
            <span className="text-white font-bold">{score}</span>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 text-center text-sm text-gray-500">
            {availableQuestions.length} locations to explore at your level
          </div>
        </div>
      </div>
    </div>
  );
};
