// ============================================================
// PACK DE VOCABULARIO B2 (APTIS / CAMBRIDGE)
// ============================================================
//
// Formato de cada línea:
//   english | traducción 1; traducción 2; ...
//
// - La primera traducción es la que se muestra cuando
//   se juega de español a inglés.
// - "o/a" acepta masculino y femenino (rubio/a → rubio, rubia).
// - Lo que va entre paréntesis es opcional al responder.
//
// Los 7 primeros temas proceden de la lista de vocabulario
// Aptis de Language College (languagecollege.es/vocabulario-aptis),
// revisada y corregida. El resto es vocabulario B2 adicional.
// ============================================================

export type PackWord = {
  english: string;
  translations: string[];
  categories: string[];
};

export type PackCategory = {
  name: string;
  description: string;
  source: "aptis" | "b2";
  words: { english: string; translations: string[] }[];
};

type RawCategory = {
  name: string;
  description: string;
  source: "aptis" | "b2";
  data: string;
};

const RAW: RawCategory[] = [
  // ==========================================================
  // TEMAS APTIS (Language College)
  // ==========================================================
  {
    name: "Comida",
    description: "Frutas, verduras, platos y condimentos",
    source: "aptis",
    data: `
apple | manzana
banana | plátano; banana
orange | naranja
pear | pera
strawberry | fresa
grapes | uvas
watermelon | sandía
pineapple | piña
peach | melocotón; durazno
lemon | limón
lime | lima
avocado | aguacate
tomato | tomate
potato | patata; papa
onion | cebolla
garlic | ajo
carrot | zanahoria
lettuce | lechuga
cucumber | pepino
bell pepper | pimiento
broccoli | brócoli
cauliflower | coliflor
spinach | espinacas; espinaca
kale | col rizada
cabbage | repollo; col
mushroom | champiñón; seta
corn | maíz
peas | guisantes; arvejas
green beans | judías verdes
aubergine | berenjena
eggplant | berenjena
courgette | calabacín
zucchini | calabacín
pumpkin | calabaza
sweet potato | boniato; batata; camote
rice | arroz
bread | pan
roll | panecillo
bun | bollo
pancake | tortita; panqueque; crepe
waffle | gofre
oatmeal | avena; gachas de avena
yogurt | yogur
milk | leche
butter | mantequilla
cheese | queso
egg | huevo
bacon | beicon; tocino; panceta
sausage | salchicha
ham | jamón
chicken | pollo; gallina
beef | carne de ternera; ternera; carne de res
pork | carne de cerdo; cerdo
fish | pescado; pez
prawn | gamba; langostino
shrimp | gamba; camarón
tuna | atún
crab | cangrejo
lobster | langosta; bogavante
steak | filete; bistec
roast | asado
soup | sopa
salad | ensalada
sandwich | sándwich; bocadillo
burger | hamburguesa
stir-fry | salteado
casserole | guiso; cazuela
stew | estofado; guiso
gravy | salsa de carne
sauce | salsa
dressing | aliño; aderezo
mayonnaise | mayonesa
mustard | mostaza
soy sauce | salsa de soja
olive oil | aceite de oliva
vinegar | vinagre
salt | sal
pepper | pimienta
sugar | azúcar
honey | miel
maple syrup | sirope de arce
vanilla | vainilla
cinnamon | canela
nutmeg | nuez moscada
ginger | jengibre
garlic powder | ajo en polvo
`,
  },
  {
    name: "Animales y mascotas",
    description: "Animales, accesorios y cuidado de mascotas",
    source: "aptis",
    data: `
dog | perro
cat | gato
bird | pájaro; ave
rabbit | conejo
horse | caballo
cow | vaca
pig | cerdo
sheep | oveja
duck | pato
turtle | tortuga
snake | serpiente
parrot | loro
guinea pig | cobaya; conejillo de indias
leash | correa
lead | correa
bowl | cuenco; comedero
water bottle | bebedero; botella de agua
toys | juguetes
scratching post | rascador
cage | jaula
aquarium | acuario
terrarium | terrario
carrier | transportín
grooming | aseo; peluquería
feeding | alimentación
hygiene | higiene
exercise | ejercicio; hacer ejercicio
training | entrenamiento; adiestramiento; formación
vet | veterinario/a
vet visit | visita al veterinario
checkup | revisión; chequeo
vaccination | vacunación
pet insurance | seguro para mascotas
groomer | peluquero/a canino/a
pet sitter | cuidador/a de mascotas
animal rescue | rescate de animales
animal shelter | refugio de animales; protectora de animales
adoption | adopción
neutering | castración; esterilización
animal behaviour | comportamiento animal
breed | raza; criar
pet | mascota; acariciar
snuggle | acurrucarse
bark | ladrar; ladrido
meow | maullar; maullido
domestic | doméstico/a
wild | salvaje
fur | pelaje; pelo
feathers | plumas
scales | escamas
claws | garras; uñas
snout | hocico
paws | patas
tail | cola
take care of a pet | cuidar de una mascota; cuidar una mascota
walk the dog | sacar a pasear al perro; pasear al perro
the pet escaped | la mascota se escapó
take the pet to the vet | llevar la mascota al veterinario
`,
  },
  {
    name: "Tiempo libre",
    description: "Deportes, aficiones y actividades de ocio",
    source: "aptis",
    data: `
running | correr; running
swimming | natación; nadar
cycling | ciclismo; ir en bicicleta
hiking | senderismo; hacer senderismo
table tennis | tenis de mesa; ping-pong
bowling | bolos
boxing | boxeo
martial arts | artes marciales
skiing | esquí; esquiar
surfing | surf; surfear
scuba diving | buceo; bucear
football | fútbol
basketball | baloncesto
volleyball | voleibol
baseball | béisbol
American football | fútbol americano
water polo | waterpolo
handball | balonmano
camping | acampada; acampar; ir de camping
fishing | pesca; pescar
hunting | caza; cazar
gardening | jardinería
having a picnic | hacer un picnic; ir de picnic
backpacking | viajar de mochilero; viajar con mochila
mountaineering | montañismo; alpinismo
rock climbing | escalada en roca; escalada
caving | espeleología
birdwatching | observación de aves; observar aves
horse riding | equitación; montar a caballo
sailing | vela; navegar
canoeing | piragüismo
snorkelling | buceo con tubo; snorkel
playing video games | jugar a videojuegos; jugar a los videojuegos
watching TV | ver la televisión; ver la tele
listening to music | escuchar música
playing an instrument | tocar un instrumento
dancing | bailar; baile
cooking | cocinar; cocina
baking | hornear; repostería
crafts | manualidades
playing board games | jugar a juegos de mesa
playing cards | jugar a las cartas
jigsaw puzzle | puzle; rompecabezas
drawing | dibujar; dibujo
painting | pintar; pintura
learning a new language | aprender un nuevo idioma; aprender un idioma nuevo
going to the museum | ir al museo
going to the theatre | ir al teatro
going to the cinema | ir al cine
going to a concert | ir a un concierto
visiting a historical site | visitar un lugar histórico; visitar un sitio histórico
attending a cultural event | asistir a un evento cultural
visiting an art gallery | visitar una galería de arte
book club | club de lectura
volunteering | voluntariado; hacer voluntariado
travelling | viajar
socialising | socializar; relacionarse
going out | salir
spending time with family and friends | pasar tiempo con la familia y los amigos; pasar tiempo con la familia y amigos
relaxing | relajarse
taking a break | tomar un descanso; descansar
having fun | divertirse; pasarlo bien
taking a class | ir a clase; tomar una clase
attending a workshop | asistir a un taller
donating to charity | donar a una organización benéfica; donar a la beneficencia
`,
  },
  {
    name: "Descripciones",
    description: "Aspecto físico, carácter y estados de ánimo",
    source: "aptis",
    data: `
blonde | rubio/a
dark-haired | moreno/a
redhead | pelirrojo/a
grey-haired | canoso/a
bald | calvo/a
tall | alto/a
short | bajo/a; corto/a
average height | de estatura media; de altura media
slim | delgado/a
chubby | regordete; gordito/a
thin | delgado/a; fino/a
muscular | musculoso/a
plump | rellenito/a; regordete
petite | menudo/a
overweight | con sobrepeso; gordo/a
round-faced | de cara redonda
square-faced | de cara cuadrada
oval-faced | de cara ovalada
pale | pálido/a
dark-skinned | de piel oscura
fair-skinned | de piel clara
freckles | pecas
freckled | pecoso/a
curly | rizado; rizo
straight | liso; recto
wavy | ondulado
long | largo/a
hazel | color avellana; avellana
wrinkled | arrugado/a
wrinkles | arrugas
smooth | suave; liso/a
rough | áspero/a; duro/a
beard | barba
moustache | bigote
good-looking | guapo/a; atractivo/a
handsome | guapo; atractivo
pretty | guapa; bonito/a
cute | mono/a; lindo/a
ugly | feo/a
average-looking | del montón; normal
plain | sencillo/a; poco atractivo/a; normal
elegant | elegante
clumsy | torpe
graceful | elegante; grácil
middle-aged | de mediana edad
elderly | anciano/a; mayor
mature | maduro/a
baby-faced | con cara de niño; con cara de bebé
happy | feliz; contento/a
sad | triste
angry | enfadado/a; enojado/a
excited | emocionado/a; ilusionado/a
bored | aburrido/a
calm | tranquilo/a; calmado/a
`,
  },
  {
    name: "Educación",
    description: "Estudios, centros educativos y vida académica",
    source: "aptis",
    data: `
school | colegio; escuela
secondary school | instituto; escuela secundaria
high school | instituto
university | universidad
college | universidad; facultad; centro de estudios superiores
classroom | aula; clase
lecture hall | aula magna; auditorio; anfiteatro
teacher | profesor/a; maestro/a
lecturer | profesor/a universitario/a
student | estudiante; alumno/a
classmate | compañero/a de clase
tutor | tutor/a; profesor/a particular
mentor | mentor/a
dean | decano/a
headteacher | director/a de colegio; director/a
learning | aprendizaje
degree | carrera; título universitario; grado
major | especialidad; asignatura principal
course | curso
subject | asignatura; tema
curriculum | plan de estudios; currículo
syllabus | temario; programa de estudios
lecture | clase magistral; conferencia
lesson | clase; lección
assignment | trabajo; tarea
project | proyecto
research | investigación; investigar
thesis | tesis
dissertation | trabajo de fin de grado; tesina; tesis doctoral
homework | deberes; tarea
test | examen; prueba
exam | examen
pass an exam | aprobar un examen
fail an exam | suspender un examen
resit | recuperación; repetir un examen
mark | nota
grade | nota; calificación; curso
textbook | libro de texto
field trip | excursión; salida escolar
internship | prácticas; prácticas en empresa
scholarship | beca
grant | beca; subvención; conceder
study group | grupo de estudio
academic | académico/a
extracurricular activities | actividades extraescolares
graduation | graduación
transcript | expediente académico
revise | repasar; estudiar
cheat | copiar; hacer trampa
term | trimestre; semestre; término
timetable | horario
tuition fees | matrícula; tasas universitarias
`,
  },
  {
    name: "Cine",
    description: "Géneros, rodaje y mundo del cine",
    source: "aptis",
    data: `
action film | película de acción
adventure film | película de aventuras
animated film | película de animación; película animada
biopic | película biográfica
comedy | comedia
crime film | película policíaca; película de crimen
documentary | documental
fantasy film | película de fantasía
horror film | película de terror
historical film | película histórica
mystery film | película de misterio
romantic film | película romántica
science fiction film | película de ciencia ficción
thriller | película de suspense; thriller
war film | película bélica; película de guerra
western | película del oeste; western
actress | actriz
cast | reparto
character | personaje; carácter
dialogue | diálogo
genre | género
plot | argumento; trama
scene | escena
script | guion
soundtrack | banda sonora
special effects | efectos especiales
stunt | escena de riesgo; acrobacia
title | título
box office | taquilla
budget | presupuesto
distributor | distribuidora
filming | rodaje; filmación
independent film | película independiente; cine independiente
producer | productor/a
release date | fecha de estreno
the Oscars | los premios óscar; los óscar
award | premio
blockbuster | éxito de taquilla; taquillazo
cinema | cine
critic | crítico/a
film festival | festival de cine
film noir | cine negro
foreign film | película extranjera
movie theater | sala de cine; cine
review | crítica; reseña; repasar
sequel | secuela
subtitles | subtítulos
screen | pantalla
set | plató; decorado
be set in | estar ambientada en; transcurrir en
starring | protagonizada por
leading role | papel protagonista; papel principal
`,
  },
  {
    name: "El tiempo (clima)",
    description: "Fenómenos meteorológicos y expresiones del tiempo",
    source: "aptis",
    data: `
rain | lluvia; llover
snow | nieve; nevar
sleet | aguanieve
hail | granizo; granizar
drizzle | llovizna; lloviznar
wind | viento
breeze | brisa
gust | ráfaga
gale | vendaval
hurricane | huracán
cloud | nube
sunny | soleado
cloudy | nublado
partly cloudy | parcialmente nublado
overcast | cubierto; encapotado
fog | niebla
foggy | con niebla; neblinoso
thunderstorm | tormenta eléctrica; tormenta
thunder | trueno
lightning | relámpago; rayo
rainbow | arcoíris
hot | caluroso; caliente; calor
warm | cálido; templado
cool | fresco
cold | frío; resfriado
freezing | helado; muy frío; congelado
humid | húmedo
dry | seco
clear | despejado; claro
hazy | brumoso; calimoso
high pressure | altas presiones; alta presión
low pressure | bajas presiones; baja presión
blow | soplar; golpe
it's raining | está lloviendo
it's snowing | está nevando
it's windy | hace viento
it's hot outside | hace calor fuera; hace calor afuera
it's cold today | hoy hace frío; hace frío hoy
sun | sol
storm | tormenta
blizzard | ventisca; tormenta de nieve
frost | escarcha; helada
ice | hielo
mist | neblina
typhoon | tifón
heatwave | ola de calor
thermometer | termómetro
forecast | previsión; pronóstico
weather forecast | previsión del tiempo; el tiempo; pronóstico del tiempo
sunrise | amanecer; salida del sol
sunset | atardecer; puesta de sol
weatherman | hombre del tiempo; presentador del tiempo
meteorologist | meteorólogo/a
front | frente
pressure | presión
degree | grado
season | estación; temporada
winter | invierno
spring | primavera
summer | verano
autumn | otoño
tropics | trópico; trópicos
`,
  },

  // ==========================================================
  // B2: GRAMÁTICA Y USO
  // ==========================================================
  {
    name: "Conectores",
    description: "Linking words para el writing y el speaking",
    source: "b2",
    data: `
however | sin embargo; no obstante
nevertheless | no obstante; sin embargo
although | aunque
even though | aunque; a pesar de que
even if | aunque; incluso si
despite | a pesar de
in spite of | a pesar de
whereas | mientras que
while | mientras; mientras que
on the one hand | por un lado; por una parte
on the other hand | por otro lado; por otra parte
therefore | por lo tanto; por tanto
thus | así; por consiguiente; de este modo
consequently | en consecuencia; por consiguiente
as a result | como resultado; como consecuencia
hence | de ahí; por ello; por eso
because of | debido a; por; a causa de
due to | debido a
owing to | debido a; a causa de
since | ya que; puesto que; desde
as long as | siempre que; siempre y cuando; mientras
provided that | siempre que; siempre y cuando; con tal de que
unless | a menos que; a no ser que
in case | por si; en caso de que
otherwise | de lo contrario; si no
moreover | además
furthermore | además; asimismo
in addition | además
besides | además; aparte de
what's more | es más; además
as well as | así como; además de
firstly | en primer lugar
secondly | en segundo lugar
finally | finalmente; por último
lastly | por último; en último lugar
to begin with | para empezar
in conclusion | en conclusión; para concluir
to sum up | en resumen; resumiendo; para resumir
all in all | en definitiva; en general; con todo
overall | en general; en conjunto
for instance | por ejemplo
for example | por ejemplo
such as | como; tales como
in other words | en otras palabras; es decir
that is to say | es decir; o sea
actually | en realidad; de hecho
in fact | de hecho; en realidad
indeed | de hecho; efectivamente; en efecto
as a matter of fact | de hecho; a decir verdad
apart from | aparte de; además de
instead of | en lugar de; en vez de
rather than | en lugar de; en vez de; más que
so that | para que; de modo que; de manera que
in order to | para; con el fin de; a fin de
so as to | para; con el fin de
as soon as | en cuanto; tan pronto como
meanwhile | mientras tanto; entretanto
eventually | finalmente; al final; con el tiempo
at first | al principio
in the end | al final; finalmente
afterwards | después; más tarde; luego
beforehand | de antemano; antes
nowadays | hoy en día; actualmente; en la actualidad
currently | actualmente; en la actualidad
in my opinion | en mi opinión; a mi parecer
as far as I'm concerned | en lo que a mí respecta; por lo que a mí respecta
as far as I know | que yo sepa
regarding | en cuanto a; respecto a; con respecto a
as for | en cuanto a; respecto a
according to | según; de acuerdo con
similarly | del mismo modo; de forma similar; igualmente
likewise | asimismo; del mismo modo; igualmente
in contrast | en cambio; por el contrario; en contraste
on the contrary | al contrario; por el contrario
unlike | a diferencia de
anyway | de todos modos; en cualquier caso; de todas formas
even so | aun así
after all | al fin y al cabo; después de todo
at least | al menos; por lo menos
above all | sobre todo; ante todo
especially | especialmente; sobre todo
in general | en general; por lo general
whether | si
yet | sin embargo; todavía; aún
still | todavía; aún; aun así
so | así que; por lo que; tan
then | entonces; luego
as | como; ya que; mientras
not only... but also | no solo... sino también
either... or | o... o
neither... nor | ni... ni
in the meantime | mientras tanto; entretanto
by the way | por cierto
of course | por supuesto; claro
as usual | como de costumbre; como siempre
in addition to | además de
whatever | lo que sea; cualquier cosa que
`,
  },
  {
    name: "Phrasal verbs",
    description: "Los phrasal verbs más frecuentes en B2",
    source: "b2",
    data: `
give up | rendirse; dejar de; abandonar; renunciar
give back | devolver
give in | ceder; rendirse
give away | regalar; revelar; delatar
look after | cuidar; cuidar de
look for | buscar
look forward to | tener ganas de; esperar con ilusión; estar deseando
look up | buscar (en un diccionario); consultar
look into | investigar; estudiar; examinar
look down on | menospreciar; despreciar
look up to | admirar
look out | tener cuidado; cuidado
look around | echar un vistazo; mirar alrededor
find out | descubrir; averiguar; enterarse
carry on | continuar; seguir
carry out | llevar a cabo; realizar
get on with | llevarse bien con
get along with | llevarse bien con
get over | superar; recuperarse de
get up | levantarse
get by | arreglárselas; apañárselas
get rid of | deshacerse de; librarse de
get back | volver; regresar; recuperar
get away | escaparse; huir; irse de vacaciones
get together | reunirse; quedar
break down | averiarse; estropearse; venirse abajo
break up | romper; cortar; separarse
break into | entrar a robar; forzar
break out | estallar; escaparse; fugarse
bring up | criar; sacar un tema; mencionar
bring about | provocar; ocasionar; causar
call off | cancelar; suspender
call back | devolver la llamada
come across | encontrarse con; toparse con; dar con
come up with | idear; ocurrirse; proponer
come up | surgir
come back | volver; regresar
come down with | enfermar de; pillar
cut down on | reducir; consumir menos
drop out | abandonar los estudios; abandonar; dejar los estudios
drop by | pasarse por; pasarse
drop off | dejar; quedarse dormido
fall out | pelearse; enfadarse; reñir
fill in | rellenar; cumplimentar
fill up | llenar
go on | continuar; seguir; pasar; ocurrir
go out | salir; apagarse
go over | repasar; revisar
go through | pasar por; atravesar; revisar
go up | subir; aumentar
go down | bajar; disminuir
go off | sonar; explotar; estropearse
go ahead | seguir adelante; adelante
grow up | crecer; criarse
hang out | pasar el rato; quedar
hold on | esperar; aguantar; un momento
hold up | retrasar; atracar
keep up with | seguir el ritmo de; mantenerse al día
keep on | seguir; continuar
let down | decepcionar; fallar
let in | dejar entrar
make up | inventar; inventarse; reconciliarse; maquillarse
make up for | compensar
pass away | fallecer; morir
pass out | desmayarse
pick up | recoger; aprender; coger
point out | señalar; indicar
put off | posponer; aplazar
put up with | aguantar; soportar; tolerar
put on | ponerse
put out | apagar
put away | guardar; recoger
run out of | quedarse sin; acabarse
run into | encontrarse con; toparse con
run away | huir; escaparse
set up | montar; establecer; crear; fundar
set off | salir; ponerse en camino; hacer estallar
show off | presumir; fardar; lucirse
show up | aparecer; presentarse
sort out | solucionar; resolver; arreglar; ordenar
take after | parecerse a; salir a
take up | empezar a practicar; empezar; ocupar
take over | hacerse cargo de; tomar el control de; asumir
take off | despegar; quitarse
take back | devolver; retirar
turn down | rechazar; bajar
turn up | aparecer; subir
turn on | encender
turn off | apagar
turn into | convertirse en; transformarse en
work out | hacer ejercicio; entrenar; resolver; calcular
wake up | despertarse; despertar
throw away | tirar; desechar
try on | probarse
check in | registrarse; facturar
check out | dejar el hotel; echar un vistazo; comprobar
deal with | tratar con; ocuparse de; lidiar con
depend on | depender de
end up | acabar; terminar
figure out | entender; averiguar; descubrir
hand in | entregar
calm down | calmarse; tranquilizarse
cheer up | animar; animarse
catch up | ponerse al día; alcanzar
count on | contar con
fit in | encajar; integrarse
kick off | empezar; comenzar
lay off | despedir
move in | mudarse; instalarse
move out | mudarse; irse
pay back | devolver
pull over | parar; detenerse a un lado
rule out | descartar
save up | ahorrar
settle down | establecerse; sentar la cabeza; calmarse
slow down | ir más despacio; frenar; reducir la velocidad
speak up | hablar más alto; alzar la voz
stand out | destacar; sobresalir
stand for | significar; representar
stand up for | defender
think over | pensar; reflexionar sobre; pensarse
use up | gastar; agotar
warm up | calentar
write down | apuntar; anotar
back up | apoyar; respaldar; hacer una copia de seguridad
blow up | explotar; volar; inflar
mess up | estropear; fastidiar; liar
sign up | apuntarse; inscribirse; registrarse
stay up | quedarse despierto/a; trasnochar
plug in | enchufar
log in | iniciar sesión; entrar
log out | cerrar sesión; salir
`,
  },
  {
    name: "Collocations",
    description: "Combinaciones fijas: make, do, take, have...",
    source: "b2",
    data: `
make a decision | tomar una decisión
make a mistake | cometer un error; equivocarse
make an effort | hacer un esfuerzo; esforzarse
make progress | progresar; hacer progresos
make money | ganar dinero
make friends | hacer amigos
make a complaint | poner una queja; presentar una queja; quejarse
make an appointment | pedir cita; concertar una cita
make sure | asegurarse
make a difference | marcar la diferencia
make a phone call | hacer una llamada
make a living | ganarse la vida
do homework | hacer los deberes; hacer la tarea
do the shopping | hacer la compra
do the washing-up | fregar los platos; lavar los platos
do exercise | hacer ejercicio
do business | hacer negocios
do your best | hacer lo posible; dar lo mejor de ti; esforzarse al máximo
do someone a favour | hacer un favor a alguien; hacer un favor
do research | investigar; hacer una investigación
take a photo | hacer una foto; sacar una foto
take an exam | hacer un examen; presentarse a un examen
take a seat | tomar asiento; sentarse
take part in | participar en; tomar parte en
take place | tener lugar; celebrarse
take advantage of | aprovechar; aprovecharse de
take into account | tener en cuenta
take care of | cuidar de; ocuparse de; encargarse de
take responsibility | asumir la responsabilidad; responsabilizarse
take a risk | correr un riesgo; arriesgarse
have a good time | pasarlo bien; divertirse
have a shower | ducharse; darse una ducha
have an argument | discutir; tener una discusión
pay attention | prestar atención
pay a visit | hacer una visita; visitar
keep in touch | mantenerse en contacto; seguir en contacto
lose weight | perder peso; adelgazar
put on weight | engordar; ganar peso
catch a cold | resfriarse; coger un resfriado
save time | ahorrar tiempo
waste time | perder el tiempo; perder tiempo
break the law | infringir la ley; saltarse la ley
keep a promise | cumplir una promesa
break a promise | romper una promesa; incumplir una promesa
tell the truth | decir la verdad
tell a lie | mentir; decir una mentira
raise awareness | concienciar; sensibilizar
meet a deadline | cumplir un plazo; cumplir con la fecha límite
run a business | dirigir un negocio; llevar un negocio
heavy traffic | tráfico denso; mucho tráfico
heavy rain | lluvia intensa; lluvia fuerte
strong coffee | café cargado; café fuerte
fast food | comida rápida
highly recommended | muy recomendable; muy recomendado
come true | hacerse realidad; cumplirse
`,
  },
  {
    name: "Expresiones e idioms",
    description: "Frases hechas y expresiones habituales",
    source: "b2",
    data: `
a piece of cake | pan comido; muy fácil
break the ice | romper el hielo
under the weather | pachucho/a; indispuesto/a; malito/a
once in a blue moon | de higos a brevas; muy de vez en cuando
it's raining cats and dogs | llueve a cántaros; está lloviendo a cántaros
cost an arm and a leg | costar un ojo de la cara
hit the books | hincar los codos; ponerse a estudiar
by heart | de memoria
call it a day | dejarlo por hoy; dar por terminado
in the long run | a largo plazo
in the short term | a corto plazo
on purpose | a propósito; adrede
by chance | por casualidad
by mistake | por error; sin querer
out of order | averiado; fuera de servicio; estropeado
on time | puntual; a tiempo; a la hora
in time | a tiempo; con tiempo
up to date | al día; actualizado
out of date | anticuado; desfasado; caducado
on the whole | en general; en conjunto
it's up to you | depende de ti; tú decides
not my cup of tea | no es lo mío; no es santo de mi devoción
keep an eye on | vigilar; echar un ojo a; no perder de vista
get the hang of | pillar el truco; cogerle el tranquillo
make ends meet | llegar a fin de mes
the last straw | la gota que colmó el vaso; la gota que colma el vaso
be fed up with | estar harto/a de
be over the moon | estar encantado/a; estar loco/a de contento; estar en una nube
let the cat out of the bag | irse de la lengua; descubrir el pastel
spill the beans | irse de la lengua; desembuchar
better late than never | más vale tarde que nunca
practice makes perfect | la práctica hace al maestro
time flies | el tiempo vuela
have second thoughts | tener dudas; pensárselo dos veces
get cold feet | echarse atrás; entrarle miedo
see eye to eye | estar de acuerdo; coincidir
in a nutshell | en pocas palabras; en resumen
no way | ni hablar; de ninguna manera
it depends | depende
never mind | no importa; da igual
I can't stand it | no lo soporto; no puedo soportarlo
it's worth it | merece la pena; vale la pena
it's not worth it | no merece la pena; no vale la pena
to be honest | para ser sincero/a; la verdad
as far as possible | en la medida de lo posible
sooner or later | tarde o temprano
from time to time | de vez en cuando
every now and then | de vez en cuando; de vez en vez
make up your mind | decidirse
it's on the tip of my tongue | lo tengo en la punta de la lengua
`,
  },
  {
    name: "False friends",
    description: "Palabras que parecen lo que no son",
    source: "b2",
    data: `
sensible | sensato/a
sensitive | sensible
embarrassed | avergonzado/a
embarrassing | vergonzoso/a; embarazoso/a
pregnant | embarazada
career | carrera profesional; trayectoria profesional
library | biblioteca
bookshop | librería
realise | darse cuenta; darse cuenta de
assist | ayudar
attend | asistir; asistir a
fabric | tela; tejido
factory | fábrica
carpet | alfombra; moqueta
exit | salida
success | éxito
event | acontecimiento; evento
argument | discusión; argumento
discussion | debate; conversación
constipated | estreñido/a
record | grabar; disco; récord
pretend | fingir; hacer como que
intend | tener la intención de; pretender; tener intención de
deception | engaño
disgust | asco; repugnancia
notice | notar; fijarse; darse cuenta; aviso
novel | novela
sympathetic | comprensivo/a; compasivo/a
nice | simpático/a; agradable; bonito/a
large | grande; amplio/a
actual | real; verdadero/a
introduce | presentar
rope | cuerda
soap | jabón
costume | disfraz; traje típico
parents | padres
relatives | familiares; parientes
comprehensive | completo/a; exhaustivo/a; global
compromise | acuerdo; término medio; ceder; transigir
conductor | director/a de orquesta; revisor/a
contest | concurso; competición
terrific | estupendo/a; genial
miserable | triste; abatido/a; desgraciado/a
preservative | conservante
resume | reanudar; retomar
topic | tema
attempt | intento; intentar
casualty | víctima; herido/a
exciting | emocionante; apasionante
fabulous | fabuloso/a; estupendo/a
`,
  },

  // ==========================================================
  // B2: TEMAS
  // ==========================================================
  {
    name: "Trabajo",
    description: "Empleo, empresa y vida laboral",
    source: "b2",
    data: `
job | trabajo; empleo; puesto de trabajo
employee | empleado/a; trabajador/a
employer | empleador/a; empresario/a; empresa
boss | jefe/a
colleague | compañero/a de trabajo; colega
staff | personal; plantilla
manager | gerente; director/a; encargado/a; jefe/a
company | empresa; compañía
firm | empresa; firma
salary | sueldo; salario
wage | salario; sueldo
income | ingresos
pay rise | subida de sueldo; aumento de sueldo
promotion | ascenso; promoción
application form | formulario de solicitud; solicitud
apply for | solicitar; presentarse a
job interview | entrevista de trabajo
candidate | candidato/a
skills | habilidades; competencias; destrezas
experience | experiencia
qualifications | titulación; cualificaciones; estudios
full-time | a tiempo completo; jornada completa
part-time | a tiempo parcial; media jornada
overtime | horas extra; horas extras
shift | turno
deadline | fecha límite; plazo
meeting | reunión
unemployed | desempleado/a; parado/a; en paro
unemployment | desempleo; paro
retire | jubilarse
retirement | jubilación
resign | dimitir; renunciar
fire | despedir; fuego; incendio
hire | contratar; alquilar
contract | contrato
customer | cliente/a
client | cliente/a
supplier | proveedor/a
headquarters | sede; sede central
branch | sucursal; rama
workload | carga de trabajo
self-employed | autónomo/a; por cuenta propia
freelance | autónomo/a; freelance
work from home | teletrabajar; trabajar desde casa
commute | ir al trabajo; desplazarse al trabajo; trayecto al trabajo
achievement | logro
goal | objetivo; meta; gol
challenge | reto; desafío
responsibility | responsabilidad
teamwork | trabajo en equipo
leadership | liderazgo
sick leave | baja por enfermedad; baja médica
maternity leave | baja por maternidad
trade union | sindicato
strike | huelga; golpear
earn | ganar
profit | beneficio; ganancia
loss | pérdida
`,
  },
  {
    name: "Viajes",
    description: "Transporte, alojamiento y turismo",
    source: "b2",
    data: `
trip | viaje; excursión
journey | viaje; trayecto
travel | viajar; viajes
flight | vuelo
luggage | equipaje
suitcase | maleta
boarding pass | tarjeta de embarque
passport | pasaporte
departure | salida
arrival | llegada
delay | retraso; retrasar
delayed | retrasado/a
cancelled | cancelado/a
destination | destino
accommodation | alojamiento
booking | reserva
book | reservar; libro
hostel | albergue
sightseeing | turismo; hacer turismo
tourist attraction | atracción turística; lugar de interés turístico
landscape | paisaje
scenery | paisaje; paisajes
abroad | en el extranjero; al extranjero
foreign | extranjero/a
currency | moneda; divisa
exchange rate | tipo de cambio
one-way ticket | billete de ida; billete sencillo
return ticket | billete de ida y vuelta
platform | andén; plataforma
customs | aduana; costumbres
border | frontera
jet lag | desfase horario; jet lag
guidebook | guía de viaje; guía
backpack | mochila
get lost | perderse
miss | perder; echar de menos; extrañar; fallar
crowded | abarrotado/a; lleno/a de gente; concurrido/a
seaside | costa; playa; orilla del mar
resort | complejo turístico; centro turístico
cruise | crucero
passenger | pasajero/a
traffic jam | atasco
roundabout | rotonda
motorway | autopista
land | aterrizar; tierra
round trip | viaje de ida y vuelta
`,
  },
  {
    name: "Tecnología",
    description: "Internet, dispositivos y redes sociales",
    source: "b2",
    data: `
device | dispositivo; aparato
keyboard | teclado
mouse | ratón
laptop | portátil; ordenador portátil
smartphone | teléfono inteligente; móvil
charger | cargador
battery | batería; pila
download | descargar; descarga
upload | subir; cargar
file | archivo; fichero
folder | carpeta
password | contraseña
username | nombre de usuario
website | página web; sitio web; web
search engine | buscador; motor de búsqueda
social media | redes sociales
app | aplicación; app
update | actualizar; actualización
wireless | inalámbrico/a
network | red
data | datos
storage | almacenamiento
artificial intelligence | inteligencia artificial
virtual reality | realidad virtual
cutting-edge | de vanguardia; puntero/a; de última generación
user-friendly | fácil de usar; intuitivo/a
gadget | aparato; artilugio; cacharro
screen time | tiempo de pantalla; tiempo frente a la pantalla
click | hacer clic; pulsar; clic
share | compartir
post | publicar; publicación
follower | seguidor/a
addicted | adicto/a; enganchado/a
cyberbullying | ciberacoso
privacy | privacidad
fake news | noticias falsas; bulos
printer | impresora
backup | copia de seguridad
`,
  },
  {
    name: "Medio ambiente",
    description: "Ecología, clima y sostenibilidad",
    source: "b2",
    data: `
environment | medio ambiente; entorno
pollution | contaminación
climate change | cambio climático
global warming | calentamiento global
greenhouse effect | efecto invernadero
recycle | reciclar
recycling | reciclaje
waste | residuos; desperdicio; malgastar; desperdiciar
rubbish | basura
litter | basura; tirar basura
plastic bag | bolsa de plástico
renewable energy | energía renovable; energías renovables
solar panel | panel solar; placa solar
wind farm | parque eólico
fossil fuels | combustibles fósiles
carbon footprint | huella de carbono
emissions | emisiones
endangered species | especie en peligro de extinción; especies en peligro de extinción
extinct | extinto/a; extinguido/a
wildlife | fauna; vida silvestre; fauna salvaje
deforestation | deforestación
drought | sequía
flood | inundación; inundar
wildfire | incendio forestal
sustainable | sostenible
environmentally friendly | respetuoso con el medio ambiente; ecológico/a
save energy | ahorrar energía
reduce | reducir
reuse | reutilizar
natural resources | recursos naturales
sea level | nivel del mar
threat | amenaza
protect | proteger
damage | daño; dañar; daños
harmful | perjudicial; dañino/a
organic | ecológico/a; orgánico/a
public transport | transporte público
`,
  },
  {
    name: "Salud",
    description: "Cuerpo, enfermedades y hábitos saludables",
    source: "b2",
    data: `
health | salud
healthy | sano/a; saludable
illness | enfermedad
disease | enfermedad
sick | enfermo/a; mareado/a
ill | enfermo/a
pain | dolor
ache | dolor; doler
headache | dolor de cabeza
stomachache | dolor de estómago; dolor de barriga; dolor de tripa
toothache | dolor de muelas
sore throat | dolor de garganta
fever | fiebre
cough | tos; toser
flu | gripe
injury | lesión; herida
injured | herido/a; lesionado/a
wound | herida
bruise | moratón; cardenal
sprain | esguince; torcerse
prescription | receta; receta médica
medicine | medicina; medicamento
pill | pastilla; píldora
treatment | tratamiento
surgery | cirugía; operación; consulta
recover | recuperarse
recovery | recuperación
symptom | síntoma
allergy | alergia
allergic | alérgico/a
diet | dieta; alimentación
lifestyle | estilo de vida
stress | estrés
mental health | salud mental
sleep | dormir; sueño
tired | cansado/a
exhausted | agotado/a; exhausto/a
get fit | ponerse en forma
fit | en forma; quedar bien; encajar
nurse | enfermero/a
patient | paciente
emergency | emergencia; urgencia
ambulance | ambulancia
appointment | cita
heart attack | infarto; ataque al corazón
blood | sangre
bone | hueso
dizzy | mareado/a
sneeze | estornudar; estornudo
cure | cura; curar
wellbeing | bienestar
`,
  },
  {
    name: "Personalidad y sentimientos",
    description: "Adjetivos de carácter y emociones (nivel B2)",
    source: "b2",
    data: `
reliable | fiable; de confianza
trustworthy | digno/a de confianza; fiable
honest | sincero/a; honesto/a; honrado/a
outgoing | extrovertido/a; sociable
shy | tímido/a
easy-going | tranquilo/a; despreocupado/a; de trato fácil; abierto/a
hard-working | trabajador/a
lazy | vago/a; perezoso/a
stubborn | cabezota; terco/a; testarudo/a
generous | generoso/a
selfish | egoísta
mean | tacaño/a; malo/a; mezquino/a; significar
polite | educado/a
rude | maleducado/a; grosero/a
impatient | impaciente
confident | seguro/a de sí mismo/a; seguro/a; con confianza
ambitious | ambicioso/a
cheerful | alegre
moody | temperamental; de mal humor; malhumorado/a
bossy | mandón/a
arrogant | arrogante
modest | modesto/a; humilde
humble | humilde
brave | valiente
cowardly | cobarde
loyal | leal
jealous | celoso/a; envidioso/a
envious | envidioso/a
curious | curioso/a
creative | creativo/a
open-minded | de mente abierta; abierto/a de mente; tolerante
narrow-minded | cerrado/a de mente; estrecho/a de miras
talkative | hablador/a; charlatán/a
quiet | callado/a; tranquilo/a; silencioso/a
thoughtful | considerado/a; atento/a; pensativo/a
considerate | considerado/a; atento/a
caring | cariñoso/a; atento/a; protector/a
kind | amable; bondadoso/a
funny | gracioso/a; divertido/a
cheeky | descarado/a; caradura
anxious | ansioso/a; preocupado/a; nervioso/a
worried | preocupado/a
upset | disgustado/a; molesto/a; afectado/a
disappointed | decepcionado/a
ashamed | avergonzado/a
proud | orgulloso/a
grateful | agradecido/a
relieved | aliviado/a
scared | asustado/a
frightened | asustado/a; atemorizado/a
terrified | aterrorizado/a; aterrado/a
confused | confundido/a
amazed | asombrado/a; sorprendido/a
surprised | sorprendido/a
annoyed | molesto/a; irritado/a; fastidiado/a
furious | furioso/a
lonely | solo/a; solitario/a
homesick | nostálgico/a; con morriña
stressed | estresado/a
delighted | encantado/a
thrilled | entusiasmado/a; encantado/a; emocionadísimo/a
frustrated | frustrado/a
satisfied | satisfecho/a
nervous | nervioso/a
fed up | harto/a
boring | aburrido/a
interesting | interesante
tiring | agotador/a; cansado/a
disappointing | decepcionante
amazing | increíble; asombroso/a; alucinante
annoying | molesto/a; irritante; pesado/a
frightening | aterrador/a; que da miedo
confusing | confuso/a
`,
  },
  {
    name: "Verbos B2",
    description: "Verbos de uso frecuente en el examen",
    source: "b2",
    data: `
achieve | lograr; conseguir; alcanzar
afford | permitirse; poder permitirse; costear
avoid | evitar
argue | discutir
allow | permitir; dejar
apologise | disculparse; pedir perdón; pedir disculpas
appreciate | apreciar; agradecer; valorar
arrange | organizar; concertar; arreglar; quedar
behave | comportarse; portarse
belong | pertenecer
blame | culpar; echar la culpa
borrow | pedir prestado; tomar prestado
lend | prestar; dejar
complain | quejarse
convince | convencer
deserve | merecer; merecerse
develop | desarrollar
encourage | animar; fomentar; alentar
enjoy | disfrutar; disfrutar de
expect | esperar; suponer
fail | suspender; fracasar; fallar
forbid | prohibir
forgive | perdonar
guess | adivinar; suponer
hesitate | dudar; vacilar
improve | mejorar
increase | aumentar; aumento
decrease | disminuir; reducir; disminución
involve | implicar; involucrar; conllevar
manage | gestionar; conseguir; lograr; arreglárselas
mention | mencionar
owe | deber
persuade | persuadir; convencer
prevent | evitar; prevenir; impedir
provide | proporcionar; ofrecer; suministrar
refuse | negarse; rechazar
regret | arrepentirse; lamentar; arrepentirse de
rely on | depender de; confiar en
remind | recordar
remember | recordar; acordarse; acordarse de
require | requerir; necesitar; exigir
seem | parecer
spend | gastar; pasar
succeed | tener éxito; triunfar; conseguir
suggest | sugerir; proponer
suppose | suponer
survive | sobrevivir
threaten | amenazar
warn | advertir; avisar
wonder | preguntarse
worry | preocuparse; preocupar
raise | criar; subir; levantar; recaudar
rise | subir; aumentar; elevarse; subida
lie | mentir; tumbarse; mentira
steal | robar
rob | robar; atracar
win | ganar
beat | vencer; ganar a; derrotar; batir
lose | perder
measure | medir; medida
reach | alcanzar; llegar a
recommend | recomendar
recognise | reconocer
solve | resolver; solucionar
support | apoyar; apoyo
wish | desear; deseo
hurt | doler; hacer daño; herir
shout | gritar
whisper | susurrar
agree | estar de acuerdo
disagree | no estar de acuerdo; discrepar
`,
  },
  {
    name: "Casa y ciudad",
    description: "Vivienda, tareas del hogar y la ciudad",
    source: "b2",
    data: `
neighbourhood | barrio; vecindario
neighbour | vecino/a
flat | piso; apartamento
block of flats | bloque de pisos; edificio de apartamentos
detached house | casa independiente; chalé
semi-detached house | casa pareada; chalé pareado
terraced house | casa adosada; adosado
landlord | casero; propietario
tenant | inquilino/a
rent | alquiler; alquilar
mortgage | hipoteca
furniture | muebles; mobiliario
stairs | escaleras
lift | ascensor; levantar
ceiling | techo
roof | tejado; techo
floor | suelo; planta; piso
wardrobe | armario; ropero
shelf | estante; estantería; balda
sink | fregadero; lavabo; hundirse
washing machine | lavadora
dishwasher | lavavajillas; lavaplatos
fridge | nevera; frigorífico
oven | horno
housework | tareas domésticas; tareas del hogar
tidy | ordenado/a; ordenar
messy | desordenado/a
cosy | acogedor/a
spacious | espacioso/a; amplio/a
suburbs | afueras; extrarradio
outskirts | afueras; alrededores
city centre | centro de la ciudad; centro
town hall | ayuntamiento
pavement | acera
crossroads | cruce
traffic lights | semáforo
pedestrian | peatón
square | plaza; cuadrado
countryside | campo
village | pueblo; aldea
noisy | ruidoso/a
peaceful | tranquilo/a; apacible
nightlife | vida nocturna
facilities | instalaciones; servicios
`,
  },
  {
    name: "Dinero y compras",
    description: "Compras, pagos y finanzas personales",
    source: "b2",
    data: `
cash | efectivo; dinero en efectivo
credit card | tarjeta de crédito
receipt | recibo; tique; ticket
bill | factura; cuenta
refund | reembolso; devolución; reembolsar
discount | descuento
bargain | ganga; chollo; regatear
sales | rebajas; ventas
price | precio
cheap | barato/a
expensive | caro/a
affordable | asequible
save | ahorrar; guardar; salvar
savings | ahorros
loan | préstamo
debt | deuda
bank account | cuenta bancaria
withdraw | retirar; sacar
cashier | cajero/a
cash machine | cajero automático; cajero
shop assistant | dependiente/a; dependienta
queue | cola; hacer cola
changing room | probador
size | talla; tamaño
suit | traje; quedar bien; sentar bien
brand | marca
second-hand | de segunda mano
online shopping | compras por internet; compras online
delivery | entrega; envío; reparto
order | pedido; pedir; orden
tip | propina; consejo
tax | impuesto
wealthy | rico/a; adinerado/a
poor | pobre
broke | sin blanca; sin dinero; arruinado/a
`,
  },
  {
    name: "Sociedad y opinión",
    description: "Para argumentar en el writing y el speaking",
    source: "b2",
    data: `
point of view | punto de vista
advantage | ventaja
disadvantage | desventaja; inconveniente
drawback | inconveniente; desventaja
benefit | beneficio; ventaja
issue | asunto; cuestión; problema; tema
solution | solución
belief | creencia
society | sociedad
government | gobierno
law | ley; derecho
crime | delito; crimen; delincuencia
poverty | pobreza
equality | igualdad
human rights | derechos humanos
vote | votar; voto
election | elecciones; elección
immigration | inmigración
charity | organización benéfica; beneficencia; caridad
community | comunidad
survey | encuesta; estudio
evidence | pruebas; evidencia
statistics | estadísticas
improvement | mejora
growth | crecimiento
lack of | falta de
trend | tendencia
behaviour | comportamiento; conducta
generation | generación
`,
  },
];

