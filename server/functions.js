'use strict';
let Mongo = require('mongodb').MongoClient,
  ObjectId = require('mongodb').ObjectID,
  claves = require('./secrets.js'),
  MongoUrl = claves.mongoUrl,
  fs = require('fs'),
  path = require('path'),
  //Ponemos la secret key de stripe para realizar pagos
  stripe = require('stripe')(claves.stripeSecret),
  db = {},
  sendEmail = require('./email.js').sendEmail,
  sendEmailPlain = require('./email.js').sendEmailPlain,
  render = require('./render.js'),
  crypto = require('crypto');

Mongo.connect(MongoUrl, (err, database) => {
  if(err) console.log(err);
  db = database;
  // createExpirePasswordTokenIndex();
});

//Busca productos que tengan el permalink dado y devuelve true si es válido, si no está en uso el permalink
function checkPermalink(permalink, cb){
  console.log('checkPermalink, functions.js');
  permalink = encodeURIComponent(permalink);
  db.collection('productos').findOne({
    'permalink': permalink
  }, (err, result) => {
    if(err){
      return cb(false);
    }
    if(result && result.permalink == permalink){
      return cb(false);
    }else{
      return cb(true);
    }
  });
};
//Busca un producto dado el permalink
function buscarProducto(permalink, callback){
  console.log('BuscarProducto, functions.js');
  permalink = encodeURIComponent(permalink);
  db.collection('productos').findOne({
    'permalink': permalink
  }, (err, result) => {
    if(err){
      return callback('Error, could not find that product', result);
    }else{
      return callback(null, result);
    }
  });
};
//Para buscar muchos productos en la barra de búsqueda del menú
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
    }
    cb(null, results);
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
      cb(null, results, cantidadPaginas);
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
    },
    'publicado': true
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
    }
    cb(null, results);
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
    if(err){
      return cb('Error, could not find those products', null);
    }else{
      let cantidadPaginas = 0;
      if(results.length > 30){
        cantidadPaginas = Math.floor(results.length/30)+1;
        results = results.slice(0, 30);
      }
      cb(null, results, cantidadPaginas);
    }
  });
};

