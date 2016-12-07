# Node Ecommerce

Este proyecto va a ser una tienda ecommerce en nodejs usando plain javascript html y css.
Cada día trabajo 1 hora en conseguir avanzar los pasos necesarios para completarlo.

## Objetivos

1. Crear la interfaz gráfica

- Página de login para acceder como administrador de la tienda o comprador. No habrá múltiples colaboradores, solo 1 usuario administrador.
- Página para añadir productos.
  - Crear widget imagenes.
  - Crear widget permalink.
  - Crear widget categorías.
  - Crear widget atributos.
- Página inicial donde ver los productos como visitante.
- Página de cliente para ver sus pedidos, notas y productos comprados.
- Página para ver información sobre las ventas. Dashboard.
- Página de detalle de cada producto.
- Página de compra del producto donde poder pagar con paypal.
- Widget de añadir al carrito ajax.
- Widget de chat.

2. Añadir la funcionalidad.

- Crear funcionalidad de login y registro.
- Crear funcionalidad de añadir productos con upload de imágenes y categorias
- Crear funcionalidad de ver los productos actualmente disponibles, la página inicial y página de detalles de productos.
- Crear funcionalidad de dashboard, estadísticas de visitas diarias con google analytics, páginas visitadas, productos que neceistan ser enviados y productos comprados.
- Crear funcionalidad de pago. Pagar con paypal y con tarjeta authorize.net o stripe.
- Crear widget del carrito.
- Crear widget del chat para consultas en directo.

3. Completar el proyecto.

- Publicarlo en digital ocean para tenerlo activo.
- Reparar bugs y actualizar diseño con funcionalidades.
- Toques finales.

## Tutorial de GIT como referencia para el proyecto

git --version
git config --global user.name "name" ||| git config --global user.email "email" ||| git config --globar user.username "username" (Your github username)
git init (To create a new repository on github)
git status
git diff (To compare versions with the last)

#### Commit in git
1. Check status
2. git add yourfile.txt OR . (To add all use . )
3. git commit -m "commit message"

#### To link a repository with your proyect in your pc
- git remote add origin urlfromgithub

#### To push changes to the repository
- git push origin master

#### To force push if it gives errors
- git push -f origin master

#### To see remote connections
- git remote -v

#### To change your origin remote:
- git remote set-url origin <urlnewrepository>

#### To save commit credentials
- git config remote.origin.url https://{{username}}:{{password}}@github.com/{{username}}/{{repository name}} (Para que no pidan los credenciales a cada push)

#### Clone repository
- First you fork it clicking in the top "fork" button on github to have a copy on your account.
- git clone <repositoryurl> (You can get the repository url copying it from github.com)/

#### To pull changes from a repository:
- Go inside your cloned repository folder and
- git remote add upstream <repositoryurl>
- Now you can take a look at the git remote -v

#### To create a branch (una nueva rama separada del master branch) use:
- git branch <branchaname>
- Cd to the branch with: git checkout <branchname>
- Then you can commit like usual

#### To push the changes to the branch do:
- git add .
- git commit -m "message"
- git push origin <branchname>

#### To rename branch use:
- git branch -M <branchname>

#### To pull changes from other contributors of your repository, use:
- git pull <repositoryURL> <branchaname>

#### To push the changes from your forked repository to the original use a pull request:
- Go to your forked repository
- Go to pull requests
- Select your branch at the end
- Click on new pull request and send a message

#### To join branch with master branch do:
- Move to main branch: git checkout gh-pages
- git merge <branch to merge>
- Then delete your branch locally: git branch -d <branchname>
- And remotely: git push origin --delete <branchname>

## CSS notes

#### Excellent resources for flexbox to create responsive menus
- https://paulund.co.uk/css-flexbox
- https://css-tricks.com/snippets/css/a-guide-to-flexbox/

#### To align items horizontally like in a menu
- Add a main class to the menu container
- Add the items
- Use css display: flex and align-items: center to the container

#### box-sizing: border-box
- Border box te permite sumar todos los paddings y margins para que el width que le pongas sea el exacto.
- Es decir, que si le poner un width de 30% a un elemento y un padding de 10px, el tamaño del elemento será 30% no matter what.
- Sin border-box el resultado sería mayor de 30% porque los paddings, margins & stuff se calculan aparte.
- Importante: las pseudoclases como before y after se deben aplicar aparte.


### Día 1 y 2

He creado el login de un anterior proyecto de prueba para poder iniciar sessión como usuario administrador si se accede con mis credenciales concretos.
A continuación he estado creando la interfaz para añadir producto, la parte donde los productos se crean con la información correcta y con widgets de permalink, categorías y atributos.

### Día 3
Hoy voy a crear el widget de atributos. Este widget se encargará se poner opciones como color o tamaño en un desplegable publicamente accesible para que los compradores puedan elegir el modelo concreto que necesitan.
Será bastante similar al widget de categorías pero más ampliado.

--

Lo acabo de completar y al final ha sido algo más complicado de lo esperado porque tuve que usar muchos `elemento.parentNode` para encontrar el elemento a borrar.

Tal cual está ahora mismo como funciona es: Creas un nuevo atributo por ejemplo "Color" y puedes poner dentro "valores" o eliminas el atributo con una cruz que se pone roja on hover. Luego esos valores se guardan en una lista y se pueden borrar individualmente tipo "Azul", "Rosa", "Blanco".

```
Color                  x

- Azul                 x
- Rosa                 x
- Blanco               x
- Negro                x
- Naranja              x
```
Esto es más o menos como se ve en el backend, en el frontend será un dropdown donde podrás elegir uno de esos valores.

De momento no se pueden modificar otros parámetros dependiendo del valor de atributo escogido como el precio por atributo para, por ejemplo, aumentar el precio de ediciones coleccionistas o bajar el precio para tallas menos demandadas de camisetas.

Todo este conocimiento de ecommerce lo he sacado de woocommerce gracias a las tiendas que tengo funcionando, en particular kamisetaskustom.com el cual mantengo orgullosamente con añadidos de vez en cuando y con el que solo he vendido 1 producto en meses - un desastre que tengo que mejorar desde luego.

