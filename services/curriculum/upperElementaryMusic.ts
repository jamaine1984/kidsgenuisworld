import { createSeededRandom, getDailySeed } from '../dailyRotation';
import { EarlyMusicQuestion, EarlyMusicVisual } from './earlyMusic';

export type UpperElementaryMusicLevel = 5 | 6 | 7;

const PHASES = ['Listen closely', 'Read the pattern', 'Analyze', 'Perform', 'Create', 'Music check'];

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const q = (
  title: string,
  prompt: string,
  visual: EarlyMusicVisual,
  musicClue: string,
  sampleNotes: number[],
  sampleGapMs: number,
  answer: string,
  distractors: string[],
  skill: string,
  explanation: string,
  random: () => number,
): Omit<EarlyMusicQuestion, 'id' | 'phase'> => ({
  title, prompt, visual, musicClue, sampleNotes, sampleGapMs, answer,
  options: shuffle([answer, ...distractors], random), skill, explanation,
});

const gradeThree = (r: () => number) => [
  q('Read the Meter', 'Which meter matches the accented beat pattern?', 'beats', 'ONE two three four | ONE two three four', [440, 294, 294, 294, 440, 294, 294, 294], 320, '4 beats per measure', ['2 beats per measure', '3 beats per measure', 'No steady meter'], 'identifying meter in four', 'The strong first beat returns after three weaker beats, organizing the music into groups of four.', r),
  q('Build a Measure', 'Which rhythm fills one complete four-beat measure?', 'rhythm', 'Quarter note = 1 beat; half note = 2 beats', [330, 330, 0, 392], 390, 'half note + quarter note + quarter note', ['half note + half note + quarter note', 'one quarter note', 'three half notes'], 'combining rhythm values', 'A half note lasts two beats and two quarter notes add one beat each, making four beats altogether.', r),
  q('Name the Rest Value', 'A planned silence lasts for two beats. Which rest is needed?', 'rest', 'Sound | quiet for two beats | sound', [330, 0, 0, 330], 430, 'half rest', ['quarter rest', 'whole note', 'eighth-note pair'], 'identifying rest duration', 'A half rest represents two beats of planned silence in common four-beat meter.', r),
  q('Hear Steps and Leaps', 'How does the melody move from the first note to the second?', 'pitch', 'C up to G', [262, 392], 520, 'up by a leap', ['up by a step', 'down by a step', 'the pitch repeats'], 'distinguishing steps and leaps', 'C and G are separated by several scale tones, so the melody moves upward by a leap.', r),
  q('Follow the Dynamics', 'Which dynamic change best describes the sample idea?', 'compare', 'Begin softly, then gradually grow stronger', [262, 294, 330, 392], 360, 'crescendo', ['decrescendo', 'steady silence', 'slower tempo'], 'dynamic contrast and crescendo', 'Crescendo means the sound gradually becomes louder, creating increasing musical energy.', r),
  q('Identify Timbre', 'Why can a flute and a violin play the same pitch but sound different?', 'compare', 'Same pitch, different instruments', [330, 330], 500, 'They have different tone colors', ['They must use different tempos', 'One has no vibration', 'Pitch and timbre mean the same thing'], 'instrument timbre', 'Timbre is the tone color created by how an instrument vibrates, so instruments can sound different on the same pitch.', r),
  q('Recognize Rondo Form', 'Which form matches a main section that returns between contrasting sections?', 'melody', 'A | B | A | C | A', [262, 330, 0, 392, 349, 0, 262, 330, 0, 440, 392, 0, 262, 330], 250, 'ABACA', ['AABB', 'ABC', 'AAAA'], 'recognizing rondo form', 'The recurring A section returns after B and C, creating the rondo pattern ABACA.', r),
  q('Find the Ostinato', 'Which short pattern repeats underneath the phrase?', 'echo', 'low-high-low | low-high-low | low-high-low', [220, 330, 220, 220, 330, 220, 220, 330, 220], 260, 'low, high, low', ['high, low, high', 'three high notes', 'one long rest'], 'identifying melodic ostinato', 'Low, high, low repeats without changing, so it acts as the ostinato that supports the music.', r),
  q('Hear Question and Answer', 'How does the second phrase relate to the first?', 'compare', 'Rising phrase | falling phrase', [262, 330, 392, 0, 392, 330, 262], 340, 'It answers the first phrase', ['It copies only silence', 'It begins a new tempo', 'It has no relationship'], 'phrase relationships', 'The first phrase rises and feels open, while the second falls back and creates a musical answer.', r),
  q('Choose an Ensemble Role', 'Which instrument part should keep the group together with a steady pulse?', 'beats', 'Ensemble needs a clear, dependable beat', [294, 294, 294, 294], 400, 'a steady percussion pattern', ['a random solo with no pulse', 'a silent melody part', 'a different tempo for each player'], 'ensemble pulse and cooperation', 'A consistent percussion pattern gives every performer a shared pulse for entrances and rhythm.', r),
  q('Complete a Sequence', 'How does the second musical idea change?', 'melody', 'C-D-E | D-E-F', [262, 294, 330, 0, 294, 330, 349], 310, 'The pattern repeats one step higher', ['The pattern reverses', 'Every pitch stays the same', 'The second idea is only rests'], 'melodic sequence', 'The same three-note shape begins on D instead of C, so the sequence repeats one step higher.', r),
  q('Compose a Balanced Phrase', 'Which ending gives C-E-G a settled sound?', 'melody', 'C, E, G, ?', [262, 330, 392], 400, 'return to C', ['stop before the first note', 'repeat G forever', 'add unrelated noise'], 'composing melodic closure', 'Returning to C brings the phrase back to its home pitch and creates a clear musical ending.', r),
];

