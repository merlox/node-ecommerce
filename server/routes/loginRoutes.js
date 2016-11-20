let express = require('express'),
  app = express(),
  session = require('express-session'),
  Mongo = require('mongodb').MongoClient,
  MongoStore = require('connect-mongo')(session),
  MongoUrl = 'mongodb://localhost:27017/ecommerce';

module.exports = exports = function(app){
  app.get('/deleteSession', function(req, res){
    req.session.isLogged = false;
    res.redirect('/?status=Success&message=you closed your session');
  });

  app.get('/chat', function(req, res){
    if(typeof req.session.isLogged == 'undefined' || !req.session.isLogged){
      return res.redirect('/?status=Error&message=You are not logged');
    }else if(req.session.isLogged){
      return res.sendFile(path.join(__dirname, '/public/html/chat.html'));
    }
  });

  app.post('/register', function(req, res){
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

  app.post('/login', function(req, res){
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
          res.redirect('/?status=Error&message=Bad username or password');
        }
      });
    });
  });

  app.get('/close-session', (req, res) => {
    req.session.destroy();
    return res.redirect('/');
  });

  return;
};