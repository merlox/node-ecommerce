'use strict';
window.addEventListener('load', () => {
	//Que al hacer click en el icono de la cesta te lleve a la página de pasar por caja
	q('#cesta').href = `cesta?ref=${window.location.pathname}`;
	if(window.location.pathname == "/cesta"){
		httpGet('/api/get-logged-state', (state) => {
			if(state == null) window.location.href = "/";
			else renderCesta();
		});
	}
});
//Añadir productos a la cesta
function addCesta(cantidad){
	let permalinkProducto = window.location.pathname.substring(3);
	let dataObject = {};
	dataObject[permalinkProducto] = cantidad;
	httpPost('/api/add-cesta/', dataObject, (err) => {
		getCesta();
	});
};
//Para crear la cesta widget del menú principal
function getCesta(){
	q('.triangulo-up').style.borderBottomColor = 'white';
	q('#cesta').insertAdjacentHTML('afterbegin', '<div class="spinner spinner-cesta"></div>');
	httpGet('/api/get-cesta', (response) => {
		response = JSON.parse(response);
		if(response.error) q('#productos-cesta').innerHTML = response.error;
		else if(response.cesta != null){
			let cestaHtml = '';
			let precioTotal = 0;
			//Loop para cada producto de la cesta
			response.cesta.forEach((productoCesta, index) => {
				let precioCalculado = (productoCesta.precio*productoCesta.cantidad).toFixed(2);
				cestaHtml += 
				`<tr>
					<td><img src="../public-uploads/${productoCesta.imagen}" width="50px"/></td>
					<td class="cesta-precio">${parseFloat(productoCesta.precio).toFixed(2)}€</td>
					<td class="titulo-producto"><a href="/p/${productoCesta.permalink}">
						${productoCesta.titulo}</a></td>
					<td><input type="number" min="1" onfocusout="editarCantidadCesta('${productoCesta.permalink}', event, true)"
						onkeypress="editarCantidadCesta('${productoCesta.permalink}', event)" 
						value="${productoCesta.cantidad}"/></td>
					<td class="cesta-precio-cantidad"><b>${precioCalculado}€</b></td>
					<td><span onclick="deleteCestaItem('${productoCesta.permalink}', this)" class="x-icon">×</span></td>
				</tr>`;
				precioTotal += parseFloat(precioCalculado);
				if(index + 1 >= response.cesta.length){
					cestaHtml += 
					`<tr>
						<td class="separador-tabla"></td>
						<td colspan="2">Precio total: <b>${precioTotal.toFixed(2)}€</b></td>
						<td colspan="3">
							<button onclick="window.location.href='/cesta?ref=${window.location.pathname}'">Pasar por caja</button>
						</td>
					</tr>`;
				}
			});
			q('.spinner').remove();
			q('#productos-cesta').style.display = 'block';
			q('.triangulo-up').style.display = 'block';
			q('#productos-cesta').innerHTML = cestaHtml;
			// //Para colorear la flecha del mismo color del fondo cuando hover firstchild
			q('#productos-cesta').firstChild.firstChild.addEventListener('mouseenter', () => {
				q('.triangulo-up').style.borderBottomColor = 'whitesmoke';
			});
			q('#productos-cesta').firstChild.firstChild.addEventListener('mouseleave', () => {
				q('.triangulo-up').style.borderBottomColor = 'white';
			});
		//La cesta está vacía
		}else{
			q('#productos-cesta').style.display = 'block';
			q('.triangulo-up').style.display = 'block';
			q('#productos-cesta').innerHTML = '<div id="mensaje-cesta-vacia">No hay productos en tu cesta.</div>';
			q('.spinner').remove();
		}
	});
};
//Para cambiar la cantidad de un producto en la cesta al hacer enter 
function editarCantidadCesta(producto, e, blurred){
	if(e.key == 'Enter' || blurred){
		e.target.blur();
		let data = {
			'producto': producto,
			'cantidad': e.target.value
		};
		httpPost('/api/change-cantidad-cesta', data, (err) => {
			if(err) alert(err);
			if(window.location.pathname == "/cesta") renderCesta();
			else getCesta();
		});
	}
};
//Para borrar un elemento de la cesta al darle a la x
function deleteCestaItem(producto, element){
	let data = {
		'producto': producto,
		'cantidad': 0
	};
	element.parentNode.parentNode.remove();
	httpPost('/api/change-cantidad-cesta', data, (err) => {
		if(err) alert(err);
		if(window.location.pathname == "/cesta") renderCesta();
		else getCesta();
	});
};
//Para mostrar la cesta en la pantalla principal cesta.html
function renderCesta(){
	if(q('#contenedor-total-pagina').style.display == 'block'){
		q('#contenedor-total-pagina').style.display = 'none';
	}

	q('body').insertAdjacentHTML('afterbegin', '<div class="thin-spinner"></div>');

	httpGet('/api/get-cesta', (response) => {
		response = JSON.parse(response);
		if(response.error) q('#contenedor-cesta-pagina').innerHTML = response.error;
		else if(response.cesta != null){
			let cestaHtml = '';
			let precioTotal = 0;
			//Loop para cada producto de la cesta
			response.cesta.forEach((productoCesta, index) => {
				let precioCalculado = (productoCesta.precio*productoCesta.cantidad).toFixed(2);
				//Importante mantener la estructura html o dará errores raros
				cestaHtml += 
				`<tr>
					<td><img src="../public-uploads/${productoCesta.imagen}" width="50px"/></td>
					<td class="cesta-precio">${parseFloat(productoCesta.precio).toFixed(2)}€</td>
					<td class="titulo-producto">
					<a class="permalink-producto" href="/p/${productoCesta.permalink}">${productoCesta.titulo}</a></td>
					<td><input type="number" min="1" class="producto-cesta-cantidad"
						onfocusout="editarCantidadCesta('${productoCesta.permalink}', event, true)"
						onkeypress="editarCantidadCesta('${productoCesta.permalink}', event)" 
						value="${productoCesta.cantidad}"/></td>
					<td class="cesta-precio-cantidad"><b>${precioCalculado}€</b></td>
					<td><span onclick="deleteCestaItem('${productoCesta.permalink}', this)" class="x-icon">×</span></td>
				</tr>`;
				precioTotal += parseFloat(precioCalculado);
				if(index + 1 >= response.cesta.length){
					cestaHtml += 
					`<tr>
						<td></td>
						<td></td>
						<td></td>
						<td colspan="3">Total: <b>${precioTotal.toFixed(2)}€</b></td>
					</tr>`;
				}
			});
			//Quitar spinner
			q('.thin-spinner').remove();
			//Mostrar contenido de la página
			q('#contenedor-total-pagina').style.display = 'block';
			//Quitar el precio total al lado de la tarjeta
			if(q('.precio-total')) q('.precio-total').remove();
			//Insertar precio total al lado de la tarjeta de credito o debito
			q('#contenedor-completar-pago').insertAdjacentHTML('afterbegin', 
				`<span class="precio-total">Total: <b>${precioTotal.toFixed(2)}€</b></span>`);
			//Poner el contenido de la cesta en la página
			q('#contenedor-cesta-pagina').innerHTML = cestaHtml;
		}else{
			q('.thin-spinner').remove();
			q('#contenedor-total-pagina').style.display = 'block';
			//La cesta está vacía
			q('#contenedor-total-pagina').innerHTML = 
				`<table style="width: 500px; margin: auto;"><tr>
					<td id="mensaje-cesta-vacia">No hay productos en tu cesta.</td>
					<td><button onclick="window.location.href='${getParameterByName('ref')}'">
						Volver a la página anterior
					</button></td>
				</tr></table>`;
		}
	});
};

//Añadir un producto a la cesta en backend y front end
if(q('.button-añadir-cesta')){
	qAll('.button-añadir-cesta').forEach(button => {
		button.addEventListener('click', () => {
			addCesta(q('#input-cantidad').value);
		});
	});
}
let cestaBloqueada = false;
//Mostrar la cesta on hover
q('#cesta').addEventListener('mouseenter', () => {
	if(!cestaBloqueada){
		cestaBloqueada = true;
		getCesta();
		setTimeout(() => {
			cestaBloqueada = false;
		}, 1e3);
	}
});
//Mostrar la cesta on click
q('#cesta').addEventListener('click', (e) => {
	getCesta();
	e.stopPropagation();
});
//No ocultar si se hace click sobre el contenido cesta
q('#productos-cesta').addEventListener('click', (e) => {
	e.stopPropagation();
});
//Ocultar la cesta al hacer click fuera
q('html').addEventListener('click', (e) => {
	if(e.target != q('#cesta')){
		q('#productos-cesta').style.display = 'none';
		q('.triangulo-up').style.display = 'none';
	}
});
