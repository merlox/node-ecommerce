'use strict';
document.getElementById('close-session').addEventListener('click', () => {
  window.location = 'http://localhost:8000/close-session';
});

if(window.location.pathname == "/admin/dashboard"){
  document.getElementById('dashboard-button').style.color = "rgb(12, 0, 147)";
}

if(window.location.pathname == "/admin/add-product"){
  document.getElementById('add-product-button').style.color = "rgb(12, 0, 147)";
}

if(window.location.pathname == "/admin/edit-products"){
  document.getElementById('see-products-button').style.color = "rgb(12, 0, 147)";
}
