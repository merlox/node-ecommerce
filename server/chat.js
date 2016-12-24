'use strict';
let io = require('socket.io')(http),
	express = require('express'),
	app = express();

module.exports = (function(){

	let usernameLogged = null;
	let usuariosConnectados = [];

	app.use('*', function(req, res, next){
	  console.log("Requesting: "+req.url);
	  if(req.session.username != undefined){
	    usernameLogged = req.session.username;
	  }else{
	    usernameLogged = null;
	  }
	  next();
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
})();