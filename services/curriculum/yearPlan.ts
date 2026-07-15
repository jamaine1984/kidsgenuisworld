import { GradeLevel, RoomType } from '../../types';

export type LessonArcPhase = 'foundation' | 'application';

export interface CurriculumTopic {
  id: string;
  title: string;
  objective: string;
  standard: string;
  vocabulary: string[];
}

export interface SchoolYearFocus {
  week: number;
  grade: GradeLevel;
  room: RoomType;
  phase: LessonArcPhase;
  topic: CurriculumTopic;
  lessonGoal: string;
  masteryCheck: string;
}

type EarlyGrade = GradeLevel.PRE_K | GradeLevel.KINDERGARTEN;
type TopicSeed = [title: string, objective: string, standard: string, vocabulary?: string[]];
type RoomTopicSeeds = Partial<Record<RoomType, TopicSeed[]>>;

const topic = (grade: EarlyGrade, room: RoomType, index: number, seed: TopicSeed): CurriculumTopic => ({
  id: `${grade === GradeLevel.PRE_K ? 'prek' : 'k'}-${room.toLowerCase()}-${index + 1}`,
  title: seed[0],
  objective: seed[1],
  standard: seed[2],
  vocabulary: seed[3] || [],
});

const PRE_K_TOPICS: RoomTopicSeeds = {
  [RoomType.MATH]: [
    ['Count 0-3', 'Touch one object for each number word and tell how many.', 'ELOF P-MATH 1', ['zero', 'one', 'two', 'three']],
    ['Count 4-5', 'Count arranged and scattered groups through five.', 'ELOF P-MATH 2', ['four', 'five', 'how many']],
    ['Match Numerals 0-5', 'Match a written numeral to a group with the same quantity.', 'ELOF P-MATH 3', ['numeral', 'quantity', 'same']],
    ['Colors and Sorting', 'Name common colors and sort objects by one color rule.', 'ELOF P-MATH 8', ['red', 'blue', 'yellow', 'green', 'sort']],
    ['Basic Shapes', 'Recognize circles, squares, triangles, and rectangles in different sizes.', 'ELOF P-MATH 9', ['circle', 'square', 'triangle', 'rectangle']],
    ['More, Less, Same', 'Compare two groups through five without guessing from spacing.', 'ELOF P-MATH 4', ['more', 'less', 'same']],
    ['Size and Length', 'Compare objects using big, small, long, short, tall, and low.', 'ELOF P-MATH 10', ['big', 'small', 'long', 'short']],
    ['AB Patterns', 'Copy and continue a two-part repeating pattern.', 'ELOF P-MATH 7', ['pattern', 'repeat', 'next']],
    ['Position Words', 'Describe where an object is using above, below, inside, and beside.', 'ELOF P-MATH 11', ['above', 'below', 'inside', 'beside']],
    ['Count 6-10', 'Count groups through ten with one-to-one correspondence.', 'ELOF P-MATH 2', ['six', 'seven', 'eight', 'nine', 'ten']],
    ['Match Numerals 6-10', 'Connect numerals six through ten to quantities.', 'ELOF P-MATH 3', ['numeral', 'quantity', 'ten']],
    ['One More', 'Find the quantity that is one more within five.', 'ELOF P-MATH 5', ['one more', 'add', 'next']],
    ['One Less', 'Find the quantity that is one less within five.', 'ELOF P-MATH 5', ['one less', 'take away', 'left']],
    ['Make Five', 'Combine two small groups to make a whole of five.', 'ELOF P-MATH 6', ['part', 'whole', 'five']],
    ['Take Apart Five', 'Separate a group through five and count what remains.', 'ELOF P-MATH 6', ['separate', 'take away', 'remain']],
    ['Sort Two Ways', 'Resort the same objects by color, shape, or size.', 'ELOF P-MATH 8', ['rule', 'color', 'shape', 'size']],
    ['AAB and ABB Patterns', 'Continue repeating patterns with a repeated element.', 'ELOF P-MATH 7', ['AAB', 'ABB', 'repeat']],
    ['Numbers 0-10 Review', 'Show counting, numeral, comparison, shape, and pattern readiness.', 'ELOF P-MATH Review', ['count', 'compare', 'shape', 'pattern']],
  ],
  [RoomType.READING]: [
    ['Books and Print', 'Hold a book, track print, and identify the front, back, and title.', 'ELOF P-LIT 2'],
    ['Name and Environmental Print', 'Recognize a first name and familiar signs or labels.', 'ELOF P-LIT 3'],
    ['Uppercase Letters', 'Name and match common uppercase letters.', 'ELOF P-LIT 3'],
    ['Lowercase Letters', 'Name and match common lowercase letters.', 'ELOF P-LIT 3'],
    ['Letter Pairs', 'Match uppercase letters with their lowercase partners.', 'ELOF P-LIT 3'],
    ['Rhyming Words', 'Tell when two spoken words rhyme.', 'ELOF P-LIT 1'],
    ['Syllable Beats', 'Clap the syllables in familiar words and names.', 'ELOF P-LIT 1'],
    ['First Sounds M S T', 'Hear and identify the first sound in familiar words.', 'ELOF P-LIT 1'],
    ['First Sounds B C P', 'Hear and identify another group of beginning sounds.', 'ELOF P-LIT 1'],
    ['First Sounds F H N', 'Connect spoken beginning sounds to letters.', 'ELOF P-LIT 1'],
    ['Picture Vocabulary', 'Name actions, objects, places, and describing words in pictures.', 'ELOF P-LC 6'],
    ['Who and What', 'Answer who and what questions after a short read-aloud.', 'ELOF P-LIT 5'],
    ['Where and When', 'Answer where and when questions after a short read-aloud.', 'ELOF P-LIT 5'],
    ['Beginning and End', 'Identify what happened first and last in a short story.', 'ELOF P-LIT 5'],
    ['Character Feelings', 'Name a character feeling and the story clue that shows it.', 'ELOF P-LIT 5'],
    ['Story Retell', 'Retell two or three important events in order.', 'ELOF P-LIT 5'],
    ['Draw and Tell', 'Use a drawing and spoken sentence to share an idea.', 'ELOF P-LIT 6'],
    ['Pre-K Literacy Review', 'Show letter, sound, rhyme, vocabulary, and listening readiness.', 'ELOF P-LIT Review'],
  ],
  [RoomType.LANGUAGE]: [
    ['Listening for One Step', 'Follow a clear one-step direction.', 'ELOF P-LC 1'],
    ['Listening for Two Steps', 'Follow two related directions in order.', 'ELOF P-LC 1'],
    ['Complete Sentences', 'Answer using a complete spoken thought.', 'ELOF P-LC 3'],
    ['Describe an Object', 'Use color, size, shape, and use words to describe something.', 'ELOF P-LC 4'],
    ['Action Words', 'Use common verbs to explain what a person or animal is doing.', 'ELOF P-LC 5'],
    ['Question Words', 'Use who, what, where, when, and why in conversation.', 'ELOF P-LC 2'],
    ['Taking Turns', 'Listen, wait, and respond during a short conversation.', 'ELOF P-LC 2'],
    ['Feelings and Needs', 'Name a feeling and ask for help using words.', 'ELOF P-SE 6'],
    ['Category Words', 'Name items that belong to food, animal, clothing, and place groups.', 'ELOF P-LC 6'],
    ['Opposite Words', 'Use familiar opposite pairs in spoken sentences.', 'ELOF P-LC 5'],
    ['Location Words', 'Use in, on, under, behind, and beside.', 'ELOF P-LC 5'],
    ['Sequence Words', 'Use first, next, and last to explain an event.', 'ELOF P-LC 4'],
    ['Ask and Answer', 'Ask one relevant question and answer a partner question.', 'ELOF P-LC 2'],
    ['Tell a Personal Story', 'Share a short event with a beginning and ending.', 'ELOF P-LC 4'],
    ['New Language Greetings', 'Practice respectful greetings in another language.', 'ACTFL Novice Readiness'],
    ['New Language Colors', 'Listen to and repeat common color words in another language.', 'ACTFL Novice Readiness'],
    ['New Language Numbers', 'Listen to and repeat numbers one through five.', 'ACTFL Novice Readiness'],
    ['Speaking and Listening Review', 'Show listening, vocabulary, sentence, and conversation readiness.', 'ELOF P-LC Review'],
  ],
  [RoomType.SCIENCE]: [
    ['Use the Five Senses', 'Observe safely using sight, hearing, touch, smell, and taste vocabulary.', 'ELOF P-SCI 1'],
    ['Living and Nonliving', 'Sort familiar things by whether they are living.', 'ELOF P-SCI 2'],
    ['What Plants Need', 'Identify light, water, air, and soil as plant needs.', 'ELOF P-SCI 2'],
    ['What Animals Need', 'Identify food, water, shelter, and space as animal needs.', 'ELOF P-SCI 2'],
    ['Weather Watch', 'Observe sunny, cloudy, rainy, windy, hot, and cold weather.', 'ELOF P-SCI 3'],
    ['Day and Night', 'Compare what is commonly seen in daytime and nighttime skies.', 'ELOF P-SCI 3'],
    ['Pushes and Pulls', 'Predict how a push or pull can move an object.', 'ELOF P-SCI 4'],
    ['Sink or Float', 'Make and check a simple prediction about water.', 'ELOF P-SCI 1'],
    ['Science Readiness Review', 'Observe, predict, sort, and explain one simple result.', 'ELOF P-SCI Review'],
  ],
  [RoomType.GEOGRAPHY]: [
    ['My Body and Space', 'Use left, right, near, and far to describe space.', 'NCSS Spatial Readiness'],
    ['My Home', 'Describe rooms and familiar places in a home.', 'NCSS People and Places'],
    ['My School', 'Identify important school places and helpers.', 'NCSS Civic Readiness'],
    ['My Neighborhood', 'Recognize streets, parks, stores, and community helpers.', 'NCSS People and Places'],
    ['Land and Water', 'Tell land from water in photos and simple maps.', 'NCSS Geography Readiness'],
    ['Map Symbols', 'Match simple symbols to places on a picture map.', 'NCSS Geography Readiness'],
    ['Directions', 'Follow up, down, left, and right on a simple path.', 'NCSS Spatial Readiness'],
    ['Weather and Clothing', 'Connect local weather to safe clothing choices.', 'NCSS People and Environment'],
    ['Our World Review', 'Use place, map, direction, land, and water vocabulary.', 'NCSS Review'],
  ],
  [RoomType.CODING]: [
    ['First Then Last', 'Put three familiar actions in a useful order.', 'CSTA 1A-AP-08'],
    ['Follow the Arrow', 'Follow one directional command at a time.', 'CSTA 1A-AP-08'],
    ['Reach the Goal', 'Build a short forward path to a visible goal.', 'CSTA 1A-AP-10'],
    ['Turn and Move', 'Use a turn before moving in a new direction.', 'CSTA 1A-AP-10'],
    ['Find the Bug', 'Notice one step that is in the wrong order.', 'CSTA 1A-AP-14'],
    ['Fix the Path', 'Replace one incorrect direction in a path.', 'CSTA 1A-AP-14'],
    ['Repeat a Move', 'Recognize when the same action happens again.', 'CSTA 1A-AP-10'],
    ['Choose a Safe Path', 'Compare two paths and avoid a blocked square.', 'CSTA 1A-AP-11'],
    ['Sequencing Review', 'Plan, follow, check, and repair a short sequence.', 'CSTA 1A-AP Review'],
  ],
  [RoomType.STORYBOOK]: [
    ['Listen for Characters', 'Name who a story is about.', 'ELOF P-LIT 5'],
    ['Listen for Setting', 'Name where a story happens.', 'ELOF P-LIT 5'],
    ['Listen for an Event', 'Name one important thing that happened.', 'ELOF P-LIT 5'],
    ['First and Last', 'Choose what happened first and last.', 'ELOF P-LIT 5'],
    ['Feelings and Clues', 'Connect a character feeling to an event.', 'ELOF P-LIT 5'],
    ['Problem and Help', 'Tell what problem happened and who helped.', 'ELOF P-LIT 5'],
    ['Story Lesson', 'Name one kind, safe, or helpful choice in a story.', 'ELOF P-LIT 5'],
    ['Tell It Back', 'Retell a short story in two or three parts.', 'ELOF P-LIT 5'],
    ['Listening Review', 'Answer who, where, what, first, and last questions.', 'ELOF P-LIT Review'],
  ],
  [RoomType.PUZZLE]: [
    ['Match Same Pictures', 'Find two pictures that are exactly the same.', 'ELOF P-ATL 5'],
    ['Remember Two Places', 'Remember where a small pair of pictures is hidden.', 'ELOF P-ATL 5'],
    ['Continue AB Patterns', 'Name the repeating rule before choosing what comes next.', 'ELOF P-MATH 7'],
    ['Sort by Color', 'Group items using a color rule.', 'ELOF P-MATH 8'],
    ['Sort by Shape', 'Group items using a shape rule.', 'ELOF P-MATH 8'],
    ['Which One Is Different', 'Find the item that does not follow the group rule.', 'ELOF P-ATL 8'],
    ['Simple Mazes', 'Plan a short path before moving.', 'ELOF P-ATL 6'],
    ['Copy a Design', 'Rebuild a small arrangement from a model.', 'ELOF P-ATL 5'],
    ['Strategy Review', 'Use matching, memory, sorting, and pattern strategies.', 'ELOF P-ATL Review'],
  ],
  [RoomType.ART]: [
    ['Color Discovery', 'Name and use primary colors in a picture.', 'NCAS VA:Cr1.PK'],
    ['Line Families', 'Create straight, curved, wavy, and zigzag lines.', 'NCAS VA:Cr2.PK'],
    ['Shape Pictures', 'Combine basic shapes to make a familiar object.', 'NCAS VA:Cr2.PK'],
    ['Texture Marks', 'Use repeated marks to suggest rough, smooth, or bumpy texture.', 'NCAS VA:Cr2.PK'],
    ['Feeling Colors', 'Choose colors that communicate a feeling.', 'NCAS VA:Cr1.PK'],
    ['Pattern Art', 'Create a repeating color or shape pattern.', 'NCAS VA:Cr2.PK'],
    ['Story Drawing', 'Draw a character, place, and action from a story.', 'NCAS VA:Cn10.PK'],
    ['Nature Observation', 'Draw one noticed detail from a natural object.', 'NCAS VA:Cr2.PK'],
    ['Artist Review', 'Create, describe, and celebrate an original picture.', 'NCAS VA:Re9.PK'],
  ],
  [RoomType.MUSIC]: [
    ['Sound and Silence', 'Respond differently to sound and silence.', 'NCAS MU:Pr4.PK'],
    ['High and Low', 'Compare high and low sounds.', 'NCAS MU:Re7.PK'],
    ['Loud and Soft', 'Compare loud and soft sounds safely.', 'NCAS MU:Re7.PK'],
    ['Steady Beat', 'Keep a steady beat for a short pattern.', 'NCAS MU:Pr6.PK'],
    ['Fast and Slow', 'Move or tap to contrasting tempos.', 'NCAS MU:Re7.PK'],
    ['Echo Rhythm', 'Listen to and repeat a short rhythm.', 'NCAS MU:Pr4.PK'],
    ['Sound Patterns', 'Continue a simple sound pattern.', 'NCAS MU:Cr1.PK'],
    ['Music and Feelings', 'Choose words for how music feels.', 'NCAS MU:Re8.PK'],
    ['Music Review', 'Listen, compare, repeat, and create a short sound idea.', 'NCAS MU Review'],
  ],
};
const KINDERGARTEN_TOPICS: RoomTopicSeeds = {
  [RoomType.MATH]: [
    ['Count to 10', 'Count objects accurately and connect the last number to the total.', 'CCSS K.CC.B.4'],
    ['Numerals 0-10', 'Read, build, and match numerals zero through ten.', 'CCSS K.CC.A.3'],
    ['Compare Groups to 10', 'Decide whether one group has greater, fewer, or the same number.', 'CCSS K.CC.C.6'],
    ['Count to 20', 'Count arranged and scattered sets through twenty.', 'CCSS K.CC.B.5'],
    ['Numerals 11-20', 'Match teen numerals to quantities and ten-and-ones models.', 'CCSS K.CC.A.3'],
    ['Count Forward', 'Begin at a given number and count forward.', 'CCSS K.CC.A.2'],
    ['One More and One Less', 'Find the number one greater or one smaller within ten.', 'CCSS K.CC.B.4c'],
    ['Compose Five', 'Show different pairs that make five.', 'CCSS K.OA.A.3'],
    ['Compose Ten', 'Find the partner that makes ten.', 'CCSS K.OA.A.4'],
    ['Add Within Five', 'Model joining situations with objects and numbers.', 'CCSS K.OA.A.1'],
    ['Subtract Within Five', 'Model separating situations with objects and numbers.', 'CCSS K.OA.A.1'],
    ['Add Within Ten', 'Solve joining stories and equations within ten.', 'CCSS K.OA.A.2'],
    ['Subtract Within Ten', 'Solve take-away stories and equations within ten.', 'CCSS K.OA.A.2'],
    ['Describe 2D Shapes', 'Name and describe flat shapes regardless of size or direction.', 'CCSS K.G.A.2'],
    ['Describe 3D Shapes', 'Name spheres, cubes, cones, and cylinders.', 'CCSS K.G.A.3'],
    ['Compare Length and Weight', 'Directly compare two objects using measurable attributes.', 'CCSS K.MD.A.2'],
    ['Sort and Count Categories', 'Classify objects and count how many are in each group.', 'CCSS K.MD.B.3'],
    ['Kindergarten Math Review', 'Show number, operation, measurement, and geometry readiness.', 'CCSS K Review'],
  ],
  [RoomType.READING]: [
    ['Print Concepts', 'Track words left to right and identify letters, words, and spaces.', 'CCSS RF.K.1'],
    ['Uppercase and Lowercase', 'Name and match all uppercase and lowercase letters.', 'CCSS RF.K.1d'],
    ['Rhymes and Syllables', 'Produce rhymes and count syllables in spoken words.', 'CCSS RF.K.2a-b'],
    ['Beginning Sounds', 'Isolate and match initial sounds in simple words.', 'CCSS RF.K.2d'],
    ['Ending Sounds', 'Isolate final sounds in simple words.', 'CCSS RF.K.2d'],
    ['Blend Two Sounds', 'Blend onset and rime into a spoken word.', 'CCSS RF.K.2c'],
    ['Blend CVC Words', 'Blend three phonemes to read a simple word.', 'CCSS RF.K.2d'],
    ['Short A Words', 'Read and sort short-a CVC words.', 'CCSS RF.K.3b'],
    ['Short I Words', 'Read and sort short-i CVC words.', 'CCSS RF.K.3b'],
    ['Short O Words', 'Read and sort short-o CVC words.', 'CCSS RF.K.3b'],
    ['Short E and U Words', 'Read simple short-e and short-u words.', 'CCSS RF.K.3b'],
    ['High-Frequency Words 1', 'Recognize the first set of common words automatically.', 'CCSS RF.K.3c'],
    ['High-Frequency Words 2', 'Recognize another set of common words in phrases.', 'CCSS RF.K.3c'],
    ['Read Simple Sentences', 'Read decodable sentences and track every word.', 'CCSS RF.K.4'],
    ['Story Characters and Setting', 'Identify who and where in a story.', 'CCSS RL.K.3'],
    ['Beginning Middle End', 'Retell major story events in order.', 'CCSS RL.K.2'],
    ['Informational Details', 'Name the topic and one key detail in an informational text.', 'CCSS RI.K.2'],
    ['Kindergarten Literacy Review', 'Show phonological awareness, phonics, fluency, and comprehension readiness.', 'CCSS RF/RL/RI.K Review'],
  ],
  [RoomType.LANGUAGE]: [
    ['Listen and Respond', 'Confirm understanding and respond to a spoken direction.', 'CCSS SL.K.2'],
    ['Speak in Complete Thoughts', 'Describe familiar people, places, things, and events clearly.', 'CCSS SL.K.4'],
    ['Ask for Clarification', 'Ask and answer a question when something is unclear.', 'CCSS SL.K.3'],
    ['Describe with Details', 'Add color, size, number, location, and action details.', 'CCSS SL.K.4'],
    ['Use Nouns and Verbs', 'Build oral sentences with a naming word and action word.', 'CCSS L.K.1b'],
    ['Use Question Words', 'Understand and use who, what, where, when, why, and how.', 'CCSS L.K.1d'],
    ['Use Position Words', 'Use common prepositions in spoken sentences.', 'CCSS L.K.1e'],
    ['Sort Words into Categories', 'Sort common words and explain the category.', 'CCSS L.K.5a'],
    ['Opposites and Shades', 'Connect opposites and distinguish basic shades of meaning.', 'CCSS L.K.5b-d'],
    ['Sequence an Explanation', 'Use first, next, then, and last.', 'CCSS SL.K.4'],
    ['Conversation Turn Taking', 'Continue a conversation through several exchanges.', 'CCSS SL.K.1b'],
    ['Retell an Experience', 'Tell an event in a clear order with relevant details.', 'CCSS SL.K.4'],
    ['Greetings in Spanish', 'Use familiar greetings and polite words.', 'ACTFL Novice Low'],
    ['Numbers in Spanish', 'Recognize and say numbers one through ten.', 'ACTFL Novice Low'],
    ['Colors in Spanish', 'Recognize and say common color words.', 'ACTFL Novice Low'],
    ['Family Words in Spanish', 'Recognize a small set of family words.', 'ACTFL Novice Low'],
    ['School Words in Spanish', 'Recognize a small set of classroom words.', 'ACTFL Novice Low'],
    ['Kindergarten Language Review', 'Show listening, speaking, vocabulary, and conversation readiness.', 'CCSS SL/L.K Review'],
  ],
  [RoomType.SCIENCE]: [
    ['Push and Pull', 'Compare how different pushes and pulls change motion.', 'NGSS K-PS2-1'],
    ['Speed and Direction', 'Observe how force changes speed or direction.', 'NGSS K-PS2-2'],
    ['What Plants Need', 'Use observations to describe what plants need to live and grow.', 'NGSS K-LS1-1'],
    ['Animal Habitats', 'Connect animal needs to places that provide resources.', 'NGSS K-ESS3-1'],
    ['Weather Observations', 'Record and describe local weather conditions.', 'NGSS K-ESS2-1'],
    ['Weather Patterns', 'Compare weather observations across days.', 'NGSS K-ESS2-1'],
    ['Sunlight and Warmth', 'Compare the warming effect of sunlight on surfaces.', 'NGSS K-PS3-1'],
    ['Build Shade', 'Design a structure that reduces sunlight warming.', 'NGSS K-PS3-2'],
    ['Kindergarten Science Review', 'Ask, observe, compare, test, and explain with evidence.', 'NGSS K Review'],
  ],
  [RoomType.GEOGRAPHY]: [
    ['Home and School Maps', 'Use symbols to represent familiar places.', 'NCSS D2.Geo.K-2'],
    ['Map Keys', 'Use a simple key to explain picture-map symbols.', 'NCSS D2.Geo.K-2'],
    ['Cardinal Directions', 'Use north, south, east, and west with support.', 'NCSS D2.Geo.K-2'],
    ['Land and Water', 'Identify common land and water features.', 'NCSS D2.Geo.K-2'],
    ['Neighborhood Helpers', 'Connect community places with the people who work there.', 'NCSS D2.Civ.K-2'],
    ['Needs and Resources', 'Explain how people use local resources to meet needs.', 'NCSS D2.Eco.K-2'],
    ['Weather and Place', 'Compare how weather affects daily life in two places.', 'NCSS D2.Geo.K-2'],
    ['Traditions and Families', 'Recognize that families and communities have varied traditions.', 'NCSS D2.His.K-2'],
    ['Kindergarten World Review', 'Use maps, symbols, directions, and community vocabulary.', 'NCSS K Review'],
  ],
  [RoomType.CODING]: [
    ['Sequence Three Steps', 'Create and follow a three-step algorithm.', 'CSTA 1A-AP-08'],
    ['Move on a Grid', 'Use directional steps to reach a nearby goal.', 'CSTA 1A-AP-10'],
    ['Turn Left and Right', 'Change direction before moving on a grid.', 'CSTA 1A-AP-10'],
    ['Plan Before Running', 'Predict where a short program will end.', 'CSTA 1A-AP-11'],
    ['Find a Wrong Step', 'Identify the first step that causes an incorrect result.', 'CSTA 1A-AP-14'],
    ['Debug and Retry', 'Change one command and test the program again.', 'CSTA 1A-AP-14'],
    ['Repeat Patterns', 'Use repeated actions to describe a shorter plan.', 'CSTA 1A-AP-10'],
    ['Compare Two Paths', 'Choose a correct and efficient route.', 'CSTA 1A-AP-11'],
    ['Kindergarten Coding Review', 'Sequence, predict, run, debug, and explain a short program.', 'CSTA 1A-AP Review'],
  ],
  [RoomType.STORYBOOK]: [
    ['Characters', 'Ask and answer questions about story characters.', 'CCSS RL.K.1-3'],
    ['Settings', 'Identify where and when a story occurs.', 'CCSS RL.K.3'],
    ['Major Events', 'Identify the most important event in a story.', 'CCSS RL.K.3'],
    ['Story Sequence', 'Retell events in beginning, middle, and end order.', 'CCSS RL.K.2'],
    ['Problem and Solution', 'Identify a story problem and how it was solved.', 'CCSS RL.K.1-3'],
    ['Feelings and Evidence', 'Use an illustration or event to explain a feeling.', 'CCSS RL.K.7'],
    ['Story Message', 'State a lesson with teacher support.', 'CCSS RL.K.2'],
    ['Compare Two Stories', 'Name one way two familiar stories are alike or different.', 'CCSS RL.K.9'],
    ['Kindergarten Story Review', 'Answer who, where, what, why, sequence, and lesson questions.', 'CCSS RL.K Review'],
  ],
  [RoomType.PUZZLE]: [
    ['Visual Matching', 'Match details, orientation, color, and shape accurately.', 'CCSS MP1'],
    ['Memory Strategies', 'Use location and grouping to remember hidden pairs.', 'CCSS MP1'],
    ['AB and AAB Patterns', 'Name and continue repeating rules.', 'CCSS K.OA Pattern Readiness'],
    ['Sort and Explain', 'Classify objects and explain the sorting rule.', 'CCSS K.MD.B.3'],
    ['Shape Composition', 'Combine simple shapes to make a larger shape.', 'CCSS K.G.B.6'],
    ['Odd One Out', 'Identify which item breaks a stated rule.', 'CCSS MP3'],
    ['Path Planning', 'Plan a route and revise after reaching a block.', 'CSTA 1A-AP-11'],
    ['Copy and Transform', 'Rebuild a model after one change in position.', 'CCSS K.G.B.5'],
    ['Kindergarten Strategy Review', 'Use memory, pattern, classification, shape, and path strategies.', 'CCSS MP Review'],
  ],
  [RoomType.ART]: [
    ['Color Mixing', 'Explore how colors combine and communicate ideas.', 'NCAS VA:Cr2.K'],
    ['Expressive Lines', 'Use line direction and quality to show movement.', 'NCAS VA:Cr1.K'],
    ['Shape Construction', 'Build recognizable images from simple shapes.', 'NCAS VA:Cr2.K'],
    ['Texture and Pattern', 'Use repeated marks to create texture and pattern.', 'NCAS VA:Cr2.K'],
    ['Illustrate a Story', 'Create art showing a character, setting, and event.', 'NCAS VA:Cn10.K'],
    ['Observation Drawing', 'Include several noticed details from an object.', 'NCAS VA:Cr2.K'],
    ['Collage and Arrangement', 'Arrange shapes to communicate one clear idea.', 'NCAS VA:Cr2.K'],
    ['Talk About Art', 'Describe one artistic choice and one noticed detail.', 'NCAS VA:Re7.K'],
    ['Kindergarten Art Review', 'Create, present, respond to, and connect an artwork.', 'NCAS VA Review'],
  ],
  [RoomType.MUSIC]: [
    ['Steady Beat', 'Keep a steady beat with movement or tapping.', 'NCAS MU:Pr6.K'],
    ['Rhythm Echoes', 'Listen to and accurately repeat short rhythms.', 'NCAS MU:Pr4.K'],
    ['High Low and Same', 'Compare melodic direction by ear.', 'NCAS MU:Re7.K'],
    ['Loud Soft and Dynamics', 'Use contrasting dynamics intentionally.', 'NCAS MU:Pr4.K'],
    ['Fast Slow and Tempo', 'Identify and perform contrasting tempos.', 'NCAS MU:Re7.K'],
    ['Create a Rhythm', 'Organize sounds and silences into a short pattern.', 'NCAS MU:Cr1.K'],
    ['Call and Response', 'Perform a musical question and answer.', 'NCAS MU:Pr4.K'],
    ['Music Mood', 'Use sound evidence to describe a musical feeling.', 'NCAS MU:Re8.K'],
    ['Kindergarten Music Review', 'Create, perform, respond to, and describe music.', 'NCAS MU Review'],
  ],
};