En woocommerce puedes configurar por separado multitud de detalles de cada valor del atributo pero lo veo innecesario y complcado, ¿Para qué vas a querer cambiar el nombre del producto si selecciona una talla xl?. Aunque woocommerce te permite configurar una imagen para cada valor de atributo de forma que si selecciono colo rojo la imágen principal del producto me muestra la camiseta de color rojo.

Esto es algo bastante agradable de cara a la experiencia de usuario, sin embargo de momento no tengo pensado añadir este detalle porque sería complicar bastante las cosas y solamente puedo hacerlo una vez creado el widget de las imágenes.

Mañana trabajé en el widget de las imágenes basándome en el de wodpress. Por suerte ya tengo un file uploader hecho de otro experimento con node js con lo que puedo subir archivos al servidor usando ajax de manera muy eficiente simplemente metiendo el código en mi proyecto.

Ahora mi objetivo es superar las limitaciones del widget multimedia de wordpress. Lo que quiero conseguir es una organización mucho más efectiva porque en wordpress se te muestran todas las imágenes en un recuadro y tienes que ir haciendo scroll para cargar más y verlas todas. Esto me parece muy ineficiente y es super lento. Aunque puedes usar un recuadro de búsqueda, es bastante lento en cuanto empiezas a tener una cantidad seria de archivos (1000 imágenes).

Mi idea inicial es tener un sistema de carpetas en el que crear líbremente carpetas en las que guardar cada tipo de imágen en su lugar.

Aunque antes de eso quiero pensar más detenidamente si un widget de esas proporciones será efectivo o si es mejor guardar las imágenes en cada producto en su propia ficha en lugar de tener las imágenes disponibles globalmente para no sobrecargar tantas imágenes.

Una opción es que se vayan creando automáticamente carpetas con las imágenes de los productos con el título de cada producto para poder acceder a ellas en cualquier momento para, por ejemplo para mostrar un widget de los productos más vendidos con su imágen correspondiente.

Otro detalle a tener en cuenta es que el widget sea casi copia de amazon con el consiguiente efecto de zoom al poner el ratón por encima. Es una de las mejores caraterísticas de amazon que me encantaría tener.

Luego tengo intención de añadir una sección en el backend para la información del producto en la que añadir una tabla de las características técnicas de los productos tipo amazon.

Mi intención es simplificar todos los añadidos innecesarios que establece woocommerce al ser una tienda para todo tipo de tiendas valga la redundancia. Eliminar las cosas que me molestan de wordpress e imitar las buenas partes de amazon, la mejor tienda del mundo, es mi objetivo para un sistema de ecommerce agradable para tal vez en algún día usar mi propio sistema de tienda ecommerce para mis tiendas.

### Día 4
Hoy voy a trabajar en el widget de las imágenes de los productos.

Mi objetivo es crear un sistema de organización de imágenes sencillo y efectivo para encontrar las imágenes bien organizadas sin problemas de lentitud por tener demasiadas imágenes.

Primero voy a trabajar en la parte de publicar en el frontend una imágen para pasarla al servidor y una vez completado podré poner orden a la forma en la que se organizan las imágenes.

El sistema para subir imágenes está medio funcionando. Lo que quiero es seleccionar múltiples imágenes, que se envíen al servidor y este me devuelva un array o un json con los nombres de todos los archivos subidos para que los pueda colocar el primero en la imágen grande y los pequeños en la parte izquierda automáticamente como miniaturas como máximo 10 imágenes.

Hay varios problemas:
- La imágen subida no encaja en su contendor (solucionable mediante css).
- Cuando subo una imagen repetida, el servidor a veces da error, entonces lo que quiero es sobreescribir la imagen (que es lo que debería pasar) y guardarla, pero si no se puede después de varios intentos, lo que voy a hacer es comprobar si existe already con un fs.read (consultar documentación de node) e ignorar la subida.
- Que las imágenes se suban a la ubicación temporal "public-images" antes de mandarse al servidor (fácilmente arreglable solo hay que cambiar el fs.rename del formidable). Y que las imágenes se suban al servidor en la carpeta especial "Uploads" al enviar el producto completo y no antes, public-images es una ubicación temporal para ver las imágenes.

Lo que tengo que hacer a continuación es:

1. Eliminar las miniaturas interactivas para dejar solo el boton grande de subir imágen.
2. Seleccionar como máximo 10 imágenes y subirlas al servidor.
3. En el servidor ver cómo funciona formidable con múltiples archivos porque ahora mismo no sé cómo acceder a todos ellos y enviarle al cliente un json con la ubicación o nombre de los archivos para mostrarlos en el frontend.
4. Que se creen automáticamente las miniaturas necesarias con sus imágenes máximo 10.

Después de hacer esto, quiero poder eliminar las imágenes con un icono de basura por encima de la imágen y poderlas reordenar arrastrando. Esto seguramente lo tenga que hacer con jquery ui porque no conozco otro método. Tendré que guardar la ubicación de cada imágen en el objeto de imágenes que se enviará al servidor una vez hecho click en guardar producto o publicar producto.

Más adelante tendré que crear el widget con las carpetas que se creen automáticamente con el título del producto para organizar todo esto.

### Día 5

Hoy voy a continuar trabajando en el widget de las imágenes que preveo que va a ser bastante grande o complejo.

Ahora mismo acabo de descubrir que formidable lo que hace es guardar los archivos de 1 en 1 así que lo que hice es crear un objeto así:

```
let imagenesProducto = {
  "1": "dirección de la imágen en la carpeta temporal pública 'public-images'"
  "2": ...
}
```
De forma que, cuando suba un nuevo producto, se copie la carpeta de imágenes de la carpeta pública al servidor donde se almacenarán las imágenes en carpetas.

### Día 6

Hoy voy a trabajar en terminar el widget de las imágenes en el backend.

Me falta lo siguiente:
- Crear un efecto al hacer hover sobre la imágen principal que muestre un texto "cambiar imágenes" para poder subir otras imágenes de producto y sustituir las de ese momento por si te equivocaste al subir.
- Crear un efecto para reorganizar las miniaturas de forma que pueda colocar cada imágen en su sitio. Al hacer hover sobre cada miniatura aparecerán unas flechas de subir o bajar.
- Guardar todo el producto en la base de datos y transferir las imágenes al servidor en su ubicación final "uploads" para acceder en otro momento.

