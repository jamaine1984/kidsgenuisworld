import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Download, Eraser, Palette } from 'lucide-react';
import { playPop } from '../services/audioService';

interface ArtRoomProps {
  onBack: () => void;
  onReward: () => void;
  level: number;
}

const ART_MISSIONS = [
  { gradeLevel: 1, title: 'Color Explorer', prompt: 'Draw three big color marks.', minStrokes: 3, focus: 'Name the colors you used.', checks: ['Pick colors', 'Make big strokes', 'Tell about it'] },
  { gradeLevel: 2, title: 'Shape Builder', prompt: 'Draw a picture with two shapes and two colors.', minStrokes: 4, focus: 'Look for circles, squares, and lines.', checks: ['Use shapes', 'Use colors', 'Finish neatly'] },
  { gradeLevel: 3, title: 'Story Picture', prompt: 'Draw a picture that shows a character, a place, and one action.', minStrokes: 5, focus: 'Make the picture tell what happened.', checks: ['Character', 'Place', 'Action'] },
  { gradeLevel: 4, title: 'Pattern Artist', prompt: 'Create a repeating color or shape pattern.', minStrokes: 6, focus: 'Repeat a design so the pattern is easy to spot.', checks: ['Repeat', 'Contrast', 'Explain pattern'] },
  { gradeLevel: 5, title: 'Science Sketch', prompt: 'Sketch an object from nature and add details you notice.', minStrokes: 7, focus: 'Use careful observation before decorating.', checks: ['Observe', 'Details', 'Label idea'] },
  { gradeLevel: 6, title: 'Perspective Scene', prompt: 'Draw a scene with foreground, middle ground, and background.', minStrokes: 8, focus: 'Make close things larger and far things smaller.', checks: ['Foreground', 'Middle', 'Background'] },
  { gradeLevel: 7, title: 'Design Challenge', prompt: 'Create a poster that teaches one idea clearly.', minStrokes: 9, focus: 'Use layout, color, and symbols to communicate.', checks: ['Main idea', 'Useful symbols', 'Clear layout'] },
];

export const ArtRoom: React.FC<ArtRoomProps> = ({ onBack, onReward, level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#FF5733');
  const [size, setSize] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const colors = ['#FF5733', '#FFBD33', '#DBFF33', '#75FF33', '#33FF57', '#33FFBD', '#33DBFF', '#3357FF', '#7533FF', '#FF33BD', '#000000', '#FFFFFF'];
  const mission = ART_MISSIONS[Math.min(Math.max(level, 1), 7) - 1];

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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
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
  }

  const download = () => {
      const link = document.createElement('a');
      link.download = 'my-masterpiece.png';
      link.href = canvasRef.current?.toDataURL() || '';
      link.click();
  }

  const completeArtwork = () => {
      if (isComplete || strokeCount < mission.minStrokes) return;
      setIsComplete(true);
      onReward();
  };

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#fde68a_0,#f9a8d4_34%,#c084fc_68%,#60a5fa_100%)] flex flex-col">
      <header className="p-4 flex justify-between items-center bg-white/35 backdrop-blur-md shadow-md z-20 shrink-0">
        <button onClick={onBack} aria-label="Back to world map" className="bg-white p-2 rounded-full hover:bg-pink-50 shadow-sm">
          <ArrowLeft className="text-pink-600" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-pink-700 flex items-center justify-center gap-2"><Palette /> Art Studio</h1>
          <p className="text-xs font-bold text-pink-700/80">{mission.title}: {mission.prompt}</p>
        </div>
        <div className="flex gap-2">
             <button
                onClick={completeArtwork}
                disabled={strokeCount < mission.minStrokes || isComplete}
                className={`p-2 rounded-full shadow-sm ${strokeCount >= mission.minStrokes && !isComplete ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white text-gray-300'}`}
                title="Complete artwork"
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
        <div className="flex-1 bg-white/25 overflow-auto p-8 flex items-start justify-center shadow-inner cursor-crosshair kid-scroll">
            <div className="absolute top-4 left-32 right-8 z-10 hidden rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-pink-100 md:block">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-pink-600">Artist Checklist</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                {mission.checks.map(check => (
                  <span key={check} className="rounded-full bg-pink-50 px-3 py-1">{check}</span>
                ))}
                <span className="rounded-full bg-yellow-50 px-3 py-1">{mission.focus}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1">{strokeCount}/{mission.minStrokes} strokes</span>
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
