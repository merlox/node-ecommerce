let express = require('express'),
	app = express(),
	functions = require('./../functions.js'),
	apiRoutes = require('./apiRoutes.js'),
    loginRoutes = require('./loginRoutes.js'),
	path = require('path');

module.exports = exports = function(app){
	app.use(express.static(path.join(__dirname, '../../public')));

	app.use('/api', apiRoutes);
	let admin = express.Router();
	app.use('/admin', admin);
	loginRoutes(app);

	app.get('/p/:permalink', (req, res) => {
	  functions.buscarProducto(req.params.permalink, (err, result) => {
	    if(err) console.log(err);
	    if(result.publicado == 'no'){
	      return res.redirect('/?message=That page is not available');
	    }else if(result.publicado == 'si'){
	      functions.render(__dirname+'/public/views/producto.html', result, (err, data) => {
	        return res.send(data);
	      });
	    }
	  });
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

	app.get('*', (req, res) => {
	  if(req.session.username == 'merunas'){
	    return res.redirect('/admin/dashboard');
	  }
	  res.sendFile(path.join(__dirname, '../../public/html/main.html'));
	});
};