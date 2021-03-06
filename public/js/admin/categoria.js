let arrayCategorias = [];

window.addEventListener('load', getCategoriesFromServer);

function getCategoriesFromServer(){
  httpGet('/api/get-categories', (categories) => {
     if(categories) {
        categories = JSON.parse(categories);
        categories = categories.arrayCategorias;
    } else {
      let mensajeErrorHTML = `No se han encontrado categorías<br/>
        <button onclick="q('.mensaje-error-subida').style.display = 'none'">Vale</button>`;
      q('.mensaje-error-subida').style.display = 'block';
      q('.mensaje-error-subida').innerHTML = mensajeErrorHTML;
      return;
    }
    //Para el objeto global de categorias
    arrayCategorias = categories;
    let categoriasHTML = '';
    for(let i = 0; i < categories.length; i++){
      categoriasHTML += `<option>${categories[i]}</option>`;
    }
    let indexCategoriaSeleccionadaAhora = id('contenedor-categorias').selectedIndex;
    //Insertamos las categorías
    id('contenedor-categorias').innerHTML = '<option>Filtrar</option>'+categoriasHTML;
    id('producto-categorias').innerHTML = categoriasHTML;
    id('contenedor-categorias').selectedIndex = indexCategoriaSeleccionadaAhora;
  });
};
//Añade una categoría nueva al pulsar "Crear categoría".
function guardarCategoria(){
  let newCategoryValue = id('nueva-categoria').value;
  let newCategoryNode = '<option>'+newCategoryValue+'</option>';
  arrayCategorias.push(newCategoryValue);
  id('producto-categorias').style.display = 'block';
  id('producto-categorias').insertAdjacentHTML('beforeend', newCategoryNode);
  id('contenedor-elementos-categoria').style.display = 'inline-block';
  id('contenedor-categoria-add').style.display = 'none';
  id('nueva-categoria').value = '';
  uploadCategoriasServer();
};
//Sube el array de categorías al servidor
function uploadCategoriasServer(cb){
  for (let i = 0; i < arrayCategorias.length; i++) {
    arrayCategorias[i] = arrayCategorias[i].toLowerCase();
  }
  httpPost('/admin/guardar-categorias', arrayCategorias, err => {
    if(err) console.log(err);
    else console.log('Categorías actualizadas');
  });
};
//Borra una categoría y guarda los cambios en el servidor
function borrarCategoria(){
  let opcionesSelect = id('producto-categorias');
  //Splice elimina el elemento seleccionado del array original Y devuelve el elemento borrado
  //El inner html del option seleccionado
  let optionSelected = id('producto-categorias').children[id('producto-categorias').selectedIndex].innerHTML,
    indexOpcionSelectedArrayCategorias = arrayCategorias.indexOf(optionSelected);

  if(indexOpcionSelectedArrayCategorias != -1){
    arrayCategorias.splice(indexOpcionSelectedArrayCategorias, 1);
  }else{
    alert('Esa categoría no existe en el array de categorías.');
  }
  id('producto-categorias').remove(id('producto-categorias').selectedIndex);

  uploadCategoriasServer();
};
// Deprecated: Para poner el atributo selected="selected" en el option seleccionado del seleccionado de categorias
// function actualizarCategoriaSeleccionada(that){
//   let select = q('#producto-categorias');
//   for (var i = 0; i < select.length; i++) {
//     let option = select[i];
//     //Quitamos el selected actual
//     if(option.hasAttribute('selected')){
//       q('#producto-categorias').children[i].removeAttribute('selected');
//     }
//     //Ponemos el nuevo selected si es el que hemos seleccionado
//     if(option.innerHTML === that.target.value){
//       q('#producto-categorias').children[i].setAttribute('selected', 'selected');
//     }
//   }
// };

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
  borrarCategoria();
});
