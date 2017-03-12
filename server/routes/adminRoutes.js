'use strict';
const express = require('express'),
	path = require('path'),
	admin = express.Router(),
	render = require('./../render.js'),
	claves = require('./../secrets/secrets.js'),
	functions = require('./../functions.js');

admin.use((req, res, next) => {
	if(req.session.username === claves.adminName){
		next();
	}else{
		return res.send('You can\'t enter here.');
	}
});

admin.get('/dashboard', (req, res) => {
	render(path.join(__dirname, '../../public/html/adminDashboard.html'), null, (err, data) => {
		if(err) return res.send('No se pudo cargar la página, por favor inténtelo de nuevo.');
		res.send(data);
	});
});

admin.get('/edit-products', (req, res) => {
    render(path.join(__dirname, '../../public/html/adminEditProducts.html'), null, (err, data) => {
		if(err) return res.send('No se pudo cargar la página, por favor inténtelo de nuevo.');
		res.send(data);
	});
});

admin.get('/edit-index', (req, res) => {
	render(path.join(__dirname, '../../public/html/adminEditIndex.html'), null, (err, data) => {
		if(err) return res.send('No se pudo cargar la página, por favor inténtelo de nuevo.');
		res.send(data);
	});
});

admin.get('/', (req, res) => {
	res.redirect('/admin/dashboard');
});

admin.post('/set-preguntas-frecuentes', (req, res) => {
  let objetoPregunta = req.body.data;
  functions.setPreguntasFrecuentes(objetoPregunta, err => {
    if(err) return res.send(err);
    res.send(null);
  });
});

admin.get('/eliminar-pregunta/:id', (req, res) => {
	functions.eliminarPreguntaFrecuente(req.params.id, err => {
		if(err) res.send(err);
		res.send(null);
	});
});

admin.post('/editar-pregunta', (req, res) => {
	functions.editarPregunta(req.body.data.id, req.body.data.preguntaModificada, req.body.data.respuestaModificada, err => {
		res.send(err);
	});
});

admin.post('/subir-productos-csv', (req, res) => {
  functions.subirCSV(req.body.data, (err) => {
    if(err) return res.send(err);
    res.send(null);
  });
});

admin.post('/guardar-categorias', (req, res) => {
	functions.guardarCategorias(req.body.data, err => {
		res.send(err);
	});
});

admin.post('/upload-product', (req, res) => {
  let b = req.body.data;
  if(!b.titulo || !b.imagenes || !b.permalink || !b.precio || !b.descripcion || !b.categoria || !b.atributos || b.publicado === null){
    return res.send('Error, algún dato del producto no se ha recibido correctamente, comprueba la información del producto.');
  };
  functions.uploadPublicImages(b.imagenes, err => {
    if(err) return res.send(err);  
    functions.createUpdateProduct(b, err => {
      if(err) res.send('Error, no se pudo guardar el producto en la base de datos, inténtalo de nuevo.');
      res.send(null);
    });
  });
});

module.exports = admin;