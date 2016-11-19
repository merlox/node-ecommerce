function id(id){
	return document.getElementById(id);
}
let imagenesSecundarias = document.getElementsByClassName('imagen-secundaria');
for(let i = 0; i<imagenesSecundarias.length; i++){
	imagenesSecundarias[i].height = (imagenesSecundarias[i].height*38)/imagenesSecundarias[i].width;
}