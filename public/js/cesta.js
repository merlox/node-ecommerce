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
						<span style="display: none;">${key}</span>
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
					<td class="cesta-imagen-precio">
						<img src="../public-uploads/${productoCesta.imagen}" width="130px"/>
						<span>${parseFloat(productoCesta.precio).toFixed(2)}€</span>
					</td>
					<td class="cesta-precio">
						<div class="titulo-producto"><a href="/p/${productoCesta.permalink}">
							${productoCesta.titulo}</a></div>
						<div class="atributos-producto">
							${domAtributos}
						</div>
						<div><input type="number" min="1" max="9" onfocusout="
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
							value="${productoCesta.cantidad}"/>
							<b class="cesta-precio-cantidad">${precioCalculado}€</b>
							</div>
						<div><a class="boton-eliminar-cesta" 
							href="javascript:void(0)" onclick="deleteCestaItem(${productoCesta.id}, this)">
							Eliminar</a></div>
					</td>
				</tr>`;
				precioTotal += parseFloat(precioCalculado);
				if(index + 1 >= response.cesta.length){
					cestaHtml += 
					`<tr>
						<td align="center">Total: <b>${precioTotal.toFixed(2)}€</b></td>
						<td><button onclick="pasarPorCaja();">Pasar por caja</button></td>
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

// q('#productos-cesta').addEventListener('mouseleave', () => {
// 	q('#productos-cesta').style.display = 'none';
// 	q('.triangulo-up').style.display = 'none';
// });

//No ocultar si se hace click sobre el contenido cesta
q('#productos-cesta').addEventListener('click', (e) => {
	e.stopPropagation();
});
//Ocultar la cesta al hacer click fuera
q('html').addEventListener('click', (e) => {
	if(!q('#productos-cesta').contains(e.target)){
		q('#productos-cesta').style.display = 'none';
		q('.triangulo-up').style.display = 'none';
	}
});
