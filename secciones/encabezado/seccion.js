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
    el.innerHTML = '<header class="hdr"><div class="in"><a class="logo" href="' + D.irA('') + '">' + marca + '</a><nav><ul>' + items + '<li class="modo-li"><button type="button" class="modo-btn" aria-pressed="false" aria-label="Cambiar a modo oscuro"><svg class="ico-luna" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5z"/></svg><svg class="ico-sol" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg></button></li></ul></nav></div></header>';
    el.querySelector('.modo-btn').addEventListener('click', D.modo.alternar);
    D.modo.aplicar(D.modo.actual());
  });
})();
