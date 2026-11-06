(function () {
  var D = window.Dreamers;
  D.registrar('portada', function (el) {
    var c = D.contenido.portada;
    var botones = c.botones.map(function (b) {
      return '<a class="btn" href="' + D.esc(D.irA(b.destino)) + '">' + D.esc(b.texto) + '</a>';
    }).join('');
    el.innerHTML = '<section class="hero"><div class="in"><h1>' + D.esc(c.titulo) + ' <span>' + D.esc(c.resaltado) +
      '</span></h1><p>' + D.esc(c.subtitulo) + '</p><div class="cta">' + botones + '</div></div></section>';
  });
})();
