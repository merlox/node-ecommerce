'use strict';
let objetoAtributos = {};
/*
objetoAtributos = {
  "atributo1": [
    valor1, valor2, valor3
  ]
}
*/

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
       objetoAtributos[key].splice(liItemIndex, 1);
    }
  }
  //Delete the item in the dom
  e.parentNode.parentNode.removeChild(e.parentNode);
}

//Para crear nuevos atributos en el dom. Recibe el nombre del atributo a crear (obligatorio param)
function crearNuevoAtributo(nombreNuevoAtributo, valoresAtributo, modo){
  //If not empty string
  q('.mensaje-error').innerHTML = '';

  if(nombreNuevoAtributo !== "" && valoresAtributo !== ""){
    let nodoNuevoAtributo = `<li class="lista-atributos-estilo"><b>${nombreNuevoAtributo}</b>
      <span class="x-delete-icon" onclick="borrarAtributo(this)">&#10006</span><ul>`;
    let arrayValores;

    switch(modo){
      case 'dom':
        arrayValores = valoresAtributo.split('|');
      break;

      case 'objeto':
        arrayValores = valoresAtributo;
      break;
    }

    for(let i = 0; i < arrayValores.length; i++){
      nodoNuevoAtributo += `<li>${arrayValores[i]}</li>`;
    }
    nodoNuevoAtributo += `</ul></li>`;

    //Lo metemos en el objeto de valores con el array creado
    objetoAtributos[nombreNuevoAtributo] = arrayValores;

    q('#lista-atributos').insertAdjacentHTML('beforeend', nodoNuevoAtributo);
    q('#atributo-nuevo-nombre').value = '';  
    q('#atributo-valores').value = '';  
    q('#lista-atributos').style.display = 'block';
  }else{
    q('.mensaje-error').innerHTML = 'Error, los campos no pueden estar vacíos.';
  }
};

q('#button-atributo-add').addEventListener('click', () => {
  let nombreNuevoAtributo = q('#atributo-nuevo-nombre').value,
    valoresAtributo = q('#atributo-valores').value;
  crearNuevoAtributo(nombreNuevoAtributo, valoresAtributo, 'dom');
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
