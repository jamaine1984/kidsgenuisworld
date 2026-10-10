import {getApps,initializeApp} from 'firebase/app';
import {browserLocalPersistence,getAuth,onAuthStateChanged,setPersistence,signInWithEmailAndPassword,createUserWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,sendPasswordResetEmail,signOut,type User} from 'firebase/auth';
import {useCallback,useEffect,useRef,useState} from 'react';
import config from './firebaseConfig.json';
import {canLearn,safeBillingUrl,type BillingAccess} from './billingPolicy';
const app=getApps().find(a=>a.name==='[DEFAULT]')||initializeApp(config);
export const parentAuth=getAuth(app);
const BASE='https://kid-genius-world.com';
export async function billingRequest(kind:'access'|'checkout'|'portal'){
 const user=parentAuth.currentUser;if(!user)throw Error('Sign in with a parent account first.');
 const response=await fetch(BASE+'/api/billing/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:await user.getIdToken(),familyId:'family-'+user.uid,plan:'starter',returnUrl:BASE})});
 const result=await response.json().catch(()=>({}));if(!response.ok)throw Error(result.error||'Billing could not be reached. Please try again.');return result;
}
export async function openCheckout(){const result=await billingRequest('checkout');if(result.alreadyActive)return false;window.location.assign(safeBillingUrl(result.url));return true;}
export async function openBillingPortal(){const result=await billingRequest('portal');window.location.assign(safeBillingUrl(result.url));}
export async function parentSignIn(email:string,password:string,create=false){await setPersistence(parentAuth,browserLocalPersistence);return create?createUserWithEmailAndPassword(parentAuth,email.trim(),password):signInWithEmailAndPassword(parentAuth,email.trim(),password);}
export async function parentGoogleSignIn(){await setPersistence(parentAuth,browserLocalPersistence);const p=new GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});return signInWithPopup(parentAuth,p);}
export const parentSignOut=()=>signOut(parentAuth);
export const resetParentPassword=(email:string)=>sendPasswordResetEmail(parentAuth,email.trim());
export function useParentBilling(){
 const [user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false),[access,setAccess]=useState<BillingAccess|null>(null),[checking,setChecking]=useState(false),[error,setError]=useState('');const generation=useRef(0);
 const refresh=useCallback(async()=>{const run=++generation.current;if(!parentAuth.currentUser){setAccess(null);setChecking(false);return;}setChecking(true);setAccess(null);setError('');try{const result=await billingRequest('access');if(run===generation.current)setAccess(result);}catch(e){if(run===generation.current)setError((e as Error).message);}finally{if(run===generation.current)setChecking(false);}},[]);
 useEffect(()=>onAuthStateChanged(parentAuth,u=>{generation.current++;setUser(u);setAccess(null);setReady(true);setError('');if(u)void refresh();else setChecking(false);},()=>{setReady(true);setError('Parent sign-in could not be restored. Please try again.');}),[refresh]);
 useEffect(()=>{const resume=()=>{if(document.visibilityState==='visible'&&parentAuth.currentUser)void refresh();};window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);const timer=setInterval(resume,5*60*1000);return()=>{window.removeEventListener('focus',resume);document.removeEventListener('visibilitychange',resume);clearInterval(timer);};},[refresh]);
 return {user,ready,access,checking,error,refresh,entitled:canLearn(access)};
}
