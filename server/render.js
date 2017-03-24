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
2. Identificar la key dentro de la tag {{if key}} con un split para saber la key porque la tag es inusable en el regex
3. En el {{if}} extraer recursivamente y sustituir desde fuera hasta dentro para conseguir ordenar todo esto

*/

function renderData(content, dataObject, cb) {
  let tag = /{{(?!else)([^>|\/].*?)}}/,
      selectedTag = '',
      error = null;

  //Renderizamos los includes
  let reIncludePartial = new RegExp("{{> (.*)}}", "g");
  if(reIncludePartial.test(content)){
    reIncludePartial.lastIndex = 0;
    let partiales = [],
      partialNombre = '',
      index = 0;
    //Creamos un array con los nombres de los includes a poner
    while(partialNombre = reIncludePartial.exec(content)){
      partiales.push(partialNombre[1]);
    }
    for (var i = 0; i < partiales.length; i++) {
      let partialName = partiales[i];
      //El partialName[1] es el grupo regex primero entre parentesis ( ) para sacar el nombre partial
      let partial = path.join(__dirname, '../public/views/partials/', partialName+'.html');
      fs.readFile(partial, 'utf-8', (err, partialContent) => {
        index++;
        if(err) error = err;
        let rePartial = new RegExp("{{> "+partialName+"}}");
        content = content.replace(rePartial, partialContent);

        if(index >= partiales.length)
          renderTags();
      });
    }
  }else{
    //If no includes just render tags
    renderTags();
  }

  function renderTags(){
    while (selectedTag = tag.exec(content)) {
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
          Uso:
          {{each propiedad}}
            {{propiedad}}
          {{/each propiedad}}
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

          while((execEach = each.exec(content)) != null){ //Busca todos los each que tengan la propiedad
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
          Para: array de objetos con muchas keys [{data: data}, {data1: data1, data2: data2}].
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
          /*
            If inline
            Pasos:
             1. Extraemos la línea del if y comprobamos si es if else o un if normal.
             2. Sustituimos el contenido usando el if correspondiente. Si no se cumple y es if solo, entonces solo eliminar.
          */
          let linea = new RegExp("(.*){{if "+propiedad+"}}(.*)"),
            inlineIf = new RegExp("(.*){{if "+propiedad+"}}(.*){{\\/if "+propiedad+"}}(.*)"),
            inlineIfElse = new RegExp("(.*){{if "+propiedad+"}}(.*){{else "+propiedad+"}}(.*){{\\/if "+propiedad+"}}(.*)"),
            contenidoLinea = '';

          contenidoLinea = linea.exec(content)[0];
          //1
          if(inlineIfElse.test(contenidoLinea)){
            let contenidoLineaIfElse = inlineIfElse.exec(contenidoLinea),
              resultHTML = '';

            if(dataObject[propiedad] === true){
              resultHTML = contenidoLineaIfElse[1]+contenidoLineaIfElse[2]+contenidoLineaIfElse[4];
              content = content.replace(inlineIfElse, resultHTML);
            }else{
              resultHTML = contenidoLineaIfElse[1]+contenidoLineaIfElse[3]+contenidoLineaIfElse[4];
              content = content.replace(inlineIfElse, resultHTML);
            }
          }else{
            let contenidoLineaIf = inlineIf.exec(contenidoLinea),
              resultHTML = '';

            if(dataObject[propiedad] === true){
              resultHTML = contenidoLineaIf[1]+contenidoLineaIf[2]+contenidoLineaIf[3];
              content = content.replace(inlineIf, resultHTML);
            }else{
              content = content.replace(inlineIf, '');
            }
          }
        break;

        case '#if':
          /*
            If de bloque para casos de gran contenido.
            Condiciones:
            - Debe tener el mismo nombre de propiedad en el if propiedad, else propiedad y en /if propiedad.
            - El modificadorPropiedadAdicional debe ser único y obligatorio.
            Pasos:
            - Renderizar los ifs según su nombre extra.
          */
          let regexIf = new RegExp(`{{#if ${propiedad} ${modificadorPropiedadAdicional}}}([\\s\\S]*){{\\/if ${propiedad} ${modificadorPropiedadAdicional}}}`),
            regexIfElse = new RegExp(`{{#if ${propiedad} ${modificadorPropiedadAdicional}}}([\\s\\S]*?){{else ${propiedad} ${modificadorPropiedadAdicional}}}([\\s\\S]*?){{\\/if ${propiedad} ${modificadorPropiedadAdicional}}}`);

          if(regexIfElse.test(content)){
            let regexInterior = regexIfElse.exec(content);
            if(dataObject[propiedad] === true){
              content = content.replace(regexIfElse, regexInterior[1]);
            }else{
              content = content.replace(regexIfElse, regexInterior[2]);
            }
          }else{
            let regexInterior = regexIf.exec(content);
            if(dataObject[propiedad] === true){
              content = content.replace(regexIf, regexInterior[1]);
            }else{
              content = content.replace(regexIf, '');
            }
          }
        break;
      }
    }
    //Devolvemos el callback
    if(selectedTag == null){
      renderTime = (new Date().getTime() - renderTime);
      console.log(`\nRender time: ${renderTime}\n`);
      if(error) cb(error, null);
      else cb(null, content); 
    }
  }
};