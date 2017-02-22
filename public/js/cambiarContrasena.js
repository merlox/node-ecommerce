q('#formulario-contrasena').addEventListener('submit', (e) => {
	e.preventDefault();
	q('.success').innerHTML = '';
	q('.error').innerHTML = '';
	q('input[type=submit]').setAttribute('disabled', 'disabled');
	let inputs = qAll('#formulario-contrasena input:not([type=submit])');
	if(inputs[1].value != inputs[2].value){
		q('input[type=submit]').removeAttribute('disabled');
		return q('.error').innerHTML = 'Las contraseñas no coinciden.';
	}
	let dataObject = {
		'username': inputs[0].value,
		'contrasena': inputs[1].value
	};
	let token = window.location.pathname.split('/')[2];
	httpPost(`/api/confirmar-cambiar-contrasena/${token}`, dataObject, err => {
		q('.success').innerHTML = '';
		q('.error').innerHTML = '';
		q('input[type=submit]').removeAttribute('disabled');
		if(err && err != '') q('.error').innerHTML = err;
		else q('.success').innerHTML = 'Contraseña cambiada correctamente';
	});
});