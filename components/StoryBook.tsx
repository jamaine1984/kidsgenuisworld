import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Play, Pause, ChevronLeft, ChevronRight, Star, Volume2, Mic2, Heart, CheckCircle2, XCircle } from 'lucide-react';
import { speakAsync, stopSpeaking, isSpeaking, playSuccess } from '../services/audioService';

interface StoryBookProps {
  level: number; // 1-7 corresponds to grade levels
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
}

interface Story {
  id: string;
  title: string;
  author: string;
  cover: string; // emoji
  gradeLevel: number;
  pages: string[];
  moral?: string;
  category: 'adventure' | 'animals' | 'friendship' | 'family' | 'nature' | 'fantasy' | 'learning';
}

interface StoryQuizQuestion {
  question: string;
  answer: string;
  options: string[];
}

const getStoryShelfLabel = (gradeLevel: number) => {
  if (gradeLevel === 1) return 'Pre-K';
  if (gradeLevel === 2) return 'Kindergarten';
  return `Grade ${gradeLevel - 2}`;
};

const getStoryQuizTargetCount = (level: number) => {
  if (level <= 2) return 2;
  if (level <= 4) return 4;
  if (level === 5) return 6;
  if (level === 6) return 8;
  return 10;
};

const shuffleQuizOptions = (options: string[], seed: string) => {
  const copy = [...options];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return copy
    .map((item, index) => ({
      item,
      sort: ((hash + (index + 1) * 2654435761) >>> 0),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map(entry => entry.item);
};

const buildStoryQuiz = (story: Story, level: number): StoryQuizQuestion[] => {
  const targetCount = getStoryQuizTargetCount(level);
  const pageAnswers = story.pages.map(page => page.replace(/[.!?"]+$/g, '').trim()).filter(Boolean);
  const shortTitle = story.title;
  const genericDistractors = [
    'The character gives up right away',
    'The story happens on the moon',
    'Everyone forgets the problem',
    'The character hides from learning',
    'The story is mostly about buying toys',
    'The ending says practice does not matter',
  ];

  const candidates: StoryQuizQuestion[] = [
    {
      question: `Which event happened in ${shortTitle}?`,
      answer: pageAnswers[0] || story.title,
      options: shuffleQuizOptions([
        pageAnswers[0] || story.title,
        ...genericDistractors.slice(0, 3),
      ], `${story.id}-event-0`),
    },
    {
      question: 'What is the best lesson from this story?',
      answer: story.moral || 'The character learns something important',
      options: shuffleQuizOptions([
        story.moral || 'The character learns something important',
        ...genericDistractors.slice(2, 5),
      ], `${story.id}-moral`),
    },
    ...pageAnswers.slice(1).map((answer, index) => ({
      question: `Which detail belongs in the story?`,
      answer,
      options: shuffleQuizOptions([
        answer,
        ...genericDistractors.slice(index % genericDistractors.length).concat(genericDistractors).slice(0, 3),
      ], `${story.id}-detail-${index}`),
    })),
  ];

  while (candidates.length < targetCount) {
    const answer = story.moral || pageAnswers[candidates.length % Math.max(pageAnswers.length, 1)] || story.title;
    candidates.push({
      question: `What should the reader remember from ${shortTitle}?`,
      answer,
      options: shuffleQuizOptions([
        answer,
        ...genericDistractors.slice(0, 3),
      ], `${story.id}-remember-${candidates.length}`),
    });
  }

  return candidates.slice(0, targetCount);
};

// 50 Stories organized by grade level
export const STORIES: Story[] = [
  // PRE-K (Level 1)
  {
    id: 'pk-1', title: 'Pip and the Puddle', author: 'Kid Genius Originals', cover: '💧', gradeLevel: 1, category: 'nature',
    pages: [
      'Pip puts on tiny yellow boots.',
      'Pip sees a puddle by the garden gate.',
      'Splish! Splash! Pip jumps high and giggles.',
      'A bird drinks water from the puddle too.',
      'Pip waves and says, "Rain can be fun!"'
    ],
    moral: 'Small moments can be joyful.'
  },
  {
    id: 'pk-2', title: 'Nora Finds a Nest', author: 'Kid Genius Originals', cover: '🪺', gradeLevel: 1, category: 'animals',
    pages: [
      'Nora walks softly under a tall tree.',
      'She spots a nest tucked in the branches.',
      'Three baby birds open their beaks wide.',
      'Nora steps back and watches very quietly.',
      'The mother bird returns with breakfast.'
    ],
    moral: 'Quiet watching helps us learn.'
  },
  {
    id: 'pk-3', title: 'The Sleepy Seed', author: 'Kid Genius Originals', cover: '🌱', gradeLevel: 1, category: 'learning',
    pages: [
      'A tiny seed sleeps in warm brown soil.',
      'Rain taps above it. Sunlight glows nearby.',
      'The seed stretches one little root down.',
      'Then a green sprout pops up to say hello.',
      'Growing takes time, water, and light.'
    ],
    moral: 'Growing happens step by step.'
  },
  {
    id: 'pk-4', title: 'Benny Counts Stars', author: 'Kid Genius Originals', cover: '⭐', gradeLevel: 1, category: 'learning',
    pages: [
      'Benny looks up at the soft night sky.',
      'He sees one bright star. Then two more stars.',
      'Benny points slowly and counts each light.',
      'Mom smiles and counts with him.',
      'The sky feels friendly when they count together.'
    ],
    moral: 'Counting is easier when we go slowly.'
  },
  {
    id: 'pk-5', title: 'Tali Shares the Truck', author: 'Kid Genius Originals', cover: '🚚', gradeLevel: 1, category: 'friendship',
    pages: [
      'Tali has a blue toy truck.',
      'Noah asks, "Can I try?"',
      'Tali takes one turn, then Noah takes one turn.',
      'They build a road with blocks.',
      'Sharing makes the truck game bigger.'
    ],
    moral: 'Taking turns helps friends play together.'
  },
  {
    id: 'pk-6', title: 'The Red Mitten', author: 'Kid Genius Originals', cover: '🧤', gradeLevel: 1, category: 'family',
    pages: [
      'A red mitten falls near the door.',
      'Maya picks it up and looks around.',
      'Grandpa says, "That mitten is mine!"',
      'Maya gives it back with a big smile.',
      'Grandpa waves his warm hand.'
    ],
    moral: 'Helping family can be simple and kind.'
  },
  {
    id: 'pk-7', title: 'Dot Hears a Drum', author: 'Kid Genius Originals', cover: '🥁', gradeLevel: 1, category: 'learning',
    pages: [
      'Dot hears tap, tap, tap.',
      'She taps the table one time.',
      'She taps the table two times.',
      'Tap, pause, tap. Dot makes a pattern.',
      'Her feet wiggle with the beat.'
    ],
    moral: 'Patterns can be heard and felt.'
  },
  {
    id: 'pk-8', title: 'Ollie Looks Closely', author: 'Kid Genius Originals', cover: '🔍', gradeLevel: 1, category: 'nature',
    pages: [
      'Ollie finds a leaf on the path.',
      'He sees lines, dots, and one tiny hole.',
      'He looks closely but does not pull it apart.',
      'A small bug walks under the leaf.',
      'Ollie whispers, "I found a clue."'
    ],
    moral: 'Careful eyes help us discover.'
  },
  {
    id: 'pk-9', title: 'The Calm Cloud', author: 'Kid Genius Originals', cover: '☁️', gradeLevel: 1, category: 'nature',
    pages: [
      'A little cloud floats over the playground.',
      'It moves slowly across the blue sky.',
      'Ari takes one slow breath.',
      'The cloud drifts. Ari feels calm.',
      'Slow breaths help busy bodies rest.'
    ],
    moral: 'Breathing slowly can help us feel steady.'
  },
  {
    id: 'pk-10', title: 'Rae Finds Yellow', author: 'Kid Genius Originals', cover: '🟡', gradeLevel: 1, category: 'learning',
    pages: [
      'Rae looks for yellow things.',
      'She finds a lemon, a duck, and a bright sock.',
      'She draws a yellow sun.',
      'Dad adds yellow rays around it.',
      'The page glows like morning.'
    ],
    moral: 'Colors are all around us.'
  },
  // KINDERGARTEN (Level 2)
  {
    id: 'k-1', title: 'Milo Builds a Bridge', author: 'Kid Genius Originals', cover: '🌉', gradeLevel: 2, category: 'learning',
    pages: [
      'Milo wants his toy fox to cross a pretend river.',
      'He tries paper first, but it bends and sinks.',
      'He tries blocks next, but they tip sideways.',
      'Then Milo lays wide sticks across two boxes.',
      'The fox crosses safely. Milo cheers for engineering!'
    ],
    moral: 'Trying again helps ideas grow stronger.'
  },
  {
    id: 'k-2', title: 'Luna and the Library Lamp', author: 'Kid Genius Originals', cover: '🏮', gradeLevel: 2, category: 'fantasy',
    pages: [
      'At story time, Luna notices a lamp glowing beside the books.',
      'Whenever the librarian opens a story, the lamp shines brighter.',
      'Luna imagines forests, castles, and oceans around her chair.',
      'When the story ends, the room looks normal again.',
      'Luna smiles. "Books turn light into adventures."'
    ],
    moral: 'Stories help imagination shine.'
  },
  {
    id: 'k-3', title: 'The Helpful Parade', author: 'Kid Genius Originals', cover: '🥁', gradeLevel: 2, category: 'friendship',
    pages: [
      'The class makes a parade for Family Day.',
      'One wheel falls off the toy drum cart.',
      'Everyone brings one idea to help fix it.',
      'Tape, string, and teamwork save the parade.',
      'The music starts, and the whole class marches proudly.'
    ],
    moral: 'Helping together makes hard jobs easier.'
  },
  {
    id: 'k-4', title: 'The Number Picnic', author: 'Kid Genius Originals', cover: '🧺', gradeLevel: 2, category: 'learning',
    pages: [
      'Ava packs three apples and two oranges for a picnic.',
      'She counts every fruit before closing the basket.',
      'At the park, her brother adds one banana.',
      'Ava counts again and finds six fruits.',
      'The picnic tastes better with number practice.'
    ],
    moral: 'Numbers help us organize real life.'
  },
  {
    id: 'k-5', title: 'Juno Follows the Map', author: 'Kid Genius Originals', cover: '🗺️', gradeLevel: 2, category: 'adventure',
    pages: [
      'Juno draws a map from the couch to the kitchen.',
      'The map says forward, turn, and stop.',
      'She follows each step with careful feet.',
      'The last step leads to a snack plate.',
      'Juno laughs. Her map really worked!'
    ],
    moral: 'Directions work best one step at a time.'
  },
  {
    id: 'k-6', title: 'The Kind Line Leader', author: 'Kid Genius Originals', cover: '🤝', gradeLevel: 2, category: 'friendship',
    pages: [
      'Nia gets to be line leader at school.',
      'She walks slowly so everyone can keep up.',
      'When Ben drops his folder, Nia waits.',
      'The class stays together all the way to music.',
      'Nia learns that leading means caring.'
    ],
    moral: 'Good leaders help everyone belong.'
  },
  {
    id: 'k-7', title: 'Finn Sorts the Shells', author: 'Kid Genius Originals', cover: '🐚', gradeLevel: 2, category: 'nature',
    pages: [
      'Finn finds shells beside the sand bucket.',
      'Some are smooth. Some are bumpy.',
      'He sorts them into two careful groups.',
      'Then he sorts by color and size.',
      'The beach becomes a science table.'
    ],
    moral: 'Sorting helps us notice details.'
  },
  {
    id: 'k-8', title: 'The Moon Cake Mix-Up', author: 'Kid Genius Originals', cover: '🌙', gradeLevel: 2, category: 'family',
    pages: [
      'Kai helps Auntie make moon cakes.',
      'He pours too much flour into the bowl.',
      'Auntie smiles and adds a little more water.',
      'Together they fix the sticky dough.',
      'Mistakes can still become something sweet.'
    ],
    moral: 'A mistake can become a learning moment.'
  },
  {
    id: 'k-9', title: 'Zara and the Robot Pet', author: 'Kid Genius Originals', cover: '🤖', gradeLevel: 2, category: 'learning',
    pages: [
      'Zara builds a tiny robot pet from blocks.',
      'She gives it three commands: roll, stop, beep.',
      'The robot rolls past the toy house.',
      'Zara changes the order and tries again.',
      'Now the robot stops right at the door.'
    ],
    moral: 'Changing the order can change the result.'
  },
  {
    id: 'k-10', title: 'The Quiet Reading Fort', author: 'Kid Genius Originals', cover: '📚', gradeLevel: 2, category: 'learning',
    pages: [
      'Mina builds a fort with pillows and blankets.',
      'She brings three books and a small flashlight.',
      'Inside the fort, the room feels quiet.',
      'Mina reads one page, then tells Dad what happened.',
      'The fort becomes her reading place.'
    ],
    moral: 'A quiet place can help reading grow.'
  },
  // GRADE 1 (Level 3) - Simple sentences, 2-3 pages
  {
    id: 'g1-1', title: 'The Red Ball', author: 'Kid Genius', cover: '🔴', gradeLevel: 3, category: 'adventure',
    pages: [
      'Sam has a red ball. The ball is big and round.',
      'Sam kicks the ball. It goes up, up, up!',
      'The ball comes down. Sam catches it. What fun!'
    ]
  },
  {
    id: 'g1-2', title: 'My Cat Max', author: 'Kid Genius', cover: '🐱', gradeLevel: 3, category: 'animals',
    pages: [
      'I have a cat. His name is Max.',
      'Max is soft and gray. He likes to nap.',
      'Max purrs when I pet him. I love Max!'
    ]
  },
  {
    id: 'g1-3', title: 'The Big Sun', author: 'Kid Genius', cover: '☀️', gradeLevel: 3, category: 'nature',
    pages: [
      'The sun is up. It is a new day!',
      'The sun is big and bright. It makes me warm.',
      'I play all day. Thank you, sun!'
    ]
  },
  {
    id: 'g1-4', title: 'A Bug on a Rug', author: 'Kid Genius', cover: '🐛', gradeLevel: 3, category: 'animals',
    pages: [
      'Look! A bug on the rug.',
      'The bug is small. It has six legs.',
      'The bug runs away. Bye bye, bug!'
    ]
  },
  {
    id: 'g1-5', title: 'My Dog Spot', author: 'Kid Genius', cover: '🐕', gradeLevel: 3, category: 'animals',
    pages: [
      'This is my dog. His name is Spot.',
      'Spot can run fast. Spot can jump high.',
      'Spot is my best friend. I love Spot!'
    ]
  },
  {
    id: 'g1-6', title: 'The Hat', author: 'Kid Genius', cover: '🎩', gradeLevel: 3, category: 'adventure',
    pages: [
      'I see a hat. It is a big hat.',
      'I put on the hat. It falls on my nose!',
      'Ha ha ha! The hat is too big for me.'
    ]
  },
  {
    id: 'g1-7', title: 'Rain, Rain', author: 'Kid Genius', cover: '🌧️', gradeLevel: 3, category: 'nature',
    pages: [
      'Drip, drop. It is raining.',
      'I see puddles. Splash, splash!',
      'I love the rain. It helps flowers grow.'
    ]
  },
  {
    id: 'g1-8', title: 'The Little Fish', author: 'Kid Genius', cover: '🐟', gradeLevel: 3, category: 'animals',
    pages: [
      'A little fish swims in the pond.',
      'Swim, swim, swim. The fish is happy.',
      'The fish finds a friend. Now there are two!'
    ]
  },
  {
    id: 'g1-9', title: 'Mom and Me', author: 'Kid Genius', cover: '👩‍👧', gradeLevel: 3, category: 'family',
    pages: [
      'I love my mom. She loves me too.',
      'We bake cookies. Yum yum yum!',
      'I give mom a hug. She is the best!'
    ]
  },
  {
    id: 'g1-10', title: 'The Hop Frog', author: 'Kid Genius', cover: '🐸', gradeLevel: 3, category: 'animals',
    pages: [
      'Hop, hop, hop! See the frog.',
      'The frog sits on a log. Ribbit!',
      'The frog jumps in the pond. Splash!'
    ]
  },

  // GRADE 2 (Level 4) - Slightly longer sentences, 3-4 pages
  {
    id: 'g2-1', title: 'The Lost Teddy', author: 'Kid Genius', cover: '🧸', gradeLevel: 4, category: 'adventure',
    pages: [
      'Lily could not find her teddy bear. Where did it go?',
      'She looked under the bed. No teddy there.',
      'She looked in the closet. There it was!',
      'Lily hugged her teddy tight. She was so happy!'
    ]
  },
  {
    id: 'g2-2', title: 'The Funny Monkey', author: 'Kid Genius', cover: '🐒', gradeLevel: 4, category: 'animals',
    pages: [
      'A monkey lived in a big tree. He liked to play.',
      'The monkey made funny faces. Everyone laughed!',
      'He swung from branch to branch. Wheee!',
      'The monkey was the funniest in the jungle.'
    ]
  },
  {
    id: 'g2-3', title: 'Grandma\'s Garden', author: 'Kid Genius', cover: '🌻', gradeLevel: 4, category: 'family',
    pages: [
      'Grandma has a beautiful garden. I love to help her.',
      'We plant seeds in the dirt. We water them every day.',
      'Soon, flowers start to grow. Red, yellow, and pink!',
      'Grandma gives me a sunflower. It is my favorite!'
    ]
  },
  {
    id: 'g2-4', title: 'The Rainbow After Rain', author: 'Kid Genius', cover: '🌈', gradeLevel: 4, category: 'nature',
    pages: [
      'The rain stopped. The sun came out.',
      'Look! A rainbow in the sky! It has so many colors.',
      'Red, orange, yellow, green, blue, and purple.',
      'Rainbows are magic. They make everyone smile.'
    ]
  },
  {
    id: 'g2-5', title: 'Best Friends', author: 'Kid Genius', cover: '👫', gradeLevel: 4, category: 'friendship',
    pages: [
      'Emma and Jack are best friends. They do everything together.',
      'They play at the park. They share their snacks.',
      'Sometimes they have different ideas. But they always work it out.',
      'Best friends are the best thing in the world!'
    ]
  },
  {
    id: 'g2-6', title: 'The Brave Little Mouse', author: 'Kid Genius', cover: '🐭', gradeLevel: 4, category: 'adventure',
    pages: [
      'A little mouse lived in a tiny hole. He was very small.',
      'One day, a big cat came near. The mouse was scared.',
      'But the mouse was brave! He ran as fast as he could.',
      'He made it home safe. Being brave is important!'
    ]
  },
  {
    id: 'g2-7', title: 'Pizza Night', author: 'Kid Genius', cover: '🍕', gradeLevel: 4, category: 'family',
    pages: [
      'Every Friday is pizza night at our house.',
      'Dad makes the dough. I help put on the toppings.',
      'Cheese, tomatoes, and pepperoni! Yummy!',
      'We eat together and laugh. Friday is the best day!'
    ]
  },
  {
    id: 'g2-8', title: 'The Sleepy Bear', author: 'Kid Genius', cover: '🐻', gradeLevel: 4, category: 'animals',
    pages: [
      'Winter is coming. Bear is very sleepy.',
      'Bear finds a cozy cave. It is warm and safe.',
      'Bear curls up and closes his eyes. Goodnight, Bear!',
      'He will sleep all winter and wake up in spring.'
    ]
  },
  {
    id: 'g2-9', title: 'My New Bike', author: 'Kid Genius', cover: '🚲', gradeLevel: 4, category: 'adventure',
    pages: [
      'I got a new bike for my birthday! It is blue and shiny.',
      'At first, I fell down a lot. Ouch!',
      'But I kept trying. Practice makes perfect!',
      'Now I can ride all by myself. I am so proud!'
    ]
  },
  {
    id: 'g2-10', title: 'Stars at Night', author: 'Kid Genius', cover: '⭐', gradeLevel: 4, category: 'nature',
    pages: [
      'When the sun goes down, the stars come out.',
      'There are so many stars! They twinkle and shine.',
      'I see the Big Dipper. It looks like a big spoon!',
      'Stars are far, far away. But they feel like friends.'
    ]
  },

  // GRADE 3 (Level 5) - More complex stories, 4-5 pages
  {
    id: 'g3-1', title: 'The Magic Paintbrush', author: 'Kid Genius', cover: '🖌️', gradeLevel: 5, category: 'fantasy',
    pages: [
      'Maya found an old paintbrush in her grandmother\'s attic.',
      'When she painted a butterfly, it flew off the paper!',
      'Maya painted flowers, and they bloomed all around her room.',
      'She painted a rainbow, and it stretched across the sky.',
      'Maya learned that creativity is the real magic.'
    ],
    moral: 'Creativity can make magic happen.'
  },
  {
    id: 'g3-2', title: 'The Kindness Chain', author: 'Kid Genius', cover: '💝', gradeLevel: 5, category: 'friendship',
    pages: [
      'One morning, Sofia helped an elderly neighbor carry groceries.',
      'The neighbor was so happy that she baked cookies for the mail carrier.',
      'The mail carrier smiled and let a little boy pet his dog.',
      'The boy shared his sandwich with a new kid at school.',
      'One small act of kindness started a chain that spread through the whole town!'
    ],
    moral: 'Kindness spreads from person to person.'
  },
  {
    id: 'g3-3', title: 'The Curious Caterpillar', author: 'Kid Genius', cover: '🐛', gradeLevel: 5, category: 'nature',
    pages: [
      'Cora the caterpillar wondered what she would become.',
      'She ate leaves and grew bigger every day.',
      'One day, she felt very sleepy. She made a cozy cocoon.',
      'When she woke up, she had beautiful wings!',
      'Cora was now a butterfly. Change can be wonderful!'
    ],
    moral: 'Change helps us grow into something beautiful.'
  },
  {
    id: 'g3-4', title: 'The Lighthouse Keeper', author: 'Kid Genius', cover: '🏠', gradeLevel: 5, category: 'adventure',
    pages: [
      'Old Tom lived in a lighthouse by the sea. His job was to keep the light shining.',
      'One stormy night, the light went out! Ships would crash on the rocks!',
      'Tom climbed the tall stairs in the dark, carrying a new lamp.',
      'He fixed the light just in time. A ship sailed safely past.',
      'Tom was a hero. He saved many lives that night.'
    ],
    moral: 'Small actions can make a big difference.'
  },
  {
    id: 'g3-5', title: 'The Sharing Tree', author: 'Kid Genius', cover: '🌳', gradeLevel: 5, category: 'nature',
    pages: [
      'In the middle of the forest stood a great oak tree.',
      'Birds built nests in its branches. Squirrels stored acorns in its trunk.',
      'Children played in its shade. Families had picnics under its leaves.',
      'The tree never asked for anything. It just loved to share.',
      'The forest animals called it the Sharing Tree.'
    ],
    moral: 'The joy of giving is its own reward.'
  },
  {
    id: 'g3-6', title: 'Rocket to the Moon', author: 'Kid Genius', cover: '🚀', gradeLevel: 5, category: 'adventure',
    pages: [
      'Astronaut Aiden had dreamed of going to the moon since he was five.',
      'He studied hard and trained for many years.',
      'Finally, he climbed into the rocket. Ten, nine, eight... blast off!',
      'He looked out the window and saw Earth, a beautiful blue marble.',
      'Dreams really do come true if you work hard enough.'
    ],
    moral: 'Hard work can make dreams come true.'
  },
  {
    id: 'g3-7', title: 'The Lost Puppy', author: 'Kid Genius', cover: '🐕', gradeLevel: 5, category: 'animals',
    pages: [
      'A little puppy got lost in the big city. He was scared and alone.',
      'A kind girl named Mia found him hiding under a bench.',
      'She gave him water and a warm blanket.',
      'Mia put up posters everywhere. Soon, the puppy\'s family came!',
      'The family was so grateful. They invited Mia to visit anytime.'
    ],
    moral: 'Helping others brings happiness to everyone.'
  },
  {
    id: 'g3-8', title: 'The Tooth Fairy\'s Helper', author: 'Kid Genius', cover: '🧚', gradeLevel: 5, category: 'fantasy',
    pages: [
      'The Tooth Fairy was very busy. There were too many teeth to collect!',
      'She asked little Ella to be her helper for one night.',
      'Ella wore tiny wings and flew from house to house.',
      'She left coins under pillows and collected teeth in a sparkly bag.',
      'The Tooth Fairy was so happy. Ella was the best helper ever!'
    ],
    moral: 'Everyone needs help sometimes.'
  },
  {
    id: 'g3-9', title: 'The Vegetable Garden', author: 'Kid Genius', cover: '🥕', gradeLevel: 5, category: 'learning',
    pages: [
      'The third-grade class planted a vegetable garden at school.',
      'They watered the plants every day and pulled out weeds.',
      'Weeks later, they had tomatoes, carrots, and cucumbers!',
      'They made a big salad and shared it with the whole school.',
      'Growing your own food is fun and delicious!'
    ],
    moral: 'Patience and hard work bring great rewards.'
  },
  {
    id: 'g3-10', title: 'The Dragon Who Couldn\'t Breathe Fire', author: 'Kid Genius', cover: '🐉', gradeLevel: 5, category: 'fantasy',
    pages: [
      'Derek was a dragon, but he couldn\'t breathe fire like the others.',
      'Instead, when he sneezed, colorful bubbles came out!',
      'The other dragons laughed at him. Derek felt sad.',
      'One day, the kingdom needed decorations for a festival.',
      'Derek\'s bubbles were perfect! He was special in his own way.'
    ],
    moral: 'What makes you different makes you special.'
  },

  // GRADE 4 (Level 6) - More vocabulary, deeper themes, 5-6 pages
  {
    id: 'g4-1', title: 'The Mystery of the Missing Cookies', author: 'Kid Genius', cover: '🍪', gradeLevel: 6, category: 'adventure',
    pages: [
      'Detective Dana noticed something strange. The cookie jar was empty!',
      'She looked for clues. There were crumbs leading to the living room.',
      'She dusted for fingerprints and found tiny paw prints.',
      'Dana followed the trail to the dog\'s bed. There was Max, surrounded by crumbs!',
      'Case solved! Max was the cookie thief. Dana gave him a belly rub anyway.',
      'Sometimes the culprit is closer than you think!'
    ],
    moral: 'Careful observation helps solve problems.'
  },
  {
    id: 'g4-2', title: 'The Inventor\'s Dream', author: 'Kid Genius', cover: '💡', gradeLevel: 6, category: 'learning',
    pages: [
      'Izzy wanted to invent something that would help people.',
      'She tried to make a robot that could do homework. It exploded!',
      'She tried to make shoes that could fly. They only hopped.',
      'She felt like giving up. But her grandmother said, "Failure is part of learning."',
      'Finally, Izzy invented a machine that turned trash into plant food.',
      'Her invention helped gardens grow all over the city!'
    ],
    moral: 'Failure is a stepping stone to success.'
  },
  {
    id: 'g4-3', title: 'The Secret Garden Club', author: 'Kid Genius', cover: '🌺', gradeLevel: 6, category: 'friendship',
    pages: [
      'Three friends found an abandoned lot full of weeds and trash.',
      'They decided to turn it into a beautiful garden.',
      'Every weekend, they planted flowers, built benches, and painted rocks.',
      'Neighbors started to notice and wanted to help too.',
      'Soon, the whole community was working together.',
      'The Secret Garden became a place where everyone felt welcome.'
    ],
    moral: 'Working together can transform anything.'
  },
  {
    id: 'g4-4', title: 'The Bravest Knight', author: 'Kid Genius', cover: '⚔️', gradeLevel: 6, category: 'fantasy',
    pages: [
      'Sir Marcus was the smallest knight in the kingdom.',
      'Other knights laughed because he couldn\'t lift the heaviest swords.',
      'But when a dragon threatened the village, no one dared to face it.',
      'Marcus approached the dragon calmly and asked, "Why are you angry?"',
      'The dragon explained that it was lonely. Marcus became its friend.',
      'True bravery isn\'t about strength—it\'s about understanding others.'
    ],
    moral: 'True courage is showing kindness and understanding.'
  },
  {
    id: 'g4-5', title: 'The Time Capsule', author: 'Kid Genius', cover: '📦', gradeLevel: 6, category: 'family',
    pages: [
      'Grandpa showed me a box he had buried fifty years ago.',
      'Inside were old photographs, a toy car, and a letter to his future self.',
      'The letter said, "I hope I grew up to be kind and helpful."',
      'Grandpa had become a doctor who helped thousands of people.',
      'We decided to bury our own time capsule together.',
      'I wonder what my future self will think when they find it!'
    ],
    moral: 'Our actions today shape who we become.'
  },
  {
    id: 'g4-6', title: 'Ocean Explorers', author: 'Kid Genius', cover: '🐋', gradeLevel: 6, category: 'nature',
    pages: [
      'Marine biologist Dr. Coral studied creatures in the deep ocean.',
      'She discovered fish that glowed in the dark and crabs as big as tables.',
      'One day, she found a whale trapped in a fishing net.',
      'With her team\'s help, they carefully freed the whale.',
      'The whale sang a beautiful song before swimming away.',
      'The ocean is full of wonders waiting to be discovered and protected.'
    ],
    moral: 'We must protect the wonders of nature.'
  },
  {
    id: 'g4-7', title: 'The Championship Game', author: 'Kid Genius', cover: '🏆', gradeLevel: 6, category: 'adventure',
    pages: [
      'The soccer championship was tomorrow, and Jamie was nervous.',
      'What if she missed an important goal? What if she let her team down?',
      'Her coach said, "You\'ve practiced hard. Trust yourself."',
      'In the final minute of the game, Jamie had a chance to score.',
      'She took a deep breath, kicked the ball... and GOAL!',
      'Her team won! But the real victory was believing in herself.'
    ],
    moral: 'Believe in yourself and your hard work.'
  },
  {
    id: 'g4-8', title: 'The Pen Pal', author: 'Kid Genius', cover: '✉️', gradeLevel: 6, category: 'friendship',
    pages: [
      'Liam started writing letters to a pen pal in Japan named Hiro.',
      'They shared stories about their schools, hobbies, and families.',
      'Liam learned about Japanese holidays and taught Hiro about Thanksgiving.',
      'After two years, Hiro\'s family visited America.',
      'Meeting his pen pal in person was the best day ever!',
      'Friendship can cross oceans and connect different worlds.'
    ],
    moral: 'Friendship knows no borders.'
  },
  {
    id: 'g4-9', title: 'The Weather Watcher', author: 'Kid Genius', cover: '🌤️', gradeLevel: 6, category: 'learning',
    pages: [
      'Nina kept a weather journal, recording temperatures and cloud types every day.',
      'Her classmates thought it was boring. "Why do you care about clouds?"',
      'One day, Nina noticed signs of a coming storm that the forecasters missed.',
      'She warned her school, and everyone got home safely before the blizzard hit.',
      'The town called her a hero. Nina was proud of her science skills.',
      'Paying attention to details can make a big difference.'
    ],
    moral: 'Knowledge and observation are powerful tools.'
  },
  {
    id: 'g4-10', title: 'The Music of the Heart', author: 'Kid Genius', cover: '🎵', gradeLevel: 6, category: 'family',
    pages: [
      'Melody\'s grandmother could no longer remember many things.',
      'She often looked confused and sad. Melody felt helpless.',
      'One day, Melody played her grandmother\'s favorite song on the piano.',
      'Grandmother\'s eyes lit up! She started humming and smiling.',
      'Music helped them connect, even when words didn\'t work.',
      'Love finds a way to reach those we care about.'
    ],
    moral: 'Love finds ways to connect hearts.'
  },

  // GRADE 5 (Level 7) - Complex narratives, rich vocabulary, 6-7 pages
  {
    id: 'g5-1', title: 'The Code Breakers', author: 'Kid Genius', cover: '🔐', gradeLevel: 7, category: 'adventure',
    pages: [
      'Zara and her friends found an old journal written entirely in code.',
      'They spent weeks trying to decipher the mysterious symbols.',
      'Each page revealed clues about a treasure hidden in their town.',
      'They followed riddles to the old library, the clock tower, and finally the park fountain.',
      'Behind a loose stone, they found a box full of vintage photographs.',
      'The "treasure" was the town\'s history, preserved by someone long ago.',
      'The real treasure was the adventure and friendship they shared.'
    ],
    moral: 'The journey is often more valuable than the destination.'
  },
  {
    id: 'g5-2', title: 'Standing Up', author: 'Kid Genius', cover: '🦸', gradeLevel: 7, category: 'friendship',
    pages: [
      'When new student Kai was being teased, everyone looked away—except Mira.',
      'She walked over and sat next to Kai at lunch. "Can I join you?"',
      'The bullies were surprised. No one had ever stood up to them before.',
      'Soon, other students joined Mira and Kai\'s table.',
      'The bullies realized their behavior wasn\'t cool anymore.',
      'Standing up for others takes courage, but it can change everything.',
      'Mira learned that one person\'s bravery can inspire many.'
    ],
    moral: 'One brave person can change the world.'
  },
  {
    id: 'g5-3', title: 'The Migration Journey', author: 'Kid Genius', cover: '🦋', gradeLevel: 7, category: 'nature',
    pages: [
      'A young monarch butterfly named Mona began her first migration south.',
      'She flew over mountains, rivers, and endless fields.',
      'Sometimes the wind was strong and pushed her backward.',
      'Other butterflies helped her find food and shelter along the way.',
      'After thousands of miles, she reached the wintering grounds in Mexico.',
      'Millions of butterflies covered the trees like orange blankets.',
      'Mona had completed the incredible journey her ancestors had made for generations.'
    ],
    moral: 'Perseverance helps us achieve incredible things.'
  },
  {
    id: 'g5-4', title: 'The Debate', author: 'Kid Genius', cover: '🎤', gradeLevel: 7, category: 'learning',
    pages: [
      'The school debate topic was difficult: "Should homework be banned?"',
      'Alex was assigned to argue FOR homework, even though he didn\'t like it.',
      'He researched and found that some homework does help learning.',
      'During the debate, he presented his arguments clearly and respectfully.',
      'His opponent made good points too. They learned from each other.',
      'Alex\'s team didn\'t win, but he felt proud of his work.',
      'Understanding different perspectives makes us wiser.'
    ],
    moral: 'Understanding different perspectives makes us wiser.'
  },
  {
    id: 'g5-5', title: 'The Midnight Library', author: 'Kid Genius', cover: '📚', gradeLevel: 7, category: 'fantasy',
    pages: [
      'At exactly midnight, the old library transformed into something magical.',
      'Characters from books came alive and walked among the shelves.',
      'Rosa discovered this secret and befriended a talking cat from a fairy tale.',
      'She met brave heroes, clever detectives, and wise wizards.',
      'But when morning came, everyone returned to their books.',
      'Rosa kept the secret, visiting her literary friends every night.',
      'Books hold entire worlds, just waiting to be explored.'
    ],
    moral: 'Books open doors to endless worlds.'
  },
  {
    id: 'g5-6', title: 'The Climate Champions', author: 'Kid Genius', cover: '🌍', gradeLevel: 7, category: 'learning',
    pages: [
      'Students noticed the stream behind their school was polluted and lifeless.',
      'They formed the Climate Champions club and made a plan.',
      'They organized clean-up days and planted native plants along the banks.',
      'They presented to the town council about reducing pollution from local factories.',
      'Slowly, the water became cleaner. Fish and frogs returned!',
      'Their small actions had created big changes.',
      'Young people have the power to heal the planet.'
    ],
    moral: 'Young people can make a real difference.'
  },
  {
    id: 'g5-7', title: 'The Exchange Student', author: 'Kid Genius', cover: '🌏', gradeLevel: 7, category: 'friendship',
    pages: [
      'Amara was nervous about living with a family in a new country for a year.',
      'At first, everything felt strange—the food, the language, the customs.',
      'But her host family was patient and kind.',
      'She taught them about her home country while learning about theirs.',
      'By the end of the year, she had two families and two homes.',
      'Saying goodbye was hard, but she knew she\'d be back.',
      'The world becomes smaller when we open our hearts to new experiences.'
    ],
    moral: 'Opening your heart to new experiences enriches your life.'
  },
  {
    id: 'g5-8', title: 'The Science Fair', author: 'Kid Genius', cover: '🔬', gradeLevel: 7, category: 'learning',
    pages: [
      'Leo spent months perfecting his science fair project on renewable energy.',
      'The night before the fair, his model solar panel broke!',
      'He stayed up all night fixing it, feeling frustrated and exhausted.',
      'At the fair, his project impressed the judges with its innovation.',
      'He won second place—but more importantly, he was proud of his effort.',
      'His work inspired three younger students to pursue science.',
      'The impact we have on others matters more than any prize.'
    ],
    moral: 'Inspiring others is the greatest achievement.'
  },
  {
    id: 'g5-9', title: 'Grandmother\'s Recipes', author: 'Kid Genius', cover: '📖', gradeLevel: 7, category: 'family',
    pages: [
      'When Grandmother passed away, Sofia inherited her recipe book.',
      'The pages were stained and the handwriting was faded, but each recipe told a story.',
      'The soup recipe had notes about feeding neighbors during hard times.',
      'The birthday cake recipe mentioned celebrations spanning three generations.',
      'Sofia started cooking Grandmother\'s dishes, keeping her memory alive.',
      'She added her own notes for future generations.',
      'Family traditions connect us across time.'
    ],
    moral: 'Traditions connect generations and keep memories alive.'
  },
  {
    id: 'g5-10', title: 'The Last Game', author: 'Kid Genius', cover: '⚾', gradeLevel: 7, category: 'adventure',
    pages: [
      'Coach Martinez announced his retirement after thirty years of coaching.',
      'The team wanted to win the championship as a farewell gift.',
      'They trained harder than ever, supporting each other through tough practices.',
      'In the final game, they were down by two runs in the last inning.',
      'With two outs, Maya hit a home run that won the game!',
      'The team lifted Coach Martinez on their shoulders.',
      'They had given him the perfect goodbye—but more importantly, they\'d become a family.'
    ],
    moral: 'True victory is found in teamwork and love.'
  },
  {
    id: 'pk-11', title: 'Max Makes Ten', author: 'Kid Genius Originals', cover: 'TEN', gradeLevel: 1, category: 'learning',
    pages: ['Max puts one red block on the mat.', 'He adds more blocks one at a time.', 'His teacher says, "Count slowly and touch each block."', 'Max counts all the way to ten.', 'Ten blocks make a tall, proud tower.'],
    moral: 'Counting carefully helps numbers make sense.'
  },
  {
    id: 'pk-12', title: 'The Listening Line', author: 'Kid Genius Originals', cover: 'EAR', gradeLevel: 1, category: 'friendship',
    pages: ['The class lines up for music.', 'Sam wants to run, but he hears the teacher say walk.', 'Sam takes slow feet and waits his turn.', 'The whole line gets to music safely.', 'Listening helps everyone learn together.'],
    moral: 'Listening is part of learning.'
  },
  {
    id: 'k-11', title: 'The Shape Shop', author: 'Kid Genius Originals', cover: 'SHAPE', gradeLevel: 2, category: 'learning',
    pages: ['Mina opens a pretend shape shop.', 'She sells circle cookies, square napkins, and triangle flags.', 'A customer asks for something with four equal sides.', 'Mina points to the square napkin.', 'The shop works because Mina knows shape clues.'],
    moral: 'Shape clues help us describe the world.'
  },
  {
    id: 'k-12', title: 'Rain Chart Day', author: 'Kid Genius Originals', cover: 'RAIN', gradeLevel: 2, category: 'nature',
    pages: ['The class checks the window each morning.', 'On Monday it rains. On Tuesday it is sunny.', 'They add marks to a weather chart.', 'By Friday, they can tell which weather happened most.', 'Charts help the class see patterns.'],
    moral: 'Data helps us remember and compare.'
  },
  {
    id: 'g1-11', title: 'Ava Solves the Snack Problem', author: 'Kid Genius Originals', cover: 'SNACK', gradeLevel: 3, category: 'learning',
    pages: ['Ava has eight crackers for snack.', 'She gives three crackers to her brother.', 'At first, she guesses how many are left.', 'Then she draws eight circles and crosses out three.', 'Now Ava can see five crackers are left.'],
    moral: 'Drawing a model can help solve a math story.'
  },
  {
    id: 'g1-12', title: 'The Map of Room 12', author: 'Kid Genius Originals', cover: 'MAP', gradeLevel: 3, category: 'learning',
    pages: ['Room 12 makes a map of the classroom.', 'They draw the door, rug, shelves, and reading table.', 'Nico adds a star where the class pet sits.', 'A visitor uses the map to find the pet corner.', 'The class learns that maps are useful pictures.'],
    moral: 'Maps help people find important places.'
  },
  {
    id: 'g2-11', title: 'The Fair Share Table', author: 'Kid Genius Originals', cover: 'SHARE', gradeLevel: 4, category: 'friendship',
    pages: ['Sixteen markers sit in the middle of the table.', 'Four teams need the same number for a poster project.', 'Lena starts giving one marker to each team at a time.', 'Every team ends with four markers.', 'The posters begin without arguing.'],
    moral: 'Fair sharing uses math and kindness.'
  },
  {
    id: 'g2-12', title: 'The Sound Experiment', author: 'Kid Genius Originals', cover: 'SOUND', gradeLevel: 4, category: 'learning',
    pages: ['Omar taps a rubber band softly.', 'Then he pulls it tighter and plucks again.', 'The second sound is higher.', 'He writes what changed and what he heard.', 'His notes help him explain the experiment.'],
    moral: 'Good scientists notice changes and keep notes.'
  },
  {
    id: 'g3-11', title: 'The Debate Board', author: 'Kid Genius Originals', cover: 'CLAIM', gradeLevel: 5, category: 'learning',
    pages: ['The class debates whether recess should include a garden station.', 'One team says gardens teach science.', 'Another team says gardens need time and care.', 'Ms. Nova asks each team to add evidence to the board.', 'The final vote feels fair because everyone used reasons.'],
    moral: 'Strong opinions need evidence.'
  },
  {
    id: 'g3-12', title: 'The Fraction Pizza Plan', author: 'Kid Genius Originals', cover: 'PIZZA', gradeLevel: 5, category: 'family',
    pages: ['Dad cuts a pizza into eight equal slices.', 'The family eats three slices at dinner.', 'Maya says five eighths are left.', 'She explains that the denominator stayed eight.', 'Dad smiles because dinner became a fraction lesson.'],
    moral: 'Fractions are equal parts of a whole.'
  },
  {
    id: 'g4-11', title: 'The Water Filter Team', author: 'Kid Genius Originals', cover: 'FILTER', gradeLevel: 6, category: 'learning',
    pages: ['The team builds a filter with cloth, sand, and gravel.', 'Their first cup still looks cloudy.', 'They slow the pour and add another sand layer.', 'The second test looks clearer.', 'Their report explains which change improved the design.'],
    moral: 'Testing and improving turns ideas into evidence.'
  },
  {
    id: 'g4-12', title: 'Mina Reads Two Sources', author: 'Kid Genius Originals', cover: 'SOURCE', gradeLevel: 6, category: 'learning',
    pages: ['Mina reads one article about a local storm.', 'Then she checks a weather chart from the same day.', 'Both sources say two inches of rain fell.', 'Mina trusts the detail more because the sources agree.', 'She cites both sources in her report.'],
    moral: 'Comparing sources can make evidence stronger.'
  },
  {
    id: 'g5-11', title: 'The Solar Proposal', author: 'Kid Genius Originals', cover: 'SOLAR', gradeLevel: 7, category: 'learning',
    pages: ['The student council wants solar panels for the school roof.', 'They collect sunlight data and electricity bills.', 'Their first proposal is too general.', 'They revise it with numbers, costs, and long-term savings.', 'The principal agrees to study the plan.'],
    moral: 'Specific evidence makes a proposal stronger.'
  },
  {
    id: 'g5-12', title: 'The Mentor Project', author: 'Kid Genius Originals', cover: 'MENTOR', gradeLevel: 7, category: 'friendship',
    pages: ['Fifth graders mentor younger students during reading lab.', 'Jada wants to give answers quickly.', 'Her teacher reminds her to ask guiding questions instead.', 'Jada asks, "What clue did you notice?"', 'The younger student smiles and solves it independently.'],
    moral: 'A good teacher helps someone think, not just finish.'
  },
];

const STORY_EXPANSION_TOPICS: Array<{ title: string; category: Story['category']; cover: string; moral: string }> = [
  { title: 'The Garden Promise', category: 'nature', cover: 'GARDEN', moral: 'Taking care of small things builds responsibility.' },
  { title: 'Robot Learns to Wait', category: 'learning', cover: 'ROBOT', moral: 'Patience helps us solve problems.' },
  { title: 'The Kind Seat', category: 'friendship', cover: 'KIND', moral: 'Kind choices help everyone feel welcome.' },
  { title: 'Maya Measures Twice', category: 'learning', cover: 'RULER', moral: 'Careful checking helps work improve.' },
  { title: 'The Rain Map', category: 'adventure', cover: 'MAP', moral: 'Plans can change when new clues appear.' },
  { title: 'Leo and the Little Bridge', category: 'learning', cover: 'BRIDGE', moral: 'Testing helps builders make better designs.' },
  { title: 'The Library Light', category: 'family', cover: 'BOOK', moral: 'Reading together grows ideas.' },
  { title: 'A Home for the Frog', category: 'animals', cover: 'FROG', moral: 'Living things need safe habitats.' },
  { title: 'The Music Parade', category: 'friendship', cover: 'MUSIC', moral: 'Practice and teamwork make a performance stronger.' },
  { title: 'The Star Notebook', category: 'fantasy', cover: 'STAR', moral: 'Wonder leads to good questions.' },
  { title: 'The Clean Water Team', category: 'nature', cover: 'WATER', moral: 'Communities can work together to solve problems.' },
  { title: 'The Puzzle Door', category: 'adventure', cover: 'PUZZLE', moral: 'A strategy can make a hard problem smaller.' },
  { title: 'The New Playground', category: 'friendship', cover: 'PLAY', moral: 'Listening helps a group make fair choices.' },
  { title: 'The Weather Window', category: 'learning', cover: 'SKY', moral: 'Observing patterns helps us predict what may happen.' },
  { title: 'The Helpful Code', category: 'learning', cover: 'CODE', moral: 'Clear steps help a computer and a person follow directions.' },
  { title: 'The Art Wall', category: 'family', cover: 'ART', moral: 'Art can tell a story without using many words.' },
  { title: 'The Tiny Seed Vote', category: 'nature', cover: 'SEED', moral: 'Evidence and reasons help people choose wisely.' },
  { title: 'The Brave First Try', category: 'adventure', cover: 'TRY', moral: 'First tries teach us what to improve next.' },
  { title: 'The Sharing Table', category: 'family', cover: 'TABLE', moral: 'Fair shares help everyone feel respected.' },
  { title: 'The Compass Club', category: 'adventure', cover: 'NORTH', moral: 'Directions and landmarks help us find the way.' },
];

const STORY_DETAIL_BANK = [
  { clue: 'a dry seed tray near the window', evidence: 'the watered tray sprouted first', fix: 'move the tray into sunlight and water it gently' },
  { clue: 'a robot waiting at a blocked square', evidence: 'the first command path hit the block', fix: 'turn before moving forward again' },
  { clue: 'one empty seat beside a nervous classmate', evidence: 'the classmate smiled after being invited', fix: 'offer the seat and ask a friendly question' },
  { clue: 'two ruler marks that did not match', evidence: 'the second measurement was more careful', fix: 'measure twice before cutting' },
  { clue: 'rain clouds above the walking path', evidence: 'the map route crossed an uncovered field', fix: 'choose the covered path by the library' },
  { clue: 'a bridge dipping under the first toy car', evidence: 'the folded bridge held more weight', fix: 'fold the paper into a stronger shape' },
  { clue: 'a quiet reader pointing to one hard word', evidence: 'reading together helped the page make sense', fix: 'sound out the word and reread the sentence' },
  { clue: 'a frog hiding beside a shallow puddle', evidence: 'the pond with shade had more insects', fix: 'choose a safer pond habitat' },
  { clue: 'a band losing the beat during practice', evidence: 'the steady clap helped everyone restart', fix: 'count the rhythm together before playing' },
  { clue: 'a moon drawing dated Monday', evidence: 'the shape changed later in the week', fix: 'record the sky pattern each night' },
  { clue: 'muddy water still cloudy after one pour', evidence: 'another sand layer made it clearer', fix: 'revise the filter and test again' },
  { clue: 'a puzzle path with too many choices', evidence: 'crossing out impossible doors left one route', fix: 'use a strategy to make the problem smaller' },
  { clue: 'friends disagreeing about playground rules', evidence: 'listening helped them choose a fair plan', fix: 'let each person explain one reason' },
  { clue: 'a weather chart showing warmer afternoons', evidence: 'several days showed the same pattern', fix: 'compare more than one day before predicting' },
  { clue: 'code steps written in the wrong order', evidence: 'the robot reached the goal after the order changed', fix: 'put the commands in a clear sequence' },
  { clue: 'a drawing with no clear main idea', evidence: 'one strong symbol made the mural easier to understand', fix: 'choose a focal point before adding details' },
  { clue: 'two seed choices on the voting board', evidence: 'students gave reasons before voting', fix: 'use evidence instead of choosing quickly' },
  { clue: 'a first prototype tipping over', evidence: 'a wider base made the model stand', fix: 'treat the first try as information' },
  { clue: 'snacks split unevenly at the table', evidence: 'equal groups helped everyone feel respected', fix: 'count the shares before passing them out' },
  { clue: 'a compass arrow pointing north', evidence: 'the group found the trail after matching landmarks', fix: 'use directions and landmarks together' },
];

const EXPANDED_STORIES: Story[] = STORY_EXPANSION_TOPICS.flatMap((topic, topicIndex) =>
  Array.from({ length: 7 }, (_, gradeIndex) => Array.from({ length: 2 }, (_, variantIndex) => {
    const gradeLevel = gradeIndex + 1;
    const title = `${topic.title} ${gradeLevel}.${variantIndex + 1}`;
    const detail = STORY_DETAIL_BANK[(topicIndex + variantIndex) % STORY_DETAIL_BANK.length];
    return {
      id: `story-expanded-${topicIndex + 1}-g${gradeLevel}-v${variantIndex + 1}`,
      title,
      author: 'Kid Genius Originals',
      cover: topic.cover,
      gradeLevel,
      category: topic.category,
      pages: gradeLevel <= 2
        ? [
          `${title} begins with one small problem.`,
          `The child looks closely and notices ${detail.clue}.`,
          'A helper asks, "What can we try first?"',
          `They ${detail.fix} and notice what changes.`,
          topic.moral,
        ]
        : gradeLevel <= 4
          ? [
            `${title} begins when the class notices a problem that needs a plan.`,
            `They notice ${detail.clue} and compare it with what they already know.`,
            'One student suggests a strategy, and another student checks whether it is fair.',
            `The group revises the plan because ${detail.evidence}.`,
            topic.moral,
          ]
          : [
            `${title} opens with a claim that needs evidence before the group can decide.`,
            `The students examine how ${detail.evidence}, then separate facts from opinions.`,
            `They test a solution, explain the strongest reason, and ${detail.fix}.`,
            'By the end, the group can teach the lesson to a younger student.',
            topic.moral,
          ],
      moral: topic.moral,
    };
  })).flat()
);

export const ALL_STORIES = [...STORIES, ...EXPANDED_STORIES];

export const StoryBook: React.FC<StoryBookProps> = ({ level, onBack, onReward }) => {
  const availableStories = useMemo(() => ALL_STORIES.filter(s => s.gradeLevel <= level), [level]);

  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [mode, setMode] = useState<'select' | 'listen' | 'read' | 'quiz'>('select');
  const [completedStories, setCompletedStories] = useState<Set<string>>(new Set());
  const [narrationNotice, setNarrationNotice] = useState('');
  const [libraryCoachNotice, setLibraryCoachNotice] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<StoryQuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [quizTeacherCheck, setQuizTeacherCheck] = useState<{
    status: 'correct' | 'wrong';
    selectedAnswer: string;
    correctAnswer: string;
    detail: string;
  } | null>(null);

  useEffect(() => {
    const handleNarrationStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ status: string; message: string }>).detail;
      if (!detail?.message) return;
      if (detail.status === 'ready') {
        setNarrationNotice('');
        return;
      }
      setNarrationNotice(detail.message);
    };

    window.addEventListener('kidgenius:narration-status', handleNarrationStatus);
    return () => window.removeEventListener('kidgenius:narration-status', handleNarrationStatus);
  }, []);

  const selectStory = (story: Story) => {
    setCurrentStory(story);
    setCurrentPage(0);
    setMode('listen');
    setLibraryCoachNotice('');
    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizCorrectCount(0);
    setQuizFeedback('');
    setQuizTeacherCheck(null);
  };

  const startStoryQuiz = async () => {
    if (!currentStory) return;
    const questions = buildStoryQuiz(currentStory, level);
    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizCorrectCount(0);
    setQuizFeedback('');
    setQuizTeacherCheck(null);
    setMode('quiz');
    await speakAsync(`Story check. Answer ${questions.length} questions, then I will guide you to the next book.`, 0.78, 1.02, 'story');
    if (questions[0]) {
      await speakAsync(`${questions[0].question} ${questions[0].options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join('. ')}`, 0.78, 1.02, 'story');
    }
  };

  const finishStoryAfterQuiz = async (finalCorrectCount: number) => {
    if (!currentStory) return;
    playSuccess();
    const completedStoryIds = new Set(completedStories);
    completedStoryIds.add(currentStory.id);
    setCompletedStories(completedStoryIds);
    onReward({
      questionId: `storybook-${currentStory.id}`,
      skill: `story comprehension grade ${currentStory.gradeLevel}`,
      prompt: `Completed ${currentStory.title} quiz`,
      selectedAnswer: `${finalCorrectCount}/${quizQuestions.length} correct`,
      correctAnswer: currentStory.moral || currentStory.title,
    });
    const nextStory = availableStories.find(story => !completedStoryIds.has(story.id) && story.id !== currentStory.id);
    const completedCount = completedStoryIds.size;
    const nextRoundLabel = Math.min(completedCount + 1, 6);
    await speakAsync(
      nextStory
        ? `Story complete. You got ${finalCorrectCount} correct. I am opening the next book, ${nextRoundLabel} out of 6: ${nextStory.title}.`
        : `Story complete. You got ${finalCorrectCount} correct. You finished the available books for this shelf.`,
      0.76,
      1.02,
      'story'
    );
    const finishedTitle = currentStory.title;
    setLibraryCoachNotice(nextStory
      ? `${finishedTitle} complete. Ms. Nova opened the next book: ${nextStory.title} (${nextRoundLabel}/6).`
      : `${finishedTitle} complete. This shelf is ready for parent review.`);
    window.setTimeout(() => {
      setCurrentStory(nextStory || null);
      setCurrentPage(0);
      setMode(nextStory ? 'listen' : 'select');
      setQuizQuestions([]);
      setQuizIndex(0);
      setQuizCorrectCount(0);
      setQuizFeedback('');
      setQuizTeacherCheck(null);
    }, 1600);
  };

  const answerQuiz = (answer: string) => {
    const question = quizQuestions[quizIndex];
    if (!question) return;
    const correct = answer === question.answer;
    const nextCorrectCount = quizCorrectCount + (correct ? 1 : 0);
    setQuizCorrectCount(nextCorrectCount);
    setQuizFeedback(correct ? 'Correct. Nice evidence.' : `Good try. The best answer is: ${question.answer}`);
    setQuizTeacherCheck({
      status: correct ? 'correct' : 'wrong',
      selectedAnswer: answer,
      correctAnswer: question.answer,
      detail: correct
        ? 'You used the story clue correctly.'
        : 'Go back to the story clue and compare the answer choices.',
    });
    void (correct
      ? speakAsync('Correct. Nice evidence.', 0.78, 1.02, 'story')
      : speakAsync(`Good try. The best answer is ${question.answer}.`, 0.78, 1.02, 'story'));

    window.setTimeout(() => {
      const nextIndex = quizIndex + 1;
      if (nextIndex >= quizQuestions.length) {
        void finishStoryAfterQuiz(nextCorrectCount);
        return;
      }
      setQuizIndex(nextIndex);
      setQuizFeedback('');
      setQuizTeacherCheck(null);
      const nextQuestion = quizQuestions[nextIndex];
      void speakAsync(`${nextQuestion.question} ${nextQuestion.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join('. ')}`, 0.78, 1.02, 'story');
    }, 1100);
  };

  const readCurrentPage = async () => {
    if (!currentStory || isReading) return;

    setNarrationNotice('');
    setIsReading(true);
    await speakAsync(currentStory.pages[currentPage], 0.72, 1.0, 'story');
    setIsReading(false);
  };

  const readEntireStory = async () => {
    if (!currentStory || isReading) return;

    setNarrationNotice('');
    setIsReading(true);
    // Read title
    await speakAsync(`${currentStory.title}. By ${currentStory.author}.`, 0.72, 1.05, 'story');
    await new Promise(r => setTimeout(r, 700));

    // Read each page
    for (let i = 0; i < currentStory.pages.length; i++) {
      setCurrentPage(i);
      await speakAsync(currentStory.pages[i], 0.72, 1.0, 'story');
      await new Promise(r => setTimeout(r, 950));
    }

    // Read moral if exists
    if (currentStory.moral) {
      await speakAsync(`The moral of the story is: ${currentStory.moral}`, 0.72, 1.0, 'story');
    }

    setIsReading(false);
    void startStoryQuiz();
  };

  const completeCurrentStory = () => {
    if (!currentStory || completedStories.has(currentStory.id)) return;
    stopSpeaking();
    setIsReading(false);
    void startStoryQuiz();
  };

  const stopReading = () => {
    stopSpeaking();
    setIsReading(false);
  };

  const nextPage = () => {
    if (currentStory && currentPage < currentStory.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToLibrary = () => {
    stopSpeaking();
    setCurrentStory(null);
    setMode('select');
    setQuizFeedback('');
  };

  const switchToReadMode = () => {
    stopSpeaking();
    setMode('read');
    setCurrentPage(0);
  };

  const getCategoryColor = (category: Story['category']) => {
    switch (category) {
      case 'adventure': return 'from-orange-400 to-red-500';
      case 'animals': return 'from-green-400 to-emerald-500';
      case 'friendship': return 'from-pink-400 to-rose-500';
      case 'family': return 'from-purple-400 to-indigo-500';
      case 'nature': return 'from-cyan-400 to-blue-500';
      case 'fantasy': return 'from-violet-400 to-purple-500';
      case 'learning': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getCoverScene = (story: Story) => {
    const sceneMap: Record<Story['category'], { sky: string; ground: string; accent: string; label: string; shape: string }> = {
      adventure: { sky: 'from-sky-300 via-orange-100 to-amber-200', ground: 'bg-orange-500', accent: 'bg-red-400', label: 'Quest', shape: 'rounded-t-full' },
      animals: { sky: 'from-emerald-200 via-lime-100 to-sky-200', ground: 'bg-emerald-600', accent: 'bg-lime-300', label: 'Animal Tale', shape: 'rounded-full' },
      friendship: { sky: 'from-rose-200 via-pink-100 to-sky-100', ground: 'bg-rose-500', accent: 'bg-pink-300', label: 'Friendship', shape: 'rounded-full' },
      family: { sky: 'from-violet-200 via-fuchsia-100 to-amber-100', ground: 'bg-violet-600', accent: 'bg-amber-300', label: 'Family Story', shape: 'rounded-2xl' },
      nature: { sky: 'from-cyan-200 via-sky-100 to-emerald-100', ground: 'bg-cyan-600', accent: 'bg-emerald-300', label: 'Nature Reader', shape: 'rounded-full' },
      fantasy: { sky: 'from-indigo-300 via-violet-200 to-pink-100', ground: 'bg-indigo-700', accent: 'bg-fuchsia-300', label: 'Fantasy', shape: 'rounded-t-full' },
      learning: { sky: 'from-yellow-200 via-amber-100 to-sky-100', ground: 'bg-amber-600', accent: 'bg-yellow-300', label: 'Learning Story', shape: 'rounded-xl' },
    };
    return sceneMap[story.category];
  };

  const renderPremiumCover = (story: Story) => {
    const scene = getCoverScene(story);
    const initials = story.title
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();

    return (
      <div className={`relative h-full w-full overflow-hidden bg-gradient-to-b ${scene.sky}`}>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-white/20" />
        <div className={`absolute -left-8 bottom-8 h-20 w-28 ${scene.ground} opacity-80 blur-sm`} />
        <div className={`absolute -right-6 bottom-6 h-24 w-32 ${scene.accent} opacity-80 blur-sm`} />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm">
            {scene.label}
          </span>
          <span className="rounded-full bg-slate-950/85 px-2 py-1 text-[10px] font-black text-white shadow-sm">
            G{story.gradeLevel}
          </span>
        </div>
        <div className={`absolute left-1/2 top-[38%] flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${scene.shape} bg-white/85 text-3xl font-black text-slate-900 shadow-2xl ring-4 ring-white/50`}>
          {initials}
        </div>
        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/90 p-3 text-left shadow-xl">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{story.category}</p>
          <p className="mt-1 line-clamp-2 text-sm font-black leading-tight text-slate-900">{story.title}</p>
        </div>
      </div>
    );
  };

  // Library View
  if (!currentStory) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-amber-100 via-orange-100 to-yellow-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <button onClick={onBack} aria-label="Back to world map" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={28} />
            <span className="text-2xl font-bold drop-shadow">Story Library</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Heart className="text-red-200 fill-red-200" size={20} />
            <span className="font-bold">{completedStories.size}</span>
          </div>
        </div>

        {/* Story Grid */}
        <div className="flex-1 overflow-auto p-4">
          <p className="text-center text-gray-600 mb-4">Choose a story to read. New shelves open as your grade level grows.</p>
          {libraryCoachNotice && (
            <div className="mx-auto mb-4 max-w-3xl rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-900 shadow-sm">
              {libraryCoachNotice}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableStories.map(story => (
              <button
                key={story.id}
                onClick={() => selectStory(story)}
                className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-left relative overflow-hidden"
              >
                {completedStories.has(story.id) && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <Star size={16} fill="white" />
                  </div>
                )}
                <div className="mb-3 rounded-2xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-inner">
                  <img
                    src={`/story-covers/${story.id}.png`}
                    alt={story.title}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = `/story-covers/${story.id}.svg`;
                    }}
                  />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{story.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{getStoryShelfLabel(story.gradeLevel)} • {story.pages.length} pages</p>
                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(story.category)} text-white`}>
                  {story.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Story Reading View
  if (mode === 'quiz' && currentStory) {
    const activeQuestion = quizQuestions[quizIndex];
    return (
      <div className="w-full h-full bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <button onClick={goToLibrary} aria-label="Back to story library" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg drop-shadow">Story Check</h1>
            <p className="text-xs text-white/85">{currentStory.title}</p>
          </div>
          <div className="rounded-full bg-white/20 px-3 py-2 text-sm font-black">
            {Math.min(quizIndex + 1, quizQuestions.length)}/{quizQuestions.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl rounded-[32px] border-4 border-white bg-white p-5 shadow-2xl">
            <div className="rounded-[26px] bg-amber-50 p-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-600">Mini test before the next book</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">{activeQuestion?.question}</h2>
              <p className="mt-2 text-sm font-bold text-slate-600">
                Answer the story questions. Ms. Nova will guide you to the next book when you finish.
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {activeQuestion?.options.map((option, index) => (
                <button
                  key={`${activeQuestion.question}-${option}`}
                  onClick={() => answerQuiz(option)}
                  disabled={Boolean(quizFeedback)}
                  className="rounded-2xl border-2 border-amber-100 bg-white px-4 py-4 text-left text-base font-black text-slate-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {quizTeacherCheck && (
              <div className={`mt-5 rounded-2xl border-2 p-4 ${
                quizTeacherCheck.status === 'correct'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}>
                <div className="flex items-start gap-3">
                  {quizTeacherCheck.status === 'correct' ? <CheckCircle2 className="shrink-0" /> : <XCircle className="shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black uppercase tracking-[0.16em]">
                      Teacher Check
                    </div>
                    <p className="mt-1 text-sm font-black">{quizFeedback}</p>
                    <div className="mt-3 grid gap-2 text-sm font-bold text-slate-700 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/85 p-3 shadow-sm">
                        Your answer: {quizTeacherCheck.selectedAnswer}
                      </div>
                      <div className="rounded-xl bg-white/85 p-3 shadow-sm">
                        Correct answer: {quizTeacherCheck.correctAnswer}
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">{quizTeacherCheck.detail}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <span>Score</span>
                <span>{quizCorrectCount}/{quizQuestions.length}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
                  style={{ width: `${quizQuestions.length ? (quizCorrectCount / quizQuestions.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <button onClick={goToLibrary} aria-label="Back to story library" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg drop-shadow">{currentStory.title}</h1>
          <p className="text-xs text-white/80">by {currentStory.author}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode(mode === 'listen' ? 'read' : 'listen')}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
              mode === 'listen' ? 'bg-white text-orange-600' : 'bg-white/20'
            }`}
          >
            {mode === 'listen' ? '🎧 Listen' : '📖 Read'}
          </button>
        </div>
      </div>

      {/* Book Cover/Page Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative" style={{
          background: 'linear-gradient(145deg, #fff9e6, #fff)',
          boxShadow: '20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff'
        }}>
          {/* Book spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-amber-300 to-amber-200 rounded-l-3xl" />

          {/* Page content */}
          <div className="ml-4">
            {/* Page indicator */}
            <div className="text-center mb-4">
              <span className="text-sm text-gray-400 font-medium">
                Page {currentPage + 1} of {currentStory.pages.length}
              </span>
            </div>

            {/* Story emoji */}
            <div className="text-6xl text-center mb-6 animate-bounce">
              {currentStory.cover}
            </div>

            {/* Story text */}
            <p className="text-xl md:text-2xl text-gray-800 leading-relaxed text-center font-serif">
              {currentStory.pages[currentPage]}
            </p>

            {narrationNotice && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                {narrationNotice}
              </div>
            )}

            {/* Moral at the end */}
            {currentPage === currentStory.pages.length - 1 && currentStory.moral && (
              <div className="mt-6 p-4 bg-amber-100 rounded-xl">
                <p className="text-center text-amber-800 font-semibold">
                  ✨ {currentStory.moral}
                </p>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8 ml-4">
            <button
              onClick={prevPage}
              aria-label="Previous story page"
              disabled={currentPage === 0}
              className={`p-3 rounded-full transition ${
                currentPage === 0 ? 'bg-gray-100 text-gray-300' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
              }`}
            >
              <ChevronLeft size={28} />
            </button>

            {/* Action buttons */}
            <div className="flex gap-3">
              {mode === 'listen' && (
                <>
                  {isReading ? (
                    <button
                      onClick={stopReading}
                      className="px-6 py-3 bg-red-500 text-white rounded-full font-bold flex items-center gap-2 hover:bg-red-600 transition"
                    >
                      <Pause size={20} /> Stop
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={readCurrentPage}
                        className="px-4 py-3 bg-amber-500 text-white rounded-full font-bold flex items-center gap-2 hover:bg-amber-600 transition"
                      >
                        <Volume2 size={20} /> This Page
                      </button>
                      <button
                        onClick={readEntireStory}
                        disabled={completedStories.has(currentStory.id)}
                        className="px-4 py-3 bg-green-500 text-white rounded-full font-bold flex items-center gap-2 hover:bg-green-600 transition"
                      >
                        <Play size={20} /> {completedStories.has(currentStory.id) ? 'Finished' : 'Whole Story'}
                      </button>
                    </>
                  )}
                </>
              )}
              {mode === 'read' && (
                <button
                  onClick={readCurrentPage}
                  className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold flex items-center gap-2 hover:bg-blue-600 transition"
                >
                  <Mic2 size={20} /> Help Me
                </button>
              )}
              {currentPage === currentStory.pages.length - 1 && (
                <button
                  onClick={completeCurrentStory}
                  disabled={completedStories.has(currentStory.id)}
                  className="px-4 py-3 bg-emerald-600 text-white rounded-full font-bold flex items-center gap-2 hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:bg-emerald-200"
                >
                  <Star size={20} fill="currentColor" />
                  {completedStories.has(currentStory.id) ? 'Story Finished' : 'I Finished Reading'}
                </button>
              )}
            </div>

            <button
              onClick={nextPage}
              aria-label="Next story page"
              disabled={currentPage === currentStory.pages.length - 1}
              className={`p-3 rounded-full transition ${
                currentPage === currentStory.pages.length - 1 ? 'bg-gray-100 text-gray-300' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
              }`}
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-4">
        {currentStory.pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            aria-label={`Go to story page ${i + 1}`}
            className={`w-3 h-3 rounded-full transition ${
              i === currentPage ? 'bg-amber-500 scale-125' : 'bg-amber-200 hover:bg-amber-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
