'use strict';
q('#expira-completo').addEventListener('keyup', checkExpireFormat);

//Para separar el mes y año y colocar los valores en los input hidden
function checkExpireFormat(e){
	let expiraMes = parseInt(e.target.value.substring(0, 2));
	let expiraAno = parseInt(e.target.value.substring(3, 5));
	
	//Añadimos el separador solo si no ha pulsado borrar
	if(e.target.value.length == 2 && e.code != "Backspace" && e.code != "Delete") e.target.value += '/';

	if(expiraMes != null && !isNaN(expiraMes)){
		q('#expira-mes').value = expiraMes;
	}
	if(expiraAno != null && !isNaN(expiraAno)){
		q('#expira-ano').value = expiraAno;
	}
}