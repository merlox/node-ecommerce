'use strict';
/*

Estas son las páginas de utilidades para cargar funciones en ajax

*/

let functions = require('./../functions.js'),
	path = require('path'),
	express = require('express'),
  fs = require('fs'),
  formidable = require('formidable'),
  api = express.Router();

let requestProcessing = false;

api.get('/get-images/:permalink', (req, res) => {
  functions.copyDirectory(path.join(__dirname, '../uploads/', encodeURIComponent(req.params.permalink)), 
    path.join(__dirname, '../../public/', '/public-uploads/'), (err) => {
    if(err) console.log(err);
    res.send('Images copied');
  });
});
api.get('/permalink-check/:permalink', (req, res) => {
	functions.buscarProducto(req.params.permalink, (err, result) => {
		if(err) return res.send(err);
		if(result != null){
			return res.send(true);
		}else{
			return res.send(null);
		}
	});
});
api.post('/guardar-categorias', (req, res) => {
	functions.guardarCategorias(req.body, (err, success) => {
		if(err) return res.send(err);
		return res.send(success);
	});
});
api.get('/get-categories', (req, res) => {
	functions.getCategories((err, result) => {
		if(err){
			return res.send(err);
		}else{
			return res.send(result);
		}
	});
});
api.get('/get-all-products/:imagenesLimit?', (req, res) => {
  let imagesLimit = 400,
    page = 1,
    filtroCategoria = ''
  if(req.params.imagenesLimit) imagesLimit = parseInt(req.params.imagenesLimit);
  if(req.query.page) page = parseInt(req.query.page);
  if(req.query.filtroCategoria) filtroCategoria = req.query.filtroCategoria;
	
  functions.getAllProducts(imagesLimit, page, filtroCategoria, (err, results) => {
		if(err){
			console.log(err);
			return res.send(err);
		}else{
			return res.send(results);
		}
	});
});
api.get('/get-paginacion-admin-productos/:productLimit?', (req, res) => {
  let limite = 100,
    filtroCategoria = '';
  if(req.params.productLimit) limite = parseInt(req.params.productLimit);
  if(req.query.filtroCategoria) filtroCategoria = req.query.filtroCategoria;

  functions.getPaginacion(limite, filtroCategoria, (err, paginas) => {
    if(err){
      console.log(err);
      return res.send(null);
    }else{
      let objetoPaginas = {paginas: paginas};
      objetoPaginas = JSON.stringify(objetoPaginas);
      return res.send(objetoPaginas);
    }
  });
});
api.get('/get-single-product/:permalink', (req, res) => {
  functions.buscarProducto(req.params.permalink, (err, result) => {
    if(err){
      console.log(err);
      return res.send(err);
    }
    functions.copyDirectory(path.join(__dirname, '../uploads/', encodeURIComponent(req.params.permalink)), 
        path.join(__dirname, '../../public/public-uploads/'), (err) => {
      if(err) {
        console.log(err);
        return res.send('There was an error getting the product, please try again.');
      }
      return res.send(result);
    });
  });
});
api.get('/borrar-producto/:permalink', (req, res) => {
  functions.borrarProducto(req.params.permalink, (err) => {
    if(err){
      console.log(err);
      return res.send(err);
    }
    else return res.send(true);
  });
});
//Para upload las imagenes al public uploads
let productImages = {};
api.post('/upload-image-product', (req, res) => {
  let form = new formidable.IncomingForm();
  let counterImage = 0;
  form.multiple = true;
  form.uploadDir = path.join(__dirname, '../../public/public-uploads');
  form.on('file', (field, file) => {
    counterImage++;
    //Le cambiamos el nombre en caso de que tenga códigos html
    file.name = file.name.replace(/&.*;+/g, '-');
    //Esta linea es la que se encarga de subir el archivo en el servidor.
    functions.copyFile(file.path, path.join(__dirname, '../../public/public-uploads/'), file.name, (err) => {
      if(err) console.log(err);
      else{
        //Borramos el temporal para subir el definitivo
        fs.unlink(file.path, (err) => {
          if(err) console.log(err);
        });
      }
    });

    productImages[counterImage] = file.name;
  });
  form.on('error', (err) => {
    console.log('An error ocurred uploading the images '+err);
  });
  form.on('end', () => {
    //Response
    res.send(JSON.stringify(productImages));
    productImages = {};
  });
  form.parse(req);
});
//1. Create a folder for each product images and then copy the folder to uploads in the server
api.post('/upload-product', (req, res) => {
  let b = req.body,
    responseObject = {
      'error': null,
      'success': null
    };
  if(!b.titulo || !b.imagenes || !b.permalink || !b.precio || !b.descripcion || !b.categoria || !b.atributos || !b.publicado){
    responseObject.error = 'Error, algún dato del producto no se ha recibido correctamente, comprueba la información del producto.';
    return res.send(responseObject);
  };
  //Guardamos el producto en la base de datos
  let informacionProducto = {
    'titulo': req.body.titulo,
    'imagenes': req.body.imagenes,
    'permalink': req.body.permalink,
    'precio': parseInt(req.body.precio),
    'descripcion': req.body.descripcion,
    'categoria': req.body.categoria,
    'atributos': req.body.atributos,
    'publicado': req.body.publicado,
    'fecha': new Date(),
    'visitas': 0,
    'vendidos': 0
  };
  functions.uploadPublicImages(req.body.imagenes, req.body.permalink.toLowerCase(), (err) => {
    if(err){
      responseObject.error = 'Error, las imágenes no se han subido subido correctamente, inténtalo de nuevo.';
      return res.send(responseObject);  
    }
  });
  functions.createUpdateProduct(req.body.permalink.toLowerCase(), informacionProducto, (err) => {
    if(err){
      responseObject.error = 'Error, no se pudo guardar el producto en la base de datos, inténtalo de nuevo.';
      return res.send(responseObject);
    }else{
      responseObject.success = 'Producto guardado satisfactoriamente';
      return res.send(responseObject);
    }
  });
});
api.post('/guardar-busqueda', (req, res) => {
  functions.guardarBusqueda(req.body.data, (err) => {
    if(err) console.log(err);
    return res.send(null);
  });
});
//Para guardar las imágenes del slider en el servidor y base de datos
api.post('/upload-slider-server', (req, res) => {
  functions.guardarSliderImages(req.body.data, (err) => {
    if(err){
      console.log(err);
      res.send(err);
    }else{
      res.send(null);
    }
  });
});
api.get('/get-slider', (req, res) => {
  functions.getSlider(false, (err, result) => {
    if(err) console.log(err);
    return res.send(result);
  });
});
api.get('/get-mas-vendidos', (req, res) => {
  functions.getMiniSlider("ventas", (err, results) => {
    if(err) console.log(err);
    return res.send(results);
  });
});
api.get('/get-logged-state', (req, res) => {
  functions.getLoggedState(req, (state) => {
    res.send(state);
  });
});
api.post('/add-cesta/', (req, res) => {
  functions.addProductoCesta(req, (err) => {
    if(err) return res.send(err);
    res.send(null);
  });
});
api.get('/get-cesta', (req, res) => {
  let responseObject = {
    error: null,
    cesta: null
  };
  if(req.session.isLogged){
    functions.getCesta(req.session.username, (err, cesta) => {
      if(err){
        console.log(err);
        responseObject.error = err;
      }else responseObject.cesta = cesta;
      res.send(responseObject);
    });
  }else{
    //Para usuarios no registrados copiar la 1ª imagen de cada producto con copy file
    if(req.session.cesta != undefined || req.session.cesta != null){
      functions.crearCesta(req.session.cesta, (err, cesta) => {
        if(err){
          console.log(err);
          responseObject.error = err;
        }else responseObject.cesta = cesta;
        res.send(responseObject);
      });
    }else{
      res.send(responseObject);
    }
  }
});
api.post('/change-cantidad-cesta', (req, res) => {
  functions.cambiarCantidadCesta(req, (err) => {
    if(err) return res.send('Error actualizando la cesta.');
    res.send(null);
  });
});
api.post('/pagar-compra', (req, res) => {
  let responseObject = {
    'error': null,
    'success': null
  };
  functions.getLoggedState(req, (state) => {
    if(state == null){
      responseObject.error = 'Tienes que iniciar sesión o registrarte para comprar.';
      res.send(responseObject);
    }else{
      functions.payProduct(req, (err) => {
        if(err) responseObject.error = err;
        else responseObject.success = true;
        res.send(responseObject);
      });
    }
  });
});
//Para devolver los resultados en forma de objeto
api.get('/search/:keyword?', (req, res) => {
  let keyword = decodeURI(req.params.keyword);
  let limite = 8;
  if(keyword != 'undefined' && keyword != 'null' && keyword != '' && !requestProcessing){
    //Comprobamos que no haya sobrecarga de request de forma que solo se inicie cuando termine la anterior
    requestProcessing = true;
    functions.buscarProductos(keyword, limite, 0, (err, results) => {
      requestProcessing = false;
      if(err){
        console.log(err);
        return res.send(null);
      }
      return res.send(results);
    });
  }else{
    return res.send(null);
  }
});
//Para mostrar resultados en la página de busqueda
api.get('/filter', (req, res) => {
  let pagina = req.query.pag;
  let error = null;
  let filtros = {};
  filtros['precioMin'] = parseInt(req.query.preciomin);
  filtros['precioMax'] = parseInt(req.query.preciomax);
  functions.buscarFiltrarProductos(req.query.q, pagina, filtros, (err, arrayProductos, cantidadPaginas) => {
    if(err) error = `No se han encontrado productos buscando <b>${req.query.q}</b>`;
    if(arrayProductos != null && arrayProductos != undefined){
      //Quitamos las imágenes para solo mostrar 1 imagen
      for(let i = 0; i<arrayProductos.length; i++){
        arrayProductos[i]['imagen'] = arrayProductos[i]['imagenes'][1];
        delete arrayProductos[i]['imagenes'];
      }
      let dataObject = {
        'productos': arrayProductos
      };
      //Calculamos cuántas páginas hay
      if(cantidadPaginas > 0){
        dataObject['hayPaginas'] = true;
        dataObject['paginas'] = cantidadPaginas;
      }
      return res.send(dataObject);
    }else{
      let dataObject = {
        'errorMessage': error
      };
      return res.send(dataObject);
    }
  });
  //Buscar los productos que coincidan con la busqueda y renderizar la página
});
//Para mostrar resultados en la página de busqueda
api.get('/filter-categoria', (req, res) => {
  let pagina = req.query.pag;
  let error = null;
  let filtros = {};
  filtros['precioMin'] = parseInt(req.query.preciomin);
  filtros['precioMax'] = parseInt(req.query.preciomax);
  functions.buscarFiltrarProductosCategoria(req.query.categoria, pagina, filtros, (err, arrayProductos, cantidadPaginas) => {
    if(err) error = `No se han encontrado productos buscando <b>${req.query.q}</b>`;
    if(arrayProductos != null && arrayProductos != undefined){
      //Quitamos las imágenes para solo mostrar 1 imagen
      for(let i = 0; i<arrayProductos.length; i++){
        arrayProductos[i]['imagen'] = arrayProductos[i]['imagenes'][1];
        delete arrayProductos[i]['imagenes'];
      }
      let dataObject = {
        'productos': arrayProductos
      };
      //Calculamos cuántas páginas hay
      if(cantidadPaginas > 0){
        dataObject['hayPaginas'] = true;
        dataObject['paginas'] = cantidadPaginas;
      }
      return res.send(dataObject);
    }else{
      let dataObject = {
        'errorMessage': error
      };
      return res.send(dataObject);
    }
  });
  //Buscar los productos que coincidan con la busqueda y renderizar la página
});
//Enviar las facturas.
api.post('/facturas', (req, res) => {
  let filtros = req.body.data.filtros,
    dataObject = {
      'error': null,
      'facturas': null
    },
    productosPorPagina = req.body.data.ppp ? parseInt(req.body.data.ppp) : 20,
    pageActual = req.body.data.pageActual ? parseInt(req.body.data.pageActual) : 1;
  functions.getFacturas(productosPorPagina, pageActual, filtros, (err, arrayFacturas) => {
    if(err) dataObject.error = err;
    dataObject.facturas = arrayFacturas;
    res.send(dataObject);
  });
});

