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
export const SPANISH_TOUR_STEPS=[
 ['Lectura · Escucha las sílabas','Bienvenidos a la sala de lectura. Theo explica una idea a la vez. Escucha las sílabas ma y pa. Mira las letras y une las dos partes.'],
 ['Lectura · Une y lee','Ma y pa forman mapa. Leemos de izquierda a derecha. La palabra tiene dos sílabas. La lectura en español practica sus propios sonidos, sílabas, letras y tildes.'],
 ['Lectura · Prueba algo nuevo','Escucha, construye y lee. Después practica con una palabra nueva. Puedes repetir las instrucciones o elegir una voz más lenta para tener tiempo de pensar.'],
 ['Matemáticas · Construye el problema','En el estudio de matemáticas vemos ocho más cinco. Ocho fichas azules y cinco doradas representan las cantidades. Primero escuchamos la explicación de Theo.'],
 ['Matemáticas · Forma una decena','A ocho le faltan dos para llegar a diez. Movemos dos fichas doradas a los espacios vacíos. Quedan tres fichas doradas. La imagen ayuda a entender la estrategia.'],
 ['Matemáticas · Explica la respuesta','Diez más tres son trece. Theo explica los pasos antes de que tu hijo pruebe un problema nuevo. Las pistas ayudan a aprender de un error.'],
 ['Explora · Grados 1 a 3','Kid Genius World reúne matemáticas y lectura para primero, segundo y tercer grado. La familia puede elegir un nivel diferente para cada materia y cambiar entre inglés y español.'],
 ['Explora · Una biblioteca amplia','Cada idioma ofrece mil trescientas veinte actividades: cuarenta en cada sección por grado. La lectura en español tiene su propio currículo. El historial evita repetir preguntas ya presentadas.'],
 ['Explora · Lee y crea','El laboratorio de Theo incluye veinticuatro libros en español, sonidos, escritura de palabras, dictado y textos propios. Las instrucciones escritas acompañan la voz del tutor.'],
 ['Explora · Aprende construyendo','Las misiones permiten cambiar unidades por decenas, contar monedas, poner relojes en hora, medir y explorar figuras. Las tareas corresponden al grado seleccionado.'],
 ['Para familias · Observa el aprendizaje','La familia ve por separado la práctica con apoyo y las respuestas independientes. Las actividades iniciales y el plan diario ayudan a elegir el siguiente paso. Las copias privadas guardan el progreso.'],
 ['Tu familia · 4,99 dólares al mes','Abre el espacio para familias para suscribirte por cuatro dólares con noventa y nueve centavos al mes. La suscripción se renueva cada mes hasta que la canceles mediante Stripe.']
].map(([label,text],i)=>({label,text,from:i*300,frames:300}));
export const tourSteps=(locale:'en'|'es')=>locale==='es'?SPANISH_TOUR_STEPS:TOUR_STEPS;
