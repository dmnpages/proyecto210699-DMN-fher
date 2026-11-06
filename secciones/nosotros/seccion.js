(function () {
  var D = window.Dreamers;
  D.registrar('nosotros', function (el) {
    var c = D.contenido.nosotros;
    var puntos = c.puntos.map(function (p) { return '<li>' + D.esc(p) + '</li>'; }).join('');
    el.innerHTML = '<div class="sec white"><div class="in"><div class="about">' + D.img('secciones/nosotros/' + c.imagen, '') +
      '<div><h2>' + D.esc(c.titulo) + '</h2><p>' + D.esc(c.texto) + '</p><ul>' + puntos + '</ul></div></div></div></div>';
  });
})();
