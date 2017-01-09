'use strict';
let express = require('express'),
	Mongo = require('mongodb').MongoClient,
	MongoUrl = 'mongodb://merunas:jakx1234.@ds119508.mlab.com:19508/merunas-mongo',
	app = express(),
	functions = require('./../functions.js'),
	path = require('path'),
	routes = express.Router(),
	db = {};

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
      functions.render(path.join(__dirname, '../../public/views/producto.html'), result, (err, data) => {
        if(err) return res.send(err);
        return res.send(data);
      });
    }
  });
});

//Para mostrar resultados en la página de busqueda
routes.get('/search', (req, res) => {
  let loadTime = new Date().getTime();
  let limite = 30;
  let error = null;
  functions.buscarProductos(req.query.q, limite, (err, arrayProductos, cantidad) => {
    if(err) error = `No se han encontrado productos buscando <b>${req.query.q}</b>`;
    if(arrayProductos != null && arrayProductos != undefined){
      //Quitamos las imágenes para solo mostrar 1 imagen
      for(let i = 0; i<arrayProductos.length; i++){
        arrayProductos[i]['imagen'] = arrayProductos[i]['imagenes'][1];
        delete arrayProductos[i]['imagenes'];
      }

      let dataObject = {
        'busqueda': req.query.q,
        'limite': limite,
        'productos': arrayProductos,
        'isProductos': true
      };
      
      functions.render(path.join(__dirname, '../../public/views/busqueda.html'), dataObject, (err, data) => {
        console.log(`Load Time: ${new Date().getTime() - loadTime}`);
        if(err) return res.send('No se pudo cargar la página, por favor inténtalo de nuevo.');
        return res.send(data);
      });
    }else{
      let dataObject = {
        'busqueda': req.query.q,
        'isProductos': false,
        'errorMessage': error
      };
      let start = new Date().getTime();
      functions.render(path.join(__dirname, '../../public/views/busqueda.html'), dataObject, (err, data) => {
        if(err) return res.send('No se pudo cargar la página, por favor inténtalo de nuevo.');
        return res.send(data);
      });
    }
  });
  //Buscar los productos que coincidan con la busqueda y renderizar la página
});

routes.get('/chat', function(req, res){
	if(typeof req.session.isLogged == 'undefined' || !req.session.isLogged){
	  return res.redirect('/?status=Error&message=You are not logged');
	}else if(req.session.isLogged){
	  return res.sendFile(path.join(__dirname, '../../public/html/chat.html'));
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
  functions.render(path.join(__dirname, '../../public/views/cesta.html'), null, (err, data) => {
    if(err){
      console.log(err);
      return res.send(err);
    }
    return res.send(data);
  });
});

routes.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/images/logo.png'));
});

routes.get('/', (req, res) => {
  functions.render(path.join(__dirname, '../../public/views/index.html'), null, (err, data) => {
    functions.getSlider();
    if(err) return res.send(err);
    return res.send(data);
  });
});

module.exports = routes;