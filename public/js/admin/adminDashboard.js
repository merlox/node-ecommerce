let filtrosEstado = {},
	pageActual = 1,
	productosPorPagina = 20,
	rehacerPaginador = true,
	paginasTotales = Infinity;

mostrarMensajeRandomCarga();

//Done TODO verificar que el usuario pone todos los datos de la dirección y que son correctos
/*
DONE 1.paginacion
DONE 2.filtrar
DONE 3.verificar en cesta.html que pone los datos de la direccion y son correctos
DONE 4.mostrar mensajes de error en la página de compra cesta.html
DONE 5.crear acciones de estado posibles en este widget
6.crear widget de chat para comunicarme con cada comprador
*/
window.addEventListener('load', () => {
	generarFacturas(1, null);
});

//Creamos los filtros de estado con sus listeners y efectos
qAll('input[type=radio').forEach(radio => {
	radio.addEventListener('click', () => {
		let estado = radio.value.split(' ')[0],
			estadoValor = radio.value.split(' ')[1];

		rehacerPaginador = true;

		//Si ya estaba activado el mismo de antes, desactivalo
		if(filtrosEstado[estado] == estadoValor){
			radio.checked = false;
			delete filtrosEstado[estado];
			generarFacturas(pageActual);
		}else{
			filtrosEstado[estado] = estadoValor;
		}
		if(Object.keys(filtrosEstado).length != 0){
			generarFacturas(pageActual);
		}
	});
});

