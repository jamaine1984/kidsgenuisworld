import { RoomType, UserProgress, type LearningJournalEntry } from '../types';
import { getDailyMission, getUnitsForGrade, getWeeklyLearningPlan, type CurriculumUnit } from './curriculum';
import { MASTERED_PRACTICE_TARGET } from './learningConstants';

export { MASTERED_PRACTICE_TARGET };

export const AI_TEACHER = {
  name: 'Ms. Nova',
  title: 'AI Homeroom Teacher',
  school: 'Genius World School',
  room: 'Genius Hall',
  voicePack: 'Saved human teacher voice',
};

export const SCHOOL_LESSON_PHASES = [
  {
    id: 'teach',
    label: 'Teach',
    studentAction: 'Listen for the main idea.',
    parentMeaning: 'The teacher introduces the objective before practice starts.',
  },
  {
    id: 'example',
    label: 'Example',
    studentAction: 'Watch one worked example.',
    parentMeaning: 'The child sees the strategy before trying alone.',
  },
  {
    id: 'guided',
    label: 'Guided Practice',
    studentAction: 'Try with clues and coaching.',
    parentMeaning: 'The app gives scaffolded attempts and teacher prompts.',
  },
  {
    id: 'independent',
    label: 'Independent Practice',
    studentAction: 'Solve with less help.',
    parentMeaning: 'The child demonstrates the skill without guessing.',
  },
  {
    id: 'exit',
    label: 'Exit Ticket',
    studentAction: 'Explain the strategy before moving on.',
    parentMeaning: 'Parents get proof that the child can explain the idea.',
  },
] as const;

export const TEACHER_HELP_LADDER = [
  {
    id: 'hint',
    label: 'Hint',
    studentAction: 'Look for the clue word, picture, sound, or pattern.',
    parentMeaning: 'The first support nudges attention without giving away the answer.',
  },
  {
    id: 'model',
    label: 'Model',
    studentAction: 'Watch Ms. Nova work one similar example.',
    parentMeaning: 'The teacher shows the strategy before asking the child to try again.',
  },
  {
    id: 'together',
    label: 'Try Together',
    studentAction: 'Do the next step with teacher clues.',
    parentMeaning: 'Guided practice reduces frustration while keeping the child active.',
  },
  {
    id: 'teach-back',
    label: 'Teach Back',
    studentAction: 'Explain the strategy in your own words.',
    parentMeaning: 'The final support checks understanding instead of only checking correctness.',
  },
] as const;

export interface SchoolCampusRoom {
  classroomName: string;
  shortName: string;
  subject: string;
  teacherAction: string;
  studentPromise: string;
  detail: string;
}

export type SchoolDayPeriodStatus = 'done' | 'in-progress' | 'ready' | 'due';

export interface SchoolDayPeriod {
  id: string;
  label: string;
  detail: string;
  proof: string;
  reward: string;
  whyItMatters: string;
  room: RoomType;
  unitId?: string;
  status: SchoolDayPeriodStatus;
  actionLabel: string;
}

export interface TeacherAssignmentCard {
  room: RoomType;
  classroomName: string;
  unitId: string;
  title: string;
  objective: string;
  example: string;
  parentNote: string;
  masteryRubric: string;
  practiceCount: number;
  status: SchoolDayPeriodStatus;
  statusLabel: string;
  actionLabel: string;
}

export interface TeacherGradebookRow extends TeacherAssignmentCard {
  attempts: number;
  evidenceCount: number;
  reflectionCount: number;
  lastPracticedAt?: number;
  lastPracticedLabel: string;
  nextAction: string;
  reviewCycleDays: number;
  standardsFocus: string[];
  parentExplanation?: string;
}

export interface NextSchoolStep {
  period: SchoolDayPeriod;
  stepNumber: number;
  totalSteps: number;
  title: string;
  detail: string;
  actionLabel: string;
  teacherPrompt: string;
  progressLabel: string;
  proof: string;
  reward: string;
  whyItMatters: string;
  room: RoomType;
  unitId?: string;
  isSchoolDayComplete: boolean;
}

export interface StudentPassportSummary {
  attendanceLabel: string;
  evidenceCount: number;
  reflectionCount: number;
  masteryCount: number;
  roomCount: number;
  latestProofLabel: string;
  latestProofDetail: string;
  teacherConferenceQuestion: string;
  parentFollowUp: string;
  nextStampTarget: string;
}

