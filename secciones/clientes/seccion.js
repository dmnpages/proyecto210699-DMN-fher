(function () {
  var D = window.Dreamers;
  function fila(logos, inversa, c) {
    var base = logos.slice();
    while (base.length && base.length < 10) base = base.concat(logos);
    var tiles = base.map(function (l) {
      var cont = l.imagen
        ? D.img('secciones/clientes/logos/' + l.imagen, l.nombre)
        : '<span>' + D.esc(l.nombre) + '<small>' + D.esc(c.textoFicha) + '</small></span>';
      return '<div class="logo-tile">' + cont + '</div>';
    }).join('');
    return '<div class="rail' + (inversa ? ' rev' : '') + '" aria-hidden="true"><div class="track">' + tiles + tiles + '</div></div>';
  }
  D.registrar('clientes', function (el) {
    var c = D.contenido.clientes;
    el.innerHTML = '<div class="sec grey"><div class="in"><h2 class="t">' + D.esc(c.titulo) + '</h2></div>' +
      fila(c.logos, false, c) + fila(c.logos.slice().reverse(), true, c) + '</div>';
  });
})();
