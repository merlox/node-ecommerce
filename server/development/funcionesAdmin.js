let fs = require('fs'),
  path = require('path'),
  lorem = require('lorem-ipsum'),
  functions = require('./../functions.js'),
  Mongo = require('mongodb').MongoClient,
  MongoUrl = 'mongodb://merunas:jakx1234.@ds119508.mlab.com:19508/merunas-mongo',
  db = {};

Mongo.connect(MongoUrl, (err, database) => {
	if(err) console.log('Could not connect to the db');
	db = database;

let arrayTitulos = [];
function insertarUnProducto(imagenes, insideDir, cb){
	console.log('InsertarProducto, development');
	let titulo = lorem({count: 10, units: 'words', format: 'plain'});
	let descripcion = lorem({count: 10, units: 'sentences', format: 'plain'});
	let permalink = encodeURI(titulo);
	let precioRandom = Math.floor(Math.random() * (100 - 5 + 1)) + 5;
	precioRandom += 0.99;

	arrayTitulos.push(titulo);
	let tituloExistente = true;
	while(tituloExistente){
		titulo = lorem({count: 10, units: 'words', format: 'plain'});
		let repetido = false;
		for (var i = 0; i < arrayTitulos.length; i++) {
			let singleTitulo = arrayTitulos[i];
			if(singleTitulo === titulo) repetido = true;
		}
		if(!repetido) tituloExistente = false;
	}

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
				if(err) return cb(err);
			});
		}
	});

	db.collection('productos').save({
		'titulo': titulo,
		'permalink': permalink,
		'imagenes': imagenes,
		'precio': precioRandom,
		'descripcion': descripcion,
		'publicado': true,
		'fecha': new Date(),
		'visitas': Math.floor(Math.random()*1000),
		'vendidos': Math.floor(Math.random()*100),
		'categoria': 'Automaticos',
		'atributos': {}
	}, (err, result) => {
		if(err) return cb(err);
		else cb('done');
	});
};

let counter = 0;
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
						insertarUnProducto(images, insideDir, (done) => {
							counter++;
							console.log(counter+' '+done);
						});
					}
				}
			});
		});
	});
};
function borrarTodosProductos(){
	console.log('BorrarTodosProductos, development');
	let uploads = path.join(__dirname, '../uploads/');
	fs.readdir(uploads, (err, uploadsFolder) => {
		uploadsFolder.forEach((folder) => {
			if(folder != '_Slider'){
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
		if(err) return console.log(err);
		return console.log('Se han borrado: '+numberRemoved+' productos.');
	});
};

if(process.argv[2] == 'help'){
	console.log('borrarTodosProductos insertarProductos');
	process.exit(0);
}else{
	let vecesAEjecutar = parseInt(process.argv[3]);
	if(vecesAEjecutar > 0){
		for(let i = 0; i < vecesAEjecutar; i++){
			eval(process.argv[2]+'()');
		}
	}else{
		eval(process.argv[2]+'()');
	}
}

}); //Mongo connect close
