'use strict';

Stripe.setPublishableKey('pk_test_UVgGQ5OoCEARrRvds8bKYV93');

//Para separar el mes y año y colocar los valores en los input hidden
function checkExpireFormat(e){
	let expiraMes = parseInt(e.target.value.substring(0, 2));
	let expiraAno = parseInt(e.target.value.substring(3, 5));
	
	//Añadimos el separador solo si no ha pulsado borrar
	if(e.target.value.length >= 2 && e.code != "Backspace" && e.code != "Delete"){
		e.target.value = e.target.value.substring(0, 2)+'/'+e.target.value.substring(3, 5);
	}

	if(expiraMes != null && !isNaN(expiraMes)){
		q('#expira-mes').value = expiraMes;
	}
	if(expiraAno != null && !isNaN(expiraAno)){
		q('#expira-ano').value = expiraAno;
	}
};
//Para comprobar el formato del numero de la tarjeta
function checkNumberFormat(e){
	if(e.code != "Backspace" && e.code != "Delete"){
		if(e.target.value.length >= 14){
			e.target.value = e.target.value.substring(0, 4)+' '+e.target.value.substring(5, 9)+' '+e.target.value.substring(10, 14)+' '+e.target.value.substring(15);
		}else if(e.target.value.length >= 9){
			e.target.value = e.target.value.substring(0, 4)+' '+e.target.value.substring(5, 9)+' '+e.target.value.substring(10, 14);
		}else if(e.target.value.length >= 5){
			e.target.value = e.target.value.substring(0, 4)+' '+e.target.value.substring(5, 9);
		}else if(e.target.value.length >= 4){
			e.target.value = e.target.value.substring(0, 4)+' ';
		}
	}
};
//Comprueba que los datos de dirección, productos y tarjeta se envíen completos
function comprobarInputsCompletos(){
	let resultado = false,
		ok = true,
		inputsPago = qAll(`#nombreApellidos, #direccion1, #direccion2, #codPostal, #pais, #email, 
			#num-tarjeta, #expira-completo, #cvc, #contenedor-cesta-pagina`);
	for(let i = 0; i < inputsPago.length; i++){
		if(inputsPago[i].value === '') ok = false;
	}
	if(ok) resultado = true;
	return resultado;
};
//Para comprobar la tarjeta pasando por los servidores de stripe y realizar el pago seguro.
function submitPagoStripe(e){
	if(comprobarInputsCompletos()){
		q('#mensaje-error').innerHTML = '';
		q('#submit-pago').setAttribute('disabled', 'disabled');
		q('.spinner-final').style.display = 'block';
		Stripe.card.createToken(q('#payment-form'), (status, response) => {
			//Verificamos que se haya recibido la información de la tarjeta exitosamente
			if(response.error){
				//Si error volver a reiniciar el submit
				q('.payment-errors').style.display = 'inline';
				q('.payment-errors').innerHTML = response.error.message;
				q('#submit-pago').removeAttribute('disabled');
				q('.spinner-final').style.display = 'none';
			}else{
				let token = response.id;
				completarPago(token);
			}
		});
	}else{
		mostrarError('Error, faltan datos de dirección o tarjeta de crédito.');
	}
	//Para evitar que se envie la información al servidor antes de comprobar la info en stripe
	return false;
};
function completarPago(token){
	let arrayProductos = [];
	let objetoCompra = {};

	for(let i = 0; i < qAll('#contenedor-cesta-pagina tr').length; i++){
		let fila = qAll('#contenedor-cesta-pagina tr')[i];
		if(i + 1 < qAll('#contenedor-cesta-pagina tr').length){
			//Permalink-producto innerHTML es el titulo del producto sacado tal cual de la base de datos
			let producto = fila.querySelector('.permalink-producto').innerHTML;
			let cantidad = fila.querySelector('.producto-cesta-cantidad').value;
			let permalink = fila.querySelector('.permalink-producto').href.split('/p/')[1];
			let objetoProducto = {};
			objetoProducto["nombre"] = producto;
			objetoProducto["cantidad"] = cantidad;
			objetoProducto["permalink"] = permalink;
			arrayProductos.push(objetoProducto);
		}
	}
	
	objetoCompra = {
		"token": token,
		"productos": arrayProductos,
		"direccion": {
			"nombreApellidos": q('#nombreApellidos').value,
			"linea1": q('#direccion1').value,
			"linea2": q('#direccion2').value,
			"codPostal": q('#codPostal').value,
			"pais": q('#pais').value,
			"email": q('#email').value,
			"telefono": (q('#telefono') ? q('#telefono').value : null)
		}
	};

	httpPost('/api/pagar-compra', objetoCompra, (response) => {
		response = JSON.parse(response);
		if(response.success){
			window.location.href = "/pago-completado";
		}else{
			mostrarError(response.error);
		}
	});
};

function mostrarError(err){
	window.scrollTo(0, 0);
	q('#submit-pago').removeAttribute('disabled');
	q('.spinner-final').style.display = 'none';
	q('#mensaje-error').innerHTML = `<h4><b>${err}</b></h4>`;
};

//Comprobamos el formato de la expiración de la tarjeta
q('#expira-completo').addEventListener('keyup', checkExpireFormat);
//Comprobamos el formato del nº de la tarjeta
q('#num-tarjeta').addEventListener('keyup', checkNumberFormat);
//Impedimos que pueda pegar en los inputs
q('#num-tarjeta').addEventListener('paste', (e) => {
	e.preventDefault();
	return false;
});
//Ejecutamos el submit de la tarjeta
q('#submit-pago').addEventListener('click', submitPagoStripe);