//Muestra un mensaje random de carga
function mostrarMensajeRandomCarga(){
	let arrayMensajesDeCarga = [
		'Cargando datos de compra...',
		'Procesando información de productos...',
		'Cargando datos de clientes...',
		'Cargando facturas recientes...',
		'Generando información de facturas...',
		'Solicitando información al servidor sobre las facturas...',
		'Descargando datos de pedidos...',
		'Realizando una consulta al servidor sobre las facturas...',
		'Cargando datos de compras recientes...',
		'Cargando facturas de compradores...'
	];
	let indexRandom = Math.abs(Math.ceil((Math.random()*10)-1));
	q('.contenedor-mensaje-carga h3').innerHTML = arrayMensajesDeCarga[indexRandom];
	q('.contenedor-mensaje-carga').style.display = 'flex';
};
/*
Crea la tabla del widget de facturas y llama al a crearPaginacionFacturas.
Param: pag es la página a cargar, se iguala a pageActual para el creador del paginador.
*/
function generarFacturas(pag){

	pageActual = pag;
	
	let objetoEnviar = {
		'pageActual': pageActual,
		'ppp': productosPorPagina,
		'filtros': filtrosEstado
	};

	if(pageActual > 0 && paginasTotales >= pageActual){
		crearPaginacionFacturas();
		//Solicitar el estado de las compras de los productos, con paginación.
		httpPost(`/api/facturas`, objetoEnviar, dataObject => {
			dataObject = JSON.parse(dataObject);
			if(dataObject.error) {
				q('#tabla-facturas').style.display = 'block';
				return q('#tabla-facturas').innerHTML = dataObject.error;
			}

			generarTablaFacturasHTML(dataObject, tablaHTML => {
				q('#tabla-facturas').style.display = 'block';
				q('.contenedor-mensaje-carga').style.display = 'none';
		    	q('#tabla-facturas').innerHTML = tablaHTML;
			});
		});
	}
};
/*
Genera el paginador y los inserta en todos los .paginador-facturas.
*/
function crearPaginacionFacturas(done){
	let objetoEnviar = {
		'ppp': productosPorPagina,
		'pageActual': pageActual,
		'filtros': filtrosEstado
	};

	if(rehacerPaginador){
		httpPost(`/api/get-paginacion-facturas`, objetoEnviar, dataObject => {
			if(dataObject) dataObject = JSON.parse(dataObject);
			//Mensaje de error
			if(dataObject ? dataObject.error : !dataObject){
				qAll('.paginacion-facturas').forEach(paginador => {
					paginador.style.display = 'block';
					paginador.innerHTML = `<div class="error">Error creando la paginación. 
					<button class="recargar-paginacion" onclick="crearPaginacionFacturas({})">Recargar</button></div>`;
				});
			//Mensaje no hay más páginas
			}else if(dataObject.paginasTotales <= 1){
				qAll('.paginacion-facturas').forEach(paginador => {
					paginador.innerHTML = 'No hay más páginas.';
				});
			}else{
				//Crear paginador
				paginasTotales = dataObject.paginasTotales;
				let paginadorHTML = actualizarPaginadorActual();
				//Insertamos el paginador creado en cada contenedor
				qAll('.paginacion-facturas').forEach(paginador => {
					paginador.innerHTML = paginadorHTML;
				});
			}
		});
	}else{
		let paginadorHTML = actualizarPaginadorActual();
		//Insertamos el paginador creado en cada contenedor
		qAll('.paginacion-facturas').forEach(paginador => {
			paginador.innerHTML = paginadorHTML;
		});
	}
	//Mostramos los contenedores de los paginadores
	qAll('#filtros-facturas, #paginacion-footer-facturas').forEach(e => {
		e.style.display = 'block';
	});

	rehacerPaginador = false;
};
/*
Para ajustar el funcionamiento de los botones del paginador dependiendo de la pagina actual.
No tiene parámetros porque usa el global de paginas totales y pagina actual.
Return: el paginadorHTML en string.
*/
function actualizarPaginadorActual(){
	let paginadorHTML = '',
		maxPaginasAMostrar = paginasTotales,
		paginaInicialAMostrar = 1;
	//Quitamos la página activa
	if(q('.pagina-activa')) q('.pagina-activa').className = 'button-pagina';
	//Calculamos cuántas páginas mostrar en esa vista
	if(paginasTotales > 3 && pageActual === 1)
		maxPaginasAMostrar = 3;
	else if(paginasTotales > 3 && pageActual > 1 && pageActual !== paginasTotales)
		maxPaginasAMostrar = (pageActual+1);
	else if(paginasTotales > 3 && pageActual === paginasTotales)
		maxPaginasAMostrar = pageActual;
	//Calculamos la página inicial a mostrar en la izquierda
	if(pageActual > 1 && pageActual === paginasTotales && paginasTotales >= 3)
		paginaInicialAMostrar = pageActual-2;
	else if(pageActual > 1)
		paginaInicialAMostrar = pageActual-1;

	paginadorHTML += `<span class="button-pagina" onclick="generarFacturas(${pageActual-1})">Anterior</span> `;
	//Creamos los 3 botones numéricos con las páginas a mostrar
	for(let i = paginaInicialAMostrar; i <= maxPaginasAMostrar; i++) {
		if(i === pageActual) paginadorHTML += `<span class="button-pagina pagina-activa" onclick="generarFacturas(${i})">${i}</span>`;
		else paginadorHTML += `<span class="button-pagina" onclick="generarFacturas(${i})">${i}</span>`;
	}
	//Crear el botón de página final si hay más de 3 páginas y no se muestra ya la página final en el loop de antes
	if(paginasTotales > 3 && pageActual < (paginasTotales-1))
		paginadorHTML += `<span class="button-pagina" onclick="generarFacturas(${paginasTotales})">${paginasTotales}</span>`;

	paginadorHTML += ` <span class="button-pagina" onclick="generarFacturas(${pageActual+1})">Siguiente</span>`;

	return paginadorHTML;
};
/*
Genera el html de la tabla de facturas dado el dataObject del servidor.
Return: el html de la tabla.
*/
function generarTablaFacturasHTML(dataObject, done){
	let tablaHTML = `<tr>
		<th>ID</th>
		<th>Comprador</th>
		<th>Productos</th>
		<th>Total</th>
		<th>Fecha</th>
		<th>Pago</th>
		<th>Dirección</th>
		<th>Estado</th>
		<th>Acciones</th>
	</tr>`;
	//Si no hay facturas
   	if(dataObject.facturas.length <= 0){
   		tablaHTML = `<div class="mensaje-nohayfacturas">No hay facturas para esos filtros.</div>`;
		q('.contenedor-mensaje-carga').style.display = 'none';
		q('#tabla-facturas').innerHTML = tablaHTML;
   		return done(tablaHTML);
   	}else{
	    dataObject.facturas.forEach((objectoFactura, index) => {
	    	tablaHTML += `<tr>`;
	    	//ID
	    	tablaHTML += `<td>${objectoFactura.idPago}</td>`;
	    	//Comprador
	    	tablaHTML += `<td><i>${objectoFactura.nombreApellidos}</i>
	    		<br/>${objectoFactura.emailUsuarioConectado}
	    		<br/><span class="secundario">${objectoFactura.customer}</span></td>`;
	    	//Productos
	    	tablaHTML += `<td>`;
	    	let i = 0,
	    		tamañoProductos = Object.keys(objectoFactura.productos).length;
	    	tablaHTML += `<ul>`;
	    	for(let key in objectoFactura.productos){
	    		i++;
	    		let producto = objectoFactura.productos[key];
	    		if(i > 1 && i < tamañoProductos){
	    			tablaHTML += `<li class="lista-productos-comprados"> ${producto.titulo} 
	    			<br/><b>${producto.cantidad}</b> x ${(producto.precioCentimos*0.01).toFixed(2)}€ 
	    			= ${(producto.cantidad*producto.precioCentimos*0.01).toFixed(2)}€`;
	    		}
	    	};
	    	tablaHTML += `</ul>`;
	    	tablaHTML += `</td>`;
	    	//Precio total
	    	tablaHTML += `<td>${(objectoFactura.productos.precioTotal*0.01).toFixed(2)}€</td>`;
	    	//Fecha de compra, la convertimos a ms y luego a date y luego a string para eliminar lo que no interesa
	    	let fecha = new Date(objectoFactura.fecha*1000).toISOString(),
	    		fechaHorario = fecha.split('T')[0].split('-'),
	    		diaDeLaSemana = new Date(objectoFactura.fecha*1000).toString().substring(0, 4),
	    		fechaAño = fechaHorario[0],
	    		fechaMes = fechaHorario[1],
	    		fechaDia = fechaHorario[2],
	    		fechaHoras = fecha.split('T')[1].substring(0, 8);
	    	tablaHTML += `<td> ${diaDeLaSemana}
	    		<br/>${fechaDia}/${fechaMes}/${fechaAño} 
	    		<br/> <span class="secundario">${fechaHoras}</span></td>`;
	    	//Forma de pago
	    	tablaHTML += `<td>Tarjeta ${objectoFactura.chargeObject.source.brand}
	    		<br/>${objectoFactura.chargeObject.source.country}
	    		<br/>${objectoFactura.terminacionTarjeta}</td>`;
	    	//Dirección
	    	tablaHTML += `<td><span class="secundario">Cod. postal:</span> ${objectoFactura.direccion.codPostal ? objectoFactura.direccion.codPostal : '-'}
	    		<br/><span class="secundario">Email:</span> ${objectoFactura.direccion.email ? objectoFactura.direccion.email : '-'}
	    		<br/><span class="secundario">Linea 1:</span> ${objectoFactura.direccion.linea1 ? objectoFactura.direccion.linea1: '-'}
	    		<br/><span class="secundario">Linea 2:</span> ${objectoFactura.direccion.linea2 ? objectoFactura.direccion.linea2 : '-'}
	    		<br/><span class="secundario">Nombre apellidos:</span> ${objectoFactura.direccion.nombreApellidos ? objectoFactura.direccion.nombreApellidos : '-'}
	    		<br/><span class="secundario">País:</span> ${objectoFactura.direccion.pais ? objectoFactura.direccion.pais : '-'}
	    		<br/><span class="secundario">Teléfono:</span> ${objectoFactura.direccion.telefono ? objectoFactura.direccion.telefono : '-'}</td>`;
	    	//Estado
	    	tablaHTML += `<td><span class="secundario">Pagado:</span> <span class="secundario-pagado">${objectoFactura.estaPagado ? 'Si' : 'No'}</span>
	    		<br/><span class="secundario">Procesado:</span> <span class="secundario-procesado">${objectoFactura.estaProcesado ? 'Si' : 'No'}</span>
	    		<br/><span class="secundario">Enviado:</span> <span class="secundario-enviado">${objectoFactura.estaEnviado ? 'Si' : 'No'}</span></td>`;
	    	//Acciones
	    	let botonEnviado = `<button class="boton-estado" onclick="actualizarEstado(${objectoFactura.idPago}, 'estaEnviado', true, this)">
	    			Marcar enviado</button>`,
	    		botonNoEnviado = `<button class="boton-estado" onclick="actualizarEstado(${objectoFactura.idPago}, 'estaEnviado', false, this)">
	    			Marcar no enviado</button>`,
	    		botonProcesado = `<button class="boton-estado" onclick="actualizarEstado(${objectoFactura.idPago}, 'estaProcesado', true, this)">
	    			Marcar proces.</button>`,
	    		botonNoProcesado = `<button class="boton-estado" onclick="actualizarEstado(${objectoFactura.idPago}, 'estaProcesado', false, this)">
	    			Marcar no proces.</button>`,
	    		botonPagado = `<button class="boton-estado" onclick="actualizarEstado(${objectoFactura.idPago}, 'estaPagado', true, this)">
	    			Marcar pagado</button>`,
	    		botonNoPagado = `<button class="boton-estado" onclick="actualizarEstado(${objectoFactura.idPago}, 'estaPagado', false, this)">
	    			Marcar no pagado</button>`;
	    	tablaHTML += `<td>${objectoFactura.estaPagado ? botonNoPagado : botonPagado}
	    		${objectoFactura.estaProcesado ? botonNoProcesado : botonProcesado}
	    		${objectoFactura.estaEnviado ? botonNoEnviado : botonEnviado}</td>`;
	    	tablaHTML += `</tr>`;
	    	//Index empieza a contar en 0, length empieza a contar en 1
	    	if(index >= dataObject.facturas.length - 1){
	    		return done(tablaHTML);
	    	}
	    });
	}
};
//Para marcar los pedidos como enviados
function actualizarEstado(idFactura, estadoNuevo, boolean, element){
	let dataObject = {
		'id': idFactura,
		'estado': estadoNuevo,
		//Le indicamos true o false para ese estado nuevo.
		'estadoBoolean': boolean
	};
	//Definimos las variables a usar
	let botonNodo = element,
		nuevoNodo = document.createElement('b'),
		//Extraemos la id pago
		idPago = parseInt(botonNodo.getAttribute('onclick').split(',')[0].substring(botonNodo.getAttribute('onclick').split(',')[0].length-1));
	//Los botones a usar
	let botonEnviado = `<button class="boton-estado" onclick="actualizarEstado(${idPago}, 'estaEnviado', true, this)">
			Marcar enviado</button>`,
		botonNoEnviado = `<button class="boton-estado" onclick="actualizarEstado(${idPago}, 'estaEnviado', false, this)">
			Marcar no enviado</button>`,
		botonProcesado = `<button class="boton-estado" onclick="actualizarEstado(${idPago}, 'estaProcesado', true, this)">
			Marcar proces.</button>`,
		botonNoProcesado = `<button class="boton-estado" onclick="actualizarEstado(${idPago}, 'estaProcesado', false, this)">
			Marcar no proces.</button>`,
		botonPagado = `<button class="boton-estado" onclick="actualizarEstado(${idPago}, 'estaPagado', true, this)">
			Marcar pagado</button>`,
		botonNoPagado = `<button class="boton-estado" onclick="actualizarEstado(${idPago}, 'estaPagado', false, this)">
			Marcar no pagado</button>`;

	//Reemplazamos el botón con un mensaje de cargando
	nuevoNodo.innerHTML = '<div class="mensaje-carga-boton-estado">cargando... <span class="spinner spinner-inline"></span></div>';
	botonNodo.parentNode.replaceChild(nuevoNodo, botonNodo);

	httpPost('/api/actualizar-estado-factura', dataObject, err => {
		if(err) q('.contenedor-mensaje-error').innerHTML = `<h3>${err}</h3>`;

		//Actualizamos el estado según corresponda y cambiamos el botón.
		if(estadoNuevo === 'estaPagado'){
			nuevoNodo.parentNode.parentNode.children[7].querySelector('.secundario-pagado').innerHTML = (boolean ? 'Si' : 'No');
			nuevoNodo.outerHTML = (boolean ? botonNoPagado : botonPagado);
		}
		if(estadoNuevo === 'estaProcesado'){
			nuevoNodo.parentNode.parentNode.children[7].querySelector('.secundario-procesado').innerHTML = (boolean ? 'Si' : 'No');
			nuevoNodo.outerHTML = (boolean ? botonNoProcesado : botonProcesado);
		}
		if(estadoNuevo === 'estaEnviado'){
			nuevoNodo.parentNode.parentNode.children[7].querySelector('.secundario-enviado').innerHTML = (boolean ? 'Si' : 'No');
			nuevoNodo.outerHTML = (boolean ? botonNoEnviado : botonEnviado);
		}
	});
};





