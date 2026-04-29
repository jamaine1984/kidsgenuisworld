import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, BrainCircuit, Calculator, CheckCircle2, Gamepad2, Map,
  Music, Play, RefreshCw, Shapes, Sparkles, Type
} from 'lucide-react';
import { RoomType, UserProgress } from '../types';
import { playError, playPop, playSuccess } from '../services/audioService';

interface GameArcadeProps {
  progress: UserProgress;
  onBack: () => void;
  onOpenRoom: (room: RoomType) => void;
  onReward: (room: RoomType, gameTitle: string) => void;
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

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const makeOptions = (answer: string, distractors: string[]) =>
  shuffle([answer, ...shuffle(Array.from(new Set(distractors.filter(item => item !== answer)))).slice(0, 3)]);

const buildPrompt = (gameId: ArcadeGameId, level: number): ArcadePrompt => {
  if (gameId === 'number-dash') {
    const first = level <= 2 ? Math.floor(Math.random() * 6) + 2 : Math.floor(Math.random() * 20) + 8;
    const second = level <= 3 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 12) + 4;
    const answer = String(first + second);
    return {
      prompt: `${first} + ${second}`,
      helper: 'Solve the sprint problem, then say the strategy you used.',
      answer,
      options: makeOptions(answer, [String(first + second + 1), String(first + second - 1), String(first + second + 3), String(Math.max(0, first + second - 3))]),
    };
  }

  if (gameId === 'word-builder') {
    const words = level <= 2
      ? [{ clue: 'c_t', answer: 'a', word: 'cat' }, { clue: 's_n', answer: 'u', word: 'sun' }, { clue: 'h_t', answer: 'a', word: 'hat' }]
      : [{ clue: 'pl_net', answer: 'a', word: 'planet' }, { clue: 'br_dge', answer: 'i', word: 'bridge' }, { clue: 'st_ry', answer: 'o', word: 'story' }];
    const item = words[Math.floor(Math.random() * words.length)];
    return {
      prompt: `Complete ${item.clue}`,
      helper: `Build the word ${item.word} by choosing the missing sound.`,
      answer: item.answer,
      options: makeOptions(item.answer, ['a', 'e', 'i', 'o', 'u']),
    };
  }

  if (gameId === 'pattern-quest') {
    const patterns = [
      { prompt: 'red, blue, red, blue, ?', answer: 'red', options: ['red', 'blue', 'green', 'yellow'] },
      { prompt: 'circle, square, circle, square, ?', answer: 'circle', options: ['circle', 'square', 'triangle', 'star'] },
      { prompt: 'small, medium, large, small, medium, ?', answer: 'large', options: ['small', 'medium', 'large', 'tiny'] },
    ];
    const item = patterns[Math.floor(Math.random() * patterns.length)];
    return {
      prompt: item.prompt,
      helper: 'Find the rule before you choose.',
      answer: item.answer,
      options: shuffle(item.options),
    };
  }

  if (gameId === 'story-detective') {
    const scenes = [
      {
        prompt: 'Maya packed an umbrella because dark clouds covered the sky.',
        helper: 'Why did Maya pack an umbrella?',
        answer: 'It might rain',
        options: ['It might rain', 'It was bedtime', 'She lost a shoe', 'She wanted a snack'],
      },
      {
        prompt: 'Leo fixed the tower by making the bottom wider.',
        helper: 'What helped the tower stand?',
        answer: 'A wider base',
        options: ['A wider base', 'A louder song', 'A smaller table', 'A red crayon'],
      },
    ];
    return scenes[Math.floor(Math.random() * scenes.length)];
  }

  if (gameId === 'robot-maze') {
    const paths = [
      { prompt: 'Robot starts before two open tiles and a turn.', helper: 'Which command path reaches the goal?', answer: 'Forward, forward, turn right', options: ['Forward, forward, turn right', 'Turn left, forward', 'Jump, jump, stop', 'Backward, backward'] },
      { prompt: 'Robot sees a wall after one step.', helper: 'Which plan avoids the wall?', answer: 'Forward, turn left, forward', options: ['Forward, turn left, forward', 'Forward, forward, forward', 'Stop only', 'Turn right forever'] },
    ];
    return paths[Math.floor(Math.random() * paths.length)];
  }

