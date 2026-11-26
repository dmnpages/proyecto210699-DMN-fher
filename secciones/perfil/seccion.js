(function () {
  var D = window.Dreamers;
  D.registrar('perfil', function (el) {
    var c = D.contenido.perfil;
    function lista(items, clase) {
      return '<ul class="' + clase + '">' + (items || []).map(function (x) { return '<li>' + D.esc(x) + '</li>'; }).join('') + '</ul>';
    }
    var MAX_CARRUSEL = 5;
    // Hasta 5 publicaciones: primero las fijadas a mano, luego las 5 con más vistas que dejó «Actualizar contenido» (auto.js) y, si faltan, los enlaces escritos en el creador.
    // Ya no se descarta nada por «no se puede incrustar»: cada tarjeta trae su botón «Ver en…» por si la red no deja mostrarla aquí.
    function elegirContenido(t, auto) {
      var fijos = (Array.isArray(t.frames) ? t.frames : []).filter(Boolean);
      var cola = ((auto && auto.fijados) || []).concat((auto && auto.elegidos) || [], fijos, (auto && auto.reserva) || []);
      var vistos = {}, sel = [];
      cola.forEach(function (u) {
        if (sel.length >= MAX_CARRUSEL || vistos[u]) return;
        vistos[u] = 1;
        if (D.detectarMedio(u)) sel.push(u);
      });
      return sel;
    }
    var OJO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C6.5 5 2.7 9.2 1.5 12c1.2 2.8 5 7 10.5 7s9.3-4.2 10.5-7C21.3 9.2 17.5 5 12 5zm0 11.2a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm0-2.2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>';
    // Tarjeta de una publicación: red + tipo, vistas (si se conocen), el contenido y un botón para abrirla en su red.
    function tarjeta(u, auto) {
      var m = D.detectarMedio(u);
      if (!m) return '';
      var vistas = auto && auto.vistas && +auto.vistas[u], titulo = auto && auto.titulos && auto.titulos[u];
      var incrustado = !!(m.src || m.imagen || m.video || m.audio);
      var red = String(m.plataforma || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return '<article class="vc" data-red="' + D.esc(red) + '">' +
        '<div class="vc-top"><span class="vc-red">' + D.iconoRed(m.plataforma) + '<b>' + D.esc(m.plataforma) + '</b>' + (m.tipo ? '<em>' + D.esc(m.tipo) + '</em>' : '') + '</span>' +
        (vistas > 0 ? '<span class="vc-vistas" title="' + D.esc(D.t('vistas')) + '">' + OJO + '<b>' + D.formatoSeguidores(vistas) + '</b><span class="vc-solo-lector">' + D.esc(D.t('vistas')) + '</span></span>' : '') + '</div>' +
        '<div class="vc-media">' + D.cuerpoMedio(m) + '</div>' +
        '<div class="vc-pie">' + (titulo ? '<p class="vc-titulo">' + D.esc(titulo) + '</p>' : '') +
        (incrustado ? '<a class="vc-ver" href="' + D.esc(u) + '" target="_blank" rel="noopener">' + D.esc(D.t('Ver en')) + ' ' + D.esc(m.plataforma) + ' <span aria-hidden="true">&#8599;</span></a>' : '') + '</div>' +
        '</article>';
    }
    function carrusel(urls, auto) {
      if (!urls.length) return '';
      var slides = urls.map(function (u) { return '<div class="car-slide" data-url="' + D.esc(u) + '">' + tarjeta(u, auto) + '</div>'; }).join('');
      return '<section class="media-section"><h2>' + D.esc(c.tituloTransmisiones) + '</h2>' +
        '<div class="car" role="region" aria-roledescription="carrusel" aria-label="' + D.esc(c.tituloTransmisiones) + '">' +
        '<div class="car-track" tabindex="0">' + slides + '</div>' +
        '<div class="car-ctrl"><button type="button" class="car-btn prev" aria-label="' + D.esc(D.t('Anterior')) + '" disabled>&#8249;</button>' +
        '<div class="car-dots"></div>' +
        '<button type="button" class="car-btn next" aria-label="' + D.esc(D.t('Siguiente')) + '">&#8250;</button></div></div></section>';
    }
    function activarCarrusel(raiz) {
      var car = raiz.querySelector('.car');
      if (!car) return;
      var pista = car.querySelector('.car-track'), prev = car.querySelector('.prev'), next = car.querySelector('.next'), pts = car.querySelector('.car-dots');
      function slides() { return Array.prototype.slice.call(pista.querySelectorAll('.car-slide')); }
      function porVista() { var s = slides()[0]; return s ? Math.max(1, Math.round(pista.clientWidth / s.offsetWidth)) : 1; }
      function paginas() { return Math.max(1, Math.ceil(slides().length / porVista())); }
      function actual() { var s = slides()[0]; if (!s) return 0; var paso = s.offsetWidth * porVista(); return Math.min(paginas() - 1, Math.round(pista.scrollLeft / Math.max(1, paso))); }
      function dibujarPuntos() {
        var n = paginas();
        pts.hidden = n < 2; prev.hidden = next.hidden = n < 2;
        pts.innerHTML = '';
        for (var i = 0; i < n; i++) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', D.t('Ir a la página') + ' ' + (i + 1)); b.dataset.i = i; pts.appendChild(b); }
        marcar();
      }
      function marcar() {
        var a = actual(), n = paginas();
        Array.prototype.forEach.call(pts.children, function (b, i) { b.className = i === a ? 'on' : ''; });
        prev.disabled = a <= 0; next.disabled = a >= n - 1 || pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 2;
      }
      function ir(p) { var s = slides()[0]; if (!s) return; pista.scrollTo({ left: p * s.offsetWidth * porVista(), behavior: 'smooth' }); }
      prev.addEventListener('click', function () { ir(actual() - 1); });
      next.addEventListener('click', function () { ir(actual() + 1); });
      pts.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) ir(+b.dataset.i); });
      pista.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { ir(actual() + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { ir(actual() - 1); e.preventDefault(); } });
      var t; pista.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(marcar, 60); }, { passive: true });
      window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(dibujarPuntos, 120); });
      dibujarPuntos();
    }
    // ---- Contactar al creador: ventana con sus redes (van directo a su perfil) y, si tiene correo en su ficha, un formulario de correo.
    function rellenar(txt, t) { return String(txt || '').replace('{nombre}', t.nombre || '').replace('{red}', t.red || ''); }
    function abrirContacto(t, origen) {
      var viejo = document.getElementById('dlgContacto'); if (viejo) viejo.remove();
      var redes = (t.redes || []).filter(function (r) { return D.enlaceRed(r); });
      var correo = String(t.correo || '').trim(), validoCorreo = /^\S+@\S+\.\S+$/.test(correo);
      var fondo = document.createElement('div');
      fondo.id = 'dlgContacto'; fondo.className = 'dlg';
      fondo.innerHTML = '<div class="dlg-caja" role="dialog" aria-modal="true" aria-labelledby="dlgTitulo"><button type="button" class="dlg-x" aria-label="' + D.esc(c.contactarCerrar) + '">&times;</button><div class="dlg-cuerpo"></div></div>';
      document.body.appendChild(fondo); document.body.classList.add('dlg-abierto');
      var caja = fondo.querySelector('.dlg-caja'), cuerpo = fondo.querySelector('.dlg-cuerpo');
      function cerrar() { fondo.remove(); document.body.classList.remove('dlg-abierto'); document.removeEventListener('keydown', teclas); if (origen && origen.focus) origen.focus(); }
      function teclas(e) {
        if (e.key === 'Escape') { cerrar(); return; }
        if (e.key !== 'Tab') return;
        var f = caja.querySelectorAll('a[href],button:not([disabled]),input,textarea'); if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
      }
      document.addEventListener('keydown', teclas);
      fondo.addEventListener('mousedown', function (e) { if (e.target === fondo) cerrar(); });
      caja.querySelector('.dlg-x').addEventListener('click', cerrar);

      function vistaOpciones() {
        var h = '<h2 id="dlgTitulo">' + D.esc(rellenar(c.contactarTitulo, t)) + '</h2>';
        if (!redes.length && !validoCorreo) {
          h += '<p>' + D.esc(c.contactarSinCanales) + '</p><p><a class="btn" href="' + D.irA('contacto/') + '">' + D.esc(c.contactarIrAgencia) + '</a></p>';
        } else {
          h += '<p class="dlg-intro">' + D.esc(c.contactarIntro) + '</p><ul class="dlg-lista">';
          redes.forEach(function (r) {
            h += '<li><a class="dlg-op" href="' + D.esc(D.enlaceRed(r)) + '" target="_blank" rel="noopener noreferrer">' + D.iconoRed(r.plataforma) + '<span><b>' + D.esc(rellenar(c.contactarRedTexto, { red: r.plataforma })) + '</b><small>' + D.esc(c.contactarRedAyuda) + '</small></span><i aria-hidden="true">&#8599;</i></a></li>';
          });
          if (validoCorreo) h += '<li><button type="button" class="dlg-op" data-correo><svg class="red-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.6 2L12 12.6 19.4 7z"/></svg><span><b>' + D.esc(c.contactarCorreoTexto) + '</b><small>' + D.esc(c.contactarCorreoAyuda) + '</small></span><i aria-hidden="true">&rsaquo;</i></button></li>';
          h += '</ul>';
        }
        cuerpo.innerHTML = h;
        var bc = cuerpo.querySelector('[data-correo]'); if (bc) bc.addEventListener('click', vistaCorreo);
        var p = cuerpo.querySelector('.dlg-op,.btn'); if (p) p.focus();
      }
      function vistaCorreo() {
        cuerpo.innerHTML = '<h2 id="dlgTitulo">' + D.esc(rellenar(c.contactarTitulo, t)) + '</h2><form novalidate class="dlg-form">' +
          '<label>' + D.esc(c.formNombre) + '<input name="nombre" required autocomplete="name"></label>' +
          '<label>' + D.esc(c.formCorreo) + '<input name="correo" type="email" required autocomplete="email"></label>' +
          '<label>' + D.esc(c.formEmpresa) + '<input name="empresa" autocomplete="organization"></label>' +
          '<label>' + D.esc(c.formMensaje) + '<textarea name="mensaje" rows="5" required></textarea></label>' +
          '<p class="dlg-estado" role="status"></p><div class="dlg-botones"><button class="btn" type="submit">' + D.esc(c.formBotonCorreo) + '</button>' +
          '<button class="btn dlg-gmail" type="button">' + D.esc(c.formBotonGmail) + '</button>' +
          (redes.length ? '<button class="dlg-volver" type="button">&lsaquo; ' + D.esc(c.contactarVolver) + '</button>' : '') + '</div></form>';
        var f = cuerpo.querySelector('form'), st = cuerpo.querySelector('.dlg-estado');
        function datos() {
          var g = function (n) { return f.elements[n].value.trim(); };
          if (!g('nombre') || !/^\S+@\S+\.\S+$/.test(g('correo')) || !g('mensaje')) { st.textContent = c.formError; return null; }
          var cuerpoTxt = g('mensaje') + '\n\n— ' + g('nombre') + (g('empresa') ? ' (' + g('empresa') + ')' : '') + '\n' + g('correo');
          return { asunto: rellenar(((D.contenidoOriginal || {}).perfil || c).formAsunto, t), cuerpo: cuerpoTxt };
        }
        f.addEventListener('submit', function (e) { e.preventDefault(); var d = datos(); if (!d) return; location.href = 'mailto:' + correo + '?subject=' + encodeURIComponent(d.asunto) + '&body=' + encodeURIComponent(d.cuerpo); st.textContent = c.formAviso; });
        cuerpo.querySelector('.dlg-gmail').addEventListener('click', function () { var d = datos(); if (!d) return; window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(correo) + '&su=' + encodeURIComponent(d.asunto) + '&body=' + encodeURIComponent(d.cuerpo), '_blank', 'noopener'); });
        var v = cuerpo.querySelector('.dlg-volver'); if (v) v.addEventListener('click', vistaOpciones);
        f.elements.nombre.focus();
      }
      // Si solo hay correo (sin redes), se va directo al formulario.
      if (!redes.length && validoCorreo) vistaCorreo(); else vistaOpciones();
    }

    function pintar(auto) {
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
        var clave = D.esRedClave(r);
        var interior = '<b>' + D.iconoRed(r.plataforma) + D.esc(r.plataforma) + (clave ? '<em class="pill-clave">&#9733; ' + D.esc(c.redClave || 'Red clave') + '</em>' : '') + '</b><span>' + (cifra ? cifra + ' ' + (c.seguidoresRed || 'seguidores') : (href ? (c.verPerfil || 'Ver perfil') : '')) + (href ? ' &#8599;' : '') + '</span>';
        return '<li' + (clave ? ' class="net-clave" data-redclave="' + D.esc(D.claveRed(r.plataforma)) + '"' : '') + '>' + (href ? '<a class="net" href="' + D.esc(href) + '" target="_blank" rel="noopener noreferrer">' + interior + '</a>' : '<div class="net">' + interior + '</div>') + '</li>';
      }).join('');
      var dato = (t.dato && t.dato.valor) ? '<div><b>' + D.esc(t.dato.valor) + '</b><span>' + D.esc(t.dato.texto) + '</span></div>' : '';
      var elegidos = elegirContenido(t, auto);
      var mediosHtml = carrusel(elegidos, auto);
      var contacto = D.irA('contacto/');
      el.innerHTML =
        '<section class="tp"><div class="in"><div class="crumb"><a href="' + D.irA('creadores/') + '">' + D.esc(c.migas) + '</a> / ' + D.esc(t.nombre) + '</div>' +
        '<div class="tgrid"><div class="photo' + D.claseCumple(t) + '">' + D.img(D.rutaFoto(t), t.nombre, t, true) + D.confeti(t) + '</div><div>' + D.insigniaCumple(t) +
        '<span class="tag">' + D.categoriasDe(t).map(function (x) { return D.esc(x); }).join(' / ') + '</span><h1>' + D.esc(t.nombre) + '</h1><p class="lead">' + D.esc(t.descripcion) + '</p>' +
        '<div class="kv"><div><b>' + D.esc(D.totalSeguidores(t)) + '+</b><span>' + D.esc(c.seguidoresTotal) + '</span></div>' + dato +
        (String(t.ciudad || '').trim() ? '<div><b>' + D.esc(t.ciudad) + '</b><span>' + D.esc(c.baseEn) + '</span></div>' : '') + '</div>' +
        '<button type="button" class="btn" data-contactar>' + D.esc(c.botonContratar) + '</button></div></div></div></section>' +
        '<section class="sec white"><div class="in"><div class="details">' +
        '<div><h2>' + D.esc(c.tituloRedes) + '</h2><ul class="netlist">' + redes + '</ul></div>' +
        '<div><h2>' + D.esc(c.tituloFormatos) + '</h2>' + lista(t.formatos, 'pills') + '</div>' +
        '<div><h2>' + D.esc(c.tituloIdeal) + '</h2>' + lista(t.ideal, 'pills') + '</div></div>' +
        crecimientoHtml(t) + mediosHtml + patrocinadoresHtml(t) +
        '<div class="pager"><a href="' + D.rutaTalento(ant.carpeta) + '">&larr; ' + D.esc(ant.nombre) + '</a>' +
        '<a href="' + D.rutaTalento(sig.carpeta) + '">' + D.esc(sig.nombre) + ' &rarr;</a></div></div></section>';
    }
    // ---- «Trabaja con»: logos de los patrocinadores del creador. Si no tiene ninguno, no se dibuja nada.
    function patrocinadoresHtml(t) {
      if (!D.patrociniosActivos()) return '';   // desactivado desde el panel: no se muestra nada
      var lista = (Array.isArray(t.patrocinadores) ? t.patrocinadores : []).filter(function (p) { return p && String(p.nombre || '').trim(); });
      if (!lista.length) return '';
      var items = lista.map(function (p) {
        var logo = p.logo ? D.img('creadores/' + encodeURIComponent(t.carpeta) + '/' + encodeURIComponent(p.logo), p.nombre) : '<span>' + D.esc(p.nombre) + '</span>';
        var cont = '<span class="pat-logo' + (p.logo ? '' : ' solo-texto') + '">' + logo + '</span>';
        var href = /^https?:\/\//i.test(String(p.enlace || '')) ? p.enlace : '';
        return '<li title="' + D.esc(p.nombre) + '">' + (href ? '<a href="' + D.esc(href) + '" target="_blank" rel="noopener noreferrer sponsored" aria-label="' + D.esc(p.nombre) + '">' + cont + '</a>' : cont) + '</li>';
      }).join('');
      return '<section class="trabaja-con"><h2>' + D.esc(c.tituloPatrocinadores || 'Trabaja con') + '</h2><ul class="pat-lista">' + items + '</ul></section>';
    }
    // ---- Crecimiento: seguidores totales desde que se empezó a medir hasta hoy (datos públicos de creadores/crecimiento.js).
    function totalNumero(t) {
      var suma = 0, hay = false;
      (t.redes || []).forEach(function (r) { var n = D.numSeguidores(r.seguidores); if (n !== null) { suma += n; hay = true; } });
      return hay ? suma : D.numSeguidores(t.seguidores);
    }
    function fechaLarga(iso) {
      var p = String(iso).split('-'), f = new Date(+p[0], +p[1] - 1, +p[2]);
      var lang = (D.idioma && D.idioma.actual) || 'es';
      try { return f.toLocaleDateString(lang === 'es' ? 'es-419' : lang, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return iso; }
    }
    function loc() { var l = D.idioma && D.idioma.actual; return !l || l === 'es' ? 'es-419' : l; }
    function miles(n) { return Math.abs(n).toLocaleString(loc()); }
    function crecimientoHtml(t) {
      var serie = (((D.crecimiento || {}).series || {})[t.carpeta] || []).filter(function (p) { return p && typeof p[1] === 'number'; });
      var titulo = '<h2>' + D.esc(c.crecimientoTitulo) + '</h2>';
      if (serie.length < 2) return '<section class="crec">' + titulo + '<p class="crec-vacio">' + D.esc(c.crecimientoSin) + '</p></section>';
      var ahora = totalNumero(t), pts = serie.map(function (p) { return [p[0], p[1]]; });
      if (ahora !== null) pts[pts.length - 1][1] = ahora;          // el último punto es el número que ve el visitante hoy
      var ini = pts[0], fin = pts[pts.length - 1], dif = fin[1] - ini[1];
      var pct = ini[1] > 0 ? Math.round(dif / ini[1] * 1000) / 10 : null;
      var signo = dif > 0 ? '+' : (dif < 0 ? '\u2212' : '');
      var cls = dif > 0 ? 'sube' : (dif < 0 ? 'baja' : 'igual');
      var W = 320, H = 120, PX = 8, PY = 14, min = Math.min.apply(null, pts.map(function (p) { return p[1]; })), max = Math.max.apply(null, pts.map(function (p) { return p[1]; }));
      var t0 = new Date(ini[0]).getTime(), t1 = new Date(fin[0]).getTime(), rango = Math.max(1, max - min);
      var xy = pts.map(function (p, k) {
        var x = t1 > t0 ? PX + (new Date(p[0]).getTime() - t0) / (t1 - t0) * (W - 2 * PX) : PX + k * (W - 2 * PX) / Math.max(1, pts.length - 1);
        var y = max === min ? H / 2 : H - PY - (p[1] - min) / rango * (H - 2 * PY);
        return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
      });
      var linea = xy.map(function (q, k) { return (k ? 'L' : 'M') + q[0] + ' ' + q[1]; }).join(' ');
      var area = linea + ' L' + xy[xy.length - 1][0] + ' ' + (H - PY + 6) + ' L' + xy[0][0] + ' ' + (H - PY + 6) + ' Z';
      var resumen = (dif === 0 ? (c.crecimientoIgual || 'Sin cambios') : signo + miles(dif)) + ' ' + c.crecimientoSeguidores + ' ' + String(c.crecimientoDesde).replace('{fecha}', fechaLarga(ini[0]));
      var ult = xy[xy.length - 1];
      return '<section class="crec ' + cls + '">' + titulo + '<div class="crec-caja"><div class="crec-num"><b>' + (dif === 0 ? D.esc((c.crecimientoIgual || 'Sin cambios')) : signo + miles(dif)) + '</b>' +
        '<span>' + D.esc(c.crecimientoSeguidores) + ' ' + D.esc(String(c.crecimientoDesde).replace('{fecha}', fechaLarga(ini[0]))) + '</span>' +
        (pct !== null && dif !== 0 ? '<i class="crec-pct">' + signo + Math.abs(pct).toLocaleString(loc(), { maximumFractionDigits: 1 }) + '%</i>' : '') + '</div>' +
        '<div class="crec-graf"><div class="crec-lienzo"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + D.esc(resumen) + '" preserveAspectRatio="none">' +
        '<defs><linearGradient id="crecRelleno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".35"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>' +
        '<path d="' + area + '" fill="url(#crecRelleno)"/><path d="' + linea + '" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
        '</svg><span class="crec-punto" style="left:' + (ult[0] / W * 100) + '%;top:' + (ult[1] / H * 100) + '%"></span></div>' +
        '<div class="crec-ejes"><span>' + D.esc(fechaLarga(ini[0])) + ' · ' + miles(ini[1]) + '</span><span>' + D.esc(c.crecimientoHoy || 'Hoy') + ' · ' + miles(fin[1]) + '</span></div></div></div></section>';
    }
    // Canción de cumpleaños: suena al entrar al perfil de un creador que está de cumpleaños.
    // Los navegadores bloquean el sonido automático hasta que el visitante toca la página: si pasa, suena en su primer toque o tecla.
    function sonidoCumple(raiz, t) {
      if (!D.esCumple(t)) return;
      var ins = raiz.querySelector('.tgrid .cumple-badge'); if (!ins) return;
      var a = new Audio(), ogg = a.canPlayType('audio/ogg; codecs="vorbis"');
      a.src = D.raiz + 'assets/audio/cumpleanos.' + (ogg ? 'ogg' : 'mp3');
      a.preload = 'auto'; a.volume = 0.85;
      var btn = document.createElement('button'), fila = document.createElement('div'), manual = false, sonando = false;
      btn.type = 'button'; btn.className = 'cumple-son';
      fila.className = 'cumple-fila'; ins.parentNode.insertBefore(fila, ins); fila.appendChild(ins); fila.appendChild(btn);
      function pintarBoton() {
        btn.textContent = sonando ? '\u23F9' : '\uD83C\uDFB5';
        var txt = D.t(sonando ? 'Detener la canción' : 'Reproducir canción de cumpleaños');
        btn.setAttribute('aria-label', txt); btn.title = txt;
      }
      function sonar() { var p = a.play(); if (p && p.then) return p.then(function () { sonando = true; pintarBoton(); }); }
      a.addEventListener('ended', function () { sonando = false; pintarBoton(); });
      a.addEventListener('pause', function () { sonando = false; pintarBoton(); });
      btn.addEventListener('click', function (e) {
        e.stopPropagation(); manual = true;
        if (sonando) { a.pause(); a.currentTime = 0; } else { a.currentTime = 0; sonar(); }
      });
      pintarBoton();
      var EVENTOS = ['pointerdown', 'keydown', 'touchend', 'click'];
      function alPrimerToque(e) {
        if (btn.contains(e.target)) return;
        quitar(); if (!manual) { var p = sonar(); if (p && p.catch) p.catch(function () {}); }
      }
      function quitar() { EVENTOS.forEach(function (n) { document.removeEventListener(n, alPrimerToque, true); }); }
      var intento = a.play();
      if (intento && intento.then) {
        intento.then(function () { sonando = true; pintarBoton(); }).catch(function () {
          EVENTOS.forEach(function (n) { document.addEventListener(n, alPrimerToque, true); });
        });
      }
      window.addEventListener('pagehide', function () { a.pause(); });
    }
    var carpetaActual = D.talentoActual();
    Promise.all([D.cargarAuto(carpetaActual), (D.crecimiento && D.crecimiento.series) ? null : D.cargarScript('creadores/crecimiento.js')]).then(function (r) {
      var auto = r[0];
      pintar(auto);
      var t = D.talentos.filter(function (x) { return x.carpeta === carpetaActual; })[0];
      if (!t) return;
      D.contarVisita(t.carpeta);          // suma 1 al contador de visitas (para «Creador Más Visitado»)
      activarCarrusel(el);
      D.corregirYouTube(el);
      sonidoCumple(el, t);
      if (D.esCumple(t)) D.cargarScript('secciones/perfil/cumple.js').then(function () { if (D.efectosCumple) D.efectosCumple(t, el); });
      el.addEventListener('click', function (e) { var b = e.target.closest('[data-contactar]'); if (b) abrirContacto(t, b); });
    });
  });
})();
