let functions = require('./functions.js'),
	path = require('path'),
	express = require('express');

module.exports = (function(){

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

	return api;

})();