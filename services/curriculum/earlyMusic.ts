import { createSeededRandom, getDailySeed } from '../dailyRotation';

export type EarlyMusicVisual = 'pitch' | 'tempo' | 'beats' | 'compare' | 'melody' | 'rhythm' | 'echo' | 'rest';

export interface EarlyMusicQuestion {
  id: string;
  phase: string;
  title: string;
  prompt: string;
  visual: EarlyMusicVisual;
  musicClue: string;
  sampleNotes: number[];
  sampleGapMs: number;
  answer: string;
  options: string[];
  skill: string;
  explanation: string;
}

const PHASES = ['Listen', 'Move to the beat', 'Compare sounds', 'Echo', 'Build a pattern', 'Music check'];
const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};
const options = (answer: string, distractors: string[], random: () => number) => shuffle([answer, ...distractors.filter(item => item !== answer).slice(0, 3)], random);
const pick = <T,>(items: T[], random: () => number) => items[Math.floor(random() * items.length)];
type Factory = (random: () => number) => Omit<EarlyMusicQuestion, 'id' | 'phase'>;

const preKFactories: Factory[] = [
  random => {
    const high = random() > 0.5;
    return { title: 'High or Low', prompt: 'Listen to the note. Is its pitch high or low?', visual: 'pitch', musicClue: high ? 'A small, high sound' : 'A deep, low sound', sampleNotes: [high ? 523.25 : 196], sampleGapMs: 450, answer: high ? 'High' : 'Low', options: options(high ? 'High' : 'Low', ['High', 'Low', 'Fast', 'Silent'].filter(item => item !== (high ? 'High' : 'Low')), random), skill: 'hearing high and low pitch', explanation: `${high ? 'High' : 'Low'} describes the pitch, or how high or low a sound seems.` };
  },
  random => {
    const fast = random() > 0.5;
    return { title: 'Fast or Slow Beat', prompt: 'Listen to the beat. Is the tempo fast or slow?', visual: 'tempo', musicClue: fast ? 'Beats close together' : 'Beats with more space', sampleNotes: [262, 262, 262, 262], sampleGapMs: fast ? 220 : 650, answer: fast ? 'Fast' : 'Slow', options: options(fast ? 'Fast' : 'Slow', ['Fast', 'Slow', 'High', 'Low'].filter(item => item !== (fast ? 'Fast' : 'Slow')), random), skill: 'hearing fast and slow tempo', explanation: `${fast ? 'Fast' : 'Slow'} describes the tempo, or speed of the beat.` };
  },
  random => {
    const same = random() > 0.5;
    return { title: 'Same or Different', prompt: 'Listen to the two notes. Do they sound the same or different?', visual: 'compare', musicClue: same ? 'Two matching pitches' : 'Two changing pitches', sampleNotes: same ? [330, 330] : [262, 440], sampleGapMs: 500, answer: same ? 'Same' : 'Different', options: options(same ? 'Same' : 'Different', ['Same', 'Different', 'Four beats', 'A rest'].filter(item => item !== (same ? 'Same' : 'Different')), random), skill: 'comparing two sounds', explanation: same ? 'The notes are the same because both pitches match.' : 'The notes are different because the second pitch changes.' };
  },
  random => {
    const count = pick([2, 3, 4], random);
    return { title: 'Count the Beats', prompt: 'How many beats do you hear?', visual: 'beats', musicClue: 'Count one sound at a time', sampleNotes: Array.from({ length: count }, () => 294), sampleGapMs: 430, answer: String(count), options: options(String(count), ['1', '2', '3', '4'].filter(item => item !== String(count)), random), skill: 'counting beats', explanation: `You heard ${count} separate beats. Counting each sound helps musicians keep a steady pulse.` };
  },
  random => {
    const up = random() > 0.5;
    return { title: 'Melody Direction', prompt: 'Do the notes move up or down?', visual: 'melody', musicClue: up ? 'Each note sounds higher' : 'Each note sounds lower', sampleNotes: up ? [262, 330, 392] : [392, 330, 262], sampleGapMs: 420, answer: up ? 'Up' : 'Down', options: options(up ? 'Up' : 'Down', ['Up', 'Down', 'Same', 'Rest'].filter(item => item !== (up ? 'Up' : 'Down')), random), skill: 'hearing melodic direction', explanation: `The melody moves ${up ? 'up' : 'down'} because each note becomes ${up ? 'higher' : 'lower'}.` };
  },
  random => ({ title: 'Rhythm Pattern', prompt: 'Which words match the rhythm you hear?', visual: 'rhythm', musicClue: 'Two sounds, a space, then one sound', sampleNotes: [330, 330, 0, 330], sampleGapMs: 380, answer: 'Clap, clap, rest, clap', options: options('Clap, clap, rest, clap', ['Clap, rest, rest, clap', 'Rest, clap, clap, clap', 'Clap, clap, clap, clap'], random), skill: 'matching a simple rhythm', explanation: 'The sample has two beats, one quiet rest, and one final beat.' }),
  random => ({ title: 'Echo the Pattern', prompt: 'Which pattern would echo the music exactly?', visual: 'echo', musicClue: 'Low, high, low', sampleNotes: [220, 440, 220], sampleGapMs: 430, answer: 'Low, high, low', options: options('Low, high, low', ['High, low, high', 'Low, low, high', 'High, high, low'], random), skill: 'echoing a pitch pattern', explanation: 'An echo repeats the same sounds in the same order: low, high, low.' }),
  random => ({ title: 'Hear the Rest', prompt: 'What happens in the middle of this pattern?', visual: 'rest', musicClue: 'Sound, quiet space, sound', sampleNotes: [330, 0, 330], sampleGapMs: 520, answer: 'A rest', options: options('A rest', ['A faster beat', 'A very high note', 'Four sounds together'], random), skill: 'recognizing a musical rest', explanation: 'The quiet space is a rest. A rest is a planned moment of silence in music.' }),
];

