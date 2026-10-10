from pathlib import Path
import json
root=Path(__file__).resolve().parents[1];p=root/'src/translations.json';d=json.loads(p.read_text(encoding='utf-8'))
for key in d:
 if any(c in key for c in '¿¡ñáéíóúüÑÁÉÍÓÚÜ'):d[key]=key
d.update({
 'Kid Genius':'Kid Genius','World':'World','Kid Genius World':'Kid Genius World','Theo':'Theo',
 'Hello, Explorer.':'Hola, explorador.','Hello,':'Hola,','Explorer':'explorador','HELLO, EXPLORER.':'HOLA, EXPLORADOR.',
 'Math Studio':'Estudio de matemáticas','Reading Room':'Sala de lectura','Math':'Matemáticas','math':'matemáticas','Reading':'Lectura','reading':'lectura','My lessons':'Mis actividades','My studio':'Mi estudio','For parents':'Para familias','Theo’s lab':'Laboratorio de Theo','All':'Todas',
 'Grade':'Grado','Grade 1':'Grado 1','Grade 2':'Grado 2','Grade 3':'Grado 3','Grade ${0}':'Grado ${0}',
 'Addition and subtraction':'Suma y resta','Place value':'Valor posicional','Equal groups':'Grupos iguales','Measurement, money and time':'Medición, dinero y tiempo','Shapes and data':'Figuras y datos',
 'Sounds and Listening':'Sonidos y escucha','Phonics and Word Patterns':'Fonética y patrones de palabras','Spelling and Sentence Building':'Ortografía y construcción de oraciones','Language and Vocabulary':'Lengua y vocabulario','Stories and Comprehension':'Cuentos y comprensión','Fluency and Read-along':'Fluidez y lectura acompañada',
 'Hear directions':'Escucha las instrucciones','Hear Theo':'Escucha a Theo','Hear the word':'Escucha la palabra','Hear the clue':'Escucha la pista','Hear this idea':'Escucha esta idea','Read together':'Leer juntos','Tap here first.':'Pulsa aquí primero.','Theo will tell you what to do.':'Theo te explicará qué hacer.','Slower voice':'Voz más lenta','Slower':'Más lento','Stop voice':'Detener la voz','Stop':'Detener','Help me':'Ayúdame','Try together':'Probar juntos','Practice':'Practicar','Watch':'Observar','Independent check':'Comprobación independiente','Next':'Siguiente','Listen':'Escucha','Look at the spelling':'Observa cómo se escribe','Read it together':'Lee conmigo','Read together':'Leer juntos','Think it through':'Piensa paso a paso','See how it works':'Mira cómo se hace','Look at the problem':'Observa el problema','Try a strategy':'Prueba una estrategia','Think about the question':'Piensa en la pregunta','Find a clue':'Busca una pista','Listen together':'Escuchar juntos',' · continued':' · continuación',
 'ones':'unidades','tens':'decenas','hundreds':'centenas','one':'uno','ten':'diez','hundred':'cien','ones.':'unidades.','tens.':'decenas.','${0} ones':'${0} unidades','${0} tens':'${0} decenas','${0} hundreds':'${0} centenas','${0} ones.':'${0} unidades.','${0} tens.':'${0} decenas.','Ten ones have the same value as one ten.':'Diez unidades tienen el mismo valor que una decena.',
 'True':'Verdadero','False':'Falso','More':'Más','Fewer':'Menos','Equal':'Igual','Greater':'Mayor','Less':'Menor','Triangle':'Triángulo','Square':'Cuadrado','Rectangle':'Rectángulo','Circle':'Círculo','Pentagon':'Pentágono','Hexagon':'Hexágono','triangle':'triángulo','square':'cuadrado','rectangle':'rectángulo','circle':'círculo','pentagon':'pentágono','hexagon':'hexágono','halves':'mitades','thirds':'tercios','fourths':'cuartos','a half':'una mitad','one half':'una mitad','one fourth':'un cuarto','two fourths':'dos cuartos','three fourths':'tres cuartos','units':'unidades','square units':'unidades cuadradas','centimeters':'centímetros','inches':'pulgadas','cents':'centavos','grams':'gramos','dollars':'dólares','tiles':'baldosas','penny':'moneda de 1 centavo','nickel':'moneda de 5 centavos','dime':'moneda de 10 centavos','quarter':'moneda de 25 centavos',
 'Independent':'Independiente','Retained':'Recordado','Practiced':'Practicado','Learning':'Aprendiendo','Supported':'Con apoyo','New':'Nuevo','Ready':'Listo','Getting started':'Comenzando','Not started':'Sin comenzar',
 'Take a tour':'Conoce el estudio','Take a tour with Theo.':'Conoce el estudio con Theo.','Play narrated tour':'Ver el recorrido con voz','Pause tour':'Pausar el recorrido','Close tour':'Cerrar el recorrido','MEET YOUR FAMILY’S LEARNING STUDIO':'EL ESTUDIO DE APRENDIZAJE DE TU FAMILIA','Your family’s learning':'El aprendizaje de tu familia','Your family’s learning studio':'El estudio de aprendizaje de tu familia','/ month':'/ mes','$4.99 / month':'4,99 USD / mes','Cancel through Stripe':'Cancela mediante Stripe','Open parent space':'Abrir el espacio para familias','Subscribe for $4.99/month':'Suscribirse por 4,99 USD al mes','First payment at checkout. Renews monthly until cancellation.':'El primer pago se realiza al suscribirte. Se renueva cada mes hasta que lo canceles.',
 'A space for grown-ups.':'Un espacio para adultos.','I’m the parent or grown-up.':'Soy el padre, la madre o un adulto responsable.','All three grades, every learning studio, Theo’s spoken guidance, and parent progress tools. Four learner profiles per family.':'Los tres grados, todos los estudios, la guía de voz de Theo y las herramientas de progreso para familias. Cuatro perfiles infantiles por familia.',
 'Choose a stronger password.':'Elige una contraseña más segura.','This email already has an account. Sign in instead.':'Este correo ya tiene una cuenta. Inicia sesión.','Sign-in was closed. Try again when you are ready.':'Se cerró el inicio de sesión. Vuelve a intentarlo cuando quieras.','Please wait a moment before trying again.':'Espera un momento antes de volver a intentarlo.','We could not sign you in. Check your email and password, then try again.':'No pudimos iniciar sesión. Revisa tu correo y contraseña y vuelve a intentarlo.',
 'An on-device voice-recognition pack for the selected language is not ready. Use the word practice below.':'Este dispositivo no tiene preparado el reconocimiento de voz para el idioma elegido. Usa la práctica de palabras de abajo.',
 'Your turn will use a new problem.':'Ahora probarás un problema nuevo.','Your next task.':'Tu próxima tarea.','Nice thinking.':'¡Qué bien lo pensaste!','You worked it out. Nice thinking!':'¡Lo resolviste! ¡Qué bien lo pensaste!','Let’s work through this together.':'Vamos a resolverlo juntos.','Press Play. I’ll explain each step.':'Pulsa Reproducir. Te explicaré cada paso.',
 'Open earlier app and account (English)':'Abrir la aplicación y la cuenta anteriores (en inglés)',
 'related lesson activities':'actividades relacionadas','/ ${0} activities':'/ ${0} actividades',
 'One fourth':'Un cuarto','Two fourths':'Dos cuartos','Three fourths':'Tres cuartos','One half':'Una mitad','One third':'Un tercio','Two thirds':'Dos tercios',
 'Which is greater: ${0} or ${1}?':'¿Cuál es mayor: ${0} o ${1}?','Which shape has ${0} sides?':'¿Qué figura tiene ${0} lados?',
 '${0} × ${1} = ${2} square units.':'${0} × ${1} = ${2} unidades cuadradas.',
 '${0} tens = ${1} hundreds.':'${0} decenas = ${1} centenas.',
 'Two equal groups make ${0}.':'Dos grupos iguales forman ${0}.',
 '${0} rows of ${1}: ${2}.':'${0} filas de ${1}: ${2}.','${0} columns of ${1}: ${2}.':'${0} columnas de ${1}: ${2}.',
 '___ + ${0} = ${1}. What is the tens value?':'___ + ${0} = ${1}. ¿Cuál es el valor de las decenas?',
 '___ − ${0} = ${1}. What is missing?':'___ − ${0} = ${1}. ¿Qué número falta?',
 '${0} + ${1} = ${2} grams.':'${0} + ${1} = ${2} gramos.','${0} + ${1} = ${2} liters.':'${0} + ${1} = ${2} litros.',
 'This rhombus is a quadrilateral: it has four straight sides. Its defining clue is four equal sides with no right angles.':'Este rombo es un cuadrilátero: tiene cuatro lados rectos. Tiene cuatro lados iguales y ningún ángulo recto.',
 'Cube: Six square faces.':'Cubo: seis caras cuadradas.',
 'A square is also a rectangle and a rhombus; square is its most specific name here.':'Un cuadrado también es un rectángulo y un rombo; cuadrado es el nombre más específico aquí.',
 'Which is the most specific name for the shape with ${0} sides${1}?':'¿Cuál es el nombre más específico de la figura de ${0} lados${1}?',
 'What is the tens value?':'¿Cuál es el valor de las decenas?','What is missing?':'¿Qué número falta?','square':'cuadrado',
 'Blue':'Azul','Gold':'Dorado','Coral':'Coral','blue':'azul','gold':'dorado','coral':'coral','liters':'litros',
 'Start math':'Empezar matemáticas','Start reading':'Empezar a leer','· Letters. Sounds. A bigger world.':'· Letras. Sonidos. Un mundo más grande.',
 'Letters. Sounds. A bigger world.':'Letras. Sonidos. Un mundo más grande.','Math learning grade':'Grado de matemáticas','Reading learning grade':'Grado de lectura',
 'Kid Genius World home':'Inicio de Kid Genius World','Theo your tutor':'Theo, tu tutor','Theo, your friendly bear tutor in a blue apron':'Theo, tu oso tutor con delantal azul',
 'A handmade pop-up storybook and spelling tiles':'Un libro desplegable y fichas para escribir palabras',
 'Let’s try it together.':'Vamos a probarlo juntos.','Tour chapters':'Capítulos del recorrido',' · Cancel through Stripe':' · Cancela mediante Stripe',
 'ma · pa':'ma · pa','ma + pa → mapa':'ma + pa → mapa','Escucha. Construye. Lee.':'Escucha. Construye. Lee.',
 'Escucha las sílabas. Mira las letras.':'Escucha las sílabas. Mira las letras.','Unimos ma y pa. Mapa tiene dos sílabas.':'Unimos ma y pa. Mapa tiene dos sílabas.',
 'Ahora prueba otra palabra. Theo te ayuda cuando lo necesites.':'Ahora prueba otra palabra. Theo te ayuda cuando lo necesites.',
 'KID GENIUS WORLD ·':'KID GENIUS WORLD ·','KID GENIUS WORLD':'KID GENIUS WORLD',
 'Stripe handles card details. Existing active memberships unlock this studio; there is no second subscription to buy.':'Stripe gestiona los datos de tu tarjeta. Si ya tienes una suscripción activa, puedes acceder a este estudio sin comprar otra.',
 'Your first payment is due at checkout. The membership renews monthly until you cancel. Cancel in the Stripe billing portal; access continues to the end of your paid period.':'El primer pago se realiza al suscribirte. La suscripción se renueva cada mes hasta que la canceles. Puedes cancelar en el portal de Stripe y conservar el acceso hasta el final del período pagado.',
 'Parent email':'Correo del adulto','Signed in as':'Sesión iniciada como','Membership active':'Suscripción activa','Owner access':'Acceso del propietario','Current paid period ends ${0}.':'El período pagado termina el ${0}.',
 'Make a ten. See the answer.':'Forma una decena. Descubre la respuesta.','Build the numbers with counters.':'Construye las cantidades con fichas.','Use two of the five to fill the first ten frame.':'Usa dos de las cinco fichas para completar la primera decena.','Explain the strategy. Then try a fresh problem.':'Explica la estrategia. Después prueba un problema nuevo.',
 'Try a few questions with me. It is okay if you are not sure. We will find a good first lesson for you.':'Prueba unas preguntas conmigo. No pasa nada si no sabes la respuesta. Buscaremos una buena actividad para comenzar.',
 'Wooden numbers, counting counters and geometric blocks':'Números de madera, fichas para contar y bloques geométricos',
 'The sound workshop':'El taller de sonidos','Block exchange':'Intercambio de bloques','Story-time clock':'El reloj del cuento','Ribbon workshop':'El taller de cintas','Theo’s seed shop':'La tienda de semillas de Theo','The tile tray':'La bandeja de baldosas','Tile the studio':'Coloca baldosas en el estudio','Snack shares':'Repartimos la merienda','Garden parcel':'El paquete del jardín'
})
d.update({
 'Add within 10':'Sumar hasta 10','Add within 20':'Sumar hasta 20','Add within 1000':'Sumar hasta 1000',
 'Make a ten':'Formar una decena','Take away within 10':'Restar hasta 10','Addition stories':'Problemas de suma','Subtraction stories':'Problemas de resta','Compare story quantities':'Comparar cantidades en un problema',
 'One more and one less':'Uno más y uno menos','Tell time to the hour':'Leer la hora en punto','Tell time to the half hour':'Leer la hora y media',
 'Build rectangular arrays':'Organizar objetos en filas y columnas','Equal groups and arrays':'Grupos iguales, filas y columnas','Measure in centimeters':'Medir en centímetros','Time to five minutes':'Leer el reloj de cinco en cinco minutos','Money story problems':'Problemas con dinero','Measure a story length':'Problemas de longitud',
 'Time to the minute':'Leer la hora al minuto','Scaled bar graphs':'Gráficos de barras con escala',
 'Count on one':'Avanzar uno','Count on two':'Avanzar dos','Count on three':'Avanzar tres','Count back one':'Retroceder uno','Count back two':'Retroceder dos','Count back three':'Retroceder tres','Double a number':'El doble de un número','Use a near double':'Usar un doble cercano','Add zero':'Sumar cero',
 'Balance two additions':'Igualar dos sumas','Make ten, then add':'Formar una decena y después sumar','Choose a story equation':'Elegir la ecuación de un problema',
 'Counter collections to ten':'Colecciones de fichas hasta diez','Counter collections to twenty':'Colecciones de fichas hasta veinte','Counting trail to 120':'Camino de números hasta 120','Check a counting claim':'Comprobar una afirmación de conteo','Compare teen numbers':'Comparar números del 11 al 19','Numbers across a new ten':'Cruzar a la siguiente decena','One ten and extra ones':'Una decena y unidades sueltas','Numbers with no extra ones':'Decenas sin unidades sueltas','Find a missing place':'Encontrar el valor posicional que falta','Explain how you know':'Explicar cómo lo sabes',
 'Find the next time':'Encontrar la hora siguiente','Find the time before':'Encontrar la hora anterior','Shape detective':'Detective de figuras','straight sides':'lados rectos','solid shapes':'cuerpos geométricos','Share a snack in halves':'Repartir la merienda en mitades','Share a snack in fourths':'Repartir la merienda en cuartos',
 'Hundreds in the block shop':'Centenas en el taller de bloques','Numbers with a zero place':'Números con un cero en una posición','Compare three-digit builds':'Comparar números de tres cifras','Count five at a time':'Contar de cinco en cinco','Count ten at a time':'Contar de diez en diez','Count hundred at a time':'Contar de cien en cien','A hundred more or less':'Cien más o cien menos','Exchange ones to add':'Cambiar unidades por decenas para sumar','Two-step workshop stories':'Problemas del taller de dos pasos','Check an equal-group claim':'Comprobar una afirmación sobre grupos iguales','Match repeated additions':'Relacionar sumas repetidas',
 'Ruler starts away from zero':'Medir con una regla sin comenzar en cero','Quarter and penny market':'Mercado de monedas de 25 y 1 centavo','Market':'Mercado','count the change':'contar el cambio','Solid-shape detective':'Detective de cuerpos geométricos',
 '${0}-group garden':'Jardín de ${0} grupos','Add two-digit workshop amounts':'Sumar cantidades de dos cifras','Subtract two-digit workshop amounts':'Restar cantidades de dos cifras','Add three-digit workshop amounts':'Sumar cantidades de tres cifras','Subtract three-digit workshop amounts':'Restar cantidades de tres cifras','Two-step supply stories':'Problemas de materiales de dos pasos','Locate or compare shares':'Ubicar o comparar partes iguales','Check a fraction claim':'Comprobar una afirmación sobre fracciones','Equivalent-share kitchen':'Partes equivalentes en la cocina','Fractions past one whole':'Fracciones mayores que un entero','Tile an area':'Cubrir un área con baldosas','Elapsed-time trail':'Camino del tiempo transcurrido',
 'Picture graph':'Gráfico de dibujos','groups of five':'grupos de cinco','Scaled bars':'Barras con escala','Pattern detective':'Detective de patrones','threes':'de tres en tres','fours':'de cuatro en cuatro','sixes':'de seis en seis','Picnic':'Merienda','how many joined?':'¿cuántos se sumaron?','Workshop':'Taller','how many were used?':'¿cuántos se usaron?','Garden':'Jardín','find the smaller group':'encontrar el grupo más pequeño',
 'Check a comparison':'Comprobar una comparación','Match the minute hand':'Relacionar el minutero','Choose a fair measuring method':'Elegir cómo medir correctamente','Write expanded form':'Escribir la forma desarrollada','Find a digit value':'Encontrar el valor de una cifra','Find an unknown number':'Encontrar el número que falta','Find the unknown':'Encontrar lo que falta','Multiplication stories':'Problemas de multiplicación','Division stories':'Problemas de división'
})
d.update({'Hear choice ${0}':'Escuchar la opción ${0}','Theo is speaking…':'Theo está hablando…','Pause example':'Pausar el ejemplo','LET’S TRY TOGETHER':'PROBEMOS JUNTOS','Subject':'Materia','Let’s begin':'Comencemos','Watch, try together, then show what you know.':'Observa, prueba conmigo y después muestra lo que aprendiste.','Choose an area, or explore below.':'Elige un área o explora las actividades de abajo.'})
d.update({
 'counters':'fichas','blue counters and':'fichas azules y','gold counters. There are ten spaces.':'fichas doradas. Hay diez espacios.','Remove one counter':'Quitar una ficha','Add one counter':'Añadir una ficha','${0} counters':'${0} fichas','${0} counter':'${0} ficha',
 'Count each counter once. There are ${0} counters.':'Cuenta cada ficha una vez. Hay ${0} fichas.',
 '${0} counters go in groups of ${1}. How many groups?':'Organiza ${0} fichas en grupos de ${1}. ¿Cuántos grupos hay?',
 'Share ${0} counters equally into ${1} groups. How many in each group?':'Reparte ${0} fichas por igual en ${1} grupos. ¿Cuántas hay en cada grupo?',
 'Pair the counters. One remains, so the number is odd.':'Forma pares de fichas. Sobra una, así que el número es impar.',
 'All counters can be paired, so the number is even.':'Todas las fichas forman pares, así que el número es par.',
 'Touch every counter once. There are ${0}.':'Toca cada ficha una vez. Hay ${0}.',
 'There are ${0} counters. Add one. How many now?':'Hay ${0} fichas. Añade una. ¿Cuántas hay ahora?',
 'There are ${0} counters. Remove one. How many remain?':'Hay ${0} fichas. Quita una. ¿Cuántas quedan?',
 'There were ${0} counters. ${1} are covered. How many are not covered?':'Había ${0} fichas. Hay ${1} tapadas. ¿Cuántas están sin tapar?',
 'The collection has ${0} counters.':'La colección tiene ${0} fichas.',
 'Count once for every counter. The total is ${0}.':'Cuenta cada ficha una vez. El total es ${0}.',
 'The mat has ${0} equal ${1} and ${2} counters. Count one ${3}. How many in it?':'El tapete tiene ${0} ${1} iguales y ${2} fichas. Cuenta las fichas de una ${3}. ¿Cuántas hay?',
 'There are ${0} counters, ${1} in each ${2}. Count the ${3}. How many?':'Hay ${0} fichas, con ${1} en cada ${2}. Cuenta las ${3}. ¿Cuántas hay?',
 'Which repeated addition counts all the counters by ${0}?':'¿Qué suma repetida cuenta todas las fichas por ${0}?',
 '${0} equal ${1} of ${2} contain ${3} counters.':'Hay ${0} ${1} iguales con ${2} fichas en cada una. En total hay ${3} fichas.',
 'Pair ${0} counters. Is the total odd or even?':'Forma pares con ${0} fichas. ¿El total es par o impar?',
 '${0} pairs leave ${1} counter.':'Con ${0} pares, sobra ${1} ficha.',
 'How many complete pairs can you make from ${0} counters?':'¿Cuántos pares completos puedes formar con ${0} fichas?',
 'Pair ${0} counters. How many remain unpaired?':'Forma pares con ${0} fichas. ¿Cuántas quedan sin pareja?',
 'Theo pairs ${0} counters and says ${1} remain. How many actually remain?':'Theo forma pares con ${0} fichas y dice que sobran ${1}. ¿Cuántas sobran realmente?',
 'Which equation describes ${0} counters paired as far as possible?':'¿Qué ecuación representa ${0} fichas organizadas en todos los pares posibles?'
})
d.update({'ruler':'regla','teen':'del 11 al 19','shares':'partes iguales',
 'Teen numbers have one ten. Compare the ones to decide which is greater.':'Los números del 11 al 19 tienen una decena. Compara las unidades para saber cuál es mayor.',
 'Subtract the starting mark from the ending mark. A ruler need not start at zero.':'Resta la marca inicial de la marca final. Puedes medir con una regla sin comenzar en cero.',
 'The whole has equal shares. What do we call the selected shares?':'El entero tiene partes iguales. ¿Cómo llamamos a las partes seleccionadas?',
 'The whole is divided into equal shares. What do we call the selected shares?':'El entero se divide en partes iguales. ¿Cómo llamamos a las partes seleccionadas?',
 'Two equal shares of one whole are halves. Count how many shares are chosen.':'Dos partes iguales de un entero son mitades. Cuenta las partes seleccionadas.',
 'Three equal shares of one whole are thirds. Count chosen shares and all shares.':'Tres partes iguales de un entero son tercios. Cuenta las partes seleccionadas y todas las partes.',
 'There are ${0} equal shares. ${1} ${2} selected.':'Hay ${0} partes iguales. Partes seleccionadas: ${1}.',
 'How many equal shares are selected?':'¿Cuántas partes iguales están seleccionadas?',
 'There are ${0} equal shares. ${1} are not selected. How many are selected?':'Hay ${0} partes iguales. Hay ${1} sin seleccionar. ¿Cuántas están seleccionadas?',
 '${0} − ${1} = ${2} selected shares.':'${0} − ${1} = ${2} partes seleccionadas.',
 'There are ${0} selected shares.':'Hay ${0} partes seleccionadas.',
 'Count ${0} selected shares out of ${1} equal shares.':'Cuenta ${0} partes seleccionadas de un total de ${1} partes iguales.',
 '${0} selected shares of ${1} equal shares in one whole':'${0} partes seleccionadas de ${1} partes iguales de un entero',
 'Shapes, arrays and equal shares':'Figuras, filas, columnas y partes iguales'
})
d.update({'How many ${0} are in ${1}?':'¿Cuántas ${0} hay en ${1}?','Measurement money and time':'Medición, dinero y tiempo','Hundreds tens and ones':'Centenas, decenas y unidades'})
d['${0} counter${1}']='${0} ficha${1}'
for key in d:d[key]=d[key].replace('¿Cuantos','¿Cuántos').replace('¿Cuantas','¿Cuántas')
d={' '.join(key.split()):value for key,value in d.items()}
# Keep placeholders intact; mathematical notation must not be translated into a different operation.
for key,value in d.items():
 if key.startswith('ZXQ') or 'ZXQ' in value:raise ValueError('Unresolved translation marker')
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Reviewed core learning, navigation, math units and voice labels')
