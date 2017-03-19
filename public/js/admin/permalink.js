'use strict';
//Retorna true si está disponible y false si no
function checkPermalinkState(permalink, cb){
	httpGet(`/api/permalink-check/${permalink}`, response => {
		let estaDisponible = false;
		if(response) estaDisponible = JSON.parse(response);
		if(estaDisponible) cb(true);
		else cb(false);
	});
};

function replaceBadCharacters(string){
	string = string.replace(/(ñ)+/g, 'n');
	string = string.toLowerCase();
	string = string.replace(/(\?|\\|\/|:|\*|"|<|>|\|,|\.|:|;| )+/g, "-");
	string = string.replace(/(á)+/g, "a");
	string = string.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); //Excelente: Quitamos las tildes
	string = encodeURIComponent(string);
	return string;
};

function generarPermalinkUnico(permalink){
	return permalink += '-'+Math.random().toString(36).substring(2, 6)+new Date().getTime();
};

document.getElementById('producto-title').addEventListener('keyup', () => {
  	let goodPermalink = replaceBadCharacters(document.getElementById('producto-title').value);
  	document.getElementById('permalink').value = goodPermalink;
  	checkPermalinkState(document.getElementById('permalink').value, estaDisponible => {
  		if(estaDisponible){
  			document.getElementById('permalink').style.backgroundColor = '';
			document.getElementById('permalink').style.color = 'black';
  		}else{
  			document.getElementById('permalink').style.backgroundColor = 'tomato';
			document.getElementById('permalink').style.color = '#850505';
  		}
  	});
});
document.getElementById('permalink').addEventListener('keyup', () => {
  	checkPermalinkState(document.getElementById('permalink').value, estaDisponible => {
  		if(estaDisponible){
  			document.getElementById('permalink').style.backgroundColor = '';
			document.getElementById('permalink').style.color = 'black';
  		}else{
  			document.getElementById('permalink').style.backgroundColor = 'tomato';
			document.getElementById('permalink').style.color = '#850505';
  		}
  	});
});