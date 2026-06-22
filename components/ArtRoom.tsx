import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Download, Eraser, Palette, Target } from 'lucide-react';
import { playPop, speakAsync } from '../services/audioService';

interface ArtRoomProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string; timeSpentMs?: number }) => void;
  level: number;
}

const ART_MISSIONS = [
  {
    gradeLevel: 1,
    title: 'Color Explorer',
    prompt: 'Create a happy weather picture with three big color marks.',
    minStrokes: 8,
    focus: 'Artists choose colors to show feelings.',
    vocabulary: ['warm color', 'cool color', 'big mark'],
    lessonSteps: ['Pick one warm color and one cool color.', 'Make sky, ground, or sunshine with big safe strokes.', 'Add one detail that shows how the day feels.', 'Tell which color shows the feeling best.'],
    checks: ['Three colors', 'Big strokes', 'Feeling color', 'Tell about it'],
  },
  {
    gradeLevel: 2,
    title: 'Shape Builder',
    prompt: 'Build a playground picture with shapes, lines, and two colors.',
    minStrokes: 10,
    focus: 'Artists combine simple shapes to make real objects.',
    vocabulary: ['circle', 'rectangle', 'line', 'overlap'],
    lessonSteps: ['Draw two large shapes first.', 'Connect shapes with lines to make an object.', 'Add a second object using a different shape.', 'Explain which shape helped the picture most.'],
    checks: ['Two shapes', 'Lines connect', 'Two colors', 'Explain shape'],
  },
  {
    gradeLevel: 3,
    title: 'Story Picture',
    prompt: 'Draw a scene that shows a character, a place, and one action.',
    minStrokes: 12,
    focus: 'Illustrators make the viewer understand what happened.',
    vocabulary: ['character', 'setting', 'action', 'detail'],
    lessonSteps: ['Draw the place first so the story has a setting.', 'Add a character large enough to see.', 'Show one action with a line, pose, or object.', 'Add a detail that helps someone retell the story.'],
    checks: ['Character', 'Place', 'Action', 'Story detail'],
  },
  {
    gradeLevel: 4,
    title: 'Pattern Artist',
    prompt: 'Create a repeating pattern that changes once in an interesting way.',
    minStrokes: 14,
    focus: 'Patterns use repetition, contrast, and one planned variation.',
    vocabulary: ['repeat', 'contrast', 'variation', 'rhythm'],
    lessonSteps: ['Choose a two-part repeating pattern.', 'Repeat it at least four times.', 'Change one part on purpose to make a focal point.', 'Explain the rule your pattern follows.'],
    checks: ['Repeat', 'Contrast', 'Variation', 'Pattern rule'],
  },
  {
    gradeLevel: 5,
    title: 'Science Sketch',
    prompt: 'Sketch a nature object and add labels for details you notice.',
    minStrokes: 16,
    focus: 'Scientific artists observe first, then draw details accurately.',
    vocabulary: ['observe', 'label', 'texture', 'detail'],
    lessonSteps: ['Choose a nature object to imagine or observe.', 'Draw the largest shape lightly first.', 'Add texture, small parts, and labels.', 'Explain one detail that came from observation.'],
    checks: ['Observe', 'Texture', 'Labels', 'Evidence detail'],
  },
  {
    gradeLevel: 6,
    title: 'Perspective Scene',
    prompt: 'Draw a scene with foreground, middle ground, and background.',
    minStrokes: 18,
    focus: 'Perspective makes near objects larger and far objects smaller.',
    vocabulary: ['foreground', 'middle ground', 'background', 'scale'],
    lessonSteps: ['Place one large object near the bottom.', 'Add a middle object that is smaller.', 'Add far objects near the top or horizon.', 'Explain how size shows distance.'],
    checks: ['Foreground', 'Middle', 'Background', 'Scale choice'],
  },
  {
    gradeLevel: 7,
    title: 'Design Challenge',
    prompt: 'Create a poster that teaches one idea clearly.',
    minStrokes: 20,
    focus: 'Designers use layout, symbols, and contrast to communicate.',
    vocabulary: ['layout', 'symbol', 'headline', 'audience'],
    lessonSteps: ['Choose one clear message for the poster.', 'Make the most important symbol or word largest.', 'Use contrast so the viewer knows where to look first.', 'Explain who the poster is for and what it teaches.'],
    checks: ['Main idea', 'Useful symbol', 'Clear layout', 'Audience'],
  },
  {
    gradeLevel: 1,
    title: 'Line Walk',
    prompt: 'Make a picture using straight, curvy, and zigzag lines.',
    minStrokes: 9,
    focus: 'Artists use different line types to show movement.',
    vocabulary: ['straight', 'curvy', 'zigzag'],
    lessonSteps: ['Draw one straight line path.', 'Add a curvy line path.', 'Add a zigzag line path.', 'Tell which line looks fastest.'],
    checks: ['Straight line', 'Curvy line', 'Zigzag line', 'Line explanation'],
  },
  {
    gradeLevel: 2,
    title: 'Texture Hunt',
    prompt: 'Draw one object with smooth, bumpy, or rough texture marks.',
    minStrokes: 11,
    focus: 'Texture marks help viewers imagine how something feels.',
    vocabulary: ['smooth', 'bumpy', 'rough', 'texture'],
    lessonSteps: ['Choose one object.', 'Draw the big outside shape.', 'Fill part of it with repeated texture marks.', 'Explain how the texture would feel.'],
    checks: ['Object shape', 'Texture marks', 'Repeated marks', 'Feeling explanation'],
  },
  {
    gradeLevel: 3,
    title: 'Emotion Portrait',
    prompt: 'Draw a face or character that shows one clear feeling.',
    minStrokes: 13,
    focus: 'Artists show feelings with eyes, mouth, eyebrows, and color.',
    vocabulary: ['portrait', 'expression', 'emotion', 'detail'],
    lessonSteps: ['Choose one feeling.', 'Draw the face shape first.', 'Add eyes, mouth, and eyebrows that match the feeling.', 'Use one color that supports the feeling.'],
    checks: ['Feeling chosen', 'Expression details', 'Color choice', 'Explain emotion'],
  },
  {
    gradeLevel: 4,
    title: 'Symmetry Studio',
    prompt: 'Create a picture where the left and right sides match or almost match.',
    minStrokes: 15,
    focus: 'Symmetry means two sides balance like a mirror.',
    vocabulary: ['symmetry', 'mirror line', 'balance', 'match'],
    lessonSteps: ['Imagine a mirror line down the middle.', 'Draw one shape on the left.', 'Draw a matching shape on the right.', 'Explain what stayed balanced.'],
    checks: ['Mirror line idea', 'Left side', 'Right side', 'Balance explanation'],
  },
  {
    gradeLevel: 5,
    title: 'Map Illustrator',
    prompt: 'Draw a tiny map with three symbols and a clear path.',
    minStrokes: 17,
    focus: 'Map artists use symbols so people can read places quickly.',
    vocabulary: ['symbol', 'path', 'map key', 'route'],
    lessonSteps: ['Draw a path first.', 'Add three place symbols.', 'Repeat or label one symbol as the most important clue.', 'Explain how someone follows the route.'],
    checks: ['Path', 'Three symbols', 'Important clue', 'Route explanation'],
  },
  {
    gradeLevel: 6,
    title: 'Light and Shadow',
    prompt: 'Draw one object with a light side and a shadow side.',
    minStrokes: 19,
    focus: 'Value changes help objects look more three-dimensional.',
    vocabulary: ['value', 'highlight', 'shadow', 'form'],
    lessonSteps: ['Choose where the light comes from.', 'Draw one object shape.', 'Make one side darker with repeated marks.', 'Explain where the shadow belongs.'],
    checks: ['Light direction', 'Object shape', 'Shadow side', 'Value explanation'],
  },
  {
    gradeLevel: 7,
    title: 'Visual Argument',
    prompt: 'Design a poster that persuades people to do one helpful action.',
    minStrokes: 21,
    focus: 'Design can persuade when the message, symbol, and audience match.',
    vocabulary: ['persuade', 'audience', 'contrast', 'call to action'],
    lessonSteps: ['Choose one helpful action.', 'Make a symbol for the action.', 'Use contrast to make the message stand out.', 'Explain who should act and why.'],
    checks: ['Helpful action', 'Persuasive symbol', 'Strong contrast', 'Audience explanation'],
  },
];

