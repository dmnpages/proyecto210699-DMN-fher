/* Efecto ambiental (naturaleza): SOLO se carga en la página del creador que lo tenga encendido (campo "ambiente": true en su datos.js).
   Hojas que caen, luciérnagas que flotan (y se acercan suave al cursor), polen, rayos de luz y bruma verde,
   y loros que se posan sobre su nombre, huyen cuando pasas el mouse y vuelven a posarse.
   Con «reducir movimiento» activado en el dispositivo solo quedan los rayos y la bruma, quietos. Se pausa si la pestaña no se ve. */
(function () {
  var D = window.Dreamers;
  var VERDES = ['#5fb36a', '#3f9a55', '#8fd36f', '#2f7f4a', '#b7d96b', '#74c07f'];
  function azar(a, b) { return a + Math.random() * (b - a); }

  D.efectosAmbiente = function (t, raiz) {
    if (D._ambFx) return; D._ambFx = true;
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = D.raiz + 'secciones/perfil/ambiente.css?v=' + D.version(); document.head.appendChild(css);
    var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    var rayos = document.createElement('div'); rayos.className = 'amb-rayos' + (quieto ? ' quieto' : ''); rayos.setAttribute('aria-hidden', 'true');
    var bruma = document.createElement('div'); bruma.className = 'amb-bruma'; bruma.setAttribute('aria-hidden', 'true');
    document.body.appendChild(rayos); document.body.appendChild(bruma);
    if (quieto) return;

    var cv = document.createElement('canvas'); cv.className = 'amb-canvas'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var W = 0, H = 0, hojas = [], luces = [], polen = [], mx = null, my = null, ult = 0, antes = 0, corriendo = true, loros = [];
    var nombre = raiz.querySelector('.tgrid h1') || raiz.querySelector('h1');

    function medir() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function nuevaHoja(arriba) {
      var s = azar(7, 15);
      return { x: azar(0, W), y: arriba ? azar(-60, -10) : azar(0, H), s: s, vy: azar(22, 52), amp: azar(14, 38), f: azar(.4, 1.1), ph: azar(0, 6.28),
        r: azar(0, 6.28), vr: azar(-1.1, 1.1), c: VERDES[Math.floor(Math.random() * VERDES.length)], a: azar(.55, .85) };
    }
    function nuevaLuz() { return { x: azar(0, W), y: azar(H * .25, H), ang: azar(0, 6.28), v: azar(8, 20), ph: azar(0, 6.28), f: azar(.5, 1.3), r: azar(5, 10) }; }
    function nuevoPolen() { return { x: azar(0, W), y: azar(0, H), vy: -azar(4, 12), ph: azar(0, 6.28), r: azar(.8, 1.8) }; }
    function poblar() {
      var movil = W < 700;
      hojas = []; luces = []; polen = [];
      for (var i = 0; i < (movil ? 9 : 20); i++) hojas.push(nuevaHoja(false));
      for (var j = 0; j < (movil ? 11 : 24); j++) luces.push(nuevaLuz());
      for (var k = 0; k < (movil ? 12 : 30); k++) polen.push(nuevoPolen());
    }
    function dibujaHoja(h) {
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.r); ctx.globalAlpha = h.a;
      ctx.fillStyle = h.c; ctx.beginPath(); ctx.moveTo(0, -h.s);
      ctx.bezierCurveTo(h.s * .9, -h.s * .45, h.s * .9, h.s * .5, 0, h.s);
      ctx.bezierCurveTo(-h.s * .9, h.s * .5, -h.s * .9, -h.s * .45, 0, -h.s); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -h.s * .9); ctx.lineTo(0, h.s); ctx.stroke();
      ctx.restore();
    }

    // ---------- Loros: llegan, se posan sobre las letras de su nombre, huyen si pasas el mouse y vuelven a posarse ----------
    var PALETAS = [
      { cuerpo: '#e23b2e', pecho: '#f0594a', ala: '#2f6fd1', banda: '#f4c430', cabeza: '#e23b2e', cara: '#f6efe4', pico: '#2f2f33', cola: '#2f6fd1', cola2: '#d62d20' },   // lapa roja
      { cuerpo: '#3fbf5a', pecho: '#86e07f', ala: '#27934a', banda: '#2f6fd1', cabeza: '#3fbf5a', cara: '#e23b2e', pico: '#f2a03a', cola: '#27934a', cola2: '#f4d442' },    // loro de frente roja
      { cuerpo: '#4ccb62', pecho: '#92e582', ala: '#2b9a48', banda: '#f4c430', cabeza: '#f5d142', cara: '#fff2a8', pico: '#e8923a', cola: '#2b9a48', cola2: '#e23b2e' }     // loro de cabeza amarilla
    ];
    var FRACCIONES = [.36, .62, .90];     // lejos de la etiqueta «Streamer / Cosplayer» que está encima del nombre
    function crearLoros() {
      if (!nombre) return;
      var n = W < 700 ? 2 : 3;
      for (var i = 0; i < n; i++) loros.push({ pal: PALETAS[i % 3], fx: W < 700 ? [.78, .93][i] : FRACCIONES[i], lado: i === 1 ? -1 : 1, estado: 'espera', espera: 1.3 + i * .7, nac: null,
        x: 0, y: 0, vx: 0, vy: 0, dir: 1, ph: azar(0, 6.28), bloqueo: 0, retraso: 0, meta: null, fin: 0, k: W < 700 ? .85 : 1.1 });
    }
    // Rectángulo del TEXTO del nombre (no del bloque entero): así los loros se posan solo sobre letras. Si el nombre ocupa varias líneas, la primera.
    var rango = document.createRange();
    function rectTexto() {
      if (!nombre) return null;
      try { rango.selectNodeContents(nombre); var rs = rango.getClientRects(); if (rs.length && rs[0].width > 0) return rs[0]; } catch (_) {}
      return nombre.getBoundingClientRect();
    }
    function perchaDe(l, r) { return { x: r.left + r.width * l.fx, y: r.top + r.height * .17 }; }
    function nuevaMeta(l) { return { x: Math.max(40, Math.min(W - 40, l.x + azar(-320, 320))), y: Math.max(50, Math.min(H * .55, l.y - azar(40, 240))) }; }
    function huir(l, seg) {
      l.estado = 'volando'; l.fin = seg + azar(2.6, 4.6); l.meta = nuevaMeta(l); l.vx = (Math.random() < .5 ? -1 : 1) * 90; l.vy = -150;
      loros.forEach(function (o) { if (o !== l && o.estado === 'posado' && Math.abs(o.x - l.x) < 280) o.retraso = azar(.1, .4); });
    }
    function moverLoro(l, dt, seg, r) {
      if (l.nac === null) l.nac = seg;
      if (l.bloqueo > 0) l.bloqueo -= dt;
      var visible = r && r.bottom > 0 && r.top < H, P = r ? perchaDe(l, r) : { x: l.x, y: l.y };
      if (l.estado === 'espera') {
        if (seg - l.nac < l.espera || !r) return;
        l.estado = 'volviendo'; l.x = Math.random() < .5 ? -60 : W + 60; l.y = azar(30, 160); l.vx = l.x < 0 ? 200 : -200; l.vy = 40; return;
      }
      if (l.estado === 'posado') {
        l.x = P.x; l.y = P.y; l.dir = l.lado;
        if (!visible) return;
        if (l.retraso > 0) { l.retraso -= dt; if (l.retraso <= 0) huir(l, seg); return; }
        if (mx !== null && l.bloqueo <= 0 && performance.now() - ult < 500) {
          var dx = mx - l.x, dy = my - (l.y - 22);
          if (dx * dx + dy * dy < 85 * 85) huir(l, seg);
        }
        return;
      }
      var meta, vel;
      if (l.estado === 'volando') {
        if (seg > l.fin) l.estado = 'volviendo';
        else { if (Math.hypot(l.meta.x - l.x, l.meta.y - l.y) < 50) l.meta = nuevaMeta(l); meta = l.meta; vel = 250; }
      }
      if (l.estado === 'volviendo') {
        meta = P; var dd = Math.hypot(P.x - l.x, P.y - l.y); vel = Math.min(300, 50 + dd * 1.7);
        if (dd < 9) { l.estado = 'posado'; l.bloqueo = 1.4; l.x = P.x; l.y = P.y; l.vx = l.vy = 0; l.dir = l.lado; return; }
      }
      var ddx = meta.x - l.x, ddy = meta.y - l.y, d = Math.max(1, Math.hypot(ddx, ddy));
      l.vx += (ddx / d * vel - l.vx) * Math.min(1, 2.6 * dt);
      l.vy += (ddy / d * vel - l.vy) * Math.min(1, 2.6 * dt) + Math.sin(seg * 5 + l.ph) * 70 * dt;
      l.x += l.vx * dt; l.y += l.vy * dt;
      if (Math.abs(l.vx) > 25) l.dir = l.vx > 0 ? 1 : -1;
    }
    function trazo() { ctx.strokeStyle = 'rgba(20,40,25,.38)'; ctx.lineWidth = 1; ctx.stroke(); }
    function elipse(x, y, rx, ry, rot, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, 6.2832); ctx.fill(); trazo(); }
    function ojoPico(P, parpadeo, ex, ey, bx, by, cabeceo) {
      elipse(ex + 1.2, ey + 1.5, 5.2, 5.6, 0, P.cara);
      if (parpadeo) { ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(ex - 2, ey); ctx.lineTo(ex + 2.6, ey); ctx.stroke(); }
      else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 2.7, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#16161a'; ctx.beginPath(); ctx.arc(ex + .7, ey, 1.5, 0, 6.2832); ctx.fill(); }
      ctx.fillStyle = P.pico; ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + 10, by - 1, bx + 8, by + 9); ctx.quadraticCurveTo(bx + 5, by + 5, bx, by + 5); ctx.closePath(); ctx.fill(); trazo();
    }
    function ala(P, color) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.bezierCurveTo(-9, -14, -5, -28, 4, -33); ctx.bezierCurveTo(9, -20, 9, -8, 5, 0); ctx.closePath(); ctx.fill(); trazo();
      ctx.fillStyle = P.banda; ctx.beginPath(); ctx.moveTo(-6, -13); ctx.bezierCurveTo(-7, -20, -5, -26, 0, -30); ctx.lineTo(4, -27); ctx.bezierCurveTo(1, -22, 2, -18, 7, -13); ctx.closePath(); ctx.fill();
    }
    function posado(l, seg) {
      var P = l.pal, bal = Math.sin(seg * 1.7 + l.ph) * .03, cabeceo = Math.sin(seg * 2.3 + l.ph) * .09, parp = ((seg * .9 + l.ph) % 4) > 3.85;
      ctx.rotate(bal);
      ctx.fillStyle = P.cola; ctx.beginPath(); ctx.moveTo(-3, -7); ctx.quadraticCurveTo(-12, 6, -8, 22); ctx.lineTo(-3, 19); ctx.quadraticCurveTo(0, 10, 2, -7); ctx.closePath(); ctx.fill(); trazo();
      ctx.fillStyle = P.cola2; ctx.beginPath(); ctx.moveTo(0, -7); ctx.quadraticCurveTo(-4, 8, -2 + Math.sin(seg * 2 + l.ph) * 1.5, 19); ctx.lineTo(3, 17); ctx.quadraticCurveTo(5, 8, 4, -7); ctx.closePath(); ctx.fill(); trazo();
      elipse(0, -17, 9.5, 16, .12, P.cuerpo); elipse(3.2, -14, 5, 11, .12, P.pecho);
      ctx.save(); ctx.translate(-3, -6); ctx.scale(.78, .55); ctx.rotate(0); ala(P, P.ala); ctx.restore();
      ctx.save(); ctx.translate(3, -33); ctx.rotate(cabeceo); elipse(0, 0, 8.6, 8.6, 0, P.cabeza); ojoPico(P, parp, 2.6, -1.6, 6.2, -3.8, cabeceo); ctx.restore();
      ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-2, -3); ctx.lineTo(-2, 0); ctx.moveTo(3, -3); ctx.lineTo(3, 0);
      ctx.moveTo(-5, 0); ctx.lineTo(0, 0); ctx.moveTo(1, 0); ctx.lineTo(6, 0); ctx.stroke(); ctx.lineCap = 'butt';
    }
    function vuelo(l, seg) {
      var P = l.pal, f = .5 + .5 * Math.sin(seg * 16 + l.ph), a1 = -.35 + 2.25 * f, a2 = -.35 + 2.25 * (.5 + .5 * Math.sin(seg * 16 + l.ph + .6));
      ctx.save(); ctx.translate(0, -5); ctx.rotate(a2); ctx.scale(.9, .9); ala(P, P.ala); ctx.restore();                 // ala del fondo
      ctx.fillStyle = P.cola; ctx.beginPath(); ctx.moveTo(-12, -3); ctx.quadraticCurveTo(-26, -4, -38, 3 + Math.sin(seg * 9 + l.ph) * 2); ctx.lineTo(-37, 9); ctx.quadraticCurveTo(-24, 5, -12, 5); ctx.closePath(); ctx.fill(); trazo();
      ctx.fillStyle = P.cola2; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(-24, 3, -34, 10 + Math.sin(seg * 9 + l.ph) * 2); ctx.lineTo(-30, 12); ctx.quadraticCurveTo(-21, 7, -12, 4); ctx.closePath(); ctx.fill(); trazo();
      elipse(0, 0, 15, 8, 0, P.cuerpo); elipse(2, 2.5, 10, 4.5, 0, P.pecho);
      elipse(2, 7, 4, 2.2, 0, '#6a5a4a');
      ctx.save(); ctx.translate(14, -4); elipse(0, 0, 7.8, 7.8, 0, P.cabeza); ojoPico(P, false, 2.4, -1.4, 5.6, -3.4, 0); ctx.restore();
      ctx.save(); ctx.translate(-2, -4); ctx.rotate(a1); ala(P, P.ala); ctx.restore();                                       // ala de frente
    }
    function dibujaLoro(l, seg) {
      if (l.estado === 'espera') return;
      ctx.save(); ctx.translate(l.x, l.y);
      if (l.estado === 'posado') { ctx.scale(l.dir * l.k, l.k); posado(l, seg); }
      else { ctx.translate(0, -17 * l.k); ctx.rotate(Math.atan2(l.vy, Math.max(60, Math.abs(l.vx))) * .55 * l.dir); ctx.scale(l.dir * l.k, l.k); vuelo(l, seg); }
      ctx.restore();
    }
    function cuadro(ms) {
      if (!corriendo) return;
      requestAnimationFrame(cuadro);
      var dt = Math.min(.05, (ms - antes) / 1000 || .016); antes = ms; var seg = ms / 1000;
      if (document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      polen.forEach(function (p) {
        p.y += p.vy * dt; p.x += Math.sin(seg * .6 + p.ph) * 6 * dt; if (p.y < -5) { p.y = H + 5; p.x = azar(0, W); }
        ctx.globalAlpha = .35 + .3 * Math.sin(seg + p.ph); ctx.fillStyle = '#fff6b8'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      });
      hojas.forEach(function (h, i) {
        h.y += h.vy * dt; h.x += Math.cos(seg * h.f + h.ph) * h.amp * dt + 6 * dt; h.r += h.vr * dt;
        if (h.y > H + 20 || h.x > W + 30) hojas[i] = nuevaHoja(true); else dibujaHoja(h);
      });
      luces.forEach(function (l) {
        l.ang += Math.sin(seg * .7 + l.ph) * 1.2 * dt;
        var ax = 0, ay = 0;
        if (mx !== null) { var dx = mx - l.x, dy = my - l.y, d = Math.sqrt(dx * dx + dy * dy); if (d < 220 && d > 30) { ax = dx / d * 14; ay = dy / d * 14; } }
        l.x += (Math.cos(l.ang) * l.v + ax) * dt; l.y += (Math.sin(l.ang) * l.v * .6 + ay) * dt;
        if (l.x < -20) l.x = W + 20; else if (l.x > W + 20) l.x = -20; if (l.y < -20) l.y = H + 20; else if (l.y > H + 20) l.y = -20;
        var a = .25 + .75 * (.5 + .5 * Math.sin(seg * l.f * 2 + l.ph)), g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 2.6);
        g.addColorStop(0, 'rgba(255,255,190,' + a.toFixed(2) + ')'); g.addColorStop(.35, 'rgba(225,255,120,' + (a * .55).toFixed(2) + ')'); g.addColorStop(1, 'rgba(200,255,100,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(l.x, l.y, l.r * 2.6, 0, 6.283); ctx.fill();
      });
      ctx.globalAlpha = 1;
      var rn = rectTexto();
      loros.forEach(function (l) { moverLoro(l, dt, seg, rn); dibujaLoro(l, seg); });
    }
    medir(); poblar(); crearLoros(); cv.classList.add('ver'); requestAnimationFrame(cuadro);
    var espera; window.addEventListener('resize', function () { clearTimeout(espera); espera = setTimeout(function () { medir(); poblar(); }, 200); });
    window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; ult = performance.now(); }, { passive: true });
    window.addEventListener('pointerdown', function (e) { mx = e.clientX; my = e.clientY; ult = performance.now(); }, { passive: true });
    document.addEventListener('pointerleave', function () { mx = my = null; });
  };
})();