api.post('/get-paginacion-facturas', (req, res) => {
  let filtros = req.body.data.filtros,
    dataObject = {
      'error': null,
      'paginasTotales': null
    }, 
    productosPorPagina = req.body.data.ppp ? parseInt(req.body.data.ppp) : 20,
    pageActual = req.body.data.pageActual;

  functions.getPaginacionFacturas(productosPorPagina, pageActual, filtros, (err, paginasTotales) => {
    if(err) dataObject.error = err;
    dataObject.paginasTotales = paginasTotales;
    res.send(dataObject);
  });
});

api.post('/actualizar-estado-factura', (req, res) => {
  let factura = req.body.data;
  functions.actualizarEstadoFactura(factura.id, factura.estado, factura.estadoBoolean, err => {
    if(err) return res.send(err);
    res.send(null);
  });
});

api.post('/email-productos-enviados', (req, res) => {
  let productos = req.body.data.productos,
    idPago = req.body.data.idPago;
  //Le pasamos el dominio para crear un permalink por si quiere volver a la website a revisar los productos que ha comprado
  let dominio = 'http://'+req.get('host');
  functions.enviarEmailProductosEnviados(productos, idPago, dominio, err => {
    if(err) return res.send(err);
    res.send(null);
  });
});

api.get('/facturas-cliente/:pagina', (req, res) => {
  let dataObject = {
    'error': null,
    'facturas': null
  };
  functions.conseguirFacturasCliente(req, (err, facturas) => {
    if(err){
      dataObject.error = err;
      return res.send(dataObject);
    }
    dataObject.facturas = facturas;
    res.send(dataObject);
  });
});