const ART_EXPANSION_THEMES = [
  'weather', 'family', 'garden', 'space', 'ocean', 'city', 'forest', 'school',
  'friendship', 'sports', 'music', 'animals', 'machines', 'community', 'dreams',
  'books', 'kindness', 'seasons', 'maps', 'inventions',
];

const ART_PLANNING_CHOICES = [
  'one feeling',
  'one important place',
  'one main character',
  'one helpful action',
  'one pattern',
  'one strong shape',
  'one clear symbol',
  'one story moment',
];

const EXPANDED_ART_MISSIONS = ART_EXPANSION_THEMES.flatMap((theme, themeIndex) =>
  Array.from({ length: 7 }, (_, gradeIndex) => Array.from({ length: 2 }, (_, variantIndex) => {
    const gradeLevel = gradeIndex + 1;
    const planningChoice = ART_PLANNING_CHOICES[(themeIndex + variantIndex) % ART_PLANNING_CHOICES.length];
    return {
      gradeLevel,
      title: `${theme.replace(/^\w/, letter => letter.toUpperCase())} Studio ${gradeLevel}.${variantIndex + 1}`,
      prompt: gradeLevel <= 2
        ? `Draw a ${theme} picture with big shapes, clear colors, and one favorite detail.`
        : gradeLevel <= 4
          ? `Create a ${theme} scene with foreground, background, pattern, and a clear focal point.`
          : `Design a ${theme} artwork that communicates an idea using layout, contrast, labels, and evidence details.`,
      minStrokes: 8 + gradeLevel + (themeIndex % 4) + variantIndex,
      focus: gradeLevel <= 2
        ? 'Artists use simple marks to show an idea clearly.'
        : gradeLevel <= 4
          ? 'Artists organize details so the viewer understands the scene.'
          : 'Artists make design choices that communicate a message to an audience.',
      vocabulary: gradeLevel <= 2
        ? ['shape', 'color', 'detail']
        : gradeLevel <= 4
          ? ['pattern', 'space', 'focal point', 'detail']
          : ['composition', 'contrast', 'audience', 'evidence'],
      lessonSteps: [
        `Choose ${planningChoice} for the ${theme} artwork before drawing.`,
        'Draw the largest shape first so the picture has a clear plan.',
        'Add colors, patterns, or details that support the idea.',
        'Explain one choice that makes the artwork easier to understand.',
      ],
      checks: ['Main idea', 'Large shape', 'Helpful details', 'Artist explanation'],
    };
  })).flat()
);

