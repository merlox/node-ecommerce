let objetoImagenes = {};
function uploadSliderImages(){
	let files = q('#input-slider').files;
	let formData = new FormData();
	for(let i = 0; i < files.length; i++){
		let file = files[i];
		formData.append('uploads[]', file, file.name);
	}
	httpPostPlain('/api/upload-image-product', formData, (results) => {
		colocarImagenesSlider(results);
	});
};
function colocarImagenesSlider(jsonData){
	let objetoImagenes = JSON.parse(jsonData);
	let contenedorImagenes = q('#contenedor-imagenes-slider');
	q('#placeholder-slider').style.display = 'none';
	contenedorImagenes.style.display = 'block';
	for(let key in objetoImagenes){
		//Para añadir un margin negativo de la mitad del tamaño que combinado 
		//con left 50% alinea perfecto en el centro siempre
		let img = new Image();
		img.src = '../public-uploads/'+objetoImagenes[key];
		img.className = 'imagen-slider';
		img.style.marginLeft = (-(img.width/2))+'px';
		contenedorImagenes.insertAdjacentHTML('beforeend', img.outerHTML);
	}
};

q('#placeholder-slider').addEventListener('click', () => {
	q('#input-slider').click();
});
q('#input-slider').addEventListener('change', () => {
	uploadSliderImages();
});