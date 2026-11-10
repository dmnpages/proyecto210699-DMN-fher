(function () {
  var D = window.Dreamers;
  D.registrar('perfil', function (el) {
    var c = D.contenido.perfil;
    function lista(items, clase) {
      return '<ul class="' + clase + '">' + (items || []).map(function (x) { return '<li>' + D.esc(x) + '</li>'; }).join('') + '</ul>';
    }
    var MAX_CARRUSEL = 5;
    // Elige hasta 5 contenidos: primero los automáticos, luego (si faltan) los escritos a mano en el creador. Lo que no se pueda mostrar dentro de la página se salta y entra el siguiente de la reserva.
    function elegirContenido(t, auto) {
      var fijos = (Array.isArray(t.frames) ? t.frames : []).filter(Boolean);
      var cola = ((auto && auto.fijados) || []).concat((auto && auto.elegidos) || [], fijos, (auto && auto.reserva) || []);
      var vistos = {}, sel = [];
      cola.forEach(function (u) {
        if (sel.length >= MAX_CARRUSEL || vistos[u]) return;
        vistos[u] = 1;
        var m = D.detectarMedio(u);
        if (m && (m.src || m.imagen || m.video || m.audio)) sel.push(u);
      });
      return sel;
    }
    // Si un video de YouTube ya no se puede insertar, se cambia por la siguiente opción (comprobación al abrir la página).
    function revisarYouTube(slide, reserva, usadas) {
      var m = slide.getAttribute('data-url') || '';
      if (!/youtube\.com|youtu\.be/.test(m) || !window.fetch) return;
      fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(m)).then(function (r) {
        if (r.status === 401 || r.status === 403 || r.status === 404) {
          var sig = reserva.filter(function (u) { return usadas.indexOf(u) < 0; })[0];
          if (sig) { usadas.push(sig); slide.setAttribute('data-url', sig); slide.innerHTML = D.htmlMedio(sig); }
          else slide.remove();
        }
      }).catch(function () {});
    }
    function carrusel(urls, reserva) {
      if (!urls.length) return '';
      var slides = urls.map(function (u) { return '<div class="car-slide" data-url="' + D.esc(u) + '">' + D.htmlMedio(u) + '</div>'; }).join('');
      return '<section class="media-section"><h2>' + D.esc(c.tituloTransmisiones) + '</h2>' +
        '<div class="car" role="region" aria-roledescription="carrusel" aria-label="' + D.esc(c.tituloTransmisiones) + '">' +
        '<div class="car-track" tabindex="0">' + slides + '</div>' +
        '<div class="car-ctrl"><button type="button" class="car-btn prev" aria-label="Anterior" disabled>&#8249;</button>' +
        '<div class="car-dots"></div>' +
        '<button type="button" class="car-btn next" aria-label="Siguiente">&#8250;</button></div></div></section>';
    }
    function activarCarrusel(raiz, reserva, usadas) {
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
        for (var i = 0; i < n; i++) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ir a la página ' + (i + 1)); b.dataset.i = i; pts.appendChild(b); }
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
      slides().forEach(function (s) { revisarYouTube(s, reserva, usadas); });
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
          return { asunto: rellenar(c.formAsunto, t), cuerpo: cuerpoTxt };
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
        var interior = '<b>' + D.iconoRed(r.plataforma) + D.esc(r.plataforma) + '</b><span>' + (cifra ? cifra + ' ' + (c.seguidoresRed || 'seguidores') : (href ? (c.verPerfil || 'Ver perfil') : '')) + (href ? ' &#8599;' : '') + '</span>';
        return '<li>' + (href ? '<a class="net" href="' + D.esc(href) + '" target="_blank" rel="noopener noreferrer">' + interior + '</a>' : '<div class="net">' + interior + '</div>') + '</li>';
      }).join('');
      var dato = (t.dato && t.dato.valor) ? '<div><b>' + D.esc(t.dato.valor) + '</b><span>' + D.esc(t.dato.texto) + '</span></div>' : '';
      var elegidos = elegirContenido(t, auto);
      var reserva = ((auto && auto.reserva) || []).filter(function (u) { return elegidos.indexOf(u) < 0; });
      var mediosHtml = carrusel(elegidos, reserva);
      var contacto = D.irA('contacto/');
      el.innerHTML =
        '<section class="tp"><div class="in"><div class="crumb"><a href="' + D.irA('creadores/') + '">' + D.esc(c.migas) + '</a> / ' + D.esc(t.nombre) + '</div>' +
        '<div class="tgrid"><div class="photo">' + D.img(D.rutaFoto(t), t.nombre, t, true) + '</div><div>' +
        '<span class="tag">' + D.categoriasDe(t).map(function (x) { return D.esc(x); }).join(' / ') + '</span><h1>' + D.esc(t.nombre) + '</h1><p class="lead">' + D.esc(t.descripcion) + '</p>' +
        '<div class="kv"><div><b>' + D.esc(D.totalSeguidores(t)) + '+</b><span>' + D.esc(c.seguidoresTotal) + '</span></div>' + dato +
        (String(t.ciudad || '').trim() ? '<div><b>' + D.esc(t.ciudad) + '</b><span>' + D.esc(c.baseEn) + '</span></div>' : '') + '</div>' +
        '<button type="button" class="btn" data-contactar>' + D.esc(c.botonContratar) + '</button></div></div></div></section>' +
        '<section class="sec white"><div class="in"><div class="details">' +
        '<div><h2>' + D.esc(c.tituloRedes) + '</h2><ul class="netlist">' + redes + '</ul></div>' +
        '<div><h2>' + D.esc(c.tituloFormatos) + '</h2>' + lista(t.formatos, 'pills') + '</div>' +
        '<div><h2>' + D.esc(c.tituloIdeal) + '</h2>' + lista(t.ideal, 'pills') + '</div></div>' +
        mediosHtml +
        '<div class="pager"><a href="' + D.rutaTalento(ant.carpeta) + '">&larr; ' + D.esc(ant.nombre) + '</a>' +
        '<a href="' + D.rutaTalento(sig.carpeta) + '">' + D.esc(sig.nombre) + ' &rarr;</a></div></div></section>';
    }
    var carpetaActual = D.talentoActual();
    D.cargarAuto(carpetaActual).then(function (auto) {
      pintar(auto);
      var t = D.talentos.filter(function (x) { return x.carpeta === carpetaActual; })[0];
      if (!t) return;
      var elegidos = elegirContenido(t, auto);
      activarCarrusel(el, ((auto && auto.reserva) || []).filter(function (u) { return elegidos.indexOf(u) < 0; }), elegidos.slice());
      el.addEventListener('click', function (e) { var b = e.target.closest('[data-contactar]'); if (b) abrirContacto(t, b); });
    });
  });
})();
