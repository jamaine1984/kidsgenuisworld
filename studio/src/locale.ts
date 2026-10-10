export type Locale='en'|'es';
const KEY='kgw:language';let current:Locale='en',loaded=false;const listeners=new Set<()=>void>();
export function getLocale():Locale{if(!loaded&&typeof window!=='undefined'){loaded=true;try{const requested=new URLSearchParams(window.location.search).get('lang');current=requested==='es'||requested!=='en'&&localStorage.getItem(KEY)==='es'?'es':'en';if(requested==='en'||requested==='es')localStorage.setItem(KEY,current);}catch{}}return current;}
export function setLocale(next:Locale){getLocale();if(next===current)return;current=next;try{if(typeof localStorage!=='undefined')localStorage.setItem(KEY,next);}catch{}for(const fn of listeners)fn();}
export function subscribeLocale(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
export const speechLanguage=()=>getLocale()==='es'?'es-MX':'en-US';
