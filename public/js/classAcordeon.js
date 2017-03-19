/*
objetoSecciones = {
	'titulo': 'contenido esta es la descripcion'
}
 */
//Constructor
function Acordeon(titulo, id, isAdmin){
	this.titulo = titulo;
	this.id = id;
	this.arrayPreguntas;
	this.timeout;
	this.isAdmin = isAdmin ? true : false;
	let that = this;

	getWidget();

	function getWidget(){
		httpGet('/api/get-preguntas-frecuentes', res => {
			if(res) res = JSON.parse(res);
			else return q(id).innerHTML = 'No hay preguntas frecuentes.';

			if(res.error) return q(id).innerHTML = res.error;
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
				<div class="contenido-seccion">
					<p>${that.arrayPreguntas[i].respuesta}</p>`;
			if(that.isAdmin){
				seccionesHTML += `<div class="contenedor-acciones">
						<div class="boton-accion editar-pregunta" 
							onclick="acordeonPreguntasFrecuentes.editarPregunta(this, '${that.arrayPreguntas[i]._id}')">
						Editar pregunta</div>
						<div class="boton-accion eliminar-pregunta" 
							onclick="acordeonPreguntasFrecuentes.eliminarPregunta('${that.arrayPreguntas[i]._id}')">
						Eliminar pregunta</div>
					</div>`;
			}
			seccionesHTML += '</div></div>'; //Cerramos el contenido-seccion y el contenedor-seccion
		}
		if(that.isAdmin){
			seccionesHTML += `<div class="contenedor-editar-pregunta">
					<input type="text" name="editar-pregunta" placeholder="Editar pregunta"/>
					<textarea name="editar-respuesta" placeholder="Editar respuesta"></textarea>
					<button class="guardar-cambios">Guardar cambios</button>
					<button class="guardar-cambios"
						onclick="acordeonPreguntasFrecuentes.cancelarCambios()">Cancelar</button>
				</div>`;
		}else{
			seccionesHTML += `</div></div>`;
		}
		q(id).innerHTML = seccionesHTML;

		addListeners();
		toggleAcordeon(false); //Ocultamos lo que hemos puesto
	};
	//Muestra el input y textarea para introducir nuevo contenido
	this.editarPregunta = function(nodo, id){
		q('.contenedor-editar-pregunta').style.display = 'block';
		qAll('.contenedor-seccion').forEach(e => {
			e.style.display = 'none';
		});
		let pregunta = nodo.parentNode.parentNode.parentNode.querySelector('.titulo-seccion').innerHTML;
		let respuesta = nodo.parentNode.parentNode.parentNode.querySelector('.contenido-seccion p').innerHTML;
		q('.contenedor-editar-pregunta input[name=editar-pregunta]').value = pregunta;
		q('.contenedor-editar-pregunta textarea[name=editar-respuesta]').value = respuesta;

		q('button.guardar-cambios').addEventListener('click', () => {
			that.guardarAcordeon(id);
		});
	};

	this.eliminarPregunta = function(id){
		httpGet(`/admin/eliminar-pregunta/${id}`, err => {
			if(err) q('.preguntas-error').innerHTML = err;
			else{
				q('.preguntas-success').innerHTML = 'Pregunta eliminada correctamente';
				recargarAcordeon(); //Funcion del adminPreguntasFrecuentes.js
			}
		});
	};

	this.guardarAcordeon = function(id){
		q('.contenedor-editar-pregunta').style.display = 'none';
		qAll('.contenedor-seccion').forEach(e => {
			e.style.display = 'initial';
		});
		let preguntaModificada = q('.contenedor-editar-pregunta input[name=editar-pregunta]').value;
		let respuestaModificada = q('.contenedor-editar-pregunta textarea[name=editar-respuesta]').value;
		let request = {
			'id': id,
			'preguntaModificada': preguntaModificada,
			'respuestaModificada': respuestaModificada
		};
		httpPost('/admin/editar-pregunta', request, err => {
			if(err) q('.preguntas-error').innerHTML = err;
			else{
				q('.preguntas-success').innerHTML = 'Pregunta eliminada correctamente';
				recargarAcordeon(); //Funcion del adminPreguntasFrecuentes.js
			}
		});
	};

	this.cancelarCambios = function(){
		q('.contenedor-editar-pregunta').style.display = 'none';
		qAll('.contenedor-seccion').forEach(e => {
			e.style.display = 'initial';
		});		
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

//Creamos el widget de preguntas frecuentes en todas las páginas en la esquina inferior derecha
new Acordeon('Preguntas frecuentes', '#preguntas-frecuentes');