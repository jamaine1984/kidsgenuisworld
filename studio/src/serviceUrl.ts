// Keep the existing Firebase website and publisher routes while the app service runs on Cloudflare.
export function serviceUrl(path:string){return ['kid-genius-world.com','www.kid-genius-world.com','kid-genius-world.web.app','kid-genius-world.firebaseapp.com'].includes(window.location.hostname)?'https://wonderlane-tutor.koikes2021.workers.dev'+path:path;}
