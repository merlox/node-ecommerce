'use strict';
window.addEventListener('load', () => {
	//Al cargar la página, solicitamos el token de busqueda
	if(getParameterByName('searched')){
		httpGet('/api/search/'+getParameterByName('searched')+'?limite=30', (results) => {
			//TODO THIS, Colocar los productos en cajas
		});
	}
});