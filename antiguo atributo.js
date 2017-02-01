let atributoHTML = `<div id="contenedor-elementos-atributos">
  <div>Atributos</div>
  <div class="contenedor-magico">

  <input id="atributo-nuevo-nombre" type="text" placeholder="Nombre atributo">
  <input id="atributo-valores" type="text" placeholder="Valores atributo a|b|c">
  <button id="button-atributo-add">Añadir</button>

  </div>
  <ul id="lista-atributos"></ul>
</div>`;

function insertAtributoValor(e){
  //Item index es el index del atributo contenedor de valores
  let itemIndex;
  let inputValue;
  
  console.log(`e = ${e}`);
  /*
    Crear el atributo hijo
    Array.prototype.indexOf.call(parametro arrayPadre, parametro nodoABuscar) lo que hace es decirte el index (numero) donde se encuentra
    el parametro nodoABuscar en el parametro arrayPadre.
    1. Sacamos el index donde se encuentra el contenedor del input
    2. 
  */
  itemIndex = Array.prototype.indexOf.call(e.parentNode.parentNode.children, e.parentNode);
  console.log(`itemIndex = ${itemIndex}`);
  inputValue = document.getElementsByClassName('nuevo-valor-atributo')[itemIndex].value;
  console.log(`inputValue = ${inputValue}`);
  for(let key in objetoAtributos){
    if(key == e.parentNode.firstChild.innerHTML){
      objetoAtributos[key].push(inputValue);
      break;
    }
  }  
  document.getElementsByClassName('lista-atributos-estilo')[itemIndex].insertAdjacentHTML('beforeend', 
    '<div class="contenedor-valor-atributo">'+inputValue+'<span class="x-hover-red" '
    +'onclick="borrarValorAtributo(this)">&#10006</span></div>');

  document.getElementsByClassName('nuevo-valor-atributo')[itemIndex].value = '';
}