const gradeFour = (r: () => number) => [
  q('Compare Meter', 'Which clue shows that this excerpt is in three rather than four?', 'beats', 'ONE two three | ONE two three', [440, 294, 294, 440, 294, 294], 350, 'The strong beat returns every 3 beats', ['Every pitch is high', 'The tempo changes every beat', 'There are four strong beats'], 'comparing meters', 'Meter is heard through recurring accents; here the strong beat returns after two weaker beats, making groups of three.', r),
  q('Read Six Eighth Notes', 'Six eighth notes fill how many beats when two eighth notes share one beat?', 'rhythm', 'ti-ti | ti-ti | ti-ti', [330, 392, 330, 392, 330, 392], 220, '3 beats', ['2 beats', '6 beats', '12 beats'], 'eighth-note equivalence', 'Each pair of eighth notes equals one beat, so three pairs fill three beats.', r),
  q('Hear Syncopation', 'What makes this rhythm sound off balance in an interesting way?', 'rhythm', 'rest-SOUND | rest-SOUND', [0, 392, 0, 392], 300, 'Important sounds occur between the main beats', ['Every sound lands on the strongest beat', 'The rhythm contains no silence', 'The pitch only moves downward'], 'recognizing syncopation', 'Syncopation emphasizes normally weaker spaces or offbeats, creating a surprising rhythmic pull.', r),
  q('Identify an Interval', 'The notes C and G form which commonly heard interval?', 'pitch', 'C up to G', [262, 392], 600, 'a fifth', ['a second', 'a third', 'an octave'], 'identifying basic intervals', 'Counting C-D-E-F-G inclusively gives five scale positions, so C to G is a fifth.', r),
  q('Hear Major and Minor Color', 'Which description best fits a minor-key musical idea?', 'compare', 'A darker, more tense tonal color', [262, 311, 392, 311, 262], 360, 'It often sounds more serious or unsettled', ['It always sounds faster', 'It contains no beat', 'It can use only one pitch'], 'major and minor tonal color', 'Minor tonality often creates a serious or unsettled color, although tempo and meaning still depend on the full piece.', r),
  q('Shape a Phrase', 'What does a decrescendo tell performers to do?', 'compare', 'The sound gradually narrows and softens', [392, 349, 330, 294], 420, 'gradually get quieter', ['gradually get louder', 'immediately double the tempo', 'repeat the first pitch forever'], 'decrescendo and expression', 'A decrescendo directs performers to decrease volume gradually rather than changing pitch or tempo.', r),
  q('Classify an Instrument', 'Why is a clarinet placed in the woodwind family?', 'compare', 'Air vibrates through the instrument and a reed begins the sound', [294, 294], 500, 'Its sound is produced by blown air and a reed', ['It is struck with a mallet', 'It always plays the lowest notes', 'Its strings are bowed'], 'instrument family classification', 'The clarinet belongs to the woodwind family because the player blows air and the reed vibrates to begin the sound.', r),
  q('Analyze Theme and Variation', 'What stays recognizable in a theme-and-variation piece?', 'melody', 'Theme | changed rhythm | changed register | changed timbre', [262, 330, 392, 0, 262, 392, 330], 330, 'The main musical idea', ['Every detail stays identical', 'Only the silence', 'The title must change'], 'theme and variation form', 'Variations alter features such as rhythm, register, or timbre while keeping the main theme recognizable.', r),
  q('Hear Two-Part Texture', 'What creates harmony in an ensemble?', 'compare', 'One part holds C while another plays E', [262, 330], 700, 'Different pitches sound together', ['Everyone performs only rests', 'One note plays by itself', 'The beat stops completely'], 'harmony and texture', 'Harmony occurs when different pitches sound at the same time and support the musical texture.', r),
  q('Plan an Ensemble Rehearsal', 'What should a group do first when entrances are not together?', 'beats', 'Players enter at different times', [294, 0, 294, 294], 380, 'Count a shared pulse and practice the entrance slowly', ['Each player chooses a new tempo', 'Play louder without counting', 'Skip the difficult entrance'], 'ensemble rehearsal strategies', 'Slowing down and counting the same pulse helps performers coordinate exactly when the entrance begins.', r),
  q('Read a Repeat Sign', 'What does a repeat sign tell a performer?', 'echo', 'Play section A, repeat sign', [262, 330, 392, 0, 262, 330, 392], 300, 'Play the marked section again', ['Skip the marked section', 'Change every note', 'Stop before the section'], 'musical repeat notation', 'A repeat sign sends the performer back to replay the indicated section in the same sequence.', r),
  q('Revise a Composition', 'A melody has no contrast. Which revision adds contrast while keeping it unified?', 'melody', 'Current form: A A A A', [262, 330, 262, 330, 262, 330], 280, 'Add a B phrase, then return to A', ['Delete every phrase', 'Use random sounds only', 'Make every note identical and longer'], 'revising musical form', 'Adding a contrasting B phrase and returning to A creates variety while the returning idea keeps the piece connected.', r),
];