api.get('/contar-facturas-cliente', (req, res) => {
  let dataObject = {
    'error': null,
    'cantidadFacturas': 0
  };
  functions.contarFacturasCliente(req.session.username, (err, cantidad) => {
    if(err) dataObject.error = err;
    dataObject.cantidadFacturas = cantidad;
    res.send(dataObject);
  });
});

//Inicia el email de restablecer contraseña con /api/cambiar-contraseña, no confundir con /cambiar-contrasena del public routes
//que es el que usa el token para confirmar el cambio.
api.get('/cambiar-contrasena/:username?', (req, res) => {
  let dominio = `http://${req.get('host')}`;
  let username = req.session.username ? req.session.username : req.params.username;
  if(!username) return res.send('No se encontró ese usuario.');
  req.session.username = username;
  req.session.save();
  functions.cambiarContrasena(req.session.username, dominio, err => {
    if(err) return res.send(err);
    res.send(null);
  });
});

api.post('/confirmar-cambiar-contrasena/:token', (req, res) => {
  let username = req.body.data.username,
    contrasena = req.body.data.contrasena;
  if(!username) return res.send('Error, no se ha recibido el nombre de usuario, inténtalo de nuevo.');
  if(!contrasena) return res.send('Error, no se ha recibido la contraseña, inténtalo de nuevo.');
  if(username != req.session.username) return res.send('Error, el email de usuario conectado no coincide con el que has puesto.');
  if(contrasena.length < 7) return res.send('Error, la contraseña debe ser de 8 caracteres mínimo.');

  functions.comprobarTokenCambiarContrasena(username, req.params.token, (err) => {
    if(err) return res.send(err);
    functions.confirmarCambiarContrasena(username, contrasena, (err) => {
      if(err) return res.send(err);
      res.send(null);
    });
  });
});

api.post('/check-new-user', (req, res) => {
  functions.checkNewUser(req.body.data.username, err => {
    if(err) return res.send(err);
    res.send(null);
  });
});

api.post('/enviar-mensaje', (req, res) => {
  let titulo = req.body.data.titulo;
  let mensaje = req.body.data.mensaje;
  if(!titulo) return res.send('Error, el título del mensaje no puede estar vacío');
  if(!mensaje) return res.send('Error, el contenido del mensaje no puede estar vacío');
  
  functions.enviarMensajeContacto(req.session.username, titulo, mensaje, err => {
    if(err) return res.send(err);
    res.send(null);
  });
});

module.exports = api;