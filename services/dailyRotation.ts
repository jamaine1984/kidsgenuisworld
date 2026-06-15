const getLocalDateKey = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const createSeededRandom = (seedText: string): (() => number) => {
  let seed = hashString(seedText);
  return () => {
    seed += 0x6D2B79F5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const getDailySeed = (scope: string, step = 0): string => {
  return `${getLocalDateKey()}::${scope}::${step}`;
};

export const pickDailyItem = <T>(items: T[], scope: string, step = 0): T => {
  if (items.length === 0) {
    throw new Error(`Cannot pick a daily item from an empty list for ${scope}.`);
  }

  const random = createSeededRandom(getDailySeed(scope, step));
  return items[Math.floor(random() * items.length)];
};

export const shuffleDailyItems = <T>(items: T[], scope: string, step = 0): T[] => {
  const random = createSeededRandom(getDailySeed(scope, step));
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export const withSeededRandom = <T>(scope: string, step: number, callback: () => T): T => {
  const originalRandom = Math.random;
  Math.random = createSeededRandom(getDailySeed(scope, step));

  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
};
