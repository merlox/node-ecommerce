let fs = require('fs'),
    path = require('path');

let renderTime = '';

module.exports = render;

function render(page, dataObject, cb) {
    fs.readFile(page, 'utf-8', (err, data) => {
        if (err) return cb('No se pudo leer la página a renderizar.', null);
        renderTime = new Date().getTime();
        renderData(data, dataObject, (err, renderedPage) => {
            if (err) return cb('No se pudo leer la página a renderizar.', null);
            cb(null, renderedPage);
        });
    });
};

/*

1. Extraer las tags en orden {{.*}}
2. Identificar la key dentro de la tag {{if key}} con un split para saber la key porke la tag es inusable en el regex
3. En el {{if}} extraer recursivamente y sustituir desde fuera hasta dentro para conseguir ordenar todo esto

*/

function renderData(content, dataObject, cb) {
  let tag = /{{(?!else)([^>|\/].*?)}}/,
      selectedTag = '';

  while ((selectedTag = tag.exec(content)) !== null) {
    selectedTag = selectedTag[1];
    let propiedad = selectedTag;

    //Extraemos la key de la tag en orden. Si no es {{propiedad}}
    if(selectedTag.split(' ').length === 2){
      propiedad = selectedTag.split(' ')[1];
    }else if(selectedTag.split(' ').length === 3){
      propiedad = selectedTag.split(' ')[1];
    }

    let re = new RegExp("{{"+propiedad+"}}", "g"),
      reObject = new RegExp("{{object "+propiedad+" [0-9]}}"),
      reObjectFull = new RegExp("{{object "+propiedad+"}}"),
      reLoopKey = new RegExp("{{loopKey " + propiedad + "}}"),
      //Para hacer loop sobre un array de objetos
      reArray = new RegExp("{{array " + propiedad + "}}([\\s\\S]*?){{\\/array}}"),
      //El reif solo acepta un booleano y tiene que estar en una nueva linea
      reIfElse = new RegExp("{{if "+propiedad+"}}([\\s\\S]*?){{else "+propiedad+"}}([\\s\\S]*?){{\\/if "+propiedad+"}}", "g"),
      reIfClassic = new RegExp("(.*){{if "+propiedad+"}}([\\s\\S]*?){{\\/if "+propiedad+"}}(.*)", "g");

    if (reIfElse.test(content)) {
      reIfElse.lastIndex = 0;
      //Hacemos un while para todas las instancias identicas
      let contenidoIfElse = '',
        valorPropiedad = dataObject[propiedad];

      while((contenidoIfElse = reIfElse.exec(content)) != null){
        if (valorPropiedad === true) {
          content = content.replace(reIfElse, contenidoIfElse[1]);
        } else {
          content = content.replace(reIfElse, contenidoIfElse[2]);          
        }
      }
      continue;
    }
    
    if (reIfClassic.test(content)) {
      reIfClassic.lastIndex = 0;
      let contenidoIf = '',
        valorPropiedad = dataObject[propiedad];
      while((contenidoIf = reIfClassic.exec(content)) != null){
        let contenidoHTML = '';
        if (valorPropiedad === true) {
          contenidoHTML = contenidoIf[1]+contenidoIf[2]+contenidoIf[3];
          content = content.replace(reIfClassic, contenidoHTML);
        } else {
          content = content.replace(reIfClassic, '');
        }
      }
      continue;
    }

    if (re.test(content)) {
      //Regex.test mueve el lastIndex.
      re.lastIndex = 0;
      let match = '';
      while((match = re.exec(content)) != null){
        content = content.replace(re, dataObject[propiedad]);
      }
      continue;
    }

    if (reObjectFull.test(content)) {
      reObjectFull = new RegExp("(.*){{object "+propiedad+"}}(.*)");
      let loopObject = dataObject[propiedad],
        textoFinal = "",
        match = reObjectFull.exec(content);

      for (let key in loopObject) {
        if (match != null && loopObject[key] != undefined) textoFinal += match[1] + loopObject[key] + match[2] + "\n";
      }
      content = content.replace(reObjectFull, textoFinal);
      continue;
    }else if (reObject.test(content)) {
      let key = selectedTag.split(' ')[2];
      content = content.replace(reObject, dataObject[propiedad][key]);
      continue;
    }

    if (reLoopKey.test(content)) {
      let loopObject = dataObject[propiedad];
      let reKeyWithTagsBig = new RegExp("^(.*){{loopKey " + propiedad + "}}(.*)([\\s\\S]*){{\\/loopKey " + propiedad + "}}.*$", "gm");
      let reArrayWithTags = new RegExp("^([\\s\\S]*)[\n|\r](.*){{loopArray " + propiedad + "}}(.*)([\\s\\S]*)$", "gm");
      let matchKeyBig;
      let matchArray;
      let textoFinal = "";
      matchKeyBig = reKeyWithTagsBig.exec(content);
      matchArray = reArrayWithTags.exec(matchKeyBig[3]);
      for (let key in loopObject) {
          textoFinal += matchKeyBig[1] + key + matchKeyBig[2] + '\n';
          //Lo que hay antes del <option> es matcharray[1]
          textoFinal += matchArray[1];
          for (let i = 0; i < loopObject[key].length; i++) {
              let itemArray = matchArray[2] + loopObject[key][i] + matchArray[3] + "\n";
              textoFinal += itemArray;
          }
          //Lo que hay despues del <option> es matcharray[4]
          textoFinal += matchArray[4];
      }
      content = content.replace(reKeyWithTagsBig, textoFinal);
      textoFinal = "";
      continue;
    }

    if (reArray.test(content)) {
      //Al ejecutar el .test el index se mueve al ser un buscador global /g con lo que al hacer el exec,
      //el content ya se ha pasado hasta el final
      let contenidoMatch = reArray.exec(content)[1];
      let array = dataObject[propiedad];
      let contenidoFinal = '';
      //Para cada ocurrencia del array crear texto
      //[{objetoProducto1},{objetoProducto2},{objetoProducto3}]
      //1. Loop al array, cada ocurrencia es 1 objeto con las propiedades del producto
      //2. Loop al objeto con forin para reemplazar cada propiedad con su valor en el html
      //3. Guardar cada html con su valor reemplazado en una variable contenidoFinal
      //4. Reemplazar la ocurrencia de {{array propiedad}} con el contenidoFinal
      for (let i = 0; i < array.length; i++) {
          let objetoProducto = array[i];
          let contenidoProducto = contenidoMatch;
          for (let propiedadProducto in objetoProducto) {
              let newRe = new RegExp("{{" + propiedadProducto + "}}");
              let match = '';
              while((match = newRe.exec(contenidoProducto)) != null){
                contenidoProducto = contenidoProducto.replace(newRe, objetoProducto[propiedadProducto]);
              }
          }
          contenidoFinal += contenidoProducto;
      }
      content = content.replace(reArray, contenidoFinal);
      continue;
    }
  }

  if(selectedTag == null){
    //Renderizamos los partiales
    let reIncludePartial = new RegExp("{{> (.*)}}", "gm");
    if(reIncludePartial.test(content)){
      //Reseteamos el last index para que nos dé todos los contents desde el principio, porque
      //al ejecutar el if se pasa al siguiente content. Cada vez que se ejecuta cualquier metodo
      //de un objeto regex, se mueve el puntero solo si tenemos puesta la flag global "g".
      reIncludePartial.lastIndex = 0;
      //El include partial es un regex que busca cualquier include sin saber su valor
      let error = null;
      let partiales = [];
      let partialNombre = '';
      //Creamos un array con los nombres de los includes a poner
      while((partialNombre = reIncludePartial.exec(content)) != null){
        partiales.push(partialNombre[1]);
      }
      let index = 0;
      partiales.forEach((partialName) => {
        //El partialName[1] es el grupo regex primero entre parentesis ( ) para sacar el nombre partial
        let partial = path.join(__dirname, '../public/views/partials/', partialName+'.html');
        fs.readFile(partial, 'utf-8', (err, partialContent) => {
          if(err) error = err;

          let re = new RegExp("{{> "+partialName+"}}", "gm");
          content = content.replace(re, partialContent);
          index++;
          if(index >= partiales.length){
            renderTime = (new Date().getTime() - renderTime);
            console.log(`\nRender time: ${renderTime}\n`);
            if(error) cb(error, null);
            else cb(null, content);
          }
        });
      });
    }else{
      renderTime = (new Date().getTime() - renderTime);
      console.log(`\nRender time: ${renderTime}\n`);
      //Si no hay includes devolver la pagina con los cambios del dataObject
      cb(null, content);
    }
  }
};