### Día 7

Ayer fue un día ajetreado, estuve trabajando en los efectos de las imágenes y conseguí lo que quería. Ahora estoy perfeccionando pequeños bugs y añadiendo funcionalidades tales como que al subir las miniaturas, la imagen principal cambie en consecuencia.

Mi objetivo para hoy es poder enviar el producto completo a la base de datos para guardarlo en el mongodb local que estoy usando, más adelante también tendré un mongodb local porque hace tiempo hice un proyecto con una base de datos en los servidores de modulus.io pero resulto ser demasiado caro.

Bien. El widget ya está completo. Tras pensar durante un rato que el funcionamiento de subir y bajar imágenes para posicionarlas estaba mal, me he dado cuenta de que está bien y mi deducción era incorrecta por no pensar en detalle.

Ahora lo que me queda es subir todas las imágenes y los datos del producto al servidor para guardarlos en la base de datos donde se podrán acceder desde el fronteend para que los usuarios puedan ver los productos.

La organización es la siguiente:

- Imágenes en un objeto que se convertirá a json tipo:
```
objetoImagenes = {
  1: "ubicación imágen 1",
  2: "ubicación imágen 2",
  3: ...
}
```
- La información del producto será igualmente un objeto:
```
objetoInformacionProducto = {
  "titulo": "Camiseta de alta calidad",
  "permalink": "/el-permalink",
  "precio": 58,84,
  "descripcion": "La mejor camiseta del mercado ahora en oferta con ...",
  "categoria": "Camisetas Hombre",
  "atributos": {
    "tallas": ["S", "M", "L", "XL", "XXL"],
    "colores": ["rojo", "azul", "naranja", "morado"]
  }
}
```
- El array de categorías para saber las categorías disponibles:
```
arrayCategorias = ["categoria1", "coches", "motos"];
```
De esta forma tendré toda la información al alcance de manera sencilla y muy bien organizada.
Más adelante tengo pensado añadir un atributo "En Stock" para saber si está disponible o no y
mostrar un elegante mensaje para motivar las ventas similar al de pccomponentes.

Por cierto, el producto se guardará con ajax para mejorar la experiencia de usuario.

--

Al final decidí meter el objeto de imágenes dentro del objeto de información producto que es el que va a contener todo lo necesario para el producto.

--

Ya se pueden subir los productos y me ha sorprendido positivamente la velocidad con la que llegan al servidor todos los datos. Es casi instantáneo.

Lo que hice fue crear una http request en javascript para enviar el objeto en formato application/json y parece que nodejs se lleva perfecto con ese formato porque simplemente tuve que acceder al request.body para ver el objeto tal cual, fantástico.

Para mañana, lo que voy a hacer es arreglar el widget de las imágenes porque cuando selecciono las imágenes en el frontend, se guardan en el array de imágenes pero aparecen desorganizadas en las miniaturas. Supongo que es debido a que se cargan asíncronamente con la función imagen.onload con lo que aparecen desordenadas, tengo que idear un sistema para que se organizen al igual que están en el array.

Además, tengo que hacer que la organización de las imágenes se actualice cada vez que hago click en cada imágen para enviarlas al servidor en el orden correcto, de no ser así, llegarían desorganizadas y eso no lo queremos, verdad?

Aparte, he creado un js con un pequeño widget de status que tiene la función de mostrar un pequeño banner de error o éxito con el mensaje que quieras. Además, al cargar la página, detecta el GET para ver si hay parámetros que interese mostrar del servidor y los muestra correctamente parseados. Una maravilla.

Hoy ha sido un día bastante completo porque está casi completo el backend para subir productos.

Después de esto pasaré a crear la versión responsive de esta página y luego el frontend que verán los clientes para comprar productos.

Me basaré en amazon y en pccomponentes para crear una interfaz de usuario minimalista, limpia, responsiva y agradable de usar.

### Día 8

Hoy es un buen día. Hemos salido antes de clase porque el profesor de programacion tuvo que irse a realizar algunas tareas.

Para el que no lo sepa, ahora mismo estoy estudiando un módulo superior de desarrollo de aplicaciones web para complementar mis conocimientos y conseguir trabajo además de experiencia como desarrollador web.

A pesar de que mi objetivo es ganar dinero con negocios online, ya sea mediante tiendas, productos propio, afiliados o publicidad, necesito el dinero y el conocimiento de una profesión. Además, todo el mundo tiene que tener un oficio para llegar a lo más alto y esto es lo que me encanta, negocios, programación web, diseño de aplicaciones.

Dejando mi vida privada a un lado, vamos a centrarnos en lo que interesa, saber cómo va el proyecto de node-ecommerce.

Ahora acabo de conseguir alinear la imágenes miniaturas que aparecen al lado de la imágen principal en el orden correcto usando la propiedad de css `"order"` que permite organizar los elementos en el orden que establezcas siempre y cuando el contenedor sea `"display: flex;"`.

Lo siguiente es coseguir modificar el orden del array al ajustar la posición de cada imágen. Creo que puedo conseguirlo bastante fácil actualizando la posición del order del array.

Para hoy quiero poder subir y guardar los productos en la base de datos para usarlos en el frontend. Aunque todavía queda hacer esta página responsive para poder usarla con el teléfono y tablets.

He conseguido hacer lo de ordenar las imágenes. Y si, ha sido mucho más difícil de lo esperado. Lo normal cuando alguien dice "Esto debería ser sencillo" es que la cosa se complique hasta límites insospechados porque desconoce lo que realmente conlleva.

Esto pasa porque pensamos las cosas tal cual "Simplemente seleccionar las imágenes y meterlas en la base de datos ordenadas" cuando en realidad es "Crear una nueva función que sea capaz de ordenar los elementos del array cada vez que una imágen se mueva mediante un código javascript capaz de guardar la posición de cada imágen y detectar los cambios para enviarla al servidor".

Aun así lo he conseguido y ha valido totalmente la pena. Ahora tengo un widget de las imágenes completamente funcional que te permite subir y reordenar las imágenes con una interfaz de usuario exquisita que además te da la información en un ordenado objeto javascript.

