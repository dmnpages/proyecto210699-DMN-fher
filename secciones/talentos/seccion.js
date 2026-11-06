(function () {
  var D = window.Dreamers;
  var RANGOS = [[0, 1e4], [1e4, 5e4], [5e4, 1e5], [1e5, Infinity]];

  D.registrar('talentos', function (el) {
    var c = D.contenido.talentos, f = c.filtros || {};
    var estado = { tipo: '', rango: '', orden: '' };

    function seguidoresDe(t) { var n = D.numSeguidores(D.totalSeguidores(t)); return n === null ? 0 : n; }
    function tiposDe(t) {
      return D.categoriasDe(t);
    }
    function tarjeta(t) {
      var url = D.rutaTalento(t.carpeta);
      var soc = (t.redes || []).map(function (r) {
        var href = D.enlaceRed(r);
        return href ? '<a class="red-badge" href="' + D.esc(href) + '" target="_blank" rel="noopener noreferrer" title="' + D.esc(r.plataforma) + '">' + D.iconoRed(r.plataforma) + '</a>'
                    : '<span class="red-badge" title="' + D.esc(r.plataforma) + '">' + D.iconoRed(r.plataforma) + '</span>';
      }).join('');
      return '<article class="card"><a class="ph" href="' + url + '" tabindex="-1" aria-hidden="true">' + D.img(D.rutaFoto(t), '', t) + '</a>' +
        '<div class="body"><h4><a href="' + url + '">' + D.esc(t.nombre) + '</a></h4><div class="soc">' + soc + '</div>' +
        '<div class="fol">' + D.esc(D.totalSeguidores(t)) + '+<small>' + D.esc(c.etiquetaSeguidores) + '</small></div>' +
        '<a class="btn dark sm" href="' + url + '">' + D.esc(c.textoBoton) + '</a></div></article>';
    }

    // Tipos disponibles: se sacan solos de las categorías de cada creador de contenido.
    // Si ya nadie tiene una categoría, su botón desaparece del filtro.
    var tipos = [], vistos = {};
    D.talentos.forEach(function (t) { tiposDe(t).forEach(function (x) { var k = x.toLowerCase(); if (!vistos[k]) { vistos[k] = 1; tipos.push(x); } }); });
    tipos.sort(function (a, b) { return a.localeCompare(b, 'es'); });

    var mostrarFiltros = D.talentos.length > 1;
    var barra = '';
    if (mostrarFiltros) {
      barra = '<div class="filtros">' +
        (tipos.length > 1 ? '<div class="chips" role="group" aria-label="' + D.esc(f.tipo || 'Tipo') + '"><button type="button" class="chip" data-tipo="" aria-pressed="true">' + D.esc(f.todos || 'Todos') + '</button>' +
          tipos.map(function (x) { return '<button type="button" class="chip" data-tipo="' + D.esc(x.toLowerCase()) + '" aria-pressed="false">' + D.esc(x) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="selects">' +
        '<label>' + D.esc(f.seguidores || 'Seguidores') + '<select data-f="rango"><option value="">' + D.esc(f.cualquiera || 'Cualquiera') + '</option>' +
          '<option value="0">' + D.esc(f.rango0 || 'Menos de 10K') + '</option><option value="1">' + D.esc(f.rango1 || '10K - 50K') + '</option><option value="2">' + D.esc(f.rango2 || '50K - 100K') + '</option><option value="3">' + D.esc(f.rango3 || 'Más de 100K') + '</option></select></label>' +
        '<label>' + D.esc(f.ordenar || 'Ordenar por') + '<select data-f="orden"><option value="">' + D.esc(f.ordenOriginal || 'Orden de la agencia') + '</option>' +
          '<option value="mas">' + D.esc(f.mas || 'Más seguidores') + '</option><option value="menos">' + D.esc(f.menos || 'Menos seguidores') + '</option><option value="az">' + D.esc(f.az || 'Nombre (A-Z)') + '</option></select></label>' +
        '</div></div><p class="filtro-estado" role="status" aria-live="polite"></p>';
    }
    el.innerHTML = '<div class="sec white"><div class="in"><h2 class="t">' + D.esc(c.titulo) + '</h2>' + barra + '<div class="grid"></div></div></div>';

    var grid = el.querySelector('.grid'), msg = el.querySelector('.filtro-estado');
    function pintar() {
      var lista = D.talentos.filter(function (t) {
        if (estado.tipo && !tiposDe(t).some(function (x) { return x.toLowerCase() === estado.tipo; })) return false;
        if (estado.rango !== '') { var n = seguidoresDe(t), r = RANGOS[+estado.rango]; if (!(n >= r[0] && n < r[1])) return false; }
        return true;
      });
      if (estado.orden === 'mas') lista.sort(function (a, b) { return seguidoresDe(b) - seguidoresDe(a); });
      else if (estado.orden === 'menos') lista.sort(function (a, b) { return seguidoresDe(a) - seguidoresDe(b); });
      else if (estado.orden === 'az') lista.sort(function (a, b) { return String(a.nombre).localeCompare(String(b.nombre), 'es'); });
      grid.innerHTML = lista.length ? lista.map(tarjeta).join('') : '<p class="sin-resultados">' + D.esc(f.vacio || 'No hay creadores de contenido con esos filtros.') + ' <button type="button" class="chip" data-limpiar>' + D.esc(f.limpiar || 'Ver todos') + '</button></p>';
      if (msg) msg.textContent = (estado.tipo || estado.rango !== '') ? String(f.resultado || 'Mostrando {n} de {total}').replace('{n}', lista.length).replace('{total}', D.talentos.length) : '';
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      if (b.hasAttribute('data-limpiar')) { estado = { tipo: '', rango: '', orden: '' }; el.querySelectorAll('select').forEach(function (s) { s.value = ''; }); }
      else estado.tipo = b.getAttribute('data-tipo');
      el.querySelectorAll('.chips .chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-tipo') === estado.tipo)); });
      pintar();
    });
    el.addEventListener('change', function (e) { var s = e.target.closest('select[data-f]'); if (!s) return; estado[s.getAttribute('data-f')] = s.value; pintar(); });
    pintar();
  });
})();
