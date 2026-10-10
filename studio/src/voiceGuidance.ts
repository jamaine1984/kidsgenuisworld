import type {Question} from './curriculum';
export function taskDirections(q:Question):string{
 return [q.prompt,q.listeningText,q.word?`The word is ${q.word}. ${q.word}.`:undefined,q.passage?'You can press Read together for help with the text.':undefined].filter(Boolean).join(' ');
}
export function narrationText(text:string):string{
 return text.replace(/_{2,}/g,' blank ').replace(/(\d+)\/(\d+)/g,'$1 over $2').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/\+/g,' plus ').replace(/=/g,' equals ').replace(/→/g,' changes to ').replace(/</g,' is less than ').replace(/>/g,' is greater than ').replace(/\s+/g,' ').trim();
}