A continuación, voy a trabajar en subir el producto completo a la base de datos en el servidor. Pero antes... me voy a cortar las uñas de los pies :D

### Dia 9

Ayer estuve trabajando en subir los productos a la database. La solución que tomé fue bastante elegante al crear una función llamada copiadDirectorio en nodejs que se encargar de copiar todos los archivos de un directorio a otro. De esta forma puedo mover los archivos de la ubicación temporal `public-uploads` del cliente a la final `uploads` en el servidor y guardar las imágenes de los productos.

Además los productos se guardan en la base de datos con la clave primaria, el valor que no se puede repetir, título para cada producto, para luego encontrarlos en el frontend.

A pesar de que los productos se suben correctamente al servidor y se guardan en la base de datos, no me gusta del todo el funcionamiento que tiene porque se muestra un mensaje de "Subido correctamente" sin más. Y si quiero poner otro producto tengo que recargar la página porque no suele funcionar.

Aparte, las notificaciones a veces ni se muestran. Esto tengo que investigarlo con más detalle para ver cuándo pasa.

Hoy lo que voy a hacer es establecer un nuevo funcionamiento a la subida de productos, al subir correctamente el producto se recarga la página y puedes verlo para editarlo en la sección editar productos.

Además voy a hacer que la página de subida de producto sea responsive con media queries de css.

Me gustaría poder grabar algún dia el trabajo que hago en el portátil para luego ponerlo a cámara rápida y ver el progreso total del software.

--

Cambio de planes, lo que voy a hacer es establecer como clave primaria el permalink porque no puede repetirse y voy a filtrar los carácteres prohibidos a la hora de crear un archivo, es decir, sustituir estos carácteres `\/:*?"<>|` por un guión o barra baja.

Después de esto, voy a hacer que el sistema para subir productos sea más agradable. No sera necesario reiniciar la página, simplemente te llegará un mensaje de "Ver producto" y se te limpiará la pantalla para evitar subir el mismo producto, porque las imágenes las he borrado al subir el producto al servidor.

### Día 10 

Ayer conseguí crear un diseño responsive para la página principal de subir producto. Todo se ve correctamente excepto el widget de las imagenes que al tener un tamaño variable que depende del tamaño de la pantalla, es bastante más complicado modificar lo que mide de anchura y altura.

Además ayer cambié el widget del permalink para que detectase caracteres prohibidos en windows. 

La verdad es que no fue un día bastante productivo así que voy a trabajar hoy seriamente para conseguir niveler el tiempo invertido. 

Para ello usaré una técnica muy conocida llamada la técnica pomodoro que consiste en que te pones un tiempo, por ejemplo media hora, en la que no puedes hacer absolutamente nada que no sea trabajar en el proyecto. Es realmente efectiva porque te obliga a concentrarte y funciona.

Entonces voy a usar esta técnica para conseguir el objetivo principal de hoy: Crear la página de edición de productos para ver los productos subidos, el resto son objetivos secundarios que se harán una vez completado el trabajo inicial.

--

Resulta que es más complicado de lo esperado. Mi primer intento ha sido crear ajax requests al servidor para conseguir la información del producto e ir mostrando la información con javascript.

Me dí cuenta que hacer eso es malísmo para el SEO, porque los bots de google encuentran difícil y costoso tener que cargar páginas web para ver realmente el contenido y muchos de ellos tienen javascript desactivado. 

Entonces, tras buscar un rato he descubierto que es posible usas `rendering sistems`  de express, que son pequeñas librerías que te permiten poner variables y cosas dentro de los archivos html para enviarselos al cliente.

Para que lo entiendas te voy a poner un ejemplo:

- Digamos que tienes una caja con regalos que quieres dar a tu mejor amigo pero no tienen todavia los regalos.
- Lo que haces es ir poniendo los regalos conforme los vayas comprando y una vez llena la caja, se los das a tu amigo.

Pues esto es lo mismo, preparas la página con tus variables del producto y se las envías al cliente cuando se cargue.

El otro sistema sería darle la caja de regalos vacía e ir enviándole los regalos de uno en uno hasta llenarla a lo largo de una semana. Esto no le gusta a google porque google quiere archivos html ya preparados para ver su contenido y poder posicionarlos en los resultados de búsqueda.

Por esta razón, y porque el seo es imprescindible para las tiendas ecommerce y páginas que no sean enteramente web apps, he decidido crear mi propio sistema de templates.

Lo que hago es crear documentos html con la estructura general y dentro pongo variables así {{nombreProducto}}, luego en el servidor tengo una preciosa función que se encarga de sustituir {{nombreProducto}} por `<h1>Coche indrustrial</h1>` antes de enviarselo al navegador para tener toda la información disponible inmediatamente para google.

Esto me llevará más tiempo inicial pero como todo lo bueno, require un sacrificio al principio para tener una bestia super veloz personalizada a lo largo del tiempo.

En resumen. Voy a crear mi sistema de templates a lo largo de los próximos días para mostrar los productos y páginas que verán los clientes de node-ecommerce.

### Día 11

Ayer estuve creando el sistema de templates para las páginas de los productos de forma que yo saque los datos de cada producto de la base de datos y los pueda poner donde quiera con facilidad en el html.

Pues resulta que compliqué demasiado el sistema tratando de abarcar más de lo necesario en un principio. Yo quise poder usar varios tipos de productos y sus cualidades con facilidad para tener un sistema más poderoso. 

Sin embargo fue una decisión incorrecta porque me quede bastante atascado y no supe como salir del agujero.

Así que hoy lo he simplificado bastante.

En la página de los productos, donde ponga {{titulo}} saldrá el titulo del producto que se corresponda con la url actual. De esta forma no hay líos de objetos ni historias.

Además, estoy creando un sistema algo más avanzado para mostrar las imágenes. Básicamente quiero poner {{loop imagenes}} y que me salgan todas las imágenes con el html intacto.

Por ejemplo, si se lo pongo a un `<div>{{loop imagenes}}</div>` lo que me hará es crear un div y meter las imágenes dentro de uno en uno. 

Pero de momento me está costando. Yo lo estoy haciendo con expresiones regulares o regex para buscar ese tipo de códigos, aunque me está dando problemas al darme más información de la necesaria.