export interface TeacherConferencePlan {
  statusLabel: string;
  headline: string;
  focusRoom: string;
  evidenceLabel: string;
  teacherMove: string;
  studentCanSay: string;
  parentCheckIn: string;
  reviewPlan: string;
  tone: 'start' | 'reteach' | 'practice' | 'review';
}

export interface TeacherHelpStep {
  id: string;
  label: string;
  prompt: string;
  parentMeaning: string;
}

export const SCHOOL_ASSIGNMENT_ROOMS = [
  RoomType.MATH,
  RoomType.READING,
  RoomType.STORYBOOK,
  RoomType.SCIENCE,
  RoomType.GEOGRAPHY,
  RoomType.CODING,
  RoomType.ART,
  RoomType.MUSIC,
  RoomType.LANGUAGE,
  RoomType.PUZZLE,
];

export const SCHOOL_CAMPUS_ROOMS: Partial<Record<RoomType, SchoolCampusRoom>> = {
  [RoomType.MATH]: {
    classroomName: 'Math Classroom',
    shortName: 'Math',
    subject: 'number sense, facts, and word problems',
    teacherAction: 'Model the strategy, then check the work.',
    studentPromise: 'I can show how I solved it.',
    detail: 'Numbers, facts, place value, and real-world problem solving.',
  },
  [RoomType.READING]: {
    classroomName: 'Reading Studio',
    shortName: 'Reading',
    subject: 'phonics, sight words, fluency, and comprehension',
    teacherAction: 'Read, pause, and ask for evidence from the text.',
    studentPromise: 'I can use clues in the words.',
    detail: 'Sounds, words, fluency, and meaning from the text.',
  },
  [RoomType.STORYBOOK]: {
    classroomName: 'School Library',
    shortName: 'Library',
    subject: 'stories, morals, vocabulary, and comprehension',
    teacherAction: 'Read aloud and stop for prediction checks.',
    studentPromise: 'I can retell what happened and why.',
    detail: 'Teacher-read stories with comprehension and retell checks.',
  },
  [RoomType.SCIENCE]: {
    classroomName: 'Science Lab',
    shortName: 'Science',
    subject: 'observation, prediction, cause and effect, and evidence',
    teacherAction: 'Ask students to predict, test, and explain.',
    studentPromise: 'I can use evidence to explain what happened.',
    detail: 'Observe, predict, test, and explain like a scientist.',
  },
  [RoomType.GEOGRAPHY]: {
    classroomName: 'World Studies Room',
    shortName: 'World Studies',
    subject: 'maps, places, cultures, landforms, and geography clues',
    teacherAction: 'Connect maps and places to real-world questions.',
    studentPromise: 'I can describe where places are and what makes them special.',
    detail: 'Maps, landmarks, cultures, regions, and world knowledge.',
  },
  [RoomType.CODING]: {
    classroomName: 'Coding Lab',
    shortName: 'Coding',
    subject: 'sequencing, loops, conditions, debugging, and logic',
    teacherAction: 'Turn big problems into clear steps.',
    studentPromise: 'I can debug one step at a time.',
    detail: 'Sequences, loops, conditions, patterns, and debugging.',
  },
  [RoomType.ART]: {
    classroomName: 'Art Studio',
    shortName: 'Art',
    subject: 'color, shape, design, creativity, and visual thinking',
    teacherAction: 'Prompt students to create with a clear design choice.',
    studentPromise: 'I can explain my creative choice.',
    detail: 'Color, shape, design, imagination, and visual expression.',
  },
  [RoomType.MUSIC]: {
    classroomName: 'Music Room',
    shortName: 'Music',
    subject: 'rhythm, pitch, listening, patterns, and musical memory',
    teacherAction: 'Clap, listen, repeat, and name the pattern.',
    studentPromise: 'I can hear and repeat a pattern.',
    detail: 'Rhythm, pitch, beats, listening, and pattern memory.',
  },
  [RoomType.LANGUAGE]: {
    classroomName: 'Language Lab',
    shortName: 'Languages',
    subject: 'new words, listening, speaking, and cultural connection',
    teacherAction: 'Say, repeat, use, and connect new words.',
    studentPromise: 'I can use a new word in context.',
    detail: 'Spanish, French, Mandarin, speaking, listening, and culture.',
  },
  [RoomType.PUZZLE]: {
    classroomName: 'Strategy Gym',
    shortName: 'Strategy',
    subject: 'memory, logic, pattern thinking, and flexible problem solving',
    teacherAction: 'Coach students to name the rule before answering.',
    studentPromise: 'I can explain the pattern or rule.',
    detail: 'Logic, memory, patterns, strategy, and flexible thinking.',
  },
};

