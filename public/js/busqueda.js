'use strict';

//Creamos las páginas totales
let paginasTotales = q('.paginacion').innerHTML;
q('.paginacion').innerHTML = '';
crearPaginacion();

//Para cargar la página clickada
function loadPage(i){
	filtrarPrecio(0, 0, i, false);
};
//Para crear la paginación e insertarla en los contenedores de paginación
function crearPaginacion(){
	let paginacionHtml = '';
	let paginaActual = getParameterByName('pag') ? parseInt(getParameterByName('pag')) : 1;
	for(let i = 1; i < paginasTotales; i++){
		if(paginaActual === i)
			paginacionHtml += `<span class="pagina-activa" onclick="loadPage(${i})">${i}</span>`;	
		else
			paginacionHtml += `<span onclick="loadPage(${i})">${i}</span>`;
	}
	qAll('.paginacion').forEach(paginacion => {
		paginacion.style.display = 'block';
		paginacion.innerHTML = paginacionHtml;
	});
};
let paginasTotalesFiltro = 0;
//Para filtrar los productos dado el rango de precios
function filtrarPrecio(min, max, pageActual, updatePages){
	let url = `/api/filter?q=${getParameterByName('q')}&pag=${pageActual}&preciomin=${min}&preciomax=${max}`;
	httpGet(url, (data) => {
		try{
			data = JSON.parse(data);
			let products = data.productos;
			let productsHtml = '';
			let header = q('#contenedor-principal').children[0].outerHTML;
			for(let i = 0; i < products.length; i++){
				let product = products[i];	
				productsHtml += `<div class="producto">
					<a href="/p/${product.permalink}"><img class="producto-imagen" src="../public-uploads/${product.imagen}" width="300px"></a>
					<span class="precio-producto">${product.precio}€</span>
					<a href="/p/${product.permalink}" class="titulo-producto">${product.titulo}</a>
					<span class="categoria-producto">${product.categoria}</span>
		    	</div>`;
		    }
		    productsHtml = header+productsHtml;
		   	q('#contenedor-principal').innerHTML = productsHtml;
			//Cambiamos el mensaje de mostrando resultados
			q('.mensaje-resultados').innerHTML = `Mostrando ${products.length} resultados.`;

			//Creamos la paginación
			if(updatePages) paginasTotalesFiltro = data.hayPaginas ? data.paginas : paginasTotalesFiltro;
			let paginasHtml = '';
			if(data.hayPaginas && updatePages){
				q('.paginacion').style.display = 'block';
				for(let i = 1; i <= paginasTotalesFiltro; i++) {
					if(i === pageActual) paginasHtml += `<span class="pagina-activa" onclick="filtrarPrecio(${min}, ${max}, ${i}, false)">${i}</span>`;
					else paginasHtml += `<span onclick="filtrarPrecio(${min}, ${max}, ${i}, false)">${i}</span>`;
				}
				q('.paginacion').innerHTML = paginasHtml;
			}else if(!data.hayPaginas && updatePages){
				q('.paginacion').style.display = 'none';
			}else{
				//El paginador se mantiene igual solo que cambia la pagina activa
				q('.paginacion .pagina-activa').className = '';
				q('.paginacion').children[pageActual-1].className = 'pagina-activa';
			}
		}catch(e){
			console.log('Error filtering products.');
		}
	});
};

/*

RESPONSIVE SIDEBAR FILTERS

*/
//Para ocultar y mostrar la sidebar
function ocultarSidebar(){
	q('.overlay').style.display = 'none';
	q('#sidebar').className = 'sidebar-hidden';
};
function mostrarSidebar(){
	q('.overlay').style.display = 'block';
	q('#sidebar').className = 'sidebar-active';
}
//Para hacer el sidebar responsive al cambiar el tamaño de la pantalla
function sidebarResponsive(){
	if(window.innerWidth <= 850) q('#sidebar').className = 'sidebar-hidden';
	else q('#sidebar').className = '';
}
q('#responsive-filters').addEventListener('click', e => {
	mostrarSidebar();
});
q('.overlay').addEventListener('click', () => {
	ocultarSidebar();
});
sidebarResponsive();
window.addEventListener('resize', () => {
	sidebarResponsive();
});
/*

FILTRO PRECIO

*/
//Para cuando selecionas un radio de filtro de precio
let radioActive = 0; //Ninguno seleccionado
qAll('input[name=precio]').forEach(radio => {
	radio.addEventListener('change', (e) => {
		//Si ha selecionado el mismo, deseleccionar todos
		if(radioActive == parseInt(e.target.value)){
			let elementos = qAll('input[name=precio]');
			for(let i = 0; i < elementos.length; i++){
				let input = elementos[i];
				input.checked = false;
			}
			radioActive = 0;		
		}else{
			radioActive = parseInt(e.target.value);
			let elementos = qAll('input[name=precio]');
			for(let i = 0; i < elementos.length; i++){
				let input = elementos[i];
				input.checked = false;
			}
			e.target.checked = true;
		}
		switch(radioActive){
			case 0:
				filtrarPrecio(0, 0, 1, true);
				break;
			case 1:
				filtrarPrecio(0, 10, 1, true);
				break;
			case 2:
				filtrarPrecio(10, 25, 1, true);
				break;
			case 3:
				filtrarPrecio(25, 40, 1, true);
				break;
			case 4:
				filtrarPrecio(40, 60, 1, true);
				break;
			case 5:
				filtrarPrecio(60, 90, 1, true);
				break;
		}
	});
});
//Para hacer click al radio del precio cuando haces click en su nombre
qAll('.filtro-precio a').forEach(a => {
	a.addEventListener('click', (e) => {
		e.target.parentNode.querySelector('input').click();
	});
});