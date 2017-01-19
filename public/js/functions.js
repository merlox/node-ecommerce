'use strict';
function httpGet(url, cb){
	//If no callback is provided in the function calling, ignore the callback
	if(cb == undefined){
		cb = () => {};	
	}
	let request = new XMLHttpRequest();
	request.open('GET', url);
	request.onreadystatechange = () => {
      if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status <= 300){
		return cb(request.responseText);      
      }else if(request.readyState == XMLHttpRequest.DONE){
      	return cb(null);
      }
	}	
	request.send();
};
function httpPost(url, data, cb){
	if(cb == undefined){
		cb = () => {};	
	}
	let dataJson = {
		'data': data
	};
	let request = new XMLHttpRequest();
	request.open('POST', url);
	request.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
	request.onreadystatechange = () => {
      if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status <= 300){
		return cb(request.responseText);      
      }else if(request.readyState == XMLHttpRequest.DONE){
      	return cb(null);
      }
	}	
	request.send(JSON.stringify(dataJson));	
};
function httpPostPlain(url, data, cb){
	if(cb == undefined){
		cb = () => {};	
	}
	let request = new XMLHttpRequest();
	request.open('POST', url);
	request.onreadystatechange = () => {
      if(request.readyState == XMLHttpRequest.DONE && request.status >= 200 && request.status <= 300){
		return cb(request.responseText);      
      }else if(request.readyState == XMLHttpRequest.DONE){
      	return cb(null);
      }
	}	
	request.send(data);	
};
function loadImage(src){
	return new Promise((resolve, reject) => {
		let img = new Image();
		img.addEventListener('load', () => {
			resolve(img);
		});
		img.addEventListener('error', (e) => {
			reject(img);
		});
		img.src = src;		
	});
};
//Acortador para seleccionar a los elementos de manera sencilla y rápida en el código
function q(selector){
	return document.querySelector(selector);
};
function qAll(selector){
	return document.querySelectorAll(selector);
};
function id(id){
	return document.getElementById(id);
};
//Para extraer los query values de la url
function getParameterByName(name) {
    let match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};
function getAllParameters(){
	let match = '';
	let result = {};
	while((match = new RegExp('[?&](.*?)=([^&]*)').exec(window.location.search)) != null){
		result[match[1]] = decodeURIComponent(match[2].replace(/\+/g, ' '));
	}
    return result;
};