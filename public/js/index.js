let objetoImagenes = {};
let productosMasVendidos = {};
let indexImagenActiva = '';
let indexProductosVendidos = '';
let intervaloSlider;
let intervaloMiniSlider;

window.addEventListener('load', () => {
	httpGet('/api/get-slider', (result) => {
		colocarImagenesSlider(result);
	});
	httpGet('/api/get-mas-vendidos', (results) => {
		let resultados = JSON.parse(results);
		colocarMasVendidos(resultados, 0);
	});
});
/*

MAIN SLIDER

*/
//Para colocar las imagenes pasandole el nombre en json
function colocarImagenesSlider(jsonData){
	objetoImagenes = JSON.parse(jsonData);
	let contenedorImagenes = q('#contenedor-imagenes-slider');
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
/*

MINISLIDERS

*/
//Para colocar el dom de los productos mas vendidos
function colocarMasVendidos(data, index){
	productosMasVendidos = data;
	let productoHtml = '';
	let producto = productosMasVendidos[index];
	indexProductosVendidos = index;
	if(producto.categoria == 'Default'){
		productoHtml = '<div id="contenedor-producto-minislider">'
			+'<img class="imagen-minislider" src="../public-uploads/'
			+producto.imagenes[1]+'"><h4>'
			+producto.titulo+'</h4><span class="precio-minislider">'
			+producto.precio+'€</span></div>';
	}else{
		productoHtml = '<div id="contenedor-producto-minislider">'
			+'<img class="imagen-minislider" src="../public-uploads/'
			+producto.imagenes[1]+'"><h4>'
			+producto.titulo+'</h4><span class="precio-minislider">'
			+producto.precio+'€</span><span class="categoria-minislider">'
			+producto.categoria+'</span></div>';
	}
	if(q('#contenedor-producto-minislider') != undefined || q('#contenedor-producto-minislider') != null){
		q('#contenedor-producto-minislider').remove();
	}
	q('#contenedor-minislider-vendidos').insertAdjacentHTML('beforeend', productoHtml);
	// iniciarIntervaloMiniSlider();
};
function flechaDerechaMiniSlider(){
	let tamañoProductosVendidos = Object.keys(productosMasVendidos).length;
	if(indexProductosVendidos >= tamañoProductosVendidos-1){
		indexProductosVendidos = 0;
	}else{
		indexProductosVendidos++;
	}
	colocarMasVendidos(productosMasVendidos, indexProductosVendidos);
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSlider);
	iniciarIntervaloMiniSlider();
};
function flechaIzquierdaMiniSlider(){
	let tamañoProductosVendidos = Object.keys(productosMasVendidos).length;
	if(indexProductosVendidos <= 0){
		indexProductosVendidos = tamañoProductosVendidos-1;
	}else{
		indexProductosVendidos--;
	}
	colocarMasVendidos(productosMasVendidos, indexProductosVendidos);
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSlider);
	iniciarIntervaloMiniSlider();
};
function iniciarIntervaloMiniSlider(){
	intervaloMiniSlider = setInterval(flechaDerechaMiniSlider, 4000);
};

q('#flecha-izquierda-slider').addEventListener('click', cambiarImagenIzquierda);
q('#flecha-derecha-slider').addEventListener('click', cambiarImagenDerecha);
q('.flecha-izquierda-minislider').addEventListener('click', flechaIzquierdaMiniSlider);
q('.flecha-derecha-minislider').addEventListener('click', flechaDerechaMiniSlider);