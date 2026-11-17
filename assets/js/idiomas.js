/* Idiomas del sitio: español latino (base), inglés, japonés, coreano y chino.
   No necesitas editar este archivo. Las traducciones viven en idiomas/en.js, ja.js, ko.js y zh.js
   y se editan desde el panel (pestaña Idiomas). Si a un texto le falta traducción, se muestra en español. */
(function () {
  var D = window.Dreamers;
  var CLAVE = 'dmn-idioma';
  var LISTA = [
    { id: 'es', nombre: 'Español', html: 'es-419', corto: 'ES' },
    { id: 'en', nombre: 'English', html: 'en', corto: 'EN' },
    { id: 'ja', nombre: '日本語', html: 'ja', corto: 'JA' },
    { id: 'ko', nombre: '한국어', html: 'ko', corto: 'KO' },
    { id: 'zh', nombre: '中文', html: 'zh-Hans', corto: 'ZH' }
  ];
  function valido(x) { return LISTA.some(function (l) { return l.id === x; }); }

  // ---- Banderas dibujadas en SVG (los emoji de bandera no se ven en Windows).
  function estrella(cx, cy, r, giro) {
    var p = [];
    for (var i = 0; i < 10; i++) {
      var a = (Math.PI / 5) * i - Math.PI / 2 + (giro || 0), rr = i % 2 ? r * 0.4 : r;
      p.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2));
    }
    return '<polygon points="' + p.join(' ') + '" fill="#FFDE00"/>';
  }
  function bandera(id) {
    var s = '';
    if (id === 'es') { // Nicaragua
      s = '<rect width="30" height="20" fill="#0067C6"/><rect y="6.67" width="30" height="6.66" fill="#fff"/>' +
          '<polygon points="15,7.6 11.9,12.6 18.1,12.6" fill="none" stroke="#C99700" stroke-width=".7"/><circle cx="15" cy="11" r="1" fill="#2e9e44"/>';
    } else if (id === 'en') { // Estados Unidos
      var h = 20 / 13, i, estr = '';
      s = '<rect width="30" height="20" fill="#fff"/>';
      for (i = 0; i < 13; i += 2) s += '<rect y="' + (i * h).toFixed(2) + '" width="30" height="' + h.toFixed(2) + '" fill="#B22234"/>';
      s += '<rect width="12.5" height="10.77" fill="#3C3B6E"/>';
      for (i = 0; i < 4; i++) for (var j = 0; j < 5; j++) estr += '<circle cx="' + (1.6 + j * 2.3) + '" cy="' + (1.7 + i * 2.5) + '" r=".55" fill="#fff"/>';
      s += estr;
    } else if (id === 'ja') {
      s = '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>';
    } else if (id === 'ko') { // Corea del Sur
      var tri = function (x, y, rot, partido) {
        var b = '';
        for (var k = 0; k < 3; k++) {
          var yy = -1.5 + k * 1.5;
          if (partido && k === 1) b += '<rect x="-1.8" y="' + yy + '" width="1.55" height=".8" fill="#111"/><rect x=".25" y="' + yy + '" width="1.55" height=".8" fill="#111"/>';
          else b += '<rect x="-1.8" y="' + yy + '" width="3.6" height=".8" fill="#111"/>';
        }
        return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' + b + '</g>';
      };
      s = '<rect width="30" height="20" fill="#fff"/><g transform="rotate(-33.7 15 10)"><path d="M10 10a5 5 0 0 1 10 0a2.5 2.5 0 0 1-5 0a2.5 2.5 0 0 0-5 0z" fill="#CD2E3A"/><path d="M20 10a5 5 0 0 1-10 0a2.5 2.5 0 0 1 5 0a2.5 2.5 0 0 0 5 0z" fill="#0047A0"/></g>' +
          tri(5, 4.2, -56, false) + tri(25, 4.2, 56, true) + tri(5, 15.8, 56, true) + tri(25, 15.8, -56, false);
    } else if (id === 'zh') {
      s = '<rect width="30" height="20" fill="#DE2910"/>' + estrella(5, 5, 3) + estrella(10, 2, 1, 0.45) + estrella(12, 4, 1, 0.2) + estrella(12, 7, 1, 0.1) + estrella(10, 9, 1, 0.35);
    }
    return '<svg class="bandera" viewBox="0 0 30 20" width="24" height="16" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  var tabla = {};      // español (en minúsculas) -> traducción
  var I = D.idioma = {
    lista: LISTA, actual: 'es', bandera: bandera,
    nombre: function (id) { var l = LISTA.filter(function (x) { return x.id === id; })[0]; return l ? l.nombre : id; }
  };

  // Traduce un texto. Si no hay traducción devuelve el mismo texto.
  D.t = function (s) {
    if (I.actual === 'es' || typeof s !== 'string') return s;
    var k = s.trim();
    if (!k) return s;
    var r = tabla[k.toLowerCase()];
    if (!r) return s;
    return s.slice(0, s.indexOf(k)) + r + s.slice(s.indexOf(k) + k.length);
  };

  // Idioma elegido: ?lang=ja en el enlace > el que guardó el visitante > español.
  function elegido() {
    var g = null;
    try { var q = new URLSearchParams(location.search).get('lang'); if (valido(q)) { g = q; try { localStorage.setItem(CLAVE, q); } catch (e) {} } } catch (e) {}
    if (!g) { try { g = localStorage.getItem(CLAVE); } catch (e) {} }
    return valido(g) ? g : 'es';
  }

  var SALTAR = { destino: 1, enlace: 1, imagen: 1, url: 1, correoDestino: 1, submenu: 1, logo: 1, _estilos: 1, plataformas: 1, pagina: 1, despuesDe: 1, fondo: 1, ancho: 1, alineacion: 1, tamano: 1, colorFondo: 1, colorTitulo: 1, colorTexto: 1 };
  function traducirObjeto(o) {
    if (Array.isArray(o)) { o.forEach(function (v, i) { if (typeof v === 'string') o[i] = D.t(v); else if (v && typeof v === 'object') traducirObjeto(v); }); return; }
    Object.keys(o).forEach(function (k) {
      if (SALTAR[k]) return;
      var v = o[k];
      if (typeof v === 'string') o[k] = D.t(v);
      else if (v && typeof v === 'object') traducirObjeto(v);
    });
  }
  function traducirCreadores() {
    D.talentos.forEach(function (t) {
      ['descripcion', 'ciudad'].forEach(function (k) { if (typeof t[k] === 'string') t[k] = D.t(t[k]); });
      ['categorias', 'formatos', 'ideal'].forEach(function (k) { if (Array.isArray(t[k])) t[k] = t[k].map(D.t); });
      if (t.dato && typeof t.dato.texto === 'string') t.dato.texto = D.t(t.dato.texto);
    });
  }

  // Se llama desde arranque.js antes de dibujar las secciones.
  I.iniciar = function () {
    I.actual = elegido();
    var l = LISTA.filter(function (x) { return x.id === I.actual; })[0];
    document.documentElement.setAttribute('lang', l.html);
    D.contenidoOriginal = JSON.parse(JSON.stringify(D.contenido));   // textos en español (los correos van siempre en español)
    try { if (location.search.indexOf('lang=') >= 0) history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    if (I.actual === 'es') return Promise.resolve();
    return D.cargarScript('idiomas/' + I.actual + '.js').then(function () {
      var src = (D.i18n && D.i18n[I.actual]) || {};
      tabla = {};
      Object.keys(src).forEach(function (k) { tabla[k.toLowerCase()] = src[k]; });
      traducirObjeto(D.contenido);
      traducirCreadores();
      document.title = document.title.split(' | ').map(D.t).join(' | ');
    });
  };

  I.cambiar = function (id) {
    if (!valido(id) || id === I.actual) return;
    try { localStorage.setItem(CLAVE, id); } catch (e) {}
    location.reload();
  };

  // Selector del encabezado: botón con la bandera actual + lista desplegable.
  I.montar = function (raiz) {
    var li = raiz.querySelector('.idioma-li');
    if (!li) return;
    var act = LISTA.filter(function (x) { return x.id === I.actual; })[0];
    li.innerHTML = '<button type="button" class="idioma-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="' + D.esc(D.t('Elegir idioma') + ': ' + act.nombre) + '" title="' + D.esc(D.t('Idioma')) + '">' +
      bandera(act.id) + '<span class="idioma-cod">' + act.corto + '</span></button>' +
      '<ul class="idioma-menu" role="listbox" hidden aria-label="' + D.esc(D.t('Idioma')) + '">' + LISTA.map(function (x) {
        return '<li role="option" aria-selected="' + (x.id === I.actual) + '"><button type="button" data-lang="' + x.id + '" lang="' + x.html + '">' + bandera(x.id) + '<span>' + D.esc(x.nombre) + '</span></button></li>';
      }).join('') + '</ul>';
    var btn = li.querySelector('.idioma-btn'), menu = li.querySelector('.idioma-menu');
    function abrir(v) { menu.hidden = !v; btn.setAttribute('aria-expanded', String(v)); if (v) { var o = menu.querySelector('[aria-selected="true"] button') || menu.querySelector('button'); if (o) o.focus(); } }
    btn.addEventListener('click', function () { abrir(menu.hidden); });
    menu.addEventListener('click', function (e) { var b = e.target.closest('[data-lang]'); if (b) I.cambiar(b.getAttribute('data-lang')); });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { abrir(false); btn.focus(); return; }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !menu.hidden) {
        var bs = Array.prototype.slice.call(menu.querySelectorAll('button')), i = bs.indexOf(document.activeElement);
        bs[(i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length].focus(); e.preventDefault();
      }
    });
    document.addEventListener('click', function (e) { if (!li.contains(e.target)) abrir(false); });
  };
})();
