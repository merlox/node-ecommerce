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
      arrayCategorias = resultado.arrayCategorias;
      for(let i = 0; i < resultado.arrayCategorias.length; i++){
        document.getElementById('contenedor-categorias').insertAdjacentHTML('beforeend', '<p>'+arrayCategorias[i]+'</p>');
        document.getElementById('producto-categorias').insertAdjacentHTML('afterbegin', '<option>'+resultado.arrayCategorias[i]+'</option>');
      }
    }
  };
  request.send();
}

function guardarCategoria(){
  let newCategoryValue = document.getElementById('nueva-categoria').value;
  let newCategoryNode = '<option>'+newCategoryValue+'</option>';
  arrayCategorias.push(newCategoryValue);
  document.getElementById('producto-categorias').style.display = 'block';
  document.getElementById('producto-categorias').insertAdjacentHTML('beforeend', newCategoryNode);
  document.getElementById('contenedor-elementos-categoria').style.display = 'inline-block';
  document.getElementById('contenedor-categoria-add').style.display = 'none';
  document.getElementById('nueva-categoria').value = '';
}

document.getElementById('button-activar-nueva-categoria').addEventListener('click', () => {
  document.getElementById('contenedor-elementos-categoria').style.display = 'none';
  document.getElementById('contenedor-categoria-add').style.display = 'inline-block';
});
document.getElementById('button-nueva-categoria-add').addEventListener('click', () => {
  guardarCategoria();
});
document.getElementById('button-nueva-categoria-cancelar').addEventListener('click', () => {
  document.getElementById('contenedor-elementos-categoria').style.display = 'inline-block';
  document.getElementById('contenedor-categoria-add').style.display = 'none';
});
document.getElementById('button-categoria-borrar').addEventListener('click', () => {
  //Comprobamos que no sea la categoria default para que no se elimine
  let opcionesSelect = document.getElementById('producto-categorias');
  if(opcionesSelect[opcionesSelect.selectedIndex].innerHTML.toLowerCase() != 'default'){
    arrayCategorias = arrayCategorias.splice(document.getElementById('producto-categorias').selectedIndex, 1);
    document.getElementById('producto-categorias').remove(document.getElementById('producto-categorias').selectedIndex);
  }
});
