let objetoImagenes = {},
	productosMasVendidos = {},
	productosMasPopulares = {},
	productosRecomendados = {},
	indexImagenActiva = '',
	indexProductosVendidos = '',
	indexProductosPopulares = '',
	indexProductosRecomendados = '',
	intervaloSlider,
	intervaloMiniSliderVendidos,
	intervaloMiniSliderPopulares,
	intervaloMiniSliderRecomendados;

window.addEventListener('load', () => {
	httpGet('/api/get-slider', (result) => {
		colocarImagenesSlider(result);
		intervaloCambiarImagenes();
	});
	httpGet('/api/get-mas-vendidos', (results) => {
		let resultados = JSON.parse(results);
		colocarMasVendidos(resultados, 0);
		iniciarIntervaloMiniSliderVendidos();
	});
	httpGet('/api/get-mas-populares', (results) => {
		let resultados = JSON.parse(results);
		colocarMasPopulares(resultados, 0);
		iniciarIntervaloMiniSliderPopulares();
	});
	httpGet('/api/get-recomendados', (results) => {
		let resultados = JSON.parse(results);
		colocarRecomendados(resultados, 0);
		iniciarIntervaloMiniSliderRecomendados();
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
	indexImagenActiva = 1;
	contenedorImagenes.insertAdjacentHTML('beforeend', 
		'<img id="imagen-slider" src="../public-uploads/'+objetoImagenes[1]+'">');
	q('#imagen-slider').addEventListener('load', (e) => {
		e.target.style.marginLeft = -e.target.width/2+"px";
		e.target.style.left = "50%";
	});
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
function colocarMasVendidos(data, index){
	productosMasVendidos = data;
	let productoHtml = '';
	let producto = productosMasVendidos[index];
	indexProductosVendidos = index;
	let tituloOriginal = producto.titulo;
	let tituloCorto = '';
	if(producto.titulo.length > 70){
		tituloCorto = producto.titulo.substring(0, 70);
		tituloCorto += '...';
	}else{
		tituloCorto = producto.titulo;
	}
	if(producto.categoria == 'Default'){
		productoHtml = '<a class="producto-link" href="http://192.168.1.100:8000/p/'
			+producto.permalink
			+'"><div id="contenedor-producto-minislider-vendidos">'
			+'<img class="imagen-minislider" src="../public-uploads/'
			+producto.imagenes[1]+'"><h3 title="'+tituloOriginal+'">'
			+tituloCorto+'</h3><span class="precio-minislider"> '
			+producto.precio+'€</span></div></a>';
	}else{
		productoHtml = '<a class="producto-link" href="http://192.168.1.100:8000/p/'
			+producto.permalink
			+'"><div id="contenedor-producto-minislider-vendidos">'
			+'<img class="imagen-minislider" src="../public-uploads/'
			+producto.imagenes[1]+'"><h3 title="'+tituloOriginal+'">'
			+tituloCorto+'</h3><span class="precio-minislider">'
			+producto.precio+'€</span><span class="categoria-minislider"> '
			+producto.categoria+'</span></div></a>';
	}
	if(q('#contenedor-producto-minislider-vendidos') != undefined || q('#contenedor-producto-minislider-vendidos') != null){
		q('#contenedor-producto-minislider-vendidos').remove();
	}
	q('#contenedor-minislider-vendidos').insertAdjacentHTML('beforeend', productoHtml);
};
function colocarMasPopulares(data, index){
	productosMasPopulares = data;
	let productoHtml = '';
	let producto = productosMasPopulares[index];
	indexProductosPopulares = index;
	let tituloOriginal = producto.titulo;
	let tituloCorto = '';
	if(producto.titulo.length > 70){
		tituloCorto = producto.titulo.substring(0, 70);
		tituloCorto += '...';
	}else{
		tituloCorto = producto.titulo;
	}
	if(producto.categoria == 'Default'){
		productoHtml = '<a class="producto-link" href="http://192.168.1.100:8000/p/'
			+producto.permalink
			+'"><div id="contenedor-producto-minislider-populares">'
			+'<img class="imagen-minislider" src="../public-uploads/'
			+producto.imagenes[1]+'"><h3 title="'+tituloOriginal+'">'
			+tituloCorto+'</h3><span class="precio-minislider"> '
			+producto.precio+'€</span></div></a>';
	}else{
		productoHtml = '<a class="producto-link" href="http://192.168.1.100:8000/p/'
			+producto.permalink
			+'"><div id="contenedor-producto-minislider-populares">'
			+'<img class="imagen-minislider" src="../public-uploads/'
			+producto.imagenes[1]+'"><h3 title="'+tituloOriginal+'">'
			+tituloCorto+'</h3><span class="precio-minislider">'
			+producto.precio+'€</span><span class="categoria-minislider"> '
			+producto.categoria+'</span></div></a>';
	}
	if(q('#contenedor-producto-minislider-populares') != undefined || q('#contenedor-producto-minislider-populares') != null){
		q('#contenedor-producto-minislider-populares').remove();
	}
	q('#contenedor-minislider-populares').insertAdjacentHTML('beforeend', productoHtml);
};
function flechaDerechaMiniSliderVendidos(){
	let tamañoProductos = Object.keys(productosMasVendidos).length;
	if(indexProductosVendidos >= tamañoProductos-1){
		indexProductosVendidos = 0;
	}else{
		indexProductosVendidos++;
	}
	colocarMasVendidos(productosMasVendidos, indexProductosVendidos);
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSliderVendidos);
	iniciarIntervaloMiniSliderVendidos();
};
function flechaIzquierdaMiniSliderVendidos(){
	let tamañoProductos = Object.keys(productosMasVendidos).length;
	if(indexProductosVendidos <= 0){
		indexProductosVendidos = tamañoProductos-1;
	}else{
		indexProductosVendidos--;
	}
	colocarMasVendidos(productosMasVendidos, indexProductosVendidos);
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSliderVendidos);
	iniciarIntervaloMiniSliderVendidos();
};
function colocarRecomendados(data, index){
	productosRecomendados = data;
	let productoHtml = '';
	let producto = productosRecomendados[index];
	indexProductosRecomendados = index;
	let tituloOriginal = producto.titulo;
	let tituloCorto = '';
	if(producto.titulo.length > 70){
		tituloCorto = producto.titulo.substring(0, 70);
		tituloCorto += '...';
	}else{
		tituloCorto = producto.titulo;
	}
	if(producto.categoria == 'Default'){
		productoHtml = '<a class="producto-link" href="http://192.168.1.100:8000/p/'
			+producto.permalink
			+'"><div id="contenedor-producto-minislider-recomendados">'
			+'<img class="imagen-minislider" src="../public-uploads/'
			+producto.imagenes[1]+'"><h3 title="'+tituloOriginal+'">'
			+tituloCorto+'</h3><span class="precio-minislider"> '
			+producto.precio+'€</span></div></a>';
	}else{
		productoHtml = '<a class="producto-link" href="http://192.168.1.100:8000/p/'
			+producto.permalink
			+'"><div id="contenedor-producto-minislider-recomendados">'
			+'<img class="imagen-minislider" src="../public-uploads/'
			+producto.imagenes[1]+'"><h3 title="'+tituloOriginal+'">'
			+tituloCorto+'</h3><span class="precio-minislider">'
			+producto.precio+'€</span><span class="categoria-minislider"> '
			+producto.categoria+'</span></div></a>';
	}
	if(q('#contenedor-producto-minislider-recomendados') != undefined || q('#contenedor-producto-minislider-recomendados') != null){
		q('#contenedor-producto-minislider-recomendados').remove();
	}
	q('#contenedor-minislider-recomendados').insertAdjacentHTML('beforeend', productoHtml);
};
function flechaDerechaMiniSliderRecomendados(){
	let tamañoProductos = Object.keys(productosRecomendados).length;
	if(indexProductosRecomendados >= tamañoProductos-1){
		indexProductosRecomendados = 0;
	}else{
		indexProductosRecomendados++;
	}
	colocarRecomendados(productosRecomendados, indexProductosRecomendados);
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSliderRecomendados);
	iniciarIntervaloMiniSliderRecomendados();
};
function flechaIzquierdaMiniSliderRecomendados(){
	let tamañoProductos = Object.keys(productosRecomendados).length;
	if(indexProductosRecomendados <= 0){
		indexProductosRecomendados = tamañoProductos-1;
	}else{
		indexProductosRecomendados--;
	}
	colocarRecomendados(productosRecomendados, indexProductosRecomendados);
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSliderRecomendados);
	iniciarIntervaloMiniSliderRecomendados();
};
function flechaDerechaMiniSliderPopulares(){
	let tamañoProductos = Object.keys(productosMasPopulares).length;
	if(indexProductosPopulares >= tamañoProductos-1){
		indexProductosPopulares = 0;
	}else{
		indexProductosPopulares++;
	}
	colocarMasPopulares(productosMasPopulares, indexProductosPopulares);
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSliderPopulares);
	iniciarIntervaloMiniSliderPopulares();
};
function flechaIzquierdaMiniSliderPopulares(){
	let tamañoProductos = Object.keys(productosMasVendidos).length;
	if(indexProductosPopulares <= 0){
		indexProductosPopulares = tamañoProductos-1;
	}else{
		indexProductosPopulares--;
	}
	colocarMasPopulares(productosMasPopulares, indexProductosPopulares);
	//Reseteamos el intervalo si el usuario hace click
	clearInterval(intervaloMiniSliderPopulares);
	iniciarIntervaloMiniSliderPopulares();
};
function iniciarIntervaloMiniSliderVendidos(){
	let timer = 4000*Math.random();
	timer = timer < 1000 ? timer + 1000 : timer;
	intervaloMiniSliderVendidos = setInterval(flechaDerechaMiniSliderVendidos, timer);
};
function iniciarIntervaloMiniSliderPopulares(){
	let timer = 4000*Math.random();
	timer = timer < 1000 ? timer + 1000 : timer;
	intervaloMiniSliderPopulares = setInterval(flechaDerechaMiniSliderPopulares, timer);
};
function iniciarIntervaloMiniSliderRecomendados(){
	let timer = 4000*Math.random();
	timer = timer < 1000 ? timer + 1000 : timer;
	intervaloMiniSliderRecomendados = setInterval(flechaDerechaMiniSliderRecomendados, timer);
};

