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

module.exports = admin;