const TOPIC_SEEDS: Record<EarlyGrade, RoomTopicSeeds> = {
  [GradeLevel.PRE_K]: PRE_K_TOPICS,
  [GradeLevel.KINDERGARTEN]: KINDERGARTEN_TOPICS,
};

const buildRoomYear = (grade: EarlyGrade, room: RoomType): SchoolYearFocus[] => {
  const seeds = TOPIC_SEEDS[grade][room] || [];
  if (seeds.length === 0) return [];

  return Array.from({ length: 36 }, (_, weekIndex) => {
    const topicIndex = Math.floor(weekIndex / 2) % seeds.length;
    const phase: LessonArcPhase = weekIndex % 2 === 0 ? 'foundation' : 'application';
    const currentTopic = topic(grade, room, topicIndex, seeds[topicIndex]);
    return {
      week: weekIndex + 1,
      grade,
      room,
      phase,
      topic: currentTopic,
      lessonGoal: phase === 'foundation'
        ? `Learn and practice: ${currentTopic.objective}`
        : `Apply independently and explain: ${currentTopic.objective}`,
      masteryCheck: phase === 'foundation'
        ? `Complete guided examples for ${currentTopic.title.toLowerCase()} with teacher support.`
        : `Complete a mixed six-item check and explain one ${currentTopic.title.toLowerCase()} strategy.`,
    };
  });
};

