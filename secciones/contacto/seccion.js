(function () {
  var D = window.Dreamers;
  D.registrar('contacto', function (el) {
    var c = D.contenido.contacto, e = c.etiquetas;
    el.innerHTML = '<div class="sec contact"><div class="in"><h2 class="t">' + D.esc(c.titulo) + '</h2>' +
      (c.aviso ? '<aside class="aviso" role="note"><h3>' + D.esc(c.aviso.titulo) + '</h3><p>' + D.esc(c.aviso.texto) + '</p><a class="btn" href="' + D.esc(D.irA(c.aviso.destino)) + '">' + D.esc(c.aviso.boton) + '</a></aside>' : '') +
      '<form id="form" novalidate>' +
      '<label for="nombre">' + D.esc(e.nombre) + '<input id="nombre" required autocomplete="name"></label>' +
      '<label for="correo">' + D.esc(e.correo) + '<input id="correo" type="email" required autocomplete="email"></label>' +
      '<label for="tel">' + D.esc(e.telefono) + '<input id="tel" type="tel" autocomplete="tel"></label>' +
      '<label for="empresa">' + D.esc(e.empresa) + '<input id="empresa" autocomplete="organization"></label>' +
      '<label class="full" for="mensaje">' + D.esc(e.mensaje) + '<textarea id="mensaje" required></textarea></label>' +
      '<button class="btn" type="submit">' + D.esc(c.boton) + '</button><p id="status" role="status"></p></form></div></div>';

    var form = el.querySelector('#form'), st = el.querySelector('#status');
    function v(id) { return el.querySelector('#' + id).value.trim(); }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = v('nombre') && /\S+@\S+\.\S+/.test(v('correo')) && v('mensaje');
      if (!ok) { st.textContent = c.mensajeError; return; }
      if (c.correoDestino) {
        var eo = ((D.contenidoOriginal || {}).contacto || c).etiquetas;   // el correo llega en español aunque el visitante use otro idioma
        var cuerpo = eo.nombre + ': ' + v('nombre') + '\n' + eo.correo + ': ' + v('correo') + '\n' + eo.telefono + ': ' + v('tel') +
          '\n' + eo.empresa + ': ' + v('empresa') + '\n\n' + v('mensaje');
        location.href = 'mailto:' + c.correoDestino + '?subject=' + encodeURIComponent('Contacto desde la web: ' + v('nombre')) + '&body=' + encodeURIComponent(cuerpo);
        st.textContent = c.mensajeCorreo;
      } else {
        st.textContent = c.mensajeDemo;
      }
    });
  });
})();
