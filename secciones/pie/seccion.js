(function () {
  var D = window.Dreamers;
  D.registrar('pie', function (el) {
    var c = D.contenido.pie;
    var redes = c.redes.filter(function (r) { return r.texto && r.url; }).map(function (r) { return '<li><a href="' + D.esc(r.url) + '">' + D.esc(r.texto) + '</a></li>'; }).join('');
    el.innerHTML = '<footer><div class="in"><b>' + D.esc(c.nombre) + '</b><br>' + D.esc(c.direccion) +
      (c.correo ? '<br><a class="mail" href="mailto:' + D.esc(c.correo) + '">' + D.esc(c.correo) + '</a>' : '') +
      '<ul class="follow">' + redes + '</ul>' + (c.nota ? '<p class="note">' + D.esc(c.nota) + '</p>' : '') + '</div></footer>';
  });
})();
