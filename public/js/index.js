'use strict';
let arrayImagenes = [],
	indexImagenActiva = '',
	intervaloSlider,
	intervaloMiniSliderVendidos,
	maxMinislider = 0;

let alineador = 0;

window.addEventListener('load', () => {
	httpGet('/api/get-slider', (result) => {
		colocarImagenesSlider(result);
		intervaloCambiarImagenes();
	});
	httpGet('/api/get-mas-vendidos', (results) => {
		let resultados = JSON.parse(results);
		colocarMasVendidos(resultados);
		iniciarIntervaloMiniSliderVendidos();
	});
});
/*

MAIN SLIDER

*/
//Para colocar las imagenes pasandole el nombre en json
function colocarImagenesSlider(jsonData){
	arrayImagenes = JSON.parse(jsonData);
	let contenedorImagenes = q('#contenedor-imagenes-slider');
	indexImagenActiva = 0;
	let htmlImages = '';
	for(let i = 0; i < arrayImagenes.length; i++){
		htmlImages += `<img class="imagen-slider" src="../public-uploads/${arrayImagenes[i]}">`;
	}
	//Cargamos una imagen para calcular el alineador y colocar la imagen en el centro de la pantalla
	loadImage(`../public-uploads/${arrayImagenes[0]}`).then((image) => {
		contenedorImagenes.style.width = (image.naturalWidth * arrayImagenes.length + 'px');
		alineador = (image.naturalWidth - window.outerWidth) / 2;
		contenedorImagenes.style.transform = `translateX(-${alineador}px)`;
		contenedorImagenes.innerHTML = htmlImages;
		contenedorImagenes.style.display = 'block';
	}).catch((image) => {
		console.log('Error loading image: '+image.src);
	});
};
//Para poner la siguiete imagen a la derecha
function cambiarImagenDerecha(){
	if(indexImagenActiva == (arrayImagenes.length-1)){
		indexImagenActiva = 0;
	}else{
		indexImagenActiva = ++indexImagenActiva;
	}
	let tamañoImagen = q('.imagen-slider').naturalWidth;
	alineador = (tamañoImagen - window.outerWidth) / 2;
	q('#contenedor-imagenes-slider').style.transform = `translateX(${-((indexImagenActiva*tamañoImagen)+alineador)}px)`;
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloSlider);
	intervaloCambiarImagenes();
};
//Para poner la siguiente a la izquierda
function cambiarImagenIzquierda(){
	if(indexImagenActiva == 0){
		indexImagenActiva = (arrayImagenes.length-1);
	}else{
		indexImagenActiva = --indexImagenActiva;
	}
	let tamañoImagen = q('.imagen-slider').naturalWidth;
	alineador = (tamañoImagen - window.outerWidth) / 2;
	q('#contenedor-imagenes-slider').style.transform = `translateX(${-((indexImagenActiva*tamañoImagen)+alineador)}px)`;
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloSlider);
	intervaloCambiarImagenes();
};
//Para cambiar las imágenes a la derecha cada 5 segundos
function intervaloCambiarImagenes(){
	intervaloSlider = setInterval(cambiarImagenDerecha, 5000);
};
/*

MINISLIDERS

*/
//Para colocar el dom de los productos mas vendidos
function colocarMasVendidos(data){
	let productosMasVendidos = data;

	let productoHtml = '';
	for(let i = 0; i < productosMasVendidos.length; i++){
		let producto = productosMasVendidos[i];

		//Acortamos el título si fuese demasiado largo para que encaje en la caja	
		let tituloOriginal = producto.titulo;
		let tituloCorto = '';
		if(producto.titulo.length > 70){
			tituloCorto = producto.titulo.substring(0, 70);
			tituloCorto += '...';
		}else{
			tituloCorto = producto.titulo;
		}
		productoHtml += 
			`<div class="contenedor-producto-minislider">
				<a href="/p/${producto.permalink}" title="${tituloOriginal}">
					<img class="imagen-minislider" src="../public-uploads/${producto.imagen}" width="300px" height="300px">
				</a>
				<a class="titulo-minislider" href="/p/${producto.permalink}" title="${tituloOriginal}">${tituloCorto}</a>
				<span class="precio-minislider">${producto.precio}€</span>
				<a class="categoria-minislider" href="/${encodeURIComponent(producto.categoria)}">${producto.categoria}</a>
			</div>`;
	}

	maxMinislider = productosMasVendidos.length;
	//Calculamos el tamaño del minislider
	q('.minislider').style.width = (productosMasVendidos.length * 400) + 'px';
	q('.minislider').innerHTML = productoHtml;
};
//Para saber cuánto tiene que moverse el slider al hacer click en las flechas
let counterPosition = 0;
let tamañoWidgets = 1;
if(q('.contenedor-minislider').offsetWidth.toString().substring(0).length > 3){
	tamañoWidgets = parseInt(q('.contenedor-minislider').offsetWidth.toString().substring(0, 2))/3;
}else{
	tamañoWidgets = parseInt(q('.contenedor-minislider').offsetWidth.toString().substring(0, 1))/3;
}
let counterLimit = tamañoWidgets;
console.log(tamañoWidgets);
function flechaDerechaMiniSliderVendidos(){
	if(counterLimit <= maxMinislider){
		counterPosition--;
		counterLimit++;
		q('.minislider').style.transform = `translateX(${300*counterPosition}px)`;
	}
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSliderVendidos);
	iniciarIntervaloMiniSliderVendidos();
};
function flechaIzquierdaMiniSliderVendidos(){
	if(counterLimit > tamañoWidgets){
		counterPosition++;
		counterLimit--;
		q('.minislider').style.transform = `translateX(${300*counterPosition}px)`;
	}
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSliderVendidos);
	iniciarIntervaloMiniSliderVendidos();
};
function iniciarIntervaloMiniSliderVendidos(){
	if(counterLimit > maxMinislider){
		counterLimit = tamañoWidgets;
		counterPosition = 0;
		q('.minislider').style.transform = `translateX(${300*counterPosition}px)`;
	}
	intervaloMiniSliderVendidos = setInterval(flechaDerechaMiniSliderVendidos, 5000);
};

/*Inicio slider principal*/
//Opacidad de las flechas al hover slider
q('#contenedor-contenedor-slider').addEventListener('mouseenter', () => {
	q('#flecha-izquierda-slider').style.opacity = 1;
	q('#flecha-derecha-slider').style.opacity = 1;
});
q('#contenedor-contenedor-slider').addEventListener('mouseleave', () => {
	q('#flecha-izquierda-slider').style.opacity = 0.5;
	q('#flecha-derecha-slider').style.opacity = 0.5;
});

//Cambiar imagenes al click en las flechas del slider
q('#flecha-izquierda-slider').addEventListener('click', cambiarImagenIzquierda);
q('#flecha-derecha-slider').addEventListener('click', cambiarImagenDerecha);
/*Fin slider principal*/

/*Inicio minislider*/
q('.contenedor-minislider').addEventListener('mouseenter', () => {
	q('.flecha-izquierda-minislider').style.opacity = 1;
	q('.flecha-derecha-minislider').style.opacity = 1;
});
q('.contenedor-minislider').addEventListener('mouseleave', () => {
	q('.flecha-izquierda-minislider').style.opacity = 0.5;
	q('.flecha-derecha-minislider').style.opacity = 0.5;
});
q('.flecha-derecha-minislider').addEventListener('click', () => {
	flechaDerechaMiniSliderVendidos();
});
q('.flecha-izquierda-minislider').addEventListener('click', () => {
	flechaIzquierdaMiniSliderVendidos();
});
/*Fin minislider*/