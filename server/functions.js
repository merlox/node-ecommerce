'use strict';
let Mongo = require('mongodb').MongoClient,
  MongoUrl = 'mongodb://merunas:jakx1234.@ds119508.mlab.com:19508/merunas-mongo',
  fs = require('fs'),
  path = require('path'),
  //Ponemos la secret key de stripe para realizar pagos
  stripe = require('stripe')('sk_test_F2AInFtMIJJpjEQYGvlgdIJ6'),
  db = {},
  sendEmail = require('./email.js').sendEmail,
  sendEmailPlain = require('./email.js').sendEmailPlain,
  render = require('./render.js'),
  crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  encryptPass = 'fasdFXs1231.23,-';

Mongo.connect(MongoUrl, (err, database) => {
  if(err) console.log(err);
  db = database;
  // createExpirePasswordTokenIndex();
});

function buscarProducto(permalink, callback){
  console.log('BuscarProducto, functions.js');
  permalink = encodeURIComponent(permalink);
  db.collection('productos').findOne({
    'permalink': permalink
  }, (err, result) => {
    if(err){
      return callback('Error, could not find that product', null);
    }else{
      return callback(null, result);
    }
  });
};
//Para buscar muchos productos
function buscarProductos(keyword, limite, pagina, cb){
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
    'titulo': true,
    'categoria': true
  }).limit(limite).skip(pagina*limite).toArray((err, results) => {
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
//Para buscar muchos productos en la api
function buscarFiltrarProductos(keyword, pagina, filtros, cb){
  console.log('BuscarFiltrarProductos, functions.js');
  keyword = new RegExp(keyword);
  db.collection('productos').find({
    'titulo': {
      '$regex': keyword,
      '$options': 'i'
    },
    'precio': {
      '$gte': filtros.precioMin,
      '$lte': (filtros.precioMax > 0 ? filtros.precioMax : Infinity)
    }
  }, {
    '_id': false,
    'imagenes': true,
    'permalink': true,
    'precio': true,
    'titulo': true,
    'categoria': true
  }).skip(pagina > 0 ? (pagina-1)*30 : 0).toArray((err, results) => {
    if(err){
      return cb('Error, could not find those products', null);
    }else{
      let cantidadPaginas = 0;
      if(results.length > 30){
        cantidadPaginas = Math.floor(results.length/30)+1;
        results = results.slice(0, 30);
      }
      //Copiar la primera imágen
      copyFirstImage(results, (err) => {
        if(err) return cb(err, null, cantidadPaginas);
        cb(null, results, cantidadPaginas);
      });
    }
  });
};
//Para buscar los productos por categoria
function buscarProductosCategoria(categoria, limite, pagina, cb){
  console.log('BuscarProductosCategoría, functions.js');
  if(limite == undefined || limite == null){
    limite = 0;
  }
  limite = parseInt(limite);
  categoria = new RegExp(categoria);
  db.collection('productos').find({
    'categoria': {
      '$regex': categoria,
      '$options': 'i'
    }
  }, {
    '_id': false,
    'imagenes': true,
    'permalink': true,
    'precio': true,
    'titulo': true,
    'categoria': true
  }).limit(limite).skip(pagina*limite).toArray((err, results) => {
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
//Para buscar muchos productos en la api de categoria
function buscarFiltrarProductosCategoria(categoria, pagina, filtros, cb){
  console.log('BuscarFiltrarProductosCategoria, functions.js');
  db.collection('productos').find({
    'categoria': categoria,
    'precio': {
      '$gte': filtros.precioMin,
      '$lte': (filtros.precioMax > 0 ? filtros.precioMax : Infinity)
    }
  }, {
    '_id': false,
    'imagenes': true,
    'permalink': true,
    'precio': true,
    'titulo': true,
    'categoria': true
  }).skip(pagina > 0 ? (pagina-1)*30 : 0).toArray((err, results) => {
    debugger;
    if(err){
      return cb('Error, could not find those products', null);
    }else{
      let cantidadPaginas = 0;
      if(results.length > 30){
        cantidadPaginas = Math.floor(results.length/30)+1;
        results = results.slice(0, 30);
      }
      //Copiar la primera imágen
      copyFirstImage(results, (err) => {
        if(err) return cb(err, null, cantidadPaginas);
        cb(null, results, cantidadPaginas);
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
    'precio': parseInt(productData.precio),
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
//Funcion para subir las imagenes publicas al servidor en /uploads
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
function getAllProducts(imageLimit, page, filtroCategoria, callback){
  console.log('GetAllProducts, functions.js');
  let skipProducts = 0;
  if(page > 1){
    skipProducts = (page-1)*imageLimit;
  } 
  let query = {};
  if(filtroCategoria) query['categoria'] = filtroCategoria;
  db.collection('productos').find(query).limit(imageLimit).skip(skipProducts).toArray((err, results) => {
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
      return callback('Error, no hay productos', false);
    }
  });
};
//Copiar la primera imagen de los productos pasados por parámetro.
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
        //1. Leemos el directorio
        fs.readdir(folderServer, (err, imagesInFolder) => {
          if(err) {
            error = 'Could not read the images in the folder. Try again.';
          }
          //2. Recorremos las imagenes del directorio
          for(let f = 0; f<imagesInFolder.length; f++){
            //3. Si la imagen del directorio es la 1ª de la base de datos, copiarla, sino pasa a la siguiente
            if(results[i].imagenes[1] == imagesInFolder[f]){
              let firstImageInFolder = path.join(folderServer, imagesInFolder[f]);
              copyFile(firstImageInFolder, folderClient, imagesInFolder[f], (err) => {
                counter++;
                if(err){
                  error = 'Could not copy the images to the client. Try again.';
                }
                if(counter >= results.length){
                  done();
                }
              });
            }else{
              counter++;
            }
          }
          if(i >= results.length - 1 || counter >= results.length){
            done();
          }
        });
      }
    });
  }

  let callbackCalled = false;
  function done(){
    if(!callbackCalled){
      if(error) return cb(error);
      cb(null);
    }
    callbackCalled = true;
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
  }, {
    '_id': false
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
//Guardar en la base de datos las búsquedas realizadas por los clientes.
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
  let end = path.join(__dirname, '/uploads/_Slider/');
  let tamañoObjectImages = Object.keys(objectImages.imagenes).length;

  borrarSliderFolder((err) => {
    if(err) return cb(err);
    for(let key in objectImages.imagenes){
      let fileLocation = path.join(origin, objectImages.imagenes[key]);
      copyFile(fileLocation, end, objectImages.imagenes[key], (err) => {
        if(err){
          console.log(err);
          return cb('Err, could not copy the image: '+objectImages.imagenes[key]+' to the server /_Slider/: '+err);
        }
      });
    }
    db.collection('utils').update({
      'sliderImages': {$exists: true}
    }, {
      'sliderImages': objectImages.imagenes,
      'urls': objectImages.urls
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
//Si no le pasas callback copia las imagenes al cliente y con callback solo te da el array de nombres para el cliente
function getSlider(doCopy, cb){
  console.log('GetSlider, functions.js');
  if(doCopy){
    let originDir = path.join(__dirname, '/uploads/_Slider/');
    fs.readdir(originDir, (err, files) => {
      if(err) return cb('Error getting slider, try again.', null);
      let images = files;
      let end = path.join(__dirname, '../public/public-uploads/');
      let counter = 0;
      images.forEach((image) => {
        copyFile(path.join(originDir, image), end, image, (err) => {
          counter++;
          if(err) return cb('Error copying the slider images to the client '+err, null);
          if(counter >= images.length){
            return cb(null, files);  
          }
        });
      });
    });
  }else{
    let originDir = path.join(__dirname, '/uploads/_Slider/');
    fs.readdir(originDir, (err, files) => {
      if(err) return cb('Error copying the images.', null);
      return cb(null, files);
    });
  }
};
/*
Para conseguir los 5 productos más vendidos para el minislider
Tipos posibles: vendidos, vistosAnteriormente, compradosJuntos, recientes, random
Comprados-juntos son productos conjuntos que han comprado otros clientes
Random son productos random de esa categoría
 */
function getMiniSlider(username, tipo, pagina, cb){
  console.log('GetMiniSlider, functions.js');
  let error = null;

  switch(tipo){
    case 'vendidos':
      db.collection('productos').count((err, count) => {
        if(err) return cb('Error contando los productos', null, null);
        let paginasTotales = count/5;
        let paginaSiguiente = paginasTotales < pagina ? pagina*5 : paginasTotales;
        db.collection('productos').find({}, {
          "_id": false,
          "titulo": true,
          "permalink": true,
          "precio": true,
          "imagenes.1": true,
          "categoria": true
        }).sort({'vendidos': -1}).skip(paginaSiguiente).limit(5).toArray((err, results) => {
          if(err) return cb('Error buscando los productos mas vendidos.', null);
          copiarImagenesProductos(results, err => {
            if(err) return cb(err, null, null);
            return cb(null, results, paginasTotales);
          });
        });
      });
    break;

    case 'vistosAnteriormente':
      if(!username) return cb('Error no hay usuario conectado.', null, null);
      db.collection('usersData').findOne({
        'username': username
      }, {
        '_id': false,
        'productosVistos': true
      }, (err, userData) => {
        if(err) 
          return cb('Error buscando los productos vistos.', null, null);
        if(!userData.productosVistos)
          return cb('Error, no hay productos vistos recientemente', null, null);
        if(userData.productosVistos.length < 5) 
          return cb('Error, hay menos de 5 productos vistos.', null, null);
        let paginasTotales = userData.productosVistos.length/5;
        let paginaSiguiente = paginasTotales < pagina ? pagina*5 : paginasTotales;
        //userData.productosVistos son IDs de productos, hay que buscar los productos
        db.collection('productos').find({
          '_id': {
            '$in': userData.productosVistos
          }
        }, {
          "_id": false,
          "titulo": true,
          "permalink": true,
          "precio": true,
          "imagenes.1": true,
          "categoria": true
        }).skip(paginaSiguiente).limit(5).toArray((err, results) => {
          if(err) return cb('Error buscando los productos vistos.', null, null);
          copiarImagenesProductos(results, err => {
            if(err) return cb(err, null, null);
            return cb(null, results, paginasTotales);
          });
        });
      });
    break;

    case 'compradosJuntos':
      if(!username) return cb('Error no hay un usuario conectado.', null, null);
      db.collection('usersData').findOne({
        'username': username
      }, {
        '_id': false,
        'compradosJuntos': true
      }, (err, userData) => {
        if(err) 
          return cb('Error buscando los productos comprados juntos.', null, null);
        if(!userData.compradosJuntos) 
          return cb('Error, no hay productos comprados juntos', null, null);
        if(userData.compradosJuntos.length < 5) 
          return cb('Error, hay menos de 5 productos comprados juntos.', null, null);
        let paginasTotales = userData.compradosJuntos.length/5;
        let paginaSiguiente = paginasTotales < pagina ? pagina*5 : paginasTotales;
        //userData.productosVistos son IDs de productos, hay que buscar los productos
        db.collection('productos').find({
          '_id': {
            '$in': userData.compradosJuntos
          }
        }, {
          "_id": false,
          "titulo": true,
          "permalink": true,
          "precio": true,
          "imagenes.1": true,
          "categoria": true
        }).skip(paginaSiguiente).limit(5).toArray((err, results) => {
          if(err) return cb('Error buscando los productos comprados juntos.', null, null);
          copiarImagenesProductos(results, err => {
            if(err) return cb(err, null, null);
            return cb(null, results, paginasTotales);
          });
        });
      });
    break;

    case 'recientes':
      db.collection('productos').count((err, count) => {
        if(err) return cb('Error contando los productos', null, null);
        let paginasTotales = count/5;
        let paginaSiguiente = paginasTotales < pagina ? pagina*5 : paginasTotales;
        db.collection('productos').find({}, {
          "_id": false,
          "titulo": true,
          "permalink": true,
          "precio": true,
          "imagenes.1": true,
          "categoria": true
        }).sort({'fecha': -1}).skip(paginaSiguiente).limit(5).toArray((err, results) => {
          if(err) return cb('Error buscando los productos mas recientes.', null, null);
          copiarImagenesProductos(results, err => {
            if(err) return cb(err, null, null);
            return cb(null, results, paginasTotales);
          });
        });
      });
    break;

    case 'random':
      db.collection('productos').count((err, count) => {
        if(err) return cb('Error contando los productos random', null, null);
        let paginasTotales = count/5;
        db.collection('productos').aggregate([
          {$sample: {size: 5}}
        ]).toArray((err, results) => {
          if(err) return cb('Error buscando los productos random.', null);
          copiarImagenesProductos(results, err => {
            if(err) return cb(err, null, null);
            return cb(null, results, paginasTotales);
          });
        });
      });
    break;
  }
};
//Function que me dice cuantas páginas hay en total para ese límite de productos por página.
function getPaginacion(limite, filtroCategoria, cb){
  console.log('GetPaginacion, functions.js');
  let query = {};
  if(filtroCategoria) query['categoria'] = filtroCategoria;
  db.collection('productos').find(query).count((err, count) => {
    if(err){
      console.log(err);
      return cb('Error calculando la paginación de los productos. Intentalo de nuevo.', null);
    }
    //Las páginas totales incluida la última que puede ser menor del límite.
    let paginas = Math.ceil(count/limite);
    return cb(null, paginas);
  });
}; 
//Function que me dice cuantas páginas hay en total para ese límite de productos por página y para esa keyword.
function getPaginacionSearch(keyword, limite, cb){
  console.log('GetPaginacionSearch, functions.js');
  db.collection('productos').find({
    'titulo': {
      '$regex': keyword,
      '$options': 'i'
    }
  }).count((err, count) => {
    if(err){
      console.log(err);
      return cb('Error calculando la paginación de los productos. Intentalo de nuevo.', null);
    }
    //Las páginas totales incluida la última que puede ser menor del límite.
    let paginas = Math.ceil(count/limite);
    return cb(null, paginas);
  });
}; 
//Function que me dice cuantas páginas hay en total para ese límite de productos por página y para esa categoría.
function getPaginacionCategoria(categoria, limite, cb){
  console.log('GetPaginacionCategoria, functions.js');
  db.collection('productos').find({
    'categoria': {
      '$regex': categoria,
      '$options': 'i'
    }
  }).count((err, count) => {
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

  if(!/.+@.+\./.test(direccion.email)){
    return cb('Error: el email es incorrecto, inténtelo de nuevo.');
  }
  if(!req.session.username) return cb('Error, tienes que iniciar sesión para comprar.');

  //Guardamos en la base de datos de usersData los productos comprados conjuntamente
  db.collection('usersData').update({
    'username': req.session.username
  }, {
    '$set': {
      'compradosJuntos': arrayProductos
    }
  }, (err) => {
    if(err) console.log(`Error guardando los compradosJuntos al pagar la cesta del usuario ${req.session.username}`);
  });

  //Comprobamos que la cantidad sea correcta, que existan los productos puestos y que se cree un nuevo id de compra
  db.collection('facturas').count((err, count) => {
    if(err) return cb('Error procesando el pago, inténtelo de nuevo.');
    let index = 0;
    idPago = count+1
    //Comprobamos que los productos que ha puesto existan
    for(let i = 0; i < arrayProductos.length; i++){
      let productoNombre = arrayProductos[i].nombre;
      let productoCantidad = arrayProductos[i].cantidad;
      if(arrayProductos[i].cantidad <= 0){
        error = 'Error, la cantidad del producto: '+arrayProductos[i].nombre+' no puede ser menor o igual a 0';
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
    if(!req.session.customerId){
      stripe.customers.create({
        "source": token,
        "description": req.session.username,
        "email": req.session.username
      }).then((customer) => {
        //En el customer.id se guarda el id que se usa para crear charges en stripe
        req.session['customerId'] = customer.id;
        //Hay que guardar la sesión para actualizar el objeto de sesión puesto que en las POST request no se salva automaticamente.
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
    let arrayPermalinks = [];

    for(let i = 0; i < arrayProductos.length; i++){
      let permalink = arrayProductos[i].permalink;
      arrayPermalinks.push(permalink);
    }
    //Conseguimos el precio de cada producto
    db.collection('productos').find({
      'permalink': {$in: arrayPermalinks}
    }, {
      '_id': false,
      'precio': true,
      'titulo': true,
      'permalink': true,
      'imagenes': true
    }).toArray((err, results) => {
      if(err) return cb('Hubo un error procesando los productos, por favor intentalo de nuevo.');
      if(results.length <= 0) return cb('No se han encontrado esos productos en la base de datos, por favor inténtelo de nuevo.');

      let precioTotalCentimos = null,
        arrayProductosInterno = [];
      /*
      - precio total se sale fuera ·
      - id pago se elimina (ya estaba fuera)
      - productos ahora es arrayProductos
      arrayProductos = [{precioCentimos, titulo, cantidad, estaEnviado},
        {precioCentimos, titulo, cantidad, estaEnviado}]
       */
      for(let index = 0; index < results.length; index++){
        let producto = results[index],
          precioCentimos = (producto.precio*100).toFixed(0),
          cantidad = null;
        //Creamos el array de productos interno para meterlo en la base de datos
        let objetoArrayProducto = {
          'precioCentimos': parseInt(precioCentimos),
          'titulo': producto.titulo,
          'permalink': producto.permalink,
          'cantidad': null,
          'estaEnviado': false,
          'imagen': producto.imagenes[1] //Las imagenes están dentro de un objeto "1": "asfasf.jpg"
        };
        /* 
          arrayProductos[index] No tiene nada que ver con el arrayProductosInterno, 
          arrayProductos es el precio para el email y la factura.
          Le calculamos el precio individual para meterlo en el email factura.
        */
        arrayProductos[index]['precioUno'] = (parseInt(precioCentimos)/100);
        //Le calculamos el precio individual x cantidad para la factura
        arrayProductos[index]['precioTotal'] = ((parseInt(precioCentimos)/100)*parseInt(arrayProductos[index].cantidad));
        //Conseguimos la cantidad comprada de ese producto
        for(let f = 0; f < arrayProductos.length; f++){
          if(arrayProductos[f].nombre == producto.titulo){
            cantidad = arrayProductos[f].cantidad;
            objetoArrayProducto.cantidad = parseInt(cantidad);
            precioCentimos *= cantidad;
          }
        }
        //Introducimos el objeto producto en el array interno de productos
        arrayProductosInterno.push(objetoArrayProducto);
        //Aumentamos el precio total
        precioTotalCentimos += precioCentimos;
        if(index + 1 >= results.length){
          precioTotalCentimos = parseInt(precioTotalCentimos.toFixed(0));
        }
      };

      //Luego pagamos el total  y luego guardamos la factura en la base de datos
      let charge = stripe.charges.create({
        "amount": parseInt(precioTotalCentimos), //Cantidad en centimos
        "currency": 'eur',
        "customer": req.session.customerId,
        "description": 'Hola',
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
            'emailUsuarioConectado': req.session.username,
            'nombreApellidos': direccion.nombreApellidos,
            'cantidad': charge.amount,
            'estaProcesado': charge.captured,
            'estaPagado': charge.paid,
            'estaEnviado': false,
            'fecha': charge.created,
            'moneda': charge.currency,
            'customer': charge.customer,
            'productos': arrayProductosInterno,
            'precioTotalCentimos': precioTotalCentimos,
            'telefono': charge.receipt_number,
            'direccion': direccion,
            'terminacionTarjeta': charge.source.last4,
            'chargeObject': charge
          }, (err, result) => {
            if(err) return cb('Error procesando el pago, por favor inténtalo de nuevo.');
            /*
            1. Renderizar el email
            2. Enviar la factura por email
            */
            let emailObject = {
              from: 'merunasgrincalaitis@gmail.com',
              to: direccion.email,
              subject: 'Aqui tienes tu factura. Gracias por comprar.',
              html: null,
              imagenNombre: 'imagenFactura.jpg'
            };
            let renderEmailObject = {
              arrayProductos: arrayProductos,
              precioFinal: (precioTotalCentimos/100)
            };
            //Borramos la cesta al terminar de pagar
            delete req.session.cesta;
            req.session.save();

            //TODO Error handling, ¿Que hacer cuando no se renderiza bien el email? ¿Que hacer cuando no se envía bien?
            render(path.join(__dirname, 'emails', 'factura.html'), renderEmailObject, (err, emailHTML) => {
              if(err) console.log(err);
              emailObject.html = emailHTML;

              sendEmail(emailObject, (err, success) => {
                if(err) console.log(err);
                console.log(success);
              });
              cb(null);
            });
          });
        }
      });
    });
  }
};
//Para registrar un usuario
function registerUsuario(username, password, domain, cb){
  console.log('RegisterUsuario, functions.js');
  checkNewUser(username, err => {
    if(err) return cb(err);
    //Encrypt password
    password = encryptPassword(password);
    db.collection('users').insert({
      'username': username,
      'password': password,
      'emailConfirmado': false
    }, err => {
      if(err) return cb('Error registrando el usuario, inténtelo de nuevo.');
      db.collection('usersData').insert({
        'username': username
      }, (err) => {
        if(err){
          console.log(`Error creando el usersData en la db para ${username}.`);
          return cb('Error registrando el usuario, inténtelo de nuevo.');
        }
        //Enviamos el email de bienvenida
        crypto.randomBytes(48, function(err, buffer) {
          let token = buffer.toString('hex');
          db.collection('tokens').update({
            'username': username
          }, {
            '$set': {
              'confirmEmailToken': token,
              'createdAt': new Date()
            }
          }, {
            'upsert': true
          }, err => {
            if(err) console.log(`Error guardando el email token en la base de datos del nuevo usuario ${username}`);
            let renderObject = {
              confirmUrl: `http://${domain}/confirmar-email/${token}`,
              email: username
            };
            let emailObject = {
              from: 'merunasgrincalaitis@gmail.com',
              to: username,
              subject: `${username} bienvenido a la tienda. Confirma tu email.`,
              html: null,
              imagenNombre: 'imagenFactura.jpg'
            };
            render(path.join(__dirname, 'emails', 'bienvenida.html'), renderObject, (err, HTML) => {
              if(err) console.log('Error enviando el email de bienvenida.');
              emailObject.html = HTML;
              //Enviamos el email
              sendEmail(emailObject);
            });
          });
        });
      });
      //Se ejecuta el callback pero sigue ejecutandose el envio de email
      cb(null);
    });
  });
};
//Verifica que el nuevo usuario haya confirmado su email
//Si está confirmado, se guarda en la db como "emailConfirmado: true"
function verificarEmail(username, token, cb){
  console.log('VerificarEmail, functions.js');
  db.collection('tokens').findOne({
    'username': username
  }, (err, result) => {
    console.log(result)
    if(err) return cb('Error, no se pudo comprobar el email, inténtalo de nuevo.');
    if(!result) return cb('Error, el token para confirmar el email ha expirado. Solicita un nuevo email de confirmación.');
    if(result.confirmEmailToken === token){
      db.collection('users').update({
        'username': username
      }, {
        '$set': {
          'emailConfirmado': true
        }
      }, err => {
        if(err) return cb('No se pudo confirmar el email, intentalo de nuevo y solicita un nuevo email de confirmación.');
        cb(null);
      });
    }else{
      cb('Error, el token de confirmación no coincide con el token generado, solicita un nuevo email de confirmación.');
    }
  });
};
function loginUsuario(email, password, cb){
  console.log('LoginUsuario, functions.js');
  password = encryptPassword(password);
  db.collection('users').findOne({
    'username': email,
    'password': password
  }, function(err, result){
    if(err) cb('Error iniciando sesión, inténtelo de nuevo.');
    if(result != 'undefined' && result != null){
      return cb(null);
    }else{
      return cb('Error, no se encontró al usuario especificado, inténtelo de nuevo.');
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
    if(result && result.cesta != null && result.cesta != undefined && Object.keys(result.cesta).length != 0){
      crearCesta(result.cesta, (err, productosCesta) => {
        if(err) return cb(err, null);
        cb(null, productosCesta);
      });
    }else{
      cb('No hay productos en la cesta', null);
    }
  });
};
//Para buscar los productos en la cesta sin importar el estado de login del usuario, copiarlos y retornar 
//sus propiedades necesarias. Obligatorio pasarle el objeto cesta.
function crearCesta(cesta, cb){
  console.log('CrearCesta, functions.js');
  let productosCesta = [];
  for(let nombreProducto in cesta) productosCesta.push(nombreProducto);
  db.collection('productos').find({
    'permalink': {$in: productosCesta}
  }, {
    'permalink': true,
    'titulo': true,
    'imagenes': true,
    'precio': true,
    '_id': false
  }).toArray((err, results) => {
    if(err || results.length <= 0) return cb('No hay productos en la cesta.', null);
    //Le ponemos la cantidad a cada objeto producto de la cesta
    //Y solo seleccionamos la primera imagen
    let error = null;
    let counter = 0;
    results.forEach((objetoProducto, index) => {
      let cantidad = cesta[objetoProducto.permalink];
      let nombreImagen = results[index].imagenes[1];
      results[index]['imagen'] = nombreImagen;
      results[index]['cantidad'] = cantidad;
      delete results[index].imagenes;
      //Le pasamos la imágen del producto al cliente
      let origen = path.join(__dirname, 'uploads/', objetoProducto.permalink, nombreImagen);
      let end = path.join(__dirname, '../public/public-uploads/');
      copyFile(origen, end, nombreImagen, (err) => {    
        if(err) error = 'No se pudo copiar la imagen de ese producto de la cesta.';

        counter++;
        if(counter >= results.length){
          if(error) return cb(error, null);
          cb(null, results);
        }
      });
    });
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
    req.session.cesta[productoCesta] = parseInt(cantidadProductoCesta);
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
  let producto = req.body.data.producto,
    cantidad = req.body.data.cantidad;
  for(let productoCesta in req.session.cesta){
    if(productoCesta === producto){
      if(cantidad <= 0)
        delete req.session.cesta[productoCesta];  
      else
        req.session.cesta[productoCesta] = cantidad;
    }
  }
  //Al ser una POST hay que guardar la session
  req.session.save();
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
function getLoggedState(req, cb){
  if(req.session.username == 'merloxdixcontrol@gmail.com'){
    cb('admin');
  }else if(req.session.username != null && req.session.username != undefined){
    cb('logged');
  }else{
    cb(null);
  }
};
//Conseguir las facturas de las compras realizadas por los clientes
function getFacturas(ppp, pagina, filtros, cb){
  console.log('Facturas, functions.js');
  if(!filtros) filtros = {};
  else{
    //Convertimos los 'false' strings a boolean
    for(let key in filtros) filtros[key] = (filtros[key] == 'true');
  }
  db.collection('facturas').find(filtros).limit(ppp).skip((pagina-1)*ppp).toArray((err, facturas) => {
    if(err) return cb('Error cargando las facturas.', null);
    cb(null, facturas);
  });
};
//Conseguir el número de páginas totales para las facturas
function getPaginacionFacturas(ppp, pageActual, filtros, cb){
  console.log('GetPaginacionFacturas, functions.js');
  if(!filtros) filtros = {};
  else{
    //Convertimos los 'false' strings a boolean
    for(let key in filtros) filtros[key] = (filtros[key] === 'true');
  }
  db.collection('facturas').find(filtros).skip((pageActual-1)*ppp).count((err, count) => {
    if(err) return cb('Error, no se pudo conseguir las páginas totales.', null);
    //Cada página son 20 productos por defecto ppp es productosPorPagina
    cb(null, Math.ceil(count/ppp));
  });
};
//Actualizar los estados. Ej: marcar que un producto está enviado o pagado o procesado
function actualizarEstadoFactura(id, estado, estadoBoolean, cb){
  console.log('ActualizarEstadoFactura, functions.js');
  let estadoNuevo = {};
  estadoNuevo[estado] = estadoBoolean;
  db.collection('facturas').update({
    'idPago': id
  }, {
    '$set': estadoNuevo
  }, (err, results) => {
    if(err) return cb(`Error, no se pudo actualizar el estado de la factura con el idPago = ${idPago}`);
    cb(null);
  });
};
//Envia un email al cliente notificandole de que sus productos acaban de ser enviado
function enviarEmailProductosEnviados(arrayPermalinks, idPago, dominio, cb){
  db.collection('facturas').findOne({
    'idPago': idPago
  }, {
    '_id': false,
    'fecha': true,
    'direccion': true,
    'productos': true
  }, (err, factura) => {
    if(err) return cb('Error, no se ha encontrado esa factura.');
    
    let todosEnviados = true,
      marcarFacturaTodosEnviados = false;
    for(let i = 0; i < factura.productos.length; i++){
      //Si están todos enviados retornamos al final del for
      if(!factura.productos[i].estaEnviado){
        todosEnviados = false;
        break;
      }
    }
    if(todosEnviados) return cb('Error, todos los productos están enviados.');

    //Si son iguales los arrays, es que van a estar todos enviados, entonces al final guardamos en la bd factura -> estaEnviado true
    if(factura.productos.length === arrayPermalinks.length) marcarFacturaTodosEnviados = true;

    let fecha = new Date(factura.fecha*1000).toISOString(),
      fechaHorario = fecha.split('T')[0].split('-'),
      fechaAño = fechaHorario[0],
      fechaMes = fechaHorario[1],
      fechaDia = fechaHorario[2];

    let renderObject = {
      fecha: `${fechaDia} del ${fechaMes} del año ${fechaAño}`,
      productos: [],
      nombreApellidos: factura.direccion.nombreApellidos,
      linea1: factura.direccion.linea1,
      linea2: factura.direccion.linea2,
      codPostal: factura.direccion.codPostal,
      pais: factura.direccion.pais,
      email: factura.direccion.email,
      telefono: factura.direccion.telefono
    };

    let arrayFinalProductos = []; //Array de objetos con cada producto a renderizar

    for (var i = 0; i < factura.productos.length; i++) {
      let productoObject = {
        'dominioPermalink': `${dominio}/p/${factura.productos[i].permalink}`,
        'titulo': factura.productos[i].titulo,
        'cantidad': factura.productos[i].cantidad
      };
      arrayFinalProductos.push(productoObject);
    }
    renderObject.productos = arrayFinalProductos;
    //Renderizamos el email
    render(path.join(__dirname, 'emails', 'productosEnviados.html'), renderObject, (err, renderedHTML) => {
      if(err) return cb('Error enviando el email de notificación, inténtelo de nuevo.');

      let emailObject = {
        from: 'merunasgrincalaitis@gmail.com',
        to: factura.direccion.email,
        subject: 'Tus productos acaban de ser enviados.',
        html: renderedHTML,
        imagenNombre: 'imagenFactura.jpg'
      };
      //Enviamos el email
      sendEmail(emailObject, (err, success) => {
        if(err) return cb('Error enviando el email: '+err);
        if(success) console.log(success);
        //Hacemos que el estaEnviado de cada producto sea true
        for (let i = 0; i < factura.productos.length; i++) {
          for (let j = 0; j < arrayPermalinks.length; j++) {
            if(arrayPermalinks[j] === factura.productos[i].permalink){
              factura.productos[i].estaEnviado = true;
            }
          }
        }
        //Actualizamos el valor estaEnviado de cada producto
        db.collection('facturas').update({
          'idPago': idPago
        }, {
          '$set': {
            'productos': factura.productos,
            'estaEnviado': marcarFacturaTodosEnviados
          }
        }, (err, success) => {
          if(err) console.log(err);
        });
        cb(null);
      });
    });
  });
};
//Para mostrar los productos que ha comprado el cliente
function conseguirFacturasCliente(req, cb){
  console.log('ConseguirFacturasCliente, functions.js');
  let pagina = req.params.pagina;
  db.collection('facturas').find({
    'emailUsuarioConectado': req.session.username
  }, {
    '_id': false,
    'productos': true,
    'fecha': true,
    'estaEnviado': true,
    'direccion': true,
    'terminacionTarjeta': true
  }).limit(pagina*5).skip((pagina-1)*5).sort({fecha: 1}).toArray((err, facturas) => {
    if(err) return cb('Error buscando los productos', null);
    if(!facturas || facturas.length === 0) return cb('No hay productos que mostrar.', null);
    //Se copian las imágenes mientras se carga la página con los datos
    facturas.forEach(factura => {
      factura.productos.forEach(producto => {
        copyFile(path.join(__dirname, 'uploads/', producto.permalink, producto.imagen), path.join(__dirname, '../public/public-uploads'), producto.imagen, err => {
          if(err) console.log(err);
        });
      });
    });
    cb(null, facturas);
  });
};
//Devuelve cuántas facturas tiene el cliente para hacer el paginador
function contarFacturasCliente(username, cb){
  console.log('ContarFacturasCliente, functions.js');
  db.collection('facturas').find({
    'emailUsuarioConectado': username
  }).count((err, cantidadFacturas) => {
    if(err) return cb('No se ha podido generar el paginador.', null);
    cb(null, cantidadFacturas);
  });
};
//Mandar un mensaje para cambiar la contraseña del usuario y guarda el token en la base de datos "Tokens"
function cambiarContrasena(username, dominio, cb){
  db.collection('users').findOne({
    'username': username
  }, (err, result) => {
    if(err) return cb('Error comprobando el nombre de usuario, inténtalo de nuevo.');
    if(!result) return cb('Error, ese nombre de usuario no existe.');
    let renderObject = {
      'enlace': null
    };
    let emailObject = {
      from: 'merunasgrincalaitis@gmail.com',
      to: username,
      subject: 'Solicitud de cambio de contraseña.',
      html: null,
      imagenNombre: 'imagenFactura.jpg'
    };
    crypto.randomBytes(48, function(err, buffer) {
      let token = buffer.toString('hex');
      renderObject.enlace = token;
      db.collection('tokens').update({
        'username': username
      }, {
        '$set': {
          'resetPasswordToken': token,
          'createdAt': new Date()
        }
      }, {
        'upsert': true
      }, (err, results) => {
        if(err) return cb('Error creando el email, inténtelo de nuevo.');
        renderObject.enlace = `${dominio}/cambiar-contrasena/${token}`;
        render(path.join(__dirname, 'emails', 'cambiarContrasena.html'), renderObject, (err, emailHTML) => {
          if(err) return cb('Error generando el email, inténtelo de nuevo.');
          emailObject.html = emailHTML;
          sendEmail(emailObject, (err, success) => {
            if(err) return cb('Error enviando el email, inténtelo de nuevo.');
            cb(null);
          });
        });
      });
    });
  });
};
//Comprueba que el token usado para restablecer la contraseña del usuario sea correcto
function comprobarTokenCambiarContrasena(username, token, cb){
  console.log('ComprobarTokenCambiarContrasena, functions.js');
  db.collection('tokens').findOne({
    'username': username
  }, (err, result) => {
    if(err) return cb('Error comprobando el cambio de contraseña, inténtalo de nuevo.');
    if(!result) return cb('Error, ese usuario no existe.');
    if(result.resetPasswordToken != token){
      cb('Error, el código generado no coincide con el token de solicitud de cambio de contraseña, solicita un nuevo cambio de contraseña.');
    }else if(result.resetPasswordToken === token){
      cb(null);
    }else{
      cb('Error comprobando el cambio de contraseña, inténtalo de nuevo.');
    }
  });
};
//Cambiar la contraseña y guardar la nueva en la base de datos
function confirmarCambiarContrasena(username, password, cb){
  console.log('ConfirmarCambiarContrasena, functions.js');
  db.collection('users').findOne({
    'username': username
  }, {
    'password': true
  }, (err, result) => {
    if(err) return cb('Error, ese usuario no existe en la base de datos.');
    password = encryptPassword(password);
    db.collection('users').update({
      'username': username
    }, {
      '$set': {
        'password': password
      }
    }, (err) => {
      if(err) return cb('Error actualizando la contraseña, inténtalo de nuevo.');
      console.log(`Contraseña cambiada de ${result.password} a ${password}`);
      cb(null);
    });
  });
};
//Crea el index que expira tras 12 horas para los token de restablecer contraseña para que se eliminen automáticamente
function createExpirePasswordTokenIndex(){
  db.collection('tokens').createIndex({
    'createdAt': 1
  }, {
    expireAfterSeconds: 3600 * 1 //1 hora
  }, (err) => {
    if(err) return console.log(err)
    console.log('Se ha creado el TTL index correctamente de 1 hora para la collection Tokens.');
  })
};
//Comprueba que el nuevo nombre de usuario esté disponible para registrar
function checkNewUser(username, cb){
  console.log('ChecNewUser, functions.js');
  db.collection('users').findOne({
    'username': username
  }, (err, result) => {
    if(err) return cb('Error comprobando disponibilidad de nuevo usuario.');
    if(result && result != '') return cb('Ese usuario ya existe.');
    cb(null);
  });
};
//Cifrar la clave para guardarla de modo seguro en la bd
function encryptPassword(password){
  let cipher = crypto.createCipher(algorithm, encryptPass);
  let update = cipher.update(password, 'utf-8', 'hex');
  update += cipher.final('hex');
  return update;
};
//Para enviar un mensaje desde el formulario de contacto
function enviarMensajeContacto(username, titulo, mensaje, cb){
  if(!username) return cb('Error, no se ha detectado usuario.');
  let emailObject = {
    from: username,
    to: 'merunasgrincalaitis@gmail.com',
    subject: titulo,
    text: mensaje
  };
  sendEmailPlain(emailObject, (err, success) => {
    if(err) return cb('Error enviando el email, inténtalo de nuevo.');
    cb(null);
  });
};
//Guarda en la bd que el usuario a visitado un producto para hacer el minislider de "has visto anteriormente"
function guardarVisitadoUsuario(username, idProducto, cb){
  console.log('GuardarVisitadoUsuario, functions.js');
  if(!username) return cb('Error no hay usuario conectado para registrar la visita.');
  db.collection('usersData').findOne({
    'username': username
  }, (err, userObject) => {
    if(err) return cb('No se ha podido guardar la visita.');
    //Reseteamos el array de paginas vistas a los 200
    if(!userObject.productosVistos || userObject.productosVistos.length >= 200) userObject.paginasVistas = [];
    if(!userObject.productosVistos ||
    //Convertimos cada valor a string y comprobamos con el indexof que no exista
    userObject.productosVistos.map((e) => {return e.toString();}).indexOf(idProducto.toString()) === -1){
      db.collection('usersData').update({
        'username': username
      }, {
        '$push': {
          'productosVistos': idProducto
        }
      }, err => {
        if(err) return cb('Error guardando producto como visitado en la bd.');
        cb(null);
      });
    }else{
      cb(null);
    }
  });
};
//Copia las imagenes al cliente dado un array de productos
function copiarImagenesProductos(arrayProductos, cb){
  let counter = 0,
    end = path.join(__dirname, '../public/public-uploads'),
    error = null,
    imagenesTotales = 0;
  for (var i = 0; i < arrayProductos.length; i++) {
    imagenesTotales += Object.keys(arrayProductos[i].imagenes).length;
  }
  if(imagenesTotales <= 0) return cb('Error no hay imágenes a copiar');
  arrayProductos.forEach(producto => {
    for(let key in producto.imagenes){
      let imagen = producto.imagenes[key];
      let origin = path.join(__dirname, 'uploads/', producto.permalink, imagen);
      copyFile(origin, end, imagen, err => {
        counter++;
        if(err) error = `Error copiando la imagen ${imagen} del producto ${producto.titulo}`;
        if(counter >= imagenesTotales){
          if(error) return cb(err);
          return cb(null);
        }
      });
    }
  });
};
//Para conseguir las urls de las imágenes del slider
function getSliderUrls(cb){
  db.collection('utils').findOne({
    'urls': {$exists: true}
  }, (err, result) => {
    if(err) return cb('No se encontraron las urls del slider.', null);
    cb(null, result.urls);
  });
};

exports.buscarProducto = buscarProducto;
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
exports.crearCesta = crearCesta;
exports.addProductoCesta = addProductoCesta;
exports.cambiarCantidadCesta = cambiarCantidadCesta;
exports.getLoggedState = getLoggedState;
exports.getPaginacionSearch = getPaginacionSearch;
exports.buscarFiltrarProductos = buscarFiltrarProductos;
exports.buscarProductosCategoria = buscarProductosCategoria;
exports.getPaginacionCategoria = getPaginacionCategoria;
exports.buscarFiltrarProductosCategoria = buscarFiltrarProductosCategoria;
exports.getFacturas = getFacturas;
exports.getPaginacionFacturas = getPaginacionFacturas;
exports.actualizarEstadoFactura = actualizarEstadoFactura;
exports.enviarEmailProductosEnviados = enviarEmailProductosEnviados;
exports.conseguirFacturasCliente = conseguirFacturasCliente;
exports.contarFacturasCliente = contarFacturasCliente;
exports.cambiarContrasena = cambiarContrasena;
exports.comprobarTokenCambiarContrasena = comprobarTokenCambiarContrasena;
exports.confirmarCambiarContrasena = confirmarCambiarContrasena;
exports.createExpirePasswordTokenIndex = createExpirePasswordTokenIndex;
exports.checkNewUser = checkNewUser;
exports.verificarEmail = verificarEmail;
exports.enviarMensajeContacto = enviarMensajeContacto;
exports.guardarVisitadoUsuario = guardarVisitadoUsuario;
exports.copiarImagenesProductos = copiarImagenesProductos;
exports.getSliderUrls = getSliderUrls;