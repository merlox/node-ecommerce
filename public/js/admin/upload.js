'use strict';
let imagenesProducto = {};
let informacionProducto = {};
let contenidosMainMenu = "";
let scrollProductosPosition = 0;

//imagenesProducto = {
//  "1" : [
//    "ubicación": "ubicación imagen"
//  ],
//  "2": ...
//}
//El 1 representa la ubicación, siendo 1 la imágen más grande y el resto miniaturas.

function guardarPublicarProducto(publicar){
  scrollProductosPosition = q('#seccion-productos').scrollTop;
  if(!comprobarDatosSubidaProducto()){
    let mensajeErrorHTML = `Error subiendo el producto, los campos no pueden estar vacíos<br/>
      <button onclick="q('.mensaje-error-subida').style.display = 'none'">Vale</button>`;
    q('.mensaje-error-subida').style.display = 'block';
    q('.mensaje-error-subida').innerHTML = mensajeErrorHTML;
    return;
  }else{
    q('.mensaje-error-subida').style.display = 'none';
    q('.mensaje-error-subida').innerHTML = '';
  }
  informacionProducto = {
    'titulo': id('producto-title').value,
    'permalink': id('permalink').value,
    'precio': id('producto-precio').value,
    'descripcion': id('producto-descripcion').value,
    'atributos': objetoAtributos,
    'imagenes': imagenesProducto,
    'publicado': false
  }
  //La categoria seleccionada se añade a este mismo objeto con el js del categoria.js
  let productoCategorias = id('producto-categorias');
  informacionProducto.categoria = productoCategorias.childNodes[productoCategorias.selectedIndex].innerHTML;

  if(publicar) informacionProducto.publicado = true;  

  uploadCategoriasServer();

  httpPost('/admin/upload-product', informacionProducto, err => {
    if(err){
      let mensajeErrorHTML = `${responseObject.error}<br/>
        <button onclick="q('.mensaje-error-subida').style.display = 'none'">Vale</button>`;
      q('.mensaje-error-subida').style.display = 'block';
      q('.mensaje-error-subida').innerHTML = mensajeErrorHTML;
      return;
    }
    q('#image-upload-input').value = ''; //Reseteamos el input de imagenes
    q('#imagen-principal').style.display = 'block';
    resetAllProductData();
    //Funcion del editProducts.js para generar las cajas de productos
    crearCajasProductos();
  });
};
//Función para comprobar que no haya campos vacíos al subir un producto
function comprobarDatosSubidaProducto(){
  let resultado = false,
    ok = true,
    inputsProducto = qAll('#producto-title, #permalink, #producto-precio, #producto-descripcion');
  for(let i = 0; i < inputsProducto.length; i++){
    let input = inputsProducto[i];
    //If la input is empty
    if(input.value === '') ok = false;
  }
  if(ok) resultado = true;
  return resultado;
};
function resetAllProductData(){
  //Resetamos las variables globales de cada producto informacionProducto, imagenesProducto, objetoAtributos
  informacionProducto = {};
  imagenesProducto = {};
  objetoAtributos = {}; //Objeto del atributo.js
  id('seccion-preview').className = '';
  id('contenedor-productos').innerHTML = '';
  id('lista-atributos').innerHTML = '';
  id('producto-title').value = '';
  id('permalink').value = '';
  id('producto-precio').value = '';
  id('producto-descripcion').value = '';
  id('contenedor-imagenes-secundarias').innerHTML = '';
  if(id('contenedor-imagen-principal')){
    id('contenedor-imagen-principal').remove();
  }
  id('producto-categorias').innerHTML = '';
  id('imagen-principal').style.display = 'flex';
  //Ocultar los atributos
  id('lista-atributos').innerHTML = '';
  id('lista-atributos').style.display = 'none';
  //Función de categoria.js
  getCategoriesFromServer();
};
//Funcion para activar el overlay negro "cambiar imagenes"
function showChangeImage(e){
  if(id('imagen-principal-uploaded-active') == null){
    e.insertAdjacentHTML('beforeend', '<div id="imagen-principal-uploaded-active">cambiar imágenes</div>');
    id('imagen-principal-uploaded-active').addEventListener('click', () => {
      id('image-upload-input').click();
    });
  }
};
//Funcion para guardar las imagenes en la carpeta de public-uploads
function saveClientImages(){
  let files = id('image-upload-input').files;
  let requestResults;

  if(files.length > 0){
    if(files.length <= 10){

      if(id('contenedor-imagen-principal')){
        id('contenedor-imagen-principal').remove();
      }
      id('contenedor-imagenes-secundarias').innerHTML = '';
      let formData = new FormData();

      for(let i = 0; i < files.length; i++){
        let file = files[i];
        formData.append('uploads[]', file, file.name);
      }
      contenidosMainMenu = q('.main-menu').innerHTML;
      q('.main-menu').style.width = '0%';
      q('.main-menu').innerHTML = '0%';

      let request = new XMLHttpRequest();
      request.upload.addEventListener('progress', (e) => {
        if(e.lengthComputable){
          let percentComplete = parseInt(e.loaded/e.total * 100);
          q('.main-menu').innerHTML = percentComplete + '%';
          q('.main-menu').style.width = percentComplete + '%';
          if(percentComplete >= 100){
            q('.main-menu').innerHTML = contenidosMainMenu;
          }
        }
      }, false);
      request.onreadystatechange = () => {
        if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status <= 300){
          requestResults = JSON.parse(request.responseText);
          imagenesProducto = requestResults;
          mostrarImagenesCliente(imagenesProducto);
        }
      };
      request.open('POST', '/api/upload-image-product', true);
      request.send(formData);
    }else{
      console.log('Error, maximum 10 images', 'error');
    }
  }else{
    console.log('Error, files not recognized.', 'error');
  }
}
//Para mostrar las imágenes en el DOM
function mostrarImagenesCliente(imagenesProducto){

  //Vaciamos las imágenes para que no se acumulen
  id('contenedor-imagenes-secundarias').innerHTML = '';
  if(id('contenedor-imagen-principal') != null){
    id('contenedor-imagen-principal').remove();
  }

  //Ponemos las imágenes sacadas del objeto de imagenes
  for(let i in imagenesProducto){
    if(i == 1){
      let imagenSecundaria = new Image();
      imagenSecundaria.src = '../public-uploads/'+imagenesProducto[i];
      imagenSecundaria.onload = () => {
        let imagenSubidaAltura = (imagenSecundaria.height*40)/imagenSecundaria.width;
        imagenSecundaria.className = 'imagen-secundaria';
        id('contenedor-imagenes-secundarias').insertAdjacentHTML('beforeend',
        '<div onmouseenter="showChangeSecondaryImage(this)" onmouseleave="hideChangeSecondaryImage(this)" id="imagen-secundaria-orden-'+i+'" class="imagen-secundaria-contenedor"></div>');
        let contenedoresImagenesSecundarias = document.getElementsByClassName('imagen-secundaria-contenedor');
        contenedoresImagenesSecundarias[contenedoresImagenesSecundarias.length-1].appendChild(imagenSecundaria);
        contenedoresImagenesSecundarias[contenedoresImagenesSecundarias.length-1].firstChild.style.height = imagenSubidaAltura+'px';
      };
      let imagenPrincipal = new Image();
      let imagenSubidaAltura;
      imagenPrincipal.src = '../public-uploads/'+imagenesProducto[i];
      imagenPrincipal.onload = () => {
        imagenPrincipal.id = 'imagen-principal-uploaded';
        id('imagen-principal').style.display = 'none';
        id('contenedor-interior-imagenes').insertAdjacentHTML('beforeend', '<div onmouseenter="showChangeImage(this);" onmouseleave="hideChangeImage(this);" id="contenedor-imagen-principal"></div>');
        id('contenedor-imagen-principal').appendChild(imagenPrincipal);
        id('contenedor-imagen-principal').style.height = imagenSubidaAltura+'vw';
        id('imagen-principal-uploaded').style.height = imagenSubidaAltura+'vw';
      };
    }else{
      let imagenSecundaria = new Image();
      imagenSecundaria.src = '../public-uploads/'+imagenesProducto[i];
      imagenSecundaria.onload = () => {
        let imagenSubidaAltura = (imagenSecundaria.height*40)/imagenSecundaria.width;
        imagenSecundaria.style.order = i;
        imagenSecundaria.className = 'imagen-secundaria';
        id('contenedor-imagenes-secundarias').insertAdjacentHTML('beforeend',
        '<div onmouseenter="showChangeSecondaryImage(this)" onmouseleave="hideChangeSecondaryImage(this)" id="imagen-secundaria-orden-'+i+'" class="imagen-secundaria-contenedor"></div>');
        let contenedoresImagenesSecundarias = document.getElementsByClassName('imagen-secundaria-contenedor');
        contenedoresImagenesSecundarias[contenedoresImagenesSecundarias.length-1].appendChild(imagenSecundaria);
        contenedoresImagenesSecundarias[contenedoresImagenesSecundarias.length-1].firstChild.style.height = imagenSubidaAltura+'px';
      };
    }
  }
}
//Función para reorganizar miniaturas
function showChangeSecondaryImage(e){
  e.insertAdjacentHTML('beforeend', '<div id="imagen-secundaria-activa-hover"><span id="imagen-secundaria-activa-hover-flecha-up"></span><span id="imagen-secundaria-activa-hover-flecha-down"></span></div>');
  id('imagen-secundaria-activa-hover-flecha-down').addEventListener('click', (e) => {
    let elementos = document.getElementsByClassName('imagen-secundaria-contenedor');
    let elementoSeleccionado = e.target.parentNode.parentNode; //Contenedor de la imagen miniatura
    let orderInicial = parseInt(elementoSeleccionado.id.replace('imagen-secundaria-orden-', ""));
    if(orderInicial < elementos.length){
      let propiedadBajar = imagenesProducto[orderInicial+1];
      //Ahora el OBJETO debe funcionar bien
      imagenesProducto[orderInicial+1] = imagenesProducto[orderInicial];
      imagenesProducto[orderInicial] = propiedadBajar;

      let findId = 'imagen-secundaria-orden-'+(orderInicial+1);
      id(findId).id = 'imagen-secundaria-orden-'+orderInicial;
      elementoSeleccionado.id = 'imagen-secundaria-orden-'+(orderInicial+1);
    };
  });
  id('imagen-secundaria-activa-hover-flecha-up').addEventListener('click', (e) => {
    let elementos = document.getElementsByClassName('imagen-secundaria-contenedor');
    let elementoSeleccionado = e.target.parentNode.parentNode //Contenedor de la imagen miniatura
    let orderInicial = parseInt(elementoSeleccionado.id.replace('imagen-secundaria-orden-', ""));
    if(orderInicial >= 2){
      let propiedadBajar = imagenesProducto[orderInicial-1];
      //Ahora el OBJETO debe funcionar bien
      imagenesProducto[orderInicial-1] = imagenesProducto[orderInicial];
      imagenesProducto[orderInicial] = propiedadBajar;

      let findId = 'imagen-secundaria-orden-'+(orderInicial-1);
      id(findId).id = 'imagen-secundaria-orden-'+orderInicial;
      elementoSeleccionado.id = 'imagen-secundaria-orden-'+(orderInicial-1);
    };
    if(orderInicial == 2){
      let imagenPrincipalNueva = id('imagen-secundaria-orden-1').firstChild;
      id('imagen-principal-uploaded').src = imagenPrincipalNueva.src;
    }
  });
}
//Para eliminar el overlay de flechas negro sobre las imagenes secundarias
function hideChangeSecondaryImage(e){
  e.lastChild.remove();
}
//Para ocultar el overlay de "Cambiar imagenes"
function hideChangeImage(e){
  id('imagen-principal-uploaded-active').remove();
}
//Guardar el producto con publicado : 'no'
id('button-guardar-producto').addEventListener('click', () => {
  guardarPublicarProducto(false);
});
//Guardar el producto con publicado : 'si'
id('button-publicar-producto').addEventListener('click', () => {
  guardarPublicarProducto(true);
});
id('imagen-principal').addEventListener('click', () => {
  id('image-upload-input').click();
});
//Funcion que se encarga de mostrar las imágenes
id('image-upload-input').addEventListener('change', () => {
  saveClientImages();
});
