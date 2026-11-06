(function () {
  var D = window.Dreamers;
  D.registrar('contacto', function (el) {
    var c = D.contenido.contacto, e = c.etiquetas;
    var opts = '<option value="">' + D.esc(c.sinPreferencia) + '</option>' +
      D.talentos.map(function (t) { return '<option>' + D.esc(t.nombre) + '</option>'; }).join('');
    el.innerHTML = '<div class="sec contact"><div class="in"><h2 class="t">' + D.esc(c.titulo) + '</h2>' + '<form id="form" novalidate>' +
      '<label for="nombre">' + D.esc(e.nombre) + '<input id="nombre" required autocomplete="name"></label>' +
      '<label for="correo">' + D.esc(e.correo) + '<input id="correo" type="email" required autocomplete="email"></label>' +
      '<label for="tel">' + D.esc(e.telefono) + '<input id="tel" type="tel" autocomplete="tel"></label>' +
      '<label for="empresa">' + D.esc(e.empresa) + '<input id="empresa" autocomplete="organization"></label>' +
      '<label class="full" for="talento">' + D.esc(e.creador) + '<select id="talento">' + opts + '</select></label>' +
      '<label class="full" for="mensaje">' + D.esc(e.mensaje) + '<textarea id="mensaje" required></textarea></label>' +
      '<button class="btn" type="submit">' + D.esc(c.boton) + '</button><p id="status" role="status"></p></form></div></div>';

    var pedido = new URLSearchParams(location.search).get('creador');
    if (pedido) { var sel = el.querySelector('#talento'); Array.prototype.forEach.call(sel.options, function (o) { if (o.value === pedido || o.textContent === pedido) sel.value = o.value || o.textContent; }); }
    var form = el.querySelector('#form'), st = el.querySelector('#status');
    function v(id) { return el.querySelector('#' + id).value.trim(); }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = v('nombre') && /\S+@\S+\.\S+/.test(v('correo')) && v('mensaje');
      if (!ok) { st.textContent = c.mensajeError; return; }
      if (c.correoDestino) {
        var cuerpo = e.nombre + ': ' + v('nombre') + '\n' + e.correo + ': ' + v('correo') + '\n' + e.telefono + ': ' + v('tel') +
          '\n' + e.empresa + ': ' + v('empresa') + '\n' + e.creador + ': ' + v('talento') + '\n\n' + v('mensaje');
        location.href = 'mailto:' + c.correoDestino + '?subject=' + encodeURIComponent('Contacto desde la web: ' + v('nombre')) + '&body=' + encodeURIComponent(cuerpo);
        st.textContent = c.mensajeCorreo;
      } else {
        st.textContent = c.mensajeDemo;
      }
    });
  });
})();
