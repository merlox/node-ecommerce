window.addEventListener('load', () => {
	new Acordeon('Preguntas frecuentes', '#preguntas-actuales');
});

function enviarNuevaPregunta(){
	let nuevaPregunta = {
		'pregunta': q('[name=pregunta]').value,
		'respuesta': q('[name=respuesta]').value
	};

	httpPost('/api/set-preguntas-frecuentes', nuevaPregunta, err => {
		if(err) q('.preguntas-error').innerHTML = err;
		q('.preguntas-success').innerHTML = 'Tu pregunta se ha guardado correctamente.';
		q('#preguntas-actuales').innerHTML = '';
		new Acordeon('Preguntas actuales', '#preguntas-actuales');
	});
};

q('#enviar-nueva-pregunta').addEventListener('click', enviarNuevaPregunta);