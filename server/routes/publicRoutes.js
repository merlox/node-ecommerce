let express = require('express'),
	app = express(),
	functions = require('./../functions.js'),
	path = require('path'),
	Mongo = require('mongodb').MongoClient,
 	MongoUrl = 'mongodb://localhost:27017/ecommerce';
;

const routes = express.Router();

routes.get('/p/:permalink', (req, res) => { 
  functions.buscarProducto(req.params.permalink, (err, result) => {
    if(err) console.log(err);
    if(result.publicado == 'no'){
      return res.redirect('/?message=That page is not available');
    }else if(result.publicado == 'si'){
      functions.render(path.join(__dirname, '../../public/views/producto.html'), result, (err, data) => {
        return res.send(data);
      });
    }
  });
});

routes.get('/search/:keyword', (req, res) => {
	let keyword = decodeURI(req.params.keyword);
	console.log('Query: '+req.query);
	let limite = req.params.limite;
    if(limite == undefined || limite == null){
  	  limite = 0;
    }
	functions.buscarProductos(keyword, limite, (err, results) => {
		if(err) console.log(err);
		console.log(results);
		return res.send(results);
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
	  return res.sendFile(path.join(__dirname, '/public/html/chat.html'));
	}
});

routes.post('/register', function(req, res){
	Mongo.connect(MongoUrl, function(err, db){
	  if(err) throw(err);

	  db.collection('users').find({
	      'username': req.body.nombreUsuario
	    }).toArray(function(err, results){
	      if(err) throw(err);
	      if(typeof(results) != 'undefined' && results.length>0){
	        db.close();
	        return res.redirect('/?status=Error&message=User already exists');
	      }else{
	        db.collection('users').insert({
	          'username': req.body.nombreUsuario,
	          'password': req.body.passUsuario
	        }, function(err, result){
	          if(err) throw(err);
	        });
	        db.close();
	        req.session.isLogged = true;
	        return res.redirect('/login?status=Success&message=User created successfully!');
	      }
	    });
	});
});

routes.post('/login', function(req, res){
	Mongo.connect(MongoUrl, function(err, db){
	  if(err) throw(err);
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
	      db.close();
	      return res.redirect('/user/dashboard');
	    }else{
	      db.close();
	      return res.redirect('/?status=Error&message=Bad username or password');
	    }
	  });
	});
});

routes.get('/close-session', (req, res) => {
	req.session.destroy();
	return res.redirect('/');
});

routes.use((req, res) => {
  if(!res.heardersSent){
    if(req.session.username == 'merunas'){
      console.log('redirecting');
      res.redirect('/admin/dashboard');
    }
    else res.sendFile(path.join(__dirname, '../../public/html/main.html'));
  }
});

module.exports = routes;