let categoria = q('#producto-categoria a') ? q('#producto-categoria a').innerHTML : null,
	permalink = window.location.pathname.substring(3),
	titulo = q('#producto-title') ? q('#producto-title').innerHTML : null;

if(titulo){
	breadcrumbsHTML = `
		<a href="/">Inicio</a>
		<a href="/d/${categoria}">${categoria}</a>
		<a href="/p/${permalink}">${titulo}</a>`;
}else{
	breadcrumbsHTML = `
		<a href="/">Inicio</a>
		<a href="/d/${categoria}">${categoria}</a>`;
}
q('#breadcrumbs').innerHTML = breadcrumbsHTML;