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
    let modificadorPropiedad = undefined;
    let modificadorPropiedadAdicional = undefined;

    //Extraemos la key de la tag en orden. Si no es {{propiedad}}, en cuyo caso el modificador es null.
    let splitDeTag = selectedTag.split(' ');

    if(splitDeTag.length === 2){
      modificadorPropiedad = splitDeTag[0];
      propiedad = splitDeTag[1];
    }else if(splitDeTag.length === 3){
      modificadorPropiedad = splitDeTag[0];
      propiedad = splitDeTag[1];
      modificadorPropiedadAdicional = splitDeTag[2];
    }
    
    //Ejecutamos el replace que corresponda a esa tag.
    switch(modificadorPropiedad){
      case undefined: //{{propiedad}}
        let re = new RegExp("{{"+propiedad+"}}", "g");
        let match = '';
        while((match = re.exec(content)) != null){
          content = content.replace(re, dataObject[propiedad]);
        }
      break;

      case 'each':
        /*
        Para: array simple.
        Prohibiciones: 
        - No se puede poner más de 1 vez la {{propiedad}} dentro del each.
        - No se puede meter el mismo each dentro del each porque la etiqueta de cierre daría errores.
        Se puede:?
        - Poner el mismo each no nested en diferentes lugares varias veces.
        Funcionamiento:
          1. Extraer todo
          2. Repetir lo que hay dentro del each por cada elemento del array 
          3. Juntar lo que hay antes y después del each en la linea y meter dentro el array final
        */
        let each = new RegExp("(.*){{each "+propiedad+"}}([\\s\\S]*?){{\\/each "+propiedad+"}}(.*)");
        let array = dataObject[propiedad],
          regexInterno = new RegExp("(.*){{"+propiedad+"}}(.*)"),
          execEach = '';

        while((execEach = each.exec(content)) != null){
          let contenidoFinal = '',
            execInterno = regexInterno.exec(execEach[2]);
          for (let i = 0; i < array.length; i++) {
            contenidoFinal += execInterno[1]+array[i]+execInterno[2]+'\n';
          }
          contenidoFinal = execEach[1]+contenidoFinal+execEach[3];
          content = content.replace(each, contenidoFinal);
        }
      break;

      case 'array':
        /*
        Para: array de objetos con muchas keys [{data: data}, {data: data}].
        Funcionamiento:
          1. Loop al array, cada ocurrencia es 1 objeto con las propiedades del producto
          2. Loop al objeto con forin para reemplazar cada propiedad con su valor en el html
          3. Guardar cada html con su valor reemplazado en una variable contenidoFinal
          4. Reemplazar la ocurrencia de {{array propiedad}} con el contenidoFinal        
        */
        let reArray = new RegExp("{{array "+propiedad+"}}([\\s\\S]*?){{\\/array}}"),
          contenidoMatch = reArray.exec(content)[1],
          arrayObjetos = dataObject[propiedad],
          contenidoFinal = '';
        for (let i = 0; i < arrayObjetos.length; i++) {
            let objetoProducto = arrayObjetos[i],
              contenidoProducto = contenidoMatch;
            for (let propiedadProducto in objetoProducto) {
                let newRe = new RegExp("{{"+propiedadProducto+"}}"),
                  match = '';
                while((match = newRe.exec(contenidoProducto)) != null){
                  contenidoProducto = contenidoProducto.replace(newRe, objetoProducto[propiedadProducto]);
                }
            }
            contenidoFinal += contenidoProducto;
        }
        content = content.replace(reArray, contenidoFinal);
      break;

      case 'loopKey':
        let loopObject = dataObject[propiedad];
        let reKeyWithTagsBig = new RegExp("^(.*){{loopKey " + propiedad + "}}(.*)([\\s\\S]*){{\\/loopKey " + propiedad + "}}.*$", "gm");
        let reArrayWithTags = new RegExp("^([\\s\\S]*)[\\n|\\r](.*){{loopArray " + propiedad + "}}(.*)([\\s\\S]*)$", "gm");
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
      break;

      case 'object':
        let reObject = new RegExp("{{object "+propiedad+" [0-9]}}");

        if(modificadorPropiedadAdicional === undefined){
          let reObjectFull = new RegExp("(.*){{object "+propiedad+"}}(.*)");
          let loopObject = dataObject[propiedad],
            textoFinal = "",
            match = reObjectFull.exec(content);

          for (let key in loopObject) {
            if (match != null && loopObject[key] != undefined) textoFinal += match[1] + loopObject[key] + match[2] + "\n";
          }
          content = content.replace(reObjectFull, textoFinal);
        }else{
          let key = modificadorPropiedadAdicional;
          content = content.replace(reObject, dataObject[propiedad][key]);
        }
      break;

      case 'if':
        //El reif solo acepta un booleano y tiene que estar en una nueva linea
        let reIfElse = new RegExp("{{if "+propiedad+"}}([\\s\\S]*?){{else "+propiedad+"}}([\\s\\S]*?){{\\/if "+propiedad+"}}", "g"),
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
        }else if (reIfClassic.test(content)) {
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
        }
      break;
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