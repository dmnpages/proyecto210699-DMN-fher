(function () {
  var D = window.Dreamers;
  // Creadores destacados del inicio (se calculan solos; creadores/crecimiento.js los deja listos cada vez que se guarda en el editor):
  //  - Creador de la Semana: el que más seguidores ganó en los últimos 7 días (lleva un efecto dorado con corona).
  //  - Creador Promesa de la Semana: entre los de 1K a 5K seguidores totales, el mejor ubicado en likes y vistas de su contenido.
  //  - Creador Más Visitado: el que más veces se abrió su página.
  // Para forzar a alguien, escribe su carpeta en «semana», «promesa» o «visitado» de contenido.js; vacío = automático.
  // Si un creador cumple varias, sale una sola tarjeta con varias etiquetas.
  D.registrar('destacados', function (el) {
    var c = D.contenido.destacados, e = c.etiquetas || {}, est = c.estadisticas || {};
    var o = (D.contenidoOriginal || {}).destacados || c;   // las carpetas se leen del original (sin traducir)
    var cr = D.crecimiento || {};
    function porCarpeta(x) { return x ? D.talentos.filter(function (t) { return t.carpeta === x; })[0] : null; }
    function cifra(n) { return D.formatoSeguidores(Math.round(n)); }
    function dato(txt, n) { return String(txt || '').replace('{n}', cifra(n)); }
    var orden = [], mapa = {};
    function poner(t, clave, estadistica) {
      if (!t) return;
      if (!mapa[t.carpeta]) { mapa[t.carpeta] = { t: t, et: [], est: [], clases: [] }; orden.push(t.carpeta); }
      var m = mapa[t.carpeta];
      if (clave) {
        if (e[clave] && m.et.indexOf(e[clave]) < 0) m.et.push(e[clave]);
        if (m.clases.indexOf(clave) < 0) m.clases.push(clave);
      }
      (estadistica || []).forEach(function (x) { if (x && m.est.indexOf(x) < 0) m.est.push(x); });
    }
    // Quien está de cumpleaños sale primero (su tarjeta ya lleva la etiqueta «¡Está de cumpleaños!»).
    D.talentos.filter(D.esCumple).forEach(function (t) { poner(t, null); });

    var forzado = { semana: o.semana, promesa: o.promesa, visitado: o.visitado };
    var tSemana = porCarpeta(forzado.semana || cr.semana);
    poner(tSemana, 'semana', (!forzado.semana && cr.ganados > 0 && est.semana) ? [dato(est.semana, cr.ganados)] : []);

    var tPromesa = porCarpeta(forzado.promesa || cr.promesa), estP = [];
    if (tPromesa && !forzado.promesa) {
      if (cr.promesaLikes > 0 && est.promesaLikes) estP.push(dato(est.promesaLikes, cr.promesaLikes));
      if (cr.promesaVistas > 0 && est.promesaVistas) estP.push(dato(est.promesaVistas, cr.promesaVistas));
    }
    poner(tPromesa, 'promesa', estP);

    var tVisitado = porCarpeta(forzado.visitado || cr.masVisitado), nVis = tVisitado && cr.visitas ? cr.visitas[tVisitado.carpeta] : 0;
    poner(tVisitado, 'visitado', (nVis > 0 && est.visitado) ? [dato(est.visitado, nVis)] : []);

    if (!orden.length) { el.innerHTML = ''; return; }

    function tarjeta(item) {
      var t = item.t, url = D.rutaTalento(t.carpeta), soc = D.insigniasRedes(t);
      var esSemana = item.clases.indexOf('semana') >= 0;
      var corona = esSemana ? '<span class="corona" aria-hidden="true">&#128081;</span>' : '';
      var chispas = esSemana ? '<span class="chispas" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' : '';
      return '<article class="card' + D.claseCumple(t) + D.claseAmbiente(t) + item.clases.map(function (k) { return ' dest-' + k; }).join('') + '"><div class="etqs">' + item.et.map(function (x) { return '<span>' + D.esc(x) + '</span>'; }).join('') + '</div>' + corona +
        '<a class="ph" href="' + url + '" tabindex="-1" aria-hidden="true">' + D.img(D.rutaFoto(t), '', t) + D.confeti(t) + D.ambienteCard(t) + chispas + '</a>' +
        '<div class="body">' + D.insigniaCumple(t) + '<h3><a href="' + url + '">' + D.esc(t.nombre) + '</a></h3><div class="soc">' + soc + '</div>' +
        (item.est.length ? '<p class="dest-dato">' + item.est.map(function (x) { return D.esc(x); }).join(' · ') + '</p>' : '') +
        '<div class="fol">' + D.esc(D.totalSeguidores(t)) + '+<small>' + D.esc(c.etiquetaSeguidores) + '</small></div>' +
        '<a class="btn dark sm" href="' + url + '">' + D.esc(c.textoBoton) + '</a></div></article>';
    }
    el.innerHTML = '<div class="sec grey destacados"><div class="in"><h2 class="t">' + D.esc(c.titulo) + '</h2><div class="grid">' +
      orden.map(function (k) { return tarjeta(mapa[k]); }).join('') + '</div>' +
      '<p class="ver-todos"><a class="btn dark" href="' + D.esc(D.irA('creadores/')) + '">' + D.esc(c.verTodos) + '</a></p></div></div>';
  });
})();
