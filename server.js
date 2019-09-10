'use strict';
const express = require('express'),
    app = express(),
    fs = require('fs'),
    socketServer = require('http').Server(app),
    io = require('socket.io')(socketServer),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    path = require('path'),
    MongoUrl = 'mongodb://merlox:merlox1@ds145750.mlab.com:45750/merunas',
    apiRoutes = require('./server/routes/apiRoutes.js'),
    adminRoutes = require('./server/routes/adminRoutes.js'),
    publicRoutes = require('./server/routes/publicRoutes.js'),
    socketRoutes = require('./server/routes/socketRoutes.js');

const yargs = require('yargs')
const argv = yargs.option('port', {
    alias: 'p',
    description: 'Set the port to run this server on',
    type: 'number',
}).help().alias('help', 'h').argv
if(!argv.port) {
    console.log('Error, you need to pass the port you want to run this application on with npm start -- -p 8001')
    process.exit(0)
}
const port = argv.port
let username = null

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
  resave: true,
  unset: 'destroy',
  saveUninitialized: true
}));

//Para cargar los archivos publicamente usamos
app.use(express.static(path.join(__dirname, 'public')));

//Logger middleware
app.use('*', (req, res, next) => {
    let time = new Date()
    console.log(`${req.method} to ${req.originalUrl} at ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
    if(req.session.username) username = req.session.username;
    // req.session.cesta = [];
    // console.log(req.session)
    next();
});

//Custom routes
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

//Ejecutamos el servidor en la ip local
socketServer.listen(port, '0.0.0.0', function(){
  console.log("Server started at localhost:", port);
});

//Ejecutamos el servidor socket.io para el chat en realtiime
socketRoutes(io, username);
