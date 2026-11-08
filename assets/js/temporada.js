/* Decoración interactiva de temporada (Navidad / Halloween).
   Se activa solo si config/tema.css trae el marcador --dmn-temporada (lo pone el editor, pestaña Apariencia).
   No tapa nada: las partículas viven en los márgenes laterales libres de la página (fuera del contenido),
   y en cualquier pantalla un toque/clic suelta una pequeña ráfaga que se desvanece en un segundo.
   Las partículas huyen del cursor. Respeta «reducir movimiento». */
(function () {
  'use strict';
  var tipo = (getComputedStyle(document.documentElement).getPropertyValue('--dmn-temporada') || '').replace(/["'\s]/g, '');
  if (tipo !== 'navidad' && tipo !== 'halloween') return;
  var quieta = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quieta) return;

  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:30;pointer-events:none';
  document.body.appendChild(cv);
  var cx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, banda = 0;
  var ps = [], rafagas = [], raton = { x: -999, y: -999 };

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    banda = Math.floor((W - 1180) / 2) - 10;          // margen libre a cada lado del contenido (.in = 1180px)
    var n = banda >= 34 ? Math.min(26, Math.round(H / 38)) : 0;
    while (ps.length < n) ps.push(nueva(true));
    ps.length = n;
    ps.forEach(function (p) { reubicar(p); });
  }
  function reubicar(p) { var ancho = Math.max(banda, 1); p.lado = p.lado || (Math.random() < .5 ? 0 : 1); if (p.bx == null) p.bx = Math.random() * ancho; p.x = p.lado ? W - ancho + p.bx : p.bx; }
  function nueva(inicio) {
    return { lado: Math.random() < .5 ? 0 : 1, bx: null, x: 0, y: inicio ? Math.random() * H : -20, vx: 0, vy: 0,
      r: tipo === 'navidad' ? 2 + Math.random() * 3.2 : 7 + Math.random() * 6,
      v: tipo === 'navidad' ? .35 + Math.random() * .6 : .15 + Math.random() * .3, f: Math.random() * 6.28, a: .55 + Math.random() * .35 };
  }
  function copo(x, y, r, a) {
    cx.globalAlpha = a; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill();
    if (r > 3.4) { cx.strokeStyle = 'rgba(255,255,255,' + a + ')'; cx.lineWidth = .8; cx.beginPath();
      for (var i = 0; i < 3; i++) { var an = i * 1.047; cx.moveTo(x - Math.cos(an) * r * 1.9, y - Math.sin(an) * r * 1.9); cx.lineTo(x + Math.cos(an) * r * 1.9, y + Math.sin(an) * r * 1.9); } cx.stroke(); }
  }
  function murcielago(x, y, s, a, ala) {
    var b = Math.sin(ala) * .55; cx.globalAlpha = a; cx.fillStyle = '#1b0b2e'; cx.strokeStyle = 'rgba(255,140,40,.55)'; cx.lineWidth = .8;
    cx.save(); cx.translate(x, y); cx.scale(s / 10, s / 10); cx.beginPath();
    cx.moveTo(0, -2); cx.quadraticCurveTo(-5, -9 * (1 - b), -14, -3 * (1 - b)); cx.quadraticCurveTo(-10, 0, -8, 3);
    cx.quadraticCurveTo(-5, 1, -3, 4); cx.quadraticCurveTo(-1, 1, 0, 3); cx.quadraticCurveTo(1, 1, 3, 4);
    cx.quadraticCurveTo(5, 1, 8, 3); cx.quadraticCurveTo(10, 0, 14, -3 * (1 - b)); cx.quadraticCurveTo(5, -9 * (1 - b), 0, -2);
    cx.closePath(); cx.fill(); cx.stroke(); cx.restore();
  }
  function dibujar(p, x, y, a) { if (tipo === 'navidad') copo(x, y, p.r, a); else murcielago(x, y, p.r, a, p.f); }

  function paso() {
    cx.clearRect(0, 0, W, H);
    var ancho = Math.max(banda, 1);
    ps.forEach(function (p) {
      p.f += tipo === 'navidad' ? .02 : .22;
      p.y += p.v + p.vy; p.bx += Math.sin(p.f) * (tipo === 'navidad' ? .35 : .5) + p.vx;
      p.vx *= .93; p.vy *= .93;
      if (p.bx < 0) p.bx = 0; if (p.bx > ancho) p.bx = ancho;
      p.x = p.lado ? W - ancho + p.bx : p.bx;
      if (tipo === 'halloween') p.y += Math.sin(p.f * .3) * .35;
      var dx = p.x - raton.x, dy = p.y - raton.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 110 && d > 0.1) { var f = (110 - d) / 110; p.vx += dx / d * f * 2.4; p.vy += dy / d * f * 2.4; }
      if (p.y > H + 20) { p.y = -20; p.bx = Math.random() * ancho; }
      if (p.y < -40) p.y = -40;
      dibujar(p, p.x, p.y, p.a);
    });
    rafagas = rafagas.filter(function (q) {
      q.t += 1; var k = q.t / 60; if (k >= 1) return false;
      q.x += q.vx; q.y += q.vy; q.vy += tipo === 'navidad' ? .03 : -.01;
      dibujar(q, q.x, q.y, (1 - k) * .8); return true;
    });
    cx.globalAlpha = 1;
    raf = requestAnimationFrame(paso);
  }
  var raf = 0;
  function arrancar() { if (!raf) raf = requestAnimationFrame(paso); }
  function parar() { cancelAnimationFrame(raf); raf = 0; }

  addEventListener('pointermove', function (e) { raton.x = e.clientX; raton.y = e.clientY; }, { passive: true });
  addEventListener('pointerleave', function () { raton.x = raton.y = -999; });
  addEventListener('pointerdown', function (e) {
    if (e.target.closest && e.target.closest('a,button,input,textarea,select,label,iframe')) return;
    for (var i = 0; i < 9; i++) { var a = Math.random() * 6.283, v = .8 + Math.random() * 1.6;
      var q = nueva(false); q.x = e.clientX; q.y = e.clientY; q.vx = Math.cos(a) * v; q.vy = Math.sin(a) * v - .6; q.t = 0; q.r = tipo === 'navidad' ? 2 + Math.random() * 2 : 6 + Math.random() * 4; rafagas.push(q); }
  }, { passive: true });
  document.addEventListener('visibilitychange', function () { document.hidden ? parar() : arrancar(); });
  addEventListener('resize', medir);
  medir(); arrancar();
})();