//Funcion para reemplazar o añadir un producto si no existe
function createUpdateProduct(productData, cb){
  console.log('CreateUpdateProduct, functions,js');
  db.collection('productos').update({
    'permalink': encodeURIComponent(productData.permalink.toLowerCase())
  }, {
    'titulo': productData.titulo,
    'imagenes': productData.imagenes,
    'permalink': productData.permalink.toLowerCase(),
    'precio': parseFloat(productData.precio).toFixed(2),
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
function uploadPublicImages(objectImages, cb){
  console.log('UploadPublicImages, functions.js');
  let publicUploads = path.join(__dirname, '../public/public-uploads/');
  let serverUploads = path.join(__dirname, '/uploads/');
  let objectImagenesSize = Object.keys(objectImages).length;
  let counter = 0;
  let error = null;
  for(let key in objectImages){
    copyFile(path.join(publicUploads, objectImages[key]), serverUploads, objectImages[key], err => {
      counter++;
      if(err) error = `No se ha podido copiar la imágen ${objectImages[key]} al servidor, inténtelo de nuevo.`;
      if(counter >= objectImagenesSize){
        if(error) return cb(error);
        cb(null);
      }
    });
  }
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
      if(err) return callback(err, results);
      else return callback(null, results);
    }else{
      return callback('No hay productos', false);
    }
  });
};
//Borra el producto de la bd y sus imágenes
function borrarProducto(permalink, cb){
  console.log('BorrarProducto, functions.js');
  permalink = encodeURIComponent(permalink);
  db.collection('productos').findOne({
    'permalink': permalink
  }, (err, result) => {
    if(err){
      return cb('Error, could not find the product to delete');
    }
    //Borramos el directorio y todas sus imagenes
    borrarImagenesProducto(permalink, err => {
      if(err) console.log(err); //Aunque no se hayan podido eliminar las imágenes, sigue eliminando el producto de la db
      db.collection('productos').remove({
        'permalink': permalink
      }, err => {
        if(err){
          console.log(err);
          return cb('Error, could not delete the product');
        }else{
          console.log('Se ha borrado el producto: '+permalink+ 'con exito.');
          cb(null);
        }
      });
    });
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
      return callback('#1 Error guardando las categorías.');
    }else{
      return callback(null);
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
    if(err) return done(`Error copiando el directorio de imagenes del producto: ${err.code}`);
    if(stats.isDirectory()){
      //Check if end exists and create directory
      fs.stat(end, (err, stats) => {
        if(err){
          fs.mkdir(end, (err) => {
            if(err){
              done('Error copiando el directorio de imágenes del producto, no se ha podido crear el directorio final del cliente.');
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
          done('Error copiando el directorio de imágenes del producto, no hay imágenes a copiar, el directorio está vacío.');
        }
      });
    }else{
      done('Error copiando el directorio de imágenes del producto, no se ha encontrado ese directorio.');
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
function guardarBusqueda(req, cb){
  console.log('GuardarBusqueda, functions.js');
  let busqueda = req.body.data;
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
          'veces': (busquedaExistente.veces + 1),
          'ip': req.ip
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
  let end = path.join(__dirname, '_Slider/');
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
    }, err => {
      if(err) return cb('Err, could not save the slider images to the db: '+err);
      cb(null);
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
    let originDir = path.join(__dirname, '_Slider/');
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
    let originDir = path.join(__dirname, '_Slider/');
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
        db.collection('productos').find({
          'publicado': true
        }, {
          "_id": false,
          "titulo": true,
          "permalink": true,
          "precio": true,
          "imagenes.1": true,
          "categoria": true
        }).sort({'vendidos': -1}).skip(paginaSiguiente).limit(5).toArray((err, results) => {
          if(err) return cb('Error buscando los productos mas vendidos.', null);
          return cb(null, results, paginasTotales);
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

        db.collection('productos').find({
          '_id': {
            '$in': userData.productosVistos
          },
          'publicado': true
        }, {
          "_id": false,
          "titulo": true,
          "permalink": true,
          "precio": true,
          "imagenes.1": true,
          "categoria": true
        }).skip(paginaSiguiente).limit(5).toArray((err, results) => {
          if(err) return cb('Error buscando los productos vistos.', null, null);
          return cb(null, results, paginasTotales);
        });
      });
    break;

    case 'compradosJuntos':
      db.collection('usersData').find({
        'compradosJuntos': {'$exists': true}
      }, {
        '_id': false,
        'compradosJuntos': true
      }).limit(5).toArray((err, arrayUserData) => {
        if(err)
          return cb('Error buscando los productos comprados juntos.', null, null);
        if(!arrayUserData)
          return cb('Error, no hay productos comprados juntos', null, null);

        let productosCompradosJuntos = [],
          cantidadProductosCompradosJuntos = 0;
        for (let i = 0; i < arrayUserData.length; i++) {
          for (let j = 0; j < arrayUserData[i].compradosJuntos.length; j++) {
            cantidadProductosCompradosJuntos++;
            if(productosCompradosJuntos.length < 5){
              productosCompradosJuntos.push(arrayUserData[i].compradosJuntos[j].permalink);
            }
          }
        }
        let paginasTotales = cantidadProductosCompradosJuntos/5;
        let paginaSiguiente = paginasTotales < pagina ? pagina*5 : paginasTotales;
        //userData.productosVistos son IDs de productos, hay que buscar los productos
        db.collection('productos').find({
          'permalink': {
            '$in': productosCompradosJuntos
          },
        }, {
          "_id": false,
          "titulo": true,
          "permalink": true,
          "precio": true,
          "imagenes.1": true,
          "categoria": true
        }).skip(paginaSiguiente).limit(5).toArray((err, results) => {
          if(err) return cb('Error buscando los productos comprados juntos.', null, null);
          return cb(null, results, paginasTotales);
        });
      });
    break;

    case 'recientes':
      db.collection('productos').count((err, count) => {
        if(err) return cb('Error contando los productos', null, null);
        let paginasTotales = count/5;
        let paginaSiguiente = paginasTotales < pagina ? pagina*5 : paginasTotales;
        db.collection('productos').find({
          'publicado': true
        }, {
          "_id": false,
          "titulo": true,
          "permalink": true,
          "precio": true,
          "imagenes.1": true,
          "categoria": true
        }).sort({'fecha': -1}).skip(paginaSiguiente).limit(5).toArray((err, results) => {
          if(err) return cb('Error buscando los productos mas recientes.', null, null);
          return cb(null, results, paginasTotales);
        });
      });
    break;

    case 'random':
      db.collection('productos').count((err, count) => {
        if(err) return cb('Error contando los productos random', null, null);
        let paginasTotales = count/5;
        db.collection('productos').aggregate([
          {$sample: {size: 5}},
          {$match: {'publicado': true}}
        ]).toArray((err, results) => {
          if(err) return cb('Error buscando los productos random.', null);
          return cb(null, results, paginasTotales);
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
  let dataObject = req.body.data,
    direccion = dataObject.direccion,
    arrayProductos = dataObject.productos,
    token = dataObject.token,
    idPago = 0,
    customerId = null,
    error = null,
    precioTotalCentimos = null,
    arrayProductosInterno = [];

  if(!/.+@.+\./.test(direccion.email)){
    return cb('#1 Error: el email es incorrecto, inténtelo de nuevo.');
  }
  if(!req.session.username) return cb('#2 Error, tienes que iniciar sesión para comprar.');

  //Guardamos en la base de datos de usersData los productos comprados conjuntamente
  db.collection('usersData').update({
    'username': req.session.username
  }, {
    '$set': {
      'compradosJuntos': arrayProductos
    }
  }, err => {
    if(err) console.log(`#3 Error guardando los compradosJuntos al pagar la cesta del usuario ${req.session.username}`);
  });

  //Comprobamos que la cantidad sea correcta, que existan los productos puestos y que se cree un nuevo id de compra
  db.collection('facturas').count((err, count) => {
    if(err) return cb('#4 Error procesando el pago, inténtelo de nuevo.');
    let index = 0;
    idPago = count+1
    //Comprobamos que los productos que ha puesto existan
    for(let i = 0; i < arrayProductos.length; i++){
      let productoPermalink = arrayProductos[i].permalink;
      let productoCantidad = arrayProductos[i].cantidad;
      if(arrayProductos[i].cantidad <= 0){
        error = '#5 Error, la cantidad del producto: '+arrayProductos[i].nombre+' no puede ser menor o igual a 0';
      }
      db.collection('productos').findOne({
        'permalink': productoPermalink
      }, (err, result) => {
        index++;
        if(err) error = '#6 Error procesando el pago, por favor inténtalo de nuevo.';
        if(!result) error = '#7 Este producto no existe o no está disponible: '+arrayProductos[i].nombre+', por favor cambialo.';
        //Si se ha llegado al último producto sin errores, continuar
        if(index >= arrayProductos.length){
          if(error) return cb(error);
          crearCustomer();
        }
      });
    }
  });

  /**
   * Comprueba si el usuario ya tiene customerId y si no, hace lo siguiente:
   * 1. Crea un costumer con stripe.customers.create con su email de sessión
   * 2. Si no se puede crear lanza un catch y le devuelve el error #8.5
   * 3. Una vez creado se guarda en la base de datos el customerId para ese usuario en "users"
   * 4. Entonces se pasa a realizarPago();
   * @return { callback } Puede devolver errores en el proceso que termina el programa inmediatamente
   */
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
          if(err) return cb('#8 Error procesando el pago, por favor inténtalo de nuevo.');
          realizarPago();
        });
      }).catch(err => {
        return cb('#8.5 No se pudo realizar el pago, inténtalo de nuevo y prueba a iniciar sesión de nuevo.');
      });
    }else{
      //Preparamos los productos para crear los objetos y arrays necesarios para realizar el pago
      prepararProductosPago(err => {
        if(err) return cb(err);
        realizarPago();
      });
    }
  };

  /**
   * Prepara los productos ordenando la información a guardar en la base de datos y preparando
   * la información de cada producto para el email factura.
   * 1. Creamos un array de permalinks y buscamos en la bd de productos
   * esos permalinks para obtener información sobre esos productos
   * 2. Por cada producto encontrado, pasamos su precio de 11.02 -> 1102 int
   * 3. Creamos un objeto producto por cada uno de esos productos con los datos principales
   * 4. Establecemos el precio individual y total de todos los productos en un array de productos
   * para enviar el email transaccional
   * @return { callback } Callback error or null
   */
  function prepararProductosPago(done){
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
      if(err) return done('#9 Hubo un error procesando los productos, por favor intentalo de nuevo.');
      if(results.length <= 0) return done('#10 No se han encontrado esos productos en la base de datos, por favor inténtelo de nuevo.');

      /*
      arrayProductos = [{precioCentimos, titulo, cantidad, estaEnviado},
        {precioCentimos, titulo, cantidad, estaEnviado}]
       */
      //Recorremos los productos
      for(let index = 0; index < results.length; index++){
        let producto = results[index],
          precioCentimos = parseInt((producto.precio*100).toFixed(0)),
          cantidad = null;
        /*
         * arrayProductos[index].atributos = [{
         *   'color': 'rojo'
         *   'talla': '7XL'
         * }]
         */
        //Creamos el array de productos interno para meterlo en la base de datos
        let objetoArrayProducto = {
          'precioCentimos': precioCentimos,
          'titulo': producto.titulo,
          'permalink': producto.permalink,
          'atributos': arrayProductos[index].atributos, //Es un array de objetos {atributoNombre: 'color', atributoValorSeleccionado: 'Rojo'}
          'cantidad': null,
          'estaEnviado': false,
          'imagen': producto.imagenes[1] //Las imagenes están dentro de un objeto "1": "asfasf.jpg"
        };
        /*
          arrayProductos[index] No tiene nada que ver con el arrayProductosInterno,
          arrayProductos es el precio para el email y la factura.
          Le calculamos el precio individual para meterlo en el email factura.
        */
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
          precioTotalCentimos = parseInt(precioTotalCentimos);
        }
      };
      for(let o = 0; o < arrayProductos.length; o++){
        //Ponemos los atributos
        let textoAtributos = '';
        for(let indexAtb = 0; indexAtb < arrayProductos[o].atributos.length; indexAtb++){
          if(indexAtb > 0)
            textoAtributos += ', '+arrayProductos[o].atributos[indexAtb].atributoSeleccionado;
          else
            textoAtributos += arrayProductos[o].atributos[indexAtb].atributoSeleccionado;
        }

        let precioOriginal; //El precio de este producto aunque esté repetido en la cesta
        for(let x = 0; x < results.length; x++){
          if(arrayProductos[o].permalink === results[x].permalink){
            precioOriginal = results[x].precio;
            break;
          }
        }

        arrayProductos[o]['atributos'] = textoAtributos;
        //En el email se muestra "Producto" - "Cantidad" - "Precio individual" - "Precio total"
        arrayProductos[o]['precioUno'] = precioOriginal;
        //Le calculamos el precio individual x cantidad para la factura
        arrayProductos[o]['precioTotal'] = parseFloat(precioOriginal*parseInt(arrayProductos[o].cantidad)).toFixed(2);
      }
      done(null);
    });
  };

  /**
   * Realiza el pago de la compra del usuario con el customerId una vez estén preparados los productos
   * 1. Creamos el pago propiamente dicho con stripe.charges.create
   * 2. Si no hay errores pagando, insertamos la factura en la base de datos
   * 3. Borramos la cesta para quitar los productos comprados
   * 4. Renderizamos el email con la información necesaria
   * 5. Terminamos la función y devolvemos el callback pero sigue ejecutandose el envio del email
   * 5. Enviamos el email transaccional de la factura de compra para referencias futuras
   */
  function realizarPago(){
    console.log('RealizarPago, functions.js');
    //Pagamos el total y luego guardamos la factura en la base de datos
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
        return cb('#11 Tu tarjeta ha sido rechazada, por favor escribe otra vez la información de tu tarjeta e intentalo de nuevo.');
      }else{
        db.collection('facturas').insert({
          'idPago': idPago,
          'emailUsuarioConectado': req.session.username,
          'nombreApellidos': direccion.nombreApellidos,
          'cantidad': charge.amount,
          'estaProcesado': charge.captured,
          'estaPagado': charge.paid,
          'estaEnviado': false,
          'fecha': charge.created,
          'moneda': charge.currency,
          'productos': arrayProductosInterno,
          'precioTotalCentimos': precioTotalCentimos,
          'telefono': charge.receipt_number,
          'direccion': direccion,
          'terminacionTarjeta': charge.source.last4,

          'customer': charge.customer,
          'idCharge': charge.id,
          'chargeObject': charge
        }, (err, result) => {
          if(err) return cb('#12 Error procesando el pago, por favor inténtalo de nuevo.');
          /*
          1. Renderizar el email
          2. Enviar la factura por email
          */
          let emailObject = {
            from: 'merunasgrincalaitis@gmail.com',
            to: direccion.email,
            subject: 'Aqui tienes tu factura. Gracias por comprar.',
            html: null
          };
          let renderEmailObject = {
            arrayProductos: arrayProductos,
            precioFinal: (precioTotalCentimos/100)
          };

          //Borramos la cesta en la bd y en la session
          db.collection('usersData').update({
            'username': req.session.username
          }, {
            '$set': {
              'cesta': []
            }
          }, err => {
            if(err) console.log(err);
            //Borramos la cesta al terminar de pagar
            delete req.session.cesta;
            req.session.save();
          });

          //Terminamos el pago aunque el envío de email continúa solo hasta terminar de enviarse el email
          cb(null);

          //TODO Error handling, ¿Que hacer cuando no se renderiza bien el email? ¿Que hacer cuando no se envía bien?
          render(path.join(__dirname, 'emails', 'factura.html'), renderEmailObject, (err, emailHTML) => {
            if(err) console.log(err);
            emailObject.html = emailHTML;

            sendEmail(emailObject, (err, success) => {
              if(err) console.log(err);
              console.log(success);
            });
          });
        });
      }
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
              html: null
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
function getLoggedState(req, cb){
  if(req.session.username === claves.adminName){
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
    for(let key in filtros) filtros[key] = (filtros[key] === 'true');
  }
  db.collection('facturas').find(filtros).limit(ppp).skip((pagina-1)*ppp).sort({'idPago': -1}).toArray((err, facturas) => {
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
        html: renderedHTML
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
        copyFile(path.join(__dirname, 'uploads/', producto.imagen), path.join(__dirname, '../public/public-uploads'), producto.imagen, err => {
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
      html: null
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
  let cipher = crypto.createCipher('aes-256-cbc', '648fad€.,sdoifhdfijPAS►');
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
    if(!userObject) return cb('No se ha encontrado ese usuario.');
    //Reseteamos el array de paginas vistas a los 200
    if(!userObject.productosVistos || userObject.productosVistos.length >= 200) userObject.paginasVistas = [];
    //Convertimos cada valor a hexstring (es un ObjectId de mongo )y comprobamos con el indexof que no exista
    if(!userObject.productosVistos ||
      userObject.productosVistos.map((e) => {return e.toHexString();}).indexOf(idProducto.toHexString()) === -1){
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
      let origin = path.join(__dirname, 'uploads/', imagen);
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
//Sube cada producto a la bd y crea una carpeta vacía con el permalink correspondiente de cada uno en server/csv
function subirCSV(arrayProductos, cb){
  console.log('SubirCSV, functions.js');
  if(arrayProductos.length <= 0) return cb('#7 No se han recibido productos');

  let arrayProductosCopia = arrayProductos;
  let permalinks = arrayProductos.map(e => {return e.permalink});
  arrayProductos = arrayProductosCopia;

  db.collection('productos').find({
    'permalink': {
      $in: permalinks
    }
  }).toArray((err, results) => {
    if(err) return cb('#8 Error, comprobando productos repetidos.');
    if(results && results.length > 0) return cb('#9 Error, algunos productos ya están subidos, intentalo de nuevo.');
    db.collection('productos').insert(arrayProductos, err => {
      if(err) return cb(`#1 Error subiendo los productos.`);
      cb(null);
    });
  });
};
//Borrar las imagenes de 1 producto dado el permalink y devuelve cb(null) o cb(error)
function borrarImagenesProducto(permalink, cb){
  console.log('BorrarImagenesProducto, functions.js');
  db.collection('productos').findOne({
    'permalink': permalink
  }, (err, result) => {
    console.log(result);
    if(err) return cb(`#1 Error borrando las imagenes del producto ${permalink}`);
    if(!result) return cb(`#2 Error, no se ha encontrado el producto ${permalink} para borrar sus imágenes`);

    let counter = 0;
    let error = null;
    let tamanoImages = Object.keys(result.imagenes).length;
    if(tamanoImages <= 0) return cb(`#5 El producto ${result.titulo} no tiene imágenes.`);
    for(let key in result.imagenes){
      fs.unlink(path.join(__dirname, 'uploads', result.imagenes[key]), err => {
        counter++;
        if(err) error = `#4 Error borrando la imagen ${result.imagenes[key]}`;
        if(counter >= tamanoImages){
          if(error) return cb(error);
          cb(null);
        }
      });
    };
  });
};
//Copia las imágenes al public uploads dado el permalink. El cb es error o null.
function copyImagesProducto(permalink, cb){
  console.log('CopyImagesProducto, functions.js');
  db.collection('productos').findOne({
    'permalink': permalink
  }, (err, producto) => {
    if(err) return cb('#1 Error buscando el producto a copiar las imágenes.');
    if(!producto) return cb(`#2 El producto "${permalink}" no se ha encontrado.`);
    let tamanoImages = Object.keys(producto.imagenes).length;
    let counter = 0;
    let error = null;

    if(tamanoImages <= 0) return cb(`#3 No hay imágenes para el producto ${producto.titulo}`);
    for(let key in producto.imagenes){
      copyFile(path.join(__dirname, 'uploads', producto.imagenes[key]),
        path.join(__dirname, '../public/public-uploads'), producto.imagenes[key], err => {

        counter++;
        if(err) error = `#4 Error copiando la imagen: ${producto.imagenes[key]}`;
        if(counter >= tamanoImages){
          if(error) {
            console.log(error);
            return cb(error);
          }
          console.log('Done');
          cb(null);
        }
      });
    }
  });
};
//Genera el objeto de preguntas frecuentes. Cb es err, objetoSecciones
function getPreguntasFrecuentes(cb){
  console.log('GetPreguntasFrecuentes, functions.js');
  db.collection('preguntasFrecuentes').find({}).limit(10).toArray((err, preguntas) => {
    if(err) return cb('no se han encontrado las preguntas frecuentes.', null);
    if(preguntas && preguntas.length < 1) return cb('no se han encontrado las preguntas frecuentes.', null);
    cb(null, preguntas);
  });
};
//Set las preguntas frecuentes en la db
/*
arrayPreguntas = [
  {
    'pregunta': 'abc',
    'respuesta': 'bca'
  }, {...}
]
 */
//Añade una nueva pregunta frecuente a la base de datos
function setPreguntasFrecuentes(objetoPregunta, cb){
  console.log('SetPreguntasFrecuentes, functions.js');
  db.collection('preguntasFrecuentes').insert(objetoPregunta, err => {
    if(err) return cb('Error guardando las preguntas, inténtalo de nuevo.')
    cb(null);
  });
};
//Elimina una pregunta frecuente
function eliminarPreguntaFrecuente(id, cb){
  console.log('EliminarPreguntaFrecuente, functions.js');
  db.collection('preguntasFrecuentes').remove({
    '_id': new ObjectId(id) //Debe ir entrecomillado el id
  }, err => {
    if(err) return cb('Error borrando la pregunta frecuente, inténtalo de nuevo.');
    cb(null);
  });
};
//Edita una pregunta existente
function editarPregunta(id, preguntaModificada, respuestaModificada, cb){
  console.log('EditarPregunta, functions.js');
  db.collection('preguntasFrecuentes').update({
    '_id': new ObjectId(id)
  }, {
    'pregunta': preguntaModificada,
    'respuesta': respuestaModificada
  }, err => {
    if(err) return cb('No se puedo modificar la pregunta, inténtalo de nuevo.');
    cb(null);
  });
};
//Devuelve el objeto cesta
function getCesta(session, cb){
  console.log('GetCesta, functions.js');
  if(session.isLogged){
    db.collection('usersData').findOne({
      'username': session.username
    }, {
      'cesta': true,
      '_id': false
    }, (err, result) => {
      if(err) return cb(err, result.cesta);
      //Comprobamos que la cesta no esté vacía
      if(result && result.cesta && result.cesta.length > 0){
        cb(null, result.cesta);
      }else{
        cb('no hay productos en la cesta', null);
      }
    });
  }else{
    if(session && session.cesta && session.cesta.length > 0){
      cb(null, session.cesta);
    }else{
      cb('no hay productos en la cesta', null);
    }
  }
};
//Añadimos el producto a la cesta del usersData del cliente si está conectado.
//Esté conectado o no, se guardará en la sesión.
function addProductoCesta(req, productoNuevo, cb){
  console.log('AddProductoCesta, functions.js');
  let cesta = req.session.cesta,
    indexProductoCesta = -1;

  if(!cesta){
    cesta = [];
    cesta.push(productoNuevo);
  }else{
    indexProductoCesta = comprobarProductosCestaIguales(cesta, productoNuevo);
  }
  //Añadimos nuevo producto si no existe en la cesta o tiene distintos atributos
  db.collection('productos').findOne({
    'permalink': productoNuevo.permalink
  }, (err, result) => {
    if(err) return cb('error buscando el producto');
    if(!result) return cb('no se ha encontrado el producto');
    productoNuevo['titulo'] = result.titulo;
    productoNuevo['precio'] = parseFloat(result.precio);
    productoNuevo['atributosTotales'] = result.atributos;
    productoNuevo['imagen'] = result.imagenes ? result.imagenes[1] : '';
    productoNuevo['id'] = cesta.length;

    if(indexProductoCesta != -1){
      cesta[indexProductoCesta].cantidad += productoNuevo.cantidad;
    }else cesta.push(productoNuevo);
    req.session.cesta = cesta;
    req.session.save();
    // Se ejecuta aunque llames al callback
    if(req.session.isLogged) guardarCestaDB();

    cb(null);
  });

  //Guarda la cesta en la db usersData si está conectado
  function guardarCestaDB(){
    db.collection('usersData').update({
      'username': req.session.username
    }, {
      '$set': {
        'cesta': cesta
      }
    }, err => {
      if(err) console.log(`Error guardando la cesta del cliente ${session.username}`);
    });
  };
};
/**
 * Permite comprobar si la cesta y el producto nuevo son iguales en cuanto a permalink y atributos
 * @param  {objeto} cesta         [la cesta de la sesión]
 * @param  {objeto} productoNuevo [el productonuevo con el que comparar]
 * @return {int}               [te devuelve la posición del producto igual o -1 si no hay iguales en la cesta]
 */
function comprobarProductosCestaIguales(cesta, productoNuevo){
  console.log('ComprobarProductosCestaIguales, functions.js');
  /* Comprobamos si existe el exactamente mismo producto con los mismos atributos pero distintas cantidades
  en la cesta y le aumentamos cantidad o lo creamos */
  let indexProductoCesta = -1;
  for (let i = 0; i < cesta.length; i++) {
    if(cesta[i].permalink == productoNuevo.permalink){
      let atributosIguales = true;
      for(let key in cesta[i].atributosSeleccionados){
        if(cesta[i].atributosSeleccionados[key] != productoNuevo.atributosSeleccionados[key]){
          atributosIguales = false;
        }
      }
      if(atributosIguales) indexProductoCesta = i;
    }
  }
  return indexProductoCesta;
};
//Sustituimos los valores de atributos seleccionados y cantidad seleccionada del id de producto en la cesta
//con los nuevos valores
function cambiarCantidadCesta(req, cambios, cb){
  console.log('CambiarCantidadCesta, functions.js');
  let cesta = req.session.cesta;

  if(cambios.tipoCambio === 'delete'){
    cesta.splice(cambios.id, 1);
    //Recreamos las IDs porque se ha borrado uno, ej: se borra el 2 del array 1 2 3 -> 1 3
    for(let i = 0; i < cesta.length; i++){
      cesta[i].id = i;
    }
  }else if(cambios.tipoCambio === 'cantidad'){
    if(cambios.cantidad < 1) return cb('error, no puedes comprar menos de 1 producto');
    cesta[cambios.id].cantidad = cambios.cantidad;
  }else{
    cesta[cambios.id].atributosSeleccionados[cambios.atributoNombre] = cambios.atributoSeleccionado;
  }

  req.session.cesta = cesta;
  req.session.save();
  // Se ejecuta aunque llames al callback
  if(req.session.isLogged) guardarCestaDB();

  cb(null);

  //Guarda la cesta en la db usersData si está conectado
  function guardarCestaDB(){
    db.collection('usersData').update({
      'username': req.session.username
    }, {
      '$set': {
        'cesta': cesta
      }
    }, err => {
      if(err) console.log(`Error guardando la cesta del cliente ${session.username}`);
    });
  };
};
// Aumenta la visita de la página correspondiente
function aumentarVisitaPagina(req){
  db.collection('visitas').insert({
    'pagina': req.originalUrl.split('?')[0], //No queremos parametros query
    'ip': req.ip,
    'fecha': new Date()
  }, err => {
    if(err) console.log('No se pudo aumentar la visita');
  });
};
//Para obtener las visitas mensuales
/**
 * arrayVisitas = [{
 *    _id: {
 *      'dia': 17
 *    },
 *    visitas: 15
 * }]
 */
function getVisitasDiarias(cb){
  console.log('GetVisitasDiarias, functions.js');

  db.collection('visitas').aggregate([{
      '$group': {
        '_id': {'dia': {'$dayOfMonth': '$fecha'}},
        'visitas': {'$sum': 1}
      },
    }, {
      '$project': {
        '_id': 0,
        'dia': '$_id.dia',
        'visitas': 1
      }
    }, {
      '$sort': {'dia': 1}
    }
    ]).toArray((err, arrayVisitas) => {
    if(err) return cb('No se ha podido conseguir la información de las visitas.', null);

    cb(null, arrayVisitas);
  });
};
//Devuelve el html y el /href dependiendo del estado de logged que se encuentre el usuario
function getLoggedStateHTML(req, cb){
  getLoggedState(req, state => {
    if(state === 'logged'){
      cb('mi cuenta ▼', '/micuenta');
    }else if(state === 'admin'){
      cb('admin ▼', '/admin');
    }else{
      cb('iniciar sesión ▼', '/login');
    }
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
exports.buscarProductos = buscarProductos;
exports.guardarBusqueda = guardarBusqueda;
exports.guardarSliderImages = guardarSliderImages;
exports.getSlider = getSlider;
exports.getMiniSlider = getMiniSlider;
exports.getPaginacion = getPaginacion;
exports.payProduct = payProduct;
exports.registerUsuario = registerUsuario;
exports.loginUsuario = loginUsuario;
exports.getCesta = getCesta;
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
exports.subirCSV = subirCSV;
exports.borrarImagenesProducto = borrarImagenesProducto;
exports.copyImagesProducto = copyImagesProducto;
exports.getPreguntasFrecuentes = getPreguntasFrecuentes;
exports.setPreguntasFrecuentes = setPreguntasFrecuentes;
exports.eliminarPreguntaFrecuente = eliminarPreguntaFrecuente;
exports.editarPregunta = editarPregunta;
exports.checkPermalink = checkPermalink;
exports.aumentarVisitaPagina = aumentarVisitaPagina;
exports.getVisitasDiarias = getVisitasDiarias;
exports.getLoggedStateHTML = getLoggedStateHTML;
