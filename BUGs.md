Estos son los bugs actualmente:

- Cuando añades un productos a la cesta y existen en la db varios productos con el mismo nombre, se añaden todos a la cesta en lugar de solo ese. Solución: añadir los productos en función de un campo único de ID o SKU en un input hidden para seleccionar exactamente ese ya que ahora mismo se está usando el permalink como identificador. Otra opción es seguir usando el permalink pero prohibir a los usuarios ingresar titulos que ya existen. O generar un permalink único a cada producto añadiendo una terminación tipo (2), (3).
- En el edit products del admin las cajas de los productos están descolocados y la imagen de + de nuevo producto no se muestra ni en el edit index.
- En el edit index no se muestra la imagen de + y falta poner el permalink a donde te lleva cada imagen.
- Cuando se complete el pago, la cesta debería vaciarse.
DONE- En el minislider de vendidos de la página inicial, el precio se muestra sin decimales.
