import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getGuideMessage = async (context: string): Promise<string> => {
  if (!ai) return "Welcome! Let's learn together.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a friendly, energetic learning guide for a child. 
      The child is currently in the "${context}". 
      Give them a very short (max 10 words) encouraging instruction. 
      Use simple language suitable for a 6-year-old.`,
    });
    return response.text || "Have fun learning!";
  } catch (e) {
    console.error("AI Error", e);
    return "Welcome to Kid Genius World!";
  }
};

export const generateMathProblem = async (level: number): Promise<{question: string, answer: number, options: number[]}> => {
  const difficulty = Math.min(Math.max(level, 1), 7);
  let a = 0, b = 0, op = '+', ans = 0;

  // PRECISE GRADE LEVEL LOGIC
  switch (difficulty) {
    case 1: // Pre-K: Very simple addition (1-5)
        a = Math.floor(Math.random() * 3) + 1; 
        b = Math.floor(Math.random() * 3) + 1; 
        op = '+';
        break;
    case 2: // Kindergarten: Addition to 10
        a = Math.floor(Math.random() * 6) + 2;
        b = Math.floor(Math.random() * 5) + 1;
        op = '+';
        break;
    case 3: // 1st Grade: Addition/Subtraction to 20
        op = Math.random() > 0.5 ? '+' : '-';
        if (op === '+') {
            a = Math.floor(Math.random() * 10) + 5;
            b = Math.floor(Math.random() * 9) + 1;
        } else {
            a = Math.floor(Math.random() * 10) + 10; // 10-20
            b = Math.floor(Math.random() * 8) + 1; 
        }
        break;
    case 4: // 2nd Grade: Double digit Add/Sub (up to 50)
        op = Math.random() > 0.5 ? '+' : '-';
        if (op === '+') {
            a = Math.floor(Math.random() * 30) + 10;
            b = Math.floor(Math.random() * 20) + 10;
        } else {
            a = Math.floor(Math.random() * 20) + 30; // 30-50
            b = Math.floor(Math.random() * 20) + 5;
        }
        break;
    case 5: // 3rd Grade: Multiplication Tables (2-9)
        op = '*';
        a = Math.floor(Math.random() * 8) + 2;
        b = Math.floor(Math.random() * 8) + 2;
        break;
    case 6: // 4th Grade: Division & Harder Multiplication
        op = Math.random() > 0.5 ? '/' : '*';
        if (op === '*') {
            a = Math.floor(Math.random() * 8) + 4;
            b = Math.floor(Math.random() * 8) + 4;
        } else {
            // Division
            ans = Math.floor(Math.random() * 8) + 2; 
            b = Math.floor(Math.random() * 8) + 2;
            a = ans * b;
        }
        break;
    case 7: // 5th Grade: Mixed Operations
        const r = Math.random();
        if (r < 0.33) {
             op = '*';
             a = Math.floor(Math.random() * 11) + 2;
             b = Math.floor(Math.random() * 11) + 2;
        } else if (r < 0.66) {
             op = '/';
             ans = Math.floor(Math.random() * 10) + 2;
             b = Math.floor(Math.random() * 10) + 2;
             a = ans * b;
        } else {
             op = Math.random() > 0.5 ? '+' : '-';
             a = Math.floor(Math.random() * 100) + 50;
             b = Math.floor(Math.random() * 50) + 25;
        }
        break;
  }

  // Calculate Answer
  if (op !== '/') {
      // Ensure non-negative for subtraction
      if (op === '-' && a < b) [a, b] = [b, a];

      switch(op) {
          case '+': ans = a + b; break;
          case '-': ans = a - b; break;
          case '*': ans = a * b; break;
      }
  }

  const question = `${a} ${op} ${b}`;
  
  // Smart Distractors
  const opts = new Set<number>();
  opts.add(ans);
  while(opts.size < 4) {
      let offset = Math.floor(Math.random() * 5) + 1;
      if (difficulty >= 4) offset = Math.floor(Math.random() * 10) + 1;
      if (Math.random() > 0.5) offset = -offset;
      
      const val = ans + offset;
      if (val >= 0 && val !== ans) opts.add(val);
  }

  return {
      question: `${question} = ?`,
      answer: ans,
      options: Array.from(opts).sort(() => Math.random() - 0.5)
  };
};

// DEPRECATED: Old Gemini TTS (costs money)
// Now using free Web Speech API instead - see audioService.ts speak()
export const getGuideVoice = async (text: string): Promise<string | null> => {
  // Return null to signal caller should use speak() from audioService instead
  return null;
}
