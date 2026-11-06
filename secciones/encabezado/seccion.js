(function () {
  var D = window.Dreamers;
  D.registrar('encabezado', function (el) {
    var c = D.contenido.encabezado;
    var items = c.menu.map(function (m) {
      var sub = '';
      if (m.submenu === 'talentos') {
        sub = '<div class="sub">' + D.talentos.map(function (t) {
          return '<a href="' + D.rutaTalento(t.carpeta) + '">' + D.esc(t.nombre) + '</a>';
        }).join('') + '</div>';
      }
      return '<li' + (sub ? ' class="has-sub"' : '') + '><a href="' + D.irA(m.destino) + '">' + D.esc(m.texto) + '</a>' + sub + '</li>';
    }).join('');
    var marca = c.imagen
      ? '<img src="' + D.esc(D.raiz + 'secciones/encabezado/' + c.imagen) + '" alt="Dreamers Media Nicaragua" class="logo-imagen">'
      : D.esc(c.logo[0]) + '<b>' + D.esc(c.logo[1]) + '</b>';
    el.innerHTML = '<header class="hdr"><div class="in"><a class="logo" href="' + D.irA('') + '">' + marca + '</a><nav><ul>' + items + '</ul></nav></div></header>';
  });
})();
