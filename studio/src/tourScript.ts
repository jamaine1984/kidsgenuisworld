export const TOUR_FPS=30;
export const TOUR_STEPS=[
 {label:'Reading · Hear the word',text:'Welcome to the Reading Room. Theo shows one idea at a time. Here is cap. Listen to the short a sound, then look at each letter.'},
 {label:'Reading · Notice the change',text:'Now a quiet e joins the end. Cap becomes cape. The a says its long sound. Children hear the explanation while the letters show the change.'},
 {label:'Reading · Try a new word',text:'Watch, listen, and build the word. Then practice with a fresh word. Replay the directions or slow the voice when your child needs more time.'},
 {label:'Math · Build the problem',text:'In the Math Studio, we can see eight plus five. Eight blue counters and five gold counters make the numbers something children can work with.'},
 {label:'Math · Make a ten',text:'Eight needs two more to make ten. Move two gold counters into the empty spaces. Three gold counters are still left. The picture shows why it works.'},
 {label:'Math · Explain the answer',text:'Ten and three make thirteen. Theo explains the steps before your child tries a new problem. Helpful feedback makes a mistake another chance to understand.'},
 {label:'Explore · Grades 1–3',text:'Kid Genius World brings math and reading together for first, second, and third grade. Parents can choose a different starting level for each subject.'},
 {label:'Explore · A deeper library',text:'Explore one thousand three hundred twenty curriculum activities, with forty in each learning section. Saved question history helps keep completed questions out of future lessons.'},
 {label:'Explore · Read and create',text:'Theo’s Discovery Lab adds little books, listening practice, spelling, dictation, and original writing. Written directions stay available alongside the same familiar tutor voice.'},
 {label:'Explore · Learn by making',text:'Hands-on missions let children trade place-value blocks, build coin totals, set clocks, measure ribbons, and explore shapes. Activities change to match the selected grade.'},
 {label:'For parents · See the learning',text:'Parents see supported practice and independent answers separately. Starting-point checks and daily suggestions help choose a next step. Optional encrypted backups can move family progress between devices.'},
 {label:'Your family · $4.99 a month',text:'Open the parent space to subscribe for four dollars and ninety-nine cents a month. Membership renews monthly until you cancel through Stripe.'},
].map((s,i)=>({...s,from:i*300,frames:300}));
export const TOUR_FRAMES=3600;
