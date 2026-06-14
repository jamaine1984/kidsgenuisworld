import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Code, Play, RotateCcw, Star, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Repeat, Zap, Volume2 } from 'lucide-react';
import { speak, speakAsync, speakCorrect, speakWrong, speakQuestion, playSuccess, playError, playWrongBuzzer } from '../services/audioService';

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

// Sequencing, turn, loop, maze, and debugging challenges organized by grade level
export const CHALLENGES: Challenge[] = [
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
  {
    id: 'c21',
    name: 'Tiny Tunnel',
    story: 'Robot crawls through a tiny tunnel to find the star.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 1, y: 1 },
    maxBlocks: 4,
    hint: 'Move, turn right, then move again.',
    gradeLevel: 1,
    category: 'basic'
  },
  {
    id: 'c22',
    name: 'Snack Path',
    story: 'Robot wants to take two careful steps to a snack.',
    grid: [
      [{ type: 'start' }],
      [{ type: 'empty' }],
      [{ type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 0, y: 2 },
    maxBlocks: 3,
    hint: 'Move forward twice.',
    gradeLevel: 1,
    category: 'basic'
  },
  {
    id: 'c23',
    name: 'Garden Corner',
    story: 'Robot turns around the garden fence.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 1, y: 1 },
    maxBlocks: 4,
    hint: 'Move right, turn right, move down.',
    gradeLevel: 2,
    category: 'turns'
  },
  {
    id: 'c24',
    name: 'Up Then Over',
    story: 'Robot needs to climb up, then move over.',
    grid: [
      [{ type: 'empty' }, { type: 'goal' }],
      [{ type: 'start' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 1, direction: 'up' },
    goalPos: { x: 1, y: 0 },
    maxBlocks: 4,
    hint: 'Move up, turn right, then move.',
    gradeLevel: 2,
    category: 'turns'
  },
  {
    id: 'c25',
    name: 'Rock Detour',
    story: 'Robot must go around one rock and stay on the path.',
    grid: [
      [{ type: 'start' }, { type: 'obstacle' }, { type: 'goal' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 2, y: 0 },
    maxBlocks: 7,
    hint: 'Go down, across, then back up.',
    gradeLevel: 3,
    category: 'maze'
  },
  {
    id: 'c26',
    name: 'Bridge Builder',
    story: 'Robot follows the bridge path without stepping into water.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 2, y: 2 },
    maxBlocks: 7,
    hint: 'Move across, then turn down.',
    gradeLevel: 3,
    category: 'maze'
  },
  {
    id: 'c27',
    name: 'Loop Ladder',
    story: 'Robot climbs a ladder where repeat blocks save time.',
    grid: [
      [{ type: 'goal' }],
      [{ type: 'empty' }],
      [{ type: 'empty' }],
      [{ type: 'empty' }],
      [{ type: 'start' }],
    ],
    startPos: { x: 0, y: 4, direction: 'up' },
    goalPos: { x: 0, y: 0 },
    maxBlocks: 3,
    hint: 'Use move and repeat to climb.',
    gradeLevel: 4,
    category: 'loops'
  },
  {
    id: 'c28',
    name: 'Loop Bridge',
    story: 'Robot crosses a long bridge with a short program.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 5, y: 0 },
    maxBlocks: 3,
    hint: 'One move plus repeat can go far.',
    gradeLevel: 4,
    category: 'loops'
  },
  {
    id: 'c29',
    name: 'Debug Garden',
    story: 'Robot checks each turn before moving through the garden.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'goal' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 0, y: 2 },
    maxBlocks: 9,
    hint: 'Go around the wall, then come back left.',
    gradeLevel: 5,
    category: 'maze'
  },
  {
    id: 'c30',
    name: 'Gem Route',
    story: 'Robot plans a careful route through the gem cave.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 3, y: 2 },
    maxBlocks: 10,
    hint: 'Move down, turn left or right carefully, and avoid the blocked spaces.',
    gradeLevel: 5,
    category: 'maze'
  },
  {
    id: 'c31',
    name: 'Algorithm Alley',
    story: 'Robot needs a clean algorithm with no wasted blocks.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'obstacle' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 3, y: 2 },
    maxBlocks: 8,
    hint: 'Plan the route before dragging blocks.',
    gradeLevel: 6,
    category: 'advanced'
  },
  {
    id: 'c32',
    name: 'Loop Shortcut',
    story: 'Robot can solve this faster by reusing a repeated move.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 2, y: 2 },
    maxBlocks: 6,
    hint: 'Move across, turn, then move down.',
    gradeLevel: 6,
    category: 'advanced'
  },
  {
    id: 'c35',
    name: 'Pattern Patrol',
    story: 'Robot patrols a pattern route and checks each corner.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
      [{ type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'obstacle' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 3, y: 0 },
    maxBlocks: 10,
    hint: 'A direct path works, but check the route before you run it.',
    gradeLevel: 6,
    category: 'advanced'
  },
  {
    id: 'c33',
    name: 'Final Debug',
    story: 'Robot must debug a winding path to reach the finish.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'goal' }],
      [{ type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 4, y: 0 },
    maxBlocks: 13,
    hint: 'Trace the path with your finger before running code.',
    gradeLevel: 7,
    category: 'advanced'
  },
  {
    id: 'c34',
    name: 'Efficiency Expert',
    story: 'Robot earns a badge by solving the route with fewer blocks.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'goal' }, { type: 'empty' }, { type: 'empty' }, { type: 'obstacle' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 0, y: 2 },
    maxBlocks: 10,
    hint: 'Go across, down, then turn back toward the goal.',
    gradeLevel: 7,
    category: 'advanced'
  },
  {
    id: 'c36',
    name: 'Kindergarten Turn Practice',
    story: 'Robot practices one turn before walking to the star.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 1, y: 1 },
    maxBlocks: 4,
    hint: 'Move down, turn left, then move.',
    gradeLevel: 2,
    category: 'turns'
  },
  {
    id: 'c37',
    name: 'Kindergarten Side Step',
    story: 'Robot is facing up, but the star is to the side.',
    grid: [
      [{ type: 'start' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'up' },
    goalPos: { x: 1, y: 0 },
    maxBlocks: 3,
    hint: 'Turn right first, then move.',
    gradeLevel: 2,
    category: 'turns'
  },
  {
    id: 'c38',
    name: 'Kindergarten Down Path',
    story: 'Robot walks down the classroom rug to the star.',
    grid: [
      [{ type: 'start' }],
      [{ type: 'empty' }],
      [{ type: 'empty' }],
      [{ type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'down' },
    goalPos: { x: 0, y: 3 },
    maxBlocks: 4,
    hint: 'Move forward three times.',
    gradeLevel: 2,
    category: 'basic'
  },
  {
    id: 'c39',
    name: 'First Grade Hallway',
    story: 'Robot needs to go around a hallway corner without bumping the wall.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'goal' }],
      [{ type: 'obstacle' }, { type: 'empty' }, { type: 'obstacle' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 2, y: 0 },
    maxBlocks: 6,
    hint: 'Move right, go around the middle, then come back to the star.',
    gradeLevel: 3,
    category: 'maze'
  },
  {
    id: 'c40',
    name: 'First Grade Garden Gate',
    story: 'Robot opens the garden gate by following the clear squares.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'obstacle' }, { type: 'empty' }],
      [{ type: 'goal' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 0, y: 2 },
    maxBlocks: 8,
    hint: 'Go across first, then down, then back left.',
    gradeLevel: 3,
    category: 'maze'
  },
  {
    id: 'c41',
    name: 'First Grade Careful Turn',
    story: 'Robot must turn only when the path changes.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 1, y: 2 },
    maxBlocks: 5,
    hint: 'Move right, turn right, then move down two times.',
    gradeLevel: 3,
    category: 'turns'
  },
  {
    id: 'c42',
    name: 'Second Grade Repeat Row',
    story: 'Robot uses repeat to cross a long classroom row.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 4, y: 0 },
    maxBlocks: 3,
    hint: 'Use Move Forward, then Repeat 2x, and add one more move if needed.',
    gradeLevel: 4,
    category: 'loops'
  },
  {
    id: 'c43',
    name: 'Second Grade Stair Steps',
    story: 'Robot follows a stair-step path and checks each turn.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'obstacle' }],
      [{ type: 'obstacle' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'obstacle' }, { type: 'obstacle' }, { type: 'goal' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 2, y: 2 },
    maxBlocks: 7,
    hint: 'Move, turn, move, turn, and keep following the open stair path.',
    gradeLevel: 4,
    category: 'loops'
  },
  {
    id: 'c44',
    name: 'Second Grade Debug Loop',
    story: 'Robot should not run into the rock, so the plan needs a careful turn.',
    grid: [
      [{ type: 'start' }, { type: 'empty' }, { type: 'obstacle' }, { type: 'goal' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
    ],
    startPos: { x: 0, y: 0, direction: 'right' },
    goalPos: { x: 3, y: 0 },
    maxBlocks: 8,
    hint: 'Go around the obstacle below, then return to the top row.',
    gradeLevel: 4,
    category: 'loops'
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
  const dailyChallengeIndex = useMemo(() => {
    const dayKey = new Date().toISOString().slice(0, 10);
    const seed = [...dayKey].reduce((total, char) => total + char.charCodeAt(0), 0);
    return seed % Math.max(availableChallenges.length, 1);
  }, [availableChallenges.length]);

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(dailyChallengeIndex);
  const [challenge, setChallenge] = useState<Challenge>(availableChallenges[dailyChallengeIndex] || availableChallenges[0]);
  const [code, setCode] = useState<CodeBlock[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [robotPos, setRobotPos] = useState<Position>(availableChallenges[0].startPos);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [coachTip, setCoachTip] = useState('');
  const hasAnnouncedFirstChallenge = useRef(false);

  const codingTip = useMemo(() => {
    if (level <= 2) return 'Build the path one step at a time.';
    if (level <= 4) return 'Watch the robot direction before you add a turn.';
    return 'Plan the path first, then use repeat blocks to stay efficient.';
  }, [level]);

  const teacherIntro = useMemo(() => {
    if (level <= 2) return 'Teacher says: Watch the path and help the robot move one step at a time.';
    if (level <= 4) return 'Teacher says: Think about which way the robot is facing before each move.';
    return 'Teacher says: Plan the full path first, then build the code carefully.';
  }, [level]);

  const stepCoach = useMemo(() => {
    const horizontal = challenge.goalPos.x - robotPos.x;
    const vertical = challenge.goalPos.y - robotPos.y;
    const axisHint = Math.abs(horizontal) >= Math.abs(vertical)
      ? horizontal > 0 ? 'The goal is more to the right.' : horizontal < 0 ? 'The goal is more to the left.' : 'The robot is lined up sideways.'
      : vertical > 0 ? 'The goal is lower on the board.' : vertical < 0 ? 'The goal is higher on the board.' : 'The robot is lined up up-and-down.';
    const obstacleWarning = challenge.grid.flat().some(cell => cell.type === 'obstacle')
      ? 'Check for blocked squares before pressing run.'
      : 'This path is open, so focus on order.';
    const nextBlockHint = code.length === 0
      ? 'Start with one move or one turn, then test the path in your mind.'
      : code.length >= challenge.maxBlocks
        ? 'The code tray is full. Remove a block if the plan is not right.'
        : 'Add the next block only after you can say what it will do.';

    return {
      axisHint,
      obstacleWarning,
      nextBlockHint,
      facing: `Robot is facing ${robotPos.direction}.`,
    };
  }, [challenge, code.length, robotPos]);

  useEffect(() => {
    const startLesson = async () => {
      await speakAsync(`Welcome to Coding Corner. ${codingTip}`);
      await speakAsync(teacherIntro, 0.88, 1.03);
      await speakAsync(challenge.story, 0.86, 1.03);
      hasAnnouncedFirstChallenge.current = true;
    };
    void startLesson();
  }, [codingTip, challenge.story, teacherIntro]);

  // When challenge changes, read the new story
  useEffect(() => {
    if (!challenge) return;

    setCoachTip(codingTip);

    if (!hasAnnouncedFirstChallenge.current) {
      return;
    }

    void (async () => {
      await speakAsync(teacherIntro, 0.88, 1.03);
      await speakAsync(challenge.story, 0.86, 1.03);
    })();
  }, [challenge.id, codingTip, challenge.story, teacherIntro]);

  const resetChallenge = () => {
    setRobotPos({ ...challenge.startPos });
    setPath([]);
    setWon(false);
    setCode([]);
  };

  const addBlock = (block: CodeBlock) => {
    if (code.length < challenge.maxBlocks) {
      setCode([...code, { ...block, id: `${block.id}-${Date.now()}` }]);
      void speakAsync(`${block.label}. ${block.type === 'move' ? 'The robot will step forward.' : block.type === 'repeat' ? 'Repeat uses the block before it again.' : `The robot will ${block.label.toLowerCase()}.`}`, 0.82, 1.02);
    }
  };

  const removeBlock = (index: number) => {
    setCode(code.filter((_, i) => i !== index));
  };

  const speakHint = () => {
    void speakAsync(`Teacher hint. ${challenge.hint}`, 0.84, 1.02);
  };

  const speakCodePlan = () => {
    const codeText = code.length
      ? code.map((block, index) => `Step ${index + 1}: ${block.label}`).join('. ')
      : 'No blocks are in the code tray yet.';
    void speakAsync(`${challenge.story} ${stepCoach.facing} ${stepCoach.axisHint} ${stepCoach.obstacleWarning} ${codeText}`, 0.82, 1.02);
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
      void speakCorrect("You solved it. You are becoming a real programmer.");
      onReward();
    } else {
      playWrongBuzzer();
      void speakWrong("The robot did not reach the star. Try a different path.");
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

  useEffect(() => {
    const nextChallengeForDay = availableChallenges[dailyChallengeIndex] || availableChallenges[0];
    setCurrentChallengeIndex(dailyChallengeIndex);
    setChallenge(nextChallengeForDay);
    setRobotPos({ ...nextChallengeForDay.startPos });
    setPath([]);
    setWon(false);
    setCode([]);
  }, [dailyChallengeIndex, level]);

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
    <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,#22d3ee_0,#6366f1_34%,#a855f7_68%,#db2777_100%)] flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm">
        <button onClick={onBack} aria-label="Back to world map" className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
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
          <div className="bg-white/95 rounded-2xl p-4 shadow-lg ring-1 ring-white/60">
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
            <p className="text-sm text-indigo-900 font-semibold mt-2">Coach Tip: {coachTip}</p>
            <p className="text-indigo-600 mt-2 font-medium">💡 {challenge.hint}</p>
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-pink-50 p-3 ring-1 ring-indigo-100">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-indigo-600">Step Coach</div>
                  <div className="mt-1 text-sm font-bold text-slate-700">{stepCoach.facing} {stepCoach.axisHint}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{stepCoach.obstacleWarning}</div>
                  <div className="mt-1 text-xs font-black text-indigo-700">{stepCoach.nextBlockHint}</div>
                </div>
                <button
                  onClick={speakCodePlan}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow hover:bg-indigo-700"
                >
                  <Volume2 size={14} />
                  Read plan
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 text-xs font-black uppercase tracking-[0.22em] text-indigo-600 sm:col-span-1">Robot Command Center</div>
                {[
                  ['Plan', 'Find the path'],
                  ['Build', 'Tap blocks'],
                  ['Run', 'Test robot'],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-xl bg-white p-2 text-center shadow-sm">
                    <div className="text-sm font-black text-slate-800">{title}</div>
                    <div className="text-xs font-semibold text-slate-500">{copy}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="bg-white/95 rounded-2xl p-4 shadow-lg flex-1 flex items-center justify-center ring-1 ring-white/60">
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
          <div className="bg-white/95 rounded-2xl p-4 shadow-lg ring-1 ring-white/60">
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
          <div className="bg-white/95 rounded-2xl p-4 shadow-lg flex-1 ring-1 ring-white/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700">Your Code</h3>
              <span className="text-sm text-gray-500">{code.length}/{challenge.maxBlocks} blocks</span>
            </div>

            <div className="space-y-2 min-h-32 bg-slate-100 rounded-2xl p-2 ring-1 ring-slate-200">
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
          <div className="bg-white/95 rounded-2xl p-3 shadow-lg ring-1 ring-white/60">
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
