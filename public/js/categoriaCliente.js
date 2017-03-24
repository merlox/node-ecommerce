'use strict';

let paginasTotalesFiltro = 0;
let hasCalculadoPaginasTotales = false;
let pageActual = 0;
let precioMin = 0;
let precioMax = Infinity;
let radioActive = 0; //Ninguno seleccionado

//Creamos las páginas totales
crearPaginacion();
sidebarResponsive();

//Para cargar la página clickada
function loadPage(i){
	filtrarPrecio(0, 0, i);
};

function crearPaginacion(){
	let paginacionHTML = '';

	paginasTotales = parseInt(q('.paginacion').innerHTML);
	if(paginasTotales > 1){
		for(let i = 0; i < paginasTotales; i++){
			if(i === 1)
				paginacionHTML += `<span class="pagina-activa" onclick="loadPage(${i})">${i}</span>`;
			else
				paginacionHtml += `<span onclick="loadPage(${i})">${i}</span>`;
		}
		qAll('.paginacion').forEach(paginacion => {
			paginacion.style.display = 'block';
			paginacion.innerHTML = paginacionHTML;
		});
	}
};

//Para filtrar los productos dado el rango de precios
function filtrarPrecio(min, max, pageActual){
	let url = `/api/filter-categoria?categoria=${window.location.pathname.substring(3)}&pag=${pageActual}&preciomin=${min}&preciomax=${max}`;
	let mensajeCargando = q('.mensaje-cargando');

	mensajeCargando.style.display = 'block';
	httpGet(url, (data) => {

		//Inicio - Generamos los productos
		let products = data.productos;
		let productsHtml = '';
		let header = q('#header-productos').outerHTML;
	    let paginacionFooter = '<div class="paginacion"></div>';
		mensajeCargando.style.display = 'none';
		data = JSON.parse(data);
		
		if(!products){
			q('.mensaje-resultados').innerHTML = 
				`No se han encontrado productos para ese rango de precios. Mostrando todos.`;
			return;
		}

		for(let i = 0; i < products.length; i++){
			let product = products[i];	
			productsHtml += `<div class="producto">
				<a href="/p/${product.permalink}"><img class="producto-imagen" src="../public-uploads/${product.imagen}" width="300px"></a>
				<span class="precio-producto">${parseFloat(product.precio).toFixed(2)}€</span>
				<a href="/p/${product.permalink}" class="titulo-producto">${product.titulo}</a>
				<a href="${product.categoria}" class="categoria-producto">${product.categoria}</a>
	    	</div>`;
	    }

	    productsHtml = mensajeCargando.outerHTML + header + productsHtml + paginacionFooter;
	   	q('#contenedor-principal').innerHTML = productsHtml;
	   	//Fin - Generamos los productos

	   	//Inicio - Creamos la paginación. Calculamos las páginas totales para ese filtro
		if(!hasCalculadoPaginasTotales){
			paginasTotalesFiltro = data.hayPaginas ? data.paginas : 0;
			hasCalculadoPaginasTotales = true;
		}
		//Cambiamos el mensaje de mostrando resultados
		if(paginasTotalesFiltro > 0){
			if(products.length === 1)
				q('.mensaje-resultados').innerHTML = `Mostrando 1 producto. Hay ${paginasTotalesFiltro} páginas.`;
			else
				q('.mensaje-resultados').innerHTML = `Mostrando ${products.length} productos. Hay ${paginasTotalesFiltro} páginas.`;
		}else{
			if(products.length === 1)
				q('.mensaje-resultados').innerHTML = `Mostrando 1 producto.`;
			else
				q('.mensaje-resultados').innerHTML = `Mostrando ${products.length} productos.`;
		}

		//Creamos el html del paginador
		crearPaginacion();
	});
};

/*

RESPONSIVE SIDEBAR FILTERS
Para ocultar y mostrar la sidebar

*/
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

/*

FILTRO PRECIO
Para cuando selecionas un radio de filtro de precio

*/
qAll('input[name=precio]').forEach(radio => {
	radio.addEventListener('change', (e) => {

		//Si ha selecionado el mismo, deseleccionar todos
		if(radioActive === parseInt(e.target.value)){
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

		hasCalculadoPaginasTotales = false;
		switch(radioActive){
			case 0:
				filtrarPrecio(0, 0, 1);
				break;
			case 1:
				filtrarPrecio(0, 10, 1);
				break;
			case 2:
				filtrarPrecio(10, 25, 1);
				break;
			case 3:
				filtrarPrecio(25, 40, 1);
				break;
			case 4:
				filtrarPrecio(40, 60, 1);
				break;
			case 5:
				filtrarPrecio(60, 90, 1);
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

q('#responsive-filters').addEventListener('click', e => {
	mostrarSidebar();
});

q('.overlay').addEventListener('click', () => {
	ocultarSidebar();
});

window.addEventListener('resize', () => {
	sidebarResponsive();
});