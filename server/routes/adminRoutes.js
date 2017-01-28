'use strict';
const express = require('express'),
	path = require('path'),
	admin = express.Router(),
	render = require('./../render.js');

admin.use((req, res, next) => {
	if(req.session.username === 'merloxdixcontrol@gmail.com'){
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

module.exports = admin;