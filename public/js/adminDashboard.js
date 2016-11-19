document.getElementById('close-session').addEventListener('click', () => {
  window.location = 'http://192.168.1.111:3000/close-session';
});

if(window.location.pathname == "/admin/dashboard"){
  document.getElementById('dashboard-button').style.color = "rgb(12, 0, 147)";
}

if(window.location.pathname == "/admin/add-product"){
  document.getElementById('add-product-button').style.color = "rgb(12, 0, 147)";
}

if(window.location.pathname == "/admin/edit-products"){
  document.getElementById('edit-products-button').style.color = "rgb(12, 0, 147)";
}
