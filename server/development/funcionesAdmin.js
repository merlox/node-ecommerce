let Mongo = require('mongodb').MongoClient,
  fs = require('fs'),
  path = require('path'),
  MongoUrl = 'mongodb://localhost:27017/ecommerce',
  lorem = require('lorem-ipsum'),
  functions = require('./../functions.js');

function insertarProducto(imagenes, insideDir){
	console.log('InsertarProducto, development');
	Mongo.connect(MongoUrl, (err, db) => {
		if(err){
			db.close();
			return console.log('Could not connect to the db');
		}
		let titulo = lorem({count: 10, units: 'words', format: 'plain'});
		let descripcion = lorem({count: 10, units: 'sentences', format: 'plain'});
		let permalink = encodeURI(titulo);

		console.log('Insertando: '+titulo);

		//Copiar imagenes
		let end = path.join(__dirname, '../uploads/', permalink);
		fs.stat(end, (err, stats) => {
			if(err){
				if(err.code == 'ENOENT'){
					//Crear dir para insertar las imgs
					fs.mkdirSync(end);
				}
			}
			for(let key in imagenes){
				let origin = path.join(insideDir, imagenes[key]);
				let fileName = imagenes[key];
				functions.copyFile(origin, end, fileName, (err) => {
					if(err) return console.log(err);
				});
			}
		});

		db.collection('productos').save({
			'titulo': titulo,
			'permalink': permalink,
			'imagenes': imagenes,
			'precio': '19,99',
			'descripcion': descripcion,
			'publicado': 'si',
			'fecha': new Date(),
			'visitas': 0,
			'vendidos': 0,
			'categoria': 'Automaticos',
			'atributos': {}
		}, (err, result) => {
			db.close();
			if(err) return console.log(err);
			else return null;
		});
	});
};
function insertarProductos(){
	let imagesDir = path.join(__dirname, '/images/');
	fs.readdir(imagesDir, (err, files) => {
		if(err){
			return console.log(err);
		}
		files.forEach((insideDir) => {
			insideDir = path.join(imagesDir, insideDir);
			let images = {};
			fs.readdir(insideDir, (err, files) => {
				if(err){
					return console.log(err);
				}
				for(let i = 0; i < files.length; i++){
					images[i+1] = files[i];
					if(i >= files.length - 1){
						insertarProducto(images, insideDir);
					}
				}
			});
		});
	});
};
function borrarTodosProductos(){
	console.log('BorrarTodosProductos, development');
	Mongo.connect(MongoUrl, (err, db) => {
		if(err){
			db.close();
			return console.log('Could not connect to the db');
		}
		let uploads = path.join(__dirname, '../uploads/');
		fs.readdir(uploads, (err, uploadsFolder) => {
			uploadsFolder.forEach((folder) => {
				if(folder != 'Slider'){
					fs.readdir(path.join(uploads, folder), (err, files) => {
						if(err) return console.log(err);
						if(files.length == 0){
							fs.rmdir(path.join(uploads, folder), (err) => {
								if(err) return console.log(err);
							});
						}else{
							for(let o = 0; o < files.length; o++){
								let file = files[o];
								let fileLocation = path.join(uploads, folder, file);
								fs.unlink(fileLocation, (err) => {
									if(err) return console.log(err);
									if(o >= files.length - 1){
										fs.rmdir(path.join(uploads, folder), (err) => {
											if(err) return console.log(err);
										});
									}
								});
							}
						}
					});
				}
			});
		});
		db.collection('productos').remove({}, (err, numberRemoved) => {
			db.close();
			if(err) return console.log(err);
			return console.log('Se han borrado: '+numberRemoved+' productos.');
		});
	});
};
let ejecutar = process.argv[2]+'()';
eval(ejecutar);