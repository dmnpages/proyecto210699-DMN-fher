(function () {
  var D = window.Dreamers;
  D.registrar('unete', function (el) {
    var c = D.contenido.unete, e = c.etiquetas;
    var o = (D.contenidoOriginal || {}).unete || c, eo = o.etiquetas;   // el correo llega siempre en español
    var anioActual = new Date().getFullYear();
    var MIN_CARACTERES = 250, MAX_CATEGORIAS = 4, MAX_DESC = 300, NUM_VIDEOS = 5, MAX_CORREO_URL = 1800, MAX_PAT = 5;
    var PAT = D.patrociniosActivos();   // interruptor «Patrocinadores» del panel: si está apagado, el formulario no pregunta por ellos
    var DIAS_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Dominios aceptados para el link de cada red (si el nombre de la red no está aquí, se acepta cualquier link válido).
    var DOMINIOS = {
      facebook: ['facebook.com', 'fb.com', 'fb.me'], x: ['x.com', 'twitter.com'], instagram: ['instagram.com'],
      threads: ['threads.net', 'threads.com'], tiktok: ['tiktok.com'], youtube: ['youtube.com', 'youtu.be'],
      twitch: ['twitch.tv'], kick: ['kick.com']
    };
    var NOMBRES_HOST = [
      [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'YouTube'], [/(^|\.)tiktok\.com$/, 'TikTok'], [/(^|\.)instagram\.com$/, 'Instagram'],
      [/(^|\.)facebook\.com$|(^|\.)fb\.watch$|(^|\.)fb\.com$/, 'Facebook'], [/(^|\.)x\.com$|(^|\.)twitter\.com$/, 'X'],
      [/(^|\.)threads\.(net|com)$/, 'Threads'], [/(^|\.)twitch\.tv$/, 'Twitch'], [/(^|\.)kick\.com$/, 'Kick']
    ];

    function X(s) { return D.esc(s); }
    function campo(id, etiqueta, pista, control, clase) {
      return '<label class="' + (clase || '') + '" for="' + id + '"><span class="et">' + X(etiqueta) + '</span>' + (pista ? '<span class="pista">' + X(pista) + '</span>' : '') + control + '</label>';
    }
    function opciones(lista) { return lista.map(function (t, i) { return '<option value="' + i + '">' + X(t) + '</option>'; }).join(''); }
    function plantilla(s, datos) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return datos[k] != null ? datos[k] : m; }); }

    // ---------- piezas del formulario ----------
    var ciudades = (D.nicaragua || []).map(function (d) {
      return '<optgroup label="' + X(d[0]) + '">' + d[1].map(function (m) { return '<option value="' + X(m + ', ' + d[0]) + '">' + X(m + ', ' + d[0]) + '</option>'; }).join('') + '</optgroup>';
    }).join('') + '<option value="__fuera">' + X(e.ciudadFuera) + '</option>';

    var dias = '<option value="">' + X(e.dia) + '</option>';
    for (var d = 1; d <= 31; d++) dias += '<option value="' + d + '">' + d + '</option>';

    var chipsCat = c.categorias.map(function (t, i) {
      return '<label class="check" for="cat' + i + '"><input type="checkbox" id="cat' + i + '" name="categorias" value="' + i + '"><span>' + X(t) + '</span></label>';
    }).join('') + '<label class="check" for="catOtra"><input type="checkbox" id="catOtra" name="categorias" value="otra"><span>' + X(e.categoriaOtra) + '</span></label>';

    var chipsRedes = c.plataformas.map(function (p, i) {
      return '<label class="check" for="plat' + i + '"><input type="checkbox" id="plat' + i + '" name="plataformas" value="' + i + '"><span>' + X(p) + '</span></label>';
    }).join('');
    var filasRedes = c.plataformas.map(function (p, i) {
      return '<label class="fila" for="link' + i + '" hidden data-i="' + i + '"><span class="et">' + X(plantilla(e.linkDe, { red: p })) + '</span><input id="link' + i + '" inputmode="url" autocomplete="off" placeholder="https://..."></label>';
    }).join('');

    var filasVideos = '';
    for (var n = 1; n <= NUM_VIDEOS; n++) {
      filasVideos += '<label class="fila" for="video' + n + '"><span class="et">' + X(plantilla(e.videoN, { n: n })) + ' <em class="det" id="det' + n + '"></em></span><input id="video' + n + '" inputmode="url" autocomplete="off" placeholder="https://..."></label>';
    }

    var talentos = (D.talentos || []).slice().sort(function (a, b) { return String(a.nombre).localeCompare(String(b.nombre), 'es', { sensitivity: 'base' }); });
    var items = talentos.map(function (t, i) {
      return '<label class="cr-item" for="cr' + i + '" data-n="' + X(sinTildes(t.nombre)) + '"><input type="radio" name="creador" id="cr' + i + '" value="' + X(t.carpeta) + '">' +
        '<span class="cr-foto">' + D.img(D.rutaFoto(t), t.nombre, t) + '<span class="cr-ok" aria-hidden="true">&#10003;</span></span><span class="cr-nombre">' + X(t.nombre) + '</span></label>';
    }).join('');

    function sinTildes(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

    el.innerHTML = '<div class="sec contact unete"><div class="in"><h1 class="t">' + X(c.titulo) + '</h1><p class="intro">' + X(c.intro) + '</p>' +
      '<form id="form-unete" novalidate autocomplete="on">' +

      // 1. Sobre ti
      '<h2 class="bt full">' + X(e.bloqueDatos) + '</h2>' +
      campo('nombre', e.nombre, '', '<input id="nombre" autocomplete="given-name" maxlength="60">') +
      campo('apellido', e.apellido, '', '<input id="apellido" autocomplete="family-name" maxlength="60">') +
      campo('ciudad', e.ciudad, e.ciudadPista, '<select id="ciudad" autocomplete="address-level2"><option value="">' + X(e.ciudadVacio) + '</option>' + ciudades + '</select>') +
      '<label for="ciudadFuera" id="fila-fuera" hidden><span class="et">' + X(e.ciudadFueraEtiqueta) + '</span><input id="ciudadFuera" maxlength="80"></label>' +
      '<fieldset class="grupo"><legend><span class="et">' + X(e.nacimiento) + '</span><span class="pista">' + X(e.nacimientoPista) + '</span></legend>' +
      '<div class="dos"><select id="dia" aria-label="' + X(e.dia) + '">' + dias + '</select><select id="mes" aria-label="' + X(e.mes) + '"><option value="">' + X(e.mes) + '</option>' + opciones(c.meses) + '</select></div></fieldset>' +
      campo('edad', e.edad, e.edadPista, '<input id="edad" type="number" min="13" max="99" inputmode="numeric">') +
      campo('correo', e.correo, e.correoPista, '<input id="correo" type="email" inputmode="email" autocomplete="email" maxlength="120">') +
      campo('whatsapp', e.whatsapp, e.whatsappPista, '<input id="whatsapp" type="tel" inputmode="tel" autocomplete="tel" maxlength="25">') +
      '<label for="tutor" id="fila-tutor" class="full" hidden><span class="et">' + X(e.tutor) + '</span><span class="pista">' + X(e.tutorPista) + '</span><input id="tutor" maxlength="120"></label>' +

      // 2. Relación con DMN
      '<h2 class="bt full">' + X(e.bloqueDmn) + '</h2>' +
      '<fieldset class="full grupo" id="grupo-dmn"><legend><span class="et">' + X(e.yaEsDmn) + '</span></legend><div class="duo">' +
      '<label class="opcion" for="dmn-si"><input type="radio" name="dmn" id="dmn-si" value="si"><span>' + X(e.si) + '</span></label>' +
      '<label class="opcion" for="dmn-no"><input type="radio" name="dmn" id="dmn-no" value="no"><span>' + X(e.no) + '</span></label></div></fieldset>' +

      '<div class="full" id="panel-si" hidden><div class="grupo" id="grupo-creador"><span class="et">' + X(e.elegirCreador) + '</span><span class="pista">' + X(e.elegirCreadorPista) + '</span>' +
      '<input type="search" id="buscar" class="buscar" placeholder="' + X(e.buscarCreador) + '" aria-label="' + X(e.buscarCreador) + '" autocomplete="off">' +
      '<div class="carr"><button type="button" class="carr-flecha" data-dir="-1" aria-label="' + X(e.carruselAnterior) + '">&#8249;</button>' +
      '<div class="carr-pista" id="carr-pista" role="radiogroup" aria-label="' + X(e.elegirCreador) + '">' + items + '</div>' +
      '<button type="button" class="carr-flecha" data-dir="1" aria-label="' + X(e.carruselSiguiente) + '">&#8250;</button></div>' +
      '<p class="carr-vacio" id="carr-vacio" hidden>' + X(e.sinResultados) + '</p><p class="carr-sel" id="carr-sel" aria-live="polite"></p></div></div>' +

      '<div class="full" id="panel-no-alias" hidden>' + campo('alias', e.creador, e.creadorPista, '<input id="alias" maxlength="60">') + '</div>' +

      // 3. Contenido
      '<h2 class="bt full" id="bt-contenido" hidden>' + X(e.bloqueContenido) + '</h2>' +
      '<div class="full cuerpo" id="cuerpo" hidden>' +
      campo('descripcion', e.descripcion, e.descripcionPista, '<textarea id="descripcion" maxlength="' + MAX_DESC + '" rows="3"></textarea><small class="cuenta" id="cuenta-desc" aria-hidden="true"></small>', 'full') +
      '<fieldset class="full grupo" id="grupo-cat"><legend><span class="et">' + X(e.categorias) + '</span><span class="pista">' + X(e.categoriasPista) + '</span></legend><div class="checks">' + chipsCat + '</div>' +
      '<label class="fila" for="catOtraTxt" id="fila-cat-otra" hidden><span class="et">' + X(e.categoriaOtraEtiqueta) + '</span><input id="catOtraTxt" maxlength="40"></label></fieldset>' +
      '<div class="dos-col">' +
      campo('anio', e.anio, e.anioPista, '<input id="anio" type="number" min="2000" max="' + anioActual + '" inputmode="numeric" placeholder="' + anioActual + '">') +
      campo('frecuencia', e.frecuencia, '', '<select id="frecuencia"><option value="">' + X(e.frecuenciaVacio) + '</option>' + opciones(c.frecuencias) + '</select>') +
      '</div>' +

      // 4. Redes y videos (siempre)
      '<fieldset class="full grupo" id="grupo-redes"><legend><span class="et">' + X(e.plataformas) + '</span><span class="pista">' + X(e.plataformasPista) + '</span></legend><div class="checks">' + chipsRedes + '</div><div class="links">' + filasRedes + '</div></fieldset>' +
      '<fieldset class="full grupo" id="grupo-videos"><legend><span class="et">' + X(e.videos) + '</span><span class="pista">' + X(e.videosPista) + '</span></legend><div class="links">' + filasVideos + '</div></fieldset>' +
      (PAT ? '<fieldset class="full grupo" id="grupo-pat"><legend><span class="et">' + X(e.patrocinio) + '</span><span class="pista">' + X(e.patrocinioPista) + '</span></legend><div class="duo">' +
      '<label class="opcion" for="pat-si"><input type="radio" name="pat" id="pat-si" value="si"><span>' + X(e.patSi) + '</span></label>' +
      '<label class="opcion" for="pat-no"><input type="radio" name="pat" id="pat-no" value="no"><span>' + X(e.patNo) + '</span></label></div>' +
      '<div id="pat-panel" hidden><div id="pat-lista"></div><button type="button" class="btn2" id="pat-agregar">' + X(e.patAgregar) + '</button></div></fieldset>' : '') +
      '</div>' +

      // 5. Solo quienes aún no son DMN
      '<div class="full cuerpo" id="panel-no" hidden><h2 class="bt">' + X(e.bloqueIngreso) + '</h2><div class="cuerpo">' +
      campo('como', e.comoNosConociste, '', '<select id="como"><option value="">' + X(e.comoVacio) + '</option>' + opciones(c.comoNosConociste) + '</select>') +
      '<label for="comoOtra" id="fila-como-otra" hidden><span class="et">' + X(e.comoOtra) + '</span><input id="comoOtra" maxlength="120"></label>' +
      '<label for="quien" id="fila-quien" hidden><span class="et">' + X(e.quienRecomendo) + '</span><input id="quien" maxlength="80"></label>' +
      campo('motivacion', e.motivacion, e.motivacionPista, '<textarea id="motivacion" rows="6"></textarea><small class="cuenta" id="cuenta-mot" aria-live="polite"></small>', 'full') +
      '<div class="full foto-bloque"><label for="foto"><span class="et">' + X(e.foto) + '</span><span class="pista">' + X(e.fotoPista) + '</span><input type="file" id="foto" accept="image/*"></label>' +
      '<article class="vista"><div class="ph"><img id="foto-img" alt="" hidden></div><div class="body"><h3 id="foto-nombre">' + X(e.fotoAlias) + '</h3><div class="fol">' + X(e.seguidores) + '<small>' + X(e.fotoVista) + '</small></div></div></article></div>' +
      '</div></div>' +

      // Envío
      '<div class="full" id="pie-form" hidden>' +
      '<label class="acepto" for="acepto"><input type="checkbox" id="acepto"><span>' + X(e.acepto) + '</span></label>' +
      '<div class="trampa" aria-hidden="true"><label>Web <input id="web" tabindex="-1" autocomplete="off"></label></div>' +
      '<button class="btn" type="submit">' + X(c.boton) + '</button></div>' +
      '<p id="status-unete" class="estado" role="alert"></p>' +
      '<div class="full resultado" id="res-unete" hidden><p id="res-msg"></p><button type="button" class="btn2" id="btn-copiar">' + X(e.copiar) + '</button></div>' +
      '</form></div></div>';

    // ---------- referencias y utilidades ----------
    var form = el.querySelector('#form-unete'), st = el.querySelector('#status-unete');
    function $(id) { return el.querySelector('#' + id); }
    function v(id) { return $(id).value.trim(); }
    function marcados(nombre) { return Array.prototype.map.call(el.querySelectorAll('input[name="' + nombre + '"]:checked'), function (x) { return x.value; }); }
    function modo() { var r = el.querySelector('input[name="dmn"]:checked'); return r ? r.value : ''; }
    var fotoBlob = null, ultimaSolicitud = '';

    function normalizarUrl(t) {
      t = String(t || '').trim();
      if (!t) return null;
      if (!/^https?:\/\//i.test(t)) { if (/^[\w-]+(\.[\w-]+)+(\/|$|\?|#)/.test(t)) t = 'https://' + t; else return null; }
      try { var u = new URL(t); return /\./.test(u.hostname) ? u : null; } catch (_) { return null; }
    }
    function hostCoincide(host, lista) { return lista.some(function (d) { return host === d || host.slice(-d.length - 1) === '.' + d; }); }
    function nombreRed(host) { for (var i = 0; i < NOMBRES_HOST.length; i++) if (NOMBRES_HOST[i][0].test(host)) return NOMBRES_HOST[i][1]; return host.replace(/^www\./, ''); }
    function palabras(t) { return (String(t).match(/\S+/g) || []).length; }

    function limpiarError() {
      el.querySelectorAll('.mal').forEach(function (x) { x.classList.remove('mal'); });
      el.querySelectorAll('[aria-invalid]').forEach(function (x) { x.removeAttribute('aria-invalid'); });
      st.textContent = '';
    }
    function fallar(campoEl, msg) {
      limpiarError();
      var cont = campoEl.closest('label, fieldset, .grupo') || campoEl;
      cont.classList.add('mal'); campoEl.setAttribute('aria-invalid', 'true');
      st.textContent = msg;
      try { cont.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
      if (campoEl.focus) { try { campoEl.focus({ preventScroll: true }); } catch (_) {} }
      return false;
    }
    form.addEventListener('input', function (ev) { var m = ev.target.closest && ev.target.closest('.mal'); if (m) { m.classList.remove('mal'); st.textContent = ''; } });
    form.addEventListener('change', function (ev) { var m = ev.target.closest && ev.target.closest('.mal'); if (m) { m.classList.remove('mal'); st.textContent = ''; } });

    // ---------- fecha y edad ----------
    function ajustarDias() {
      var mes = $('mes').value, max = mes === '' ? 31 : DIAS_MES[+mes], sel = $('dia').value, h = '<option value="">' + X(e.dia) + '</option>';
      for (var i = 1; i <= max; i++) h += '<option value="' + i + '">' + i + '</option>';
      $('dia').innerHTML = h; if (sel && +sel <= max) $('dia').value = sel;
    }
    $('mes').addEventListener('change', ajustarDias);
    function revisarEdad() { var n = +$('edad').value; $('fila-tutor').hidden = !(n >= 13 && n < 18); }
    $('edad').addEventListener('input', revisarEdad);
    $('ciudad').addEventListener('change', function () { $('fila-fuera').hidden = $('ciudad').value !== '__fuera'; });

    // ---------- ¿ya eres DMN? ----------
    function mostrarRamas() {
      var m = modo();
      $('panel-si').hidden = m !== 'si';
      $('panel-no-alias').hidden = m !== 'no';
      $('panel-no').hidden = m !== 'no';
      $('bt-contenido').hidden = !m; $('cuerpo').hidden = !m; $('pie-form').hidden = !m;
    }
    el.querySelectorAll('input[name="dmn"]').forEach(function (r) { r.addEventListener('change', mostrarRamas); });

    // ---------- carrusel de creadores ----------
    var pista = $('carr-pista'), flechas = el.querySelectorAll('.carr-flecha');
    function flechasEstado() {
      flechas[0].disabled = pista.scrollLeft <= 2;
      flechas[1].disabled = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 2;
    }
    el.querySelectorAll('.carr-flecha').forEach(function (b) {
      b.addEventListener('click', function () { pista.scrollBy({ left: +b.getAttribute('data-dir') * Math.max(160, pista.clientWidth * 0.85), behavior: 'smooth' }); });
    });
    pista.addEventListener('scroll', flechasEstado, { passive: true });
    window.addEventListener('resize', flechasEstado);
    $('buscar').addEventListener('input', function () {
      var q = sinTildes($('buscar').value.trim()), hay = false;
      el.querySelectorAll('.cr-item').forEach(function (it) { var ok = !q || it.getAttribute('data-n').indexOf(q) >= 0; it.hidden = !ok; if (ok) hay = true; });
      $('carr-vacio').hidden = hay; pista.scrollLeft = 0; flechasEstado();
    });
    pista.addEventListener('change', function (ev) {
      var it = ev.target.closest('.cr-item'); if (!it) return;
      $('carr-sel').textContent = e.seleccionado + ': ' + it.querySelector('.cr-nombre').textContent;
      try { it.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); } catch (_) {}
    });
    setTimeout(flechasEstado, 300);

    // ---------- descripción, categorías, redes, videos ----------
    function contarDesc() { $('cuenta-desc').textContent = $('descripcion').value.length + ' / ' + MAX_DESC; }
    $('descripcion').addEventListener('input', contarDesc); contarDesc();

    function revisarCategorias() {
      var on = marcados('categorias');
      el.querySelectorAll('input[name="categorias"]').forEach(function (i) { i.disabled = on.length >= MAX_CATEGORIAS && !i.checked; });
      $('fila-cat-otra').hidden = on.indexOf('otra') < 0;
      if (on.indexOf('otra') < 0) $('catOtraTxt').value = '';
    }
    el.querySelectorAll('input[name="categorias"]').forEach(function (i) { i.addEventListener('change', revisarCategorias); });

    function revisarRedes() {
      var on = marcados('plataformas');
      c.plataformas.forEach(function (p, i) {
        var fila = el.querySelector('.fila[data-i="' + i + '"]'), act = on.indexOf(String(i)) >= 0;
        fila.hidden = !act; if (!act) fila.querySelector('input').value = '';
      });
    }
    el.querySelectorAll('input[name="plataformas"]').forEach(function (i) { i.addEventListener('change', revisarRedes); });

    for (var k = 1; k <= NUM_VIDEOS; k++) (function (k) {
      $('video' + k).addEventListener('input', function () {
        var u = normalizarUrl($('video' + k).value);
        $('det' + k).textContent = u ? '· ' + nombreRed(u.hostname.toLowerCase()) : '';
      });
    })(k);

    // ---------- patrocinadores: nombre, enlace opcional y logo (se descarga para adjuntarlo al correo) ----------
    function filaPat() {
      var n = $('pat-lista').children.length + 1, div = document.createElement('div');
      div.className = 'pat-fila';
      div.innerHTML = '<strong class="pat-n">' + X(plantilla(e.patN, { n: n })) + '</strong>' +
        '<label><span class="et">' + X(e.patNombre) + '</span><input class="pat-nombre" maxlength="80"></label>' +
        '<label><span class="et">' + X(e.patEnlace) + '</span><input class="pat-enlace" inputmode="url" placeholder="https://..." maxlength="200"></label>' +
        '<label class="pat-archivo"><span class="et">' + X(e.patLogo) + '</span><span class="pista">' + X(e.patLogoPista) + '</span><input type="file" class="pat-file" accept="image/*"></label>' +
        '<span class="pat-vista"><img alt="" hidden></span><button type="button" class="btn2 pat-quitar">' + X(e.patQuitar) + '</button>';
      div._blob = null;
      div.querySelector('.pat-file').addEventListener('change', function (ev) {
        var f = ev.target.files[0], img = div.querySelector('img'); div._blob = null; img.hidden = true;
        if (!f) return;
        var url = URL.createObjectURL(f), im = new Image();
        im.onload = function () {
          var k = Math.min(1, 400 / Math.max(im.width, im.height)), cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(im.width * k)); cv.height = Math.max(1, Math.round(im.height * k));
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
          cv.toBlob(function (b) { div._blob = b; img.src = URL.createObjectURL(b); img.hidden = false; div.classList.remove('mal'); }, 'image/png');
        };
        im.onerror = function () { URL.revokeObjectURL(url); };
        im.src = url;
      });
      div.querySelector('.pat-quitar').addEventListener('click', function () { div.remove(); renumerarPat(); });
      return div;
    }
    function renumerarPat() {
      Array.prototype.forEach.call($('pat-lista').children, function (f, i) { f.querySelector('.pat-n').textContent = plantilla(e.patN, { n: i + 1 }); });
      $('pat-agregar').hidden = $('pat-lista').children.length >= MAX_PAT;
    }
    if (PAT) el.querySelectorAll('input[name="pat"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var si = el.querySelector('input[name="pat"]:checked').value === 'si';
        $('pat-panel').hidden = !si;
        if (si && !$('pat-lista').children.length) { $('pat-lista').appendChild(filaPat()); renumerarPat(); }
        if (!si) { $('pat-lista').innerHTML = ''; }
      });
    });
    if (PAT) $('pat-agregar').addEventListener('click', function () { if ($('pat-lista').children.length < MAX_PAT) { $('pat-lista').appendChild(filaPat()); renumerarPat(); } });

    // ---------- cómo nos conociste, motivación, foto ----------
    $('como').addEventListener('change', function () {
      var i = $('como').value, t = i === '' ? '' : String(o.comoNosConociste[+i] || '');
      $('fila-como-otra').hidden = !/^otro/i.test(t); if (!/^otro/i.test(t)) $('comoOtra').value = '';
      $('fila-quien').hidden = !/amigo|recomend/i.test(t); if (!/amigo|recomend/i.test(t)) $('quien').value = '';
    });
    function contarMot() {
      var n = $('motivacion').value.trim().length;
      $('cuenta-mot').textContent = n >= MIN_CARACTERES ? plantilla(e.contadorListo, { n: n }) : plantilla(e.contador, { n: n, min: MIN_CARACTERES });
      $('cuenta-mot').classList.toggle('ok', n >= MIN_CARACTERES);
    }
    $('motivacion').addEventListener('input', contarMot); contarMot();
    $('alias').addEventListener('input', function (ev) { $('foto-nombre').textContent = ev.target.value.trim() || e.fotoAlias; });

    // Foto: se recorta a 4:5 y se reduce (800x1000) para la tarjeta.
    $('foto').addEventListener('change', function (ev) {
      var f = ev.target.files[0]; fotoBlob = null;
      var img = $('foto-img');
      if (!f) { img.hidden = true; return; }
      var url = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        var W = 800, H = 1000, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        var kk = Math.max(W / im.width, H / im.height), w = im.width * kk, h = im.height * kk;
        cv.getContext('2d').drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { fotoBlob = b; img.src = URL.createObjectURL(b); img.hidden = false; }, 'image/jpeg', 0.85);
      };
      im.onerror = function () { URL.revokeObjectURL(url); img.hidden = true; };
      im.src = url;
    });

    // ---------- validación ----------
    // Devuelve { datos } si todo está bien, o muestra el error y devuelve null.
    function validar() {
      var m = modo(), edad = +v('edad'), anio = +v('anio'), datos = { modo: m };
      if (v('nombre').length < 2) return fallar($('nombre'), c.mensajeError);
      if (v('apellido').length < 2) return fallar($('apellido'), c.mensajeError);
      if (!$('ciudad').value) return fallar($('ciudad'), c.mensajeError);
      if ($('ciudad').value === '__fuera' && v('ciudadFuera').length < 3) return fallar($('ciudadFuera'), c.mensajeError);
      var dia = +$('dia').value, mes = $('mes').value;
      if (!dia || mes === '') return fallar(!dia ? $('dia') : $('mes'), c.mensajeError);
      if (dia > DIAS_MES[+mes]) return fallar($('dia'), c.mensajeErrorFecha);
      if (!(edad >= 13 && edad <= 99)) return fallar($('edad'), c.mensajeErrorEdad);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('correo'))) return fallar($('correo'), c.mensajeErrorCorreo);
      if (v('whatsapp') && !/^(505)?\d{8}$/.test(v('whatsapp').replace(/\D/g, ''))) return fallar($('whatsapp'), c.mensajeErrorWhatsapp);
      if (edad < 18 && v('tutor').length < 6) return fallar($('tutor'), c.mensajeError);
      if (!m) return fallar($('dmn-si'), c.mensajeErrorDmn);
      if (m === 'si') {
        var r = el.querySelector('input[name="creador"]:checked');
        if (!r) return fallar($('grupo-creador'), c.mensajeErrorCreador);
        datos.carpeta = r.value;
        var t = talentos.filter(function (x) { return x.carpeta === r.value; })[0];
        datos.alias = t ? t.nombre : r.value;
      } else {
        if (v('alias').length < 2) return fallar($('alias'), c.mensajeError);
        datos.alias = v('alias');
      }
      if (v('descripcion').length < 20) return fallar($('descripcion'), c.mensajeError);
      var cats = marcados('categorias');
      if (!cats.length) return fallar($('grupo-cat'), c.mensajeErrorCategorias);
      if (cats.indexOf('otra') >= 0 && v('catOtraTxt').length < 2) return fallar($('catOtraTxt'), c.mensajeError);
      if (!(anio >= 2000 && anio <= anioActual)) return fallar($('anio'), c.mensajeError);
      if ($('frecuencia').value === '') return fallar($('frecuencia'), c.mensajeError);

      var on = marcados('plataformas');
      if (!on.length) return fallar($('grupo-redes'), c.mensajeErrorRedes);
      datos.redes = [];
      for (var i = 0; i < on.length; i++) {
        var idx = +on[i], nom = c.plataformas[idx], campoLink = $('link' + idx), u = normalizarUrl(campoLink.value);
        var dom = DOMINIOS[String(o.plataformas[idx] || '').toLowerCase()];
        if (!u || (dom && !hostCoincide(u.hostname.toLowerCase().replace(/^www\./, ''), dom))) return fallar(campoLink, plantilla(c.mensajeErrorLink, { red: nom }));
        datos.redes.push([o.plataformas[idx], u.href]);
      }
      datos.videos = []; var vistos = {};
      for (var j = 1; j <= NUM_VIDEOS; j++) {
        var uv = normalizarUrl($('video' + j).value);
        if (!uv) return fallar($('video' + j), c.mensajeErrorVideo);
        var clave = (uv.hostname + uv.pathname + uv.search).toLowerCase().replace(/\/+$/, '');
        if (vistos[clave]) return fallar($('video' + j), c.mensajeErrorVideo);
        vistos[clave] = 1; datos.videos.push(uv.href);
      }
      var rp = PAT ? el.querySelector('input[name="pat"]:checked') : null;
      if (PAT && !rp) return fallar($('pat-si'), c.mensajeErrorPat);
      datos.patrocinadores = [];
      if (PAT && rp.value === 'si') {
        var filas = $('pat-lista').children;
        if (!filas.length) return fallar($('pat-si'), c.mensajeErrorPatDatos);
        for (var q = 0; q < filas.length; q++) {
          var fp = filas[q], nom = fp.querySelector('.pat-nombre').value.trim(), enl = fp.querySelector('.pat-enlace').value.trim(), ue = enl ? normalizarUrl(enl) : null;
          if (nom.length < 2 || !fp._blob) { fp.classList.add('mal'); return fallar(nom.length < 2 ? fp.querySelector('.pat-nombre') : fp.querySelector('.pat-file'), c.mensajeErrorPatDatos); }
          if (enl && !ue) return fallar(fp.querySelector('.pat-enlace'), c.mensajeErrorPatLink);
          datos.patrocinadores.push({ nombre: nom, enlace: ue ? ue.href : '', blob: fp._blob });
        }
      }
      if (m === 'no') {
        if ($('como').value === '') return fallar($('como'), c.mensajeError);
        if (!$('fila-como-otra').hidden && v('comoOtra').length < 3) return fallar($('comoOtra'), c.mensajeError);
        if ($('motivacion').value.trim().length < MIN_CARACTERES) return fallar($('motivacion'), plantilla(c.mensajeErrorMotivo, { min: MIN_CARACTERES }));
      }
      if (!$('acepto').checked) return fallar($('acepto'), c.mensajeErrorAcepto);
      return datos;
    }

    // ---------- texto del correo (siempre en español) ----------
    function armarTexto(datos) {
      var L = [], nada = '—', cats = marcados('categorias').map(function (x) { return x === 'otra' ? v('catOtraTxt') : o.categorias[+x]; });
      var ciudad = $('ciudad').value === '__fuera' ? eo.ciudadFuera + ': ' + v('ciudadFuera') : $('ciudad').value;
      L.push('SOLICITUD DE INGRESO A DMN');
      L.push('Tipo de solicitud: ' + (datos.modo === 'si' ? 'Ya forma parte de DMN' : 'Quiere unirse a DMN'));
      L.push('');
      L.push('== ' + eo.bloqueDatos.toUpperCase() + ' ==');
      L.push(eo.nombre + ': ' + v('nombre'));
      L.push(eo.apellido + ': ' + v('apellido'));
      L.push(eo.ciudad + ': ' + ciudad);
      L.push(eo.nacimiento + ': ' + $('dia').value + ' de ' + o.meses[+$('mes').value]);
      L.push(eo.edad + ': ' + v('edad'));
      L.push(eo.correo + ': ' + v('correo'));
      L.push(eo.whatsapp.replace(/\s*\(opcional\)/i, '') + ': ' + (v('whatsapp') || nada));
      if (+v('edad') < 18) L.push(eo.tutor + ': ' + v('tutor'));
      L.push('');
      L.push('== ' + eo.bloqueDmn.toUpperCase() + ' ==');
      L.push(eo.yaEsDmn + ' ' + (datos.modo === 'si' ? 'Sí' : 'No'));
      L.push((datos.modo === 'si' ? 'Creador de DMN' : eo.creador) + ': ' + datos.alias + (datos.carpeta ? ' (/creadores/' + datos.carpeta + ')' : ''));
      L.push('');
      L.push('== ' + eo.bloqueContenido.toUpperCase() + ' ==');
      L.push(eo.descripcion + ': ' + v('descripcion'));
      L.push(eo.categorias + ': ' + cats.join(', '));
      L.push(eo.anio + ': ' + v('anio'));
      L.push(eo.frecuencia + ' ' + o.frecuencias[+$('frecuencia').value]);
      L.push('');
      L.push(eo.plataformas + ':');
      datos.redes.forEach(function (r) { L.push('- ' + r[0] + ': ' + r[1]); });
      L.push('');
      L.push(eo.videos + ':');
      datos.videos.forEach(function (u, i) { L.push((i + 1) + '. ' + u); });
      if (PAT) { L.push(''); L.push(eo.patrocinio.toUpperCase()); }
      if (PAT && !datos.patrocinadores.length) L.push('No tiene patrocinadores por ahora.');
      datos.patrocinadores.forEach(function (p, i) { L.push((i + 1) + '. ' + p.nombre + (p.enlace ? ' — ' + p.enlace : '') + ' — logo: (adjuntar ' + p.archivo + ')'); });
      if (datos.modo === 'no') {
        var iComo = +$('como').value, tComo = o.comoNosConociste[iComo];
        L.push(''); L.push('== ' + eo.bloqueIngreso.toUpperCase() + ' ==');
        L.push(eo.comoNosConociste + ' ' + tComo + (v('comoOtra') ? ': ' + v('comoOtra') : ''));
        if (v('quien')) L.push(eo.quienRecomendo.replace(/\s*\(opcional\)/i, '') + ': ' + v('quien'));
        L.push(''); L.push(eo.motivacion); L.push(v('motivacion'));
        L.push(''); L.push(eo.foto.replace(/\s*\(opcional\)/i, '') + ': ' + (fotoBlob ? '(adjuntar el archivo descargado)' : 'no subió foto'));
      }
      L.push(''); L.push('Confirmó que la información es real y aceptó el uso de sus datos para evaluar la solicitud.');
      return L.join('\n');
    }

    function descargar(blob, nombre) {
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre;
      document.body.appendChild(a); a.click(); a.remove();
    }

    // ---------- envío ----------
    $('btn-copiar').addEventListener('click', function () {
      var b = $('btn-copiar');
      function ok() { b.textContent = e.copiado; setTimeout(function () { b.textContent = e.copiar; }, 2000); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ultimaSolicitud).then(ok, function () {});
      else { var ta = document.createElement('textarea'); ta.value = ultimaSolicitud; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (_) {} ta.remove(); }
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (v('web')) return;                // trampa para robots: un humano nunca ve este campo
      var datos = validar();
      if (!datos) return;
      limpiarError();
      var slug = (datos.alias || 'creador').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'creador';
      datos.patrocinadores.forEach(function (p, i) {
        p.archivo = 'logo-' + slug + '-' + (i + 1) + '-' + (p.nombre.toLowerCase().normalize('NFD').replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-') || 'marca') + '.png';
      });
      var texto = armarTexto(datos); ultimaSolicitud = texto;
      var asunto = o.asunto + ': ' + datos.alias, base = 'mailto:' + c.correoDestino + '?subject=' + encodeURIComponent(asunto) + '&body=';
      var largo = (base + encodeURIComponent(texto)).length > MAX_CORREO_URL;
      if (fotoBlob && datos.modo === 'no') descargar(fotoBlob, 'foto-' + slug + '.jpg');
      datos.patrocinadores.forEach(function (p, i) { setTimeout(function () { descargar(p.blob, p.archivo); }, 400 * (i + 1)); });
      if (largo) {
        // Un correo con tanto texto puede cortarse: se descarga la solicitud completa para adjuntarla.
        descargar(new Blob([texto], { type: 'text/plain;charset=utf-8' }), 'solicitud-' + slug + '.txt');
        location.href = base + encodeURIComponent('Hola DMN, adjunto mi solicitud de ingreso (archivo solicitud-' + slug + '.txt).\n\n' + datos.alias);
      } else {
        location.href = base + encodeURIComponent(texto);
      }
      $('res-msg').textContent = largo ? c.mensajeCorreoLargo : c.mensajeCorreo;
      $('res-unete').hidden = false;
      try { $('res-unete').scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
    });
  });
})();