const ALL_ART_MISSIONS = [...ART_MISSIONS, ...EXPANDED_ART_MISSIONS];

const ART_FOCUS_SECONDS = 30;

const ART_TEACHER_PRAISE = [
  'Wonderful studio work. I can see your effort in those marks.',
  'Beautiful thinking. You used your artist eyes and kept going.',
  'Great job. Your picture shows planning, practice, and creativity.',
  'That is strong art effort. You followed the lesson and made it your own.',
  'Excellent focus. You added details like a real studio artist.',
  'I love how you stayed with the task. Your artwork is ready to save.',
];

export const ArtRoom: React.FC<ArtRoomProps> = ({ onBack, onReward, level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#FF5733');
  const [size, setSize] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [reflectionChoice, setReflectionChoice] = useState('');
  const [studioFeedback, setStudioFeedback] = useState('Finish the studio steps, add enough drawing marks, then submit your artwork for Mr. Atlas review.');
  const [artFocusSeconds, setArtFocusSeconds] = useState(0);
  const [hasStartedArtwork, setHasStartedArtwork] = useState(false);
  const [completedTimedSteps, setCompletedTimedSteps] = useState(0);

  const colors = ['#FF5733', '#FFBD33', '#DBFF33', '#75FF33', '#33FF57', '#33FFBD', '#33DBFF', '#3357FF', '#7533FF', '#FF33BD', '#000000', '#FFFFFF'];
  const missionPool = ALL_ART_MISSIONS.filter(item => item.gradeLevel <= Math.min(Math.max(level, 1), 7));
  const mission = missionPool[new Date().getDate() % missionPool.length] || ALL_ART_MISSIONS[0];
  const hasEnoughDrawing = strokeCount >= mission.minStrokes;
  const hasEnoughFocusTime = completedTimedSteps >= mission.lessonSteps.length;
  const hasFinishedSteps = activeStep >= mission.lessonSteps.length - 1;
  const canComplete = hasEnoughDrawing && hasEnoughFocusTime && hasFinishedSteps && Boolean(reflectionChoice) && !isComplete;
  const drawingProgress = Math.min(strokeCount, mission.minStrokes);
  const focusProgress = Math.min(artFocusSeconds, ART_FOCUS_SECONDS);
  const focusSecondsLeft = Math.max(0, ART_FOCUS_SECONDS - focusProgress);
  const stepProgress = activeStep + 1;
  const studioScore = Math.round((
    (hasEnoughDrawing ? 30 : (drawingProgress / mission.minStrokes) * 30) +
    (hasEnoughFocusTime ? 20 : (completedTimedSteps / mission.lessonSteps.length) * 20) +
    (hasFinishedSteps ? 30 : (stepProgress / mission.lessonSteps.length) * 30) +
    (reflectionChoice ? 20 : 0)
  ));

  // Fixed canvas size (A4-ish ratio)
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 1000;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        // Set actual resolution
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        
        // White background default
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
  }, []);

  useEffect(() => {
    void speakAsync(`Welcome to Art Studio. Today we are learning ${mission.title}. ${mission.focus} ${mission.lessonSteps[0]}`, 0.86, 1.03);
  }, [mission]);

  useEffect(() => {
    if (!hasStartedArtwork || isComplete || artFocusSeconds >= ART_FOCUS_SECONDS) {
      return;
    }

    const timer = window.setInterval(() => {
      setArtFocusSeconds(seconds => Math.min(seconds + 1, ART_FOCUS_SECONDS));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hasStartedArtwork, isComplete, artFocusSeconds]);

  useEffect(() => {
    if (!hasStartedArtwork || isComplete || artFocusSeconds < ART_FOCUS_SECONDS) {
      return;
    }

    const completedStepCount = Math.max(completedTimedSteps, activeStep + 1);
    setCompletedTimedSteps(completedStepCount);

    if (activeStep < mission.lessonSteps.length - 1) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      setArtFocusSeconds(0);
      setHasStartedArtwork(false);
      const encouragement = ART_TEACHER_PRAISE[nextStep % ART_TEACHER_PRAISE.length];
      const feedback = `${encouragement} Now step ${nextStep + 1}: ${mission.lessonSteps[nextStep]} Draw for 30 seconds and I will move you again.`;
      setStudioFeedback(feedback);
      void speakAsync(feedback, 0.86, 1.02);
      return;
    }

    const feedback = 'Nice focus. You finished the timed art steps. Choose one reflection sentence, then I can save your artwork.';
    setHasStartedArtwork(false);
    setStudioFeedback(feedback);
    void speakAsync(feedback, 0.86, 1.02);
  }, [activeStep, artFocusSeconds, completedTimedSteps, hasStartedArtwork, isComplete, mission.lessonSteps]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasStartedArtwork(true);
    setStrokeCount(count => count + 1);
    draw(e);
    playPop();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Calculate scaling factors if the canvas is displayed at a different size via CSS
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if(canvas && ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      setStrokeCount(0);
      setIsComplete(false);
      setActiveStep(0);
      setReflectionChoice('');
      setArtFocusSeconds(0);
      setHasStartedArtwork(false);
      setCompletedTimedSteps(0);
      setStudioFeedback('Fresh canvas ready. Follow each studio step, draw your idea, then submit it for review.');
  }

  const download = () => {
      const link = document.createElement('a');
      link.download = 'my-masterpiece.png';
      link.href = canvasRef.current?.toDataURL() || '';
      link.click();
  }

  const completeArtwork = () => {
      if (isComplete) return;

      const missingSteps = [
        !hasEnoughDrawing ? `add ${mission.minStrokes - strokeCount} more drawing mark${mission.minStrokes - strokeCount === 1 ? '' : 's'}` : '',
        !hasEnoughFocusTime ? `finish ${mission.lessonSteps.length - completedTimedSteps} more timed studio step${mission.lessonSteps.length - completedTimedSteps === 1 ? '' : 's'}` : '',
        !hasFinishedSteps ? 'let Mr. Atlas guide you through each studio step' : '',
        !reflectionChoice ? 'choose one reflection sentence' : '',
      ].filter(Boolean);

      if (missingSteps.length > 0) {
        const feedback = `Almost ready. Please ${missingSteps.join(', ')}.`;
        setStudioFeedback(feedback);
        void speakAsync(feedback, 0.86, 1.02);
        return;
      }

      setIsComplete(true);
      const praise = ART_TEACHER_PRAISE[(strokeCount + activeStep + artFocusSeconds) % ART_TEACHER_PRAISE.length];
      const feedback = `${praise} Studio score ${studioScore} out of 100. Next, I will save your art progress and guide you to the next activity.`;
      setStudioFeedback(feedback);
      void speakAsync(feedback, 0.86, 1.02);
      onReward({
        questionId: `art-${mission.gradeLevel}-${mission.title}`,
        skill: mission.focus,
        prompt: mission.prompt,
        selectedAnswer: reflectionChoice,
        correctAnswer: mission.checks.join(', '),
        timeSpentMs: completedTimedSteps * ART_FOCUS_SECONDS * 1000,
      });
  };

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#fde68a_0,#f9a8d4_34%,#c084fc_68%,#60a5fa_100%)] flex flex-col">
      <header className="p-4 flex justify-between items-center bg-white/35 backdrop-blur-md shadow-md z-20 shrink-0">
        <button onClick={onBack} aria-label="Back to world map" className="bg-white p-2 rounded-full hover:bg-pink-50 shadow-sm">
          <ArrowLeft className="text-pink-600" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-pink-700 flex items-center justify-center gap-2"><Palette /> Art Studio</h1>
          <p className="text-xs font-bold text-pink-700/80">{mission.title}: {mission.focus}</p>
        </div>
        <div className="flex gap-2">
             <button
                onClick={completeArtwork}
                className={`p-2 rounded-full shadow-sm ${canComplete || isComplete ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white text-emerald-700 hover:bg-emerald-50'}`}
                title="Submit artwork for review"
                aria-label="Submit artwork for review"
             >
                <CheckCircle2 />
             </button>
             <button onClick={clearCanvas} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"><Eraser /></button>
             <button onClick={download} className="p-2 bg-white rounded-full text-blue-500 hover:bg-blue-50"><Download /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Tools */}
        <div className="w-24 bg-white/95 shadow-xl z-20 flex flex-col items-center py-4 gap-4 overflow-y-auto kid-scroll shrink-0">
            <div className="rounded-2xl bg-pink-50 px-2 py-3 text-center text-[10px] font-black uppercase tracking-wide text-pink-700 ring-1 ring-pink-100">
              Creative Studio Mission
              <div className="mt-1 text-[9px] normal-case tracking-normal text-pink-500">{mission.title}</div>
            </div>
            <div className="w-20 rounded-2xl bg-indigo-50 px-2 py-3 text-left ring-1 ring-indigo-100">
              <div className="mb-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-indigo-700">
                <Target size={12} />
                Lesson
              </div>
              <div className="space-y-1">
                {mission.lessonSteps.map((step, index) => (
                  <div
                    key={step}
                    aria-current={activeStep === index ? 'step' : undefined}
                    className={`w-full rounded-xl px-2 py-1 text-left text-[9px] font-bold leading-tight ${activeStep === index ? 'bg-indigo-600 text-white' : index < completedTimedSteps ? 'bg-emerald-50 text-emerald-800' : 'bg-white text-indigo-800'}`}
                  >
                    {index + 1}. {step}
                  </div>
                ))}
              </div>
            </div>
            {colors.map(c => (
                <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-12 h-12 rounded-full border-4 shadow-sm transition-transform hover:scale-110 ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                    style={{backgroundColor: c}}
                />
            ))}
            <div className="h-px w-16 bg-gray-200 my-2"></div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-gray-400">SIZE</span>
                <input 
                    type="range" 
                    min="2" max="50" 
                    value={size} 
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="h-32 -rotate-90 w-8" // Vertical slider
                />
            </div>
        </div>

        {/* Canvas Container - SCROLLABLE */}
        <div className="flex-1 bg-white/25 overflow-auto p-8 flex flex-col items-center justify-start gap-5 shadow-inner cursor-crosshair kid-scroll xl:flex-row xl:items-start xl:justify-center">
            <div className="hidden w-full max-w-5xl shrink-0 rounded-2xl bg-white/92 p-3 shadow-lg ring-1 ring-pink-100 md:block xl:max-w-md">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-pink-600">Teacher-Led Art Lesson</div>
                  <p className="mt-1 text-sm font-black text-slate-900">{mission.prompt}</p>
                  <p className="mt-1 text-xs font-bold text-slate-600">Now: {mission.lessonSteps[activeStep]}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                    {mission.vocabulary.map(word => (
                      <span key={word} className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{word}</span>
                    ))}
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{strokeCount}/{mission.minStrokes} strokes</span>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                      Step timer: {focusSecondsLeft}s left
                    </span>
                  </div>
                </div>
                <div className="w-full max-w-sm">
                  <div className="mb-3 rounded-2xl border border-emerald-100 bg-white px-3 py-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Mr. Atlas Review</p>
                        <p className="mt-1 text-sm font-black text-slate-900">{studioScore}/100 studio score</p>
                      </div>
                      {isComplete && <CheckCircle2 className="shrink-0 text-emerald-600" size={24} />}
                    </div>
                    <div className="mt-3 grid gap-2 text-[11px] font-black text-slate-700">
                      <p className={hasEnoughDrawing ? 'text-emerald-700' : 'text-amber-700'}>Drawing effort: {drawingProgress}/{mission.minStrokes}</p>
                      <p className={hasEnoughFocusTime ? 'text-emerald-700' : 'text-amber-700'}>
                        Timed studio steps: {completedTimedSteps}/{mission.lessonSteps.length}
                      </p>
                      <p className={hasFinishedSteps ? 'text-emerald-700' : 'text-amber-700'}>Current step: {stepProgress}/{mission.lessonSteps.length}</p>
                      <p className={reflectionChoice ? 'text-emerald-700' : 'text-amber-700'}>Reflection: {reflectionChoice ? 'ready' : 'choose one'}</p>
                    </div>
                    <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900">{studioFeedback}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mission.checks.map((check, index) => (
                      <span key={check} className={`rounded-full px-3 py-1 text-xs font-black ${index <= activeStep ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-700'}`}>{check}</span>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {['I used color on purpose', 'I used shapes or lines', 'I added a clear detail', 'I can explain my choice'].map(choice => (
                      <button
                        key={choice}
                        onClick={() => {
                          setReflectionChoice(choice);
                          void speakAsync(choice, 0.86, 1.02);
                        }}
                        className={`rounded-xl px-3 py-2 text-left text-xs font-black ${reflectionChoice === choice ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-800'}`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={completeArtwork}
                    className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black shadow-sm ${isComplete ? 'bg-emerald-100 text-emerald-800' : canComplete ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-emerald-800 hover:bg-emerald-50'}`}
                  >
                    <CheckCircle2 size={14} />
                    {isComplete ? 'Artwork saved' : 'Finish artwork'}
                  </button>
                </div>
              </div>
            </div>
            <div className="shadow-2xl relative">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="bg-white cursor-crosshair touch-none"
                    style={{ width: '800px', height: '1000px' }} // CSS display size matches logic size
                />
            </div>
        </div>
      </div>
    </div>
  );
};
