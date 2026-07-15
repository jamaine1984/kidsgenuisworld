import React from 'react';
import { Circle, Square, Triangle } from 'lucide-react';
import { MathProblem } from '../../types';

interface EarlyMathModelProps {
  model: NonNullable<MathProblem['visualModel']>;
}

const colorClasses: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-400',
  green: 'bg-emerald-500',
  teal: 'bg-teal-500',
  violet: 'bg-violet-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-400',
  rose: 'bg-rose-500',
};

const CounterGroup: React.FC<{ count: number; color?: string; label: string; removedCount?: number }> = ({ count, color = 'blue', label, removedCount = 0 }) => (
  <div className="min-w-0 flex-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
    <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
    <div className="mx-auto grid min-h-20 max-w-64 grid-cols-5 place-items-center gap-2" aria-label={`${count} counters`}>
      {count === 0 ? (
        <span className="col-span-5 text-4xl font-black text-slate-400">0</span>
      ) : Array.from({ length: Math.min(count, 20) }, (_, index) => {
        const removed = index >= Math.max(0, Math.min(count, 20) - removedCount);
        return (
          <span key={index} className={`relative h-8 w-8 rounded-full shadow-sm ring-2 ring-white ${removed ? 'opacity-45' : ''} ${colorClasses[color] || colorClasses.blue}`}>
            {removed && <span className="absolute left-1/2 top-1/2 h-1 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-rose-900" />}
          </span>
        );
      })}
    </div>
  </div>
);

const ShapeVisual: React.FC<{ shape?: NonNullable<EarlyMathModelProps['model']['shape']>; color?: string }> = ({ shape = 'circle', color = 'blue' }) => {
  const iconClass = `h-28 w-28 ${color === 'red' ? 'text-red-500' : color === 'yellow' ? 'text-yellow-400' : color === 'green' ? 'text-emerald-500' : 'text-blue-500'}`;
  if (shape === 'triangle') return <Triangle className={iconClass} fill="currentColor" strokeWidth={2.5} />;
  if (shape === 'square') return <Square className={iconClass} fill="currentColor" strokeWidth={2.5} />;
  if (shape === 'rectangle') return <span className={`h-20 w-36 rounded-md ${colorClasses[color] || colorClasses.blue}`} />;
  if (shape === 'hexagon') return <span className={`flex h-28 w-28 items-center justify-center rounded-3xl ${colorClasses[color] || colorClasses.blue} text-sm font-black text-white`}>6 sides</span>;
  if (shape === 'sphere') return <span className={`h-28 w-28 rounded-full ${colorClasses[color] || colorClasses.blue} shadow-[inset_-18px_-14px_24px_rgba(15,23,42,0.28)]`} />;
  if (shape === 'cube') return <span className={`flex h-28 w-28 rotate-3 items-center justify-center rounded-xl ${colorClasses[color] || colorClasses.blue} text-sm font-black text-white shadow-[12px_12px_0_rgba(15,23,42,0.2)]`}>cube</span>;
  if (shape === 'cone') return <Triangle className={iconClass} fill="currentColor" strokeWidth={2.5} />;
  if (shape === 'cylinder') return <span className={`h-28 w-24 rounded-[50%/14%] ${colorClasses[color] || colorClasses.blue} shadow-[inset_-12px_-6px_18px_rgba(15,23,42,0.2)]`} />;
  return <Circle className={iconClass} fill="currentColor" strokeWidth={2.5} />;
};

