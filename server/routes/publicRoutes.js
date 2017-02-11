'use strict';
let express = require('express'),
	Mongo = require('mongodb').MongoClient,
	MongoUrl = 'mongodb://merunas:jakx1234.@ds119508.mlab.com:19508/merunas-mongo',
	functions = require('./../functions.js'),
	path = require('path'),
	routes = express.Router(),
	db = {},
  render = require('./../render.js');

Mongo.connect(MongoUrl, (err, database) => {
	if(err) console.log(err);
	db = database;
});

routes.get('/p/:permalink', (req, res) => { 
  functions.buscarProducto(req.params.permalink, (err, result) => {
    if(err) console.log(err);
    if(result.publicado == 'no'){
      return res.redirect('/?message=That page is not available');
    }else if(result.publicado == 'si'){

      result['loggedStateHTML'] = '<img src="../../images/user.svg" width="30px">iniciar sesión<div class="triangulo-up"></div>';
      result['loggedState'] = '/login';

      functions.getLoggedState(req, state => {
        if(state === 'logged'){
          result.loggedStateHTML = '<img src="../../images/user.svg" width="30px">mi cuenta ▼<div class="triangulo-up"></div>';
          result.loggedState = '/micuenta';
        }else if(state === 'admin'){
          result.loggedStateHTML = '<img src="../../images/user.svg" width="30px">admin ▼<div class="triangulo-up"></div>';
          result.loggedState = '/admin';
        }
        render(path.join(__dirname, '../../public/views/producto.html'), result, (err, data) => {
          if(err) return res.send(err);
          return res.send(data);
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
        'loggedStateHTML': '<img src="../../images/user.svg" width="30px">iniciar sesión<div class="triangulo-up"></div>'
      };
      functions.getLoggedState(req, state => {
        if(state === 'logged'){
          dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">mi cuenta ▼<div class="triangulo-up"></div>';
          dataObject.loggedState = '/micuenta';
        }else if(state === 'admin'){
          dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">admin ▼<div class="triangulo-up"></div>';
          dataObject.loggedState = '/admin';
        }
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
        'loggedStateHTML': '<img src="../../images/user.svg" width="30px">iniciar sesión<div class="triangulo-up"></div>'
      };
      functions.getLoggedState(req, state => {
        if(state === 'logged'){
          dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">mi cuenta ▼<div class="triangulo-up"></div>';
          dataObject.loggedState = '/micuenta';
        }else if(state === 'admin'){
          dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">admin ▼<div class="triangulo-up"></div>';
          dataObject.loggedState = '/admin';
        }
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

routes.get('/login', (req, res) =>{
	return res.sendFile(path.join(__dirname, '../../public/views/login.html'));
});

routes.post('/register', function(req, res){
  functions.registerUsuario(req.body.nombreUsuario, req.body.passUsuario, (err) => {
    if(err){
      res.send(err);
    }else{
      req.session.username = req.body.nombreUsuario;
      req.session.isLogged = true;
      res.redirect('/');
    }
  });
});

routes.post('/login', function(req, res){
  functions.loginUsuario(req.body.nombreUsuario, req.body.passUsuario, (err) => {
    if(err){
      res.send(err);
    }else{
      req.session.username = req.body.nombreUsuario;
      req.session.isLogged = true;
      res.redirect('/');
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

routes.get('/cesta', (req, res) => {
  let dataObject = {
    'loggedState': '/login',
    'loggedStateHTML': '<img src="../../images/user.svg" width="30px">iniciar sesión<div class="triangulo-up"></div>'
  };
  functions.getLoggedState(req, state => {
    if(state === 'logged'){
      dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">mi cuenta ▼<div class="triangulo-up"></div>';
      dataObject.loggedState = '/micuenta';
    }else if(state === 'admin'){
      dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">admin ▼<div class="triangulo-up"></div>';
      dataObject.loggedState = '/admin';
    }
    render(path.join(__dirname, '../../public/views/cesta.html'), dataObject, (err, data) => {
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
    'loggedStateHTML': '<img src="../../images/user.svg" width="30px">iniciar sesión<div class="triangulo-up"></div>'
  };
  functions.getLoggedState(req, state => {
    if(state === 'logged'){
      dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">mi cuenta ▼<div class="triangulo-up"></div>';
      dataObject.loggedState = '/micuenta';
    }else if(state === 'admin'){
      dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">admin ▼<div class="triangulo-up"></div>';
      dataObject.loggedState = '/admin';
    }
    render(path.join(__dirname, '../../public/views/pagoCompletado.html'), dataObject, (err, data) => {
      if(err){
        console.log(err);
        return res.send(err);
      }
      return res.send(data);
    });
  });
});

routes.get('/email', (req, res) => {
  console.log('enviando email...')
  require('./../email.js')();
});

routes.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/images/logo.png'));
});

routes.get('/:categoria', (req, res) => {
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
        'loggedStateHTML': '<img src="../../images/user.svg" width="30px">iniciar sesión<div class="triangulo-up"></div>'
      };

      functions.getPaginacionCategoria(req.params.categoria, limite, (err, cantidadPaginas) => {
        if(err) console.log(err);
        
        dataObject['hayPaginas'] = true;
        dataObject['paginas'] = cantidadPaginas;

        functions.getLoggedState(req, state => {
          if(state === 'logged'){
            dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">mi cuenta ▼<div class="triangulo-up"></div>';
            dataObject.loggedState = '/micuenta';
          }else if(state === 'admin'){
            dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">admin ▼<div class="triangulo-up"></div>';
            dataObject.loggedState = '/admin';
          }
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
        'loggedStateHTML': '<img src="../../images/user.svg" width="30px">iniciar sesión<div class="triangulo-up"></div>'
      };
      functions.getLoggedState(req, state => {
        if(state === 'logged'){
          dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">mi cuenta ▼<div class="triangulo-up"></div>';
          dataObject.loggedState = '/micuenta';
        }else if(state === 'admin'){
          dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">admin ▼<div class="triangulo-up"></div>';
          dataObject.loggedState = '/admin';
        }
        render(path.join(__dirname, '../../public/views/categoria.html'), dataObject, (err, data) => {
          if(err) return res.send('No se pudo cargar la página, por favor inténtalo de nuevo.');
          return res.send(data);
        });
      });
    }
  });
  //Buscar los productos que coincidan con la busqueda y renderizar la página
});

routes.get('/', (req, res) => {
  let dataObject = {
    'isError': null,
    'error': null,
    'sliderImages': null,
    'loggedState': '/login',
    'loggedStateHTML': '<img src="../../images/user.svg" width="30px">iniciar sesión<div class="triangulo-up"></div>'
  };
  functions.getSlider(true, (err, images) => {
    if(err){
      dataObject.isError = true;
      dataObject.error = err;
    }
    dataObject.sliderImages = images;

    functions.getLoggedState(req, state => {
      if(state === 'logged'){
        dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">mi cuenta ▼<div class="triangulo-up"></div>';
        dataObject.loggedState = '/micuenta';
      }else if(state === 'admin'){
        dataObject.loggedStateHTML = '<img src="../../images/user.svg" width="30px">admin ▼<div class="triangulo-up"></div>';
        dataObject.loggedState = '/admin';
      }

      render(path.join(__dirname, '../../public/views/index.html'), dataObject, (err, data) => {
        if(err) res.send(err);
        res.send(data);
      });
    });
  });
});

module.exports = routes;