export const getCampusRoom = (room: RoomType): SchoolCampusRoom => (
  SCHOOL_CAMPUS_ROOMS[room] || {
    classroomName: 'Homeroom',
    shortName: 'Homeroom',
    subject: 'daily learning habits',
    teacherAction: 'Set the mission and celebrate progress.',
    studentPromise: 'I can try, explain, and reflect.',
    detail: 'Daily goals, review, reflection, and healthy pacing.',
  }
);

export const getMasteryGateStatus = (progress: UserProgress, unit?: CurriculumUnit) => {
  const practiceCount = unit ? Math.min(progress.unitPracticeCounts?.[unit.id] || 0, MASTERED_PRACTICE_TARGET) : 0;
  const mastered = Boolean(unit && ((progress.completedUnitIds || []).includes(unit.id) || practiceCount >= MASTERED_PRACTICE_TARGET));
  const remaining = Math.max(0, MASTERED_PRACTICE_TARGET - practiceCount);

  return {
    practiceCount,
    target: MASTERED_PRACTICE_TARGET,
    mastered,
    remaining,
    label: mastered
      ? 'Mastery gate passed'
      : practiceCount === 0
        ? 'Ready for first lesson'
        : `${remaining} more practice round${remaining === 1 ? '' : 's'} to master`,
  };
};

export const getTeacherScript = (unit: CurriculumUnit, progress: UserProgress) => {
  const childName = progress.childName || 'learner';
  const campusRoom = getCampusRoom(unit.room);
  const practice = unit.practiceActivities || [];
  const checks = unit.endOfLessonChecks || [];
  const mastery = getMasteryGateStatus(progress, unit);

  return {
    greeting: `Good morning, ${childName}. I am ${AI_TEACHER.name}, your ${AI_TEACHER.title}. Today we are going to ${unit.objective.toLowerCase()}`,
    objective: `Learning target: ${unit.objective}`,
    teach: practice[0] || `Teach: listen for the main idea in ${campusRoom.subject}.`,
    example: practice[1] || `Example: ${AI_TEACHER.name} works through one problem first and names the strategy.`,
    guided: practice[2] || `Guided practice: try one with teacher clues before working alone.`,
    independent: practice[3] || `Independent practice: solve one without help and check your answer.`,
    exitTicket: checks[0] || unit.successCheck,
    parentNote: `${AI_TEACHER.name} is watching for this proof: ${unit.successCheck}`,
    voiceStatus: `${AI_TEACHER.voicePack} is prepared as static lesson copy for ${campusRoom.classroomName}.`,
    masteryLabel: mastery.label,
  };
};

export const getTeacherHelpLadder = (unit: CurriculumUnit): TeacherHelpStep[] => {
  const campusRoom = getCampusRoom(unit.room);
  const practice = unit.practiceActivities || [];
  const checks = unit.endOfLessonChecks || [];

  return TEACHER_HELP_LADDER.map((step, index) => ({
    id: step.id,
    label: step.label,
    prompt: index === 0
      ? `Hint: ${practice[0] || `look for the key clue in ${campusRoom.subject}.`}`
      : index === 1
        ? `Model: ${practice[1] || `${AI_TEACHER.name} works one similar example and names the strategy.`}`
        : index === 2
          ? `Try together: ${practice[2] || 'take the next step with teacher clues, then check it.'}`
          : `Teach back: ${checks[0] || unit.successCheck}`,
    parentMeaning: step.parentMeaning,
  }));
};

