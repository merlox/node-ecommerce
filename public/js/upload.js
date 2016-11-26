let imagenesProducto = {};
let informacionProducto = {};
let contenidosMainMenu = "";

//imagenesProducto = {
//  "1" : {
//    "ubicación": "ubicación imagen"
//  },
//  "2": ...
//}
//El 1 representa la ubicación, siendo 1 la imágen más grande y el resto miniaturas.

function guardarPublicarProducto(publicar){
  informacionProducto.titulo = document.getElementById('producto-title').value;
  informacionProducto.permalink = document.getElementById('permalink').value;
  informacionProducto.precio = document.getElementById('producto-precio').value;
  informacionProducto.descripcion = document.getElementById('producto-descripcion').value;
  //La categoria seleccionada se añade a este mismo objeto con el js del categoria.js
  informacionProducto.categoria = document.getElementById('producto-categorias').selectedIndex;
  informacionProducto.atributos = objetoAtributos;
  informacionProducto.imagenes = imagenesProducto;
  informacionProducto.publicado = "no";

  if(publicar){
    informacionProducto.publicado = "si";  
  }

  let categoriasReq = new XMLHttpRequest();
  categoriasReq.open('POST', '/api/guardar-categorias');
  categoriasReq.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
  categoriasReq.onreadystatechange = () => {
    console.log('hi')
    if(categoriasReq.readyState = XMLHttpRequest.DONE){
      messageStatus(request.responseText, 'info');
    }
  };
  categoriasReq.send(JSON.stringify(arrayCategorias));

  let request = new XMLHttpRequest();
  request.open('POST', '/api/upload-product');
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onreadystatechange = () => {
    console.log('hi2')
    if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status <= 300){
      messageStatus(request.responseText, 'info');
      resetAllProductData();
    }else{
      messageStatus('Error, ha habido un error subiendo el archivo '+request.responseText, 'error');
      resetAllProductData();
    }
  };
  request.send(JSON.stringify(informacionProducto));
}

function resetAllProductData(){
  informacionProducto = {};
  imagenesProducto = {};
  //Objeto del atributo.js
  objetoAtributos = {};
  document.getElementById('producto-title').value = '';
  document.getElementById('permalink').value = '';
  document.getElementById('producto-precio').value = '';
  document.getElementById('producto-descripcion').value = '';
  document.getElementById('contenedor-imagenes-secundarias').innerHTML = '';
  if(document.getElementById('contenedor-imagen-principal')){
    document.getElementById('contenedor-imagen-principal').remove();
  }
  document.getElementById('imagen-principal').style.display = 'flex';
  //Ocultar los atributos
  document.getElementById('lista-atributos').innerHTML = '';
  document.getElementById('lista-atributos').style.display = 'none';
}
function showChangeImage(e){
  document.getElementById('contenedor-imagen-principal').style.height = document.getElementById('imagen-principal-uploaded').offsetHeight+"px";
  if(document.getElementById('imagen-principal-uploaded-active') == null){
    e.insertAdjacentHTML('beforeend', '<div id="imagen-principal-uploaded-active">cambiar imágenes</div>');
    document.getElementById('imagen-principal-uploaded-active').style.width = document.getElementById('imagen-principal-uploaded').width+"px";
    document.getElementById('imagen-principal-uploaded-active').style.height = document.getElementById('imagen-principal-uploaded').height+"px";
    document.getElementById('imagen-principal-uploaded-active').addEventListener('click', () => {
      document.getElementById('image-upload-input').click();
    });
  }
}

