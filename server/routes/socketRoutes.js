'use strict';
let Mongo = require('mongodb').MongoClient,
  MongoUrl = 'mongodb://merunas:jakx1234.@ds119508.mlab.com:19508/merunas-mongo',
  path = require('path'),
  db = {};

Mongo.connect(MongoUrl, (err, database) => {
  if(err) console.log(err);
  db = database;
});

function socketRoutes(io, username){
	io.on('connection', function(socket){
		let usuariosConnectados = [];
		let habitaciones = [];

		//Cada vez que se conecta un usuario nuevo, lo guardamos en un array. Ese array se envia a todos
		//los usuarios. Y se lee en el cliente con un foreach.
		if(username != null){
			console.log('user %s connected', username);
			usuariosConnectados.push(username);
			io.emit('user connected', usuariosConnectados);
		}else{
			console.log('user Anonimo connected');
			usuariosConnectados.push('Anonimo');
			io.emit('user connected', usuariosConnectados);
		}
		
		console.log(usuariosConnectados)

		socket.on('mensaje chat', function(mensaje){
			io.emit('mensaje chat', mensaje);
		});
		socket.on('disconnect', function(e){
			console.log(e)
			// if(username != null){
			//  let index = usuariosConnectados.indexOf(username);
			//  if(index > -1){
			//    usuariosConnectados.splice(index, 1);
			//  }
			// }else if(username == null){
			//  let index = usuariosConnectados.indexOf('Anonimo');
			//  if(index > -1){
			//    usuariosConnectados.splice(index, 1);
			//  }
			// }
			// io.emit('user connected', usuariosConnectados);
			// console.log('user %s disconnected', username);
		});
	});
};

module.exports = socketRoutes;