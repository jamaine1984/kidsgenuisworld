import React, { useState, useEffect } from 'react';
import { ArrowLeft, Code, Play, RotateCcw, Star, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Repeat, Zap, Volume2 } from 'lucide-react';
import { speak, speakCorrect, speakWrong, speakQuestion, playSuccess, playError, playWrongBuzzer } from '../services/audioService';

interface CodingRoomProps {
  level: number; // 1-7 corresponds to Pre-K through 5th grade
  onBack: () => void;
  onReward: () => void;
}

interface GridCell {
  type: 'empty' | 'start' | 'goal' | 'obstacle' | 'path' | 'star' | 'gem';
}

interface Position {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
}

interface CodeBlock {
  id: string;
  type: 'move' | 'turnLeft' | 'turnRight' | 'repeat';
  icon: React.ReactNode;
  label: string;
  color: string;
  repeatCount?: number;
}

interface Challenge {
  id: string;
  name: string;
  story: string; // Fun story context for the challenge
  grid: GridCell[][];
  startPos: Position;
  goalPos: { x: number; y: number };
  maxBlocks: number;
  hint: string;
  gradeLevel: number; // 1-7 (Pre-K to 5th)
  category: 'basic' | 'turns' | 'loops' | 'maze' | 'advanced';
}

// 20 challenges organized by difficulty/grade level
const CHALLENGES: Challenge[] = [
  // PRE-K (Level 1) - Super simple, 1-2 moves
  {
    id: 'c1',
    name: 'First Steps',
    story: 'Help Robot reach the star! Just one step forward!',
    grid: [
      [{ type: 'start' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 1, y: 0 },
    maxBlocks: 2,
    hint: 'Tap Move Forward once!',
    gradeLevel: 1,
    category: 'basic'
  },
  {
    id: 'c2',
    name: 'Two Steps',
    story: 'Robot needs to walk further! Can you help?',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 2, y: 0 },
    maxBlocks: 3,
    hint: 'Move forward two times!',
    gradeLevel: 1,
    category: 'basic'
  },
  {
    id: 'c3',
    name: 'Long Walk',
    story: 'The star is far away! Robot is brave!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 3, y: 0 },
    maxBlocks: 4,
    hint: 'Keep moving forward!',
    gradeLevel: 1,
    category: 'basic'
  },

  // KINDERGARTEN (Level 2) - Introduction to turns
  {
    id: 'c4',
    name: 'Turn Around',
    story: 'The star is above Robot! Time to look up!',
    grid: [
      [{ type: 'empty' }, { type: 'goal' }],
      [{ type: 'start' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 1, direction: 'up' },
    goalPos: { x: 1, y: 0 },
    maxBlocks: 4,
    hint: 'Go up, then turn right and move!',
    gradeLevel: 2,
    category: 'turns'
  },
  {
    id: 'c5',
    name: 'L-Shape',
    story: 'Robot needs to walk in an L shape!',
    grid: [
      [{ type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 1, direction: 'right' },
    goalPos: { x: 2, y: 0 },
    maxBlocks: 5,
    hint: 'Move right, then turn left and go up!',
    gradeLevel: 2,
    category: 'turns'
  },
  {
    id: 'c6',
    name: 'Corner Turn',
    story: 'The path goes around a corner!',
    grid: [
      [{ type: 'goal' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'start' }],
    ],
    startPos: { x: 1, y: 1, direction: 'left' },
    goalPos: { x: 0, y: 0 },
    maxBlocks: 4,
    hint: 'Go left, turn right, go up!',
    gradeLevel: 2,
    category: 'turns'
  },

  // FIRST GRADE (Level 3) - Simple obstacles
  {
    id: 'c7',
    name: 'Avoid the Rock',
    story: 'Oh no! There is a big rock in the way!',
    grid: [
      [{ type: 'start' }, { type: 'obstacle' }, { type: 'goal' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 2, y: 0 },
    maxBlocks: 6,
    hint: 'Go around the rock below!',
    gradeLevel: 3,
    category: 'maze'
  },
  {
    id: 'c8',
    name: 'Zigzag Path',
    story: 'Follow the zigzag path through the garden!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'obstacle' }],
      [{ type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 2, y: 2 },
    maxBlocks: 8,
    hint: 'Zigzag around the rocks!',
    gradeLevel: 3,
    category: 'maze'
  },
  {
    id: 'c9',
    name: 'Forest Path',
    story: 'Navigate through the forest trees!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 2, y: 2 },
    maxBlocks: 7,
    hint: 'Find the clear path around the tree!',
    gradeLevel: 3,
    category: 'maze'
  },

  // SECOND GRADE (Level 4) - Introduction to loops
  {
    id: 'c10',
    name: 'Loop Power',
    story: 'Robot learned about loops! Do the same thing multiple times!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 4, y: 0 },
    maxBlocks: 2,
    hint: 'Use the Repeat block after Move Forward!',
    gradeLevel: 4,
    category: 'loops'
  },
  {
    id: 'c11',
    name: 'Square Dance',
    story: 'Make Robot walk in a square pattern!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'goal' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 0, y: 2 },
    maxBlocks: 3,
    hint: 'Move down twice - try the Repeat block!',
    gradeLevel: 4,
    category: 'loops'
  },
  {
    id: 'c12',
    name: 'Long Journey',
    story: 'Robot has a long way to go! Loops make it easy!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 5, y: 0 },
    maxBlocks: 3,
    hint: 'Repeat makes Robot move many times with one block!',
    gradeLevel: 4,
    category: 'loops'
  },

  // THIRD GRADE (Level 5) - Combining concepts
  {
    id: 'c13',
    name: 'Maze Runner',
    story: 'Navigate the tricky maze!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 3, y: 2 },
    maxBlocks: 10,
    hint: 'Think about each turn carefully!',
    gradeLevel: 5,
    category: 'maze'
  },
  {
    id: 'c14',
    name: 'The Spiral',
    story: 'Follow the spiral path inward!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'obstacle' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'goal' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 0, y: 2 },
    maxBlocks: 10,
    hint: 'Go around the walls in a spiral!',
    gradeLevel: 5,
    category: 'maze'
  },
  {
    id: 'c15',
    name: 'Treasure Island',
    story: 'Find the treasure hidden on the island!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 4, y: 1 },
    maxBlocks: 8,
    hint: 'Go around the palm trees!',
    gradeLevel: 5,
    category: 'maze'
  },

  // FOURTH GRADE (Level 6) - Complex patterns
  {
    id: 'c16',
    name: 'Castle Walls',
    story: 'Navigate around the castle walls to reach the princess!',
    grid: [
      [{ type: 'start' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
      [{ type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 4, y: 0 },
    maxBlocks: 12,
    hint: 'Plan your path around all the walls!',
    gradeLevel: 6,
    category: 'advanced'
  },
  {
    id: 'c17',
    name: 'Efficient Route',
    story: 'Find the shortest path using loops!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 2, y: 3 },
    maxBlocks: 6,
    hint: 'Combine loops with turns for efficiency!',
    gradeLevel: 6,
    category: 'advanced'
  },

  // FIFTH GRADE (Level 7) - Most challenging
  {
    id: 'c18',
    name: 'Robot Olympics',
    story: 'Complete the obstacle course for Robot Olympics!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'obstacle' }, { type: 'obstacle' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 4, y: 4 },
    maxBlocks: 15,
    hint: 'This is the ultimate challenge! Plan carefully!',
    gradeLevel: 7,
    category: 'advanced'
  },
  {
    id: 'c19',
    name: 'The Labyrinth',
    story: 'Escape the ancient labyrinth!',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 4, y: 3 },
    maxBlocks: 14,
    hint: 'Think like a maze solver!',
    gradeLevel: 7,
    category: 'advanced'
  },
  {
    id: 'c20',
    name: 'Master Coder',
    story: 'Only true master coders can solve this!',
    grid: [
      [{ type: 'start' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
      [{ type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 4, y: 0 },
    maxBlocks: 12,
    hint: 'Use everything you have learned!',
    gradeLevel: 7,
    category: 'advanced'
  },
];

const AVAILABLE_BLOCKS: CodeBlock[] = [
  { id: 'move', type: 'move', icon: <ChevronUp size={20} />, label: 'Move Forward', color: 'bg-green-500' },
  { id: 'turnLeft', type: 'turnLeft', icon: <RotateCcw size={20} />, label: 'Turn Left', color: 'bg-blue-500' },
  { id: 'turnRight', type: 'turnRight', icon: <Repeat size={20} className="transform scale-x-[-1]" />, label: 'Turn Right', color: 'bg-purple-500' },
  { id: 'repeat', type: 'repeat', icon: <Repeat size={20} />, label: 'Repeat 2x', color: 'bg-orange-500', repeatCount: 2 },
];

export const CodingRoom: React.FC<CodingRoomProps> = ({ level, onBack, onReward }) => {
  // Filter challenges by grade level
  const availableChallenges = CHALLENGES.filter(c => c.gradeLevel <= level);

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [challenge, setChallenge] = useState<Challenge>(availableChallenges[0]);
  const [code, setCode] = useState<CodeBlock[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [robotPos, setRobotPos] = useState<Position>(availableChallenges[0].startPos);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Welcome message - read the story aloud
    speak("Welcome to Coding Corner! Let's help Robot solve puzzles!");
    setTimeout(() => {
      speakQuestion(challenge.story);
    }, 2000);
  }, []);

  // When challenge changes, read the new story
  useEffect(() => {
    if (challenge) {
      speakQuestion(challenge.story);
    }
  }, [challenge.id]);

  const resetChallenge = () => {
    setRobotPos({ ...challenge.startPos });
    setPath([]);
    setWon(false);
    setCode([]);
  };

  const addBlock = (block: CodeBlock) => {
    if (code.length < challenge.maxBlocks) {
      setCode([...code, { ...block, id: `${block.id}-${Date.now()}` }]);
    }
  };

  const removeBlock = (index: number) => {
    setCode(code.filter((_, i) => i !== index));
  };

  const speakHint = () => {
    speak(challenge.hint);
  };

  const runCode = async () => {
    if (code.length === 0 || isRunning) return;

    setIsRunning(true);
    setPath([]);

    let pos = { ...challenge.startPos };
    const newPath: { x: number; y: number }[] = [{ x: pos.x, y: pos.y }];

    // Expand repeat blocks
    const expandedCode: CodeBlock[] = [];
    code.forEach(block => {
      if (block.type === 'repeat') {
        const repeatCount = block.repeatCount || 2;
        // Repeat the previous block
        if (expandedCode.length > 0) {
          const lastBlock = expandedCode[expandedCode.length - 1];
          for (let i = 0; i < repeatCount - 1; i++) {
            expandedCode.push({ ...lastBlock, id: `${lastBlock.id}-rep-${i}` });
          }
        }
      } else {
        expandedCode.push(block);
      }
    });

    for (const block of expandedCode) {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (block.type === 'move') {
        let newX = pos.x;
        let newY = pos.y;

        switch (pos.direction) {
          case 'up': newY--; break;
          case 'down': newY++; break;
          case 'left': newX--; break;
          case 'right': newX++; break;
        }

        // Check boundaries
        if (newX >= 0 && newX < challenge.grid[0].length &&
            newY >= 0 && newY < challenge.grid.length) {
          // Check for obstacles
          if (challenge.grid[newY][newX].type !== 'obstacle') {
            pos.x = newX;
            pos.y = newY;
            newPath.push({ x: pos.x, y: pos.y });
          } else {
            // Hit obstacle - play error sound
            playError();
          }
        }
      } else if (block.type === 'turnLeft') {
        const turns: { [key: string]: Position['direction'] } = {
          'up': 'left', 'left': 'down', 'down': 'right', 'right': 'up'
        };
        pos.direction = turns[pos.direction];
      } else if (block.type === 'turnRight') {
        const turns: { [key: string]: Position['direction'] } = {
          'up': 'right', 'right': 'down', 'down': 'left', 'left': 'up'
        };
        pos.direction = turns[pos.direction];
      }

      setRobotPos({ ...pos });
      setPath([...newPath]);
    }

    // Check win condition
    if (pos.x === challenge.goalPos.x && pos.y === challenge.goalPos.y) {
      setWon(true);
      setScore(s => s + 1);
      playSuccess();
      speakCorrect("You solved it! You're becoming a real programmer!");
      onReward();
    } else {
      playWrongBuzzer();
      speakWrong("Robot didn't reach the star. Try a different path!");
    }

    setIsRunning(false);
  };

  const nextChallenge = () => {
    const nextIndex = (currentChallengeIndex + 1) % availableChallenges.length;
    setCurrentChallengeIndex(nextIndex);
    const nextChallenge = availableChallenges[nextIndex];
    setChallenge(nextChallenge);
    setRobotPos({ ...nextChallenge.startPos });
    setPath([]);
    setWon(false);
    setCode([]);
  };

  const getDirectionRotation = (direction: string) => {
    switch (direction) {
      case 'up': return 'rotate-0';
      case 'right': return 'rotate-90';
      case 'down': return 'rotate-180';
      case 'left': return '-rotate-90';
      default: return 'rotate-0';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'basic': return '🌟';
      case 'turns': return '🔄';
      case 'loops': return '🔁';
      case 'maze': return '🏰';
      case 'advanced': return '🚀';
      default: return '⭐';
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm">
        <button onClick={onBack} className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
          <ArrowLeft className="text-white" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Code className="text-white" size={28} />
          <span className="text-2xl font-bold text-white drop-shadow">Coding Corner</span>
        </div>
        <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full">
          <Zap className="text-yellow-300 fill-yellow-300" size={20} />
          <span className="text-white font-bold">{score}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-auto">
        {/* Left: Challenge Info & Grid */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Challenge Info */}
          <div className="bg-white/90 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {getCategoryEmoji(challenge.category)}
                Level {currentChallengeIndex + 1}: {challenge.name}
              </h2>
              <button
                onClick={speakHint}
                className="p-2 bg-indigo-100 rounded-full hover:bg-indigo-200 transition"
              >
                <Volume2 className="text-indigo-600" size={20} />
              </button>
            </div>
            <p className="text-gray-600">{challenge.story}</p>
            <p className="text-indigo-600 mt-2 font-medium">💡 {challenge.hint}</p>
          </div>

          {/* Game Grid */}
          <div className="bg-white/90 rounded-xl p-4 shadow-lg flex-1 flex items-center justify-center">
            <div className="inline-grid gap-1" style={{
              gridTemplateColumns: `repeat(${challenge.grid[0].length}, minmax(0, 1fr))`
            }}>
              {challenge.grid.map((row, y) =>
                row.map((cell, x) => {
                  const isRobot = robotPos.x === x && robotPos.y === y;
                  const isPath = path.some(p => p.x === x && p.y === y);

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-2xl md:text-3xl relative transition-all
                        ${cell.type === 'obstacle' ? 'bg-gray-700' : 'bg-indigo-100'}
                        ${cell.type === 'goal' ? 'bg-yellow-200' : ''}
                        ${isPath && !isRobot ? 'bg-green-200' : ''}
                      `}
                    >
                      {cell.type === 'goal' && <span className="text-2xl md:text-3xl">⭐</span>}
                      {cell.type === 'obstacle' && <span className="text-2xl md:text-3xl">🧱</span>}
                      {isRobot && (
                        <div className={`text-2xl md:text-3xl transform ${getDirectionRotation(robotPos.direction)} transition-transform`}>
                          🤖
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Code Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Available Blocks */}
          <div className="bg-white/90 rounded-xl p-4 shadow-lg">
            <h3 className="font-bold text-gray-700 mb-3">Toolbox</h3>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_BLOCKS.map(block => (
                <button
                  key={block.id}
                  onClick={() => addBlock(block)}
                  disabled={code.length >= challenge.maxBlocks}
                  className={`${block.color} text-white p-3 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50`}
                >
                  {block.icon}
                  <span className="text-xs">{block.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Workspace */}
          <div className="bg-white/90 rounded-xl p-4 shadow-lg flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700">Your Code</h3>
              <span className="text-sm text-gray-500">{code.length}/{challenge.maxBlocks} blocks</span>
            </div>

            <div className="space-y-2 min-h-32 bg-gray-100 rounded-lg p-2">
              {code.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">Tap blocks from the toolbox!</p>
              ) : (
                code.map((block, index) => (
                  <div
                    key={block.id}
                    className={`${block.color} text-white p-2 rounded-lg font-semibold flex items-center justify-between cursor-pointer hover:opacity-90`}
                    onClick={() => !isRunning && removeBlock(index)}
                  >
                    <div className="flex items-center gap-2">
                      {block.icon}
                      <span className="text-sm">{block.label}</span>
                    </div>
                    <span className="text-xs opacity-70">×</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={resetChallenge}
              className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-600 transition"
            >
              <RotateCcw size={20} />
              Reset
            </button>
            <button
              onClick={runCode}
              disabled={code.length === 0 || isRunning}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition disabled:opacity-50"
            >
              <Play size={20} fill="white" />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          </div>

          {/* Challenge Progress */}
          <div className="bg-white/90 rounded-xl p-3 shadow-lg">
            <p className="text-sm text-gray-600 text-center">
              Challenge {currentChallengeIndex + 1} of {availableChallenges.length}
            </p>
            <div className="flex gap-1 mt-2 justify-center flex-wrap">
              {availableChallenges.slice(0, 10).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < currentChallengeIndex ? 'bg-green-500' :
                    i === currentChallengeIndex ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                />
              ))}
              {availableChallenges.length > 10 && (
                <span className="text-xs text-gray-500">+{availableChallenges.length - 10}</span>
              )}
            </div>
          </div>

          {/* Win Message */}
          {won && (
            <button
              onClick={nextChallenge}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-yellow-500 hover:to-orange-600 transition animate-bounce"
            >
              🎉 Next Challenge! →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
