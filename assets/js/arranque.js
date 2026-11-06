/* Arranque: dibuja cada sección en el orden en que aparecen en la página. */
(function () {
  var D = window.Dreamers;
  function pintar() {
    document.querySelectorAll('[data-seccion]').forEach(function (el) {
      var id = el.getAttribute('data-seccion'), fn = D.secciones[id];
      if (!fn) { console.warn('La sección "' + id + '" no tiene código (secciones/' + id + '/seccion.js).'); return; }
      try { fn(el); } catch (err) { console.error('Error en la sección ' + id, err); }
    });
    D.limpiarBarra();
  }
  D.cargarTalentos().then(pintar);
})();