// ============================================================
// PARSEO
// ============================================================

function parseCategory(raw: RawCategory): PackCategory {
  const words = raw.data
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [english, translations = ""] = line.split("|");

      return {
        english: english.trim(),
        translations: translations
          .split(";")
          .map((translation) => translation.trim())
          .filter(Boolean),
      };
    })
    .filter(
      (word) => word.english && word.translations.length > 0
    );

  return {
    name: raw.name,
    description: raw.description,
    source: raw.source,
    words,
  };
}

export const B2_PACK: PackCategory[] = RAW.map(parseCategory);

export const B2_PACK_INFO = {
  id: "b2",
  name: "Pack B2 · Aptis y Cambridge",
  description:
    "Vocabulario por temas de Aptis, conectores, phrasal verbs, collocations, idioms, false friends y los temas más frecuentes del B2.",
};

// ============================================================
// UNIR PALABRAS REPETIDAS ENTRE CATEGORÍAS
// ============================================================
//
// Una misma palabra (p. ej. "fish") puede estar en varias
// categorías. Aquí se fusiona en una sola entrada con todas
// sus traducciones y todas sus categorías.
// ============================================================

export function mergePackWords(
  categories: PackCategory[]
): PackWord[] {
  const byKey = new Map<string, PackWord>();

  for (const category of categories) {
    for (const word of category.words) {
      const key = word.english.trim().toLowerCase();
      const existing = byKey.get(key);

      if (!existing) {
        byKey.set(key, {
          english: word.english,
          translations: [...word.translations],
          categories: [category.name],
        });
        continue;
      }

      for (const translation of word.translations) {
        const already = existing.translations.some(
          (current) =>
            current.toLowerCase() === translation.toLowerCase()
        );

        if (!already) {
          existing.translations.push(translation);
        }
      }

      if (!existing.categories.includes(category.name)) {
        existing.categories.push(category.name);
      }
    }
  }

  return Array.from(byKey.values());
}
