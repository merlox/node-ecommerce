'use strict';
const express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http').Server(app),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    path = require('path'),
    MongoUrl = 'mongodb://merunas:jakx1234.@ds119508.mlab.com:19508/merunas-mongo',
    apiRoutes = require('./server/routes/apiRoutes.js'),
    adminRoutes = require('./server/routes/adminRoutes.js'),
    publicRoutes = require('./server/routes/publicRoutes.js');
  
//Inicializamos configuracion de express y sessión
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret: 'GOODPASSWORD',
  store: new MongoStore({
    url: MongoUrl
  }),
  cookie: {
    //Un mes
    maxAge: 1000 * 60 * 60 * 24 * 30
  },
  resave: false,
  unset: 'destroy',
  saveUninitialized: true
}));

//Para cargar los archivos publicamente usamos
app.use(express.static(path.join(__dirname, 'public')));

//Logger middleware
app.use('*', (req, res, next) => {
  console.log('\nRequesting: '+req.originalUrl+' '+req.ip);
  next();
});

//Custom routes
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

//Ejecutamos el servidor en la ip local
http.listen(8000, '0.0.0.0', function(){
  console.log("Server started at 192.168.1.111:8000");
});