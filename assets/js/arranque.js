/* Arranque: dibuja cada sección en el orden en que aparecen en la página. */
(function () {
  var D = window.Dreamers;
  // Letras del tema: se cargan sin bloquear (tema.css solo guarda la dirección en --dmn-fuentes).
  try {
    var url = getComputedStyle(document.documentElement).getPropertyValue('--dmn-fuentes').replace(/^\s*["']|["']\s*$/g, '');
    if (/^https:\/\/fonts\.googleapis\.com\//.test(url)) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = url; document.head.appendChild(l); }
  } catch (e) {}
  function pintar() {
    document.querySelectorAll('[data-seccion]').forEach(function (el) {
      var id = el.getAttribute('data-seccion'), fn = D.secciones[id];
      if (!fn) { console.warn('La sección "' + id + '" no tiene código (secciones/' + id + '/seccion.js).'); return; }
      try { fn(el); D.aplicarEstilos(id, el); } catch (err) { console.error('Error en la sección ' + id, err); }
    });
    D.bloquesExtra();
    D.limpiarBarra();
    D.cargarScript('assets/js/temporada.js');
  }
  Promise.all([D.cargarTalentos(), D.cargarScript('secciones/textos/contenido.js')]).then(pintar);
})();
