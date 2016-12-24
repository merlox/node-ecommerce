'use strict';
const express = require('express'),
	path = require('path'),
	admin = express.Router();

admin.use((req, res, next) => {
	if(req.session.username == 'merloxdixcontrol@gmail.com'){
		next();
	}else{
		return res.send('You can\'t enter here.');
	}
});

admin.get('/dashboard', (req, res) => {
	return res.sendFile(path.join(__dirname, '../../public/html/adminDashboard.html'));
});

admin.get('/add-product', (req, res) => {
    return res.sendFile(path.join(__dirname, '../../public/html/adminAddProduct.html'));
});

admin.get('/edit-products', (req, res) => {
    return res.sendFile(path.join(__dirname, '../../public/html/adminEditProducts.html'));
});

admin.get('/edit-index', (req, res) => {
	return res.sendFile(path.join(__dirname, '../../public/html/adminEditIndex.html'));
});

admin.get('/', (req, res) => {
	res.redirect('/admin/dashboard');
});

module.exports = admin;