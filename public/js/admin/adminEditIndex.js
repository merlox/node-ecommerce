'use strict';
let objetoImagenes = {
	'imagenes': {},
	'urls': {}
};
//Para enviar las imagenes a public-uploads
function uploadSliderPublic(){
	let files = q('#input-slider').files;
	let formData = new FormData();
	for(let i = 0; i < files.length; i++){
		let file = files[i];
		formData.append('uploads[]', file, file.name);
	}
	//Post plain expects a formdata not json
	httpPostPlain('/api/upload-image-product', formData, (results) => {
		colocarImagenesSlider(results);
		q('#input-slider').value = '';
	});
};
function resetSlider(){
	objetoImagenes = {
		'imagenes': {},
		'urls': {}
	};
	q('#contenedor-imagenes-slider').style.display = 'none';
	q('#placeholder-slider').style.display = 'block';
};
function uploadSliderServer(){
	//Post expects an object
	let urls = qAll('.input-url');
	for (var i = 0; i < urls.length; i++) {
		objetoImagenes.urls[i+1] = urls[i].value;
	}
	httpPost('/api/upload-slider-server', objetoImagenes);
};
//Para colocar las imagenes pasandole el nombre en json
function colocarImagenesSlider(jsonData){
	objetoImagenes.imagenes = JSON.parse(jsonData);
	let contenedorImagenes = q('#contenedor-imagenes-slider');
	q('#placeholder-slider').style.display = 'none';
	let imagenesHTML = '';
	for(let key in objetoImagenes.imagenes){
		imagenesHTML += `<p>Imagen ${key}
			<input class="input-url" type="text" placeholder="Introduce la url empezando por /"></p>
			<img src="/public-uploads/${objetoImagenes.imagenes[key]}" class="imagen-slider"/>`;
	}
	q('#contenedor-imagenes-slider').innerHTML = imagenesHTML;
	q('#contenedor-imagenes-slider').style.display = 'flex';
};

q('#placeholder-slider').addEventListener('click', () => {
	q('#input-slider').click();
});
q('#input-slider').addEventListener('change', uploadSliderPublic);
q('#button-reset-slider').addEventListener('click', resetSlider);
q('#button-publicar-slider').addEventListener('click', () => {
	uploadSliderServer();
	uploadSliderPublic();
});
