window.addEventListener('load', () => {
	renderCesta();
});

new Acordeon('Preguntas frecuentes', '#preguntas-frecuentes');

// window.addEventListener('scroll', () => {
// 	if(document.body.scrollTop >= 25 && window.innerWidth >= 730 && window.innerWidth <= 1500){
// 		q('#boton-mostrar-preguntas-frecuentes').style.top = '55px';
// 		q('#preguntas-frecuentes').style.top = '99px';
// 	}else if(document.body.scrollTop < 25 && window.innerWidth >= 730 && window.innerWidth <= 1500){
// 		q('#boton-mostrar-preguntas-frecuentes').style.top = '70px';
// 		q('#preguntas-frecuentes').style.top = '114px';
// 	}
// });

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
		}else if(response.cesta != null){
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
					<td><button onclick="window.history.back()">
						Volver a la página anterior
					</button></td>
				</tr></table>`;
		}
	});
};