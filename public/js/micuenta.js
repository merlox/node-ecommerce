let facturasPaginaActual = 1;

window.addEventListener('load', () => {
	crearWidgetFacturas(null);
});

function crearWidgetFacturas(pag){

	if(pag) facturasPaginaActual = pag;

	crearPaginadorFacturas();

	q('.big-spinner').style.display = 'inline-block';
	httpGet(`/api/facturas-cliente/${facturasPaginaActual}`, response => {
		response = JSON.parse(response);
		if(response.error) {
			q('.big-spinner').style.display = 'none';
			return q('#compras-recientes').innerHTML = `<b class="error">${response.error}</b>`;
		}
		let tablaHTML = `
			<tr>
				<th>Imagen</th>
				<th>Titulo</th>
				<th>Cantidad</th>
				<th>Total</th>
				<th>Tarjeta</th>
				<th>Fecha compra</th>				
				<th>Enviado</th>
			</tr>`;
		for(let i = 0; i < response.facturas.length; i++){
			for(let j = 0; j < response.facturas[i].productos.length; j++){
				let producto = response.facturas[i].productos[j];
				let fecha = new Date(response.facturas[i].fecha*1000).toISOString(),
		    		fechaHorario = fecha.split('T')[0].split('-'),
		    		diaDeLaSemana = new Date(response.facturas[i].fecha*1000).toString().substring(0, 4),
		    		fechaAño = fechaHorario[0],
		    		fechaMes = fechaHorario[1],
		    		fechaDia = fechaHorario[2],
		    		fechaHoras = fecha.split('T')[1].substring(0, 8);
				tablaHTML += `<tr>
					<td><img src="../public-uploads/${producto.imagen}" class="imagen-compras-recientes" height="100px"/></td>
					<td><a href="/p/${producto.permalink}">${producto.titulo}</a></td>
					<td><p>${producto.cantidad}</p></td>
					<td><p>${producto.precioCentimos/100}€</p></td>
					<td>${response.facturas[i].terminacionTarjeta}</td>
					<td>${fechaDia}/${fechaMes}/${fechaAño} <br/> <span class="secundario">${fechaHoras}</span></td>
					<td>${producto.estaEnviado ? '<p class="si-enviado">Si</p>' : '<p>No</p>'}</td>
					</tr>`;
			}
		}
		q('.big-spinner').style.display = 'none';
		q('#compras-recientes').innerHTML = tablaHTML;
	});
};

function crearPaginadorFacturas(){
	httpGet('/api/contar-facturas-cliente', response => {
		response = JSON.parse(response);
		if(response.error){
			for(let i = 0; i < qAll('.paginacion').length; i++){
				qAll('.paginacion')[i].innerHTML = response.error;
			}
			return;
		}
		if(response.cantidadFacturas > 5){
			let paginadorHTML = '';
			for(let i = 1; i < (response.cantidadFacturas/5)+1; i++){
				if(i === facturasPaginaActual) paginadorHTML += `<span class="pagina-activa" onclick="crearWidgetFacturas(${i})">${i}</span>`;
				else paginadorHTML += `<span onclick="crearWidgetFacturas(${i})">${i}</span>`;
			}
			for(let i = 0; i < qAll('.paginacion').length; i++){
				qAll('.paginacion')[i].style.display = 'block';
				qAll('.paginacion')[i].innerHTML = paginadorHTML;
			}
		}
	});
};

function cambiarContrasena(e){
	e.setAttribute('disabled', 'disabled');
	httpGet('/api/cambiar-contrasena', response => {
		e.removeAttribute('disabled');
		if(response) q('#cambiar-contrasena-response').innerHTML = `<b class="error">${response}</b>`;
		else q('#cambiar-contrasena-response').innerHTML = `<b>Se ha enviado el mensaje correctamente.</b>`;
	});
};