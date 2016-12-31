'use strict';
//Onload get categories
window.addEventListener('load', () => {
	httpGet('/api/get-categories', (categories) => {
		if(categories && categories != '' && categories != undefined){
			categories = JSON.parse(categories);
			categories = categories.arrayCategorias;
			let htmlCategories = '';
			for(let i = 0; i < categories.length; i++){
				if(i == 0){
					htmlCategories = `<li onmouseenter="cambiarColorFlechaDepartamentos()"
						onmouseleave="cambiarColorFlechaDepartamentos()">
						<a href="http://192.168.1.100:8000/departamento/${categories[i]}">
						${categories[i]}</a>
					</li>`;
				}else{
					htmlCategories = `<li >
						<a href="http://192.168.1.100:8000/departamento/${categories[i]}">
						${categories[i]}</a>
					</li>`;
				}
				//Seleccionamos el 2º child porque el texto indentado se considera como un child
				q('#expandible-departamentos').children[0].insertAdjacentHTML('beforeend', htmlCategories);
			}
		}
	});
	httpGet('/api/get-logged-state', (state) => {
		if(state == 'logged'){
			q('#usuario').innerHTML = 'mi cuenta ▼<div class="triangulo-up"></div>';
			q('#usuario').href = '/micuenta';
		}else if(state == 'admin'){
			q('#usuario').innerHTML = 'admin ▼<div class="triangulo-up"></div>';
			q('#usuario').href = '/admin';
		}else{
			q('#usuario').innerHTML = 'iniciar sesión<div class="triangulo-up"></div>';
			q('#usuario').href = '/login';
		}
	});
	if(getParameterByName('searched')){
		httpPost('/api/guardar-busqueda', getParameterByName('searched'));
	}
});

window.addEventListener('resize', () => {
	if(q('.texto-item-busqueda') && (window.outerWidth-16) <= 800 && (window.outerWidth-16) >= 650){
		qAll('.texto-item-busqueda').forEach((e) => {
			e.innerHTML = e.innerHTML.substring(0, 30) + '...';
		});
	}
});

//Para ocultar o mostrar el menu de departamentos para ir a uno determinado
let isDepartamentosActive = false;
function ocultarMostrarDepartamentos(){
	//En pantallas pequeñas poner el dropdown dentro del menu
	if(window.innerWidth >= 650){
		if(!isDepartamentosActive) q('#expandible-departamentos').className = 'animar-mostrar-departamentos';
		else q('#expandible-departamentos').className = '';
	}else{
		if(!isDepartamentosActive) q('#expandible-departamentos').className = 'animar-mostrar-departamentos-responsive';
		else q('#expandible-departamentos').className = '';
	}
	isDepartamentosActive = !isDepartamentosActive;
};

//Para buscar productos y mostrar palabras sugeridas
function buscarProducto(keyword){
	if(keyword.length >= 3){
		keyword = encodeURIComponent(keyword);
		httpGet('/api/search/'+keyword+'?limite=8', (results) => {
			results = JSON.parse(results);
			q('#buscador-sugerencias').firstChild.innerHTML = '';
			if(results != null && results != undefined){
				q('#buscador-sugerencias').style.display = 'block';
				q('#buscador').style.borderRadius = '5px 0 0 0';
				//Show suggested searches or products
				let htmlProducto = "";
				for(let i = 0; i < results.length; i++){
					htmlProducto += 
					`<tr>
						<td><img class="thumbnail" src="../../public-uploads/${results[i].imagenes[1]}"/></td>
						<td>
						<a class="texto-item-busqueda" title="${results[i].titulo}" 
						href="/p/${results[i].permalink}?searched=${encodeURIComponent(q('#buscador').value)}">
						${results[i].titulo}</a></td>
						<td class="producto-precio">${results[i].precio}€</td>
					</tr>`;

					q('#buscador-sugerencias').children[0].innerHTML = htmlProducto;					
					//Comprobamos el tamaño de la pantalla para hacer responsive los resultados de busqueda
					//16 Es el espacio de la barra de scroll
					if((window.outerWidth-16) <= 800 && (window.outerWidth-16) >= 650){
						qAll('.texto-item-busqueda').forEach((e) => {
							e.innerHTML = e.innerHTML.substring(0, 30) + '...';
						});
					}
				}
			}else{
				q('#buscador').style.borderRadius = '5px 0 0 5px';
				//Si no hay resultados, ocultar la barra de results
				q('#buscador-sugerencias').style.display = 'none';
			}
		});
	}else{
		q('#buscador').style.borderRadius = '5px 0 0 5px';
		q('#buscador-sugerencias').style.display = 'none';
	}
};
let flechaActiva = false;
function cambiarColorFlechaDepartamentos(){
	if(!flechaActiva){
		q('#flecha-departamentos').style.borderBottomColor = 'lightblue';
		flechaActiva = true;
	}else{
		q('#flecha-departamentos').style.borderBottomColor = 'white';
		flechaActiva = false;
	}
};

//Ocultar o mostrar el menu de departamentos
q('#departamentos').addEventListener('mouseenter', () => {
	ocultarMostrarDepartamentos();
});

q('#departamentos').addEventListener('mouseleave', () => {
	ocultarMostrarDepartamentos();
});

//Para buscar sugerencias a cada toque
q('#buscador').addEventListener('keyup', () => {
	buscarProducto(q('#buscador').value);
});
//Al hacer focus al input
q('#buscador').addEventListener('focus', () => {
	buscarProducto(q('#buscador').value);
});

q('html').addEventListener('click', () => {
	q('#buscador').style.borderRadius = '5px 0 0 5px';
	q('#buscador-sugerencias').style.display = 'none';
});

//Para ir a la página de busqueda
q('#icono-busqueda').addEventListener('click', () => {
	//Si la busqueda no esta vacía, redirigir a resultados de busqueda en caso de hacer click a buscar
	if(q('#buscador').value != null && q('#buscador').value != "" && q('#buscador').value != undefined){
		window.location = '//192.168.1.100:8000/search/?searched='+encodeURI(q('#buscador').value);
	}
});

//Para mostrar el desplegable de opciones de sesion al hover sesion
q('#usuario').addEventListener('mouseenter', () => {
	q('#menu-sesion').style.display = 'block';
});

//No ocultar si se hace click sobre el contenido cesta
q('#menu-sesion').addEventListener('click', (e) => {
	e.stopPropagation();
});
//Ocultar la cesta al hacer click fuera
q('body').addEventListener('click', (e) => {
	if(e.target != q('#usuario')){
		q('#menu-sesion').style.display = 'none';
		q('.triangulo-up').style.display = 'none';
	}
});