const express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http').Server(app),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    Mongo = require('mongodb').MongoClient,
    MongoStore = require('connect-mongo')(session),
    path = require('path'),
    publicRoutes = require('./server/routes/publicRoutes.js'),
    MongoUrl = 'mongodb://localhost:27017/ecommerce';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//Esto permite que la req.session se guarde en la BD para cada usuario
app.use(session({
  secret: 'GOODPASSWORD',
  store: new MongoStore({
    url: MongoUrl
  }),
  resave: true,
  saveUninitialized: true
}));
app.use('*', (req, res, next) => {
  console.log('Requesting: '+req.url);
  publicRoutes(app);
  next();
});
http.listen(3000, '0.0.0.0', function(){
  console.log("Server started at 192.168.1.111:3000");
});
