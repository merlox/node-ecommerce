'use strict';
let paginasTotales = q('.paginacion').innerHTML;

function loadPage(i){
	window.location = `/search?q=${getParameterByName('q')}&pag=${i}`;
};

q('.paginacion').innerHTML = '';
let paginacionHtml = '';
for(let i = 1; i < paginasTotales; i++){
	paginacionHtml += `<span onclick="loadPage(${i})">${i}</span>`;
}

qAll('.paginacion').forEach(paginacion => {
	paginacion.innerHTML = paginacionHtml;
});