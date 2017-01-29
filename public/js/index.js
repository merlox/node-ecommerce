'use strict';
//Variables Slider
let arrayImagenes = [],
	indexImagenActiva = '',
	intervaloSlider,
	alineador = 0;

//Variables minislider
let intervaloMiniSliderVendidos,
	maxMinislider = 0,
	counterPosition = 0,
	//Para calcular cuánto tiene que moverse el slider al hacer click en las flechas
	//Counterlimit es lo mismo que tamaño widgets pero va cambiando dinamicamente al usar las flechas
	counterLimit = 0,
	//Tamaño widgets es cuántas imágenes se muestran en la pantalla principal del minislider
	tamañoWidgets = 1;

window.addEventListener('load', () => {

	centrarImagenesSlider();

	httpGet('/api/get-mas-vendidos', (results) => {
		let resultados = JSON.parse(results);
		colocarMasVendidos(resultados);
		iniciarIntervaloMiniSliderVendidos();
	});

	calcularTamañoMinisliderResponsive();
});
window.addEventListener('resize', () => {
	//Reiniciamos el intervalo para que no se salga del límite
	counterLimit = tamañoWidgets;
	counterPosition = 0;
	q('.minislider').style.transform = `translateX(${300*counterPosition}px)`;	
	//Recalcular el tamaño del minislider para que siga funcionando correctamente y detecte su tamaño nuevo
	setTimeout(() => {
		calcularTamañoMinisliderResponsive();
	}, 1e3);
});
/*

MAIN SLIDER

*/
//Para colocar las imagenes pasandole el nombre en json
function centrarImagenesSlider(){
	let contenedorImagenes = q('#contenedor-imagenes-slider'),
		image = q('.imagen-slider');
	indexImagenActiva = 0;
	arrayImagenes = qAll('.imagen-slider');
	//Colocar la imagen en el centro de la pantalla
	contenedorImagenes.style.width = (image.naturalWidth * arrayImagenes.length + 'px');
	alineador = (image.naturalWidth - window.outerWidth) / 2;
	contenedorImagenes.style.transform = `translateX(-${alineador}px)`;
	intervaloCambiarImagenes();
	arrayImagenes.forEach(img => {
		img.style.display = 'block';
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
				<span class="precio-minislider">${parseFloat(producto.precio).toFixed(2)}€</span>
				<a class="categoria-minislider" href="/${encodeURIComponent(producto.categoria)}">${producto.categoria}</a>
			</div>`;
	}

	maxMinislider = productosMasVendidos.length;
	//Calculamos el tamaño del minislider
	q('.minislider').style.width = (productosMasVendidos.length * 400) + 'px';
	q('.minislider').innerHTML = productoHtml;
};
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
	if(counterLimit >= tamañoWidgets){
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
	}else if(counterPosition > 0){
		counterLimit = maxMinislider;
		counterPosition = -(maxMinislider-tamañoWidgets);
		q('.minislider').style.transform = `translateX(${300*counterPosition}px)`;
	}
	intervaloMiniSliderVendidos = setInterval(flechaDerechaMiniSliderVendidos, 5000);
};
function calcularTamañoMinisliderResponsive(){
	//Si el tamaño tiene más de 4 cifras hacer un substring de las dos primeras
	if(q('.contenedor-minislider').offsetWidth.toString().substring(0).length > 3){
		tamañoWidgets = parseInt(q('.contenedor-minislider').offsetWidth.toString().substring(0, 2))/3;
	}else{
		tamañoWidgets = parseInt(q('.contenedor-minislider').offsetWidth.toString().substring(0, 1))/3;
	}

	counterLimit = tamañoWidgets;
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