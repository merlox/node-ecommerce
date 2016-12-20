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

routes.get('/deleteSession', function(req, res){
	req.session.isLogged = false;
	res.redirect('/?status=Success&message=you closed your session');
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
  db.collection('users').find({
      'username': req.body.nombreUsuario
    }).toArray(function(err, results){
      if(err) throw(err);
      if(typeof(results) != 'undefined' && results.length>0){
        return res.redirect('/?status=Error&message=User already exists');
      }else{
        db.collection('users').insert({
          'username': req.body.nombreUsuario,
          'password': req.body.passUsuario
        }, function(err, result){
          if(err) throw(err);
        });
        req.session.isLogged = true;
        return res.redirect('/login?status=Success&message=User created successfully!');
      }
    });
});

routes.post('/login', function(req, res){
  db.collection('users').find({
    'username': req.body.nombreUsuario,
    'password': req.body.passUsuario
  }).toArray(function(err, results){
    if(err) throw(err);
    if(typeof(results) != 'undefined' && results.length > 0){
      req.session.isLogged = true;
      req.session.username = req.body.nombreUsuario;
      usernameLogged = req.session.username;
      if(req.session.username == 'merunas' && results[0].password == 'Merunas@1'){
        console.log('Hello admin');
        return res.redirect('/admin/dashboard');
      }
      return res.redirect('/user/dashboard');
    }else{
      return res.redirect('/?status=Error&message=Bad username or password');
    }
  });
});

routes.get('/close-session', (req, res) => {
	req.session.destroy();
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

routes.get('/', (req, res) => {
  functions.render(path.join(__dirname, '../../public/views/index.html'), null, (err, data) => {
    if(err) return res.send(err);
    return res.send(data);
  });
});

module.exports = routes;