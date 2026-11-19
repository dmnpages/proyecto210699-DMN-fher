(function () {
  var D = window.Dreamers;
  // Creadores destacados del inicio:
  //  - Nuevo: los 2 últimos de creadores/lista.js (o los que pongas en "nuevos" dentro de contenido.js)
  //  - Destacado de la semana y Creador promesa: se eligen en contenido.js (campos "semana" y "promesa", con el nombre de la carpeta)
  //  - Más seguidores: se calcula solo
  // Si un creador cumple varias, sale una sola tarjeta con todas sus etiquetas.
  D.registrar('destacados', function (el) {
    var c = D.contenido.destacados, e = c.etiquetas || {};
    var o = (D.contenidoOriginal || {}).destacados || c;   // las carpetas se leen del original (sin traducir)
    function porCarpeta(x) { return D.talentos.filter(function (t) { return t.carpeta === x; })[0]; }
    function seguidoresDe(t) { var n = D.numSeguidores(D.totalSeguidores(t)); return n === null ? 0 : n; }
    var orden = [], mapa = {};
    function poner(t, clave) {
      if (!t) return;
      if (!mapa[t.carpeta]) { mapa[t.carpeta] = { t: t, et: [] }; orden.push(t.carpeta); }
      if (clave && mapa[t.carpeta].et.indexOf(e[clave]) < 0) mapa[t.carpeta].et.push(e[clave]);
    }
    // Quien está de cumpleaños sale primero (su tarjeta ya lleva la etiqueta «¡Está de cumpleaños!»).
    D.talentos.filter(D.esCumple).forEach(function (t) { poner(t, null); });
    var nuevos = (o.nuevos && o.nuevos.length ? o.nuevos.map(porCarpeta) : D.talentos.slice(-2).reverse()).slice(0, 2);
    nuevos.forEach(function (t) { poner(t, 'nuevo'); });
    var cr = D.crecimiento || {};
    poner(porCarpeta(o.semana || cr.semana), 'semana');
    poner(porCarpeta(o.promesa || cr.promesa), 'promesa');
    if (!orden.length) { el.innerHTML = ''; return; }

    function tarjeta(item) {
      var t = item.t, url = D.rutaTalento(t.carpeta);
      var soc = (t.redes || []).map(function (r) {
        var href = D.enlaceRed(r);
        return href ? '<a class="red-badge" href="' + D.esc(href) + '" target="_blank" rel="noopener noreferrer" title="' + D.esc(r.plataforma) + '">' + D.iconoRed(r.plataforma) + '</a>'
                    : '<span class="red-badge" title="' + D.esc(r.plataforma) + '">' + D.iconoRed(r.plataforma) + '</span>';
      }).join('');
      return '<article class="card' + D.claseCumple(t) + '"><div class="etqs">' + item.et.map(function (x) { return '<span>' + D.esc(x) + '</span>'; }).join('') + '</div>' +
        '<a class="ph" href="' + url + '" tabindex="-1" aria-hidden="true">' + D.img(D.rutaFoto(t), '', t) + D.confeti(t) + '</a>' +
        '<div class="body">' + D.insigniaCumple(t) + '<h3><a href="' + url + '">' + D.esc(t.nombre) + '</a></h3><div class="soc">' + soc + '</div>' +
        '<div class="fol">' + D.esc(D.totalSeguidores(t)) + '+<small>' + D.esc(c.etiquetaSeguidores) + '</small></div>' +
        '<a class="btn dark sm" href="' + url + '">' + D.esc(c.textoBoton) + '</a></div></article>';
    }
    el.innerHTML = '<div class="sec grey destacados"><div class="in"><h2 class="t">' + D.esc(c.titulo) + '</h2><div class="grid">' +
      orden.map(function (k) { return tarjeta(mapa[k]); }).join('') + '</div>' +
      '<p class="ver-todos"><a class="btn dark" href="' + D.esc(D.irA('creadores/')) + '">' + D.esc(c.verTodos) + '</a></p></div></div>';
  });
})();
