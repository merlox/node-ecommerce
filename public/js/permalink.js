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
document.getElementById('producto-title').addEventListener('keyup', () => {
  	document.getElementById('permalink').value = 
  		document.getElementById('producto-title').value.replace(/(\?|\\|\/|:|\*|"|<|>|\|| )+/g, "-");
  	checkPermalinkState();
});
document.getElementById('permalink').addEventListener('keyup', () => {
	checkPermalinkState();
});