//Funcion para guardar las imagenes en la carpeta de public-uploads
function saveClientImages(){
  let files = document.getElementById('image-upload-input').files;
  let requestResults;

  if(files.length > 0){
    if(files.length <= 10){
      if(document.getElementById('contenedor-imagen-principal')){
        document.getElementById('contenedor-imagen-principal').remove();
      }
      document.getElementById('contenedor-imagenes-secundarias').innerHTML = '';
      let formData = new FormData();

      for(let i = 0; i < files.length; i++){
        let file = files[i];
        formData.append('uploads[]', file, file.name);
      }

      let request = new XMLHttpRequest();
      request.upload.addEventListener('progress', (e) => {
        if(e.lengthComputable){
          percentComplete = parseInt(e.loaded/e.total * 100);
          document.getElementsByClassName('main-menu')[0].innerHTML = percentComplete + '%';
          document.getElementsByClassName('main-menu')[0].style.width = percentComplete + '%';
          if(percentComplete >= 100){
            document.getElementsByClassName('main-menu')[0].innerHTML = contenidosMainMenu;
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
      messageStatus('Error, maximum 10 images', 'error');
    }
  }else{
    messageStatus('Error, files not recognized.', 'error');
  }
}

//Para mostrar las imágenes en el DOM
function mostrarImagenesCliente(imagenesProducto){

  //Vaciamos las imágenes para que no se acumulen
  document.getElementById('contenedor-imagenes-secundarias').innerHTML = '';
  if(document.getElementById('contenedor-imagen-principal') != null){
    document.getElementById('contenedor-imagen-principal').remove();
  }

  //Ponemos las imágenes sacadas del objeto de imagenes
  for(let i in imagenesProducto){
    if(i == 1){
      let imagenSecundaria = new Image();
      imagenSecundaria.src = '../public-uploads/'+imagenesProducto[i];
      imagenSecundaria.onload = () => {
        let imagenSubidaAltura = (imagenSecundaria.height*40)/imagenSecundaria.width;
        imagenSecundaria.className = 'imagen-secundaria';
        document.getElementById('contenedor-imagenes-secundarias').insertAdjacentHTML('beforeend',
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
        document.getElementById('imagen-principal').style.display = 'none';
        document.getElementById('contenedor-interior-imagenes').insertAdjacentHTML('beforeend', '<div onmouseenter="showChangeImage(this);" onmouseleave="hideChangeImage(this);" id="contenedor-imagen-principal"></div>');
        document.getElementById('contenedor-imagen-principal').appendChild(imagenPrincipal);
        document.getElementById('contenedor-imagen-principal').style.height = imagenSubidaAltura+'vw';
        document.getElementById('imagen-principal-uploaded').style.height = imagenSubidaAltura+'vw';
      };
    }else{
      let imagenSecundaria = new Image();
      imagenSecundaria.src = '../public-uploads/'+imagenesProducto[i];
      imagenSecundaria.onload = () => {
        let imagenSubidaAltura = (imagenSecundaria.height*40)/imagenSecundaria.width;
        imagenSecundaria.style.order = i;
        imagenSecundaria.className = 'imagen-secundaria';
        document.getElementById('contenedor-imagenes-secundarias').insertAdjacentHTML('beforeend',
        '<div onmouseenter="showChangeSecondaryImage(this)" onmouseleave="hideChangeSecondaryImage(this)" id="imagen-secundaria-orden-'+i+'" class="imagen-secundaria-contenedor"></div>');
        let contenedoresImagenesSecundarias = document.getElementsByClassName('imagen-secundaria-contenedor');
        contenedoresImagenesSecundarias[contenedoresImagenesSecundarias.length-1].appendChild(imagenSecundaria);
        contenedoresImagenesSecundarias[contenedoresImagenesSecundarias.length-1].firstChild.style.height = imagenSubidaAltura+'px';
      };
    }
  }
}

function hideChangeImage(e){
  document.getElementById('imagen-principal-uploaded-active').remove();
}
//Función para reorganizar miniaturas
function showChangeSecondaryImage(e){
  e.insertAdjacentHTML('beforeend', '<div id="imagen-secundaria-activa-hover"><span id="imagen-secundaria-activa-hover-flecha-up"></span><span id="imagen-secundaria-activa-hover-flecha-down"></span></div>');
  document.getElementById('imagen-secundaria-activa-hover-flecha-down').addEventListener('click', (e) => {
    let elementos = document.getElementsByClassName('imagen-secundaria-contenedor');
    let elementoSeleccionado = e.target.parentNode.parentNode; //Contenedor de la imagen miniatura
    let orderInicial = parseInt(elementoSeleccionado.id.replace('imagen-secundaria-orden-', ""));
    if(orderInicial < elementos.length){
      let propiedadBajar = imagenesProducto[orderInicial+1];
      //Ahora el OBJETO debe funcionar bien
      imagenesProducto[orderInicial+1] = imagenesProducto[orderInicial];
      imagenesProducto[orderInicial] = propiedadBajar;

      let findId = 'imagen-secundaria-orden-'+(orderInicial+1);
      document.getElementById(findId).id = 'imagen-secundaria-orden-'+orderInicial;
      elementoSeleccionado.id = 'imagen-secundaria-orden-'+(orderInicial+1);
    };
  });
  document.getElementById('imagen-secundaria-activa-hover-flecha-up').addEventListener('click', (e) => {
    let elementos = document.getElementsByClassName('imagen-secundaria-contenedor');
    let elementoSeleccionado = e.target.parentNode.parentNode //Contenedor de la imagen miniatura
    let orderInicial = parseInt(elementoSeleccionado.id.replace('imagen-secundaria-orden-', ""));
    if(orderInicial >= 2){
      let propiedadBajar = imagenesProducto[orderInicial-1];
      //Ahora el OBJETO debe funcionar bien
      imagenesProducto[orderInicial-1] = imagenesProducto[orderInicial];
      imagenesProducto[orderInicial] = propiedadBajar;

      let findId = 'imagen-secundaria-orden-'+(orderInicial-1);
      document.getElementById(findId).id = 'imagen-secundaria-orden-'+orderInicial;
      elementoSeleccionado.id = 'imagen-secundaria-orden-'+(orderInicial-1);
    };
    if(orderInicial == 2){
      let imagenPrincipalNueva = document.getElementById('imagen-secundaria-orden-1').firstChild;
      document.getElementById('imagen-principal-uploaded').src = imagenPrincipalNueva.src;
      if(window.innerWidth <= 700){
        document.getElementById('imagen-principal-uploaded').style.height = ((imagenPrincipalNueva.naturalHeight*22)/imagenPrincipalNueva.naturalWidth)+"vw";
      }else{
        document.getElementById('imagen-principal-uploaded').style.height = ((imagenPrincipalNueva.naturalHeight*28)/imagenPrincipalNueva.naturalWidth)+"vw";
      }
    }
  });
}
function hideChangeSecondaryImage(e){
  e.lastChild.remove();
}
document.getElementById('button-guardar-producto').addEventListener('click', () => {
  console.log('Called');
  guardarPublicarProducto(false);
});
document.getElementById('button-publicar-producto').addEventListener('click', () => {
  console.log('Called');
  guardarPublicarProducto(true);
});
document.getElementById('imagen-principal').addEventListener('click', () => {
  document.getElementById('image-upload-input').click();
  contenidosMainMenu = document.getElementsByClassName('main-menu')[0].innerHTML;
  document.getElementsByClassName('main-menu')[0].style.width = '0%';
  document.getElementsByClassName('main-menu')[0].innerHTML = '0%';
});
//Funcion que se encarga de mostrar las imágenes
document.getElementById('image-upload-input').addEventListener('change', () => {
  saveClientImages();
});
