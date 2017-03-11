/*
objetoSecciones = {
	'titulo': 'contenido esta es la descripcion'
}
 */
//Constructor
function Acordeon(titulo, id){
	this.titulo = titulo;
	this.id = id;
	this.arrayPreguntas;
	this.timeout;
	let that = this;

	getWidget();

	function getWidget(){
		httpGet('/api/get-preguntas-frecuentes', res => {
			if(res) res = JSON.parse(res);
			else return q(id).innerHTML = 'No hay preguntas frecuentes.';
			if(res.error) return q(id).innerHTML = res.error;
			console.log(res)
			if(res.arrayPreguntas && res.arrayPreguntas.length > 0){
				that.arrayPreguntas = res.arrayPreguntas;
				colocarSecciones();
			}else q(id).innerHTML = 'No hay preguntas frecuentes.';
		});
	};

	function colocarSecciones(){
		let seccionesHTML = `<div class="contenedor-total-acordeon">
			<div class="titulo-acordeon">► ${that.titulo}</div>
			<div class="contenedor-acordeon">`;
		for(let i = 0; i < that.arrayPreguntas.length; i++){
			seccionesHTML += `<div class="contenedor-seccion">
				<div class="titulo-seccion">${that.arrayPreguntas[i].pregunta}</div>
				<div class="contenido-seccion">${that.arrayPreguntas[i].respuesta}</div>
				</div>`;
		}
		seccionesHTML += '</div></div>';
		q(id).innerHTML = seccionesHTML;

		addListeners();
		toggleAcordeon(false); //Ocultamos lo que hemos puesto
	};

	function addListeners(){
		let arraySecciones = qAll(`${id} .titulo-seccion`);
		arraySecciones.forEach(acordeon => {
			acordeon.addEventListener('click', () => {
				let nextSibling = acordeon.nextElementSibling;
				//Hay que usar get computed style porque el .style.display solo muestra lo que hay en html como style=""
				if(getComputedStyle(nextSibling).display === 'none'){
					//Ocultamos el anterior mensaje al mostrar uno nuevo
					for (let i = 0; i < arraySecciones.length; i++) {
						if(getComputedStyle(arraySecciones[i].nextElementSibling).display != 'none'){
							arraySecciones[i].nextElementSibling.style.display = 'none';
						}
					}
					nextSibling.style.display = 'block';
				}else
					nextSibling.style.display = 'none';
			});
		});

		//Se ejecuta tras 0.5 segundos de idle para hacer responsive el preguntas frecuentes
		window.addEventListener('resize', () => {
			clearTimeout(that.timeout);
			that.timeout = setTimeout(() => {
				if(window.innerWidth >= 1500){
					toggleAcordeon(true);
				}else{
					toggleAcordeon(false);
				}
			}, 500);
		});

		//Ocultar o mostrar las preguntas al hacer click en el título del widget
		q(`${id} .titulo-acordeon`).addEventListener('mouseenter', () => {
			toggleAcordeon(true);
		});

		q(`${id} .titulo-acordeon`).addEventListener('click', () => {
			toggleAcordeon(false);
		});
	};
	//Oculta o muestra el contenido de "Preguntas frecuentes"
	function toggleAcordeon(isActivo){
		if(!isActivo){
			q(`${id} .contenedor-acordeon`).style.display = 'none';
			q(`${id} .titulo-acordeon`).innerHTML = `► ${that.titulo}`;
		}else{
			q(`${id} .contenedor-acordeon`).style.display = 'block';
			q(`${id} .titulo-acordeon`).innerHTML = `▼ ${that.titulo}`;
		}
	};
};