q('#flecha-izquierda-slider').addEventListener('click', cambiarImagenIzquierda);
q('#flecha-derecha-slider').addEventListener('click', cambiarImagenDerecha);
qAll('.flecha-izquierda-minislider').forEach((flechaIzq) => {
	flechaIzq.addEventListener('click', (e) => {	
		if(e.target.parentNode.id == 'contenedor-minislider-vendidos'){
			flechaIzquierdaMiniSliderVendidos();
		}else if(e.target.parentNode.id == 'contenedor-minislider-populares'){
			flechaIzquierdaMiniSliderPopulares();
		}else if(e.target.parentNode.id == 'contenedor-minislider-recomendados'){
			flechaIzquierdaMiniSliderRecomendados();
		}
	});
});
qAll('.flecha-derecha-minislider').forEach((flechaDer) => {
	flechaDer.addEventListener('click', (e) => {
		if(e.target.parentNode.id == 'contenedor-minislider-vendidos'){
			flechaDerechaMiniSliderVendidos();
		}else if(e.target.parentNode.id == 'contenedor-minislider-populares'){
			flechaDerechaMiniSliderPopulares();
		}else if(e.target.parentNode.id == 'contenedor-minislider-recomendados'){
			flechaDerechaMiniSliderRecomendados();
		}
	});
});
