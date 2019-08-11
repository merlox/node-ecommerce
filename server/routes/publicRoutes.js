'use strict';
let express = require('express'),
	Mongo = require('mongodb').MongoClient,
	MongoUrl = require('./../secrets.js').mongoUrl,
	functions = require('./../functions.js'),
	path = require('path'),
	routes = express.Router(),
	db = {},
  render = require('./../render.js'),
  claves = require('./../secrets.js');

Mongo.connect(MongoUrl, (err, database) => {
	if(err) console.log(err);
	db = database;
});

routes.use('*', (req, res, next) => {
  if(!req.session.username)
    functions.aumentarVisitaPagina(req);
  else if(req.session.username != claves.adminName)
    functions.aumentarVisitaPagina(req);
  next();
});

routes.get('/p/:permalink', (req, res) => {
  functions.buscarProducto(req.params.permalink, (err, result) => {
    if(err) console.log(err);
    if(!result) return res.redirect('/');
    if(!result.publicado){
      return res.redirect('/?message=That page is not available');
    }else if(result.publicado){
      //Guardamos en la db que el usuario ha visitado ese producto
      if(req.session.username){
        functions.guardarVisitadoUsuario(req.session.username, result._id, err => {
          if(err) console.log(err);
        });
      }
      functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
        result['loggedState'] = stateHref;
        result['loggedStateHTML'] = stateHTML;
        render(path.join(__dirname, '../../public/views/producto.html'), result, (err, data) => {
          if(err) return res.send(err);
          res.send(data);
        });
      });
    }
  });
});

//Para mostrar resultados en la página de busqueda
routes.get('/search', (req, res) => {
  let limite = 30;
  let pagina = req.query.pag;
  let error = null;
  functions.buscarProductos(req.query.q, limite, pagina, (err, arrayProductos) => {
    if(err) error = `No se han encontrado productos buscando <b>${req.query.q}</b>`;
    //Si hay productos renderizar los productos si no, renderizar un mensaje de error.
    if(arrayProductos != null && arrayProductos != undefined){
      //Quitamos las imágenes para solo mostrar 1 imagen
      for(let i = 0; i<arrayProductos.length; i++){
        arrayProductos[i]['imagen'] = arrayProductos[i]['imagenes'][1];
        delete arrayProductos[i]['imagenes'];
      }

      let resultadoUnico = false;
      if(arrayProductos.length === 1) resultadoUnico = true;

      let dataObject = {
        'busqueda': req.query.q,
        'productos': arrayProductos,
        'cantidadProductos': arrayProductos.length,
        'resultadoUnico': resultadoUnico,
        'paginas': 0,
        'hayPaginas': false,
        'isProductos': true,
        'loggedState': '/login',
        'loggedStateHTML': 'iniciar sesión'
      };
      functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
        dataObject.loggedState = stateHref;
        dataObject.loggedStateHTML = stateHTML;
        functions.getPaginacionSearch(req.query.q, limite, (err, cantidadPaginas) => {
          if(err) console.log(err);

          dataObject['hayPaginas'] = true;
          dataObject['paginas'] = cantidadPaginas;

          render(path.join(__dirname, '../../public/views/busqueda.html'), dataObject, (err, data) => {
            if(err) return res.send('No se pudo cargar la página, por favor inténtalo de nuevo.');
            return res.send(data);
          });
        });
      });
    }else{
      let dataObject = {
        'busqueda': req.query.q,
        'isProductos': false,
        'errorMessage': error,
        'loggedState': '/login',
        'loggedStateHTML': 'iniciar sesión'
      };
      functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
        dataObject.loggedState = stateHref;
        dataObject.loggedStateHTML = stateHTML;
        render(path.join(__dirname, '../../public/views/busqueda.html'), dataObject, (err, data) => {
          if(err) return res.send('No se pudo cargar la página, por favor inténtalo de nuevo.');
          return res.send(data);
        });
      });
    }
  });
  //Buscar los productos que coincidan con la busqueda y renderizar la página
});

routes.get('/chat', function(req, res){
	if(typeof req.session.isLogged == 'undefined' || !req.session.isLogged){
	  return res.redirect('/?status=Error&message=You are not logged');
	}else if(req.session.isLogged){
	  return res.sendFile(path.join(__dirname, '../../public/views/chat.html'));
	}
});

routes.post('/register', function(req, res){
  let nombre = req.body.nombreUsuarioNuevo,
    pass = req.body.passUsuarioNuevo,
    domain = req.get('host');

  functions.registerUsuario(nombre, pass, domain, (err) => {
    if(err){
      res.send(err);
    }else{
      req.session.username = nombre;
      req.session.isLogged = true;
      req.session.save();
      res.redirect('/');
    }
  });
});

routes.get('/login', (req, res) =>{
  return res.sendFile(path.join(__dirname, '../../public/views/login.html'));
});

routes.post('/login', function(req, res){
  functions.loginUsuario(req.body.nombreUsuario, req.body.passUsuario, err => {
    if(err){
      res.send(err);
    }else{
      req.session.username = req.body.nombreUsuario;
      req.session.isLogged = true;
      //Si ha pulsado en comprar y ha sido redirigido al login, mandarlo a la página de pago
      if(req.query.comprar){
        //Lo redirigimos a comprar
        res.redirect('/completar-pago');
      }else{
        //No lo podemos redirigir a la página anterior porque la página anterior es /login
        res.redirect('/');
      }
    }
  });
});

routes.get('/close-session', (req, res) => {
  req.session = null;
	delete req.session;
	return res.redirect('/');
});

routes.post('/pay-product', (req, res) => {
  functions.payProduct(req.body.stripeToken, (err) => {
    console.log(err);
    if(err) return res.send(err);
    else return res.send('ok');
  });
});

