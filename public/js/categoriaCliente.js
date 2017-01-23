'use strict';

let paginasTotalesFiltro = 0,
	hasCalculadoPaginasTotales = false;

//Creamos las páginas totales
crearPaginacion();

//Para cargar la página clickada
function loadPage(i){
	filtrarPrecio(0, 0, i);
};
//Para crear la paginación e insertarla en los contenedores de paginación
function crearPaginacion(){
	let paginasTotales = parseInt(q('.paginacion').innerHTML);
	paginasTotalesFiltro = paginasTotales;
	hasCalculadoPaginasTotales = true;
	if(paginasTotales > 1){
		let paginacionHtml = '';
		q('.paginacion').innerHTML = '';

		if(paginasTotales > 1)
			q('.mensaje-resultados').innerHTML += ` Hay ${paginasTotales} páginas.`;

		paginacionHtml += `<span>Anterior</span> `;
		for(let i = 1; i <= (paginasTotales > 3 ? 3 : paginasTotales); i++){
			if(i === 1)
				paginacionHtml += `<span class="pagina-activa" onclick="loadPage(${i})">${i}</span>`;	
			else
				paginacionHtml += `<span onclick="loadPage(${i})">${i}</span>`;
		}
		if(paginasTotales > 3)
			paginacionHtml += `<span onclick="loadPage(${paginasTotales})">${paginasTotales}</span>`;
		paginacionHtml += ` <span onclick="loadPage(2)">Siguiente</span>`;

		qAll('.paginacion').forEach(paginacion => {
			paginacion.style.display = 'block';
			paginacion.innerHTML = paginacionHtml;
		});
	}
};
//Para filtrar los productos dado el rango de precios
function filtrarPrecio(min, max, pageActual){
	let url = `/api/filter?q=${getParameterByName('q')}&pag=${pageActual}&preciomin=${min}&preciomax=${max}`;
	let mensajeCargando = q('.mensaje-cargando');
	mensajeCargando.style.display = 'block';
	httpGet(url, (data) => {
		mensajeCargando.style.display = 'none';
		data = JSON.parse(data);
		//Inicio - Generamos los productos
		let products = data.productos;
		let productsHtml = '';
		let header = q('#header-productos').outerHTML;
		for(let i = 0; i < products.length; i++){
			let product = products[i];	
			productsHtml += `<div class="producto">
				<a href="/p/${product.permalink}"><img class="producto-imagen" src="../public-uploads/${product.imagen}" width="300px"></a>
				<span class="precio-producto">${product.precio}€</span>
				<a href="/p/${product.permalink}" class="titulo-producto">${product.titulo}</a>
				<a href="${product.categoria}" class="categoria-producto">${product.categoria}</a>
	    	</div>`;
	    }
	    let paginacionFooter = '<div class="paginacion"></div>';
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
		let paginasHtml = '';
		if(paginasTotalesFiltro > 0){
			//Quitamos la página activa
			q('.pagina-activa').className = '';
			//Calculamos cuántas páginas mostrar en esa vista
			let maxPaginasAMostrar = paginasTotalesFiltro;
			let paginaInicialAMostrar = 1;
			if(paginasTotalesFiltro > 3 && pageActual === 1)
				maxPaginasAMostrar = 3;
			else if(paginasTotalesFiltro > 3 && pageActual > 1 && pageActual !== paginasTotalesFiltro)
				maxPaginasAMostrar = (pageActual+1);
			else if(paginasTotalesFiltro > 3 && pageActual === paginasTotalesFiltro)
				maxPaginasAMostrar = pageActual;

			if(pageActual > 1 && pageActual === paginasTotalesFiltro && paginasTotalesFiltro >= 3)
				paginaInicialAMostrar = pageActual-2;
			else if(pageActual > 1)
				paginaInicialAMostrar = pageActual-1;
			//Creamos el botón de anterior
			if(pageActual > 1)
				paginasHtml += `<span onclick="filtrarPrecio(${min}, ${max}, ${pageActual-1})">Anterior</span> `;
			else
				paginasHtml += `<span>Anterior</span> `;

			//Creamos los 3 botones numéricos con las páginas a mostrar
			for(let i = paginaInicialAMostrar; i <= maxPaginasAMostrar; i++) {
				if(i === pageActual) paginasHtml += `<span class="pagina-activa" onclick="filtrarPrecio(${min}, ${max}, ${i})">${i}</span>`;
				else paginasHtml += `<span onclick="filtrarPrecio(${min}, ${max}, ${i})">${i}</span>`;
			}
			//Crear el botón de página final si hay más de 3 páginas y no se muestra ya la página final en el loop de antes
			if(paginasTotalesFiltro > 3 && pageActual < (paginasTotalesFiltro-1))
				paginasHtml += `<span onclick="filtrarPrecio(${min}, ${max}, ${paginasTotalesFiltro})">${paginasTotalesFiltro}</span>`;
			//Crear el botón de siguiente
			if(pageActual === paginasTotalesFiltro)
				paginasHtml += ` <span>Siguiente</span>`;
			else
				paginasHtml += ` <span onclick="filtrarPrecio(${min}, ${max}, ${pageActual+1})">Siguiente</span>`;
			//Insertamos el paginador creado
			qAll('.paginacion').forEach(paginacion => {
				paginacion.style.display = 'block';
				paginacion.innerHTML = paginasHtml;
			});
		}else{
			//Si no hay páginas no mostramos el paginador
			qAll('.paginacion').forEach(paginacion => {
				paginacion.style.display = 'none';
			});
		}
		//Fin - Creamos la paginación
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