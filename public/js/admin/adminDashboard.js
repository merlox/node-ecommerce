window.addEventListener('load', () => {
	//Solicitar el estado de las compras de los productos, con paginación.
	httpGet('/api/facturas', dataObject => {
		dataObject = JSON.parse(dataObject);
		if(dataObject.error) return q('#tabla-facturas').innerHTML = dataObject.error;

		let tablaHTML = `<tr>
				<th>ID</th>
				<th>Comprador</th>
				<th>Productos</th>
				<th>Precio total</th>
				<th>Fecha de compra</th>
				<th>Forma de pago</th>
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
        		fechaAño = fechaHorario[2],
        		fechaMes = fechaHorario[1],
        		fechaDia = fechaHorario[0],
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
        		<br/><span class="secundario">Procesado:</span> ${objectoFactura.estaProcesado ? 'Si' : 'No'}</td>`;
        	tablaHTML += `</tr>`;
        	//Index empieza a contar en 0, length empieza a contar en 1
        	if(index >= dataObject.facturas.length - 1){
        		q('.contenedor-mensaje-carga').style.display = 'none';
        		q('#tabla-facturas').innerHTML = tablaHTML;
        	}
        });
	});
});