const EARLY_ROOMS = [
  RoomType.MATH,
  RoomType.READING,
  RoomType.LANGUAGE,
  RoomType.SCIENCE,
  RoomType.GEOGRAPHY,
  RoomType.CODING,
  RoomType.STORYBOOK,
  RoomType.PUZZLE,
  RoomType.ART,
  RoomType.MUSIC,
] as const;

export const EARLY_YEARS_SCHOOL_YEAR: Record<EarlyGrade, SchoolYearFocus[]> = {
  [GradeLevel.PRE_K]: EARLY_ROOMS.flatMap(room => buildRoomYear(GradeLevel.PRE_K, room)),
  [GradeLevel.KINDERGARTEN]: EARLY_ROOMS.flatMap(room => buildRoomYear(GradeLevel.KINDERGARTEN, room)),
};

export const getYearFocus = (grade: GradeLevel, room: RoomType, week: number): SchoolYearFocus | undefined => {
  if (grade !== GradeLevel.PRE_K && grade !== GradeLevel.KINDERGARTEN) return undefined;
  const normalizedWeek = Math.min(Math.max(Math.round(week), 1), 36);
  return EARLY_YEARS_SCHOOL_YEAR[grade].find(item => item.room === room && item.week === normalizedWeek);
};

export const getInstructionalWeek = (date = new Date()): number => {
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - yearStart.getTime()) / 86400000);
  return Math.floor((dayOfYear % 180) / 5) + 1;
};
