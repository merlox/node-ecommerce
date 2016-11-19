let objetoAtributos = {};

function borrarAtributo(e){
  //Eliminamos el nodo en el html
  e.parentNode.parentNode.removeChild(e.parentNode);
  //Borramos el atributo del objeto
  for(let key in objetoAtributos){
    if(key == e.parentNode.firstChild.innerHTML){
      delete objetoAtributos[key];
    }
  }
  if(document.getElementById('lista-atributos').innerHTML == ""){
    document.getElementById('lista-atributos').style.display = 'none';
  }
}

function borrarValorAtributo(e){
  let objectItemIndex = Array.prototype.indexOf.call(e.parentNode.parentNode.parentNode.children, e.parentNode.parentNode);

  //Seleccionamos el dentro li concreto -4 porque hay 4 elementos antes del li
  let liItemIndex = (Array.prototype.indexOf.call(e.parentNode.parentNode.children, e.parentNode)) - 4;

  //Delete the intem in the object array
  for(let key in objetoAtributos){
    if(key == e.parentNode.parentNode.firstChild.innerHTML){
       delete objetoAtributos[key][liItemIndex];
    }
  }
  //Delete the item in the dom
  e.parentNode.parentNode.removeChild(e.parentNode);
}

function insertAtributoValor(e){
  let itemIndex = Array.prototype.indexOf.call(e.parentNode.parentNode.children, e.parentNode);
  let inputValue = document.getElementsByClassName('nuevo-valor-atributo')[itemIndex].value;
  for(let key in objetoAtributos){
    if(key == e.parentNode.firstChild.innerHTML){
      objetoAtributos[key].push(inputValue);
      break;
    }
  }
  document.getElementsByClassName('lista-atributos-estilo')[itemIndex].insertAdjacentHTML('beforeend', '<div class="contenedor-valor-atributo">'+inputValue+'<span class="x-hover-red" onclick="borrarValorAtributo(this)">&#10006</span></div>');

  document.getElementsByClassName('nuevo-valor-atributo')[itemIndex].value = '';
}

document.getElementById('button-atributo-add').addEventListener('click', () => {
  document.getElementById('lista-atributos').style.display = 'block';

  let nombreNuevoAtributo = document.getElementById('atributo-nuevo-nombre').value;
  let nodoNuevoAtributo = '<li class="lista-atributos-estilo"><b>'+nombreNuevoAtributo+'</b> <input class="nuevo-valor-atributo" type="text" placeholder="Nuevo valor atributo"> <button onclick="insertAtributoValor(this)">Añadir valor</button><span class="x-delete-icon" onclick="borrarAtributo(this)">&#10006</span></li>';

  //Añadimos la key del nuevo atributo objeto
  objetoAtributos[nombreNuevoAtributo] = [];
  document.getElementById('lista-atributos').insertAdjacentHTML('beforeend', nodoNuevoAtributo);

  document.getElementById('atributo-nuevo-nombre').value = '';
});
//1. conseguir el index del atributo
//2. usar get class con el index para obtener el valor del input
//3. guardar el valor del input en el array en el valor del objeto asi
// objetoAtributos = {
//  "atributo1": [
//    valor1, valor2, valor3
//  ]
//}

//Array prototype nos da el index dentro del ul osea el primero es 1
// let itemAEleminar = Array.prototype.indexOf.call(e.parentNode.children, e);
