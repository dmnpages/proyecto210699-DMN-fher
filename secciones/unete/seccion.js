(function () {
  var D = window.Dreamers;
  D.registrar('unete', function (el) {
    var c = D.contenido.unete, e = c.etiquetas, anioActual = new Date().getFullYear();
    function campo(id, etiqueta, pista, control, ancho) {
      return '<label class="' + (ancho ? 'full' : '') + '" for="' + id + '"><span class="et">' + D.esc(etiqueta) + '</span>' + (pista ? '<span class="pista">' + D.esc(pista) + '</span>' : '') + control + '</label>';
    }
    var checks = c.plataformas.map(function (p, i) {
      return '<label class="check" for="plat' + i + '"><input type="checkbox" id="plat' + i + '" name="plataformas" value="' + D.esc(p) + '"><span>' + D.esc(p) + '</span></label>';
    }).join('');
    var filas = c.plataformas.map(function (p, i) {
      var otra = p === 'Otra';
      return '<label class="fila" for="link' + i + '" hidden data-i="' + i + '"><span class="et">' + D.esc(otra ? e.linkOtra : String(e.linkDe).replace('{red}', p)) + '</span><input id="link' + i + '" inputmode="url" autocomplete="off"' + (otra ? '' : ' placeholder="https://..."') + '></label>';
    }).join('');
    el.innerHTML = '<div class="sec contact unete"><div class="in"><h1 class="t">' + D.esc(c.titulo) + '</h1><p class="intro">' + D.esc(c.intro) + '</p>' +
      '<form id="form-unete" novalidate>' +
      campo('nombre', e.nombre, e.nombrePista, '<input id="nombre" required autocomplete="name">') +
      campo('ciudad', e.ciudad, e.ciudadPista, '<input id="ciudad" required autocomplete="address-level2">') +
      campo('correo', e.correo, e.correoPista, '<input id="correo" type="email" inputmode="email" autocomplete="email" required>', true) +
      campo('edad', e.edad, e.edadPista, '<input id="edad" type="number" min="1" max="99" inputmode="numeric" required>') +
      campo('creador', e.creador, e.creadorPista, '<input id="creador" required>') +
      campo('anio', e.anio, e.anioPista, '<input id="anio" type="number" min="2000" max="' + anioActual + '" inputmode="numeric" placeholder="' + anioActual + '" required>') +
      campo('principal', e.principal, e.principalPista, '<select id="principal" required><option value="">' + D.esc(e.principalVacio) + '</option></select>') +
      '<fieldset class="full"><legend><span class="et">' + D.esc(e.plataformas) + '</span><span class="pista">' + D.esc(e.plataformasPista) + '</span></legend><div class="checks">' + checks + '</div><div class="links">' + filas + '</div></fieldset>' +
      campo('radar', e.radar, '', '<input id="radar" required>', true) +
      campo('motivacion', e.motivacion, e.motivacionPista, '<textarea id="motivacion" required></textarea>', true) +
      '<div class="full foto-bloque"><label for="foto"><span class="et">' + D.esc(e.foto) + '</span><span class="pista">' + D.esc(e.fotoPista) + '</span><input type="file" id="foto" accept="image/*"></label>' +
      '<article class="vista"><div class="ph"><img id="foto-img" alt="" hidden></div><div class="body"><h3 id="foto-nombre">' + D.esc(e.fotoAlias) + '</h3><div class="fol">' + D.esc(e.seguidores) + '<small>' + D.esc(e.fotoVista) + '</small></div></div></article></div>' +
      '<button class="btn" type="submit">' + D.esc(c.boton) + '</button><p id="status-unete" role="status"></p></form></div></div>';

    var form = el.querySelector('#form-unete'), st = el.querySelector('#status-unete'), sel = el.querySelector('#principal');
    var fotoBlob = null;
    function v(id) { return el.querySelector('#' + id).value.trim(); }
    function marcadas() { return Array.prototype.map.call(el.querySelectorAll('input[name="plataformas"]:checked'), function (x) { return x.value; }); }
    function sincronizar() {
      var on = marcadas(), actual = sel.value;
      c.plataformas.forEach(function (p, i) {
        var fila = el.querySelector('.fila[data-i="' + i + '"]'), on1 = on.indexOf(p) >= 0;
        fila.hidden = !on1; fila.querySelector('input').required = on1;
        if (!on1) fila.querySelector('input').value = '';
      });
      sel.innerHTML = '<option value="">' + D.esc(e.principalVacio) + '</option>' + on.map(function (p) { return '<option' + (p === actual ? ' selected' : '') + '>' + D.esc(p) + '</option>'; }).join('');
    }
    el.querySelectorAll('input[name="plataformas"]').forEach(function (i) { i.addEventListener('change', sincronizar); });
    el.querySelector('#creador').addEventListener('input', function (ev) { el.querySelector('#foto-nombre').textContent = ev.target.value.trim() || e.fotoAlias; });

    // Foto: se recorta a 4:5 y se reduce (800x1000) para la tarjeta.
    el.querySelector('#foto').addEventListener('change', function (ev) {
      var f = ev.target.files[0]; fotoBlob = null;
      var img = el.querySelector('#foto-img');
      if (!f) { img.hidden = true; return; }
      var url = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        var W = 800, H = 1000, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        var k = Math.max(W / im.width, H / im.height), w = im.width * k, h = im.height * k;
        cv.getContext('2d').drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { fotoBlob = b; img.src = URL.createObjectURL(b); img.hidden = false; }, 'image/jpeg', 0.85);
      };
      im.onerror = function () { URL.revokeObjectURL(url); img.hidden = true; };
      im.src = url;
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var plats = marcadas(), edad = +v('edad'), anio = +v('anio');
      var ok = v('nombre') && v('ciudad') && v('correo') && edad >= 1 && edad <= 99 && v('creador') && anio >= 2000 && anio <= anioActual && plats.length && v('principal') && v('radar') && v('motivacion');
      if (!ok) { st.textContent = c.mensajeError; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('correo'))) { st.textContent = c.mensajeErrorCorreo; el.querySelector('#correo').focus(); return; }
      var links = plats.map(function (p) { var i = c.plataformas.indexOf(p); return [p, v('link' + i)]; });
      if (links.some(function (l) { return !l[1]; })) { st.textContent = c.mensajeErrorLink; return; }
      if (!fotoBlob) { st.textContent = c.mensajeErrorFoto; return; }
      var o = (D.contenidoOriginal || {}).unete || c, eo = o.etiquetas;   // el correo llega en español
      var cuerpo = eo.nombre + ': ' + v('nombre') + '\n' + eo.ciudad + ': ' + v('ciudad') + '\n' + eo.correo + ': ' + v('correo') + '\n' + eo.edad + ': ' + edad + '\n' + eo.creador + ': ' + v('creador') +
        '\n' + eo.anio + ': ' + anio + '\n' + eo.principal + ': ' + v('principal') + '\n' + eo.plataformas + ':\n' +
        links.map(function (l) { return '- ' + l[0] + ': ' + l[1]; }).join('\n') + '\n' + eo.radar + ': ' + v('radar') + '\n\n' + eo.motivacion + ':\n' + v('motivacion') + '\n\n' + eo.foto + ': (adjuntar el archivo descargado)';
      var a = document.createElement('a'), slug = v('creador').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'creador';
      a.href = URL.createObjectURL(fotoBlob); a.download = 'foto-' + slug + '.jpg'; document.body.appendChild(a); a.click(); a.remove();
      location.href = 'mailto:' + c.correoDestino + '?subject=' + encodeURIComponent(o.asunto + ': ' + v('creador')) + '&body=' + encodeURIComponent(cuerpo);
      st.textContent = c.mensajeCorreo;
    });
  });
})();
