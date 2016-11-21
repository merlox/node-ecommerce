let arrayCategorias = [];

window.onload = () => {
  getCategoriesFromServer();
}

function getCategoriesFromServer(){
  let request = new XMLHttpRequest();
  request.open('GET', '/api/get-categories');
  request.onreadystatechange = () => {
    if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status < 400){
      let resultado = JSON.parse(request.responseText);
      for(let i = 0; i < resultado.arrayCategorias.length; i++){
        document.getElementById('producto-categorias').insertAdjacentHTML('beforeend', '<option>'+resultado.arrayCategorias[i]+'</option>');
      }
    }
  };
  request.send();
}

function guardarButtonEffects(){
  let categoriaSeleccionada = document.getElementById('producto-categorias');
  if(document.getElementById('button-categoria-guardar').innerHTML == 'Cambiar categoría'){
    categoriaSeleccionada.style.display = 'inline-block';
    document.getElementById('producto-categoria-seleccionada').innerHTML = '';
    document.getElementById('button-categoria-guardar').innerHTML = 'Guardar';
    document.getElementById('button-categoria-guardar').className = '';
    document.getElementById('button-categoria-borrar').style.display = 'inline-block';
    document.getElementById('button-activar-nueva-categoria').style.display = 'inline-block';
  } else {
    informacionProducto.categoria = categoriaSeleccionada.options[categoriaSeleccionada.selectedIndex].text;
    categoriaSeleccionada.style.display = 'none';
    document.getElementById('producto-categoria-seleccionada').innerHTML = categoriaSeleccionada.options[categoriaSeleccionada.selectedIndex].text;
    document.getElementById('button-categoria-guardar').innerHTML = 'Cambiar categoría';
    document.getElementById('button-categoria-guardar').className = 'button-no-style';
    document.getElementById('button-categoria-borrar').style.display = 'none';
    document.getElementById('button-activar-nueva-categoria').style.display = 'none';
  }
};

//Hide category widget if no categories
if(document.getElementById('producto-categorias').innerHTML == ""){
  document.getElementById('producto-categorias').style.display = 'none';
}else{
  document.getElementById('producto-categorias').style.display = 'block';
}

document.getElementById('producto-categorias').addEventListener('change', () => {
  if(document.getElementById('producto-categorias').selectedIndex >= 0){
    document.getElementById('button-categoria-guardar').className = '';
    document.getElementById('button-categoria-guardar').addEventListener('click', guardarButtonEffects);
  }
});
document.getElementById('button-activar-nueva-categoria').addEventListener('click', () => {
  document.getElementById('contenedor-elementos-categoria').style.display = 'none';
  document.getElementById('contenedor-categoria-add').style.display = 'inline-block';
});
document.getElementById('button-nueva-categoria-add').addEventListener('click', () => {
  let newCategoryValue = document.getElementById('nueva-categoria').value;
  let newCategoryNode = '<option>'+newCategoryValue+'</option>';
  arrayCategorias.push(newCategoryValue);
  document.getElementById('producto-categorias').style.display = 'block';
  document.getElementById('producto-categorias').insertAdjacentHTML('beforeend', newCategoryNode);
  document.getElementById('contenedor-elementos-categoria').style.display = 'inline-block';
  document.getElementById('contenedor-categoria-add').style.display = 'none';
  document.getElementById('nueva-categoria').value = '';
});
document.getElementById('button-nueva-categoria-cancelar').addEventListener('click', () => {
  document.getElementById('contenedor-elementos-categoria').style.display = 'inline-block';
  document.getElementById('contenedor-categoria-add').style.display = 'none';
});
document.getElementById('button-categoria-borrar').addEventListener('click', () => {
  let categoriaSeleccionada = document.getElementById('producto-categorias');
  if(document.getElementById('producto-categorias').innerHTML == ""){
    document.getElementById('producto-categorias').style.display = 'none';
  }
  arrayCategorias = arrayCategorias.splice(categoriaSeleccionada.selectedIndex, 1);
  categoriaSeleccionada.remove(categoriaSeleccionada.selectedIndex);
  document.getElementById('button-categoria-guardar').className = 'disabled';
  document.getElementById('button-categoria-guardar').removeEventListener('click', guardarButtonEffects);
});
