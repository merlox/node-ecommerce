let domainName = '192.168.1.111:3000';

function httpGet(url, cb){
	//If no callback is provided in the function calling, ignore the callback
	if(cb == undefined){
		cb = () => {};	
	}
	let request = new XMLHttpRequest();
	request.open('GET', url);
	request.onreadystatechange = () => {
      if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status <= 300){
		return cb(request.responseText);      
      }else if(request.readyState == XMLHttpRequest.DONE){
      	return cb(null);
      }
	}	
	request.send();
}

function loadFullProduct(productPermalink){
	console.log('/api/get-single-product/'+productPermalink);
	httpGet('/api/get-single-product/'+productPermalink, (fullProduct) => {
		document.getElementById('seccion-preview').innerHTML =
	});
}

httpGet('/api/get-all-products/', (results) => {
	results = JSON.parse(results);
	if(results != false){
		let arrayProductos = results;
		for(let i = 0; i < arrayProductos.length; i++){
			let objetoProducto = arrayProductos[i];
			let permalinkATexto = "'"+objetoProducto.permalink+"'";
			let htmlProducto = '<div class="contenedor-producto">'
				+'<img class="imagen-producto" src="../public-uploads/'+objetoProducto.imagenes[1]+'">'
				+'<div class="contenedor-producto-informacion"><h3>'+objetoProducto.titulo+'</h3>'
				+'<a target="_blank" href="'+domainName+'/p/'+objetoProducto.permalink+'">Ver Producto</a>'
				+'<a href="javascript:void(0)" onclick="loadFullProduct('+permalinkATexto+')">Editar producto</a>'
				+'<p>'+objetoProducto.categoria+'</p></div>';

			document.getElementById('seccion-productos').insertAdjacentHTML('beforeend', htmlProducto);
		}
	}else{
		document.getElementById('seccion-productos').innerHTML = 
			'<p class="no-products-found">No hay productos para mostrar.</p>';
	}
});