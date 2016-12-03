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
	keyword = encodeURI(keyword);
	httpGet('/search/'+keyword+'?limit=20', (results) => {
		q('#buscador-sugerencias').firstChild.innerHTML = '';
		console.log(results);
		if(results != null && results != undefined){
			q('#buscador-sugerencias').style.display = 'block';
			results = JSON.parse(results);
			//Show suggested searches or products
			for(let i = 0; i < results.length; i++){
				let htmlProducto = '<li><a href="http://192.168.1.100:8000/'+results[i].permalink+'">'
					+results[i].titulo+'</a></li>';
				q('#buscador-sugerencias').firstChild.insertAdjacentHTML('beforeend', htmlProducto);
			}
		}else{
			//Si no hay resultados, ocultar la barra de results
			q('#buscador-sugerencias').style.display = 'none';
		}
	});
}

//Ocultar o mostrar el menu de departamentos
q('#departamentos').addEventListener('click', () => {
	ocultarMostrarDepartamentos();
});

q('#buscador').addEventListener('keyup', () => {
	buscarProducto(q('#buscador').value);
});