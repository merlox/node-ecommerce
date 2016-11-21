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
  functions.copyDirectory(path.join(__dirname, '/uploads/', '/kindle/'), path.join(__dirname, '../public/', '/public-uploads/'), (err) => {
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
    else return res.send(result);
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

  fs.stat(path.join(__dirname, '../../server/uploads/', req.body.permalink), (err, stats) => {
    if(err){
      fs.mkdirSync(path.join(__dirname, '../../server/uploads/', req.body.permalink));
    }
    functions.copyDirectory(path.join(__dirname, '../../public/public-uploads/'), path.join(__dirname, '../../server/uploads/', req.body.permalink), (err) => {
      //Si hay un error copiando el directorio, borramos las imágenes temporales
      if(err){
        console.log('Error copiando el directorio '+err);
        fs.readdir(path.join(__dirname, '../../public/public-uploads/'), (err, files) => {
          files.forEach((file) => {
            fs.unlink(path.join(__dirname, '../../public/public-uploads/', file), (err) => {
              if(err) console.log(err);
            });
          });
        });
        return res.send('Error: Could not copy the images to the server');
      }else{
        console.log('Directory '+__dirname+'../../public/public-uploads/'+' copied successfully to '+__dirname+'../../server/uploads/'+req.body.permalink);
        //Borramos imágenes temporales
        fs.readdir(path.join(__dirname, '../../public/public-uploads/'), (err, files) => {
          files.forEach((file) => {
            fs.unlink(path.join(__dirname, '../../public/public-uploads/', file), (err) => {
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

module.exports = api;