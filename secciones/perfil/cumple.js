/* Efectos de cumpleaños: SOLO se cargan en la página del creador que está de cumpleaños (/creadores/<nombre>).
   Cartel con su nombre, globos que suben, confeti que cae, fuegos artificiales, destellos en la foto y confeti al tocar la pantalla.
   Con «reducir movimiento» activado en el dispositivo solo se muestra el cartel. */
(function () {
  var D = window.Dreamers;
  var COLORES = ['#ff6fb5', '#ffd54a', '#4fc3ff', '#7be37b', '#b78cff', '#ff8a3d', '#ff4d5e'];
  function azar(a, b) { return a + Math.random() * (b - a); }
  function color() { return COLORES[Math.floor(Math.random() * COLORES.length)]; }

  D.efectosCumple = function (t, raiz) {
    if (D._cumpleFx) return; D._cumpleFx = true;
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = D.raiz + 'secciones/perfil/cumple.css?v=' + D.version(); document.head.appendChild(css);
    var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Cartel «¡Feliz cumpleaños, nombre!» debajo de las migas
    var crumb = raiz.querySelector('.crumb');
    if (crumb) {
      var b = document.createElement('div'); b.className = 'cumple-banner'; b.setAttribute('role', 'status');
      var letras = Array.from(String(t.nombre || '')).map(function (ch, i) { return '<span class="l" style="--i:' + i + '">' + (ch === ' ' ? '&nbsp;' : D.esc(ch)) + '</span>'; }).join('');
      b.innerHTML = '<span class="e" aria-hidden="true">&#127874;</span><span class="tx"><small>' + D.esc(D.t('¡Feliz cumpleaños!')) + '</small><strong aria-label="' + D.esc(t.nombre) + '">' + letras + '</strong></span><span class="e" aria-hidden="true">&#127880;</span>';
      crumb.insertAdjacentElement('afterend', b);
    }
    // ---- Destellos sobre la foto
    var foto = raiz.querySelector('.tgrid .photo');
    if (foto) {
      var d = '<span class="destellos" aria-hidden="true">';
      for (var i = 0; i < 9; i++) d += '<s style="left:' + azar(6, 90).toFixed(0) + '%;top:' + azar(6, 90).toFixed(0) + '%;animation-delay:' + (-azar(0, 3)).toFixed(2) + 's;--s:' + azar(.7, 1.5).toFixed(2) + '"></s>';
      foto.insertAdjacentHTML('beforeend', d + '</span>');
    }
    if (quieto) return;

    // ---- Globos que suben
    var globos = document.createElement('div'); globos.className = 'cumple-globos'; globos.setAttribute('aria-hidden', 'true');
    for (var g = 0; g < 12; g++) {
      var gl = document.createElement('i'), c = color(), tam = azar(38, 66);
      gl.style.cssText = 'left:' + azar(2, 94).toFixed(1) + '%;width:' + tam.toFixed(0) + 'px;height:' + (tam * 1.25).toFixed(0) + 'px;--c:' + c +
        ';animation-duration:' + azar(11, 19).toFixed(1) + 's,' + azar(2.4, 4).toFixed(1) + 's;animation-delay:' + (-azar(0, 18)).toFixed(1) + 's,0s;--dx:' + azar(-40, 40).toFixed(0) + 'px';
      globos.appendChild(gl);
    }
    document.body.appendChild(globos);

    // ---- Lienzo: confeti + fuegos artificiales
    var cv = document.createElement('canvas'); cv.className = 'cumple-lienzo'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var cx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    function medir() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    medir(); addEventListener('resize', medir);

    var papeles = [], chispas = [], activo = true, ultimoFuego = 0, proximoFuego = 900;
    function papel(x, y, vx, vy) {
      papeles.push({ x: x, y: y, vx: vx, vy: vy, w: azar(6, 11), h: azar(9, 16), r: azar(0, 6.3), vr: azar(-.25, .25), c: color(), f: azar(0, 6.3), redondo: Math.random() < .25 });
    }
    function cañon(x, y, n, centro, abre, fuerza) {
      for (var k = 0; k < n; k++) { var a = centro + azar(-abre, abre), v = azar(fuerza * .45, fuerza); papel(x, y, Math.cos(a) * v, Math.sin(a) * v); }
    }
    function estallido(x, y, n) {
      var base = color();
      for (var k = 0; k < n; k++) {
        var a = Math.random() * 6.283, v = azar(1.2, 6.2);
        chispas.push({ x: x, y: y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1, c: Math.random() < .6 ? base : color() });
      }
    }
    // Entrada: dos cañones de confeti desde las esquinas de abajo
    cañon(0, H, 70, -1.05, .35, 22); cañon(W, H, 70, -2.09, .35, 22);
    setTimeout(function () { cañon(0, H, 45, -1.0, .4, 18); cañon(W, H, 45, -2.14, .4, 18); estallido(W * .5, H * .3, 70); }, 700);

    function paso(ts) {
      if (!activo) return;
      requestAnimationFrame(paso);
      if (document.hidden) return;
      cx.clearRect(0, 0, W, H);
      // lluvia suave de confeti
      if (papeles.length < 160 && Math.random() < .4) papel(azar(0, W), -14, azar(-.6, .6), azar(1.2, 2.6));
      // fuegos artificiales cada pocos segundos
      if (ts - ultimoFuego > proximoFuego) { ultimoFuego = ts; proximoFuego = azar(1500, 3200); estallido(azar(W * .12, W * .88), azar(H * .1, H * .45), Math.round(azar(46, 78))); }
      for (var i = papeles.length - 1; i >= 0; i--) {
        var p = papeles[i];
        p.vy += .11; p.vx *= .985; p.vy *= .992; p.x += p.vx + Math.sin(p.f) * .7; p.y += p.vy; p.r += p.vr; p.f += .08;
        if (p.y > H + 24 || p.x < -40 || p.x > W + 40) { papeles.splice(i, 1); continue; }
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(1, Math.abs(Math.cos(p.f)) * .8 + .2); cx.fillStyle = p.c;
        if (p.redondo) { cx.beginPath(); cx.arc(0, 0, p.w / 2, 0, 6.283); cx.fill(); } else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cx.restore();
      }
      cx.lineCap = 'round';
      for (var j = chispas.length - 1; j >= 0; j--) {
        var s = chispas[j];
        s.px = s.x; s.py = s.y; s.vy += .05; s.vx *= .985; s.vy *= .985; s.x += s.vx; s.y += s.vy; s.vida -= .012;
        if (s.vida <= 0) { chispas.splice(j, 1); continue; }
        cx.globalAlpha = Math.max(0, s.vida); cx.strokeStyle = s.c; cx.lineWidth = 2.2;
        cx.beginPath(); cx.moveTo(s.px, s.py); cx.lineTo(s.x, s.y); cx.stroke();
      }
      cx.globalAlpha = 1;
    }
    requestAnimationFrame(paso);

    // Tocar o hacer clic en la pantalla lanza confeti (no en enlaces ni botones)
    document.addEventListener('pointerdown', function (e) {
      if (!activo || e.target.closest('a,button,input,select,textarea,.dlg')) return;
      cañon(e.clientX, e.clientY, 40, -1.57, 1.57, 9); if (Math.random() < .5) estallido(e.clientX, e.clientY, 36);
    });

    // ---- Botón para apagar o encender los efectos
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cumple-fx'; btn.setAttribute('aria-pressed', 'true');
    btn.textContent = '✨'; btn.title = D.t('Efectos de cumpleaños'); btn.setAttribute('aria-label', btn.title);
    btn.addEventListener('click', function () {
      activo = !activo; btn.setAttribute('aria-pressed', String(activo)); btn.classList.toggle('off', !activo);
      cv.style.display = globos.style.display = activo ? '' : 'none';
      if (activo) requestAnimationFrame(paso); else { papeles = []; chispas = []; }
    });
    document.body.appendChild(btn);
  };
})();