const kindergartenFactories: Factory[] = [
  random => {
    const secondHigher = random() > 0.5;
    return { title: 'Compare Pitch', prompt: 'Which note is higher?', visual: 'pitch', musicClue: secondHigher ? 'First note, then a higher note' : 'A high note, then a lower note', sampleNotes: secondHigher ? [262, 440] : [440, 262], sampleGapMs: 500, answer: secondHigher ? 'The second note' : 'The first note', options: options(secondHigher ? 'The second note' : 'The first note', ['The first note', 'The second note', 'Both are rests', 'There are no notes'].filter(item => item !== (secondHigher ? 'The second note' : 'The first note')), random), skill: 'comparing pitch', explanation: `${secondHigher ? 'The second' : 'The first'} note has the higher pitch.` };
  },
  random => {
    const fast = random() > 0.5;
    return { title: 'Tempo Detective', prompt: 'Which movement best matches this tempo?', visual: 'tempo', musicClue: fast ? 'Quick, close beats' : 'Slow, spaced beats', sampleNotes: [294, 294, 294, 294], sampleGapMs: fast ? 200 : 700, answer: fast ? 'Quick steps' : 'Slow steps', options: options(fast ? 'Quick steps' : 'Slow steps', ['Quick steps', 'Slow steps', 'No movement ever', 'One long rest'].filter(item => item !== (fast ? 'Quick steps' : 'Slow steps')), random), skill: 'connecting tempo and movement', explanation: `${fast ? 'Quick' : 'Slow'} steps match the ${fast ? 'fast' : 'slow'} speed of the beat.` };
  },
  random => {
    const count = pick([3, 4, 5], random);
    return { title: 'Steady Beat Count', prompt: 'Count the steady beats. How many do you hear?', visual: 'beats', musicClue: 'Every beat has equal space', sampleNotes: Array.from({ length: count }, () => 330), sampleGapMs: 400, answer: String(count), options: options(String(count), ['2', '3', '4', '5'].filter(item => item !== String(count)), random), skill: 'counting a steady beat', explanation: `There are ${count} evenly spaced beats in the sample.` };
  },
  random => ({ title: 'Finish the Pattern', prompt: 'The pattern is low, high, low. Which sound comes next?', visual: 'rhythm', musicClue: 'LOW, HIGH, LOW, ?', sampleNotes: [220, 440, 220], sampleGapMs: 400, answer: 'High', options: options('High', ['Low', 'Rest', 'Faster'], random), skill: 'continuing an AB pitch pattern', explanation: 'The pattern alternates low, high, low, high, so high comes next.' }),
  random => ({ title: 'Melody Shape', prompt: 'What shape does this melody make?', visual: 'melody', musicClue: 'Low, middle, high, middle', sampleNotes: [220, 330, 440, 330], sampleGapMs: 380, answer: 'Up, then down', options: options('Up, then down', ['Down only', 'The same note', 'Only silence'], random), skill: 'describing melody shape', explanation: 'The pitches rise from low to high, then move down to the middle.' }),
  random => ({ title: 'Copy the Rhythm', prompt: 'Which rhythm matches the sample?', visual: 'echo', musicClue: 'Beat, beat, rest, beat', sampleNotes: [330, 330, 0, 330], sampleGapMs: 360, answer: 'Tap, tap, rest, tap', options: options('Tap, tap, rest, tap', ['Tap, rest, tap, rest', 'Rest, tap, tap, tap', 'Tap, tap, tap, tap'], random), skill: 'copying a rhythm sequence', explanation: 'The matching rhythm keeps both the sounds and the rest in the same order.' }),
  random => ({ title: 'Musical Sentence', prompt: 'The first three notes rise. Which ending sounds finished?', visual: 'melody', musicClue: 'Low, middle, high, low', sampleNotes: [262, 330, 392, 262], sampleGapMs: 390, answer: 'The melody returns to the low note', options: options('The melody returns to the low note', ['The melody never ends', 'Every note is silent', 'The beat disappears before starting'], random), skill: 'hearing a musical ending', explanation: 'Returning to the starting low note gives the short melody a clear ending.' }),
  random => ({ title: 'Rest in a Measure', prompt: 'How many sounds occur before the rest?', visual: 'rest', musicClue: 'Sound, sound, sound, rest', sampleNotes: [294, 294, 294, 0], sampleGapMs: 420, answer: '3', options: options('3', ['1', '2', '4'], random), skill: 'locating a rest in a pattern', explanation: 'Three sounds play before the quiet rest at the end.' }),
];

export const generateEarlyMusicQuestion = (level: 1 | 2, step: number): EarlyMusicQuestion => {
  const random = createSeededRandom(getDailySeed(`early-music-grade-${level}`, step));
  const factories = level === 1 ? preKFactories : kindergartenFactories;
  const question = factories[step % factories.length](random);
  return { ...question, id: `early-music-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`, phase: PHASES[step % PHASES.length] };
};
