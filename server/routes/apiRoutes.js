/*

Estas son las páginas de utilidades para cargar funciones en ajax

*/

let functions = require('./../functions.js'),
	path = require('path'),
	express = require('express'),
  fs = require('fs'),
  formidable = require('formidable'),
  api = express.Router();

api.get('/get-images/:permalink', (req, res) => {
  functions.copyDirectory(path.join(__dirname, '../uploads/', encodeURIComponent(req.params.permalink)), 
    path.join(__dirname, '../../public/', '/public-uploads/'), (err) => {
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
  let imagesLimit = 400;
  let page = 1;
  if(req.params.imagenesLimit) imagesLimit = parseInt(req.params.imagenesLimit);
  if(req.query.page) page = parseInt(req.query.page);
	functions.getAllProducts(imagesLimit, page, (err, results) => {
		if(err){
			console.log(err);
			return res.send(err);
		}else{
      console.log('hola');
			return res.send(results);
		}
	});
});
api.get('/get-single-product/:permalink', (req, res) => {
  functions.buscarProducto(req.params.permalink, (err, result) => {
    if(err){
      console.log(err);
      return res.send(err);
    }
    functions.copyDirectory(path.join(__dirname, '../uploads/', encodeURIComponent(req.params.permalink)), 
        path.join(__dirname, '../../public/public-uploads/'), (err) => {
      if(err) {
        console.log(err);
        return res.send('There was an error getting the product, please try again.');
      }
      return res.send(result);
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
//Para upload las imagenes al public uploads
let productImages = {};
api.post('/upload-image-product', (req, res) => {
  let form = new formidable.IncomingForm();
  let counterImage = 0;
  form.multiple = true;
  form.uploadDir = path.join(__dirname, '../../public/public-uploads');
  form.on('file', (field, file) => {
    counterImage++;
    //Le cambiamos el nombre en caso de que tenga códigos html
    file.name = file.name.replace(/&.*;+/g, '-');
    //Esta linea es la que se encarga de subir el archivo en el servidor.
    functions.copyFile(file.path, path.join(__dirname, '../../public/public-uploads/'), file.name, (err) => {
      if(err) console.log(err);
      else{
        //Borramos el temporal para subir el definitivo
        fs.unlink(file.path, (err) => {
          if(err) console.log(err);
        });
      }
    });

    productImages[counterImage] = file.name;
  });
  form.on('error', (err) => {
    console.log('An error ocurred uploading the images '+err);
  });
  form.on('end', () => {
    //Response
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
    'permalink': req.body.permalink,
    'precio': req.body.precio,
    'descripcion': req.body.descripcion,
    'categoria': req.body.categoria,
    'atributos': req.body.atributos,
    'publicado': req.body.publicado,
    'fecha': new Date(),
    'visitas': 0,
    'vendidos': 0
  };
  functions.uploadPublicImages(req.body.imagenes, req.body.permalink.toLowerCase(), (err) => {
    if(err) console.log(err);
  });
  functions.createUpdateProduct(req.body.permalink.toLowerCase(), informacionProducto, (err) => {
    if(err) return res.send(err);
    else return res.send('Producto guardado satisfactoriamente');
  });
});
api.post('/guardar-busqueda', (req, res) => {
  functions.guardarBusqueda(req.body.data, (err) => {
    if(err) console.log(err);
    return res.send(null);
  });
});
//Para guardar las imágenes del slider en el servidor y base de datos
api.post('/upload-slider-server', (req, res) => {
  functions.guardarSliderImages(req.body.data, (err) => {
    if(err){
      console.log(err);
      res.send(err);
    }else{
      res.send(null);
    }
  });
});
//Para devolver los resultados en forma de objeto
api.get('/search/:keyword?', (req, res) => {
  let keyword = decodeURI(req.params.keyword);
  let limite = req.query.limite;
  if(limite == undefined || limite == null){
    limite = 0;
  }
  if(keyword != 'undefined' && keyword != 'null' && keyword != ''){
    functions.buscarProductos(keyword, limite, (err, results) => {
      if(err) console.log(err);
      return res.send(results);
    });
  }else{
    return res.send(null);
  }
});
api.get('/get-slider', (req, res) => {
  functions.getSlider((err, result) => {
    if(err) console.log(err);
    return res.send(result);
  });
});
api.get('/get-mas-vendidos', (req, res) => {
  functions.getMasVendidos((err, results) => {
    if(err) console.log(err);
    return res.send(results);
  });
});
api.get('/get-mas-populares', (req, res) => {
  functions.getMasPopulares((err, results) => {
    if(err) console.log(err);
    return res.send(results);
  });
});
api.get('/get-paginacion-admin-productos/:productLimit?', (req, res) => {
  let limite = 100;
  if(req.params.productLimit) limite = parseInt(req.params.productLimit);
  functions.getPaginacion(limite, (err, paginas) => {
    if(err){
      console.log(err);
      return res.send(null);
    }else{
      let objetoPaginas = {paginas: paginas};
      objetoPaginas = JSON.stringify(objetoPaginas);
      console.log(objetoPaginas);
      return res.send(objetoPaginas);
    }
  });
});

module.exports = api;