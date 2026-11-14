(function () {
  var D = window.Dreamers;
  D.registrar('unete', function (el) {
    var c = D.contenido.unete, e = c.etiquetas, anioActual = new Date().getFullYear();
    function campo(id, etiqueta, pista, control, ancho) {
      return '<label class="' + (ancho ? 'full' : '') + '" for="' + id + '"><span class="et">' + D.esc(etiqueta) + '</span><span class="pista">' + D.esc(pista) + '</span>' + control + '</label>';
    }
    var checks = c.plataformas.map(function (p, i) {
      return '<label class="check" for="plat' + i + '"><input type="checkbox" id="plat' + i + '" name="plataformas" value="' + D.esc(p) + '"><span>' + D.esc(p) + '</span></label>';
    }).join('');
    el.innerHTML = '<div class="sec contact unete"><div class="in"><h1 class="t">' + D.esc(c.titulo) + '</h1><p class="intro">' + D.esc(c.intro) + '</p>' +
      '<form id="form-unete" novalidate>' +
      campo('nombre', e.nombre, e.nombrePista, '<input id="nombre" required autocomplete="name">') +
      campo('edad', e.edad, e.edadPista, '<input id="edad" type="number" min="1" max="99" inputmode="numeric" required>') +
      campo('creador', e.creador, e.creadorPista, '<input id="creador" required>') +
      campo('anio', e.anio, e.anioPista, '<input id="anio" type="number" min="2000" max="' + anioActual + '" inputmode="numeric" placeholder="' + anioActual + '" required>') +
      '<fieldset class="full"><legend><span class="et">' + D.esc(e.plataformas) + '</span><span class="pista">' + D.esc(e.plataformasPista) + '</span></legend><div class="checks">' + checks + '</div>' +
        '<label class="otra" for="otra-plat" hidden><span class="et">' + D.esc(e.otra) + '</span><span class="pista">' + D.esc(e.otraPista) + '</span><input id="otra-plat" autocomplete="off"></label></fieldset>' +
      campo('principal', e.principal, e.principalPista, '<select id="principal" required><option value="">' + D.esc(e.principalVacio) + '</option>' +
        c.plataformas.map(function (p) { return '<option>' + D.esc(p) + '</option>'; }).join('') + '</select>') +
      campo('radar', e.radar, e.radarPista, '<input id="radar" required>') +
      campo('motivacion', e.motivacion, e.motivacionPista, '<textarea id="motivacion" required></textarea>', true) +
      '<button class="btn" type="submit">' + D.esc(c.boton) + '</button><p id="status-unete" role="status"></p></form></div></div>';

    var form = el.querySelector('#form-unete'), st = el.querySelector('#status-unete');
    function v(id) { return el.querySelector('#' + id).value.trim(); }
    var otraCheck = el.querySelector('input[name="plataformas"][value="Otra"]'), otraCampo = el.querySelector('.otra'), otraInput = otraCampo.querySelector('input');
    if (otraCheck) otraCheck.addEventListener('change', function () {
      otraCampo.hidden = !otraCheck.checked;
      otraInput.required = otraCheck.checked;
      if (otraCheck.checked) otraInput.focus(); else otraInput.value = '';
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var plats = Array.prototype.map.call(el.querySelectorAll('input[name="plataformas"]:checked'), function (x) { return x.value; });
      var edad = +v('edad'), anio = +v('anio');
      var otra = otraCheck && otraCheck.checked ? v('otra-plat') : '';
      if (otraCheck && otraCheck.checked && !otra) { st.textContent = c.mensajeErrorOtra; otraInput.focus(); return; }
      var ok = v('nombre') && edad >= 1 && edad <= 99 && v('creador') && anio >= 2000 && anio <= anioActual &&
        plats.length && v('principal') && v('radar') && v('motivacion');
      if (!ok) { st.textContent = c.mensajeError; return; }
      var cuerpo = e.nombre + ': ' + v('nombre') + '\n' + e.edad + ': ' + edad + '\n' + e.creador + ': ' + v('creador') +
        '\n' + e.anio + ' (año de inicio): ' + anio + '\n' + e.plataformas + ': ' + plats.map(function (x) { return x === 'Otra' ? 'Otra (' + otra + ')' : x; }).join(', ') + '\n' + e.principal + ': ' + (v('principal') === 'Otra' ? 'Otra (' + otra + ')' : v('principal')) +
        '\n' + e.radar + ': ' + v('radar') + '\n\n' + e.motivacion + ':\n' + v('motivacion');
      location.href = 'mailto:' + c.correoDestino + '?subject=' + encodeURIComponent(c.asunto + ': ' + v('creador')) + '&body=' + encodeURIComponent(cuerpo);
      st.textContent = c.mensajeCorreo;
    });
  });
})();
