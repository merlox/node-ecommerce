window.addEventListener('load', () => {
	cargarProductosCesta();
});

//TODO this

function cargarProductosCesta(){
	httpGet('/api/productos-cesta', (productosJson) => {
		console.log(productosJson);
	});
};