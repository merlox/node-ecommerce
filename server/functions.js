'use strict';
let Mongo = require('mongodb').MongoClient,
  MongoUrl = 'mongodb://merunas:jakx1234.@ds119508.mlab.com:19508/merunas-mongo',
  fs = require('fs'),
  path = require('path'),
  //Ponemos la secret key de stripe para realizar pagos
  stripe = require('stripe')('sk_test_F2AInFtMIJJpjEQYGvlgdIJ6'),
  db = {};

Mongo.connect(MongoUrl, (err, database) => {
  if(err) console.log(err);
  db = database;
});

function buscarProducto(permalink, callback){
  console.log('BuscarProducto, functions.js');
  permalink = encodeURIComponent(permalink);
  db.collection('productos').findOne({
    'permalink': permalink
  }, {
    '_id': false
  }, (err, result) => {
    if(err){
      return callback('Error, could not find that product', null);
    }else{
      return callback(null, result);
    }
  });
};
//Para buscar muchos productos
function buscarProductos(keyword, limite, cb){
  console.log('BuscarProductos, functions.js');
  if(limite == undefined || limite == null){
    limite = 0;
  }
  limite = parseInt(limite);
  keyword = new RegExp(keyword, "g");
  db.collection('productos').find({
    'titulo': {
      '$regex': keyword,
      '$options': 'i'
    }
  }, {
    '_id': false,
    'imagenes': true,
    'permalink': true,
    'precio': true,
    'titulo': true
  }).limit(limite).toArray((err, results) => {
    if(err){
      return cb('Error, could not find those products', null);
    }else{
      //Copiar la primera imágen
      copyFirstImage(results, (err) => {
        if(err) return cb(err, null);
        cb(null, results);
      });
    }
  });
};
//Funcion para reemplazar o añadir un producto si no existe
function createUpdateProduct(permalink, productData, cb){
  console.log('CreateUpdateProduct, functions,js');
  permalink = encodeURIComponent(permalink);
  db.collection('productos').update({
    'permalink': permalink.toLowerCase()
  }, {
    'titulo': productData.titulo,
    'imagenes': productData.imagenes,
    'permalink': productData.permalink.toLowerCase(),
    'precio': productData.precio,
    'descripcion': productData.descripcion,
    'categoria': productData.categoria,
    'atributos': productData.atributos,
    'publicado': productData.publicado,
    'fecha': productData.fecha,
    'visitas': 0,
    'vendidos': 0
  }, {
    'upsert': true
  }, (err, result) => {  
    if(err){
      return cb('Error: '+err);
    }else{
      return cb(null);
    }
  });
};
//Funcion para subir las imagenes publicas al servidor en uploads
function uploadPublicImages(objectImages, permalinkName, cb){
  console.log('UploadPublicImages, functions.js');
  let publicUploads = path.join(__dirname, '../public/public-uploads/');
  let serverUploads = path.join(__dirname, '/uploads/');
  let objectImagenesSize = Object.keys(objectImages).length;
  let counter = 0;
  permalinkName = encodeURIComponent(permalinkName);
  fs.stat(path.join(serverUploads, permalinkName), (err, stats) => {
    if(err){
      fs.mkdirSync(path.join(serverUploads, permalinkName));
      copy();
    }
    else{
      //Delete the images in the folder
      fs.readdir(path.join(serverUploads, permalinkName), (err, files) => {
        if(err) console.log('Could not read the folder: '+path.join(serverUploads, permalinkName)+' to delete their images '+err);
        files.forEach((file) => {
          fs.unlink(path.join(serverUploads, permalinkName, file), (err) => {
            if(err) console.log('Could not delete the file: '+path.join(serverUploads, permalinkName, file)+' '+err);
          });
        });
        copy();
      });
    }
    function copy(){
      for(let key in objectImages){
        counter++;
        copyFile(path.join(publicUploads, objectImages[key]), path.join(serverUploads, permalinkName), objectImages[key], (err) => {
          if(err){
            return cb('Could not copy the file: '+objectImages[key]+' to the server, please try again: '+err);
          }
        });
        if(counter == objectImagenesSize){
          return cb(null);
        }
      }
    }
  });
};
//Función para conseguir todos los productos y copiar la primera imagen de cada uno al public uploads
function getAllProducts(imageLimit, page, callback){
  console.log('GetAllProducts, functions.js');
  let skipProducts = 0;
  if(page > 1){
    skipProducts = (page-1)*imageLimit;
  } 
  db.collection('productos').find({}).limit(imageLimit).skip(skipProducts).toArray((err, results) => {
    if(err){
      return callback('Err, error searching products: '+err, false);
    }
    if(results != undefined && results.length > 0){
      //Acceder a la carpeta título y copiar la 1º imagen
      copyFirstImage(results, (err) => {
        if(err) return callback(err, false);
        else return callback(null, results);
      });
    }else{
      return callback(null, false);
    }
  });
};
function copyFirstImage(results, cb){
  console.log('Interna - CopyFirstImage, functions.js');
  let error = null;
  let counter = 0;
  if(results.length <= 0){
    console.log('No results found');
    return cb('No results found');
  }
  //Leemos todas las carpetas que coincidan en este for
  for(let i = 0; i<results.length; i++){
    let folderServer = path.join(__dirname, '/uploads/', results[i].permalink);
    let folderClient = path.join(__dirname, '../public/public-uploads/');
    //Comprobamos que exista el directorio
    fs.stat(folderServer, (err, stats) => {
      if(err){
        console.log('El directorio: '+folderServer+' no existe para ese producto ,'+err);
        error = 'El directorio: '+folderServer+' no existe para ese producto ,'+err;
      }else{
        fs.readdir(folderServer, (err, imagesInFolder) => {
          if(err) {
            error = 'Could not read the images in the folder. Try again.';
          }
          //Buscar la primera imagen guardada en la bd para copiarla
          for(let f = 0; f<imagesInFolder.length; f++){
            if(results[i].imagenes[1] == imagesInFolder[f]){
              let firstImageInFolder = path.join(folderServer, imagesInFolder[f]);
              copyFile(firstImageInFolder, folderClient, imagesInFolder[f], (err) => {
                counter++;
                if(err){
                  error = 'Could not copy the images to the client. Try again.';
                }
                if(counter >= results.length){
                  if(error) return cb(error);
                  cb(null);
                }
              });
            }
          }
        });
      }
    });
  }
};
function borrarProducto(permalink, cb){
  console.log('BorrarProducto, functions.js');
  permalink = encodeURIComponent(permalink);
  db.collection('productos').findOne({
    'permalink': permalink
  }, (err, result) => {
    if(err){
      return cb('Error, could not find the product to delete');
    }
    db.collection('productos').remove({
      'permalink': permalink
    }, (err, numberRemoved) => {
      if(err){
        console.log(err);
        return cb('Error, could not delete the product');
      }else{
        console.log('Se ha borrado el producto: '+permalink+ 'con exito.');
      }
      //Borramos el directorio y todas sus imagenes
      borrarDirectorio(permalink);
      return cb(null);
    });
  });
};
//Funcion para borrar el directorio y todas sus imagenes
function borrarDirectorio(permalink){
  console.log('BorrarDirectorio, functions.js');
  //El permalink ya está encoded de la funcion borrarProducto
  let imagenesServer = path.join(__dirname, '/uploads/', permalink);
  fs.readdir(imagenesServer, (err, files) => {
    let i = 0;
    if(err) console.log('Error, no se pudo leer el directorio '+imagenesServer+': '+err);
    if(files.length != null){
      files.forEach((file) => {
        fs.unlink(path.join(imagenesServer, file), (err) => {
          if(err) console.log('Error, no se pudo borrar la imagen '+path.join(imagenesServer, file)+'del servidor');
          i++;
        });
      });
      if(i >= files.length){
        fs.rmdir(imagenesServer, (err) => {
          if(err) console.log('Error, no se pudo borrar el dir '+imagenesServer+': '+err);
        });
      }
    }
  });
};
function render(page, dataObject, cb){
  console.log('Render, functions.js');
  fs.readFile(page, (err, content) => {
    if(err) return cb(err, null);
    let resultado = content.toString();
    //Le quitamos los tabuladores
    resultado = resultado.replace(/\t*/gm, '');

    if(dataObject != undefined && dataObject != null){
      for(let propiedad in dataObject){
        let re = new RegExp("{{"+propiedad+"}}+", "gm");
        //Loop de una key
        let reItem = new RegExp("{{loop "+propiedad+" [^-]+}}" ,"gm");
        //Empieza el loop por el key indicado
        let reTotalItem = new RegExp("{{loop "+propiedad+" -.*-}}" ,"gm");
        let reTotal = new RegExp("{{loop "+propiedad+"}}" ,"gm");
        let reLoopKey = new RegExp("{{loopKey "+propiedad+"}}", "gm");

        if(re.test(resultado)){
          resultado = resultado.replace(re, dataObject[propiedad]);
        }

        if(reItem.test(resultado)){
          let loopObject = dataObject[propiedad];
          for(let key in loopObject){
            let reItemFind = new RegExp("{{loop "+propiedad+" [^-]?"+key+"[^-]?}}" ,"gm");
            resultado = resultado.replace(reItemFind, loopObject[key]);  
          }
        }

        if(reLoopKey.test(resultado)){
          let loopObject = dataObject[propiedad];
          let reKeyWithTagsBig = new RegExp("^(.*){{loopKey "+propiedad+"}}(.*)([\\s\\S]*){{\\/loopKey "+propiedad+"}}.*$", "gm");
          let reArrayWithTags = new RegExp("^([\\s\\S]*)\n(.*){{loopArray "+propiedad+"}}(.*)([\\s\\S]*)$", "gm");
          let matchKeyBig;
          let matchArray; 
          let textoFinal = "";
          matchKeyBig = reKeyWithTagsBig.exec(resultado);
          matchArray = reArrayWithTags.exec(matchKeyBig[3]);
          for(let key in loopObject){
            textoFinal += matchKeyBig[1]+key+matchKeyBig[2]+'\n';
            //Lo que hay antes del <option> es matcharray[1]
            textoFinal += matchArray[1];
            for(let i = 0; i<loopObject[key].length; i++){
              let itemArray = matchArray[2]+loopObject[key][i]+matchArray[3]+"\n";
              textoFinal += itemArray;
            }
            //Lo que hay despues del <option> es matcharray[4]
            textoFinal += matchArray[4];
          }
          resultado = resultado.replace(reKeyWithTagsBig, textoFinal);
          textoFinal = "";
        }

        if(reTotalItem.test(resultado)){
          let loopObject = dataObject[propiedad];
          let reTotalWithTags = new RegExp("^(.*){{loop "+propiedad+" -(.*)-}}(.*)$" ,"gm");
          let match = reTotalWithTags.exec(resultado);
          let textoFinal = "";
          let doneWaiting = false;
          for(let key in loopObject){
            //en match[2] se encuentra la key por la que empezar 
            if(key == match[2] || doneWaiting){
              doneWaiting = true;
              if(match != null && loopObject[key] != undefined) textoFinal += match[1]+loopObject[key]+match[3]+"\n";
            }
          }
          resultado = resultado.replace(reTotalWithTags, textoFinal);
          textoFinal = "";
        }

        if(reTotal.test(resultado)){
          let loopObject = dataObject[propiedad];
          reTotal = new RegExp("^(.*){{loop "+propiedad+"}}(.*)$" ,"gm");
          let match = reTotal.exec(resultado);
          let textoFinal = "";
          for(let key in loopObject){
            if(match != null && loopObject[key] != undefined) textoFinal += match[1]+loopObject[key]+match[2]+"\n";
          }
          resultado = resultado.replace(reTotal, textoFinal);
          textoFinal = "";
        } 
      }
    }

    //Renderizamos los partiales
    let reIncludePartial = new RegExp("{{> (.*)}}", "gm");
    if(reIncludePartial.test(resultado)){
      //Reseteamos el last index para que nos dé todos los resultados desde el principio, porque
      //al ejecutar el if se pasa al siguiente resultado. Cada vez que se ejecuta cualquier metodo
      //de un objeto regex, se mueve el puntero solo si tenemos puesta la flag global "g".
      reIncludePartial.lastIndex = 0;
      //El include partial es un regex que busca cualquier include sin saber su valor
      let error = null;
      let partiales = [];
      let partialNombre = '';
      //Creamos un array con los nombres de los includes a poner
      while((partialNombre = reIncludePartial.exec(resultado)) != null){
        partiales.push(partialNombre[1]);
      }
      let index = 0;
      partiales.forEach((partialName) => {
        //El partialName[1] es el grupo regex primero entre parentesis ( ) para sacar el nombre partial
        let partial = path.join(__dirname, '../public/views/partials/', partialName+'.html');
        fs.readFile(partial, 'utf-8', (err, partialContent) => {
          if(err) error = err;

          let re = new RegExp("{{> "+partialName+"}}", "gm");
          resultado = resultado.replace(re, partialContent);
          index++;
          if(index >= partiales.length){
            if(error) return cb(error, null);
            cb(null, resultado);                    
          }
        });
      });
    }else{

      //Si no hay includes devolver la pagina con los cambios del dataObject
      return cb(null, resultado);

    }
  });
};
//Origin es el archivo con path y end es solo directorio sin nombre de archivo
function copyFile(origin, end, fileName, cb){
  console.log('CopyFile, functions.js');
  let finalName = path.join(end, fileName);
  let readStream = fs.createReadStream(origin);
  let writeStream = fs.createWriteStream(finalName);
  let error = null;
  readStream.on('error', (err) => {
    console.log(err);
    error = err;
  });
  writeStream.on('error', (err) => {
    console.log(err);
    error = err;
  });
  writeStream.on('finish', (ex) => {
    if(error) return cb(error);
    return cb(null);
  });
  readStream.pipe(writeStream);
};
//Para guardar las categorías
function guardarCategorias(categorias, callback){
  console.log('GuardarCategorias, functions.js');
  //1º Buscamos el array
  //2º Lo actualizamos, categorias es un param de la funcion
  //3º Si no existe, crear uno nuevo
  //4º Callback
  db.collection('categorias').update({
    'arrayCategorias': {$exists : true}
  }, {
    'arrayCategorias': categorias
  }, {
    'upsert': true
  }, (err, countFilesModified, result) => {    
    if(err){
      return callback('Error, could not update categories', null);
    }else{
      return callback(null, 'Categories saved correctly');
    }
  });
};
function getCategories(callback){
  console.log('GetCategories, functions.js');
  db.collection('categorias').findOne({
    'arrayCategorias': {$exists : true}
  }, (err, result) => {    
    if(err){
      return callback('Err, could not find the categories.', null);
    }else{
      return callback(null, result);
    }
  });
};
function copyDirectory(origin, end, callback){
  console.log('CopyDirectory, functions.js');
  if(callback == undefined){
    callback = () => {};
  }
  let callbackCalled = false;
  fs.stat(origin, (err, stats) => {
    if(err) done(err);
    if(stats.isDirectory()){
      //Check if end exists and create directory
      fs.stat(end, (err, stats) => {
        if(err){
          fs.mkdir(end, (err) => {
            if(err){
              console.log(err);
            }
          });
        }
      });
      //Copy the files from origin to end
      fs.readdir(origin, (err, files) => {
        if(err){
          done(err);
        }else if(files.length > 0){
          files.forEach((file) => {
            copyFile(path.join(origin, file), end, file, (err) => {
              if(err){
                done(err);
              }else{
                done(null);
              }
            });
          });
        }else{
          done('Error copying images, there are no files to be copied');
        }
      });
    }else{
      done('Error copying images, your origin is not a directory');
    }
  });

  function done(err){
    if(!callbackCalled){
      callback(err);
      callbackCalled = true;
    }
  }
};
function guardarBusqueda(busqueda, cb){
  console.log('GuardarBusqueda, functions.js');
  if(busqueda){
    db.collection('busquedas').findOne({
      'search': busqueda
    }, (err, busquedaExistente) => {
      if(err){        
        return cb('Error searching busquedas');
      }else{
        if(!busquedaExistente){
          busquedaExistente = {};
          busquedaExistente.veces = 0;
        }
        //Para actualizar o crear un nuevo registro
        db.collection('busquedas').update({
          'search': busqueda
        }, {
          'search': busqueda,
          'veces': (busquedaExistente.veces + 1)
        }, {
          'upsert': true
        }, (err, result) => {          
          if(err) return cb('Err, could not save the search in the database');
          return cb(null);
        });
      }
    });
  }
};
//Para guardar imagenes en el servidor y base de datos
function guardarSliderImages(objectImages, cb){
  console.log('GuardarSliderImages, functions.js');
  let origin = path.join(__dirname, '../public/public-uploads/');
  let end = path.join(__dirname, '/uploads/Slider/');
  let tamañoObjectImages = Object.keys(objectImages).length;

  borrarSliderFolder((err) => {
    if(err) return cb(err);
    for(let key in objectImages){
      let fileLocation = path.join(origin, objectImages[key]);
      copyFile(fileLocation, end, objectImages[key], (err) => {
        if(err){
          console.log(err);
          return cb('Err, could not copy the image: '+objectImages[key]+' to the server /Slider/: '+err);
        }
      });
    }
    db.collection('utils').update({
      'sliderImages': {$exists: true}
    }, {
      'sliderImages': objectImages
    }, {
      'upsert': true
    }, (err, countFilesModified, result) => {      
      if(err) return cb('Err, could not save the slider images to the db: '+err);
      else{
        return cb(null);
      }
    });
  });

  //Para borrar cada imagen en el Slider si las hubiera y crear el folder si no existiera
  function borrarSliderFolder(cb){
    fs.stat(end, (err, stats) => {
      //Si el directorio no existe, lo creamos y terminamos
      if(err){
        fs.mkdir(end, (err) => {
          if(err) cb(err);
          else return cb(null);
        });
      //Sino, borramos su contenido si lo hubiera
      }else{
        fs.readdir(end, (err, files) => {
          if(err) return cb(err);
          //Si no está vacio el directorio borrar cada imagen
          if(files.length != 0){
            for(let i = 0; i < files.length; i++){
              fs.unlink(path.join(end, files[i]), (err) => {
                if(err) return cb(err);
                if(i >= files.length-1){
                  return cb(null);
                }
              });
            }
          }else{
            return cb(null);
          }
        });
      }
    });
  }
};
//Para copiar las imagenes del slider al cliente y retornar el objeto imagenes
function getSlider(cb){
  console.log('GetSlider, functions.js');
  db.collection('utils').findOne({
    'sliderImages': {$exists: true}
  }, (err, result) => {    
    if(err) return cb('Error searching slider images: '+err, null);
    let images = result.sliderImages;
    let originDir = path.join(__dirname, '/uploads/_Slider/');
    let end = path.join(__dirname, '../public/public-uploads/');
    for(let key in images){
      copyFile(path.join(originDir, images[key]), end, images[key], (err) => {
        if(err) return cb('Error copying the slider images to the client '+err, null);
      });
      if(key >= Object.keys(images).length){
        //Si se han copiado todas las imágenes con exito
        return cb(null, images);
      }
    }
  });
};
//Para conseguir los 5 productos más vendidos para el minislider //Visitas //Vendidos
function getMiniSlider(tipo, cb){
  console.log('GetMasVendidos, functions.js');
  let orden = {};
  orden[tipo] = -1;
  db.collection('productos').find({}, {
    "_id": false,
    "titulo": true,
    "permalink": true,
    "precio": true,
    "imagenes": true,
    "categoria": true
  }).sort(orden).limit(5).toArray((err, results) => {
    if(err) return cb('Error searching products, '+err, null);
    let origin = path.join(__dirname, '/uploads/');
    let end = path.join(__dirname, '../public/public-uploads');
    for(let i = 0; i < results.length; i++){
      copyFile(path.join(origin, results[i].permalink, results[i].imagenes[1]), end, results[i].imagenes[1], (err) => {
        if(err) return cb('Err, could not copy the image '+results[i].imagenes[1]+' to the client, '+err, null);
      });
      if(i >= results.length-1){
        return cb(null, results);
      }
    }
  });
};
//Function que me dice cuantas páginas hay en total para ese límite de productos por página.
function getPaginacion(limite, cb){
  console.log('GetPaginacion, functions.js');
  db.collection('productos').count((err, count) => {
    if(err){
      console.log(err);
      return cb('Error calculando la paginación de los productos. Intentalo de nuevo.', null);
    }
    //Las páginas totales incluida la última que puede ser menor del límite.
    let paginas = Math.ceil(count/limite);
    return cb(null, paginas);
  });
}; 
//Para pagar una compra
function payProduct(req, cb){
  console.log('PayProduct, functions.js');
  let dataObject = req.body.data;
  let direccion = dataObject.direccion;
  let arrayProductos = dataObject.productos;
  let token = dataObject.token;
  let idPago = 0;
  let customerId = null;
  let error = null;

  //Comprobamos que la cantidad sea correcta, que existan los productos puestos y que se cree un nuevo id de compra
  db.collection('facturas').count((err, count) => {
    if(err) return cb('There was an error processing your card, please try again.');
    let index = 0;
    idPago = count+1
    //Comprobamos que los productos que ha puesto existan
    for(let i = 0; i < arrayProductos.length; i++){
      let productoNombre = arrayProductos[i].nombre;
      let productoCantidad = arrayProductos[i].cantidad;
      if(arrayProductos[i].cantidad <= 0){
        error = 'Error, la cantidad del producto: '+arrayProductos[i]+' no puede ser menor o igual a 0';
      }
      db.collection('productos').findOne({
        'titulo': productoNombre
      }, (err, result) => {
        index++;        
        if(err) error = 'Error procesando el pago, por favor inténtalo de nuevo.';
        if(!result) error = 'Este producto no existe o no está disponible: '+productoNombre+', por favor cambialo.';
        //Si se ha llegado al último producto sin errores, continuar
        if(index >= arrayProductos.length){
          if(error) return cb(error);
          crearCustomer();
        }
      });
    }
  });

  //Para crear el customer si no tuviese su id ya y pagar por cada producto comprado
  function crearCustomer(){
    console.log('CrearCustomer, functions.js');
    //Creamos un customer y pagamos por cada producto por separado
    if(req.session.customerId == null || req.session.customerId == undefined){
      stripe.customers.create({
        "source": token,
        "description": req.session.username,
        "email": req.session.username
      }).then((customer) => {
        //En el customer.id se guarda el id que se usa para crear charges en stripe
        req.session['customerId'] = customer.id;
        req.session.save();
        //Guardamos el customer id en la base de datos del usuario
        db.collection('users').update({
          'username': req.session.username
        },{
          $set: {
            'customerId': customer.id
          }
        }, (err, result) => {
          if(err) return cb('Error procesando el pago, por favor inténtalo de nuevo.');
          realizarPago();
        });
      });
    }else{
      realizarPago();
    }
  };

  function realizarPago(){
    console.log('RealizarPago, functions.js');
    //Buscamos cada producto para saber su precio real y lo pagamos
    //Creamos un array con cada titulo para buscarlo en la bd
    let arrayTitulos = [];
    for(let i = 0; i < arrayProductos.length; i++){
      let titulo = arrayProductos[i].nombre;
      arrayTitulos.push(titulo);
    }
    //Conseguimos el precio de cada producto
    db.collection('productos').find({
      'titulo': {$in: arrayTitulos}
    }, {
      '_id': false,
      'precio': true,
      'titulo': true
    }).toArray((err, results) => {
      if(err) return cb('Hubo un error procesando los productos, por favor intentalo de nuevo.');
      let precioTotalCentimos = null;
      let metadataObject = {};
      metadataObject['idPago'] = idPago;
      for(let index = 0; index < results.length; index++){
        let producto = results[index];
        let precioCentimos = (producto.precio*100).toFixed(0);
        let cantidad = null;
        metadataObject['producto-'+index] = {};
        metadataObject['producto-'+index]['precioCentimos'] = precioCentimos;
        metadataObject['producto-'+index]['titulo'] = producto.titulo;

        //Conseguimos la cantidad comprada de ese producto
        for(let f = 0; f < arrayProductos.length; f++){
          if(arrayProductos[f].nombre == producto.titulo){
            cantidad = arrayProductos[f].cantidad;
            metadataObject['producto-'+index]['cantidad'] = cantidad;
            precioCentimos *= cantidad;
          }
        }
        precioTotalCentimos += precioCentimos;
        if(index + 1 >= results.length){
          metadataObject['precioTotal'] = precioTotalCentimos.toFixed(0);
        }
      };

      //Luego pagamos el total  y luego guardamos la factura en la base de datos
      let charge = stripe.charges.create({
        "amount": precioTotalCentimos, //Cantidad en centimos
        "currency": 'eur',
        "customer": req.session.customerId,
        "description": arrayTitulos[0],
        "metadata": {
          'idPago': idPago
        }
      }, (err, charge) => {
        if(err){
          console.log(err);
          return cb('Tu tarjeta ha sido rechazada, por favor escribe otra vez la información de tu tarjeta e intentalo de nuevo.');
        }else{
          db.collection('facturas').insert({
            'idPago': idPago,
            'idCharge': charge.id,
            'nombreApellidos': direccion.nombreApellidos,
            'cantidad': charge.amount,
            'estaProcesado': charge.captured,
            'fecha': charge.created,
            'moneda': charge.currency,
            'customer': charge.customer,
            'productos': metadataObject,
            'estaPagado': charge.paid,
            'email': charge.receipt_email,
            'telefono': charge.receipt_number,
            'direccion': direccion,
            'terminacionTarjeta': charge.source.last4,
            'chargeObject': charge
          }, (err, result) => {
            if(err) return cb('Error procesando el pago, por favor inténtalo de nuevo.');
            cb(null);
          });
        }
      });
    });
  }
};
//Para registrar un usuario
function registerUsuario(email, password, cb){
  console.log('RegisterUsuario, functions.js');
  db.collection('users').findOne({
    'email': email
  }, function(err, result){
    if(err) return cb('Error creating the user. Try again.')
    if(result != 'undefined' && result != null){
      return cb('User already exists');
    }else{
      db.collection('users').insert({
        'username': email,
        'password': password
      }, function(err, result){
        if(err) return cb('Could not create the user. Try again.');
        else return cb(null);
      });
    }
  });
};
function loginUsuario(email, password, cb){
  console.log('LoginUsuario, functions.js');
  db.collection('users').findOne({
    'username': email,
    'password': password
  }, function(err, result){
    if(err) cb('Error processing your request, try again.');
    if(result != 'undefined' && result != null){
      return cb(null);
    }else{
      return cb('Error, could not find that user. Try again.');
    }
  });
};
function getCesta(username, cb){
  console.log('GetCesta, functions.js');
  db.collection('users').findOne({
    'username': username
  }, {
    'cesta': true,
    '_id': false
  }, (err, result) => {
    if(err) return cb(err, null);
    //Comprobamos que la cesta no esté vacía
    if(result.cesta != null && result.cesta != undefined && Object.keys(result.cesta).length != 0){
      let productosCesta = [];
      for(let nombreProducto in result.cesta) productosCesta.push(nombreProducto);
      db.collection('productos').find({
        'permalink': {$in: productosCesta}
      }, {
        'permalink': true,
        'titulo': true,
        'imagenes': true,
        'precio': true,
        '_id': false
      }).toArray((err, results) => {
        if(err) return cb(err, null);
        //Le ponemos la cantidad a cada objeto producto de la cesta
        //Y solo seleccionamos la primera imagen
        results.forEach((objetoProducto, index) => {
          let cantidad = result.cesta[objetoProducto.permalink];
          let nombreImagen = results[index].imagenes[1];
          results[index].imagenes = nombreImagen;
          results[index]['cantidad'] = cantidad;
          //Le pasamos la imágen del producto al cliente
          let origen = path.join(__dirname, 'uploads/', objetoProducto.permalink, nombreImagen);
          let end = path.join(__dirname, '../public/public-uploads/');
          copyFile(origen, end, nombreImagen, (err) => {
            if(err) return cb(err, null);
            if(index + 1 >= results.length){
              cb(null, results);
            }
          });
        });
      });
    }else{
      cb(null, null);
    }
  });
};
function addProductoCesta(req, cb){
  console.log('AddProductoCesta, functions.js');
  //Sacamos el producto de la cesta con el for in
  let productoCesta;
  for(productoCesta in req.body.data) break;
  let cantidadProductoCesta = req.body.data[productoCesta];
  if(!req.session.cesta){
    req.session.cesta = {};
  }
  //Si no existe ese producto en la cesta, ponerlo como cantidad 1
  if(!(productoCesta in req.session.cesta)){
    req.session.cesta[productoCesta] = cantidadProductoCesta;
  }else{
    //Si existe subirle la cantidad
    req.session.cesta[productoCesta] = parseInt(req.session.cesta[productoCesta]) + parseInt(cantidadProductoCesta);
  }
  if(req.session.isLogged){
    saveCestaUser(req.session.cesta, req.session.username, (err) => {
      if(err) return cb(err);
      cb(null);
    });
  }else{
    cb(null);
  }
};
function cambiarCantidadCesta(req, cb){
  console.log('CambiarCantidadCesta, functions.js');
  let producto = req.body.data.producto;
  let cantidad = req.body.data.cantidad;
  for(let productoCesta in req.session.cesta){
    if(productoCesta == producto){
      if(cantidad <= 0)
        delete req.session.cesta[productoCesta];  
      else
        req.session.cesta[productoCesta] = cantidad;
    }
  }
  if(req.session.isLogged){
    saveCestaUser(req.session.cesta, req.session.username, (err) => {
      if(err) return cb(err);
      cb(null);
    });
  }else{
    cb(null);
  }
};
// Si esta logueado, guardar la info de la cesta en su cuenta. 
// Si no guardar en el local storage.
function saveCestaUser(cesta, username, cb){
  console.log('SaveCestaUser, functions.js');
  db.collection('users').update({
    'username': username
  }, {
    $set: {
      'cesta': cesta
    }
  },{
    'upsert': true
  }, (err, result) => {
    if(err) return cb('Could not update your cart, try again.');
    else return cb(null);
  });
};
//Para copiar las imagenes de los productos de la cesta cuando no has iniciado sesion
function getOfflineCesta(cesta, cb){
  let productosCesta = [];
  for(let nombreProducto in cesta) productosCesta.push(nombreProducto);
  db.collection('productos').find({
    'permalink': {$in: productosCesta}

  }, {
    'permalink': true,
    'imagenes': true,
    'precio': true,
    '_id': false
  }).toArray((err, results) => {
    if(err) return cb(err, null);
    //Le ponemos la cantidad a cada objeto producto de la cesta
    //Y solo seleccionamos la primera imagen
    results.forEach((objetoProducto, index) => {
      let cantidad = cesta[objetoProducto.permalink];
      let nombreImagen = results[index].imagenes[1];
      results[index].imagenes = nombreImagen;
      results[index]['cantidad'] = cantidad;
      //Le pasamos la imágen del producto al cliente
      let origen = path.join(__dirname, 'uploads/', objetoProducto.permalink, nombreImagen);
      let end = path.join(__dirname, '../public/public-uploads/');
      copyFile(origen, end, nombreImagen, (err) => {
        if(err) return cb(err, null);
        if(index + 1 >= results.length){
          cb(null, results);
        }
      });
    });
  });
};
function getLoggedState(req, cb){
  if(req.session.username == 'merloxdixcontrol@gmail.com'){
    cb('admin');
  }else if(req.session.username != null && req.session.username != undefined){
    cb('logged');
  }else{
    cb(null);
  }
};

exports.buscarProducto = buscarProducto;
exports.render = render;
exports.copyFile = copyFile;
exports.copyDirectory = copyDirectory;
exports.guardarCategorias = guardarCategorias;
exports.getCategories = getCategories;
exports.getAllProducts = getAllProducts;
exports.borrarProducto = borrarProducto;
exports.createUpdateProduct = createUpdateProduct;
exports.uploadPublicImages = uploadPublicImages;
exports.borrarDirectorio = borrarDirectorio;
exports.buscarProductos = buscarProductos;
exports.guardarBusqueda = guardarBusqueda;
exports.guardarSliderImages = guardarSliderImages;
exports.getSlider = getSlider;
exports.getMiniSlider = getMiniSlider;
exports.getPaginacion = getPaginacion;
exports.payProduct = payProduct;
exports.saveCestaUser = saveCestaUser;
exports.registerUsuario = registerUsuario;
exports.loginUsuario = loginUsuario;
exports.getCesta = getCesta;
exports.addProductoCesta = addProductoCesta;
exports.cambiarCantidadCesta = cambiarCantidadCesta;
exports.getOfflineCesta = getOfflineCesta;
exports.getLoggedState = getLoggedState;