Así que hoy continúo trabajando en esta emocionante caracteristica del proyecto.

Justo ahora, al escribir esto me ha venido la solución al pequeño problema que estaba teniendo. Resulta que cuando sacaba este fragmento de la plantilla `<div>{{loop imagenes}}</div>` me daba también \t, una sangría. Entonces lo que he hecho es eliminar todas las sangrías del documento y ya no tengo que preocuparme por ello.

He conseguido bastante progreso. Ahora puedo poner estas funciones dentro de mis plantillas html para crear páginas dinámicas:
```
{{propiedad}}
{{loop objeto}}
{{loop objeto 5}}
{{loop objeto -5-}}
```
Tu le pasas un objeto con la información del producto a la plantilla y te hace lo siguiente:

- {{Propiedad}} te muestra una propiedad concreta del objeto. Por ejemplo, si tienes un objeto `producto` con la propiedad `producto.precio` al poner {{precio}} te saldra el precio de ese producto donde quieras.
- {{loop objeto}} si tienes un producto con una propiedad que es un objeto puedes mostrar los valores de cada valor. Es decir, que si tienes un `producto.imágenes` e imágenes es un objeto tipo:
```
imagenes:{
  1:"imagen1.jpg",
  2:"imagen2.jpg",
  3:"imagen3.jpg"
}
```
y quieres mostrar las imágenes, simplemente pones {{loop imagenes}} y te apareceran todas con su correspondiente html.

Si lo has puesto así:
`<h1>{{loop imagenes}}</h1>`
al renderizar la plantilla se convertirá en:
```
<h1>imagen1.jpg</h1>
<h1>imagen2.jpg</h1>
<h1>imagen3.jpg</h1>
```
manteniendo el html en su misma línea para crear copias ordenadas.
- {{loop objeto 5}} te sacará un valor concreto del objeto que le pongas. Si quieres sacar la imagen 2, pones {{loop imagenes 2}} y se te mostrará.
- {{loop objeto -5-}} te saca todos los valores a partir del que has puesto incluido. Si quieres mostrar todas las imágenes a partir de la 3º, simplemente usas:
`<li><{{loop imagenes -5-}}/li>`
y te mostrará:
```
<li>imagen5.jpg</li>
<li>imagen6.jpg</li>
<li>imagen7.jpg</li>
...
```
Al igual que antes, manteniendo el html a su alrededor.

Todas estas funciones las he creado para el proyecto ecommerce para organizar la información de los productos a mi gusto y para mostrar valores dinámicos directamente en la página que se le envía al cliente sin tener que hacer modificaciones en el cliente de forma que se mantiene un buen SEO, porque google verá la página directamente con la información del producto solicitado sin esperas, sin modificaciones.

Lo próximo es crear funciones para poder mostrar los atributos.

Yo tengo la información de los atributos guardada en el objeto producto = {} de la siguiente manera:
```
producto = {
  titulo: "titulo"
  ...
  atributos: {
    "color": ["rojo", "verde", "naranja" ...],
    "diseño": ["metálico", "verdoso" ...]
  }
}
```
Es decir, los atributos están guardados en un objeto donde cada `key` es el nombre del atributo y cada `value` es un array con los valores del atributo. Así que tendré que crear una funcion como {{loopArray valores}} para mostrar cada una de las propiedades. 

Sin embargo también me interesa la key para tener el nombre del atributo así que tendría que ser algo como {{loop key and valores}} donde valores sea un array que se acceda al igual que hice antes así {{loop key and valores 1}} además de {{loop key and valores -3-}}.

Mañana y los dias siguientes trabajaré en ello.

### Día 12

Hoy voy a trabajar en crear un sistema para mostrar los atributos tal y como dije ayer.

- Un modo sera {{loopKey valores}} para mostrar solo las keys de ese objeto.
- Otro será {{loopArray valores}} para hacer un loop de los valores del array.

De modo que si tengo un código así:

```
<h1>{{loopKey valores}}</h1>
<ul><li>{{loopArray valores}}</li></ul>
```

Me muestre:

```
<h1>Color</h1>
<ul>
  <li>Verde</li>
  <li>Rojo</li>
  <li>Naranja</li>
</ul>
<h1>Tamaño</h1>
<ul>
  <li>S</li>
  <li>M</li>
  <li>L</li>
</ul>
<h1>Forma</h1>
<ul>
  <li>Cuadrada</li>
  <li>Redonda</li>
  <li>Triangular</li>
</ul>
``` 

Donde el objeto es:

```
producto = {
  atributos: {
    "color": ['rojo', 'verde', 'naranja']
    "tamaño": ['s', 'm', 'l']
    "forma": ['cuadrada', 'redonda', 'triangular']
  }
}
```

Sin embargo, todavía no me queda muy claro como delimitar las zonas que se repiten. Mi objetivo es poner solo una línea de código {{}} y que se muestren los valores inmediatamente sin mayores cambios.

Voy a ponerme a hacerlo a ver que se me ocurre. Además no voy a crear funciones como las de antes tipo {{loop valores 3}} porque para mi caso no hace falta.

### Dia 13

Hoy empezamos fuerte. Ayer estuve trabajando en conseguir crear la etiqueta de atributos y hoy lo he conseguido.

Funciona así:
- Pones el bloque donde se van a meter los atributos con `{{loopKey atributos}}` y lo cierras `{{\loopKey atributos}}`. Como yo voy a meter los atributos en un dropdown para seleccionar las opciones lo he metido en un select así:
```
<h4>{{loopKey atributos}}</h4>
  <select>
    <option></option>
    ...
  </select>
{{/loopKey atributos}}
```
Lo que se va a repetir es el bucle entero incluido el h4.
- Luego pones el `{{loopArray atributos}}` para sacar los valores de cada atributo ya que están metidos en un array como vimos ayer. Este no hay que cerrarlo porque repite la misma línea. Osea que si lo ponemos así `<option>{{loopArray atributos}}</option>` nos repetirá el bloque entero incluidas las etiquetas de option para crear el html correctamente.

