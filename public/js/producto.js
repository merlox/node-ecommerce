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

let imagenSecundariaActivaAnterior = document.getElementsByClassName('contenedor-imagen-secundaria-individual')[0];

imagenSecundariaActivaAnterior.className = 'contenedor-imagen-secundaria-individual imagen-secundaria-activa';

function imageHover(e){
	imagenSecundariaActivaAnterior.className = 'contenedor-imagen-secundaria-individual';
	e.parentNode.className = 'contenedor-imagen-secundaria-individual imagen-secundaria-activa';
	document.getElementById('imagen-principal').src = e.src;
	imagenSecundariaActivaAnterior = e.parentNode;
}

let permalinkUrl = window.location.pathname.slice(3);

httpGet('/api/get-images/'+permalinkUrl);
document.getElementById('contenedor-button-expandir-texto').addEventListener('click', () => {
	document.getElementById('producto-descripcion').style.height = 'auto';
	document.getElementById('contenedor-button-expandir-texto').style.display = 'none';
});