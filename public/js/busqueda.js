'use strict';

let paginasTotales = q('.paginacion').innerHTML;
q('.paginacion').innerHTML = '';

//Para cargar la página clickada
function loadPage(i){
	window.location = `/search?q=${getParameterByName('q')}&pag=${i}`;
};
//Para crear la paginación e insertarla en los contenedores de paginación
function crearPaginacion(){
	let paginacionHtml = '';
	let paginaActual = getParameterByName('pag') ? parseInt(getParameterByName('pag')) : 1;
	for(let i = 1; i < paginasTotales; i++){
		if(paginaActual === i)
			paginacionHtml += `<span class="pagina-activa" onclick="loadPage(${i})">${i}</span>`;	
		else
			paginacionHtml += `<span onclick="loadPage(${i})">${i}</span>`;
	}
	qAll('.paginacion').forEach(paginacion => {
		paginacion.style.display = 'block';
		paginacion.innerHTML = paginacionHtml;
	});
};
let paginasTotalesFiltro = 0;
//Para filtrar los productos dado el rango de precios
function filtrarPrecio(min, max, page, updatePages){
	let url = `/api/filter?q=${getParameterByName('q')}&pag=${page}&preciomin=${min}&preciomax=${max}`;
	httpGet(url, (data) => {
		try{
			data = JSON.parse(data);
			let products = data.productos;
			let productsHtml = '';
			let header = q('#contenedor-principal').children[0].outerHTML;
			products.forEach((product, index) => {
				productsHtml += `<div class="producto">
					<a href="/p/${product.permalink}"><img class="producto-imagen" src="../public-uploads/${product.imagen}" width="300px"></a>
					<span class="precio-producto">${product.precio}€</span>
					<a href="/p/${product.permalink}" class="titulo-producto">${product.titulo}</a>
					<span class="categoria-producto">${product.categoria}</span>
		    	</div>`;
		    	if(index >= (products.length-1)){
		    		productsHtml = header+productsHtml;
		    		q('#contenedor-principal').innerHTML = productsHtml;
		    	}
			});
			//Cambiamos el mensaje de mostrando resultados
			q('.mensaje-resultados').innerHTML = `Mostrando ${products.length} resultados.`;

			if(updatePages) paginasTotalesFiltro = data.hayPaginas ? data.paginas : paginasTotalesFiltro;

			let paginasHtml = '';
			if(data.hayPaginas && updatePages){
				q('.paginacion').style.display = 'block';
				for(let i = 1; i <= paginasTotalesFiltro; i++) {
					if(i === page) paginasHtml += `<span class="pagina-activa" onclick="filtrarPrecio(${min}, ${max}, ${i}, false)">${i}</span>`;
					else paginasHtml += `<span onclick="filtrarPrecio(${min}, ${max}, ${i}, false)">${i}</span>`;
				}
				q('.paginacion').innerHTML = paginasHtml;
			}else if(!data.hayPaginas && updatePages){
				q('.paginacion').style.display = 'none';
			}else{
				//El paginador se mantiene igual solo que cambia la pagina activa
				q('.paginacion .pagina-activa').className = '';
				q('.paginacion').children[page-1].className = 'pagina-activa';
			}
		}catch(e){
			console.log('Error filtering products.');
		}
	});
	// console.log(getAllParameters());
};

crearPaginacion();

//Para cuando selecionas un radio de filtro de precio
qAll('input[name=precio]').forEach(radio => {
	radio.addEventListener('change', (e) => {
		let radioSelected = parseInt(e.target.value);
		qAll('input[name=precio]').forEach(input => {
			input.checked = false;
		});
		e.target.checked = true;
		switch(radioSelected){
			case 0:
				filtrarPrecio(0, 0, 1, true);
				break;
			case 1:
				filtrarPrecio(0, 10, 1, true);
				break;
			case 2:
				filtrarPrecio(10, 25, 1, true);
				break;
			case 3:
				filtrarPrecio(25, 40, 1, true);
				break;
			case 4:
				filtrarPrecio(40, 60, 1, true);
				break;
			case 5:
				filtrarPrecio(60, 90, 1, true);
				break;
		}
	});
});
//Para hacer click al radio del precio cuando haces click en su nombre
qAll('.filtro-precio a').forEach(a => {
	a.addEventListener('click', (e) => {
		e.target.parentNode.querySelector('input').click();
	});
});