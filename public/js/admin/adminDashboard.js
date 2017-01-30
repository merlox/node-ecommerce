mostrarMensajeRandomCarga();
//TODO verificar que el usuario pone todos los datos de la dirección y que son correctos
/*
1.paginacion
2.filtrar
3.verificar en cesta.html que pone los datos de la direccion y son correctos
4.mostrar mensajes de error en la página de compra cesta.html
5.crear acciones posibles en este widget
6.crear widget de chat para comunicarme con cada comprador
*/
window.addEventListener('load', () => {
	generarFacturas(1);
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

let pageActual = 1,
	productosPorPagina = 20;
//Crea la tabla del widget de facturas para ver quién ha comprado qué y el estado de su pedido
function generarFacturas(pag){

	pageActual = pag;

	crearPaginacionFacturas();
	//Solicitar el estado de las compras de los productos, con paginación.
	httpGet(`/api/facturas?pag=${pageActual}&ppp=${productosPorPagina}`, dataObject => {

		q('#tabla-facturas').style.display = 'block';

		dataObject = JSON.parse(dataObject);
		if(dataObject.error) return q('#tabla-facturas').innerHTML = dataObject.error;

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
        	tablaHTML += `<td><span class="secundario">Pagado:</span> ${objectoFactura.estaPagado ? 'Si' : 'No'}
        		<br/><span class="secundario">Procesado:</span> ${objectoFactura.estaProcesado ? 'Si' : 'No'}
        		<br/><span class="secundario">Enviado:</span> ${objectoFactura.estaEnviado ? 'Si' : 'No'}</td>`;
        	//Acciones
        	tablaHTML += `<td>work in progress</td>`;
        	tablaHTML += `</tr>`;
        	//Index empieza a contar en 0, length empieza a contar en 1
        	if(index >= dataObject.facturas.length - 1){
        		q('.contenedor-mensaje-carga').style.display = 'none';
        		q('#tabla-facturas').innerHTML = tablaHTML;
        	}
        });
	});
};

//Te genera el widget de la paginación para las facturas
function crearPaginacionFacturas(){
	httpGet(`/api/get-paginacion-facturas?ppp=${productosPorPagina}`, dataObject => {

		if(dataObject) dataObject = JSON.parse(dataObject);
		//If no dataobject or dataobject error
		if(dataObject ? dataObject.error : !dataObject){
			q('#filtros-facturas, #paginacion-footer-facturas').style.display = 'block';
			qAll('.paginacion-facturas').forEach(paginador => {
				paginador.style.display = 'block';
				paginador.innerHTML = `<div class="error">Error creando la paginación. 
				<button class="recargar-paginacion" onclick="crearPaginacionFacturas()">Recargar</button></div>`;
			});
		}else if(dataObject.paginasTotales <= 1){
			q('#filtros-facturas, #paginacion-footer-facturas').style.display = 'block';
			qAll('.paginacion-facturas').forEach(paginador => {
				paginador.innerHTML = 'No hay más páginas.';
			});
		}else{
			let paginadorHTML = '',
				pt = dataObject.paginasTotales,
				maxPaginasAMostrar = pt,
				paginaInicialAMostrar = 1;
			// for (var i = 1; i <= dataObject.paginasTotales; i++) {
			// 	if(i === pageActual) paginadorHTML += `<span class="button-pagina pagina-activa">${i}</span>`;
			// 	else paginadorHTML += `<span class="button-pagina">${i}</span>`;
			// }

			//Quitamos la página activa
			if(q('.pagina-activa')) q('.pagina-activa').className = '';
			//Calculamos cuántas páginas mostrar en esa vista
			if(pt > 3 && pageActual === 1)
				maxPaginasAMostrar = 3;
			else if(pt > 3 && pageActual > 1 && pageActual !== pt)
				maxPaginasAMostrar = (pageActual+1);
			else if(pt > 3 && pageActual === pt)
				maxPaginasAMostrar = pageActual;
			//Calculamos la página inicial a mostrar en la izquierda
			if(pageActual > 1 && pageActual === pt && pt >= 3)
				paginaInicialAMostrar = pageActual-2;
			else if(pageActual > 1)
				paginaInicialAMostrar = pageActual-1;
			//Creamos el botón de anterior
			if(pageActual > 1)
				paginadorHTML += `<span class="button-pagina" onclick="generarFacturas(${pageActual-1})">Anterior</span> `;
			else
				paginadorHTML += `<span class="button-pagina">Anterior</span> `;
			//Creamos los 3 botones numéricos con las páginas a mostrar
			for(let i = paginaInicialAMostrar; i <= maxPaginasAMostrar; i++) {
				if(i === pageActual) paginadorHTML += `<span class="button-pagina pagina-activa" onclick="generarFacturas(${i})">${i}</span>`;
				else paginadorHTML += `<span class="button-pagina" onclick="generarFacturas(${i})">${i}</span>`;
			}
			//Crear el botón de página final si hay más de 3 páginas y no se muestra ya la página final en el loop de antes
			if(pt > 3 && pageActual < (pt-1))
				paginadorHTML += `<span class="button-pagina" onclick="generarFacturas(${pt})">${pt}</span>`;
			//Crear el botón de siguiente
			if(pageActual === pt)
				paginadorHTML += ` <span class="button-pagina">Siguiente</span>`;
			else
				paginadorHTML += ` <span class="button-pagina" onclick="generarFacturas(${pageActual+1})">Siguiente</span>`;
			//Mostramos los contenedores de los paginadores
			q('#filtros-facturas, #paginacion-footer-facturas').style.display = 'block';
			//Insertamos el paginador creado en cada contenedor
			qAll('.paginacion-facturas').forEach(paginador => {
				paginador.innerHTML = paginadorHTML;
			});
		}
	});
};