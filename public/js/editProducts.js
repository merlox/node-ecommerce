let domainName = '192.168.1.111:3000';

function id(id){
	return document.getElementById(id);
}

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

//TODO poner los datos del producto para editarlo
function loadFullProduct(productPermalink){
	httpGet('/api/get-single-product/'+productPermalink, (fullProduct) => {
		fullProduct = JSON.parse(fullProduct);
		id('producto-title').value = fullProduct.titulo;
		id('producto-precio').value = fullProduct.precio;
		id('permalink').value = fullProduct.permalink;
		id('producto-descripcion').value = fullProduct.descripcion;
		id('producto-categoria-seleccionada').innerHTML = fullProduct.categoria;
		guardarCategoria();
		id('seccion-preview-atributos').innerHTML = fullProduct.atributos;
		id('seccion-preview-publicado').innerHTML = fullProduct.publicado;
	});
}
//TODO this
function borrarProducto(productPermalink){
	httpGet('/api/borrar-producto/'+productPermalink, (respuesta) => {

	});
}

httpGet('/api/get-all-products/', (results) => {
	results = JSON.parse(results);
	if(results != false){
		let arrayProductos = results;
		for(let i = 0; i < arrayProductos.length; i++){
			let objetoProducto = arrayProductos[i];
			let tituloProducto = objetoProducto.titulo;
			let addEspacioTitulo = '';
			if(objetoProducto.titulo.length > 54){
				objetoProducto.titulo = objetoProducto.titulo.substring(0, 55);
				objetoProducto.titulo += "...";
			}else{
				addEspacioTitulo = '<br />';
			}
			let permalinkATexto = "'"+objetoProducto.permalink+"'";
			let htmlProducto = '<div class="contenedor-producto">'
				+'<img class="imagen-producto" src="../public-uploads/'+objetoProducto.imagenes[1]+'">'
				+'<div class="contenedor-producto-informacion"><b title="'+tituloProducto+'" style="display:inline-block;">'+objetoProducto.titulo+'</b>'
				+addEspacioTitulo+'<p class="categoria-producto-unico">'+objetoProducto.categoria+'</p>'
				+'<div class="contenedor-enlaces-producto"><a target="_blank" href="http://'+domainName+'/p/'+objetoProducto.permalink+'"> Ver </a>'
				+'<a href="javascript:void(0)" onclick="loadFullProduct('+permalinkATexto+')"> Editar </a>'
				+'<a href="javascript:void(0)" onclick="borrarProducto('+permalinkATexto+')"> Borrar </a></div></div>';

			id('seccion-productos').insertAdjacentHTML('beforeend', htmlProducto);
		}
	}else{
		id('seccion-productos').innerHTML = 
			'<p class="no-products-found">No hay productos para mostrar.</p>';
	}
});