import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Award, BrainCircuit, Calculator, CheckCircle2, Flag, Gamepad2, Map,
  ListChecks, Music, Play, RefreshCw, Route, Shapes, Sparkles, Type
} from 'lucide-react';
import { RoomType, UserProgress } from '../types';
import { playError, playPop, playSuccess } from '../services/audioService';
import { pickDailyItem, shuffleDailyItems } from '../services/dailyRotation';

interface GameArcadeProps {
  progress: UserProgress;
  onBack: () => void;
  onOpenRoom: (room: RoomType) => void;
  onReward: (room: RoomType, gameTitle: string, gameId: string, combo: number) => void;
}

type ArcadeGameId = 'number-dash' | 'word-builder' | 'pattern-quest' | 'story-detective' | 'robot-maze' | 'rhythm-tap';

interface ArcadeGame {
  id: ArcadeGameId;
  title: string;
  room: RoomType;
  label: string;
  description: string;
  proof: string;
  gradient: string;
  tint: string;
  iconTone: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface ArcadePrompt {
  prompt: string;
  helper: string;
  skill: string;
  levelTag: string;
  coach: string;
  success: string;
  answer: string;
  options: string[];
}

const ARCADE_GAMES: ArcadeGame[] = [
  {
    id: 'number-dash',
    title: 'Number Dash',
    room: RoomType.MATH,
    label: 'Math sprint',
    description: 'Fast number missions with manipulatives, streaks, and clean win moments.',
    proof: 'Operation choice, fluency, and strategy talk',
    gradient: 'from-indigo-600 via-blue-600 to-sky-500',
    tint: 'border-indigo-100 bg-indigo-50',
    iconTone: 'bg-indigo-100 text-indigo-700',
    icon: Calculator,
  },
  {
    id: 'word-builder',
    title: 'Word Builder',
    room: RoomType.READING,
    label: 'Reading lab',
    description: 'Build missing sounds, sight words, and vocabulary with short rounds.',
    proof: 'Phonics, sight words, vocabulary, and fluency',
    gradient: 'from-orange-500 via-amber-500 to-yellow-400',
    tint: 'border-amber-100 bg-amber-50',
    iconTone: 'bg-amber-100 text-amber-700',
    icon: Type,
  },
  {
    id: 'pattern-quest',
    title: 'Pattern Quest',
    room: RoomType.PUZZLE,
    label: 'Logic game',
    description: 'Predict what comes next with visual rules and increasing challenge.',
    proof: 'Pattern logic, working memory, and attention',
    gradient: 'from-teal-500 via-emerald-500 to-lime-400',
    tint: 'border-emerald-100 bg-emerald-50',
    iconTone: 'bg-emerald-100 text-emerald-700',
    icon: Shapes,
  },
  {
    id: 'story-detective',
    title: 'Story Detective',
    room: RoomType.STORYBOOK,
    label: 'Comprehension',
    description: 'Read a tiny scene, find the clue, and choose the best answer.',
    proof: 'Evidence, retelling, cause and effect, and inference',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    tint: 'border-rose-100 bg-rose-50',
    iconTone: 'bg-rose-100 text-rose-700',
    icon: BrainCircuit,
  },
  {
    id: 'robot-maze',
    title: 'Robot Maze',
    room: RoomType.CODING,
    label: 'Code puzzle',
    description: 'Pick the command path that gets the robot to the goal.',
    proof: 'Sequencing, loops, debugging, and planning',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-500',
    tint: 'border-violet-100 bg-violet-50',
    iconTone: 'bg-violet-100 text-violet-700',
    icon: Gamepad2,
  },
  {
    id: 'rhythm-tap',
    title: 'Rhythm Tap',
    room: RoomType.MUSIC,
    label: 'Music game',
    description: 'Listen with your eyes, copy rhythm patterns, and build musical memory.',
    proof: 'Rhythm, listening patterns, and focus',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-400',
    tint: 'border-pink-100 bg-pink-50',
    iconTone: 'bg-pink-100 text-pink-700',
    icon: Music,
  },
];

const shuffle = <T,>(items: T[], scope: string, step: number) => shuffleDailyItems(items, scope, step);

const makeOptions = (answer: string, distractors: string[], scope: string, step: number) =>
  shuffle(
    [answer, ...shuffle(Array.from(new Set(distractors.filter(item => item !== answer))), `${scope}-distractors`, step).slice(0, 3)],
    `${scope}-answers`,
    step
  );

const tileTone = (value: string) => {
  const key = value.toLowerCase();
  if (key.includes('red')) return 'bg-rose-400 text-white border-rose-500';
  if (key.includes('blue')) return 'bg-sky-400 text-white border-sky-500';
  if (key.includes('green')) return 'bg-emerald-400 text-white border-emerald-500';
  if (key.includes('yellow')) return 'bg-yellow-300 text-yellow-950 border-yellow-400';
  if (key.includes('circle')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  if (key.includes('square')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (key.includes('triangle')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (key.includes('star')) return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
  return 'bg-white text-slate-800 border-slate-200';
};

const commandParts = (value: string) => value.split(',').map(part => part.trim()).filter(Boolean);

const buildPrompt = (gameId: ArcadeGameId, level: number, roundStep: number): ArcadePrompt => {
  if (gameId === 'number-dash') {
    const mathMissions = level <= 2
      ? [
        { first: 4, second: 3, skill: 'Count On', coach: 'Start at the bigger number and count forward.', success: 'You counted on instead of guessing.' },
        { first: 6, second: 2, skill: 'Part-Part-Whole', coach: 'Touch each group, then combine the parts.', success: 'You joined two parts into one whole.' },
        { first: 5, second: 5, skill: 'Doubles', coach: 'Doubles are two equal groups.', success: 'You spotted a doubles fact.' },
        { first: 8, second: 1, skill: 'One More', coach: 'One more means the next number.', success: 'You used the next-number strategy.' },
      ]
      : level <= 4
        ? [
          { first: 9, second: 6, skill: 'Bridge to Ten', coach: 'Make ten first, then add what is left.', success: 'You used a bridge-to-ten strategy.' },
          { first: 18, second: 7, skill: 'Place Value', coach: 'Add ones, then check the tens.', success: 'You kept tens and ones organized.' },
          { first: 24, second: 12, skill: 'Two-Digit Addition', coach: 'Add tens with tens and ones with ones.', success: 'You solved a two-digit addition mission.' },
          { first: 35, second: 9, skill: 'Friendly Tens', coach: 'Move toward the next friendly ten.', success: 'You used a friendly-ten shortcut.' },
        ]
        : [
          { first: 125, second: 40, skill: 'Mental Math', coach: 'Add the tens first, then the ones.', success: 'You used mental math for a larger number.' },
          { first: 248, second: 35, skill: 'Regrouping Readiness', coach: 'Track ones, tens, and hundreds carefully.', success: 'You handled a larger addition path.' },
          { first: 360, second: 120, skill: 'Place-Value Addition', coach: 'Hundreds, tens, and ones each have a job.', success: 'You used place-value structure.' },
          { first: 475, second: 25, skill: 'Compensation', coach: 'Look for a number that makes a clean hundred.', success: 'You completed a compensation strategy.' },
          { first: 625, second: 75, skill: 'Make a Hundred', coach: 'Look for the jump that lands on a clean hundred.', success: 'You used compensation to land on a friendly number.' },
          { first: 840, second: 160, skill: 'Thousands Readiness', coach: 'Add hundreds first, then check the total.', success: 'You built a larger total with place-value thinking.' },
        ];
    const mission = pickDailyItem(mathMissions, `arcade-number-dash-grade-${level}`, roundStep);
    const first = mission.first;
    const second = mission.second;
    const answer = String(first + second);
    return {
      prompt: `${first} + ${second}`,
      helper: 'Solve the sprint problem, then say the strategy you used.',
      skill: mission.skill,
      levelTag: level <= 2 ? 'Foundation' : level <= 4 ? 'Guided Practice' : 'Challenge',
      coach: mission.coach,
      success: mission.success,
      answer,
      options: makeOptions(answer, [String(first + second + 1), String(first + second - 1), String(first + second + 3), String(Math.max(0, first + second - 3))], `arcade-number-dash-options-${level}-${answer}`, roundStep),
    };
  }

  if (gameId === 'word-builder') {
    const words = level <= 2
      ? [
        { clue: 'c_t', answer: 'a', word: 'cat', skill: 'Short A' },
        { clue: 's_n', answer: 'u', word: 'sun', skill: 'Short U' },
        { clue: 'h_t', answer: 'a', word: 'hat', skill: 'CVC Words' },
        { clue: 'p_g', answer: 'i', word: 'pig', skill: 'Short I' },
        { clue: 'b_d', answer: 'e', word: 'bed', skill: 'Short E' },
        { clue: 'd_g', answer: 'o', word: 'dog', skill: 'Short O' },
        { clue: 'm_p', answer: 'a', word: 'map', skill: 'Short A' },
        { clue: 'n_t', answer: 'e', word: 'net', skill: 'Short E' },
      ]
      : [
        { clue: 'pl_net', answer: 'a', word: 'planet', skill: 'Vowel Teams' },
        { clue: 'br_dge', answer: 'i', word: 'bridge', skill: 'Consonant Blends' },
        { clue: 'st_ry', answer: 'o', word: 'story', skill: 'Story Vocabulary' },
        { clue: 'fr_end', answer: 'i', word: 'friend', skill: 'Irregular Vowels' },
        { clue: 'm_sic', answer: 'u', word: 'music', skill: 'Long U' },
        { clue: 'r_bbit', answer: 'a', word: 'rabbit', skill: 'Syllable Check' },
        { clue: 'comp_ss', answer: 'a', word: 'compass', skill: 'Map Vocabulary' },
        { clue: 'evid_nce', answer: 'e', word: 'evidence', skill: 'Academic Vocabulary' },
      ];
    const item = pickDailyItem(words, `arcade-word-builder-grade-${level}`, roundStep);
    return {
      prompt: `Complete ${item.clue}`,
      helper: `Build the word ${item.word} by choosing the missing sound.`,
      skill: item.skill,
      levelTag: level <= 2 ? 'Sound Builder' : 'Word Builder',
      coach: 'Say the word slowly and listen for the missing sound.',
      success: `You completed ${item.word} with the right sound.`,
      answer: item.answer,
      options: makeOptions(item.answer, ['a', 'e', 'i', 'o', 'u'], `arcade-word-builder-options-${level}-${item.word}`, roundStep),
    };
  }

  if (gameId === 'pattern-quest') {
    const patterns = [
      { prompt: 'red, blue, red, blue, ?', answer: 'red', options: ['red', 'blue', 'green', 'yellow'], skill: 'AB Pattern' },
      { prompt: 'circle, square, circle, square, ?', answer: 'circle', options: ['circle', 'square', 'triangle', 'star'], skill: 'Shape Pattern' },
      { prompt: 'small, medium, large, small, medium, ?', answer: 'large', options: ['small', 'medium', 'large', 'tiny'], skill: 'Size Pattern' },
      { prompt: 'clap, stomp, clap, stomp, ?', answer: 'clap', options: ['clap', 'stomp', 'jump', 'spin'], skill: 'Movement Pattern' },
      { prompt: '2, 4, 6, 8, ?', answer: '10', options: ['9', '10', '11', '12'], skill: 'Skip Counting' },
      { prompt: '5, 10, 15, 20, ?', answer: '25', options: ['22', '24', '25', '30'], skill: 'Count by Fives' },
      { prompt: 'A, A, B, A, A, ?', answer: 'B', options: ['A', 'B', 'C', 'D'], skill: 'AAB Pattern' },
      { prompt: '3, 6, 9, 12, ?', answer: '15', options: ['13', '14', '15', '18'], skill: 'Count by Threes' },
      { prompt: 'red, red, blue, red, red, ?', answer: 'blue', options: ['red', 'blue', 'green', 'yellow'], skill: 'AAB Color Pattern' },
    ];
    const item = pickDailyItem(patterns.slice(0, level <= 2 ? 4 : patterns.length), `arcade-pattern-quest-grade-${level}`, roundStep);
    return {
      prompt: item.prompt,
      helper: 'Find the rule before you choose.',
      skill: item.skill,
      levelTag: level <= 2 ? 'Pattern Finder' : 'Logic Ladder',
      coach: 'Read the pattern from the beginning, then name what repeats or changes.',
      success: 'You found the rule and predicted the next step.',
      answer: item.answer,
      options: shuffle(item.options, `arcade-pattern-quest-options-${level}-${item.prompt}`, roundStep),
    };
  }

  if (gameId === 'story-detective') {
    const scenes = [
      {
        prompt: 'Maya packed an umbrella because dark clouds covered the sky.',
        helper: 'Why did Maya pack an umbrella?',
        skill: 'Cause and Effect',
        coach: 'Look for the clue that explains why the character acted.',
        success: 'You used a text clue to explain cause and effect.',
        answer: 'It might rain',
        options: ['It might rain', 'It was bedtime', 'She lost a shoe', 'She wanted a snack'],
      },
      {
        prompt: 'Leo fixed the tower by making the bottom wider.',
        helper: 'What helped the tower stand?',
        skill: 'Problem and Solution',
        coach: 'Find the action that solved the problem.',
        success: 'You matched the problem with the solution.',
        answer: 'A wider base',
        options: ['A wider base', 'A louder song', 'A smaller table', 'A red crayon'],
      },
      {
        prompt: 'Nia smiled after her friend saved her a seat at lunch.',
        helper: 'How did Nia probably feel?',
        skill: 'Character Feelings',
        coach: 'Use what happened to infer the feeling.',
        success: 'You inferred a character feeling from the scene.',
        answer: 'Thankful',
        options: ['Thankful', 'Sleepy', 'Confused', 'Angry at rain'],
      },
      {
        prompt: 'The class planted seeds, watered them, and waited for sprouts.',
        helper: 'What probably happened next?',
        skill: 'Sequence',
        coach: 'Think about what comes after the steps in order.',
        success: 'You predicted the next event from the sequence.',
        answer: 'Plants began to grow',
        options: ['Plants began to grow', 'The moon disappeared', 'The desks flew away', 'The pencils melted'],
      },
      {
        prompt: 'Sam whispered because the baby was sleeping nearby.',
        helper: 'Why did Sam whisper?',
        skill: 'Text Evidence',
        coach: 'The reason is in the sentence.',
        success: 'You found evidence directly in the text.',
        answer: 'To keep the baby asleep',
        options: ['To keep the baby asleep', 'To win a race', 'To paint a wall', 'To find a map'],
      },
      {
        prompt: 'Ava drew eight circles and crossed out three to solve a snack problem.',
        helper: 'What strategy did Ava use?',
        skill: 'Math Story Evidence',
        coach: 'Look for the action that helped the character solve.',
        success: 'You found the strategy inside the story.',
        answer: 'She drew a model',
        options: ['She drew a model', 'She guessed only', 'She hid the snack', 'She changed the weather'],
      },
      {
        prompt: 'The class trusted the rain amount because two sources gave the same number.',
        helper: 'Why did the class trust the detail?',
        skill: 'Compare Sources',
        coach: 'When sources agree, the evidence can be stronger.',
        success: 'You used source agreement as evidence.',
        answer: 'Two sources matched',
        options: ['Two sources matched', 'The chart was loud', 'The door was open', 'The pencils were sharp'],
      },
      {
        prompt: 'Jada helped a younger student by asking, "What clue did you notice?"',
        helper: 'What made Jada a good mentor?',
        skill: 'Inference',
        coach: 'Think about how the question helped the younger student think.',
        success: 'You inferred the helpful teaching move.',
        answer: 'She guided thinking',
        options: ['She guided thinking', 'She gave every answer', 'She stopped reading', 'She erased the book'],
      },
    ];
    const scene = pickDailyItem(scenes, `arcade-story-detective-grade-${level}`, roundStep);
    return {
      ...scene,
      levelTag: level <= 2 ? 'Story Clues' : 'Comprehension Quest',
    };
  }

  if (gameId === 'robot-maze') {
    const paths = [
      { prompt: 'Robot starts before two open tiles and a turn.', helper: 'Which command path reaches the goal?', skill: 'Sequence', coach: 'Follow each command in order before choosing.', success: 'You planned the commands in the right order.', answer: 'Forward, forward, turn right', options: ['Forward, forward, turn right', 'Turn left, forward', 'Jump, jump, stop', 'Backward, backward'] },
      { prompt: 'Robot sees a wall after one step.', helper: 'Which plan avoids the wall?', skill: 'Debugging', coach: 'A wall means the robot needs a turn before moving again.', success: 'You debugged the path around the wall.', answer: 'Forward, turn left, forward', options: ['Forward, turn left, forward', 'Forward, forward, forward', 'Stop only', 'Turn right forever'] },
      { prompt: 'Robot can repeat a short move to reach two tiles.', helper: 'Which plan uses a repeat idea?', skill: 'Loops', coach: 'A loop repeats the same useful step.', success: 'You used loop thinking to make a shorter plan.', answer: 'Repeat forward 2x', options: ['Repeat forward 2x', 'Turn left, stop', 'Backward, turn right', 'Jump over goal'] },
      { prompt: 'Robot must check the path before moving.', helper: 'Which command sounds safest?', skill: 'Conditionals', coach: 'If there is a clear path, then move.', success: 'You used if-then thinking like a coder.', answer: 'If clear, move forward', options: ['If clear, move forward', 'Move without looking', 'Spin forever', 'Erase the goal'] },
      { prompt: 'Robot reached the wrong square after turning too soon.', helper: 'Which plan should the coder try?', skill: 'Debugging', coach: 'Debugging means finding the step that happened too early or too late.', success: 'You debugged by changing the timing of a turn.', answer: 'Move first, then turn', options: ['Move first, then turn', 'Delete the goal', 'Spin forever', 'Stop before starting'] },
      { prompt: 'Robot needs to collect two gems in a row.', helper: 'Which command pattern is shortest?', skill: 'Efficient Sequence', coach: 'Look for repeated steps that can be grouped.', success: 'You chose an efficient command pattern.', answer: 'Repeat move 2x', options: ['Repeat move 2x', 'Turn left 4x', 'Move once only', 'Wait forever'] },
    ];
    const path = pickDailyItem(paths.slice(0, level <= 2 ? 2 : paths.length), `arcade-robot-maze-grade-${level}`, roundStep);
    return {
      ...path,
      levelTag: level <= 2 ? 'Robot Steps' : 'Code Planner',
    };
  }

  const rhythms = [
    { prompt: 'tap, tap, clap, tap, tap, ?', answer: 'clap', options: ['clap', 'rest', 'snap', 'tap'], skill: 'Beat Pattern' },
    { prompt: 'low, high, low, high, ?', answer: 'low', options: ['low', 'high', 'quiet', 'fast'], skill: 'Pitch Pattern' },
    { prompt: 'slow, slow, quick, slow, slow, ?', answer: 'quick', options: ['quick', 'slow', 'pause', 'loud'], skill: 'Tempo Pattern' },
    { prompt: 'loud, soft, soft, loud, soft, soft, ?', answer: 'loud', options: ['loud', 'soft', 'rest', 'high'], skill: 'Dynamics' },
    { prompt: 'snap, rest, snap, rest, ?', answer: 'snap', options: ['snap', 'rest', 'tap', 'clap'], skill: 'Rest Pattern' },
    { prompt: 'ta, ti-ti, ta, ti-ti, ?', answer: 'ta', options: ['ta', 'ti-ti', 'rest', 'boom'], skill: 'Rhythm Reading' },
  ];
  const rhythm = pickDailyItem(rhythms, `arcade-rhythm-tap-grade-${level}`, roundStep);
  return {
    prompt: rhythm.prompt,
    helper: 'Copy the rhythm rule and choose the next beat.',
    skill: rhythm.skill,
    levelTag: level <= 2 ? 'Beat Builder' : 'Rhythm Reader',
    coach: 'Say the beats out loud, then listen for what repeats.',
    success: 'You followed the rhythm pattern.',
    answer: rhythm.answer,
    options: shuffle(rhythm.options, `arcade-rhythm-tap-options-${level}-${rhythm.prompt}`, roundStep),
  };
};

export const GameArcade: React.FC<GameArcadeProps> = ({ progress, onBack, onOpenRoom, onReward }) => {
  const recommendedGame = ARCADE_GAMES[Math.max(0, (progress.currentLevel - 1) % ARCADE_GAMES.length)];
  const [activeGameId, setActiveGameId] = useState<ArcadeGameId>(recommendedGame.id);
  const [roundKey, setRoundKey] = useState(0);
  const [roundWins, setRoundWins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | 'complete'>('idle');
  const [completedGames, setCompletedGames] = useState<string[]>([]);

  const activeGame = ARCADE_GAMES.find(game => game.id === activeGameId) || recommendedGame;
  const prompt = useMemo(() => buildPrompt(activeGame.id, progress.currentLevel, roundKey), [activeGame.id, progress.currentLevel, roundKey]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const arcadeProgress = progress.arcadeProgress || {
    totalWins: 0,
    bestCombo: 0,
    lastPlayedAt: 0,
    dailyChallengeDate: '',
    dailyChallengeWins: 0,
    gameWins: {},
    masteredGameIds: [],
  };
  const gameWins = arcadeProgress.gameWins || {};
  const masteredGameIds = new Set(arcadeProgress.masteredGameIds || []);
  const arcadeWins = arcadeProgress.totalWins || 0;
  const todayWins = arcadeProgress.dailyChallengeDate === todayKey ? arcadeProgress.dailyChallengeWins || 0 : 0;
  const masteredCount = ARCADE_GAMES.filter(game => masteredGameIds.has(game.id) || (gameWins[game.id] || 0) >= 3).length;
  const gamesStartedCount = ARCADE_GAMES.filter(game => (gameWins[game.id] || 0) > 0).length;
  const recommendedNextGame = ARCADE_GAMES
    .filter(game => !masteredGameIds.has(game.id) && (gameWins[game.id] || 0) < 3)
    .sort((first, second) => (gameWins[first.id] || 0) - (gameWins[second.id] || 0))[0] || recommendedGame;
  const activeGameWins = gameWins[activeGame.id] || 0;
  const longTermMasteryPercent = Math.round((masteredCount / ARCADE_GAMES.length) * 100);
  const dailyQuestItems = [
    {
      title: 'Daily warm-up',
      detail: `Win one ${recommendedGame.title} mission for today's streak.`,
      done: todayWins > 0,
    },
    {
      title: 'Mastery step',
      detail: `Earn ${Math.min(activeGameWins, 3)}/3 ${activeGame.title} wins before moving on.`,
      done: activeGameWins >= 3,
    },
    {
      title: 'Try next skill',
      detail: `Recommended next: ${recommendedNextGame.title}.`,
      done: activeGame.id === recommendedNextGame.id && roundWins > 0,
    },
  ];
  const arcadePassportItems = [
    {
      title: 'Starter Badge',
      value: `${Math.min(arcadeWins, 1)}/1`,
      detail: 'Finish one arcade mission.',
      done: arcadeWins >= 1,
    },
    {
      title: 'Balanced Explorer',
      value: `${Math.min(gamesStartedCount, 3)}/3`,
      detail: 'Try three different game skills.',
      done: gamesStartedCount >= 3,
    },
    {
      title: 'Mastery Collector',
      value: `${Math.min(masteredCount, 3)}/3`,
      detail: 'Master three arcade badges.',
      done: masteredCount >= 3,
    },
    {
      title: 'All-Room Arcade Champion',
      value: `${masteredCount}/6`,
      detail: 'Master every arcade skill path.',
      done: masteredCount >= ARCADE_GAMES.length,
    },
  ];

  const nextRound = () => {
    if (feedback === 'complete') {
      setRoundWins(0);
    }
    setFeedback('idle');
    setRoundKey(key => key + 1);
  };

  const selectGame = (gameId: ArcadeGameId) => {
    playPop();
    setActiveGameId(gameId);
    setRoundWins(0);
    setCombo(0);
    setFeedback('idle');
    setRoundKey(key => key + 1);
  };

  const handleAnswer = (option: string) => {
    if (feedback === 'complete' || feedback === 'correct') return;

    if (option !== prompt.answer) {
      playError();
      setCombo(0);
      setFeedback('wrong');
      return;
    }

    playSuccess();
    const nextWins = roundWins + 1;
    const nextCombo = combo + 1;
    setRoundWins(nextWins);
    setCombo(nextCombo);
    setFeedback(nextWins >= 3 ? 'complete' : 'correct');

    if (nextWins >= 3) {
      setCompletedGames(previous => Array.from(new Set([...previous, activeGame.id])));
      onReward(activeGame.room, activeGame.title, activeGame.id, nextCombo);
      return;
    }

    window.setTimeout(nextRound, 650);
  };

  const answerDisabled = feedback === 'complete' || feedback === 'correct';

  const renderAnswerPad = (option: string, className = '') => (
    <button
      key={`${activeGame.id}-${roundKey}-stage-${option}`}
      onClick={() => handleAnswer(option)}
      disabled={answerDisabled}
      className={`rounded-2xl border-2 px-4 py-3 text-left font-black shadow-sm transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70 ${className || 'border-white bg-white text-slate-900 hover:border-cyan-300'}`}
    >
      {option}
    </button>
  );

  const renderArcadePlayboard = () => {
    if (activeGame.id === 'number-dash') {
      const addends = prompt.prompt.match(/^(\d+) \+ (\d+)$/);
      const first = addends ? Number(addends[1]) : 0;
      const second = addends ? Number(addends[2]) : 0;
      const renderCounters = (count: number, tone: string) => (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: Math.min(count, 14) }).map((_, index) => (
            <span key={index} className={`h-4 w-4 rounded-full ${tone}`} />
          ))}
          {count > 14 && <span className="rounded-full bg-slate-200 px-2 text-xs font-black text-slate-600">+{count - 14}</span>}
        </div>
      );

      return (
        <div className="mt-5 rounded-[28px] border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex items-center gap-2 text-indigo-800">
            <Calculator size={18} />
            <p className="text-sm font-black uppercase tracking-[0.14em]">Interactive Playboard</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-indigo-500">First number</p>
              <p className="my-2 text-3xl font-black text-indigo-700">{first}</p>
              {renderCounters(first, 'bg-indigo-400')}
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-500">Second number</p>
              <p className="my-2 text-3xl font-black text-sky-700">{second}</p>
              {renderCounters(second, 'bg-sky-400')}
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {prompt.options.map(option => renderAnswerPad(option, 'border-indigo-100 bg-white text-indigo-900 hover:border-indigo-400'))}
          </div>
        </div>
      );
    }

    if (activeGame.id === 'word-builder') {
      const clue = prompt.prompt.replace('Complete ', '');
      return (
        <div className="mt-5 rounded-[28px] border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Type size={18} />
            <p className="text-sm font-black uppercase tracking-[0.14em]">Interactive Playboard</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-white p-5 shadow-sm">
            {clue.split('').map((letter, index) => (
              <div
                key={`${letter}-${index}`}
                className={`flex h-16 w-14 items-center justify-center rounded-2xl border-2 text-3xl font-black ${
                  letter === '_' ? 'border-amber-400 bg-amber-100 text-amber-700' : 'border-slate-100 bg-slate-50 text-slate-900'
                }`}
              >
                {letter === '_' ? '?' : letter}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {prompt.options.map(option => renderAnswerPad(option, 'border-amber-100 bg-white text-center text-2xl text-amber-900 hover:border-amber-400'))}
          </div>
        </div>
      );
    }

    if (activeGame.id === 'pattern-quest') {
      const patternTiles = prompt.prompt.split(',').map(part => part.trim());
      return (
        <div className="mt-5 rounded-[28px] border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <Shapes size={18} />
            <p className="text-sm font-black uppercase tracking-[0.14em]">Interactive Playboard</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-white p-5 shadow-sm">
            {patternTiles.map((tile, index) => (
              <div
                key={`${tile}-${index}`}
                className={`min-h-16 min-w-20 rounded-2xl border-2 px-4 py-3 text-center text-lg font-black ${tile === '?' ? 'border-dashed border-emerald-400 bg-emerald-50 text-emerald-700' : tileTone(tile)}`}
              >
                {tile}
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {prompt.options.map(option => renderAnswerPad(option, `text-center ${tileTone(option)} hover:border-emerald-500`))}
          </div>
        </div>
      );
    }

    if (activeGame.id === 'story-detective') {
      return (
        <div className="mt-5 rounded-[28px] border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-rose-800">
            <BrainCircuit size={18} />
            <p className="text-sm font-black uppercase tracking-[0.14em]">Interactive Playboard</p>
          </div>
          <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">Scene card</p>
            <p className="mt-2 text-2xl font-black leading-snug text-slate-900">{prompt.prompt}</p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {prompt.options.map(option => renderAnswerPad(option, 'border-rose-100 bg-white text-rose-950 hover:border-rose-400'))}
          </div>
        </div>
      );
    }

    if (activeGame.id === 'robot-maze') {
      return (
        <div className="mt-5 rounded-[28px] border border-violet-100 bg-violet-50 p-4">
          <div className="flex items-center gap-2 text-violet-800">
            <Route size={18} />
            <p className="text-sm font-black uppercase tracking-[0.14em]">Interactive Playboard</p>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid grid-cols-3 gap-2 rounded-3xl bg-white p-4 shadow-sm">
              {['Start', 'Open', 'Wall', 'Open', 'Open', 'Goal', 'Open', 'Turn', 'Open'].map((tile, index) => (
                <div
                  key={`${tile}-${index}`}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 text-xs font-black ${
                    tile === 'Wall'
                      ? 'border-slate-300 bg-slate-700 text-white'
                      : tile === 'Goal'
                        ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                        : tile === 'Start'
                          ? 'border-violet-200 bg-violet-100 text-violet-800'
                      : 'border-slate-100 bg-slate-50 text-slate-500'
                  }`}
                >
                  {tile === 'Goal' ? (
                    <>
                      <Flag size={18} />
                      <span>Goal</span>
                    </>
                  ) : tile}
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              {prompt.options.map(option => (
                <button
                  key={`${activeGame.id}-${roundKey}-route-${option}`}
                  onClick={() => handleAnswer(option)}
                  disabled={answerDisabled}
                  className="rounded-2xl border-2 border-violet-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="flex flex-wrap gap-1">
                    {commandParts(option).map((command, commandIndex) => (
                      <span key={`${option}-${command}-${commandIndex}`} className="rounded-full bg-violet-100 px-2 py-1 text-xs font-black text-violet-800">
                        {command}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const rhythmTiles = prompt.prompt.split(',').map(part => part.trim());
    return (
      <div className="mt-5 rounded-[28px] border border-pink-100 bg-pink-50 p-4">
        <div className="flex items-center gap-2 text-pink-800">
          <Music size={18} />
          <p className="text-sm font-black uppercase tracking-[0.14em]">Interactive Playboard</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-white p-5 shadow-sm">
          {rhythmTiles.map((beat, index) => (
            <div
              key={`${beat}-${index}`}
              className={`flex h-16 min-w-20 items-center justify-center rounded-2xl border-2 px-4 text-lg font-black ${
                beat === '?' ? 'border-dashed border-pink-400 bg-pink-50 text-pink-700' : 'border-pink-100 bg-pink-100 text-pink-800'
              }`}
            >
              {beat}
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {prompt.options.map(option => renderAnswerPad(option, 'border-pink-100 bg-white text-center text-pink-950 hover:border-pink-400'))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-sky-50 text-slate-950">
      <div className="academy-room-surface min-h-full" style={{ '--academy-room-scene': "url('/academy/rooms/coding.webp')" } as React.CSSProperties}>
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/86 px-4 py-3 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <button onClick={onBack} className="rounded-2xl bg-cyan-100 p-3 text-cyan-800 hover:bg-cyan-200" aria-label="Back to world map">
              <ArrowLeft size={22} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Modern Play Zone</p>
              <h1 className="truncate text-2xl font-black sm:text-3xl">Game Arcade</h1>
            </div>
            <div className="hidden rounded-2xl bg-sky-100 px-4 py-2 text-right text-sky-950 sm:block">
              <p className="text-xs font-bold text-sky-700">Arcade wins</p>
              <p className="text-xl font-black">{arcadeWins}</p>
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="space-y-4">
            <div className={`overflow-hidden rounded-[30px] bg-gradient-to-br ${recommendedGame.gradient} p-5 text-white shadow-2xl`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/78">Daily Game Challenge</p>
                  <h2 className="mt-2 text-3xl font-black">{recommendedGame.title}</h2>
                  <p className="mt-2 max-w-xl text-sm font-semibold text-white/88">{recommendedGame.description}</p>
                </div>
                <div className="rounded-3xl bg-white/20 p-4 shadow-lg shadow-black/10">
                  <Sparkles className="text-white" size={34} />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white/18 p-3">
                  <p className="text-xl font-black">{progress.currentLevel}</p>
                  <p className="text-xs font-bold text-white/76">grade level</p>
                </div>
                <div className="rounded-2xl bg-white/18 p-3">
                  <p className="text-xl font-black">{Math.max(combo, arcadeProgress.bestCombo || 0)}</p>
                  <p className="text-xs font-bold text-white/76">best combo</p>
                </div>
                <div className="rounded-2xl bg-white/18 p-3">
                  <p className="text-xl font-black">{todayWins}</p>
                  <p className="text-xs font-bold text-white/76">today</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-[26px] border border-white bg-white/82 p-3 shadow-lg">
              <div className="rounded-2xl bg-cyan-50 p-3 text-center">
                <p className="text-2xl font-black text-cyan-700">{arcadeWins}</p>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-cyan-700">wins</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-black text-emerald-700">{masteredCount}/6</p>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">mastered</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-center">
                <p className="text-2xl font-black text-amber-700">{roundWins}/3</p>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">mission</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white bg-white/88 p-4 shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                    <ListChecks size={16} />
                    Daily Quest Board
                  </p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">Today&apos;s arcade path</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    Finish a warm-up, take one mastery step, then try the next skill.
                  </p>
                </div>
                <button
                  onClick={() => selectGame(recommendedNextGame.id)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${recommendedNextGame.gradient} px-4 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg`}
                >
                  <Play size={16} />
                  Recommended next
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                {dailyQuestItems.map(item => (
                  <div key={item.title} className={`flex items-start gap-3 rounded-2xl border p-3 ${item.done ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.done ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                      <CheckCircle2 size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-slate-950">{item.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${item.done ? 'bg-emerald-200 text-emerald-900' : 'bg-white text-slate-500'}`}>
                          {item.done ? 'Done' : 'Ready'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white bg-slate-950 p-4 text-white shadow-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                    <Award size={16} />
                    Arcade Passport
                  </p>
                  <h3 className="mt-2 text-xl font-black">Badge Trail</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    Long-term mastery shows kids they are building skills across every room.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-center">
                  <p className="text-2xl font-black text-white">{longTermMasteryPercent}%</p>
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-cyan-200">Long-term mastery</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/12">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-yellow-300"
                  style={{ width: `${longTermMasteryPercent}%` }}
                />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {arcadePassportItems.map(item => (
                  <div key={item.title} className={`rounded-2xl border p-3 ${item.done ? 'border-emerald-300/50 bg-emerald-400/15' : 'border-white/10 bg-white/[0.06]'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">{item.title}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-300">{item.detail}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-black ${item.done ? 'bg-emerald-300 text-emerald-950' : 'bg-white/10 text-slate-200'}`}>
                        {item.done ? 'Earned' : item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {ARCADE_GAMES.map(game => {
                const Icon = game.icon;
                const isActive = game.id === activeGame.id;
                const winsForGame = gameWins[game.id] || 0;
                const isMastered = masteredGameIds.has(game.id) || winsForGame >= 3;
                const isComplete = completedGames.includes(game.id);
                const progressPercent = Math.min(100, Math.round((Math.min(winsForGame, 3) / 3) * 100));
                return (
                  <button
                    key={game.id}
                    onClick={() => selectGame(game.id)}
                    className={`group min-h-[176px] overflow-hidden rounded-[28px] border-2 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${isActive ? `border-white bg-gradient-to-br ${game.gradient} text-white` : `${game.tint} text-slate-950`}`}
                  >
                    <div className={`h-2 bg-gradient-to-r ${game.gradient}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`rounded-2xl p-3 ${isActive ? 'bg-white/20 text-white' : game.iconTone}`}>
                          <Icon size={24} />
                        </div>
                        {(isMastered || isComplete) && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-black ${
                            isMastered ? 'bg-yellow-300 text-yellow-950' : 'bg-emerald-400 text-emerald-950'
                          }`}>
                            {isMastered ? <Award size={12} /> : <CheckCircle2 size={12} />}
                            {isMastered ? 'mastered' : 'won'}
                          </span>
                        )}
                      </div>
                      <p className={`mt-3 text-[11px] font-black uppercase tracking-[0.16em] ${isActive ? 'text-white/75' : 'text-slate-500'}`}>{game.label}</p>
                      <h3 className="mt-1 text-lg font-black">{game.title}</h3>
                      <p className={`mt-2 text-sm font-semibold ${isActive ? 'text-white/84' : 'text-slate-600'}`}>{game.description}</p>
                      <div className={`mt-4 rounded-full ${isActive ? 'bg-white/20' : 'bg-white'} p-1`}>
                        <div className={`h-2 rounded-full bg-gradient-to-r ${game.gradient}`} style={{ width: `${progressPercent}%` }} />
                      </div>
                      <p className={`mt-2 text-[11px] font-black uppercase tracking-[0.12em] ${isActive ? 'text-white/72' : 'text-slate-500'}`}>
                        {Math.min(winsForGame, 3)}/3 wins to mastery badge
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-[34px] border border-white bg-white shadow-2xl">
            <div className={`bg-gradient-to-r ${activeGame.gradient} p-5 text-white`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">Now Playing</p>
                  <h2 className="mt-1 text-3xl font-black">{activeGame.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-white/85">{activeGame.proof}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={nextRound}
                    className="rounded-2xl bg-white/18 p-3 hover:bg-white/28"
                    aria-label="New arcade round"
                  >
                    <RefreshCw size={22} />
                  </button>
                  <button
                    onClick={() => onOpenRoom(activeGame.room)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 hover:bg-slate-100"
                  >
                    <Map size={18} />
                    Full Room
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 text-slate-950">
              <div className="rounded-[30px] bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      <Play size={14} />
                      Quick Round
                    </p>
                    <h3 className="mt-2 text-3xl font-black leading-tight">{prompt.prompt}</h3>
                    <p className="mt-3 text-base font-bold text-slate-600">{prompt.helper}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-800">
                        Skill Focus: {prompt.skill}
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-800">
                        {prompt.levelTag}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white px-5 py-4 text-center shadow-sm">
                    <p className="text-3xl font-black text-slate-950">{roundWins}/3</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">to win</p>
                  </div>
                </div>

                {renderArcadePlayboard()}

                <div className="mt-5 rounded-[24px] border border-slate-100 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Strategy Coach</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">{prompt.coach}</p>
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Answer Pads</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {prompt.options.map(option => (
                    <button
                      key={`${activeGame.id}-${roundKey}-${option}`}
                      data-testid="arcade-answer-option"
                      data-arcade-correct={option === prompt.answer ? 'true' : 'false'}
                      onClick={() => handleAnswer(option)}
                      disabled={answerDisabled}
                      className="min-h-[82px] rounded-[24px] border-2 border-slate-200 bg-white px-4 py-4 text-left text-xl font-black text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {feedback !== 'idle' && (
                  <div className={`mt-5 rounded-[24px] p-4 text-sm font-black ${feedback === 'wrong' ? 'bg-rose-100 text-rose-800' : feedback === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-cyan-100 text-cyan-800'}`}>
                    {feedback === 'wrong' && `Try again. ${prompt.coach}`}
                    {feedback === 'correct' && `${prompt.success} New round loading.`}
                    {feedback === 'complete' && `${activeGame.title} complete. ${prompt.success} You earned saved arcade progress, parent proof, and a learning reward.`}
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  ['Skill ladder', `${Math.min(gameWins[activeGame.id] || 0, 3)}/3 saved wins toward this game badge.`],
                  ['Learning proof', `${activeGame.proof}. Current skill: ${prompt.skill}.`],
                  ['Parent report', 'Wins save into progress, streaks, parent reports, and the learning journal.'],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-black text-slate-900">{title}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