export const getTeacherAssignmentCards = (progress: UserProgress): TeacherAssignmentCard[] => {
  const completedUnitIds = new Set(progress.completedUnitIds || []);
  const unitPracticeCounts = progress.unitPracticeCounts || {};
  const currentGradeUnits = getUnitsForGrade(progress.currentGrade);

  return SCHOOL_ASSIGNMENT_ROOMS
    .map<TeacherAssignmentCard | null>(room => {
      const unit = currentGradeUnits
        .filter(candidate => candidate.room === room)
        .sort((first, second) => {
          const firstCompleted = completedUnitIds.has(first.id) ? 1 : 0;
          const secondCompleted = completedUnitIds.has(second.id) ? 1 : 0;
          if (firstCompleted !== secondCompleted) return firstCompleted - secondCompleted;

          const firstPractice = unitPracticeCounts[first.id] || 0;
          const secondPractice = unitPracticeCounts[second.id] || 0;
          if (firstPractice !== secondPractice) return firstPractice - secondPractice;

          return first.reviewCycleDays - second.reviewCycleDays;
        })[0];

      if (!unit) return null;

      const script = getTeacherScript(unit, progress);
      const campusRoom = getCampusRoom(room);
      const mastery = getMasteryGateStatus(progress, unit);
      const status: SchoolDayPeriodStatus = mastery.mastered
        ? 'done'
        : mastery.practiceCount > 0
          ? 'in-progress'
          : 'ready';

      return {
        room,
        classroomName: campusRoom.classroomName,
        unitId: unit.id,
        title: unit.title,
        objective: unit.objective,
        example: script.example,
        parentNote: unit.parentActivity,
        masteryRubric: unit.masteryGate || unit.masteryTarget || unit.successCheck,
        practiceCount: mastery.practiceCount,
        status,
        statusLabel: status === 'done' ? 'Mastered' : status === 'in-progress' ? 'In progress' : 'Assigned',
        actionLabel: status === 'done' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start',
      };
    })
    .filter((card): card is TeacherAssignmentCard => Boolean(card));
};