Al final sería esto:
```
<h4>{{loopKey atributos}}</h4>
  <select>
    <option>{{loopArray atributos}}</option>
    ...
  </select>
{{/loopKey atributos}}
```
Y el html renderizado (al sustituir cada funcion por su contenido html) quedaría así:
```
<h4>Atributo color</h4>
<select>
  <option>Valor rojo</option>
  <option>Valor verde</option>
  <option>Valor naranja</option>
  ...
</select>
<h4>Atributo diseño</h4>
<select>
  <option>Valor estampado</option>
  <option>Valor sucio</option>
  <option>Valor moderno</option>
  ...
</select>
```
Lo de valor y atributo lo he puesto para que sepas que es cada cosa. En definitiva, esta función compuesta saca los valores y keys de un objeto dentro del objeto productos.

Ahora voy a trabajar en crear el diseño de la página de productos. Será simplemente transladar el html y css del admin-dashboard a esta página para tener el mismo diseño.

--

Resultó no ser tan facil transladar la página de añadir productos a la página de producto porque tiene muchos detalles necesarios para javascript que realmente no tienen utilidad para la página de producto. Además el css de casi 300 líneas es demasiado complejo para encontrar lo que me interesa.

Por eso me he decidido a crear el diseño de nuevo en un archivo separado de css ordenado por las 3 secciones principales de la web.

El diseño de la página de productos está quedando excelente. Me gusta mucho porque queda todo muy claro con separaciones discretas. 

Mañana continuaré trabajando en ello y espero tenerlo listo con diseño responsive. Aparte tengo una pequeña lista de tareas por hacer en un archivo markdown para llevar un registro de por donde voy.

En principio no tengo pensado más que añadir una página principal para ver y ordenar productos y una página detallada para cada producto. Por supuesto que iré ampliando conforme avance este maravilloso proyecto.

### Día 14

Hoy voy a trabajar en hacer el diseño de la página de producto responsive. Porque es un tarea que no quiero hacer, voy a ponerme un temporizador de una hora para terminarlo y así quitarmelo de en medio.

--

Lo he conseguido hacer en la hora exacta. Justo cuando a sonado el ruido de finalización, es cuando he terminado -sorprendente-.

Además he hecho que el widget de las imágenes funcione. Al hacer hover sobre las miniaturas, se te ponen en la pantalla principal automáticamente con al escala correcta. Muy vistoso a lo amazon, lo cual es genial.

Por hoy he terminado porque me voy a poner a subir videos a youtube que me están dando mucho dinero y es un negocio que quiero escalar a lo grande.

Mañana continuaré reparando los bugs siguientes: 
- El widget de las imágenes del admin-add-product tiene que escalarse correctamente en teléfonos móviles.

- Las categorías tienen que guardarse en el servidor en un objeto aparte que se recibirá al cargar la página de añadir producto para tener unas categorías fijas.

- En la página de añadir producto tengo que comprobar en tiempo real si el permalink está disponible o no porque es la clave primaria de la base de datos de los productos y no puede estar repetida.

- Guardar los productos en borrador de modo que no sean accesibles públicamente.

Para hacer un recuento de lo que queda por conseguir, tengo que terminar las siguientes paginas y widgets:

- Página de compra de productos: Será un proceso de 1 sola página y tendrá un indicador en la parte superior para saber lo que queda por hacer como en amazon. 

- Función de compra de productos con tarjeta de credito como metodo principal y paypal como método secundario. En esta parte tendré que investigar cómo funcionan los mecanismos de pago con tarjeta. Para ello buscaré información sobre authorize.net que es la página que se encarga de este tipo de tareas. Luego seguramente tenga que instalar un certificado SSL en el servidor para poder tener una conexión segura y cifrada. Estimo que esta parte completa tardará 1 semana porque es un proceso muy laborioso y complejo además de no saber exactamente el procedimiento para incorporar estas tecnologías a mi web.

- Página de editar productos en la que podré hacer cambios todo en ajax sobre la información del objeto de productos.

- Página de dashboard para ver los productos disponibles actualmente en la tienda, productos en borrador, ventas realizadas, visitas a cada página, análisis de clicks, donde clicka la gente guardar con ajax js.

- Página de usuario comprador para poder ver sus pedidos.

- Widget del carrito para guardar productos, editarlos y comprarlos.

- Página principal con sus diferentes secciones y productos principales, tal vez incluya un slider.

- Widget de productos recomendados.

- Widget de opiniones.

- Función de ab testing para mostrar versiones diferentes de la misma página a distintos compradores para testear conversiones.

### Día 15 

Hoy voy a trabajar en terminar las tareas sencillas que me quedan para perfeccionar el diseño y funcionamiento de las páginas hechas hasta ahora.

### Día 16

Ayer estuve trabajando en corregir esas funcionalidades del permalink y de la categoría.

Lo que me queda completar es enviar las categorias al servidor para que se guarden en la base de datos y poder acceder a ellas en el momento que quiera añadir un nuevo producto.

Para ello he usado la función de mongodb update pero me está dando errores. Voy a comprobar que pasa y una vez completado, decidiré en que trabajar a continuación.

--

Lo acabo de completar. Me ha costado una hora aproximadamente pero lo tengo funcionando a la perfeccion. Ahora voy a subir videos a youtube para ganar dinero y trataré de continuar mañana o más adelante con la creación de la página de edición de productos.

--

Son las 10 y media de la noche. Me voy a dormir a las 12 y algo por lo que quiero continuar con el proyecto. Como dije antes, ahora tengo que hacer la página de edición de productos para ver cuáles están disponibles y poderlos modificar rápidamente. Pues vamos a ello! Te contaré hoy o mañana lo que he logrado. No es increíble? Lo digo e inmediatamente puedes leer los resultados, pero la verdad es que dedico todo el tiempo necesario real para conseguir esto. Esto es así y me encanta.

-- 

Al final he programado durante 1 hora. 

Lo que he conseguido es crear una nueva página con 3 secciones que al principio eran 2:
- Un menú lateral para moverte por las categorías y subcategorías.
- Una sección donde ver todos los productos ordenados en vertical.
- Una sección en la que previsualizar el producto seleccionado para hacerle los cambios deseados.

