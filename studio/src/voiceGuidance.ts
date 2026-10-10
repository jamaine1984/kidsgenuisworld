import type {Question} from './curriculum';
import {getLocale} from './locale';
export function taskDirections(q:Question):string{
 if(getLocale()==='es')return [q.prompt,q.listeningText,q.word?`La palabra es ${q.word}. ${q.word}.`:undefined,q.passage?'Puedes pulsar Leer juntos para escuchar el texto.':undefined].filter(Boolean).join(' ');
 return [q.prompt,q.listeningText,q.word?`The word is ${q.word}. ${q.word}.`:undefined,q.passage?'You can press Read together for help with the text.':undefined].filter(Boolean).join(' ');
}
export function narrationText(text:string):string{
 if(getLocale()==='es')return text.replace(/_{2,}/g,' espacio en blanco ').replace(/(\d+)\/(\d+)/g,'$1 sobre $2').replace(/×/g,' por ').replace(/÷/g,' dividido entre ').replace(/−/g,' menos ').replace(/\+/g,' más ').replace(/=/g,' igual a ').replace(/→/g,' cambia a ').replace(/</g,' es menor que ').replace(/>/g,' es mayor que ').replace(/\s+/g,' ').trim();
 return text.replace(/_{2,}/g,' blank ').replace(/(\d+)\/(\d+)/g,'$1 over $2').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/\+/g,' plus ').replace(/=/g,' equals ').replace(/→/g,' changes to ').replace(/</g,' is less than ').replace(/>/g,' is greater than ').replace(/\s+/g,' ').trim();
}
