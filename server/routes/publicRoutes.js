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

routes.get('/search/:keyword?', (req, res) => {
  functions.render(path.join(__dirname, '../../public/views/busqueda.html'), null, (err, data) => {
    if(err) return res.send(err);
    return res.send(data);
  });
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
  //TODO pasarle los datos en formato lista
  functions.render(path.join(__dirname, '../../public/views/cesta.html'), null, (err, data) => {
    if(err) return res.send(err);
    return res.send(data);
  });
});

routes.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/images/logo.png'));
});

routes.get('/', (req, res) => {
  functions.render(path.join(__dirname, '../../public/views/index.html'), null, (err, data) => {
    if(err) return res.send(err);
    return res.send(data);
  });
});

module.exports = routes;