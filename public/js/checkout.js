'use strict';

Stripe.setPublishableKey('pk_test_UVgGQ5OoCEARrRvds8bKYV93');

window.addEventListener('load', () => {
	renderCesta();
});

//Muestra la cesta en la caja de productos de la compra
function renderCesta(){
	if(q('#contenedor-total-pagina').style.display == 'block'){
		q('#contenedor-total-pagina').style.display = 'none';
	}

	q('body').insertAdjacentHTML('afterbegin', '<div class="thin-spinner"></div>');

	httpGet('/api/get-cesta', (response) => {
		response = JSON.parse(response);
		if(response.error){
			q('.thin-spinner').remove();
			q('#contenedor-total-pagina').style.display = 'block';
			//La cesta está vacía
			q('#contenedor-total-pagina').innerHTML = 
				`<table style="width: 500px; margin: auto;"><tr>
					<td id="mensaje-cesta-vacia">No hay productos en tu cesta.</td>
					<td><button onclick="window.history.back()">
						Volver a la página anterior
					</button></td>
				</tr></table>`;
		}else if(response.cesta){
			let cestaHtml = '';
			let precioTotal = 0;
			//Loop para cada producto de la cesta
			response.cesta.forEach((productoCesta, index) => {
				let precioCalculado = (productoCesta.precio*productoCesta.cantidad).toFixed(2),
					domAtributos = '';
				//Creamos los atributos
				for(let key in productoCesta.atributosTotales){
					domAtributos += `
						<span class="producto-atributos-key">${key}</span>
						<select class="selector-atributos" onchange="
							editarCantidadCesta(
								'${productoCesta.id}', 
								event,
								null,
								'${key}',
								this.children[this.selectedIndex].innerHTML)">`;
					let arrayValoresAtributo = productoCesta.atributosTotales[key];
					for(let a = 0; a < arrayValoresAtributo.length;a++){
						if(productoCesta.atributosSeleccionados[key] === arrayValoresAtributo[a])
							domAtributos += `<option selected="selected">${arrayValoresAtributo[a]}</option>`;
						else
							domAtributos += `<option>${arrayValoresAtributo[a]}</option>`;
					}
					domAtributos += '</select>';
				}
				cestaHtml += 
				`<tr>
					<input type="hidden" value="${productoCesta.id}"/>
					<td><img src="../public-uploads/${productoCesta.imagen}" width="50px"/></td>
					<td class="cesta-precio">${parseFloat(productoCesta.precio).toFixed(2)}€</td>
					<td class="titulo-producto"><a class="permalink-producto" href="/p/${productoCesta.permalink}">
						${productoCesta.titulo}</a></td>
					<td class="atributos-producto">
						${domAtributos}
					</td>
					<td><input class="producto-cesta-cantidad" type="number" min="1" max="9" onfocusout="
						editarCantidadCesta(
								'${productoCesta.id}',
								event,
								this.value,
								null,
								null)"
						onkeypress="
						editarCantidadCesta(
								'${productoCesta.id}',
								event,
								this.value,
								null,
								null)" 
						value="${productoCesta.cantidad}"/></td>
					<td class="cesta-precio-cantidad"><b>${precioCalculado}€</b></td>
					<td><span onclick="deleteCestaItem(${productoCesta.id}, this)" class="x-icon">×</span></td>
				</tr>`;
				precioTotal += parseFloat(precioCalculado);
				if(index + 1 >= response.cesta.length){
					cestaHtml += 
					`<tr>
						<td class="separador-tabla"></td>
						<td colspan="2">Precio total: <b>${precioTotal.toFixed(2)}€</b></td>

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
					<td><button onclick="window.history.back()">
						Volver a la página anterior
					</button></td>
				</tr></table>`;
		}
	});
};

//Para separar el mes y año y colocar los valores en los input hidden
function checkExpireFormat(e){
	let expiraMes = parseInt(e.target.value.substring(0, 2));
	let expiraAno = parseInt(e.target.value.substring(3, 5));
	
	//Añadimos el separador solo si no ha pulsado borrar
	if(e.target.value.length >= 2 && e.code != "Backspace" && e.code != "Delete"){
		e.target.value = e.target.value.substring(0, 2)+'/'+e.target.value.substring(3, 5);
	}

	if(expiraMes != null && !isNaN(expiraMes)){
		q('#expira-mes').value = expiraMes;
	}
	if(expiraAno != null && !isNaN(expiraAno)){
		q('#expira-ano').value = expiraAno;
	}
};
//Para comprobar el formato del numero de la tarjeta
function checkNumberFormat(e){
	if(e.code != "Backspace" && e.code != "Delete"){
		if(e.target.value.length >= 14){
			e.target.value = e.target.value.substring(0, 4)+' '+e.target.value.substring(5, 9)+' '+e.target.value.substring(10, 14)+' '+e.target.value.substring(15);
		}else if(e.target.value.length >= 9){
			e.target.value = e.target.value.substring(0, 4)+' '+e.target.value.substring(5, 9)+' '+e.target.value.substring(10, 14);
		}else if(e.target.value.length >= 5){
			e.target.value = e.target.value.substring(0, 4)+' '+e.target.value.substring(5, 9);
		}else if(e.target.value.length >= 4){
			e.target.value = e.target.value.substring(0, 4)+' ';
		}
	}
};
//Comprueba que los datos de dirección, productos y tarjeta se envíen completos
function comprobarInputsCompletos(){
	let resultado = false,
		ok = true,
		inputsPago = qAll(`#nombreApellidos, #direccion1, #direccion2, #codPostal, #pais, #email, 
			#num-tarjeta, #expira-completo, #cvc, #contenedor-cesta-pagina`);
	for(let i = 0; i < inputsPago.length; i++){
		if(inputsPago[i].value === '') ok = false;
	}
	if(ok) resultado = true;
	return resultado;
};
/**
 * Devuelve un array con cada atributo y su valor de todos los objetos de la cesta
 * arrayAtributos = [[{
 * 	atributoNombre: asda,
 * 	atributoValor: asas
 * }, {
 * 	atributoNombre: asdg,
 * 	atributoValor: asdfas
 * }],
 * [{}, {}]]
 */
function extrerNombreValorAtributosSeleccionados(){
	let contenedoresAtributo = qAll('.atributos-producto');
	let arrayAtributos = [];
	for(let i = 0; i < contenedoresAtributo.length; i++){
		let atributosNombres = contenedoresAtributo[i].querySelectorAll('.producto-atributos-key'),
			selectsInternos = contenedoresAtributo[i].querySelectorAll('.selector-atributos'),
			arrayInternoAtributos = [];

		//Recorremos todos los atributos dentro de cada producto
		for(let a = 0; a < atributosNombres.length; a++){
			let atributo = {
				'atributoNombre': atributosNombres[a].innerHTML,
				'atributoSeleccionado': selectsInternos[a][selectsInternos[a].selectedIndex].innerHTML
			};

			arrayInternoAtributos.push(atributo);
		}

		arrayAtributos.push(arrayInternoAtributos);
	}
	return arrayAtributos;
};
//Para comprobar la tarjeta pasando por los servidores de stripe y realizar el pago seguro.
function submitPagoStripe(e){
	if(comprobarInputsCompletos()){
		q('#mensaje-error').innerHTML = '';
		q('#submit-pago').setAttribute('disabled', 'disabled');
		q('.spinner-final').style.display = 'block';
		Stripe.card.createToken(q('#payment-form'), (status, response) => {
			//Verificamos que se haya recibido la información de la tarjeta exitosamente
			if(response.error){
				//Si error volver a reiniciar el submit
				q('.payment-errors').style.display = 'inline';
				q('.payment-errors').innerHTML = response.error.message;
				q('#submit-pago').removeAttribute('disabled');
				q('.spinner-final').style.display = 'none';
			}else{
				let token = response.id;
				completarPago(token);
			}
		});
	}else{
		mostrarError('Error, faltan datos de dirección o tarjeta de crédito.');
	}
	//Para evitar que se envie la información al servidor antes de comprobar la info en stripe
	return false;
};
//Envia el pago al servidor
function completarPago(token){
	let arrayProductos = [];
	let objetoCompra = {};

	for(let i = 0; i < qAll('#contenedor-cesta-pagina tr').length; i++){
		let fila = qAll('#contenedor-cesta-pagina tr')[i];
		if(i + 1 < qAll('#contenedor-cesta-pagina tr').length){  //No contamos la última fila al poner i + 1
			//Permalink-producto innerHTML es el titulo del producto sacado tal cual de la base de datos
			let producto = fila.querySelector('.permalink-producto').innerHTML.trim();
			let cantidad = fila.querySelector('.producto-cesta-cantidad').value;
			let permalink = fila.querySelector('.permalink-producto').href.split('/p/')[1];
			let objetoProducto = {};
			let atributos = extrerNombreValorAtributosSeleccionados()[i];

			objetoProducto["nombre"] = producto;
			objetoProducto["cantidad"] = cantidad;
			objetoProducto["permalink"] = permalink;
			objetoProducto["atributos"] = atributos;
			arrayProductos.push(objetoProducto);
		}
	}
	
	objetoCompra = {
		"token": token,
		"productos": arrayProductos,
		"direccion": {
			"nombreApellidos": q('#nombreApellidos').value,
			"linea1": q('#direccion1').value,
			"linea2": q('#direccion2').value,
			"codPostal": q('#codPostal').value,
			"pais": q('#pais').value,
			"email": q('#email').value,
			"telefono": (q('#telefono') ? q('#telefono').value : null)
		}
	};

	httpPost('/api/pagar-compra', objetoCompra, (response) => {
		response = JSON.parse(response);
		if(response.success){
			window.location.href = "/pago-completado";
		}else{
			mostrarError(response.error);
		}
	});
};

function mostrarError(err){
	window.scrollTo(0, 0);
	q('#submit-pago').removeAttribute('disabled');
	q('.spinner-final').style.display = 'none';
	q('#mensaje-error').innerHTML = `<h4><b>${err}</b></h4>`;
};

//Comprobamos el formato de la expiración de la tarjeta
q('#expira-completo').addEventListener('keyup', checkExpireFormat);
//Comprobamos el formato del nº de la tarjeta
q('#num-tarjeta').addEventListener('keyup', checkNumberFormat);
//Impedimos que pueda pegar en los inputs
q('#num-tarjeta').addEventListener('paste', (e) => {
	e.preventDefault();
	return false;
});
//Ejecutamos el submit de la tarjeta
q('#submit-pago').addEventListener('click', submitPagoStripe);