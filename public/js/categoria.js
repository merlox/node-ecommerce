let arrayCategorias = [];

window.addEventListener('load', getCategoriesFromServer());

function getCategoriesFromServer(){
  httpGet('/api/get-categories', (categories) => {
    categories = JSON.parse(categories);
    categories = categories.arrayCategorias;
    //Para el objeto global de categorias
    arrayCategorias = categories;
    for(let i = 0; i < categories.length; i++){
      id('contenedor-categorias').insertAdjacentHTML('beforeend', '<option>'+categories[i]+'</option>');
      id('producto-categorias').insertAdjacentHTML('afterbegin', '<option>'+categories[i]+'</option>');
    }
  });
}

function guardarCategoria(){
  let newCategoryValue = id('nueva-categoria').value;
  let newCategoryNode = '<option>'+newCategoryValue+'</option>';
  arrayCategorias.push(newCategoryValue);
  id('producto-categorias').style.display = 'block';
  id('producto-categorias').insertAdjacentHTML('beforeend', newCategoryNode);
  id('contenedor-elementos-categoria').style.display = 'inline-block';
  id('contenedor-categoria-add').style.display = 'none';
  id('nueva-categoria').value = '';
}

id('button-activar-nueva-categoria').addEventListener('click', () => {
  id('contenedor-elementos-categoria').style.display = 'none';
  id('contenedor-categoria-add').style.display = 'inline-block';
});
id('button-nueva-categoria-add').addEventListener('click', () => {
  guardarCategoria();
});
id('button-nueva-categoria-cancelar').addEventListener('click', () => {
  id('contenedor-elementos-categoria').style.display = 'inline-block';
  id('contenedor-categoria-add').style.display = 'none';
});
id('button-categoria-borrar').addEventListener('click', () => {
  //Comprobamos que no sea la categoria default para que no se elimine
  let opcionesSelect = id('producto-categorias');
  if(opcionesSelect[opcionesSelect.selectedIndex].innerHTML.toLowerCase() != 'default'){
    arrayCategorias = arrayCategorias.splice(id('producto-categorias').selectedIndex, 1);
    id('producto-categorias').remove(id('producto-categorias').selectedIndex);
  }
});
