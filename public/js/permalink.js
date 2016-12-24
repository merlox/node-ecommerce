'use strict';
function checkPermalinkState(){
	let request = new XMLHttpRequest();
	request.open('GET', '/api/permalink-check/'+document.getElementById('permalink').value);
	request.onreadystatechange = () => {
		if(request.readyState == XMLHttpRequest.DONE){
			if(request.responseText){
				document.getElementById('permalink').style.backgroundColor = 'tomato';
				document.getElementById('permalink').style.color = '#850505';
			}else{
				document.getElementById('permalink').style.backgroundColor = '';
				document.getElementById('permalink').style.color = 'black';
			}
		}
	}
	request.send();
}

function replaceBadCharacters(string){
	string = string.replace(/(ñ)+/g, 'n');
	string = string.toLowerCase();
	string = string.replace(/(\?|\\|\/|:|\*|"|<|>|\|,|\.|:|;| )+/g, "-");
	string = encodeURIComponent(string);
	return string;
}

document.getElementById('producto-title').addEventListener('keyup', () => {
  	let goodPermalink = replaceBadCharacters(document.getElementById('producto-title').value);
  	document.getElementById('permalink').value = goodPermalink;
  	checkPermalinkState();
});
document.getElementById('permalink').addEventListener('keyup', () => {
	checkPermalinkState();
});