const formatLastPracticed = (timestamp?: number) => {
  if (!timestamp) return 'Not practiced yet';
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date(getTodayKey()).getTime();
  const practicedDate = new Date(timestamp);
  const practicedStart = new Date(practicedDate.toISOString().slice(0, 10)).getTime();
  const dayDiff = Math.round((todayStart - practicedStart) / dayMs);

  if (dayDiff <= 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff < 7) return `${dayDiff} days ago`;

  return practicedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const getTeacherGradebookRows = (progress: UserProgress): TeacherGradebookRow[] => {
  const unitsById = new Map(
    getUnitsForGrade(progress.currentGrade).map(unit => [unit.id, unit])
  );

  return getTeacherAssignmentCards(progress).map(card => {
    const unit = unitsById.get(card.unitId);
    const attempts = progress.unitPracticeCounts?.[card.unitId] || 0;
    const evidence = (progress.learningJournal || [])
      .filter(entry => entry.unitId === card.unitId || entry.room === card.room)
      .sort((first, second) => second.createdAt - first.createdAt);
    const latestEvidence = evidence[0];
    const reflectionCount = evidence.filter(entry => Boolean(entry.childReflection)).length;
    const remaining = Math.max(0, MASTERED_PRACTICE_TARGET - Math.min(attempts, MASTERED_PRACTICE_TARGET));
    const nextAction = card.status === 'done'
      ? `Review again in ${unit?.reviewCycleDays || 3} days and ask for a teach-back.`
      : attempts === 0
        ? `Start ${card.classroomName} and complete the first guided practice.`
        : reflectionCount === 0
          ? 'Ask the child to finish a reflection after the next practice round.'
          : `Complete ${remaining} more practice round${remaining === 1 ? '' : 's'} before marking mastery.`;

    return {
      ...card,
      attempts,
      evidenceCount: evidence.length,
      reflectionCount,
      lastPracticedAt: latestEvidence?.createdAt,
      lastPracticedLabel: formatLastPracticed(latestEvidence?.createdAt),
      nextAction,
      reviewCycleDays: unit?.reviewCycleDays || 3,
      standardsFocus: unit?.standardsFocus || [],
      parentExplanation: unit?.parentExplanation,
    };
  });
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const isToday = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 10) === getTodayKey();

export const getSchoolDayPlan = (progress: UserProgress) => {
  const mission = getDailyMission(progress);
  const weeklyPlan = getWeeklyLearningPlan(progress);
  const missionRoom = getCampusRoom(mission.room);
  const mastery = getMasteryGateStatus(progress, mission);
  const todayKey = getTodayKey();
  const todayStats = (progress.dailyStats || []).find(day => day.date === todayKey);
  const todayJournalEntries = (progress.learningJournal || []).filter(entry => isToday(entry.createdAt));
  const todayRooms = new Set<RoomType>([
    ...(todayStats?.roomsVisited || []),
    ...todayJournalEntries.map(entry => entry.room),
  ]);
  const hasTodayActivity = Boolean(
    (todayStats?.timeSpentMinutes || 0) > 0 ||
    (todayStats?.problemsAttempted || 0) > 0 ||
    todayRooms.size > 0 ||
    todayJournalEntries.length > 0
  );
  const missionPracticedToday = todayJournalEntries.some(entry => entry.unitId === mission.id || entry.room === mission.room);
  const exitTicketDone = todayJournalEntries.some(entry => Boolean(entry.childReflection || entry.exitTicket));
  const schedule = [
    {
      time: 'Homeroom',
      label: `${AI_TEACHER.name} greeting`,
      detail: `Set today's mission in ${missionRoom.classroomName}.`,
      proof: 'Say the mission goal out loud before starting.',
      reward: 'Attendance stamp',
      whyItMatters: 'A clear goal helps kids know what their brain is practicing.',
      room: RoomType.HUB,
    },
    {
      time: 'Lesson 1',
      label: missionRoom.classroomName,
      detail: mission.title,
      proof: mission.objective,
      reward: `${missionRoom.shortName} class stamp`,
      whyItMatters: mission.parentExplanation || mission.masteryTarget,
      room: mission.room,
    },
    {
      time: 'Practice',
      label: 'Guided then independent',
      detail: `${mastery.practiceCount}/${MASTERED_PRACTICE_TARGET} mastery rounds saved.`,
      proof: mastery.mastered
        ? 'Show the strategy with less help.'
        : `Complete ${Math.max(1, MASTERED_PRACTICE_TARGET - mastery.practiceCount)} more practice round${MASTERED_PRACTICE_TARGET - mastery.practiceCount === 1 ? '' : 's'}.`,
      reward: 'Practice streak credit',
      whyItMatters: 'Repeated practice keeps kids from moving to the next grade too fast.',
      room: mission.room,
    },
    {
      time: 'Exit Ticket',
      label: 'Teach-back check',
      detail: mission.successCheck,
      proof: mission.successCheck,
      reward: 'Parent-visible proof note',
      whyItMatters: 'Explaining the answer is stronger evidence than guessing correctly.',
      room: mission.room,
    },
  ];

  const reviewDueCount = weeklyPlan.filter(item => {
    const practicedAt = (progress.learningJournal || [])
      .filter(entry => entry.unitId === item.unit.id)
      .sort((a, b) => b.createdAt - a.createdAt)[0]?.createdAt;

    if (!practicedAt) return false;
    const daysSincePractice = Math.floor((Date.now() - practicedAt) / (24 * 60 * 60 * 1000));
    return daysSincePractice >= item.unit.reviewCycleDays;
  }).length;
  const readingDone = todayRooms.has(RoomType.READING) || todayRooms.has(RoomType.STORYBOOK);
  const stemDone = todayRooms.has(RoomType.SCIENCE) || todayRooms.has(RoomType.CODING) || todayRooms.has(RoomType.GEOGRAPHY);
  const creativeDone = todayRooms.has(RoomType.ART) || todayRooms.has(RoomType.MUSIC) || todayRooms.has(RoomType.LANGUAGE) || todayRooms.has(RoomType.PUZZLE);
  const periods: SchoolDayPeriod[] = [
    {
      id: 'homeroom',
      label: 'Homeroom',
      detail: `${AI_TEACHER.name} greets the child and sets the mission.`,
      proof: 'Child starts the day and names the learning goal.',
      reward: 'Attendance stamp',
      whyItMatters: 'Homeroom turns the app into a guided school day instead of random clicking.',
      room: mission.room,
      unitId: mission.id,
      status: hasTodayActivity ? 'done' : 'ready',
      actionLabel: hasTodayActivity ? 'Present' : 'Start',
    },
    {
      id: 'core',
      label: missionRoom.classroomName,
      detail: mission.title,
      proof: mission.successCheck,
      reward: `${missionRoom.shortName} mastery credit`,
      whyItMatters: mission.parentExplanation || mission.masteryTarget,
      room: mission.room,
      unitId: mission.id,
      status: mastery.mastered ? 'done' : mastery.practiceCount > 0 || missionPracticedToday ? 'in-progress' : 'ready',
      actionLabel: mastery.mastered ? 'Mastered' : 'Learn',
    },
    {
      id: 'reading',
      label: 'Reading Block',
      detail: 'Read, listen, and answer with text evidence.',
      proof: 'Answer one story or reading question using a clue from the words.',
      reward: 'Library stamp',
      whyItMatters: 'Daily reading practice builds vocabulary, fluency, and comprehension.',
      room: RoomType.STORYBOOK,
      status: readingDone ? 'done' : 'ready',
      actionLabel: readingDone ? 'Done' : 'Read',
    },
    {
      id: 'stem',
      label: 'STEM Lab',
      detail: 'Practice science, world studies, or coding logic.',
      proof: 'Make a prediction, explain evidence, or debug one step.',
      reward: 'Discovery badge',
      whyItMatters: 'STEM practice teaches kids to test ideas instead of only memorizing answers.',
      room: RoomType.SCIENCE,
      status: stemDone ? 'done' : 'ready',
      actionLabel: stemDone ? 'Done' : 'Explore',
    },
    {
      id: 'creative',
      label: 'Creative Studio',
      detail: 'Use art, music, languages, or strategy thinking.',
      proof: 'Create, repeat, speak, or solve, then explain one choice.',
      reward: 'Creative thinking badge',
      whyItMatters: 'Creative rooms build memory, communication, and flexible problem solving.',
      room: RoomType.ART,
      status: creativeDone ? 'done' : 'ready',
      actionLabel: creativeDone ? 'Done' : 'Create',
    },
    {
      id: 'exit',
      label: 'Exit Ticket',
      detail: mission.successCheck,
      proof: mission.successCheck,
      reward: 'Parent proof saved',
      whyItMatters: 'The exit ticket gives parents evidence that the child can explain the skill.',
      room: mission.room,
      unitId: mission.id,
      status: exitTicketDone ? 'done' : todayJournalEntries.length > 0 ? 'in-progress' : reviewDueCount > 0 ? 'due' : 'ready',
      actionLabel: exitTicketDone ? 'Saved' : 'Check',
    },
  ];
  const completedPeriods = periods.filter(period => period.status === 'done').length;
  const schoolDayPercent = Math.round((completedPeriods / periods.length) * 100);

  return {
    mission,
    missionRoom,
    weeklyPlan,
    schedule,
    mastery,
    reviewDueCount,
    periods,
    completedPeriods,
    totalPeriods: periods.length,
    schoolDayPercent,
    attendanceSummary: hasTodayActivity
      ? `${progress.childName || 'Learner'} is marked present for today's school day.`
      : `${progress.childName || 'Learner'} has not started today's school day yet.`,
  };
};

export const getNextSchoolStep = (progress: UserProgress): NextSchoolStep => {
  const schoolDay = getSchoolDayPlan(progress);
  const nextPeriod = schoolDay.periods.find(period => period.status === 'in-progress' || period.status === 'due')
    || schoolDay.periods.find(period => period.status === 'ready')
    || schoolDay.periods[schoolDay.periods.length - 1];
  const stepIndex = Math.max(0, schoolDay.periods.findIndex(period => period.id === nextPeriod.id));
  const isSchoolDayComplete = schoolDay.completedPeriods >= schoolDay.totalPeriods;
  const room = getCampusRoom(nextPeriod.room);
  const childName = progress.childName || 'learner';
  const actionLabelByPeriod: Record<string, string> = {
    homeroom: 'Start with teacher',
    core: nextPeriod.status === 'in-progress' ? 'Continue lesson' : 'Start lesson',
    reading: 'Open reading block',
    stem: 'Open STEM lab',
    creative: 'Open creative studio',
    exit: 'Do exit ticket',
  };
  const teacherPrompt = isSchoolDayComplete
    ? `Nice work, ${childName}. Your school day is complete. You can review a favorite classroom or show your passport to a grown-up.`
    : nextPeriod.status === 'in-progress'
      ? `Let's finish ${nextPeriod.label}. I want to hear your strategy before we mark it complete.`
      : nextPeriod.status === 'due'
        ? `${childName}, a quick review is due. Explain the idea again so it sticks.`
        : `Next, come with me to ${nextPeriod.label}. I will teach first, then you try.`;

  return {
    period: nextPeriod,
    stepNumber: stepIndex + 1,
    totalSteps: schoolDay.totalPeriods,
    title: isSchoolDayComplete ? 'School day complete' : nextPeriod.label,
    detail: isSchoolDayComplete
      ? 'All planned class periods are checked off for today.'
      : nextPeriod.detail,
    actionLabel: isSchoolDayComplete ? 'Review favorite class' : actionLabelByPeriod[nextPeriod.id] || nextPeriod.actionLabel,
    teacherPrompt,
    progressLabel: `${schoolDay.completedPeriods}/${schoolDay.totalPeriods} periods complete`,
    proof: nextPeriod.proof,
    reward: nextPeriod.reward,
    whyItMatters: nextPeriod.whyItMatters,
    room: nextPeriod.room,
    unitId: nextPeriod.unitId,
    isSchoolDayComplete,
  };
};

export const getStudentPassportSummary = (progress: UserProgress): StudentPassportSummary => {
  const schoolDay = getSchoolDayPlan(progress);
  const recentEntries = [...(progress.learningJournal || [])].sort((a, b) => b.createdAt - a.createdAt);
  const todayEntries = recentEntries.filter(entry => isToday(entry.createdAt));
  const latestProof = recentEntries[0];
  const roomCount = new Set(recentEntries.map(entry => entry.room)).size;
  const reflectionCount = recentEntries.filter(entry => Boolean(entry.childReflection)).length;
  const masteryCount = recentEntries.filter(entry => entry.mastered).length;
  const nextStep = getNextSchoolStep(progress);
  const nextReadyAssignment = getTeacherAssignmentCards(progress).find(card => card.status !== 'done');
  const childName = progress.childName || 'learner';

  return {
    attendanceLabel: todayEntries.length > 0
      ? `${childName} has ${todayEntries.length} saved proof item${todayEntries.length === 1 ? '' : 's'} today.`
      : schoolDay.attendanceSummary,
    evidenceCount: recentEntries.length,
    reflectionCount,
    masteryCount,
    roomCount,
    latestProofLabel: latestProof
      ? `${getCampusRoom(latestProof.room).classroomName}: ${latestProof.unitTitle}`
      : 'First proof item is ready',
    latestProofDetail: latestProof
      ? latestProof.childReflection
        ? 'A student reflection is saved below for this proof item.'
        : latestProof.teacherNote || latestProof.successCheck || 'Practice proof was saved for parent review.'
      : `${AI_TEACHER.name} will save the first teacher note after a lesson reflection.`,
    teacherConferenceQuestion: latestProof?.childReflection
      ? 'Can you teach me the strategy you saved in your reflection?'
      : nextStep.proof
        ? `Can you show me this proof: ${nextStep.proof}`
        : 'Can you teach one strategy from today in your own words?',
    parentFollowUp: latestProof?.parentActivity
      || nextReadyAssignment?.parentNote
      || schoolDay.mission.parentActivity
      || 'Ask the child to teach one idea, then try one quick real-world example together.',
    nextStampTarget: nextReadyAssignment
      ? `${nextReadyAssignment.classroomName}: ${nextReadyAssignment.title}`
      : nextStep.isSchoolDayComplete
        ? 'Review a favorite class or explain today to a grown-up.'
        : `${getCampusRoom(nextStep.room).classroomName}: ${nextStep.title}`,
  };
};

export const getTeacherConferencePlan = (progress: UserProgress): TeacherConferencePlan => {
  const schoolDay = getSchoolDayPlan(progress);
  const recentEntries = [...(progress.learningJournal || [])].sort((a, b) => b.createdAt - a.createdAt);
  const latestProof = recentEntries[0];
  const nextStep = getNextSchoolStep(progress);
  const nextReadyAssignment = getTeacherAssignmentCards(progress).find(card => card.status !== 'done');
  const childName = progress.childName || 'Learner';

  if (!latestProof) {
    const missionRoom = getCampusRoom(schoolDay.mission.room);
    return {
      statusLabel: 'Ready for first conference',
      headline: `${childName} has a first teacher-led lesson ready in ${missionRoom.classroomName}.`,
      focusRoom: missionRoom.classroomName,
      evidenceLabel: 'No proof saved yet',
      teacherMove: `Start with ${AI_TEACHER.name}'s objective, model one example, then save the first exit ticket.`,
      studentCanSay: schoolDay.mission.successCheck,
      parentCheckIn: schoolDay.mission.parentActivity || 'Ask the child to explain one idea after the first practice round.',
      reviewPlan: 'Keep the child in the current grade path until the first proof item and reflection are saved.',
      tone: 'start',
    };
  }

  const proofRoom = getCampusRoom(latestProof.room);
  const practiceCount = Math.min(latestProof.practiceCount, MASTERED_PRACTICE_TARGET);
  const remainingPractice = Math.max(0, MASTERED_PRACTICE_TARGET - practiceCount);
  const latestUnit = getUnitsForGrade(progress.currentGrade).find(unit => unit.id === latestProof.unitId);
  const reviewCycleDays = latestUnit?.reviewCycleDays || 3;

  if (!latestProof.mastered) {
    const needsTeachBack = !latestProof.childReflection;
    return {
      statusLabel: needsTeachBack ? 'Needs teach-back' : 'Reteach plan ready',
      headline: `${latestProof.unitTitle} should stay in guided practice before the next grade step opens.`,
      focusRoom: proofRoom.classroomName,
      evidenceLabel: `${practiceCount}/${MASTERED_PRACTICE_TARGET} practice rounds saved`,
      teacherMove: needsTeachBack
        ? `Use Hint and Model from the help ladder, then ask ${childName} to teach the strategy back.`
        : `Use Try Together on one similar example, then repeat the exit ticket.`,
      studentCanSay: latestProof.successCheck || 'I can explain the strategy in my own words.',
      parentCheckIn: latestProof.parentActivity || 'Do one short example together and ask the child to explain each step.',
      reviewPlan: remainingPractice > 0
        ? `Complete ${remainingPractice} more practice round${remainingPractice === 1 ? '' : 's'} before mastery is counted.`
        : 'Repeat the exit ticket so the child proves the strategy without guessing.',
      tone: needsTeachBack ? 'practice' : 'reteach',
    };
  }

  return {
    statusLabel: 'Ready for review conference',
    headline: `${latestProof.unitTitle} is mastered and ready for spiral review.`,
    focusRoom: proofRoom.classroomName,
    evidenceLabel: latestProof.childReflection ? `Reflection saved: ${latestProof.childReflection}` : 'Mastery proof saved',
    teacherMove: `Ask one transfer question, then connect the skill to ${nextReadyAssignment?.classroomName || getCampusRoom(nextStep.room).classroomName}.`,
    studentCanSay: latestProof.childReflection || latestProof.successCheck || 'I can teach the strategy and show a new example.',
    parentCheckIn: latestProof.parentActivity || nextReadyAssignment?.parentNote || 'Ask the child to teach the skill in one minute.',
    reviewPlan: `Review again in ${reviewCycleDays} day${reviewCycleDays === 1 ? '' : 's'} so the skill stays fresh.`,
    tone: 'review',
  };
};

export const buildTeacherNotesFromJournal = (progress: UserProgress) => {
  const recentEntries = [...(progress.learningJournal || [])]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  if (recentEntries.length === 0) {
    const mission = getDailyMission(progress);
    return [{
      label: 'Teacher note',
      value: 'First lesson is ready',
      detail: `${AI_TEACHER.name} will start with ${mission.title} and save an exit ticket after practice.`,
      tone: 'info' as const,
    }];
  }

  return recentEntries.map(entry => ({
    label: getCampusRoom(entry.room).classroomName,
    value: entry.mastered ? 'Mastered' : `Practice ${Math.min(entry.practiceCount, MASTERED_PRACTICE_TARGET)}/${MASTERED_PRACTICE_TARGET}`,
    detail: entry.teacherNote || `${AI_TEACHER.name} wants to hear: ${entry.successCheck || 'Explain the strategy in your own words.'}`,
    nextStep: entry.teacherNextStep || entry.parentActivity,
    tone: entry.mastered ? 'success' as const : 'practice' as const,
  }));
};

export const buildTeacherJournalNote = (
  entry: Pick<LearningJournalEntry, 'room' | 'unitTitle' | 'successCheck' | 'practiceCount' | 'mastered'>,
) => {
  const room = getCampusRoom(entry.room);
  if (entry.mastered) {
    return `${AI_TEACHER.name} marked ${entry.unitTitle} as mastered in ${room.classroomName} after the child completed the exit ticket.`;
  }

  const remaining = Math.max(0, MASTERED_PRACTICE_TARGET - Math.min(entry.practiceCount, MASTERED_PRACTICE_TARGET));
  return `${AI_TEACHER.name} saved progress in ${room.classroomName}. Practice ${remaining} more round${remaining === 1 ? '' : 's'} and finish the exit ticket: ${entry.successCheck || 'teach back the strategy.'}`;
};

export const buildTeacherNextStep = (
  entry: Pick<LearningJournalEntry, 'parentActivity' | 'successCheck' | 'mastered'>,
) => {
  if (entry.mastered) {
    return entry.parentActivity || 'Ask the child to teach the strategy to a grown-up in one minute.';
  }

  return entry.successCheck || entry.parentActivity || 'Repeat one short example, then ask the child to explain the strategy.';
};