  const rhythms = [
    { prompt: 'tap, tap, clap, tap, tap, ?', answer: 'clap', options: ['clap', 'rest', 'snap', 'tap'] },
    { prompt: 'low, high, low, high, ?', answer: 'low', options: ['low', 'high', 'quiet', 'fast'] },
    { prompt: 'slow, slow, quick, slow, slow, ?', answer: 'quick', options: ['quick', 'slow', 'pause', 'loud'] },
  ];
  const rhythm = rhythms[Math.floor(Math.random() * rhythms.length)];
  return {
    prompt: rhythm.prompt,
    helper: 'Copy the rhythm rule and choose the next beat.',
    answer: rhythm.answer,
    options: shuffle(rhythm.options),
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
  const prompt = useMemo(() => buildPrompt(activeGame.id, progress.currentLevel), [activeGame.id, progress.currentLevel, roundKey]);
  const arcadeWins = completedGames.length;

  const nextRound = () => {
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
    if (feedback === 'complete') return;

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
      onReward(activeGame.room, activeGame.title);
      return;
    }

    window.setTimeout(nextRound, 650);
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-sky-50 text-slate-950">
      <div className="min-h-full bg-[linear-gradient(135deg,#e0f2fe_0%,#fef3c7_32%,#fce7f3_64%,#dcfce7_100%)]">
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
                  <p className="text-xl font-black">{combo}</p>
                  <p className="text-xs font-bold text-white/76">combo</p>
                </div>
                <div className="rounded-2xl bg-white/18 p-3">
                  <p className="text-xl font-black">{roundWins}/3</p>
                  <p className="text-xs font-bold text-white/76">mission</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {ARCADE_GAMES.map(game => {
                const Icon = game.icon;
                const isActive = game.id === activeGame.id;
                const isComplete = completedGames.includes(game.id);
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
                        {isComplete && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-2 py-1 text-[11px] font-black text-emerald-950">
                            <CheckCircle2 size={12} />
                            won
                          </span>
                        )}
                      </div>
                      <p className={`mt-3 text-[11px] font-black uppercase tracking-[0.16em] ${isActive ? 'text-white/75' : 'text-slate-500'}`}>{game.label}</p>
                      <h3 className="mt-1 text-lg font-black">{game.title}</h3>
                      <p className={`mt-2 text-sm font-semibold ${isActive ? 'text-white/84' : 'text-slate-600'}`}>{game.description}</p>
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
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Quick Round</p>
                    <h3 className="mt-2 text-3xl font-black leading-tight">{prompt.prompt}</h3>
                    <p className="mt-3 text-base font-bold text-slate-600">{prompt.helper}</p>
                  </div>
                  <div className="rounded-3xl bg-white px-5 py-4 text-center shadow-sm">
                    <p className="text-3xl font-black text-slate-950">{roundWins}/3</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">to win</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {prompt.options.map(option => (
                    <button
                      key={`${activeGame.id}-${roundKey}-${option}`}
                      onClick={() => handleAnswer(option)}
                      className="min-h-[82px] rounded-[24px] border-2 border-slate-200 bg-white px-4 py-4 text-left text-xl font-black text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-lg active:translate-y-0"
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {feedback !== 'idle' && (
                  <div className={`mt-5 rounded-[24px] p-4 text-sm font-black ${feedback === 'wrong' ? 'bg-rose-100 text-rose-800' : feedback === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-cyan-100 text-cyan-800'}`}>
                    {feedback === 'wrong' && 'Try again. Check the clue before you tap.'}
                    {feedback === 'correct' && 'Correct. New round loading.'}
                    {feedback === 'complete' && `${activeGame.title} complete. You earned arcade progress and a learning reward.`}
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  ['Short rounds', 'Each game is built for quick wins and replay.'],
                  ['Learning proof', activeGame.proof],
                  ['Reward link', 'Wins feed stars, streaks, parent reports, and the learning journal.'],
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
