let acordeonPreguntasFrecuentes;
window.addEventListener('load', () => {
	acordeonPreguntasFrecuentes = new Acordeon('Preguntas frecuentes', '#preguntas-actuales', true);
});

//Envia la nueva pregunta al servidor
function enviarNuevaPregunta(){
	let nuevaPregunta = {
		'pregunta': q('[name=pregunta]').value,
		'respuesta': q('[name=respuesta]').value
	};

	httpPost('/admin/set-preguntas-frecuentes', nuevaPregunta, err => {
		if(err) q('.preguntas-error').innerHTML = err;
		q('.preguntas-success').innerHTML = 'Tu pregunta se ha guardado correctamente.';
		q('#preguntas-actuales').innerHTML = '';
		new Acordeon('Preguntas actuales', '#preguntas-actuales', true);
		//Reseteamos los campos
		q('[name=respuesta]').value = '';
		q('[name=pregunta]').value = '';
	});
};
//Borra las preguntas frecuentes actuales y genera uno nuevo
function recargarAcordeon(){
	q('#preguntas-actuales').innerHTML = '';
	acordeonPreguntasFrecuentes = new Acordeon('Preguntas frecuentes', '#preguntas-actuales', true);
};

q('#enviar-nueva-pregunta').addEventListener('click', enviarNuevaPregunta);