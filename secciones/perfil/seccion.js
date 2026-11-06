(function () {
  var D = window.Dreamers;
  D.registrar('perfil', function (el) {
    var c = D.contenido.perfil;
    function lista(items, clase) {
      return '<ul class="' + clase + '">' + (items || []).map(function (x) { return '<li>' + D.esc(x) + '</li>'; }).join('') + '</ul>';
    }
    function pintar() {
      var carpeta = D.talentoActual();
      var i = -1;
      D.talentos.forEach(function (t, k) { if (t.carpeta === carpeta) i = k; });
      if (i < 0) {
        el.innerHTML = '<section class="tp"><div class="in"><h1>' + D.esc(c.noEncontrado) + '</h1><p><a class="btn" href="' + D.irA('creadores/') + '">' + D.esc(c.volver) + '</a></p></div></section>';
        return;
      }
      var n = D.talentos.length, t = D.talentos[i], ant = D.talentos[(i - 1 + n) % n], sig = D.talentos[(i + 1) % n];
      document.title = t.nombre + c.sufijoTitulo;
      var redes = (t.redes || []).map(function (r) {
        var href = D.enlaceRed(r), n = D.numSeguidores(r.seguidores);
        var cifra = n !== null ? D.formatoSeguidores(n) : (r.seguidores ? D.esc(r.seguidores) : '');
        var interior = '<b>' + D.iconoRed(r.plataforma) + D.esc(r.plataforma) + '</b><span>' + (cifra ? cifra + ' ' + (c.seguidoresRed || 'seguidores') : (href ? (c.verPerfil || 'Ver perfil') : '')) + (href ? ' &#8599;' : '') + '</span>';
        return '<li>' + (href ? '<a class="net" href="' + D.esc(href) + '" target="_blank" rel="noopener noreferrer">' + interior + '</a>' : '<div class="net">' + interior + '</div>') + '</li>';
      }).join('');
      var dato = (t.dato && t.dato.valor) ? '<div><b>' + D.esc(t.dato.valor) + '</b><span>' + D.esc(t.dato.texto) + '</span></div>' : '';
      var medios = (Array.isArray(t.frames) ? t.frames : []).map(D.htmlMedio).filter(Boolean).join('');
      var mediosHtml = medios ? '<section class="media-section"><h3>' + D.esc(c.tituloTransmisiones) + '</h3><div class="media-grid">' + medios + '</div></section>' : '';
      var contacto = D.irA('contacto/') + '?creador=' + encodeURIComponent(t.nombre);
      el.innerHTML =
        '<section class="tp"><div class="in"><div class="crumb"><a href="' + D.irA('creadores/') + '">' + D.esc(c.migas) + '</a> / ' + D.esc(t.nombre) + '</div>' +
        '<div class="tgrid"><div class="photo">' + D.img(D.rutaFoto(t), t.nombre, t) + '</div><div>' +
        '<span class="tag">' + D.categoriasDe(t).map(function (x) { return D.esc(x); }).join(' / ') + '</span><h1>' + D.esc(t.nombre) + '</h1><p class="lead">' + D.esc(t.descripcion) + '</p>' +
        '<div class="kv"><div><b>' + D.esc(D.totalSeguidores(t)) + '+</b><span>' + D.esc(c.seguidoresTotal) + '</span></div>' + dato +
        '<div><b>' + D.esc(t.ciudad) + '</b><span>' + D.esc(c.baseEn) + '</span></div></div>' +
        '<a class="btn" href="' + contacto + '">' + D.esc(c.botonContratar) + '</a></div></div></div></section>' +
        '<section class="sec white"><div class="in"><div class="details">' +
        '<div><h3>' + D.esc(c.tituloRedes) + '</h3><ul class="netlist">' + redes + '</ul></div>' +
        '<div><h3>' + D.esc(c.tituloFormatos) + '</h3>' + lista(t.formatos, 'pills') + '</div>' +
        '<div><h3>' + D.esc(c.tituloIdeal) + '</h3>' + lista(t.ideal, 'pills') + '</div></div>' +
        mediosHtml +
        '<div class="pager"><a href="' + D.rutaTalento(ant.carpeta) + '">&larr; ' + D.esc(ant.nombre) + '</a>' +
        '<a href="' + D.rutaTalento(sig.carpeta) + '">' + D.esc(sig.nombre) + ' &rarr;</a></div></div></section>';
    }
    pintar();
  });
})();