Mañana continuaré jugando con el css para darle el diseño que quiero ya que me estoy basando en el backend del CMS Ghost, una plataforma tipo wordpress centrada en hacer blogs sencillos y programada sobre nodejs. Aunque en mi opinion no vale mucho la pena porque te limita demasiado lo que puedes hacer en tu blog, no te deja modificar fácilmente el diseño como sí puedes hacerlo en wordpress.

### Día 17

Hoy voy a continuar trabajando en la página de edición de productos hasta tenerla completada con un diseño que me guste. 

Tengo pensado poner las categorias en el menú lateral izquierdo para ordenar los productos más fácilmente.

--

He estado creando la apariencia que tendrá cada producto en el backend. Se van a organizar de una manera sencilla en vertical con información del servidor.

Ahora estoy trabajando en conseguir la información del servidor para mostrar los productos con cada una de sus características.

--

He conseguido la información con una simple consulta a la base de datos de los productos. Sin embargo tengo que limitar la consulta a 100 o 200 para que la página tarde mucho en cargar, a pesar de ser una carga en ajax.

Luego, me he encontrado con un error para mostrar las imágenes de los productos, ya que no puedo simplemente copiar todas las imagenes de todos los productos que quiera mostrar porque perdería mucho tiempo moviendo imágenes que tal vez no llegue a ver. La idea es tener la imagen principal de producto y que cuando le haga click para ver más detalles, me cargue las imágenes concretas del servidor, pero solamente cuando haga falta para no desaprovechar recursos.

Tengo 2 opciones:
1. Copiar todos los directorios de imágenes (muy lento) limitado por 10, 20, 50 o 100 productos.
2. Copiar solo la primera imágen de cada directorio (más rápido) para luego hacer un ajax aparte para sacar las imágenes de cada producto.

En cualquier caso, eligiré la mejor opción para mostrar las imágenes de los productos mañana, porque hoy tengo que estudiar para el examen de formacion y orientacion laboral del módulo superior de desarrollo de aplicaciones web.

### Día 18

Ayer fue un día lleno de errores. Ya que cada día, al completar el proyecto, lo que hago es subirlo a github para que se almacene el código de forma segura y poder acceder a versiones anteriores con facilidad en caso de errores.

El problema fue que guardé un archivo con el nombre terminando en espacio y windows daba error al no poder reconocerlo.

En definitiva, que me tiré mucho tiempo tratando de arreglar este y otros errores pero la buena noticia es que lo conseguí.

Hoy voy a continuar trabajando en la página de edición de productos. Igualmente tengo que repasar la página de subida de productos porque no está funcionando como debería con multitud de errores.

### Día 19

Ayer fue un día ocupado. Estuve reinstalando windows 10 con todo lo que conlleva, haciendo backups de los archivos, descargando una copia legal y reinstalando todo de nuevo. De forma que estuve casi todo el día con ello.

Hoy sin embargo, voy a ponerme a trabajar en serio y mi objetivo es hacer al menos 2 horas y crear un vídeo decente para mi canal de youtube.

Voy a continuar con la edición de productos.

### Día 20

Ayer estuve remodelando la estructura de la aplicación porque se me ha desorganizado de tal manera que me cuesta encontrar donde esta cada cosa. 

Hoy voy a trabajar en arreglar la página de subida de productos y en crear la página de edicion de productos. Pero antes voy a arreglar el desorden causado por el orden.

### Día 21

Entre ayer y hoy completé la reestructura de la aplicación en la parte del servidor. Lo que hice fue ordenar las rutas por los tipos que había para tener un acceso mucho más facil.

Hoy voy a continuar trabajando en la página de edición de productos para poder ver todos los productos que hay disponibles, editarlos y borrarlos.

### Dia 22

Ayer estuve trabajando en la página de editar productos. Conseguí introducir la parte de añadir productos al igual que se muestra en la página de añadir productos ya que quiero usar el mismo "pack" de formularios para editar los productos.

Sin embargo no está bien integrado. Hay que hacerle cambios visuales en el sentido de que no se adapta bien en pantallas pequeñas y el diseño está, digamos "descolocado" por lo que tengo que arreglar eso.

Hoy estuve trabajando en lo mismo y he conseguido lo siguiente:

- Que la parte de productos donde salen en forma de lista se vea bien estéticamente con botones "Ver", "editar" y "borrar".
- Que a la parte de editar producto se le añada el contenido para poder modificarlo y enviarlo al servidor en cuanto se completen los cambios.

Mañana continuaré trabajando en ello para tener un diseño digno de ver con una calidad excepcional. Presiento que esta seccion de editar productos me tomará mas tiempo del esperado ya que tengo que integrar numerosas partes por separado como los widgets y el nuevo diseño.

### Día 23

Como dije ayer, hoy voy a continuar trabajando en el diseño de la aplicación para que se pueda añadir y modificar los productos desde una única página bien diseñada.

### Día 24

Estuve trabajando en mejorar la interfaz gráfica aparte del widget de las categorías. Ha sido un día lleno de cosas.

### Día 25 

Hoy estuve trabajando en los widgets de categoría y atributos ya que voy a mover la funcion de añadir productos a la página de editar productos y así tenerlo todo organizado en un lugar en el que añadir y editar.

Las categorías se reciben y se muestran correctamente en su sitio, esta vez en un dropdown bastante simplificado para hacerlo todo mas facil y los atributos me falta por saber si funcionan o no, porque tras tantos cambios no puedo añadir nuevos productos con facilidad y los que hay ahora mismo no tienen atributos.

Además, estuve trabajando en reorganizar el código de los diferentes widgets en funciones más sencillas para hacer todo un poco mas entendible. Luego he hecho que las imágenes se muestren al cargar la edición del producto, sin embargo, no se muestran correctamente porque tengo que ajustar el css.

Estoy pensando en crear o implementar un sistema de grid o cajas para organizar todo el proyecto de manera ordenada. Aunque no creo que lo lleve a cabo porque hay partes muy específicas como las imágenes secundarias que se tienen que mostrar de forma precisa.

Igualmente, sigo trabajando en el proyecto y ahora mismo tiene una apariencia increible. A pesar de estar lleno de errores, es una maravilla. Espero no perder la motivación y recordar continuamente el porqué he empezado, mi gran objetivo: crear the next big thing al igual que lo hizo facebook, amazon y google.

### Dia 26

