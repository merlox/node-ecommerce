'use strict';

let comprarAhora = false,
	cestaBloqueada = false;

//Añadir productos a la cesta
function addCesta(cantidad){
	let permalinkProducto = window.location.pathname.substring(3);
	let dataObject = {};
	dataObject[permalinkProducto] = cantidad;
	menuMovilHidden = true;
	toggleMenuMovil(); //Para mostrar el menú movil si estuviese oculto y cargar la cesta
	httpPost('/api/add-cesta/', dataObject, (err) => {
		getCesta();
		if(comprarAhora) window.location = `/completar-pago`;
	});
};
//Para crear la cesta widget del menú principal
function getCesta(){
	q('.triangulo-up').style.borderBottomColor = 'white';
	q('#cesta').insertAdjacentHTML('afterbegin', '<div class="spinner spinner-cesta"></div>');
	httpGet('/api/get-cesta', (response) => {
		response = JSON.parse(response);
		if(response.error){
			q('#productos-cesta').style.display = 'block';
			q('.triangulo-up').style.display = 'block';
			q('#productos-cesta').innerHTML = '<div id="mensaje-cesta-vacia">No hay productos en tu cesta.</div>';
			q('.spinner').remove();
		}else if(response.cesta != null){
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
					<td></td>
					<td><span onclick="deleteCestaItem('${productoCesta.permalink}', this)" class="x-icon">×</span></td>
				</tr>`;
				precioTotal += parseFloat(precioCalculado);
				if(index + 1 >= response.cesta.length){
					cestaHtml += 
					`<tr>
						<td class="separador-tabla"></td>
						<td colspan="2">Precio total: <b>${precioTotal.toFixed(2)}€</b></td>
						<td colspan="3">
							<button onclick="window.location.href='/completar-pago'">Pasar por caja</button>
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
			if(/\/completar-pago\/?/.test(window.location.pathname)) renderCesta();
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
		if(/\/completar-pago\/?/.test(window.location.pathname)) renderCesta();
		else getCesta();
	});
};

//Añadir un producto a la cesta en backend y front end
if(q('.button-añadir-cesta')){
	qAll('.button-añadir-cesta').forEach(button => {
		button.addEventListener('click', () => {
			window.scrollTo(0, 0);
			addCesta(q('#input-cantidad').value);
		});
	});
}
if(q('.button-comprar-ahora')){
	qAll('.button-comprar-ahora').forEach(button => {
		button.addEventListener('click', () => {
			comprarAhora = true;
			window.scrollTo(0, 0);
			addCesta(q('#input-cantidad').value);
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
	if(e.target.parentNode.id != 'productos-cesta'){
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