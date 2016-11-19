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
httpGet('/api/get-all-products/', (results) => {
	if(results != null){
		let arrayProductos = JSON.parse(results);
		for(let i = 0; i < arrayProductos.length; i++){
			let objetoProducto = arrayProductos[i];
			let htmlProducto = '<div class="contenedor-producto">'
			+'<img class="imagen-producto" src="../images/'+objetoProducto.imagenes[1]+'">'
			+'<div class="contenedor-producto-informacion"><h3>'+objetoProducto.titulo+'</h3>'
			+'<a href="'+domainName+'/p/'+objetoProducto.permalink+'"></a><p>'+objetoProducto.categoria+'</p></div>';

			document.getElementById('seccion-productos').insertAdjacentHTML('beforeend', htmlProducto);
		}
	}
});