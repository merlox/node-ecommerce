'use strict';
let socket = io(),
  arrayUsuarios = [];

q('.boton-enviar-chat').addEventListener('click', function(e){
  e.preventDefault();
  socket.emit('mensaje chat', q('.escribir-texto').value);
  q('.escribir-texto').value = '';
});

q('.escribir-texto').addEventListener('keypress', function(e){
  if(e.keyCode == 13){
    e.preventDefault();
    socket.emit('mensaje chat', q('.escribir-texto').value);
    q('.escribir-texto').value = '';
  }
});
socket.on('mensaje chat', function(mensaje){
  let mensajeHTML = `<div class="mensaje-propio">${mensaje}</div>`,
    ultimoMensajeNodo = q('.mensajes-chat').lastChild;

  //Si el último mensaje es tuyo, expande el contenedor
  if(ultimoMensajeNodo && ultimoMensajeNodo.className === 'mensaje-propio'){
    ultimoMensajeNodo.innerHTML += `<br/>${mensaje}`;
  }else{
    q('.mensajes-chat').insertAdjacentHTML('beforeend', mensajeHTML);
  }
  //Scroll hacia abajo del todo
  q('.mensajes-chat').scrollTop = q('.mensajes-chat').scrollHeight;
});
socket.on('user connected', function(arrayOfUsersConnected){

  q('.users-connected').innerHTML = '';
  console.log('Array de usuarios conectados: ')
  console.log(arrayOfUsersConnected)

  for(let i=0; i<arrayOfUsersConnected.length; i++){
    q('.users-connected').insertAdjacentHTML('beforeend', arrayOfUsersConnected[i]+'<br/>');
  }
});