import type {Profile} from './learning';
import type {Skill,Subject} from './curriculum';
export function subjectGrade(profile:Profile,subject:Subject){return subject==='math'?profile.mathGrade:profile.readingGrade;}
export function matchesGrade(profile:Profile,skill:Skill|undefined){return !!skill&&skill.grade===subjectGrade(profile,skill.subject);}
export function canResume(profile:Profile,session:any,skill:Skill|undefined){return !!session&&session.profileId===profile.id&&session.skillId===skill?.id&&matchesGrade(profile,skill);}
