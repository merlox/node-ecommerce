let domainName = '192.168.1.100:8000';
let isMenuVisible = true;
let isMenuResponsive = false;

//Al tener una pantalla de 1000 o menos, ocultar el menú si no lo estuviese ya y añadirle nueva funcionalidad
window.addEventListener('resize', () => {
	if(window.innerWidth <= 1000){
		isMenuResponsive = true;
		ocultarMenu();
	}else{
		isMenuResponsive = false;
		mostrarMenu();
	}
});

window.onload = () => {
	if(window.innerWidth <= 1000){
		isMenuResponsive = true;
	}else{
		isMenuResponsive = false;
	}
};

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

function ocultarMenu(){
	isMenuVisible = false;
 	id('seccion-preview').className = 'animar-menu-oculto';
	id('overlay-black').style.display = 'none';
	id('seccion-productos').className = 'ocultar-menu';
}

function id(id){
	return document.getElementById(id);
}

function httpGet(url, cb){
	//If no callback is provided in the function calling, ignore the callback
	if(cb == undefined){
		cb = () => {};	
	}
	let request = new XMLHttpRequest();
	request.open('GET', url);
	request.onreadystatechange = () => {
      if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status <= 300){
		return cb(request.responseText);      
      }else if(request.readyState == XMLHttpRequest.DONE){
      	return cb(null);
      }
	}	
	request.send();
}

//El estado de publicado o borrador se establece con los botones de "Guardar borrador" y "Publicar producto"
//de modo que si quieres quitar un producto publicado le das a guardar borrador.

//TODO poner los datos del producto para editarlo
function loadFullProduct(productPermalink){
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
//TODO this
function borrarProducto(productPermalink){
	httpGet('/api/borrar-producto/'+productPermalink, (success) => {
		if(success){
			//Funcion de upload.js
			resetAllProductData();
			id('contenedor-productos').innerHTML = '';
			crearCajasProductos();
		}
	});
}

//Funcion para filtrar los objetos por categoria para ver solo los que pertenezcan a dicha categoria
function filtrarVistaCategoria(e){
	e = e.target;
	let permalinks = document.getElementsByClassName('categoria-producto-unico');
	for(let i = 0; i < permalinks.length; i++){
		if(permalinks[i].innerHTML != e.innerHTML && permalinks[i].innerHTML != e.innerHTML+' (Borrador)'){
			document.getElementsByClassName('contenedor-producto')[i].style.display = 'none';
		}else{
			document.getElementsByClassName('contenedor-producto')[i].style.display = 'flex';
		}
	}
}

//Función para quitar los filtros de vista por categoria y ver todos los productos en orden
function quitarFiltroVistaCategoria(){
	let cajasProductos = document.getElementsByClassName('contenedor-producto');
	for(let i = 0; i < cajasProductos.length; i++){
		document.getElementsByClassName('contenedor-producto')[i].style.display = 'flex';
	}
}

//Funcion para crear el dom del objeto atributos pasandole el objeto.
function mostrarObjetoAtributos(objetoAtributos){
	let indexAtributo = 0;

	id('lista-atributos').innerHTML = '';

	for(let keyArrayAtributo in objetoAtributos){
		//Mostrar atributo. Función del atributo.js para crear el nodo en el DOM.
		crearNuevoAtributo(keyArrayAtributo);
		for(let i = 0; i < objetoAtributos[keyArrayAtributo].length; i++){
			//Mostrar cada valor del atributo. La funcion es del atributo.js y sirve para crear el dom de cada valor.
			insertAtributoValor(indexAtributo, objetoAtributos[keyArrayAtributo][i], keyArrayAtributo);
		}
		indexAtributo++;
	}
}
//Para generar las cajas de productos
function crearCajasProductos(){
	resetAllProductData();
	httpGet('/api/get-all-products/', (results) => {
		results = JSON.parse(results);
		if(results != false){
			let arrayProductos = results;
			for(let i = 0; i < arrayProductos.length; i++){
				let objetoProducto = arrayProductos[i];
				let tituloProducto = objetoProducto.titulo;
				let addEspacioTitulo = '';
				if(objetoProducto.titulo.length > 54){
					objetoProducto.titulo = objetoProducto.titulo.substring(0, 55);
					objetoProducto.titulo += "...";
				}else{
					addEspacioTitulo = '<br />';
				}
				let permalinkATexto = "'"+objetoProducto.permalink+"'";
				let htmlProducto;
				if(objetoProducto.publicado == 'no'){
					htmlProducto = '<div class="contenedor-producto borrador">'
						+'<img class="imagen-producto" src="../public-uploads/'+objetoProducto.imagenes[1]+'"/>'
						+'<div class="contenedor-producto-informacion"><span title="'+tituloProducto+'" style="display:inline-block;">'+objetoProducto.titulo+'</span>'
						+addEspacioTitulo+'<p class="categoria-producto-unico">'+objetoProducto.categoria+' (Borrador)</p>'
						+'<div class="contenedor-enlaces-producto"><a target="_blank" href="http://'+domainName+'/p/'+objetoProducto.permalink+'"> Ver </a>'
						+'<a href="javascript:void(0)" onclick="loadFullProduct('+permalinkATexto+')"> Editar </a>'
						+'<a href="javascript:void(0)" onclick="borrarProducto('+permalinkATexto+')"> Borrar </a>'
						+'</div></div><input type="hidden" value="'+objetoProducto.permalink+'"/></div>';
				}else{
					htmlProducto = '<div class="contenedor-producto">'
						+'<img class="imagen-producto" src="../public-uploads/'+objetoProducto.imagenes[1]+'"/>'
						+'<div class="contenedor-producto-informacion"><span title="'+tituloProducto+'" style="display:inline-block;">'+objetoProducto.titulo+'</span>'
						+addEspacioTitulo+'<p class="categoria-producto-unico">'+objetoProducto.categoria+'</p>'
						+'<div class="contenedor-enlaces-producto"><a target="_blank" href="http://'+domainName+'/p/'+objetoProducto.permalink+'"> Ver </a>'
						+'<a href="javascript:void(0)" onclick="loadFullProduct('+permalinkATexto+')"> Editar </a>'
						+'<a href="javascript:void(0)" onclick="borrarProducto('+permalinkATexto+')"> Borrar </a>'
						+'</div></div><input type="hidden" value="'+objetoProducto.permalink+'"/></div>';
				}

				id('contenedor-productos').insertAdjacentHTML('beforeend', htmlProducto);
			}
		}else{
			id('contenedor-productos').innerHTML = 
				'<p class="no-products-found">No hay productos para mostrar.</p>';
		}
	});
}

//Animar el seccion preview para añadir un nuevo producto
id('button-nuevo-producto').addEventListener('click', () => {
	crearCajasProductos();
	if(isMenuResponsive){
		ocultarMenu();
		id('seccion-preview').className = 'animar-menu-oculto';
	}else{
		id('seccion-preview').className = 'animar-menu-visible';
	}

});

id('contenedor-categorias').addEventListener('change', (e) => {
	if(e.target.selectedIndex == 0){
		quitarFiltroVistaCategoria();
	}else{
		filtrarVistaCategoria(e);
	}
});

id('contenedor-burger').addEventListener('click', () => {
	toggleMenu();
});

id('overlay-black').addEventListener('click', () => {
	ocultarMenu();
});

crearCajasProductos();