const gradeFive = (r: () => number) => [
  q('Hear Compound Meter', 'Which beat pattern best describes 6/8 meter?', 'beats', 'ONE two three FOUR five six', [440, 294, 294, 440, 294, 294], 240, 'two large beats, each divided into three', ['six unrelated strong beats', 'three groups of two strong beats only', 'one beat with no divisions'], 'compound meter in six-eight', 'Six-eighth meter commonly groups six eighth notes into two larger beats, each divided into three smaller pulses.', r),
  q('Complete a Rhythm Sum', 'Which combination has the same duration as one whole note in 4/4?', 'rhythm', 'Whole note = 4 beats', [330, 0, 0, 0], 430, 'two half notes', ['one half note', 'three quarter notes', 'one eighth note pair'], 'rhythmic equivalence', 'Each half note lasts two beats, so two half notes equal the four-beat duration of one whole note.', r),
  q('Identify a Triad', 'Which notes build a C major triad?', 'pitch', 'Root, third, fifth', [262, 330, 392], 520, 'C, E, G', ['C, D, E', 'C, F, G', 'D, E, F'], 'major triad construction', 'A major triad uses the root, major third, and perfect fifth; from C, those notes are C, E, and G.', r),
  q('Recognize a Cadence', 'What does a strong return from G harmony to C harmony usually create?', 'melody', 'G-B-D moves to C-E-G', [392, 494, 587, 0, 262, 330, 392], 260, 'a settled ending', ['an unfinished question only', 'a missing pulse', 'a random key change'], 'hearing harmonic resolution', 'Movement from the dominant harmony on G to the home harmony on C creates a strong sense of arrival and closure.', r),
  q('Analyze Countermelody', 'What is a countermelody?', 'compare', 'Main melody plus a different supporting melodic line', [262, 330, 392, 330, 294, 349, 440, 349], 300, 'a second melody that complements the main melody', ['the same melody played louder', 'a measure of complete silence', 'a tempo marking'], 'countermelody and texture', 'A countermelody has its own shape but is designed to fit with and support the primary melodic line.', r),
  q('Interpret Articulation', 'How should staccato notes be performed?', 'rhythm', 'Short, separated sounds', [330, 0, 330, 0, 330], 250, 'short and detached', ['smoothly connected', 'gradually louder', 'as one unbroken note'], 'staccato articulation', 'Staccato marks indicate short, detached sounds with space between them rather than a connected legato line.', r),
  q('Compare Orchestration', 'Why might a composer move a melody from flute to cello?', 'compare', 'Same melody, new instrument family and register', [523, 392, 330, 196], 390, 'to change its timbre and expressive color', ['to remove every pitch', 'to guarantee a faster tempo', 'to change the meter automatically'], 'orchestration and timbre', 'Changing the performing instrument changes register, tone color, and expressive effect even when the melody stays the same.', r),
  q('Analyze Binary Form', 'Which description matches rounded binary form?', 'melody', 'A section | B section | return of part of A', [262, 330, 392, 0, 440, 392, 349, 0, 262, 330], 280, 'A B with the opening idea returning near the end', ['A only', 'three unrelated sections', 'the same measure forever'], 'rounded binary form', 'Rounded binary form has two main sections, but material from the opening A section returns near the end of B.', r),
  q('Follow a Score', 'What does the conductor help an ensemble coordinate?', 'beats', 'Shared tempo, entrances, dynamics, and cutoffs', [294, 294, 294, 294], 360, 'timing and expression across all parts', ['only the instrument names', 'the audience seating', 'one player with no attention to others'], 'conductor and ensemble coordination', 'Conducting gestures help many performers share tempo, entrances, dynamics, phrasing, and endings.', r),
  q('Evaluate a Performance', 'Which feedback is specific and useful after a rehearsal?', 'compare', 'The second entrance was late and the final decrescendo needs more control', [330, 0, 330, 294], 400, 'Practice the second entrance slowly with a count-in', ['It was bad', 'Play everything differently', 'Ignore the ending'], 'constructive performance feedback', 'Useful feedback identifies a precise musical moment and gives a practical strategy the performer can try.', r),
  q('Develop a Motif', 'Which change creates a sequence from the motif C-D-E?', 'melody', 'Original motif: C-D-E', [262, 294, 330, 0, 294, 330, 349], 300, 'repeat the shape as D-E-F', ['replace it with one rest', 'repeat C-D-E at the same pitch only', 'reverse the beat without pitches'], 'motif development by sequence', 'D-E-F preserves the rising stepwise shape while beginning one scale step higher, which creates a sequence.', r),
  q('Plan a Composition', 'Which plan gives a short class composition unity and contrast?', 'melody', 'Goal: memorable 16-beat piece', [262, 330, 392, 0, 440, 392, 330, 0, 262, 330, 392], 280, 'State an A idea, add a contrasting B idea, then return to A', ['Use unrelated notes for every beat', 'Repeat one note without a plan', 'Change tempo and meter every second'], 'planning musical composition', 'An ABA plan repeats a recognizable idea for unity while the B section supplies meaningful contrast.', r),
];

export const generateUpperElementaryMusicQuestion = (level: UpperElementaryMusicLevel, step: number): EarlyMusicQuestion => {
  const random = createSeededRandom(getDailySeed(`upper-elementary-music-grade-${level}`, step));
  const bank = level === 5 ? gradeThree(random) : level === 6 ? gradeFour(random) : gradeFive(random);
  const question = bank[step % bank.length];
  return {
    ...question,
    id: `upper-music-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    phase: PHASES[step % PHASES.length],
  };
};
