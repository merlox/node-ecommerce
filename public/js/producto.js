'use strict';
new Minislider('Vistos anteriormente', 'vistosAnteriormente', '#minislider-vistos-anteriormente');
new Minislider('Otros clientes han comprado también...', 'compradosJuntos', '#minislider-comprados-juntos');
new Minislider('Te pueden interesar', 'random', '#minislider-random');

//Para colocar la imagen secundaria activa como principal on hover
let imagenSecundariaActivaAnterior = document.getElementsByClassName('contenedor-imagen-secundaria-individual')[0];
imagenSecundariaActivaAnterior.className = 'contenedor-imagen-secundaria-individual imagen-secundaria-activa';
function imageHover(e){
	imagenSecundariaActivaAnterior.className = 'contenedor-imagen-secundaria-individual';
	e.parentNode.className = 'contenedor-imagen-secundaria-individual imagen-secundaria-activa';
	document.getElementById('imagen-principal').src = e.src;
	imagenSecundariaActivaAnterior = e.parentNode;
}

//Conseguir las imágenes que se colocan automaticamente
let permalinkUrl = window.location.pathname.slice(3);
httpGet('/api/get-images/'+permalinkUrl);

//Para expandir el texto o no con el botón de expandir texto
q('#contenedor-button-expandir-texto').addEventListener('click', () => {
	q('#producto-descripcion').style.height = 'auto';
	q('#contenedor-button-expandir-texto').style.display = 'none';
	q('#producto-descripcion-fade').style.display = 'none';
});
