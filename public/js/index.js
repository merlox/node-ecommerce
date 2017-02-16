'use strict';
//Variables Slider
let arrayImagenes = [],
	indexImagenActiva = 1,
	intervaloSlider;
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
	colocarImagenes();
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
q('#flecha-derecha-slider').addEventListener('click', desplazarDerecha);
q('#flecha-izquierda-slider').addEventListener('click', desplazarIzquierda);
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