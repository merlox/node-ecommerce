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

function replaceBadCharacters(string, cb){
	string = string.replace(/(ñ)+/g, 'n');
	return cb(string.replace(/(\?|\\|\/|:|\*|"|<|>|\|| )+/g, "-"));
}

document.getElementById('producto-title').addEventListener('keyup', () => {
  	
  	replaceBadCharacters(document.getElementById('producto-title').value, (result) => {
  		document.getElementById('permalink').value = result;
  		document.getElementById('permalink').value = encodeURI(result);
  	});
  		
  	checkPermalinkState();
});
document.getElementById('permalink').addEventListener('keyup', () => {
	checkPermalinkState();
});