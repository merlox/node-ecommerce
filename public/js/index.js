'use strict';

window.addEventListener('load', () => {
	new Minislider('Más vendidos', 'vendidos', '#minislider1');
	new Minislider('Vistos anteriormente', 'vistosAnteriormente', '#minislider2');
	new Minislider('Novedades', 'recientes', '#minislider4');
	new Minislider('Te pueden interesar', 'random', '#minislider5');
});