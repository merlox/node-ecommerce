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
	httpGet('/api/get-single-product/'+productPermalink, (response) => {
		response = JSON.parse(response);
		if(response.error){
			let mensajeErrorHTML = `${response.error}. Puedes publicar las imágenes de nuevo.<br/>
		    	<button onclick="q('.mensaje-error-subida').style.display = 'none'">Vale</button>`;
		    q('.mensaje-error-subida').style.display = 'block';
		    q('.mensaje-error-subida').innerHTML = mensajeErrorHTML;
		}
		if(response.product){
			let fullProduct = response.product;
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
		}
	});
}
function borrarProducto(productPermalink){
	httpGet('/api/borrar-producto/'+productPermalink, (success) => {
		//Funcion de upload.js
		resetAllProductData();
		id('contenedor-productos').innerHTML = '';
		crearCajasProductos();
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
	httpGet(url, (response) => {
		response = JSON.parse(response);
		//Mostramos el error pero seguimos mostrando los productos, no queremos que deje de funcionar la app
		if(response.error){
			id('contenedor-productos').innerHTML = 
				`<p class="no-products-found">${response.error}</p>`;
		}
		if(response.results){
			let arrayProductos = response.results;
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
				`<p class="no-products-found">${response.error}</p>`;
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
//Para importar muchos productos con csv
function crearJSONCSV(file, cb){
	let productos = []; //Array de objetos con cada producto
	if(file.type.match(/application\/vnd.ms-excel/)){
		let reader = new FileReader(); //Creamos file reader
		reader.readAsText(file); //Leemos el csv as text
		reader.addEventListener('load', () => {
			let lineas = reader.result.split('\n');
			let arrayPermalinks = []; //Para comprobar que no se repitan permalinks en todo el csv
			let counter = 0;
			//Ignoramos la primera líneas[0] porque es la descriptiva sin valores
			for(let i = 1; i < lineas.length; i++){
				let celdas = lineas[i].split(';');
				let productoObject = {
					'titulo': null,
					'permalink': null,
					'precio': null,
					'descripcion': null,
					'categoria': null,
					'atributos': {}, // atributos = {'attr1': [1,2,3], 'attr2': ['a', 'b']}
					'imagenes': {}, // imagenes = {1: 'imagen.jpg', 2: 'imagens2.jpg'} Se envían vacías
					'publicado': false
				};
				let permalinkInsertado = false;
				let counterCalculado = false;
				if(celdas.length > 1){
					productoObject.titulo = celdas[0];
					productoObject.precio = parseFloat(celdas[1].replace(',', '.'));
					productoObject.descripcion = celdas[3];
					productoObject.categoria = celdas[4];
					//Imágenes en la celda 7
					let objetoImagenes = {};
					let imagenes = celdas[7].split(',');
					if(imagenes.length > 1){
						for (let v = 0; v < imagenes.length; v++) {
							let img = imagenes[v];
							objetoImagenes[v+1] = img.trim();
						}
					}
					productoObject.imagenes = objetoImagenes;
					//Del permalink.js
					let permalink = replaceBadCharacters(productoObject.titulo);
					checkPermalinkState(permalink, estaDisponible => { //True si está disponible.
						if(!estaDisponible) permalink = generarPermalinkUnico(permalink);
						//Comprobamos que no esté repetido el mismo permalink en los productos que vamos a subir
						for (let z = 0; z < arrayPermalinks.length; z++) {
							if(permalink === arrayPermalinks[z]){
								permalink = generarPermalinkUnico(permalink);
							}
						}

						productoObject.permalink = permalink;
						if(!permalinkInsertado){ //Insertar una vez por linea
							arrayPermalinks.push(permalink);
							permalinkInsertado = true;
						}

						//Atributo
						let keyAtributos = celdas[5].split(','); //Split devuelve 1 resultado si no hay coma
						let valoresAtributos = celdas[6].split(',');
						if(keyAtributos[0] != ''){ //Si hay atributos recorremos todos los atributos
							for(let x = 0; x < keyAtributos.length; x++){
								let valoresAtributoSeleccionado = valoresAtributos[x].split('|');
								valoresAtributoSeleccionado = valoresAtributoSeleccionado.map(e => {
									return e.trim();
								});
								productoObject.atributos[keyAtributos[x].trim()] = valoresAtributoSeleccionado;
							}
						}
						if(!counterCalculado) {
							counter++;
							counterCalculado = true;
						}
						productos.push(productoObject);
						//lineas length - 1 porque la primera es la descripción de cada columna
						//Si es la última celda de la última fila devolver el callback
						if(counter >= lineas.length-1) //Si se han completado todas las líneas
							done();
					});
				}else{
					counter++;
					if(counter >= lineas.length-1) //Si se han completado todas las líneas
						done();
				}
			}
		});
	}else{
		console.log('El archivo no es un csv, comprueba que sea csv');
		let mensajeErrorHTML = `El archivo no es csv, comprueba que sea csv.<br/>
	    	<button onclick="q('.mensaje-error-subida').style.display = 'none'">Vale</button>`;
	    q('.mensaje-error-subida').style.display = 'block';
	    q('.mensaje-error-subida').innerHTML = mensajeErrorHTML;
	}
	let callbackCalled = false;
	function done(){
		if(!callbackCalled){
			callbackCalled = true;
			return cb(productos);
		}
	};
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
	crearPaginacion();
	crearCajasProductos();
});
q('#button-importar-csv:not([disabled])').addEventListener('click', () => {
	q('#button-importar-csv').setAttribute('disabled', 'disabled');
	crearJSONCSV(q('input[name=importar-csv-productos]').files[0], json => {
		q('#button-importar-csv').removeAttribute('disabled');

		httpPost('/api/subir-productos-csv', json, err => {
			if(err) {
				let mensajeErrorHTML = `${err}<br/>
			    	<button onclick="q('.mensaje-error-subida').style.display = 'none'">Vale</button>`;
			    q('.mensaje-error-subida').style.display = 'block';
			    q('.mensaje-error-subida').innerHTML = mensajeErrorHTML;
			}else{
				let success = `<p class="success-mensaje">Los productos se han publicado correctamente<p>`;
				q('#contenedor-importar-productos').insertAdjacentHTML('afterend', success);
				crearPaginacion();
				crearCajasProductos();
			}
		});
	});
});