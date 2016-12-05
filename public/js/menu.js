//Onload get categories
window.onload = () => {
	httpGet('/api/get-categories', (categories) => {
		if(categories != null){
			categories = JSON.parse(categories);
			categories = categories.arrayCategorias;
			for(let i = 0; i < categories.length; i++){
				let htmlCategories = '<li><a href="http://192.168.1.100:8000/departamento/'+categories[i]+'">'
				+categories[i]+'</a></li>';
				//Seleccionamos el 2º child porque el texto indentado se considera como un child
				q('#expandible-departamentos').childNodes[1].insertAdjacentHTML('beforeend', htmlCategories);
			}
		}
	});
	if(getParameterByName('searched')){
		httpPost('/api/guardar-busqueda', getParameterByName('searched'));
	}
};

//Para ocultar o mostrar el menu de departamentos para ir a uno determinado
let isDepartamentosActive = false;
function ocultarMostrarDepartamentos(){
	//En pantallas pequeñas poner el dropdown dentro del menu
	if(window.innerWidth >= 650){
		if(!isDepartamentosActive) q('#expandible-departamentos').className = 'animar-mostrar-departamentos';
		else q('#expandible-departamentos').className = '';
	}else{
		if(!isDepartamentosActive) q('#expandible-departamentos').className = 'animar-mostrar-departamentos-responsive';
		else q('#expandible-departamentos').className = '';
	}
	isDepartamentosActive = !isDepartamentosActive;
}

//Para buscar productos y mostrar palabras sugeridas
function buscarProducto(keyword){
	if(keyword.length >= 3){
		keyword = encodeURI(keyword);
		httpGet('/api/search/'+keyword+'?limite=7', (results) => {
			q('#buscador-sugerencias').firstChild.innerHTML = '';
			if(results != null && results != undefined){
				q('#buscador-sugerencias').style.display = 'block';
				results = JSON.parse(results);
				//Show suggested searches or products
				let htmlProducto = "";
				for(let i = 0; i < results.length; i++){
					if(i < results.length - 1){
						htmlProducto = '<li><a href="http://192.168.1.100:8000/p/'+results[i].permalink
							+'?searched='+encodeURI(q('#buscador').value)+'">'+results[i].titulo+'</a><span class="producto-precio"> '
							+results[i].precio+'€</span></li><hr/>';
					}else{
						htmlProducto = '<li><a href="http://192.168.1.100:8000/p/'+results[i].permalink
							+'?searched='+encodeURI(q('#buscador').value)+'">'+results[i].titulo+'</a><span class="producto-precio"> '
							+results[i].precio+'€</span></li>';
					}
					q('#buscador-sugerencias').firstChild.insertAdjacentHTML('beforeend', htmlProducto);
				}
			}else{
				//Si no hay resultados, ocultar la barra de results
				q('#buscador-sugerencias').style.display = 'none';
			}
		});
	}else{
		q('#buscador-sugerencias').style.display = 'none';
	}
}

//Ocultar o mostrar el menu de departamentos
q('#departamentos').addEventListener('click', () => {
	ocultarMostrarDepartamentos();
});

//Para buscar sugerencias a cada toque
q('#buscador').addEventListener('keyup', () => {
	buscarProducto(q('#buscador').value);
});

q('#icono-busqueda').addEventListener('click', () => {
	//Si la busqueda no esta vacía, redirigir a resultados de busqueda en caso de hacer click a buscar
	if(q('#buscador').value != null && q('#buscador').value != "" && q('#buscador').value != undefined){
		window.location = '//192.168.1.100:8000/search/?searched='+encodeURI(q('#buscador').value);
	}
});