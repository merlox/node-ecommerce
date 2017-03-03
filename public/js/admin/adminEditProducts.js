'use strict';
let isMenuVisible = true,
	isMenuResponsive = false,
	productosPorPagina = 50,
	filtroCategoria = null;
//Para no mostrar el preview productos al hacer resize de la pantalla onload
let esperarInteraccionMenu = true;

window.addEventListener('load', () => {
	crearPaginacion();
	crearCajasProductos();
	if(window.innerWidth <= 1000){
		isMenuResponsive = true;
	}else{
		isMenuResponsive = false;
	}
});

//Al tener una pantalla de 1000 o menos, ocultar el menú si no lo estuviese ya y añadirle nueva funcionalidad
window.addEventListener('resize', () => {
	if(!esperarInteraccionMenu){
		if(window.innerWidth <= 1000){
			isMenuResponsive = true;
			ocultarMenu();
		}else{
			isMenuResponsive = false;
			mostrarMenu();
		}
	}
});

function toggleMenu(){
	if(isMenuVisible){
		ocultarMenu();
	}else{
		mostrarMenu(); 
	}
}
//Dependiendo del tamaño de la pantalla, mostrará un tipo u otro de overlay
function mostrarMenu(){
	isMenuVisible = true;
	id('seccion-productos').className = '';
	id('seccion-preview').className = 'animar-menu-visible';
	if(isMenuResponsive){
	 	id('overlay-black').style.display = 'block';
	 	id('seccion-productos').className = 'sombra-seccion-productos';
	 	id('seccion-preview').className = 'animar-menu-oculto';
	}else{
		id('seccion-preview').className = 'animar-menu-visible';
	}
}
//Para ocultar el menú de la izquierda
function ocultarMenu(){
	isMenuVisible = false;
 	id('seccion-preview').className = 'animar-menu-oculto';
	id('overlay-black').style.display = 'none';
	id('seccion-productos').className = 'ocultar-menu';
}
//El estado de publicado o borrador se establece con los botones de "Guardar borrador" y "Publicar producto"
//de modo que si quieres quitar un producto publicado le das a guardar borrador.
function loadFullProduct(productPermalink){
	esperarInteraccionMenu = false;
	if(isMenuResponsive){
		ocultarMenu();
	}else{
		mostrarMenu();
	}
	objetoAtributos = {};
	httpGet('/api/get-single-product/'+productPermalink, (fullProduct) => {
		fullProduct = JSON.parse(fullProduct);
		id('producto-title').value = fullProduct.titulo;
		id('producto-precio').value = fullProduct.precio;
		id('permalink').value = fullProduct.permalink;
		id('producto-descripcion').value = fullProduct.descripcion;

		imagenesProducto = fullProduct.imagenes;
		//Borramos los selected. Comprobamos si el <option> ya existe o no. En caso de que si, selecionalo.
		let opcionesDelSelect = document.getElementsByTagName('option');
		let anadirCategoriaOriginalProducto = true;
		for(let i = 0; i < opcionesDelSelect.length; i++){
			if(opcionesDelSelect[i].hasAttribute('selected')){
				opcionesDelSelect[i].removeAttribute('selected');
			}
		}
		for(let i = 0; i < opcionesDelSelect.length; i++){
			if(opcionesDelSelect[i].innerHTML == fullProduct.categoria){
				opcionesDelSelect[i].setAttribute("selected", "selected");
				anadirCategoriaOriginalProducto = false;
			}
		}
		if(anadirCategoriaOriginalProducto){
			id('producto-categorias').insertAdjacentHTML('afterbegin', '<option selected="selected">'+fullProduct.categoria+'</option>');
		}
		//Crear el dom de los atributos
		mostrarObjetoAtributos(fullProduct.atributos);

		//Funcion del upload.js para mostrar las imagenes en el DOM
		mostrarImagenesCliente(fullProduct.imagenes);
	});
}
function borrarProducto(productPermalink){
	httpGet('/api/borrar-producto/'+productPermalink, (success) => {
		if(success){
			//Funcion de upload.js
			resetAllProductData();
			id('contenedor-productos').innerHTML = '';
			crearCajasProductos();
		}
	});
};
//Funcion para crear el dom del widget atributos pasandole el objeto.
function mostrarObjetoAtributos(objetoAtributos){
	let indexAtributo = 0;
	id('lista-atributos').innerHTML = '';
	/*
	objetoAtributos = {
		'talla': arrayValores
	}
	*/
	for(let nombreAtributo in objetoAtributos){
		//Mostrar atributo. Función del atributo.js para crear el nodo en el DOM.
		crearNuevoAtributo(nombreAtributo, objetoAtributos[nombreAtributo], 'objeto');
	}
}
//Para generar las cajas de productos
function crearCajasProductos(page){
	if(!page){
		page = 1;
	}
	qAll('.paginador-productos').forEach((paginad) => {
		for(let i = 0; i < paginad.childNodes.length; i++){
			paginad.childNodes[i].className = '';
		}
		if(paginad.childNodes[page-1] != undefined){
			paginad.childNodes[page-1].className = 'active';
		}
	});
	let url = '';
	if(filtroCategoria){
		url = `/api/get-all-products/${productosPorPagina}?page=${page}&filtroCategoria=${filtroCategoria}`;
	}else{
		url = `/api/get-all-products/${productosPorPagina}?page=${page}`;
	}
	resetAllProductData(); // Función de upload.js
	httpGet(url, (results) => {
		results = JSON.parse(results);
		if(results != false){
			let arrayProductos = results;
			for(let i = 0; i < arrayProductos.length; i++){
				let objetoProducto = arrayProductos[i];
				let tituloProducto = objetoProducto.titulo;
				let addEspacioTitulo = '';
				if(objetoProducto.titulo.length >= 40){
					objetoProducto.titulo = objetoProducto.titulo.substring(0, 45);
					objetoProducto.titulo += "...";
				}else{
					addEspacioTitulo = '<br />';
				}
				let permalinkATexto = "'"+objetoProducto.permalink+"'";
				//Mostramos el aspecto de borrador a los no publicados
				let htmlProducto = `<div class="contenedor-producto ${objetoProducto.publicado ? '' : 'borrador'}">
					<img class="imagen-producto" src="../public-uploads/${objetoProducto.imagenes[1]}"/>
					<div class="contenedor-producto-informacion"><span title="${tituloProducto}" style="display:inline-block;">
					${objetoProducto.titulo}</span>${addEspacioTitulo}
					<span class="precio-producto">${objetoProducto.precio}€ </span>
					<span class="categoria-producto-unico">
					${objetoProducto.publicado ? objetoProducto.categoria : (objetoProducto.categoria+' (Borrador)')}</span>
					<div class="contenedor-enlaces-producto"><a target="_blank" href="/p/${objetoProducto.permalink}"> Ver </a>
					<a href="javascript:void(0)" onclick="loadFullProduct(${permalinkATexto})"> Editar </a>
					<a href="javascript:void(0)" onclick="borrarProducto(${permalinkATexto})"> Borrar </a>
					</div></div><input type="hidden" value="${objetoProducto.permalink}"/></div>`;
				id('contenedor-productos').insertAdjacentHTML('beforeend', htmlProducto);
			}
		}else{
			id('contenedor-productos').innerHTML = 
				'<p class="no-products-found">No hay productos para mostrar.</p>';
		}
	});
};
function crearPaginacion(){
	let paginador = document.querySelectorAll('.paginador-productos'),
		url = '';

	if(filtroCategoria)
		url = `/api/get-paginacion-admin-productos/${productosPorPagina}?filtroCategoria=${filtroCategoria}`;
	else
		url = `/api/get-paginacion-admin-productos/${productosPorPagina}`;

	httpGet(url, (paginas) => {
		paginas = JSON.parse(paginas).paginas;
		if(paginas != null){
			if(paginas > 1){
				paginador.forEach((paginado) => {
					paginado.style.display = 'flex';
					paginado.innerHTML = '';
				});
				for(let i = 1; i <= paginas; i++){
					let htmlPaginas = '';
					if(i == 1){
						htmlPaginas = '<li class="active" onclick="crearCajasProductos('+i+')">'+i+'</li>';
					}else{
						htmlPaginas = '<li onclick="crearCajasProductos('+i+')">'+i+'</li>';
					}
					if(i >= paginas){
						htmlPaginas = '<li onclick="crearCajasProductos('+i+')">'+i+'</li>';
					}
					paginador.forEach((paginado) => {
						paginado.insertAdjacentHTML('beforeend', htmlPaginas);
					});
				}
			}else{
				paginador.forEach((paginado) => {
					paginado.style.display = 'none';
				});
			}
		}else{
			paginador.forEach((paginado) => {
				paginado.style.display = 'none';
			});
		}
	});
};
//Animar el seccion preview para añadir un nuevo producto
id('button-nuevo-producto').addEventListener('click', () => {
	esperarInteraccionMenu = false;
	crearCajasProductos();
	if(isMenuResponsive){
		ocultarMenu();
		id('seccion-preview').className = 'animar-menu-oculto';
	}else{
		id('seccion-preview').className = 'animar-menu-visible';
	}
});
//Para filtrar los productos por categorías
id('contenedor-categorias').addEventListener('change', () => {
	//El innerHTML del <option> seleccionado. Ej: "cuadros" or "camisetas"
	if(id('contenedor-categorias').selectedIndex === 0)
		filtroCategoria = null;
	else
		filtroCategoria = qAll('#contenedor-categorias option')[id('contenedor-categorias').selectedIndex].innerHTML;
	crearCajasProductos();
	crearPaginacion();
});
id('contenedor-burger').addEventListener('click', () => {
	toggleMenu();
});
id('overlay-black').addEventListener('click', () => {
	ocultarMenu();
});
//Para filtrar la cantidad de productos a mostrar
id('limitar-productos').addEventListener('change', (e) => {
	//Establecemos los productos por pagina segun lo seleccionado
	productosPorPagina = parseInt(id('limitar-productos').children[e.target.selectedIndex].innerHTML);
	crearPaginacion()
	crearCajasProductos();
});