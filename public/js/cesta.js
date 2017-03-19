'use strict';

let comprarAhora = false,
	cestaBloqueada = false;

//Añadir productos a la cesta
function addCesta(permalink, cantidad, atributosSeleccionados){
	let cestaObject = {
		'permalink': permalink,
		'cantidad': parseInt(cantidad),
		'atributosSeleccionados': atributosSeleccionados
	};
	//El resto de valores titulo, imagen, atributosTotales y precio se generan en el server
	httpPost('/api/add-cesta/', cestaObject, (err) => {
		if(err){
			q('#productos-cesta').style.display = 'block';
			q('.triangulo-up').style.display = 'block';
			q('#productos-cesta').innerHTML = '<div id="mensaje-cesta-vacia">No hay productos en tu cesta.</div>';
		}else{
			if(comprarAhora) return pasarPorCaja();
			getCesta();
		}
	});
};
//Extrae el estado de login dependiendo del botón de usuario
function getLoggedState(){
	return q('#usuario').pathname;
};
//Se ejecuta al pulsar el botón de pasar por caja
function pasarPorCaja(){
	if(getLoggedState() === '/login'){
		window.location = `/login?comprar=true`;
	}else{
		window.location = `/completar-pago`;
	}
};
//Para crear la cesta widget del menú principal
function getCesta(){
	q('.triangulo-up').style.borderBottomColor = 'white';
	q('#cesta').insertAdjacentHTML('afterbegin', '<div class="spinner spinner-cesta"></div>');
	httpGet('/api/get-cesta', response => {
		response = JSON.parse(response);
		if(response.error){
			q('#productos-cesta').style.display = 'block';
			q('.triangulo-up').style.display = 'block';
			q('#productos-cesta').innerHTML = '<div id="mensaje-cesta-vacia">No hay productos en tu cesta.</div>';
			q('.spinner').remove();
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
						<span>${key}</span>
						<select onchange="
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
					<td class="titulo-producto"><a href="/p/${productoCesta.permalink}">
						${productoCesta.titulo}</a></td>
					<td class="atributos-producto">
						${domAtributos}
					</td>
					<td><input type="number" min="1" max="9" onfocusout="
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
						<td></td>						
						<td colspan="3">
							<button onclick="pasarPorCaja();">Pasar por caja</button>
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
function editarCantidadCesta(id, e, cantidad, atributoNombre, atributoValue){
	if(e.key === 'Enter' || e.type === 'focusout' || e.type === 'change'){
		e.target.blur();
		let data = {
			'tipoCambio': (e.key === 'Enter' || e.type === 'focusout') ? 'cantidad' : 'atributo',
			'id': parseInt(id),
			'cantidad': parseInt(e.target.value),
			'atributoNombre': atributoNombre,
			'atributoSeleccionado': atributoValue
		};
		httpPost('/api/change-cantidad-cesta', data, (err) => {
			if(err) alert(err);
			if(/\/completar-pago\/?/.test(window.location.pathname)) renderCesta();
			else getCesta();
		});
	}
};
//Para borrar un elemento de la cesta al darle a la x
function deleteCestaItem(id, element){
	let data = {
		'tipoCambio': 'delete',
		'id': id
	};
	element.parentNode.parentNode.remove();
	httpPost('/api/change-cantidad-cesta', data, (err) => {
		if(err) alert(err);
		if(/\/completar-pago\/?/.test(window.location.pathname)) renderCesta();
		else getCesta();
	});
};
//Devuelve un objeto con cada atributo y su valor
function extrerNombreValorAtributosSeleccionados(){
	let contenedoresAtributo = qAll('.contenedor-atributo');
	let objetoAtributos = {};
	for(let i = 0; i < contenedoresAtributo.length; i++){
		let atributoSeleccionado = qAll('.producto-atributos-key')[i].innerHTML,
			selectInterno = contenedoresAtributo[i].querySelector('.selector-atributos'),
			valorSeleccionado = selectInterno[selectInterno.selectedIndex].innerHTML;

		objetoAtributos[atributoSeleccionado] = valorSeleccionado;
	}
	return objetoAtributos;
};

//Añadir un producto a la cesta en backend y front end
if(q('.button-añadir-cesta')){
	qAll('.button-añadir-cesta').forEach(button => {
		button.addEventListener('click', () => {
			window.scrollTo(0, 0);
			let permalink = window.location.pathname.replace('/p/', ''),
				cantidad = q('#input-cantidad').value,
				atributosSeleccionados = extrerNombreValorAtributosSeleccionados();

			addCesta(permalink, cantidad, atributosSeleccionados);
		});
	});
}
if(q('.button-comprar-ahora')){
	qAll('.button-comprar-ahora').forEach(button => {
		button.addEventListener('click', () => {
			comprarAhora = true;
			window.scrollTo(0, 0);
			let permalink = window.location.pathname.replace('/p/', ''),
				cantidad = q('#input-cantidad').value,
				atributosSeleccionados = extrerNombreValorAtributosSeleccionados()

			addCesta(permalink, cantidad, atributosSeleccionados);
		});
	});
}
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
q('html').addEventListener('click', (e) => {
	if(!q('#productos-cesta').contains(e.target)){
		q('#productos-cesta').style.display = 'none';
		q('.triangulo-up').style.display = 'none';
	}
});
q('#productos-cesta').addEventListener('mouseleave', () => {
	q('#productos-cesta').style.display = 'none';
	q('.triangulo-up').style.display = 'none';
});
/* Descomentar para que la cesta se oculte al hacer click fuera
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
*/