routes.get('/completar-pago', (req, res) => {
  let dataObject = {
    'loggedState': '/login',
    'loggedStateHTML': 'iniciar sesión'
  };
  functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
    dataObject.loggedState = stateHref;
    dataObject.loggedStateHTML = stateHTML;
    if(stateHref === '/login'){
      return res.redirect('/login');
    }
    render(path.join(__dirname, '../../public/views/completarPago.html'), dataObject, (err, data) => {
      if(err){
        console.log(err);
        return res.send(err);
      }
      return res.send(data);
    });
  });
});

routes.get('/pago-completado', (req, res) => {
  let dataObject = {
    'loggedState': '/login',
    'loggedStateHTML': 'iniciar sesión'
  };
  functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
    dataObject.loggedState = stateHref;
    dataObject.loggedStateHTML = stateHTML;
    render(path.join(__dirname, '../../public/views/pagoCompletado.html'), dataObject, (err, data) => {
      if(err){
        console.log(err);
        return res.send(err);
      }
      return res.send(data);
    });
  });
});

routes.get('/micuenta', (req, res) => {
  let dataObject = {
    'loggedState': '/login',
    'loggedStateHTML': 'iniciar sesión'
  };
  functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
    dataObject.loggedState = stateHref;
    dataObject.loggedStateHTML = stateHTML;
    render(path.join(__dirname, '../../public/views/micuenta.html'), dataObject, (err, data) => {
      if(err) return res.send('No se pudo cargar la página, por favor inténtalo de nuevo.');
      return res.send(data);
    });
  });
});

routes.get('/cambiar-contrasena/:token', (req, res) => {
  let username = req.session.username;
  if(!username) return res.send('Error, ese usuario no se ha encontrado. Solicita un nuevo token de recuperación de contraseña.');
  functions.comprobarTokenCambiarContrasena(username, req.params.token, (err) => {
    if(err) return res.send('Error, no se puede restablecer la contraseña, es posible que tu código haya expirado. Inténtalo de nuevo.');
    let dataObject = {
      'loggedState': '/login',
      'loggedStateHTML': 'iniciar sesión'
    };
    functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
      dataObject.loggedState = stateHref;
      dataObject.loggedStateHTML = stateHTML;
      render(path.join(__dirname, '../../public/views', 'cambiarContrasena.html'), dataObject, (err, HTML) => {
        if(err) return res.send(err);
        res.send(HTML);
      });
    });
  });
});

routes.get('/confirmar-email/:token', (req, res) => {
  functions.verificarEmail(req.session.username, req.params.token, err => {
    if(err) return res.send(err);
    res.sendFile(path.join(__dirname, '../../public/views', 'emailConfirmado.html'));
  });
});

routes.get('/d/:categoria', (req, res) => {
  let limite = 30;
  let pagina = req.query.pag;
  let error = null;
  functions.buscarProductosCategoria(req.params.categoria, limite, pagina, (err, arrayProductos) => {
    if(err) error = `No se han encontrado productos en la categoría <b>${req.params.categoria}</b>`;
    //Si hay productos renderizar los productos si no, renderizar un mensaje de error.
    if(arrayProductos != null && arrayProductos != undefined){
      //Quitamos las imágenes para solo mostrar 1 imagen
      for(let i = 0; i<arrayProductos.length; i++){
        arrayProductos[i]['imagen'] = arrayProductos[i]['imagenes'][1];
        delete arrayProductos[i]['imagenes'];
      }

      let resultadoUnico = false;
      if(arrayProductos.length === 1) resultadoUnico = true;

      let dataObject = {
        'categoria': req.params.categoria,
        'productos': arrayProductos,
        'cantidadProductos': arrayProductos.length,
        'resultadoUnico': resultadoUnico,
        'paginas': 0,
        'hayPaginas': false,
        'isProductos': true,
        'loggedState': '/login',
        'loggedStateHTML': 'iniciar sesión'
      };

      functions.getPaginacionCategoria(req.params.categoria, limite, (err, cantidadPaginas) => {
        if(err) console.log(err);

        dataObject['hayPaginas'] = true;
        dataObject['paginas'] = cantidadPaginas;

        functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
          dataObject.loggedState = stateHref;
          dataObject.loggedStateHTML = stateHTML;
          render(path.join(__dirname, '../../public/views/categoria.html'), dataObject, (err, data) => {
            if(err) return res.send('No se pudo cargar la página, por favor inténtalo de nuevo.');
            return res.send(data);
          });
        });
      });
    }else{
      let dataObject = {
        'categoria': req.params.categoria,
        'isProductos': false,
        'errorMessage': error,
        'loggedState': '/login',
        'loggedStateHTML': 'iniciar sesión'
      };
      functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
        dataObject.loggedState = stateHref;
        dataObject.loggedStateHTML = stateHTML;
        render(path.join(__dirname, '../../public/views/categoria.html'), dataObject, (err, data) => {
          if(err) return res.send('No se pudo cargar la página, por favor inténtalo de nuevo.');
          return res.send(data);
        });
      });
    }
  });
  //Buscar los productos que coincidan con la busqueda y renderizar la página
});

routes.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/images/', 'favicon.png'));
});

routes.get('/', (req, res) => {
  let dataObject = {
    'loggedState': '/login',
    'loggedStateHTML': 'iniciar sesión'
  };

  functions.getLoggedStateHTML(req, (stateHTML, stateHref) => {
    dataObject.loggedState = stateHref;
    dataObject.loggedStateHTML = stateHTML;
    render(path.join(__dirname, '../../public/views/index.html'), dataObject, (err, data) => {
      if(err) res.send(err);
      res.send(data);
    });
  });
});

module.exports = routes;
