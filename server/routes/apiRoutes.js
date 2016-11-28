/*

Estas son las páginas de utilidades para cargar funciones en ajax

*/

let functions = require('./../functions.js'),
	path = require('path'),
	express = require('express'),
	formidable = require('formidable'),
	fs = require('fs'),
	session = require('express-session'),
    Mongo = require('mongodb').MongoClient,
    MongoStore = require('connect-mongo')(session),
    MongoUrl = 'mongodb://localhost:27017/ecommerce';

let api = express.Router();

api.get('/get-images/:permalink', (req, res) => {
  functions.copyDirectory(path.join(__dirname, '../uploads/', req.params.permalink), path.join(__dirname, '../../public/', '/public-uploads/'), (err) => {
    if(err) console.log(err);
    res.send('Images copied');
  });
});
api.get('/permalink-check/:permalink', (req, res) => {
	functions.buscarProducto(req.params.permalink, (err, result) => {
		if(err) return res.send(err);
		if(result != null){
			return res.send(true);
		}else{
			return res.send(null);
		}
	});
});
api.post('/guardar-categorias', (req, res) => {
	functions.guardarCategorias(req.body, (err, success) => {
		if(err) return res.send(err);
		return res.send(success);
	});
});
api.get('/get-categories', (req, res) => {
	functions.getCategories((err, result) => {
		if(err){
			return res.send(err);
		}else{
			return res.send(result);
		}
	});
});
api.get('/get-all-products/:imagenesLimit?', (req, res) => {
	functions.getAllProducts((err, results) => {
		if(err){
			console.log(err);
			return res.send(err);
		}else{
			return res.send(results);
		}
	});
});
api.get('/get-single-product/:permalink', (req, res) => {
  functions.buscarProducto(req.params.permalink, (err, result) => {
    if(err) return res.send(err);
    functions.copyDirectory(path.join(__dirname, '../uploads/', req.params.permalink), 
        path.join(__dirname, '../../public/public-uploads/'), (err) => {
      if(err) console.log(err);
      else return res.send(result);
    });
  });
});
api.get('/borrar-producto/:permalink', (req, res) => {
  functions.borrarProducto(req.params.permalink, (err) => {
    if(err){
      console.log(err);
      return res.send(err);
    }
    else return res.send(true);
  });
});

let productImages = {};

api.post('/upload-image-product', (req, res) => {
  let form = new formidable.IncomingForm();
  let counterImage = 0;
  form.multiple = true;
  form.uploadDir = path.join(__dirname, '../../server/uploads');
  form.on('file', (field, file) => {
    counterImage++;
    file.name = file.name.replace(/&.*;+/g, '-');
    //Esta linea es la que se encarga de subir el archivo en el servidor.
    fs.rename(file.path, path.join(__dirname, '../../public/public-uploads/', file.name), (err) => {
    	if(err) console.log(err);
    });

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
api.post('/upload-product', (req, res) => {

  //Guardamos el producto en la base de datos
  informacionProducto = {
    'titulo': req.body.titulo,
    'imagenes': req.body.imagenes,
    'permalink': req.body.permalink.toLowerCase(),
    'precio': req.body.precio,
    'descripcion': req.body.descripcion,
    'categoria': req.body.categoria,
    'atributos': req.body.atributos,
    'publicado': req.body.publicado
  };

  functions.uploadPublicImages(req.body.imagenes, req.body.permalink.toLowerCase(), (err) => {
    if(err) console.log(err);
  });

  functions.createUpdateProduct(req.body.permalink.toLowerCase(), informacionProducto, (err) => {
    if(err) return res.send(err);
    else return res.send('Producto guardado satisfactoriamente');
  });
});


module.exports = api;