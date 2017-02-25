'use strict';
//Variables Slider
let arrayImagenes = [],
	indexImagenActiva = 1,
	intervaloSlider;

window.addEventListener('load', () => {
	colocarImagenes();
	new Minislider('Más vendidos', 'vendidos', '#minislider1');
	new Minislider('Vistos anteriormente', 'vistosAnteriormente', '#minislider2');
});
/*

SLIDER

*/
function colocarImagenes(){
	qAll('.imagen-slider').forEach((e, index) => {
		arrayImagenes.push(e.src);
		if(index != 0) e.remove();
	});
	let imagenSRC = arrayImagenes[1],
		nodoHTML = `<img id="imagen-derecha" src="${imagenSRC}"/>`
	q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', nodoHTML);
	let imagenSRCFinal = arrayImagenes[arrayImagenes.length-1],
		nodoFinalHTML = `<img id="imagen-izquierda" src="${imagenSRCFinal}"/>`
	q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', nodoFinalHTML);
	intervaloCambiarImagenes();
}
function desplazarDerecha(){
	if(indexImagenActiva === (arrayImagenes.length-1)){
		indexImagenActiva = 0;
	}else{
		indexImagenActiva++;
	}
	//movemos las imagenes
	q('#imagen-central').style.transform = 'translateX(-150%)';
	q('#imagen-derecha').style.transform = 'translateX(-50%)';
	//eliminamos la izquierda
	q('#imagen-izquierda').remove();
	//cambiamos las ids
	q('#imagen-central').id = 'imagen-izquierda';
	q('#imagen-derecha').id = 'imagen-central';
	//metemos la nueva derecha
	let imagenSRC = arrayImagenes[indexImagenActiva],
	nodoHTML = `<img id="imagen-derecha" src="${imagenSRC}"/>`;
	q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', nodoHTML);
	clearInterval(intervaloSlider);
	intervaloCambiarImagenes();
}
function desplazarIzquierda(){
	if(indexImagenActiva == 0){
		indexImagenActiva = (arrayImagenes.length-1);
	}else{
		indexImagenActiva--;
	}
	//movemos las imagenes
	q('#imagen-central').style.transform = 'translateX(50%)';
	q('#imagen-izquierda').style.transform = 'translateX(-50%)';
	//eliminamos la derecha
	q('#imagen-derecha').remove();
	//cambiamos las ids
	q('#imagen-central').id = 'imagen-derecha';
	q('#imagen-izquierda').id = 'imagen-central';
	//metemos la nueva derecha
	let imagenSRC = arrayImagenes[indexImagenActiva],
	nodoHTML = `<img id="imagen-izquierda" src="${imagenSRC}"/>`;
	q('#contenedor-imagenes-slider').insertAdjacentHTML('beforeend', nodoHTML);
	clearInterval(intervaloSlider);
	intervaloCambiarImagenes();
};
function intervaloCambiarImagenes(){
	intervaloSlider = setInterval(desplazarDerecha, 4000);
}

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
q('#flecha-derecha-slider').addEventListener('click', desplazarDerecha);
q('#flecha-izquierda-slider').addEventListener('click', desplazarIzquierda);
/*Fin slider principal*/