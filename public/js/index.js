'use strict';
//Variables Slider
let arrayImagenes = [],
	imagenIzquierda,
	imagenDerecha = 1,
	intervaloSlider,
	bloquearFlechas = false,
	urlsSliderImages = {};

window.addEventListener('load', () => {
	getSliderUrls();
	new Minislider('Más vendidos', 'vendidos', '#minislider1');
	new Minislider('Vistos anteriormente', 'vistosAnteriormente', '#minislider2');
	new Minislider('Novedades', 'recientes', '#minislider4');
	new Minislider('Te pueden interesar', 'random', '#minislider5');
});
/*

SLIDER

*/
function colocarImagenes(){
	let imagenesSlider = qAll('.imagen-slider');
	for (var i = 0; i < imagenesSlider.length; i++) {
		let img = imagenesSlider[i];
		arrayImagenes.push(img.src);
		if(i != 0) img.remove();
	}
	imagenIzquierda = arrayImagenes.length-1;
	let derechaHTML = `<a href="${urlsSliderImages[1] ? urlsSliderImages[1] : '#'}">
			<img id="imagen-derecha" src="${arrayImagenes[1]}"/></a>`,
		izquierdaHTML = `<a href="${urlsSliderImages[imagenIzquierda] ? urlsSliderImages[imagenIzquierda] : '#'}">
			<img id="imagen-izquierda" src="${arrayImagenes[imagenIzquierda]}"/></a>`;
	q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', derechaHTML);
	q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', izquierdaHTML);
	intervaloCambiarImagenes();
}
// Para conseguir la url de cada imagen del slider
function getSliderUrls(){
	httpGet('/api/get-slider-urls', response => {
		response = JSON.parse(response);
		if(response.err) console.log(err);
		urlsSliderImages = response.urls;
		colocarImagenes();
	});
};
/**
 * 1. La imagen derecha se convierte en la central,
 * 2. Eliminamos el resto (izquierda y central antigua),
 * 3. Insertamos las nuevas izquierda y derecha
 */
function desplazarDerecha(){
	bloquearFlechas = true;
	if(imagenIzquierda === (arrayImagenes.length-1)){
		imagenIzquierda = 0;
	}else{
		imagenIzquierda++;
	}
	if(imagenDerecha === (arrayImagenes.length-1)){
		imagenDerecha = 0;
	}else{
		imagenDerecha++;
	}
	//movemos las imagenes
	q('#imagen-central').style.transform = 'translateX(-150%)';
	q('#imagen-derecha').style.transform = 'translateX(-50%)';
	//cuando termine la animación de moverse...
	setTimeout(() => {
		if(q('#imagen-central').parentNode.nodeName === 'A'){
			q('#imagen-central').parentNode.remove();
		}else{
			q('#imagen-central').remove();
		}
		q('#imagen-izquierda').parentNode.remove();
		q('#imagen-derecha').id = 'imagen-central';
		//metemos la nueva derecha
		let izquierdaHTML = `<a href="${urlsSliderImages[imagenIzquierda]}">
				<img id="imagen-izquierda" src="${arrayImagenes[imagenIzquierda]}"/></a>`,
			derechaHTML = `<a href="${urlsSliderImages[imagenDerecha]}">
				<img id="imagen-derecha" src="${arrayImagenes[imagenDerecha]}"/></a>`;
		q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', derechaHTML);
		q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', izquierdaHTML);
		bloquearFlechas = false;
	}, 300);
	clearInterval(intervaloSlider);
	intervaloCambiarImagenes();
}
function desplazarIzquierda(){
	bloquearFlechas = true;
	if(imagenIzquierda === 0){
		imagenIzquierda = (arrayImagenes.length-1);
	}else{
		imagenIzquierda--;
	}
	if(imagenDerecha === 0){
		imagenDerecha = (arrayImagenes.length-1);
	}else{
		imagenDerecha--;
	}
	//movemos las imagenes
	q('#imagen-central').style.transform = 'translateX(50%)';
	q('#imagen-izquierda').style.transform = 'translateX(-50%)';
	setTimeout(() => {
		q('#imagen-central').parentNode.remove();
		q('#imagen-derecha').parentNode.remove();
		q('#imagen-izquierda').id = 'imagen-central';
		//metemos la nueva derecha
		let izquierdaHTML = `<a href="${urlsSliderImages[imagenIzquierda]}">
				<img id="imagen-izquierda" src="${arrayImagenes[imagenIzquierda]}"/></a>`,
			derechaHTML = `<a href="${urlsSliderImages[imagenDerecha]}">
				<img id="imagen-derecha" src="${arrayImagenes[imagenDerecha]}"/></a>`;
		q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', derechaHTML);
		q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', izquierdaHTML);
		bloquearFlechas = false;
	}, 300);
	clearInterval(intervaloSlider);
	intervaloCambiarImagenes();
};
function intervaloCambiarImagenes(){
	intervaloSlider = setInterval(desplazarDerecha, 4000);
}

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
q('#flecha-derecha-slider').addEventListener('click', () => {
	if(!bloquearFlechas) desplazarDerecha();
});
q('#flecha-izquierda-slider').addEventListener('click', () => {
	if(!bloquearFlechas) desplazarIzquierda();
});