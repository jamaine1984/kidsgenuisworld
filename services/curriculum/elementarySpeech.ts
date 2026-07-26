import { createSeededRandom, getDailySeed } from '../dailyRotation';
import { EarlySpeechQuestion } from './earlySpeech';

export type ElementarySpeechLevel = 3 | 4;

const PHASES = ['Listen and notice', 'Teacher model', 'Try it together', 'Speak with confidence', 'Review and remember', 'Show what you know'];

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const choices = (answer: string, distractors: string[], random: () => number): string[] => (
  shuffle([answer, ...shuffle([...new Set(distractors)].filter(item => item !== answer), random).slice(0, 3)], random)
);

type QuestionSeed = Omit<EarlySpeechQuestion, 'id' | 'phase'>;

const firstGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => ({
    prompt: 'Which sentence clearly tells a complete idea?', focusText: 'Name who and tell what happened.', visual: 'sentence', answer: 'The puppy carried the blue ball.',
    options: choices('The puppy carried the blue ball.', ['The blue puppy.', 'Carried across.', 'Because the ball.', 'And then.'], random), skill: 'complete spoken sentences',
    coachCue: 'Say the sentence aloud. It should name who or what and tell the action.', explanation: 'The sentence names the puppy and tells that it carried the blue ball.',
  }),
  () => ({
    prompt: 'Which detail makes the sentence more precise?', focusText: 'The bird sat on the branch.', visual: 'sentence', answer: 'The tiny red bird sat on the highest branch.',
    options: choices('The tiny red bird sat on the highest branch.', ['Bird branch.', 'The bird did.', 'On it there.', 'The branch because.'], random), skill: 'descriptive details',
    coachCue: 'Add words that help a listener picture size, color, or place.', explanation: 'Tiny, red, and highest add clear details a listener can picture.',
  }),
  () => ({
    prompt: 'Which word is the action in this sentence: Ava gently opened the box?', focusText: 'Ava gently opened the box.', visual: 'sentence', answer: 'opened',
    options: choices('opened', ['Ava', 'gently', 'the', 'box'], random), skill: 'action verbs', coachCue: 'Ask what Ava did, then name the action word.',
    explanation: 'Opened is the verb because it tells what Ava did.',
  }),
  () => ({
    prompt: 'Which pronoun can replace Maya in this sentence: Maya reads every night?', focusText: 'Maya reads every night.', visual: 'sentence', answer: 'She',
    options: choices('She', ['They', 'It', 'We', 'You'], random), skill: 'pronoun use', coachCue: 'Choose a word that can stand in for one girl.',
    explanation: 'She can replace Maya because Maya is one girl.',
  }),
  () => ({
    prompt: 'You do not understand the word enormous. What is the best question to ask?', focusText: 'Ask for a word meaning.', visual: 'question', answer: 'What does enormous mean?',
    options: choices('What does enormous mean?', ['Can I skip every word?', 'Why is the page white?', 'Who moved my chair?', 'Should I stop listening?'], random), skill: 'asking for clarification',
    coachCue: 'Name the exact word or idea that is unclear.', explanation: 'The question identifies enormous and asks directly for its meaning.',
  }),
  () => ({
    prompt: 'Listen: First, Jo mixed soil and water. Next, she shaped the mud. Last, she let it dry. Which retell is in order?', focusText: 'mix → shape → dry', visual: 'sequence', answer: 'Jo mixed, shaped, and dried the mud.',
    options: choices('Jo mixed, shaped, and dried the mud.', ['Jo dried, mixed, and shaped the mud.', 'Jo only found a rock.', 'Jo watered a tree after bedtime.', 'Jo skipped every step.'], random), skill: 'oral retelling',
    coachCue: 'Use first, next, and last to hold the order.', explanation: 'The retell keeps the original order: mix, shape, then dry.',
  }),
  () => ({
    prompt: 'Listen: The class measured the shadow at noon. It was shorter than in the morning. Which detail should you repeat?', focusText: 'Noon shadow = shorter', visual: 'listening', answer: 'The noon shadow was shorter',
    options: choices('The noon shadow was shorter', ['The class ate lunch', 'The morning had no sun', 'The ruler was purple', 'Every shadow vanished'], random), skill: 'listening for key details',
    coachCue: 'Repeat the detail that answers what changed.', explanation: 'The important comparison is that the shadow was shorter at noon.',
  }),
  () => ({
    prompt: 'A partner shares an idea you disagree with. What is a respectful response?', focusText: 'Disagree with care.', visual: 'conversation', answer: 'I see it differently because the story says...',
    options: choices('I see it differently because the story says...', ['That is a bad idea.', 'Stop talking now.', 'I will not listen.', 'You are always wrong.'], random), skill: 'respectful discussion',
    coachCue: 'Acknowledge the person, then give a reason from the lesson.', explanation: 'The response stays respectful and explains the disagreement with evidence.',
  }),
  () => ({
    prompt: 'Which group contains words that are all tools?', focusText: 'Name the category connection.', visual: 'category', answer: 'hammer, ruler, scissors',
    options: choices('hammer, ruler, scissors', ['apple, pear, peach', 'bus, train, bicycle', 'shirt, sock, hat', 'river, lake, ocean'], random), skill: 'word relationships',
    coachCue: 'Say what every word in the group is used for.', explanation: 'A hammer, ruler, and scissors are all tools used to complete tasks.',
  }),
  () => ({
    prompt: 'Which question invites a partner to explain an idea?', focusText: 'Ask an open question.', visual: 'question', answer: 'How did you solve the problem?',
    options: choices('How did you solve the problem?', ['Is the answer seven?', 'Did you use a pencil?', 'Can you say yes?', 'Is class over?'], random), skill: 'asking follow-up questions',
    coachCue: 'Use how or why when you want more than a one-word answer.', explanation: 'How did you solve the problem invites the partner to explain a strategy.',
  }),
  () => ({
    prompt: 'Follow the directions: Draw a circle, put a star inside it, then underline the circle. What happens second?', focusText: 'circle → star inside → underline', visual: 'direction', answer: 'Put a star inside the circle',
    options: choices('Put a star inside the circle', ['Underline the circle', 'Draw a square', 'Erase the page', 'Color outside the paper'], random), skill: 'three-step directions',
    coachCue: 'Hold each action in order before choosing.', explanation: 'Putting the star inside is the second step, after drawing the circle.',
  }),
  () => ({
    prompt: 'Which opening clearly introduces a short presentation about bees?', focusText: 'Topic: how bees help flowers', visual: 'conversation', answer: 'I will explain how bees help flowers by moving pollen.',
    options: choices('I will explain how bees help flowers by moving pollen.', ['Bees, um, stuff.', 'I forgot my topic.', 'Flowers are there.', 'That is all.'], random), skill: 'oral presentation openings',
    coachCue: 'Name the topic and what the listener will learn.', explanation: 'The opening states the topic and the main idea clearly.',
  }),
];

const secondGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => ({
    prompt: 'Which compound sentence correctly joins two related ideas?', focusText: 'The rain stopped. We went outside.', visual: 'sentence', answer: 'The rain stopped, so we went outside.',
    options: choices('The rain stopped, so we went outside.', ['The rain stopped so.', 'And we went outside because.', 'The rain outside.', 'Stopped we rain.'], random), skill: 'compound sentences',
    coachCue: 'Use a joining word that shows how the two ideas connect.', explanation: 'So connects the cause, the rain stopping, with the result, going outside.',
  }),
  () => ({
    prompt: 'Which sentence uses the past-tense verb correctly?', focusText: 'Yesterday, we ___ to the museum.', visual: 'sentence', answer: 'Yesterday, we went to the museum.',
    options: choices('Yesterday, we went to the museum.', ['Yesterday, we go to the museum.', 'Yesterday, we goed to the museum.', 'Yesterday, going museum.', 'Yesterday, we goes museum.'], random), skill: 'irregular past tense',
    coachCue: 'Listen for the verb form that tells the action already happened.', explanation: 'Went is the correct past-tense form of go.',
  }),
  () => ({
    prompt: 'Which phrase uses an adjective and an adverb to add precise details?', focusText: 'The fox moved.', visual: 'sentence', answer: 'The cautious fox moved quietly.',
    options: choices('The cautious fox moved quietly.', ['The fox move.', 'Cautious quietly.', 'The moved fox.', 'Fox and.'], random), skill: 'adjectives and adverbs',
    coachCue: 'An adjective describes the fox; an adverb tells how it moved.', explanation: 'Cautious describes the fox, and quietly tells how it moved.',
  }),
  () => ({
    prompt: 'Which sentence best summarizes the message?', focusText: 'A seed needs water and warmth. Its root grows first. Then a stem reaches upward.', visual: 'listening', answer: 'A seed begins growing when its needs are met.',
    options: choices('A seed begins growing when its needs are met.', ['Every seed grows without water.', 'Roots grow above every stem.', 'Warmth turns seeds into rocks.', 'The message is only about color.'], random), skill: 'oral summarizing',
    coachCue: 'Keep the most important idea and leave out small details.', explanation: 'The summary combines the seed’s needs and its first growth changes.',
  }),
  () => ({
    prompt: 'Which response supports an answer with evidence?', focusText: 'Question: Why did the bridge hold more cubes after folding?', visual: 'conversation', answer: 'It held more because the folds made the paper stiffer.',
    options: choices('It held more because the folds made the paper stiffer.', ['Because I picked it.', 'The bridge is blue.', 'I do not need a reason.', 'Cubes are fun.'], random), skill: 'speaking with evidence',
    coachCue: 'State the answer, then use because to connect the evidence.', explanation: 'The response gives both the result and the design reason that explains it.',
  }),
  () => ({
    prompt: 'A classmate says, “The character was nervous.” Which follow-up question asks for proof?', focusText: 'Ask for story evidence.', visual: 'question', answer: 'Which words or actions show the character was nervous?',
    options: choices('Which words or actions show the character was nervous?', ['What color is the cover?', 'Is the book heavy?', 'Can we skip the story?', 'Who owns the chair?'], random), skill: 'evidence follow-up questions',
    coachCue: 'Ask the speaker to point to a specific clue.', explanation: 'The question asks for exact story evidence supporting the claim.',
  }),
  () => ({
    prompt: 'Which response compares two habitats clearly?', focusText: 'Desert and wetland', visual: 'category', answer: 'Both support life, but a desert is dry and a wetland has much more water.',
    options: choices('Both support life, but a desert is dry and a wetland has much more water.', ['They are places.', 'A habitat is there.', 'Desert wetland same.', 'Water because animals.'], random), skill: 'oral compare and contrast',
    coachCue: 'Use both for a similarity and but for a difference.', explanation: 'The response gives one similarity and one clear difference.',
  }),
  () => ({
    prompt: 'Which opinion includes a clear reason?', focusText: 'Choose the strongest class pet.', visual: 'conversation', answer: 'A fish would be a good class pet because it is quiet and can live in a small tank.',
    options: choices('A fish would be a good class pet because it is quiet and can live in a small tank.', ['Fish are best.', 'I said fish.', 'Pets are animals.', 'Because a tank.'], random), skill: 'opinion and reasons',
    coachCue: 'State the opinion and support it with a relevant because reason.', explanation: 'The response names the choice and gives two reasons that fit a classroom.',
  }),
  () => ({
    prompt: 'Follow the directions: Fold the paper, draw a triangle on the front, open it, then circle the triangle. What happens last?', focusText: 'fold → draw → open → circle', visual: 'direction', answer: 'Circle the triangle',
    options: choices('Circle the triangle', ['Fold the paper', 'Draw the triangle', 'Open the paper', 'Cut the paper'], random), skill: 'multi-step listening',
    coachCue: 'Repeat the steps quietly and hold the final action.', explanation: 'Circling the triangle is the fourth and final step.',
  }),
  () => ({
    prompt: 'Which response builds on a partner’s idea?', focusText: 'Partner: Plant roots hold soil in place.', visual: 'conversation', answer: 'I agree, and that may explain why the planted slope lost less soil.',
    options: choices('I agree, and that may explain why the planted slope lost less soil.', ['I will change the topic.', 'You already talked.', 'Roots are a word.', 'I did not listen.'], random), skill: 'collaborative discussion',
    coachCue: 'Refer to the partner’s idea and add one connected thought.', explanation: 'The response acknowledges the idea and connects it to evidence from the test.',
  }),
  () => ({
    prompt: 'Which closing sentence completes a presentation about saving water?', focusText: 'Topic: turn off the faucet while brushing', visual: 'conversation', answer: 'Small choices like turning off the faucet help protect clean water.',
    options: choices('Small choices like turning off the faucet help protect clean water.', ['That was some words.', 'Water is wet.', 'I have a toothbrush.', 'Now another topic.'], random), skill: 'oral presentation closings',
    coachCue: 'Restate the important message in one strong sentence.', explanation: 'The closing repeats the central message and leaves the listener with an action.',
  }),
  () => ({
    prompt: 'You heard only part of a four-step direction. What is the best response?', focusText: 'Repair the missing message.', visual: 'question', answer: 'Could you repeat the steps after number two, please?',
    options: choices('Could you repeat the steps after number two, please?', ['I will guess every step.', 'Say everything louder!', 'I was not listening, so I quit.', 'The directions are wrong.'], random), skill: 'specific clarification requests',
    coachCue: 'Tell the speaker exactly which part you need repeated.', explanation: 'The request is polite and identifies the exact missing part.',
  }),
];

export const getElementarySpeechQuestionBank = (level: ElementarySpeechLevel): EarlySpeechQuestion[] => {
  const random = createSeededRandom(`voice-cache-elementary-speech-${level}`);
  const factories = level === 3 ? firstGradeFactories(random) : secondGradeFactories(random);
  return factories.map((factory, index) => {
    const question = factory();
    return {
      ...question,
      id: `elementary-speech-bank-${level}-${index}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
      phase: PHASES[index % PHASES.length],
    };
  });
};

export const generateElementarySpeechQuestion = (level: ElementarySpeechLevel, step: number): EarlySpeechQuestion => {
  const random = createSeededRandom(getDailySeed(`elementary-speech-grade-${level}`, step));
  const factories = level === 3 ? firstGradeFactories(random) : secondGradeFactories(random);
  const question = factories[Math.floor(random() * factories.length)]();
  return {
    ...question,
    id: `elementary-speech-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    phase: PHASES[step % PHASES.length],
  };
};
