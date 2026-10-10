import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Player,type PlayerRef} from '@remotion/player';
import {Play,Pause,ArrowsClockwise,SpeakerHigh} from '@phosphor-icons/react';
import type {Question,Skill} from './curriculum';
import {demoScript} from './demoScript';
import {speak,stopSpeech} from './audio';
const loadDemo=()=>import('./LessonDemo').then(m=>({default:m.LessonDemo}));
export function NarratedExample({question,skill,reducedMotion}:{question:Question;skill:Skill;reducedMotion:boolean}){
 const steps=useMemo(()=>demoScript(skill,question),[skill,question]);
 const ref=useRef<PlayerRef>(null),run=useRef(0),stepRef=useRef(0),endFrame=useRef(0);
 const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[complete,setComplete]=useState(false),[slow,setSlow]=useState(false),[voiceError,setVoiceError]=useState(false),[speaking,setSpeaking]=useState(false);
 const duration=steps.reduce((n,s)=>n+s.frames,0);
 const stop=()=>{run.current++;ref.current?.pause();stopSpeech();setPlaying(false);setSpeaking(false);};
 useEffect(()=>{const player=ref.current;if(!player)return;const hold=()=>{if(player.getCurrentFrame()>=endFrame.current)player.pause();};player.addEventListener('frameupdate',hold);return()=>player.removeEventListener('frameupdate',hold);},[steps]);
 useEffect(()=>()=>{run.current++;ref.current?.pause();stopSpeech();},[question.id]);
 const play=async(start=complete?0:stepRef.current)=>{
  stop();const token=++run.current;setPlaying(true);setComplete(false);setVoiceError(false);
  for(let i=start;i<steps.length;i++){
   if(token!==run.current)return;const s=steps[i];stepRef.current=i;setStep(i);setSpeaking(false);endFrame.current=s.from+s.frames-1;ref.current?.seekTo(s.from);ref.current?.play();
   const ok=await speak(s.text,undefined,slow?.72:.88,()=>setSpeaking(true));
   if(token!==run.current)return;
   ref.current?.pause();ref.current?.seekTo(s.from+s.frames-1);
   if(!ok){setVoiceError(true);setPlaying(false);return;}
  }
  setComplete(true);setPlaying(false);setSpeaking(false);
 };
 return <div className='narrated-example'>
  <Player ref={ref} lazyComponent={loadDemo} inputProps={{question,skill,steps,reducedMotion}} compositionWidth={960} compositionHeight={540} durationInFrames={duration} fps={30} controls={false} clickToPlay={false} spaceKeyToPlayOrPause={false} moveToBeginningWhenEnded={false} playbackRate={slow?.8:1} acknowledgeRemotionLicense style={{width:'100%',borderRadius:20}}/>
  <div className='example-controls'>
   <button className='button cobalt' onClick={()=>playing?stop():void play()}>{playing?<Pause weight='fill'/>:<Play weight='fill'/>}{playing?'Pause example':complete?'Play again':'Play with Theo'}</button>
   <button className='text-button' onClick={()=>void play(0)}><ArrowsClockwise/>Replay</button>
   <label className='slow-example'><input type='checkbox' checked={slow} onChange={e=>{stop();setSlow(e.target.checked);}}/>Slower voice</label>
  </div>
  <div className='example-caption' aria-live='polite'><span><SpeakerHigh/>Step {step+1} of {steps.length} · {steps[step].label}</span><small className='narration-state'>{playing?(speaking?'Theo is speaking…':'Getting Theo’s voice ready…'):complete?'Ready to try a new one?':'Press Play to listen.'}</small><p>{steps[step].text}</p>{voiceError&&<p className='voice-error'>Voice is unavailable on this device. Follow the written steps below.</p>}</div>
  <div className='example-step-tabs' role='group' aria-label='Example steps'>{steps.map((s,i)=><button key={i} aria-pressed={step===i} onClick={()=>{stop();stepRef.current=i;setStep(i);setComplete(false);ref.current?.seekTo(s.from);}}>{i+1}. {s.label}</button>)}</div>
 </div>;
}
