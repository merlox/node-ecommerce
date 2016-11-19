const express = require('express'),
    app = express(),
    formidable = require('formidable'),
    fs = require('fs'),
    Mongo = require('mongodb').MongoClient,
    http = require('http').Server(app),
    io = require('socket.io')(http),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    path = require('path'),
    functions = require('./server/functions.js'),
    apiRoutes = require('./server/apiRoutes.js');

//Variables y funciones constantes
const MongoUrl = 'mongodb://localhost:27017/ecommerce';

let usernameLogged = null;
let usuariosConnectados = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//Esto permite que la req.session se guarde en la BD para cada usuario, no hay
//que hacer nada mas.
app.use(session({
  secret: 'GOODPASSWORD',
  store: new MongoStore({
    url: MongoUrl
  }),
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.use('*', function(req, res, next){
  console.log("Requesting: "+req.url);
  if(req.session.username != undefined){
    usernameLogged = req.session.username;
  }else{
    usernameLogged = null;
  }
  next();
});

app.get('/deleteSession', function(req, res){
  req.session.isLogged = false;
  res.redirect('/?status=Success&message=you closed your session');
});

app.get('/user/dashboard', function(req, res){
  if(typeof req.session.isLogged == 'undefined' || !req.session.isLogged){
    return res.redirect('/?status=Error&message=You are not logged');
  }else if(req.session.isLogged){
    return res.sendFile(path.join(__dirname, '/public/html/dashboard.html'));
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

app.get('/admin/dashboard', (req, res) => {
  if(req.session.username != 'merunas'){
    return res.redirect("/?status=Error&message=You do not have permission to enter this page");
  }else{
    return res.sendFile(path.join(__dirname, '/public/html/adminDashboard.html'));
  }
});

app.get('/admin/add-product', (req, res) => {
  if(req.session.username != 'merunas'){
    return res.redirect("/?status=Error&message=You do not have permission to enter this page");
  }else{
    return res.sendFile(path.join(__dirname, '/public/html/adminAddProduct.html'));
  }
});

app.get('/admin/edit-products', (req, res) => {
  if(req.session.username != 'merunas'){
    return res.redirect("/?status=Error&message=You do not have permission to enter this page");
  }else{
    return res.sendFile(path.join(__dirname, '/public/html/adminEditProducts.html'));
  }
});

app.get('/close-session', (req, res) => {
  req.session.destroy();
  return res.redirect('/');
});

let productImages = {};

app.post('/upload-image-product', (req, res) => {
  let form = new formidable.IncomingForm();
  let counterImage = 0;

  form.multiple = true;
  form.uploadDir = path.join(__dirname, 'server/uploads');
  form.on('file', (field, file) => {
    counterImage++;
    //Esta linea es la que se encarga de subir el archivo en el servidor.
    fs.rename(file.path, path.join(__dirname, 'public/public-uploads/', file.name));

    productImages[counterImage] = file.name;
  });
  form.on('error', (err) => {
    console.log('An error ocurred uploading the images '+err);
  });
  form.on('end', () => {
    res.send(JSON.stringify(productImages));
    productImages = {};
  });
  form.parse(req);
});

//1. Create a folder for each product images and then copy the folder to uploads in the server
app.post('/upload-product', (req, res) => {

  fs.stat(path.join(__dirname, '/server/uploads/', req.body.permalink), (err, stats) => {
    if(err){
      fs.mkdirSync(path.join(__dirname, '/server/uploads/', req.body.permalink));
    }
    functions.copyDirectory(path.join(__dirname, '/public/public-uploads/'), path.join(__dirname, '/server/uploads/', req.body.permalink), (err) => {
      //Si hay un error copiando el directorio, borramos las imágenes temporales
      if(err){
        console.log('Error copiando el directorio '+err);
        fs.readdir(path.join(__dirname, '/public/public-uploads/'), (err, files) => {
          files.forEach((file) => {
            fs.unlink(path.join(__dirname, '/public/public-uploads/', file), (err) => {
              if(err) console.log(err);
            });
          });
        });
        return res.send('Error: Could not copy the images to the server');
      }else{
        console.log('Directory '+__dirname+'/public/public-uploads/'+' copied successfully to '+__dirname+'/server/uploads/'+req.body.permalink);
        //Borramos imágenes temporales
        fs.readdir(path.join(__dirname, '/public/public-uploads/'), (err, files) => {
          files.forEach((file) => {
            fs.unlink(path.join(__dirname, '/public/public-uploads/', file), (err) => {
              if(err) console.log(err);
            });
          });
        });
        //Guardamos el producto en la base de datos
        Mongo.connect(MongoUrl, (err, db) => {
          if(err){
            db.close();
            return res.send('Error: could not connect to the database');
          }
          db.collection('productos').find({
            'permalink': req.body.permalink
          }).toArray((err, results) => {
            if(err){
              db.close();
              return res.send('Error: '+err);
            }
            if(results != undefined && results.length > 0){
              db.close();
              console.log('Producto already in the db');
              return res.send('Error: That product is already in the database');
            }else{
              db.collection('productos').insert({
                'titulo': req.body.titulo,
                'imagenes': req.body.imagenes,
                'permalink': req.body.permalink.toLowerCase(),
                'precio': req.body.precio,
                'descripcion': req.body.descripcion,
                'categoria': req.body.categoria,
                'atributos': req.body.atributos,
                'publicado': req.body.publicado
              }, (err, result) => {
                db.close();
                if(err){
                  return res.send('Error: '+err);
                }else{
                  return res.send('Success: Uploaded successfully <a href="http://'+req.headers.host+'/p/'+req.body.permalink+'"> Ver Producto Ahora</a>');
                }
              });
            }
          });
        });
      }
    });
  });
});

app.get('/p/:permalink', (req, res) => {
  functions.buscarProducto(req.params.permalink, (err, result) => {
    if(err) console.log(err);
    if(result.publicado == 'no'){
      return res.redirect('/?message=That page is not available');
    }else if(result.publicado == 'si'){
      functions.render(__dirname+'/public/views/producto.html', result, (err, data) => {
        return res.send(data);
      });
    }
  });
});

app.get('*', function(req, res){
  if(req.session.username == 'merunas'){
    return res.redirect('/admin/dashboard');
  }
  res.sendFile(path.join(__dirname, '/public/html/main.html'));
});

//Cada vez que se conecta un usuario nuevo, lo guardamos en un array. Ese array se envia a todos
//los usuarios. Y se lee en el cliente con un foreach.
io.on('connection', function(socket){
  if(usernameLogged != null){
    console.log('user %s connected', usernameLogged);
    usuariosConnectados.push(usernameLogged);
    io.emit('user connected', usuariosConnectados);
  }else{
    console.log('user Anonimo connected');
    usuariosConnectados.push('Anonimo');
    io.emit('user connected', usuariosConnectados);
  }
  socket.on('mensaje chat', function(mensaje){
    io.emit('mensaje chat', mensaje);
  });
  socket.on('disconnect', function(){
    if(usernameLogged != null){
      let index = usuariosConnectados.indexOf(usernameLogged);
      if(index > -1){
        usuariosConnectados.splice(index, 1);
      }
    }else if(usernameLogged == null){
      let index = usuariosConnectados.indexOf('Anonimo');
      if(index > -1){
        usuariosConnectados.splice(index, 1);
      }
    }
    io.emit('user connected', usuariosConnectados);

    console.log('user %s disconnected', usernameLogged);
    // io.emit
  });
});

http.listen(3000, '0.0.0.0', function(){
  console.log("Server started at 192.168.1.111:3000");
});