export const EarlyMathModel: React.FC<EarlyMathModelProps> = ({ model }) => {
  if (model.kind === 'array') {
    const rows = Math.max(1, model.rows || 1);
    const columns = Math.max(1, model.columns || 1);
    return <div data-testid="early-math-model" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="mb-4 text-center text-sm font-black text-slate-700">{rows} rows x {columns} in each row</p><div className="mx-auto grid w-fit gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: rows * columns }, (_, index) => <span key={index} className="h-8 w-8 rounded-lg bg-indigo-500 shadow-sm ring-2 ring-indigo-100" />)}</div></div>;
  }

  if (model.kind === 'bar-model') {
    const segments = Math.max(2, model.segments || 2);
    const filled = Math.min(segments, Math.max(0, model.filledSegments || 0));
    return <div data-testid="early-math-model" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="mb-4 text-center text-sm font-black text-slate-700">Whole split into {segments} equal parts</p><div className="grid h-24 gap-1 rounded-xl border-4 border-violet-700 p-1" style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}>{Array.from({ length: segments }, (_, index) => <span key={index} className={`rounded-md ${index < filled ? 'bg-violet-500' : 'bg-violet-50'}`} />)}</div></div>;
  }

  if (model.kind === 'data-chart') {
    const values = model.values || [];
    const maximum = Math.max(...values, 1);
    return <div data-testid="early-math-model" className="flex min-h-48 items-end justify-center gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">{values.map((value, index) => <div key={index} className="flex h-40 flex-1 flex-col items-center justify-end gap-2"><span className="text-sm font-black text-indigo-900">{value}</span><span className="w-full max-w-20 rounded-t-lg bg-sky-500" style={{ height: `${Math.max(12, (value / maximum) * 100)}%` }} /><span className="text-xs font-bold text-slate-600">{model.labels?.[index] || String.fromCharCode(65 + index)}</span></div>)}</div>;
  }

  if (model.kind === 'area-model') {
    const width = Math.max(1, model.width || 1);
    const height = Math.max(1, model.height || 1);
    return <div data-testid="early-math-model" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="mb-3 text-center text-sm font-black text-slate-700">{width} units wide by {height} units tall</p><div className="mx-auto grid max-w-lg gap-0.5" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}>{Array.from({ length: width * height }, (_, index) => <span key={index} className="aspect-square min-h-5 border border-emerald-700 bg-emerald-200" />)}</div></div>;
  }

  if (model.kind === 'coordinate') {
    const pointX = Math.max(0, Math.min(5, model.pointX || 0));
    const pointY = Math.max(0, Math.min(5, model.pointY || 0));
    return <div data-testid="early-math-model" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="mb-3 text-center text-sm font-black text-slate-700">Plot the ordered pair</p><div className="relative mx-auto aspect-square max-w-72 border-b-4 border-l-4 border-indigo-800 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:20%_20%]"><span className="absolute h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full bg-rose-500 ring-4 ring-rose-200" style={{ left: `${pointX * 20}%`, bottom: `${pointY * 20}%` }} /></div><p className="mt-3 text-center font-black text-indigo-900">({pointX}, {pointY})</p></div>;
  }

  if (model.kind === 'angle') {
    const degrees = Math.max(1, Math.min(179, model.angleDegrees || 90));
    return <div data-testid="early-math-model" className="flex min-h-48 flex-col items-center justify-center rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="relative h-32 w-56"><span className="absolute bottom-3 left-8 h-2 w-40 origin-left rounded-full bg-indigo-700" /><span className="absolute bottom-3 left-8 h-2 w-40 origin-left rounded-full bg-rose-500" style={{ transform: `rotate(-${degrees}deg)` }} /><span className="absolute bottom-0 left-5 text-sm font-black text-slate-700">{degrees} degrees</span></div></div>;
  }

  if (model.kind === 'counters' || model.kind === 'color-set') {
    return <div data-testid="early-math-model"><CounterGroup count={model.leftCount || 0} color={model.color} label={model.rightCount ? `Start with ${model.leftCount}; cross out ${model.rightCount}` : 'Count each one'} removedCount={model.rightCount} /></div>;
  }

  if (model.kind === 'compare-groups') {
    return (
      <div data-testid="early-math-model" className="flex w-full flex-col gap-3 sm:flex-row">
        <CounterGroup count={model.leftCount || 0} color={model.color} label="Left group" />
        <CounterGroup count={model.rightCount || 0} color={model.secondaryColor} label="Right group" />
      </div>
    );
  }

  if (model.kind === 'shape') {
    return <div data-testid="early-math-model" className="flex min-h-40 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><ShapeVisual shape={model.shape} color={model.color} /></div>;
  }

  if (model.kind === 'pattern') {
    return (
      <div data-testid="early-math-model" className="flex min-h-32 flex-wrap items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        {(model.items || []).map((item, index) => item === '?'
          ? <span key={index} className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-dashed border-slate-300 text-3xl font-black text-slate-400">?</span>
          : <span key={index} aria-label={item} className={`h-14 w-14 rounded-2xl shadow-sm ${colorClasses[item] || colorClasses.blue}`} />)}
      </div>
    );
  }

  if (model.kind === 'position') {
    const relation = model.relation || 'above';
    const circlePosition = relation === 'above' ? '-top-8 left-1/2 -translate-x-1/2'
      : relation === 'below' ? '-bottom-8 left-1/2 -translate-x-1/2'
        : relation === 'inside' ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          : 'left-full top-1/2 ml-4 -translate-y-1/2';
    return (
      <div data-testid="early-math-model" className="flex min-h-44 items-center justify-center rounded-2xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
        <div className="relative h-24 w-24 rounded-xl bg-amber-300 ring-4 ring-amber-500">
          <span className={`absolute h-12 w-12 rounded-full bg-blue-500 ring-4 ring-white ${circlePosition}`} />
        </div>
      </div>
    );
  }

  if (model.kind === 'base-ten') {
    const tens = model.tens || 0;
    const ones = model.ones || 0;
    return (
      <div data-testid="early-math-model" className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2">
        <div className="rounded-2xl bg-sky-50 p-4">
          <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.14em] text-sky-700">{tens} tens</p>
          <div className="flex min-h-32 flex-wrap items-center justify-center gap-2">
            {Array.from({ length: tens }, (_, index) => (
              <span key={index} className="grid h-28 w-7 grid-rows-10 overflow-hidden rounded-md border-2 border-sky-700 bg-sky-400 shadow-sm">
                {Array.from({ length: 10 }, (__, unit) => <span key={unit} className="border-b border-sky-700/50 last:border-0" />)}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.14em] text-amber-700">{ones} ones</p>
          <div className="flex min-h-32 flex-wrap content-center justify-center gap-2">
            {Array.from({ length: ones }, (_, index) => <span key={index} className="h-7 w-7 rounded-md border-2 border-amber-700 bg-amber-300 shadow-sm" />)}
          </div>
        </div>
      </div>
    );
  }

  if (model.kind === 'clock') {
    const hour = model.hour || 12;
    const minutes = model.minutes || 0;
    const minuteAngle = minutes * 6;
    const hourAngle = (hour % 12) * 30 + minutes * 0.5;
    return (
      <div data-testid="early-math-model" className="flex min-h-56 items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="relative h-48 w-48 rounded-full border-8 border-indigo-700 bg-amber-50 shadow-xl" aria-label={`Clock showing ${hour}:${String(minutes).padStart(2, '0')}`}>
          {[12, 3, 6, 9].map(number => {
            const position = number === 12 ? 'left-1/2 top-2 -translate-x-1/2'
              : number === 3 ? 'right-2 top-1/2 -translate-y-1/2'
                : number === 6 ? 'bottom-2 left-1/2 -translate-x-1/2'
                  : 'left-2 top-1/2 -translate-y-1/2';
            return <span key={number} className={`absolute text-lg font-black text-indigo-950 ${position}`}>{number}</span>;
          })}
          <span className="absolute left-1/2 top-1/2 h-16 w-1.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-rose-500" style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }} />
          <span className="absolute left-1/2 top-1/2 h-12 w-2 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-indigo-800" style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }} />
          <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950" />
        </div>
      </div>
    );
  }

  if (model.kind === 'coins') {
    const coinStyles = {
      penny: 'h-14 w-14 bg-amber-600 text-amber-50',
      nickel: 'h-16 w-16 bg-slate-400 text-slate-950',
      dime: 'h-12 w-12 bg-slate-300 text-slate-900',
      quarter: 'h-20 w-20 bg-slate-400 text-slate-950',
    };
    const coinValues = { penny: '1¢', nickel: '5¢', dime: '10¢', quarter: '25¢' };
    return (
      <div data-testid="early-math-model" className="flex min-h-40 flex-wrap items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        {(model.coins || []).map((coin, index) => (
          <span key={`${coin}-${index}`} className={`flex items-center justify-center rounded-full border-4 border-white text-sm font-black shadow-lg ring-2 ring-slate-300 ${coinStyles[coin]}`} aria-label={coin}>
            {coinValues[coin]}
          </span>
        ))}
      </div>
    );
  }

  if (model.kind === 'fraction') {
    const denominator = Math.max(2, model.denominator || 2);
    const numerator = Math.min(denominator, model.numerator || 1);
    return (
      <div data-testid="early-math-model" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="mb-4 text-center text-sm font-black text-slate-700">{numerator} of {denominator} equal parts are shaded</p>
        <div className="mx-auto grid h-28 max-w-md gap-1 rounded-2xl border-4 border-violet-700 bg-white p-1" style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}>
          {Array.from({ length: denominator }, (_, index) => (
            <span key={index} className={`rounded-lg border border-violet-200 ${index < numerator ? 'bg-violet-500' : 'bg-violet-50'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (model.kind === 'measurement') {
    const leftLength = Math.max(1, model.leftLength || 1);
    const rightLength = Math.max(1, model.rightLength || 1);
    const longest = Math.max(leftLength, rightLength);
    return (
      <div data-testid="early-math-model" className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        {[
          { label: 'A', value: leftLength, color: 'bg-sky-500' },
          { label: 'B', value: rightLength, color: 'bg-rose-500' },
        ].map(item => (
          <div key={item.label} className="grid grid-cols-[2rem_1fr] items-center gap-3">
            <span className="font-black text-slate-700">{item.label}</span>
            <div className="h-10 rounded-lg bg-slate-100 p-1">
              <div className={`h-full rounded-md ${item.color}`} style={{ width: `${(item.value / longest) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const start = model.start || 0;
  const end = model.end ?? start;
  const minimum = Math.max(0, Math.min(start, end) - 1);
  const maximum = Math.max(start, end) + 1;
  const span = maximum - minimum;
  const pathNumbers = span <= 10
    ? Array.from({ length: span + 1 }, (_, index) => minimum + index)
    : Array.from(new Set(Array.from({ length: 6 }, (_, index) => Math.round(minimum + (span * index) / 5))));
  return (
    <div data-testid="early-math-model" className="flex min-h-28 flex-wrap items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      {pathNumbers.map(number => (
        <span key={number} className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-black ${number === end ? 'bg-emerald-500 text-white ring-4 ring-emerald-200' : number === start ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{number}</span>
      ))}
    </div>
  );
};