Sigo trabajando en subir los productos y modificarlos. Ahora estoy tratando de arreglar bugs.

Mañana continuaré trabajando en ello tras estudiar.

### Día 27

La página de edición y añado de productos ya está completa, solo se necesita hacerla responsive y arreglar unos mínimos errores.

Hoy ha sido un día muy productivo.

### Día 28

Hoy estuve trabajando en funcionalidades bastante sencillas pero muy necesarias como un diseño estático con un tamaño fijo que no se mueva.

Tuve que reordenar el css de muchos de los elementos para conseguir que se colocasen en su lugar correcto.

Luego trabajé en el diseño responsive y he conseguido llegar a los 1000 px de tamaño. Me queda bajar al resto hasta alrededor de 300 px.

Mañana continuaré trabajando en ello.

### Día 29

Hoy estuve tratando de hacer responsive la página con mútiples problemas.

La organización de los menús y el filtro de categorías no es como me gustaría, por lo que lo voy a cambiar a un estilo más sencillo y ordenado.

Hoy fue un día sencillo.

### Día 30

Hoy he trabajado en el diseño responsive. Para ello he reoganizado los menús al estado inicial, una barra superior con las principales páginas. Luego he añadido un selector dropdown en la seccion de las cajas de los productos y el boton de nuevo producto en ese sitio.

Además, he creado un botón tipo hamburguesa para ocultar la sección de cajas de productos con una animación de movimiento y un desenfoque en el fondo.

Mañana continuaré trabajando en el menú responsive y esto es lo que tengo pensado lograr:

- Que la página se adapte a pantallas pequeñas.
- Que se oculte el menú en dispositivos más  pequeños de fora automática (ya lo hace pero falta mejorarlo).
- Que vuelva a funcionar el filtro de categorias ya que con los cambios dejo de funcioinar.
- Que el botón de hamburguesa funcione en los 2 modos que tengo pensado de manera efectiva y ordenada (ahora mismo es un desorden).

### Dia 31

Hoy fue un día de poco trabajo. He estado creando el menú principal de las páginas publicas que no son de administrador y tras muchas vueltas y cambios, he decidido implantar flexbox puesto que al principio no conseguí el look que buscaba pero lo acabé logrando tras trastear con los margins y los flexs.

### Día 32 

Son las 11 y acabo de completar el menú con responsive y un diseño a lo amazon muy acertado.

Este menú tiene un dropdown con las categorías o departamentos que se muestra al hacer click en "departamentos".

Se ve igualmente bien en todos los dispositivos y creo que he logrado un diseño bastante agradable.

A continuación, toca implantar javascript para conseguir las categorias del servidor, darle funcionalidad al buscador, crear la página de usuario con registro y crear el carrito de la compra.

De momento voy a descansar y a aprender un poco de desarrollo android con un curso de edx que tiene muy buena pinta. Más tarde continuo con esto. Mi objetivo para hoy es tener las categorías y el buscador listos con autosuggest.

### Día 33

Hoy continuo trabajando en la web. Acabo de mejorar la barra de busqueda de forma que te sugiera los productos y te muestre el precio a su lado.

Luego he hecho que las búsquedas que hace el usuario se pasen como parámetro en la url y se guarden en la base de datos en una nueva entidad llamada 'busquedas' con la palabra buscada y las veces que se buscó.

Esto es extremadamente útil para tener un registro de lo que quiere comprar la gente, lo que les interesa. Más adelante consideraré la opción de guardar además la acción que toma el usuario tras buscar para hacer un poco de SEO mostrando los productos que la gente más busca los primeros. Además de registrar cuales se hacen click tras las búsquedas al igual que hace amazon.

Hoy voy a avanzar creando la página principal en la que se verán los productos directamente por orden de publicación, esto avanzará a un diseño más completo más adelante.

### Dia 34

Hoy simplemente he trabajado en mejorar la barra de búsqueda y en reorganizar un poco el código.

### Día 35

Hoy estoy trabajando en la pagina principal. He descubierto que para alinear siempre en el centro hay que combinar las propiedades top y margin-top y left y margin-left.

De forma que se le pone un top 50% o un left de 50% y el margin negativo de la mitad del tamaño de la imagen. Si es top, sera un margin-top -tamañoImagen. Siempre con el position absolute o relative activado puesto que es lo que permite usar las propiedades top, left, bottom y right.

Otro truco para alinear que he descubierto es usar position relative o absolute y ponerle top: 0 bottom: 0 y margin auto o en el left y right si lo quieres alinear justo en el centro;

### Día 36

Hoy he comenzado trabajando en la página del slider. No ha sido mucho, pero he hecho algunos pequeños cambios a mejor solucionando errores. Además de añadir la opción de resetear el slider.

Particularmente esa función me ha tomado bastante tiempo puesto que no sabía porqué no podía publicar otra vez las imágenes tras resetear. Resultó ser que el value del input file se mantenia aunque resetease y si publicaba exactamente las mismas imágenes, no se activaba el listener onchange del input.

Lo solucioné y luego añadí la funcionalidad de subir el slider al servidor además de guardar las imágenes en la base de datos para poder acceder a ellas más adelante en la página inicial de la web.

Mañana trabajaré en crear las cajas mini slider que permitan ver muchos productos por tipo como "Los más vendidos", "Los más valorados", "Mejor calidad precio" y similares. Por eso hoy pensaré en cuales poner y en cómo hacerlo. Además me gustaría poner mini sliders con recomendaciones personalizadas a lo que busca y mira cada cliente aunque eso es más adelante como funcionalidad importante.

También voy a mirar cómo ir haciendo la pasarela de pagos por paypal y tarjetas de crédito con seguridad ssl en el servidor. Lo de integrar paypal ya lo hice una vez el año pasado pero no consegui implementar pagos por tarjeta directamente, lo cual voy a investigar a fondo, aunque pagar por stripe es una muy buena elección.

### Día 37

Hoy ha sido un día jodido, mi madre no para de gritar constantemente coo una loca, lo cual me dificulta mucho trabajar en la web app.

Sin embargo he logrado crear el primer minislider de los productos más vendidos para que se vayan mostrando automáticamente. Le falta mejorar bastante el diseño y reparar el setinterval para que se vayan mostrando solas las imágenes.