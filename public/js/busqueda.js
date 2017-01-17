'use strict';

let paginasTotales = q('.paginacion').innerHTML;
q('.paginacion').innerHTML = '';

function loadPage(i){
	window.location = `/search?q=${getParameterByName('q')}&pag=${i}`;
};

function crearPaginacion(){
	let paginacionHtml = '';
	let paginaActual = parseInt(getParameterByName('pag'));
	for(let i = 1; i < paginasTotales; i++){
		if(paginaActual === i)
			paginacionHtml += `<span class="pagina-activa" onclick="loadPage(${i})">${i}</span>`;	
		else
			paginacionHtml += `<span onclick="loadPage(${i})">${i}</span>`;
	}
	qAll('.paginacion').forEach(paginacion => {
		paginacion.innerHTML = paginacionHtml;
	});
};

crearPaginacion();