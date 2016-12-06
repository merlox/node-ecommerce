let objetoImagenes = {};
let indexImagenActiva = '';
let intervaloSlider;

/*

Admin Functions

*/
//Para enviar las imagenes a public-uploads
function uploadSliderPublic(){
	let files = q('#input-slider').files;
	let formData = new FormData();
	for(let i = 0; i < files.length; i++){
		let file = files[i];
		formData.append('uploads[]', file, file.name);
	}
	//Post plain expects a formdata not json
	httpPostPlain('/api/upload-image-product', formData, (results) => {
		colocarImagenesSlider(results);
		intervaloCambiarImagenes();
		q('#input-slider').value = '';
	});
};
function resetSlider(){
	clearInterval(intervaloSlider);
	objetoImagenes = {};
	q('#imagen-slider').remove();
	q('#contenedor-imagenes-slider').style.display = 'none';
	q('#placeholder-slider').style.display = 'block';
};
function uploadSliderServer(){
	//Post expects an object
	httpPost('/api/upload-slider-server', objetoImagenes, (result) => {

	});
};
/*

Client Functions

*/
//Para colocar las imagenes pasandole el nombre en json
function colocarImagenesSlider(jsonData){
	objetoImagenes = JSON.parse(jsonData);
	let contenedorImagenes = q('#contenedor-imagenes-slider');
	q('#placeholder-slider').style.display = 'none';
	contenedorImagenes.style.display = 'block';
	//Para añadir un margin negativo de la mitad del tamaño que combinado 
	//con left 50% alinea perfecto en el centro siempre
	let img = new Image();
	img.src = '../public-uploads/'+objetoImagenes[1];
	img.id = 'imagen-slider';
	indexImagenActiva = 1;
	img.style.marginLeft = (-(img.width/2))+'px';
	contenedorImagenes.insertAdjacentHTML('beforeend', img.outerHTML);
	q('#imagen-slider').style.width = (-(img.width/2))+'px';
};
//Para poner la siguiete imagen a la derecha
function cambiarImagenDerecha(){
	let tamañoObjetoImagenes = Object.keys(objetoImagenes).length;
	if(indexImagenActiva == tamañoObjetoImagenes){
		indexImagenActiva = 1;
	}else{
		indexImagenActiva = ++indexImagenActiva;
	}
	q('#imagen-slider').src = '../public-uploads/'+objetoImagenes[indexImagenActiva];
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloSlider);
	intervaloCambiarImagenes();
};
//Para poner la siguiente a la izquierda
function cambiarImagenIzquierda(){
	let tamañoObjetoImagenes = Object.keys(objetoImagenes).length;
	if(indexImagenActiva == 1){
		indexImagenActiva = tamañoObjetoImagenes;
	}else{
		indexImagenActiva = --indexImagenActiva;
	}
	q('#imagen-slider').src = '../public-uploads/'+objetoImagenes[indexImagenActiva];
};
//Para cambiar las imágenes a la derecha cada 5 segundos
function intervaloCambiarImagenes(){
	intervaloSlider = setInterval(cambiarImagenDerecha, 5000);
};

q('#placeholder-slider').addEventListener('click', () => {
	q('#input-slider').click();
});
q('#input-slider').addEventListener('change', uploadSliderPublic);
q('#flecha-izquierda-slider').addEventListener('click', cambiarImagenIzquierda);
q('#flecha-derecha-slider').addEventListener('click', cambiarImagenDerecha);
q('#button-reset-slider').addEventListener('click', resetSlider);
q('#button-publicar-slider').addEventListener('click', uploadSliderServer);